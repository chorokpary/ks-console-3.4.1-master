import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'

const GpuUsageStatus = ({ widgetKey, monitorStore, ...props }) => {
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
          <label>GPU 사용 현황</label>
          <div className="right">
            <div className="select_wrap">
              <div className="select-list-box">
                <div className="selected-item single">
                  <p>
                    <strong>최근 1주일</strong>
                  </p>
                </div>

                <ul className="select-list scroll-gray">
                  <li className="selected">
                    <p>
                      <strong>최근 1주일</strong>
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>최근 1일</strong>
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>최근 7시간</strong>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="spin-nested-loading">
          <div className="spin-container"></div>
        </div>
      </div>
    </>
  )
}

export default GpuUsageStatus
