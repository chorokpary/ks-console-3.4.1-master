import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'
import GpuUsage from '../GpuUsage'

const GpuUsageTop5 = ({ widgetKey, monitorStore, ...props }) => {
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
          <label>GPU 사용 현황 Top5</label>
          <div className="right"></div>
        </div>
        <div className="spin-nested-loading">
          <div className="spin-container">
            <div className="gpu_usage_top_wrap">
              <div className="gpu_usage_top">
                <h3 className="gpu_usage_top_title">GPU 사용률</h3>
                <ul className="gpu_usage_list">
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-0992322</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '90%' }}></div>
                    </div>
                    <span className="percent">90%</span>
                  </li>
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-1</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '82%' }}></div>
                    </div>
                    <span className="percent">82%</span>
                  </li>
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-2</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '75%' }}></div>
                    </div>
                    <span className="percent">75%</span>
                  </li>
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-3</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '64%' }}></div>
                    </div>
                    <span className="percent">64%</span>
                  </li>
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-4</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '58%' }}></div>
                    </div>
                    <span className="percent">58%</span>
                  </li>
                </ul>
              </div>
              <div className="gpu_usage_top color2">
                <h3 className="gpu_usage_top_title">GPU 메모리 사용률</h3>
                <ul className="gpu_usage_list">
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-09</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '90%' }}></div>
                    </div>
                    <span className="percent">90%</span>
                  </li>
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-1</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '82%' }}></div>
                    </div>
                    <span className="percent">82%</span>
                  </li>
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-22</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '75%' }}></div>
                    </div>
                    <span className="percent">75%</span>
                  </li>
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-3</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '64%' }}></div>
                    </div>
                    <span className="percent">64%</span>
                  </li>
                  <li className="gpu_usage_item">
                    <span className="gpu_name">GPU-4</span>
                    <div className="bar_wrapper">
                      <div className="bar" style={{ width: '58%' }}></div>
                    </div>
                    <span className="percent">58%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GpuUsageTop5
