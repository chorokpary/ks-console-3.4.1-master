import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'

const GpuMap = ({ widgetKey, monitorStore, ...props }) => {
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
          <label>GPU 현황 맵</label>
          <div className="right">
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
                      <strong>가상머신</strong>
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>GPU</strong>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            {/* // select_wrap */}.
            <button className="icon">
              <i className="ico-list-filter"></i>
            </button>
            {/* 이름 순, 이름 역순, 사용률 높은 순, 사용률 낮은 순 */}
          </div>
        </div>
        <div className="grid_option_area">
          <div className="legend_button_wrapper">
            <button className="legend_toggle_button" onClick="toggleLegend()">
              범례
            </button>

            <div
              className="legend_dropdown_container"
              id="legendDropdown"
              style={{ display: 'none' }}
            >
              <div className="legend_container">
                <div className="legend_items">
                  <div className="legend_item">
                    <div className="color_bar gpu_state_unknown"></div>
                    <span className="level">0</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage1"></div>
                    <span className="level">30</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage2"></div>
                    <span className="level">60</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage3"></div>
                    <span className="level">80</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage4"></div>
                    <span className="level">100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="alert_tab">
            <label htmlFor="al_name_1">
              <input
                type="radio"
                name="box-tab"
                id="al_name_1"
                value="name3"
                checked
              />
              {/* gpu badge number는 99 이상일때 99로만 표현 */}
              <span>
                <span className="gpu_badge_number">18</span>
                <span>전체</span>
              </span>
            </label>
            <label htmlFor="al_name_3">
              <input type="radio" name="box-tab" id="al_name_3" value="name5" />
              <span>
                <span className="gpu_badge_number minor">6</span>
                <span>경고</span>
              </span>
            </label>
            <label htmlFor="al_name_4">
              <input type="radio" name="box-tab" id="al_name_4" value="name6" />
              <span>
                <span className="gpu_badge_number unknown">6</span>
                <span>주의</span>
              </span>
            </label>
            <div className="select_wrap">
              <div className="select-list-box">
                <div className="selected-item single">
                  <p>
                    <strong>1h</strong>
                  </p>
                </div>
                <ul className="select-list scroll-gray">
                  <li className="selected">
                    <p>
                      <strong>1h</strong>
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>1m</strong>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="spin-nested-loading">
          <div className="spin-container">
            <div className="gpu_map_wrap">
              <div id="gpunode-map" className="gpunode_map">
                {/* GPU Map : 노드, 가상머신 동일함. GPU만 작은 tile (상태별 5개씩 ) */}
                <div className="gpu_tile gpu_state_usage1">
                  <div className="name" title="B200-node-01">
                    B200-node-01
                  </div>
                  <div className="percent">20%</div>
                </div>
                <div className="gpu_tile gpu_state_usage2">
                  <div className="name" title="B200-node-06">
                    B200-node-06
                  </div>
                  <div className="percent">36%</div>
                </div>
                <div className="gpu_tile gpu_state_usage3">
                  <div className="name" title="B200-node-11">
                    B200-node-11
                  </div>
                  <div className="percent">70%</div>
                </div>
                <div className="gpu_tile gpu_state_usage4">
                  <div className="name" title="B200-node-16">
                    B200-node-16
                  </div>
                  <div className="percent">90%</div>
                  <div className="badge_alert"></div>
                </div>
                <div className="gpu_tile gpu_state_unknown">
                  <div className="name" title="B200-node-21">
                    B200-node-21
                  </div>
                  <div className="percent">0%</div>
                </div>
              </div>

              {/* GPU Map */}
              <div id="gpu-map" className="gpu_map">
                <div className="gpu_tile gpu_state_usage1">
                  <div className="name" title="B200-node-01">
                    GPU-01
                  </div>
                  <div className="percent">20%</div>
                </div>
                <div className="gpu_tile gpu_state_usage2">
                  <div className="name" title="GPU-06">
                    GPU-06
                  </div>
                  <div className="percent">36%</div>
                </div>
                <div className="gpu_tile gpu_state_usage3">
                  <div className="name" title="GPU-11">
                    GPU-11
                  </div>
                  <div className="percent">70%</div>
                </div>
                <div className="gpu_tile gpu_state_usage4">
                  <div className="name" title="GPU-16">
                    GPU-16
                  </div>
                  <div className="percent">90%</div>
                  <div className="badge_alert"></div>
                </div>
                <div className="gpu_tile gpu_state_unknown">
                  <div className="name" title="GPU-21">
                    GPU-21
                  </div>
                  <div className="percent">0%</div>
                </div>
              </div>
              {/* 팝오버 샘플 : 팝오버는 tile의 색상값과 동일한 색상값과 동일한 클래스 추가 필요 */}
              {/* close_btn, gpu_backdrop 클릭시 팝오버 닫히게 개발 필요*/}
              <div className="gpu_backdrop">
                <div className="gpu_popover gpu_state_usage4">
                  {/* 노드 데이터 샘플 */}
                  <div className="data_node">
                    <div className="title">
                      <span>B200-node-16 (노드 타일 일때)</span>
                      <span className="link"></span>
                      {/* 해당 이름의 노드 또는 가상머신 상세로 이동 */}
                      <span className="close_btn">✕</span>
                    </div>
                    <div className="gpu_data_info">
                      <div>
                        <span className="label">가상머신 개수</span>
                        <span className="value">3</span>
                      </div>
                    </div>
                  </div>
                  {/* 가상머신 데이터 샘플 */}
                  <div className="data_vm">
                    <div className="title">
                      <span>B200-vm-002 (가상머신 타일 일때)</span>
                      <span className="link"></span>
                      {/* 해당 이름의 노드 또는 가상머신 상세로 이동 */}
                      <span className="close_btn">✕</span>
                    </div>
                    <div className="gpu_data_info">
                      <div>
                        <span className="label">노드</span>
                        <span className="value">B200-node-16</span>
                        <span className="link"></span>
                        {/* 해당 이름의 노드 상세로 이동 */}
                      </div>
                    </div>
                  </div>
                  {/* GPU 데이터 샘플 */}
                  <div className="data_gpu">
                    <div className="title">
                      <span>
                        <i className="ico-type24-gpuaas-gpu"></i>GPU-11 (GPU
                        타일 일 때)
                      </span>
                      {/* 해당 이름의 노드 또는 가상머신 상세로 이동 */}
                      <span className="close_btn">✕</span>
                    </div>
                    <div className="gpu_data_info">
                      <div>
                        <span className="label">노드</span>
                        <span className="value">B200-node-16</span>
                        <span className="link"></span>
                        {/* 해당 이름의 노드 상세로 이동 */}
                      </div>
                      <div>
                        <span className="label">가상머신</span>
                        <span className="value">VM-01</span>
                        <span className="link"></span>
                        {/* 해당 이름의 가상머신 상세로 이동 */}
                      </div>
                    </div>
                  </div>
                  <div className="gpu_info">
                    <div className="gpu_usage_info">
                      <span className="label">GPU 사용률</span>
                      <span className="value">90%</span>
                    </div>
                    <div className="gpu_usage_info">
                      <span className="label">GPU 메모리 사용률</span>
                      <span className="value">76%</span>
                    </div>
                  </div>
                  <div className="gpu_pop_boxes">
                    <div className="gpu_pop_box gpu_state_usage3">
                      <div className="name">GPU-0</div>
                      <div className="percent">70%</div>
                    </div>
                    <div className="gpu_pop_box gpu_state_usage4 gpu_alert">
                      <div className="name">GPU-1</div>
                      <div className="percent">90%</div>
                      <div className="badge_alert"></div>
                    </div>
                    <div className="gpu_pop_box gpu_state_usage2">
                      <div className="name">GPU-2</div>
                      <div className="percent">55%</div>
                    </div>
                  </div>

                  {/* alert_card는 초기 미노출, 에러 gpu_pop_box.gpu_alert 클릭시에만 해당 에러 노출  */}
                  <div className="alert_card">
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

export default GpuMap
