import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import VmStore from 'stores/resources/vms'
import VmModel from 'stores/dashboard/vms';
import { fnSetVms } from 'utils/dashboard'

const Vm = ({ x, y, w, h }) => {
  const vmStore = new VmStore();

  useEffect(() => {
    const getVmData = async () => {
      setLoading(true)
      const vmList = await vmStore.fetchList({ limit: 1000 })
      setList(vmList)
      setLoading(false)
    };
    getVmData();
  }, [])

  const [list, setList] = useState([]);
  const vms = new VmModel();
  const [data, setData] = useState(vms);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (list.length > 0) {
      const data = fnSetVms(list, vms)
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
              <label>가상머신</label>

            </div>

            <Loading spinning={loading}>
              <div className="grid_info style_status">
                <div className="box type_status">
                  <div className="cont_group">
                    <div className="cont1">
                      <div className="number_wrap">
                        <i className="ico-type-vm"></i>
                        <p><span className="em">{data.running}</span> / {data.total}</p>
                      </div>
                    </div>
                    <div className="cont2">
                      <div className="status_wrap">
                        <div className="value">{data.waiting}</div>
                        <p className="status waiting"><span>Progressing</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.running}</div>
                        <p className="status running"><span>Running</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.stopped}</div>
                        <p className="status warning"><span>Stopped</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.error}</div>
                        <p className="status error"><span>Error</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Loading>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default Vm