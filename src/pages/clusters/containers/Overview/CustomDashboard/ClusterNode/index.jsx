import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import NodeStore from 'stores/node';
import ClusterNodeModel from 'stores/dashboard/clusterNode';
import { fnSetClusterNodes } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger';

const ClusterNode = ({ x, y, w, h }) => {
  const nodeStore = new NodeStore();

  const fetchData = async () => {
    return await nodeStore.fetchList({ limit: 1000 })
  }
  const [list, error, loading] = cleanupTrigger(fetchData, [])

  const clusterNodes = new ClusterNodeModel();
  const [data, setData] = useState(clusterNodes);

  useEffect(() => {
    if (list.length > 0) {
      const data = fnSetClusterNodes(list, clusterNodes)
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
              <label>{t('RESOURCES_CLUSTER_NODE')}</label>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_status">
                <div className="box type_status">
                  <div className="cont_group clusternode">
                    <div className="cont1">
                      <div className="number_wrap">
                        <i className="ico-type-clusternode"><span>Master</span></i>

                        <p><span className="em">{data.master.on}</span>/{data.master.total}</p>
                      </div>
                      <div className="number_wrap">
                        <i className="ico-type-clusternode"><span>Worker</span></i>
                        <p><span className="em">{data.worker.on}</span>/{data.worker.total}</p>
                      </div>
                    </div>
                    <div className="cont3">
                      <div className="status_wrap">
                        <div className="value">{data.running}</div>
                        <p className="status running"><span>Running</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.warning}</div>
                        <p className="status warning"><span>Warning</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.unschedulable}</div>
                        <p className="status unschedulable"><span>Unschedulable</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.total}</div>
                        <p className="status total"><span>Total</span></p>
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

export default ClusterNode