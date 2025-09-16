import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'

const AlarmHorizontal = ({ widgetKey, monitorStore, ...props }) => {
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
          <label>알림</label>
          <div className="right">
            <div className="alert_tab bottom">
              <label htmlFor="al_name2_1">
                <input
                  type="radio"
                  name="box-tab"
                  id="al_name2_1"
                  value="name3"
                  checked
                />
                {/* gpu badge number는 99 이상일때 99로만 표현 */}
                <span>
                  <span className="gpu_badge_number">18</span>
                  <span>전체</span>
                </span>
              </label>
              <label htmlFor="al_name2_2">
                <input
                  type="radio"
                  name="box-tab"
                  id="al_name2_2"
                  value="name4"
                />
                <span>
                  <span className="gpu_badge_number critical">6</span>
                  <span>심각</span>
                </span>
              </label>
              <label htmlFor="al_name2_3">
                <input
                  type="radio"
                  name="box-tab"
                  id="al_name2_3"
                  value="name5"
                />
                <span>
                  <span className="gpu_badge_number minor">6</span>
                  <span>경고</span>
                </span>
              </label>
              <label htmlFor="al_name2_4">
                <input
                  type="radio"
                  name="box-tab"
                  id="al_name2_4"
                  value="name6"
                />
                <span>
                  <span className="gpu_badge_number unknown">6</span>
                  <span>주의</span>
                </span>
              </label>
            </div>
            <div className="select_wrap">
              <div className="select-list-box">
                <div className="selected-item single">
                  <p>
                    <strong>노드</strong>
                  </p>
                </div>

                <ul className="select-list scroll-gray">
                  <li className="selected">
                    <p>
                      <strong>노드</strong>
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>Pod</strong>
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>가상머신</strong>
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>KaaS</strong>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <button className="icon">
              <i className="ico-list-filter"></i>
            </button>
            {/* filter 버튼 클릭시 : dropdown 최신 순 / 오래된 순*/}
          </div>
        </div>

        <div className="spin-nested-loading">
          <div className="spin-container">
            <div className="grid_info style_list">
              {/* <div className="grid_text">
                            <span>데이터가 없습니다.</span>
                          </div> */}
              <ul className="alert_card_list bottom">
                <li className="alert_card">
                  <div className="alert_content">
                    <div className="alert_header">
                      <span className="alert_status critical">심각</span>
                      <span className="alert_resource type_node">노드</span>
                    </div>

                    <div className="alert_body">
                      <p className="alert_message">
                        {/* Thanos Rule {{$labels.instance}} in
                                    {{$labels.namespace}} is failing to queue */}
                        alerts.
                      </p>
                      {/* 배지가 필요할 때만 사용 <p className="alert_badge">
                                      <span className="alert_errorcode"
                                        >Error Code: Xid 14</span
                                      >
                                    </p> */}
                    </div>
                    <p className="alert_date">2025-08-23</p>
                  </div>
                </li>
                <li className="alert_card">
                  <div className="alert_content">
                    <div className="alert_header">
                      <span className="alert_status minor">경고</span>
                      <span className="alert_resource type_gpu">GPU</span>
                    </div>

                    <div className="alert_body">
                      <p className="alert_message">
                        GPU의 디스플레이 엔진 응답 지연을 감지했습니다.
                      </p>
                      <p className="alert_badge">
                        <span className="alert_errorcode">
                          Error Code: Xid 14
                        </span>
                      </p>
                    </div>
                    <p className="alert_date">2025-08-23</p>
                  </div>
                </li>
                <li className="alert_card">
                  <div className="alert_content">
                    <div className="alert_header">
                      <span className="alert_status minor">경고</span>
                      <span className="alert_resource type_gpu">GPU</span>
                    </div>

                    <div className="alert_body">
                      <p className="alert_message">
                        GPU의 디스플레이 엔진 응답 지연을 감지했습니다.
                      </p>
                      <p className="alert_badge">
                        <span className="alert_errorcode">
                          Error Code: Xid 14
                        </span>
                      </p>
                    </div>
                    <p className="alert_date">2025-08-23</p>
                  </div>
                </li>
                <li className="alert_card">
                  <div className="alert_content">
                    <div className="alert_header">
                      <span className="alert_status minor">경고</span>
                      <span className="alert_resource type_gpu">GPU</span>
                    </div>

                    <div className="alert_body">
                      <p className="alert_message">
                        GPU의 디스플레이 엔진 응답 지연을 감지했습니다.
                      </p>
                      <p className="alert_badge">
                        <span className="alert_errorcode">
                          Error Code: Xid 14
                        </span>
                      </p>
                    </div>
                    <p className="alert_date">2025-08-23</p>
                  </div>
                </li>
                <li className="alert_card">
                  <div className="alert_content">
                    <div className="alert_header">
                      <span className="alert_status unknown">주의</span>
                      <span className="alert_resource type_vm">가상머신</span>
                    </div>

                    <div className="alert_body">
                      <p className="alert_message">
                        Pod name is skt-32 value is 2.405932480e+06
                      </p>
                      {/* 배지가 필요할 때만 사용 <p className="alert_badge">
                                      <span className="alert_errorcode"
                                        >Error Code: Xid 14</span
                                      >
                                    </p> */}
                    </div>
                    <p className="alert_date">2025-08-23</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AlarmHorizontal
