import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'

const Node = ({ widgetKey, monitorStore, ...props }) => {
  // const podStore = new PodStore()

  // const fetchData = async () => {
  //   return await podStore.fetchList({ limit: 1000, ...props })
  // }
  // const [list, error, loading] = cleanupTrigger(fetchData, [])

  // const pods = new PodModel()
  // const [data, setData] = useState(pods)

  // useEffect(() => {
  //   if (list.length > 0) {
  //     const data = fnSetPods(list, pods)
  //     setData(data)
  //   }
  // }, [list])

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>노드</label>
        </div>
        <div className="spin-nested-loading">
          <div className="spin-container">
            <div className="grid_info style_status">
              <div className="box type_status">
                <div className="cont_group clusternode">
                  <div className="cont1">
                    <div className="number_wrap">
                      <i className="ico-type24-clusternode-gpu">
                        <span>GPU 노드</span>
                      </i>
                      <p>
                        <span className="em">140</span>/ 140
                      </p>
                    </div>
                    <div className="number_wrap">
                      <i className="ico-type24-clusternode">
                        <span>CPU 노드</span>
                      </i>
                      <p>
                        <span className="em">10</span>/ 10
                      </p>
                    </div>
                  </div>
                  <div className="cont3">
                    <div className="status_wrap">
                      <div className="value">150</div>
                      <p className="status running">
                        <span>실행중</span>
                      </p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">0</div>
                      <p className="status warning">
                        <span>주의</span>
                      </p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">0</div>
                      <p className="status unschedulable">
                        <span>스케줄링 불가</span>
                      </p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">150</div>
                      <p className="status total">
                        <span>전체</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Node
