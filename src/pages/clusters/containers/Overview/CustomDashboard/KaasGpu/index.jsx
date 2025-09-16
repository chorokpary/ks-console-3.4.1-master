import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'

const KaasGpu = ({ widgetKey, monitorStore, ...props }) => {
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
          <label>KaaS</label>
        </div>
        <div className="spin-nested-loading">
          <div className="spin-container">
            <div className="grid_info style_status">
              <div className="box type_status">
                <div className="cont_group clusternode">
                  <div className="cont1">
                    <div className="number_wrap">
                      <i className="ico-type24-container-gpu">
                        <span>GPU KaaS</span>
                      </i>
                      <p>
                        <span className="em">1</span>/ 1
                      </p>
                    </div>
                    <div className="number_wrap">
                      <i className="ico-type24-container">
                        <span>CPU KaaS</span>
                      </i>
                      <p>
                        <span className="em">1</span>/ 1
                      </p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">8</div>
                      <p className="status running">
                        <span>준비</span>
                      </p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status waiting">
                        <span>준비안됨</span>
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

export default KaasGpu
