import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'

const GpuUsage = ({ widgetKey, monitorStore, ...props }) => {
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
          <label>GPU 가용률</label>
        </div>
        <div className="spin-nested-loading">
          <div className="spin-container">
            <div className="grid_info style_status">
              <div className="box type_status">
                <div className="cont_group">
                  <div className="cont1">
                    <img src="/assets/resources/images/dummy/img-dummy-chart-pie2.svg" />
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">43</div>
                      <p className="status used_gpu">
                        <span>사용중</span>
                      </p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">37</div>
                      <p className="status waiting">
                        <span>미사용</span>
                      </p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">80</div>
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

export default GpuUsage
