import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import KaasStore from 'stores/resources/containerresource'
import KaasModel from 'stores/dashboard/kaas';
import { fnSetK8s } from 'utils/dashboard'

const Kaas = ({ x, y, w, h }) => {
  const kaasStore = new KaasStore();

  useEffect(() => {
    const getKaasData = async () => {
      setLoading(true)
      const kaasList = await kaasStore.fetchList({ limit: 1000 })
      setList(kaasList)
      setLoading(false)
    };
    getKaasData();
  }, [])

  const [list, setList] = useState([]);
  const kaas = new KaasModel();
  const [data, setData] = useState(kaas);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (list.length > 0) {
      const data = fnSetK8s(list, kaas)
      setData(data)
    }
  }, [list])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>KaaS</label>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_status">
                <div className="box type_status">
                  <div className="cont_group">
                    <div className="cont1">
                      <div className="number_wrap">
                        <i className="ico-type-container"></i>
                        <p><span className="em">{data.ready}</span> / {data.total}</p>
                      </div>
                    </div>
                    <div className="cont2">
                      <div className="status_wrap">
                        <div className="value">{data.ready}</div>
                        <p className="status running"><span>Ready</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.notReady}</div>
                        <p className="status waiting"><span>NotReady</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Loading>
          </div>
        </div>
        {/* // grid_item */}
      </div>
    </>
  )
}

export default Kaas