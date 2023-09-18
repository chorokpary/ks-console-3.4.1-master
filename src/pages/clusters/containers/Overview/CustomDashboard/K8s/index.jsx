import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import K8sStore from 'stores/resources/containerresource'
import K8sModel from 'stores/dashboard/k8s';
import { fnSetK8s } from 'utils/dashboard'

const K8s = () => {
  const k8sStore = new K8sStore();

  useEffect(() => {
    const getK8sData = async () => {
      setLoading(true)
      const k8sList = await k8sStore.fetchList({ limit: 1000 })
      setList(k8sList)
      setLoading(false)
    };
    getK8sData();
  }, [])

  const [list, setList] = useState([]);
  const k8s = new K8sModel();
  const [data, setData] = useState(k8s);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (list.length > 0) {
      const data = fnSetK8s(list, k8s)
      setData(data)
    }
  }, [list])

  return (
    <>
      <div className="grid-stack-item" gs-x="7" gs-y="0" gs-w="2" gs-h="4">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>쿠버네티스</label>

            </div>
            <div className="grid_info style_status">
              <div className="box type_status">
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <i className="ico ico-type-container"></i>
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
          </div>
        </div>
        {/* // grid_item */}
      </div>
    </>
  )
}

export default K8s