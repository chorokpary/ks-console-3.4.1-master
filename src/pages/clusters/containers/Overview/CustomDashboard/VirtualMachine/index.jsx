import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'

const VirtualMachine = ({ widgetKey, monitorStore, ...props }) => {
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
          <label>가상머신</label>
        </div>
        <div className="spin-nested-loading">
          <div className="spin-container">
            <div className="grid_info style_status">
              <div className="box type_status">
                <div className="cont_group clusternode">
                  <div className="cont1">
                    <div className="number_wrap">
                      <i className="ico-type24-vm-gpu">
                        <span>GPU 가상머신</span>
                      </i>
                      <p>
                        <span className="em">100</span>/ 100
                      </p>
                    </div>
                    <div className="number_wrap">
                      <i className="ico-type24-vm">
                        <span>CPU 가상머신</span>
                      </i>
                      <p>
                        <span className="em">49</span>/ 49
                      </p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status waiting">
                        <span>진행중</span>
                      </p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">93</div>
                      <p className="status running">
                        <span>실행중</span>
                      </p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status warning">
                        <span>정지됨</span>
                      </p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status error">
                        <span>오류</span>
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

export default VirtualMachine
