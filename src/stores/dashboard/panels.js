const panelInfo = {
  clusterNode: function(val = { w: 3, h: 4 }) {
    return clusterNodePanel(val)
  },
  pod: function(val = { w: 3, h: 4 }) {
    return podPanel(val)
  },
  vm: function(val = { w: 3, h: 4 }) {
    return vmPanel(val)
  },
  kaas: function(val = { w: 3, h: 4 }) {
    return kaasPanel(val)
  },
  gpuCluster: function(val = { w: 12, h: 12 }) {
    return gpuClusterPanel(val)
  },
  resourceUsage: function(val = { w: 12, h: 6 }) {
    return resourceUsagePanel(val)
  },

  networkTraffic: function(val = { w: 12, h: 6 }) {
    return networkTrafficPanel(val)
  },
  computingNetwork: function(val = { w: 12, h: 4 }) {
    return computingNetworkPanel(val)
  },
  computingTemplate: function(val = { w: 12, h: 4 }) {
    return computingTemplatePanel(val)
  },
  bmcNode: function(val = { w: 12, h: 7 }) {
    return bmcNodePanel(val)
  },
  resourceChange: function(val = { w: 6, h: 5 }) {
    return resourceChangePanel(val)
  },

  clusterStatus: function(val = { w: 6, h: 5 }) {
    return clusterStatusPanel(val)
  },
  carbonPower: function(val = { w: 6, h: 3 }) {
    return carbonPowerPanel(val)
  },
  carbonCo2: function(val = { w: 6, h: 3 }) {
    return carbonCo2Panel(val)
  },
  carbonTree: function(val = { w: 6, h: 3 }) {
    return carbonTreePanel(val)
  },
  carbonCost: function(val = { w: 6, h: 3 }) {
    return carbonCostPanel(val)
  },

  cpuPower: function(val = { w: 12, h: 5 }) {
    return cpuPowerPanel(val)
  },
  usageTop5: function(val = { w: 3, h: 8 }) {
    return usageTop5Panel(val)
  },
  recentResource: function(val = { w: 3, h: 9 }) {
    return recentResourcePanel(val)
  },
  issue: function(val = { w: 3, h: 9 }) {
    return issuePanel(val)
  },
  carbonIndicator: function(val = { w: 3, h: 9 }) {
    return carbonIndicatorPanel(val)
  },
  powerUsageTop5: function(val = { w: 3, h: 7 }) {
    return powerUsageTop5Panel(val)
  },

  node: function(val = { w: 3, h: 4 }) {
    return nodePanel(val)
  },
  virtualMachine: function(val = { w: 3, h: 4 }) {
    return virtualMachinePanel(val)
  },
  gpuStatus: function(val = { w: 3, h: 4 }) {
    return gpuStatusPanel(val)
  },
  gpuUsage: function(val = { w: 3, h: 4 }) {
    return gpuUsagePanel(val)
  },
  gpuMap: function(val = { w: 6, h: 12 }) {
    return gpuMapPanel(val)
  },
  gpuUsageStatus: function(val = { w: 6, h: 8 }) {
    return gpuUsageStatusPanel(val)
  },
  gpuUsageTop5: function(val = { w: 6, h: 4 }) {
    return gpuUsageTop5Panel(val)
  },
  alarmVertical: function(val = { w: 3, h: 12 }) {
    return alarmVerticalPanel(val)
  },
  alarmHorizontal: function(val = { w: 12, h: 4 }) {
    return alarmHorizontalPanel(val)
  },
}

export const makePanels = (key, val) => {
  return panelInfo[key]?.(val)
}

export const nodePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x="${x}" gs-y="${y}" gs-w="${w}" gs-h="${h}" id="nodePanel">
                  <div class="grid-stack-item-content">
                    <div class="grid_item">
                      <div class="grid_title">
                        <label>노드</label>
                        <i class="ico-btn-trash"></i>
                      </div>
                      <div class="spin-nested-loading">
                        <div class="spin-container">
                          <div class="grid_info style_status">
                            <div class="box type_status">
                              <div class="cont_group clusternode">
                                <div class="cont1">
                                  <div class="number_wrap">
                                    <i class="ico-type24-clusternode-gpu"
                                      ><span>GPU 노드</span>
                                    </i>
                                    <p><span class="em">140</span>/ 140</p>
                                  </div>
                                  <div class="number_wrap">
                                    <i class="ico-type24-clusternode"
                                      ><span>CPU 노드</span>
                                    </i>
                                    <p><span class="em">10</span>/ 10</p>
                                  </div>
                                </div>
                                <div class="cont3">
                                  <div class="status_wrap">
                                    <div class="value">150</div>
                                    <p class="status running">
                                      <span>실행중</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">0</div>
                                    <p class="status warning">
                                      <span>주의</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">0</div>
                                    <p class="status unschedulable">
                                      <span>스케줄링 불가</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">150</div>
                                    <p class="status total">
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
                  </div>
                </div>`

  return panel
}

export const virtualMachinePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x="${x}" gs-y="${y}" gs-w="${w}" gs-h="${h}" id="virtualMachinePanel">
                  <div class="grid-stack-item-content">
                    <div class="grid_item">
                      <div class="grid_title">
                        <label>가상머신</label>
                        <i class="ico-btn-trash"></i>
                      </div>
                      <div class="spin-nested-loading">
                        <div class="spin-container">
                          <div class="grid_info style_status">
                            <div class="box type_status">
                              <div class="cont_group clusternode">
                                <div class="cont1">
                                  <div class="number_wrap">
                                    <i class="ico-type24-vm-gpu"
                                      ><span>GPU 가상머신</span>
                                    </i>
                                    <p><span class="em">100</span>/ 100</p>
                                  </div>
                                  <div class="number_wrap">
                                    <i class="ico-type24-vm"
                                      ><span>CPU 가상머신</span>
                                    </i>
                                    <p><span class="em">49</span>/ 49</p>
                                  </div>
                                </div>
                                <div class="cont2">
                                  <div class="status_wrap">
                                    <div class="value">2</div>
                                    <p class="status waiting">
                                      <span>진행중</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">93</div>
                                    <p class="status running">
                                      <span>실행중</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">1</div>
                                    <p class="status warning">
                                      <span>정지됨</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">1</div>
                                    <p class="status error">
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
                  </div>
                </div>`

  return panel
}

export const gpuStatusPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x="${x}" gs-y="${y}" gs-w="${w}" gs-h="${h}" id="gpuStatusPanel">
                  <div class="grid-stack-item-content">
                    <div class="grid_item">
                      <div class="grid_title">
                        <label>GPU 현황</label>
                        <i class="ico-btn-trash"></i>
                      </div>
                      <div class="spin-nested-loading">
                        <div class="spin-container">
                          <div class="grid_info style_status">
                            <div class="box type_status">
                              <div class="cont_group">
                                <div class="cont1">
                                  <div class="number_wrap">
                                    <i class="ico-type-gpuaas-gpu"></i>
                                    <p><span class="em">70</span> / 80</p>
                                  </div>
                                </div>
                                <div class="cont2">
                                  <div class="status_wrap">
                                    <div class="value">80</div>
                                    <p class="status running">
                                      <span>정상</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">0</div>
                                    <p class="status unknown">
                                      <span>미확인</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">10</div>
                                    <p class="status warning">
                                      <span>경고</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>`

  return panel
}

export const gpuUsagePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x="${x}" gs-y="${y}" gs-w="${w}" gs-h="${h}" id="gpuUsagePanel">
                  <div class="grid-stack-item-content">
                    <div class="grid_item">
                      <div class="grid_title">
                        <label>GPU 가용률</label>
                        <i class="ico-btn-trash"></i>
                      </div>
                      <div class="spin-nested-loading">
                        <div class="spin-container">
                          <div class="grid_info style_status">
                            <div class="box type_status">
                              <div class="cont_group">
                                <div class="cont1">
                                  <img
                                    src="/assets/resources/images/dummy/img-dummy-chart-pie2.svg"
                                  />
                                </div>
                                <div class="cont2">
                                  <div class="status_wrap">
                                    <div class="value">43</div>
                                    <p class="status used_gpu">
                                      <span>사용중</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">37</div>
                                    <p class="status waiting">
                                      <span>미사용</span>
                                    </p>
                                  </div>
                                  <div class="status_wrap">
                                    <div class="value">80</div>
                                    <p class="status total">
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
                  </div>
                </div>`

  return panel
}

export const gpuMapPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x="${x}" gs-y="${y}" gs-w="${w}" gs-h="${h}" id="gpuMapPanel">
                  <div class="grid-stack-item-content">
                  <div class="grid_item">
                    <div class="grid_title">
                      <label>GPU 현황 맵</label>
                      <div class="right">
                        <div class="select_wrap">
                          <div class="select-list-box">
                            <div class="selected-item single">
                              <p>
                                <strong>노드</strong>
                              </p>
                            </div>
                            <ul class="select-list scroll-gray">
                              <li class="selected">
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
                        <!-- // select_wrap -->
                        <button class="icon">
                          <i class="ico-list-filter"></i>
                        </button>
                        <i class="ico-btn-trash"></i>
                        <!-- 이름 순, 이름 역순, 사용률 높은 순, 사용률 낮은 순 -->
                      </div>
                    </div>
                    <div class="grid_option_area">
                      <div class="legend_button_wrapper">
                        <button class="legend_toggle_button" onclick="toggleLegend()">
                          범례
                        </button>

                        <div class="legend_dropdown_container" id="legendDropdown" style="display: none">
                          <div class="legend_container">
                            <div class="legend_items">
                              <div class="legend_item">
                                <div class="color_bar gpu_state_unknown"></div>
                                <span class="level">0</span>
                              </div>
                              <div class="legend_item">
                                <div class="color_bar gpu_state_usage1"></div>
                                <span class="level">30</span>
                              </div>
                              <div class="legend_item">
                                <div class="color_bar gpu_state_usage2"></div>
                                <span class="level">60</span>
                              </div>
                              <div class="legend_item">
                                <div class="color_bar gpu_state_usage3"></div>
                                <span class="level">80</span>
                              </div>
                              <div class="legend_item">
                                <div class="color_bar gpu_state_usage4"></div>
                                <span class="level">100</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="alert_tab">
                        <label for="al_name_1">
                          <input type="radio" name="box-tab" id="al_name_1" value="name3" checked />
                          <!-- gpu badge number는 99 이상일때 99로만 표현 -->
                          <span><span class="gpu_badge_number">18</span><span>전체</span></span>
                        </label>
                        <label for="al_name_3">
                          <input type="radio" name="box-tab" id="al_name_3" value="name5" />
                          <span><span class="gpu_badge_number minor">6</span><span>경고</span></span>
                        </label>
                        <label for="al_name_4">
                          <input type="radio" name="box-tab" id="al_name_4" value="name6" />
                          <span><span class="gpu_badge_number unknown">6</span><span>주의</span></span>
                        </label>
                        <div class="select_wrap">
                          <div class="select-list-box">
                            <div class="selected-item single">
                              <p>
                                <strong>1h</strong>
                              </p>
                            </div>
                            <ul class="select-list scroll-gray">
                              <li class="selected">
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
                    <div class="spin-nested-loading">
                      <div class="spin-container">
                        <div class="gpu_map_wrap">
                          <div id="gpunode-map" class="gpunode_map">
                            <!-- GPU Map : 노드, 가상머신 동일함. GPU만 작은 tile (상태별 5개씩 ) -->
                            <div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                            <div class="gpu_tile gpu_state_unknown">
                              <div class="name" title="B200-node-21">
                                B200-node-21
                              </div>
                              <div class="percent">0%</div>
                            </div><div class="gpu_tile gpu_state_usage1">
                              <div class="name" title="B200-node-01">
                                B200-node-01
                              </div>
                              <div class="percent">20%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage2">
                              <div class="name" title="B200-node-06">
                                B200-node-06
                              </div>
                              <div class="percent">36%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage3">
                              <div class="name" title="B200-node-11">
                                B200-node-11
                              </div>
                              <div class="percent">70%</div>
                            </div>
                            <div class="gpu_tile gpu_state_usage4">
                              <div class="name" title="B200-node-16">
                                B200-node-16
                              </div>
                              <div class="percent">90%</div>
                              <div class="badge_alert"></div>
                            </div>
                          </div>

                          <!-- GPU Map -->
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                </div>`

  return panel
}

export const gpuUsageStatusPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x="${x}" gs-y="${y}" gs-w="${w}" gs-h="${h}" id="gpuUsageStatusPanel">
                  <div class="grid-stack-item-content">
                  <div class="grid_item">
                    <div class="grid_title">
                      <label>GPU 사용 현황</label>
                      <div class="right">
                        <div class="select_wrap">
                          <div class="select-list-box">
                            <div class="selected-item single">
                              <p>
                                <strong>최근 1주일</strong>
                              </p>
                            </div>

                            <ul class="select-list scroll-gray">
                              <li class="selected">
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
                      <i class="ico-btn-trash"></i>
                        <!-- // select_wrap -->
                      </div>
                    </div>
                      <div class="spin-nested-loading">
                        <div class="spin-container">
                          <!-- Metrics Grid -->
                          <div class="gpu_usage_grid">
                            <!-- 공통 메트릭 카드 -->
                            <div class="gpu_usage_card">
                              <h3 class="gpu_usage_card_title">
                                GPU 평균 사용률
                              </h3>
                              <p class="gpu_usage_card_value">76%</p>
                              <div class="gpu_usage_card_chart">
                                <img
                                  src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png"
                                />
                              </div>
                            </div>

                            <div class="gpu_usage_card">
                              <h3 class="gpu_usage_card_title">
                                GPU 메모리 사용률
                              </h3>
                              <p class="gpu_usage_card_value">52%</p>
                              <div class="gpu_usage_card_chart">
                                <img
                                  src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png"
                                />
                              </div>
                            </div>

                            <div class="gpu_usage_card">
                              <h3 class="gpu_usage_card_title">
                                GPU 온도 (최고 / 평균)
                              </h3>
                              <p class="gpu_usage_card_value">95℃ / 72℃</p>
                              <div class="gpu_usage_card_chart">
                                <img
                                  src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png"
                                />
                              </div>
                            </div>

                            <div class="gpu_usage_card">
                              <h3 class="gpu_usage_card_title">
                                전력 사용량 (Total)
                              </h3>
                              <p class="gpu_usage_card_value">3,200w</p>
                              <div class="gpu_usage_card_chart">
                                <img
                                  src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png"
                                />
                              </div>
                            </div>

                            <div class="gpu_usage_card">
                              <h3 class="gpu_usage_card_title">
                                NVLink (Total)
                              </h3>
                              <p class="gpu_usage_card_value">38GB/s</p>
                              <div class="gpu_usage_card_chart">
                                <img
                                  src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png"
                                />
                              </div>
                            </div>

                            <!-- Infiniband (특수 구조) -->
                            <div class="gpu_usage_card gpu_usage_network">
                              <h3 class="gpu_usage_card_title">
                                Infiniband (Total)
                              </h3>
                              <div class="gpu_network_section">
                                <section class="network_section">
                                  <p>
                                    <span class="badge">TX</span>
                                    <span class="value">95GB/s</span>
                                  </p>
                                  <div class="network_chart">
                                    <img
                                      src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png"
                                    />
                                  </div>
                                </section>
                                <section class="network_section">
                                  <p>
                                    <span class="badge">RX</span>
                                    <span class="value">90GB/s</span>
                                  </p>
                                  <div class="network_chart">
                                    <img
                                      src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png"
                                    />
                                  </div>
                                </section>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
                </div>`

  return panel
}

export const gpuUsageTop5Panel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x="${x}" gs-y="${y}" gs-w="${w}" gs-h="${h}" id="gpuUsageTop5Panel">
                  <div class="grid-stack-item-content">
                  <div class="grid_item">
                    <div class="grid_title">
                      <label>GPU 사용 현황 Top5</label>
                      <div class="right"></div>
                      <i class="ico-btn-trash"></i>
                    </div>
                      <div class="spin-nested-loading">
                        <div class="spin-container">
                          <div class="gpu_usage_top_wrap">
                            <div class="gpu_usage_top">
                              <h3 class="gpu_usage_top_title">GPU 사용률</h3>
                              <ul class="gpu_usage_list">
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-0992322</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 90%"></div>
                                  </div>
                                  <span class="percent">90%</span>
                                </li>
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-1</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 82%"></div>
                                  </div>
                                  <span class="percent">82%</span>
                                </li>
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-2</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 75%"></div>
                                  </div>
                                  <span class="percent">75%</span>
                                </li>
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-3</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 64%"></div>
                                  </div>
                                  <span class="percent">64%</span>
                                </li>
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-4</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 58%"></div>
                                  </div>
                                  <span class="percent">58%</span>
                                </li>
                              </ul>
                            </div>
                            <div class="gpu_usage_top color2">
                              <h3 class="gpu_usage_top_title">
                                GPU 메모리 사용률
                              </h3>
                              <ul class="gpu_usage_list">
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-09</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 90%"></div>
                                  </div>
                                  <span class="percent">90%</span>
                                </li>
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-1</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 82%"></div>
                                  </div>
                                  <span class="percent">82%</span>
                                </li>
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-22</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 75%"></div>
                                  </div>
                                  <span class="percent">75%</span>
                                </li>
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-3</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 64%"></div>
                                  </div>
                                  <span class="percent">64%</span>
                                </li>
                                <li class="gpu_usage_item">
                                  <span class="gpu_name">GPU-4</span>
                                  <div class="bar_wrapper">
                                    <div class="bar" style="width: 58%"></div>
                                  </div>
                                  <span class="percent">58%</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
                </div>`

  return panel
}

export const alarmVerticalPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x="${x}" gs-y="${y}" gs-w="${w}" gs-h="${h}" id="alarmVerticalPanel">
                  <div class="grid-stack-item-content">
                  <div class="grid_item">
                    <div class="grid_title">
                      <label>알림</label>
                      <div class="right">
                        <div class="select_wrap">
                          <div class="select-list-box">
                            <div class="selected-item single">
                              <p>
                                <strong>노드</strong>
                              </p>
                            </div>

                            <ul class="select-list scroll-gray">
                              <li class="selected">
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
                        <!-- // select_wrap -->
                        <button class="icon">
                          <i class="ico-list-filter"></i>
                        </button>
                        <i class="ico-btn-trash"></i>
                        <!-- filter 버튼 클릭시 : dropdown 최신 순 / 오래된 순-->
                      </div>
                    </div>
                    <div class="alert_tab">
                      <label for="al_name_1">
                        <input type="radio" name="box-tab" id="al_name_1" value="name3" checked />
                        <!-- gpu badge number는 99 이상일때 99로만 표현 -->
                        <span><span class="gpu_badge_number">18</span><span>전체</span></span>
                      </label>
                      <label for="al_name_2">
                        <input type="radio" name="box-tab" id="al_name_2" value="name4" />
                        <span><span class="gpu_badge_number critical">6</span><span>심각</span></span>
                      </label>
                      <label for="al_name_3">
                        <input type="radio" name="box-tab" id="al_name_3" value="name5" />
                        <span><span class="gpu_badge_number minor">6</span><span>경고</span></span>
                      </label>
                      <label for="al_name_4">
                        <input type="radio" name="box-tab" id="al_name_4" value="name6" />
                        <span><span class="gpu_badge_number unknown">6</span><span>주의</span></span>
                      </label>
                    </div>
                    <div class="spin-nested-loading">
                      <div class="spin-container">
                        <div class="grid_info style_list">
                          <!-- <div class="grid_text">
                            <span>데이터가 없습니다.</span>
                          </div> -->
                          <ul class="alert_card_list">
                            <li class="alert_card">
                              <div class="alert_content">
                                <div class="alert_header">
                                  <span class="alert_status critical">심각</span>
                                  <span class="alert_resource type_node">노드</span>
                                </div>

                                <div class="alert_body">
                                  <p class="alert_message">
                                    Thanos Rule {{$labels.instance}} in
                                    {{$labels.namespace}} is failing to queue
                                    alerts.
                                  </p>
                                  <!--배지가 필요할 때만 사용 <p class="alert_badge">
                                      <span class="alert_errorcode"
                                        >Error Code: Xid 14</span
                                      >
                                    </p> -->
                                </div>
                                <p class="alert_date">2025-08-23</p>
                              </div>
                            </li>
                            <li class="alert_card">
                              <div class="alert_content">
                                <div class="alert_header">
                                  <span class="alert_status minor">경고</span>
                                  <span class="alert_resource type_gpu">GPU</span>
                                </div>

                                <div class="alert_body">
                                  <p class="alert_message">
                                    GPU의 디스플레이 엔진 응답 지연을
                                    감지했습니다.
                                  </p>
                                  <p class="alert_badge">
                                    <span class="alert_errorcode">Error Code: Xid 14</span>
                                  </p>
                                </div>
                                <p class="alert_date">2025-08-23</p>
                              </div>
                            </li>
                            <li class="alert_card">
                              <div class="alert_content">
                                <div class="alert_header">
                                  <span class="alert_status unknown">주의</span>
                                  <span class="alert_resource type_vm">가상머신</span>
                                </div>

                                <div class="alert_body">
                                  <p class="alert_message">
                                    Pod name is skt-32 value is
                                    2.405932480e+06
                                  </p>
                                  <!--배지가 필요할 때만 사용 <p class="alert_badge">
                                      <span class="alert_errorcode"
                                        >Error Code: Xid 14</span
                                      >
                                    </p> -->
                                </div>
                                <p class="alert_date">2025-08-23</p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>`

  return panel
}

export const alarmHorizontalPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x="${x}" gs-y="${y}" gs-w="${w}" gs-h="${h}" id="alarmHorizontalPanel">
                  <div class="grid-stack-item-content">
                  <div class="grid_item">
                    <div class="grid_title">
                      <label>알림</label>
                      <div class="right">
                        <div class="alert_tab bottom">
                          <label for="al_name2_1">
                            <input type="radio" name="box-tab" id="al_name2_1" value="name3" checked />
                            <!-- gpu badge number는 99 이상일때 99로만 표현 -->
                            <span><span class="gpu_badge_number">18</span><span>전체</span></span>
                          </label>
                          <label for="al_name2_2">
                            <input type="radio" name="box-tab" id="al_name2_2" value="name4" />
                            <span><span class="gpu_badge_number critical">6</span><span>심각</span></span>
                          </label>
                          <label for="al_name2_3">
                            <input type="radio" name="box-tab" id="al_name2_3" value="name5" />
                            <span><span class="gpu_badge_number minor">6</span><span>경고</span></span>
                          </label>
                          <label for="al_name2_4">
                            <input type="radio" name="box-tab" id="al_name2_4" value="name6" />
                            <span><span class="gpu_badge_number unknown">6</span><span>주의</span></span>
                          </label>
                        </div>
                        <div class="select_wrap">
                          <div class="select-list-box">
                            <div class="selected-item single">
                              <p>
                                <strong>노드</strong>
                              </p>
                            </div>

                            <ul class="select-list scroll-gray">
                              <li class="selected">
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
                        <!-- // select_wrap -->
                        <button class="icon">
                          <i class="ico-list-filter"></i>
                        </button>
                        <i class="ico-btn-trash"></i>
                        <!-- filter 버튼 클릭시 : dropdown 최신 순 / 오래된 순-->
                      </div>
                    </div>

                    <div class="spin-nested-loading">
                      <div class="spin-container">
                        <div class="grid_info style_list">
                          <!-- <div class="grid_text">
                            <span>데이터가 없습니다.</span>
                          </div> -->
                          <ul class="alert_card_list bottom">
                            <li class="alert_card">
                              <div class="alert_content">
                                <div class="alert_header">
                                  <span class="alert_status critical">심각</span>
                                  <span class="alert_resource type_node">노드</span>
                                </div>

                                <div class="alert_body">
                                  <p class="alert_message">
                                    Thanos Rule {{$labels.instance}} in
                                    {{$labels.namespace}} is failing to queue
                                    alerts.
                                  </p>
                                  <!--배지가 필요할 때만 사용 <p class="alert_badge">
                                      <span class="alert_errorcode"
                                        >Error Code: Xid 14</span
                                      >
                                    </p> -->
                                </div>
                                <p class="alert_date">2025-08-23</p>
                              </div>
                            </li>
                            <li class="alert_card">
                              <div class="alert_content">
                                <div class="alert_header">
                                  <span class="alert_status minor">경고</span>
                                  <span class="alert_resource type_gpu">GPU</span>
                                </div>

                                <div class="alert_body">
                                  <p class="alert_message">
                                    GPU의 디스플레이 엔진 응답 지연을
                                    감지했습니다.
                                  </p>
                                  <p class="alert_badge">
                                    <span class="alert_errorcode">Error Code: Xid 14</span>
                                  </p>
                                </div>
                                <p class="alert_date">2025-08-23</p>
                              </div>
                            </li>
                            <li class="alert_card">
                              <div class="alert_content">
                                <div class="alert_header">
                                  <span class="alert_status minor">경고</span>
                                  <span class="alert_resource type_gpu">GPU</span>
                                </div>

                                <div class="alert_body">
                                  <p class="alert_message">
                                    GPU의 디스플레이 엔진 응답 지연을
                                    감지했습니다.
                                  </p>
                                  <p class="alert_badge">
                                    <span class="alert_errorcode">Error Code: Xid 14</span>
                                  </p>
                                </div>
                                <p class="alert_date">2025-08-23</p>
                              </div>
                            </li>
                            <li class="alert_card">
                              <div class="alert_content">
                                <div class="alert_header">
                                  <span class="alert_status minor">경고</span>
                                  <span class="alert_resource type_gpu">GPU</span>
                                </div>

                                <div class="alert_body">
                                  <p class="alert_message">
                                    GPU의 디스플레이 엔진 응답 지연을
                                    감지했습니다.
                                  </p>
                                  <p class="alert_badge">
                                    <span class="alert_errorcode">Error Code: Xid 14</span>
                                  </p>
                                </div>
                                <p class="alert_date">2025-08-23</p>
                              </div>
                            </li>
                            <li class="alert_card">
                              <div class="alert_content">
                                <div class="alert_header">
                                  <span class="alert_status unknown">주의</span>
                                  <span class="alert_resource type_vm">가상머신</span>
                                </div>

                                <div class="alert_body">
                                  <p class="alert_message">
                                    Pod name is skt-32 value is
                                    2.405932480e+06
                                  </p>
                                  <!--배지가 필요할 때만 사용 <p class="alert_badge">
                                      <span class="alert_errorcode"
                                        >Error Code: Xid 14</span
                                      >
                                    </p> -->
                                </div>
                                <p class="alert_date">2025-08-23</p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>`

  return panel
}

export const clusterNodePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="clusterNodePanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_CLUSTER_NODE')}</label>
            <i class="ico-btn-trash"></i>
          </div>
          <div class="grid_info style_status">
            <div class="box type_status">
              <div class="cont_group clusternode">
                <div class="cont1">
                  <div class="number_wrap">
                    <i class="ico-type-clusternode"><span>Master</span></i>

                    <p><span class="em">1</span>/1</p>
                  </div>
                  <div class="number_wrap">
                    <i class="ico-type-clusternode"><span>Worker</span></i>
                    <p><span class="em">4</span>/4</p>
                  </div>
                </div>
                <div class="cont3">
                  <div class="status_wrap">
                    <div class="value">4</div>
                    <p class="status running"><span>Running</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">1</div>
                    <p class="status warning"><span>Warning</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">0</div>
                    <p class="status unschedulable"><span>Unschedulable</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">5</div>
                    <p class="status total"><span>Total</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const podPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="podPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('POD_PL')}</label>
            <i class="ico-btn-trash"></i>
          </div>
          <div class="grid_info style_status">
            <div class="box type_status">
              <div class="cont_group">
                <div class="cont1">
                  <div class="number_wrap">
                    <i class="ico-type-pod"></i>
                    <p><span class="em">8</span> / 12</p>
                  </div>
                </div>
                <div class="cont2">
                  <div class="status_wrap">
                    <div class="value">2</div>
                    <p class="status waiting"><span>Waiting</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">8</div>
                    <p class="status running"><span>Running</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">1</div>
                    <p class="status completed"><span>Completed</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">1</div>
                    <p class="status error"><span>Error</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const vmPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="vmPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_VM')}</label>
            <i class="ico-btn-trash"></i>
          </div>
          <div class="grid_info style_status">
            <div class="box type_status">
              <div class="cont_group">
                <div class="cont1">
                  <div class="number_wrap">
                    <i class="ico-type-vm"></i>
                    <p><span class="em">3</span> / 7</p>
                  </div>
                </div>
                <div class="cont2">
                  <div class="status_wrap">
                    <div class="value">2</div>
                    <p class="status waiting"><span>Progressing</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">3</div>
                    <p class="status running"><span>Running</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">1</div>
                    <p class="status warning"><span>Stopped</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">1</div>
                    <p class="status error"><span>Error</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const kaasPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="kaasPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>KaaS</label>
            <i class="ico-btn-trash"></i>
          </div>
          <div class="grid_info style_status">
            <div class="box type_status">
              <div class="cont_group">
                <div class="cont1">
                  <div class="number_wrap">
                    <i class="ico-type-container"></i>
                    <p><span class="em">4</span> / 9</p>
                  </div>
                </div>
                <div class="cont2">
                  <div class="status_wrap">
                    <div class="value">1</div>
                    <p class="status running"><span>Ready</span></p>
                  </div>
                  <div class="status_wrap">
                    <div class="value">4</div>
                    <p class="status waiting"><span>NotReady</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}
export const gpuClusterPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="gpuClusterPanel">
                <div class="grid-stack-item-content">
                  <!-- grid_item -->
                  <div class="grid_item">
                    <div class="grid_title">
                      <label>${t('RESOURCES_GPU_CLUSTER')}</label>
                      <i class="ico-btn-trash"></i>
                    </div>
                    <div class="spin-nested-loading">
                      <div class="spin-container">
                        <div class="grid_info style_groupnode">
                          <div class="box_gpucluster">
                            <div class="card_wrapper">
                              <div class="card_header">
                                <div class="select_cluster" onclick="toggleDropdown()">
                                  <div class="icon_vgpu">
                                    <i class="ico-type-gpucluster"></i>
                                    <p class="cluster_name">B200_cluster01</p>
                                  </div>
                                  
                                  <div class="dropdown_icon"></div>

                                  <ul id="dropdown" class="dropdown hidden">
                                    <li class="dropdown_option">
                                      <div class="icon_vgpu">
                                        <i class="ico-type-mediatedvgpu"></i>
                                        <p class="cluster_name">B200_cluster01</p>
                                      </div>
                                    </li>
                                    <li class="dropdown_option">
                                      <div class="icon_vgpu">
                                        <i class="ico-type-mediatedvgpu"></i>
                                        <p class="cluster_name">B200_cluster01</p>
                                      </div>
                                    </li>
                                    <li class="dropdown_option">
                                      <div class="icon_vgpu">
                                        <i class="ico-type-mediatedvgpu"></i>
                                        <p class="cluster_name">B200_cluster01</p>
                                      </div>
                                    </li>
                                   
                                  </ul>
                                </div>
                                
                               
                                
                                <div class="status_group">
                                  <div class="status_item">
                                    <p class="status_label">가상머신</p>
                                    <span class="status_value">10</span>
                                  </div>
                                  <div class="status_item">
                                    <p class="status_label">총 GPU</p>
                                    <span class="status_value">80</span>
                                  </div>
                                  <div class="status_item">
                                    <p class="status_label">GPU 평균 사용률</p>
                                    <span class="status_value">52%</span>
                                  </div>
                                  <div class="status_item">
                                    <p class="status_label">GPU 메모리 사용량</p>
                                    <span class="status_value">1.2/6.4 <span class="unit">TB</span></span>
                                  </div>
                                  <div class="status_item">
                                    <p class="status_label">평균 온도</p>
                                    <span class="status_value">67<span class="unit">°C</span></span>
                                  </div>
                                </div>
                              </div>
                            </div>
                   
                            <section class="flex_row">
                              <div class="gpu_group" >
                                <div className="select step">
                                </div>
                                  <div class="zoomin_icon">
                                    <button id="zoomIn" class="btn_zoom_icon">
                                      <i class="ico-plus"></i>
                                    </button>
                                    <button id="zoomOut" class="btn_zoom_icon">
                                      <i class="ico-minus"></i>
                                    </button>
                                    <button id="resetZoom" class="btn_zoom_icon">
                                      <i class="ico-reset"></i>
                                    </button>
                                  </div>
                                <div class="gpu_card_group">
                                
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="gpu_card">
                                    <div class="gpu_card_header">
                                      <div class="gpu_card_title">Node-01</div>
                                      <div class="gpu_card_status_dot normal"></div>
                                    </div>
                                  
                                    <section class="gpu_card_gpu_list">
                                      <div class="gpu_box normal"> <!--주석삭제 : normal, critical, minor, unknown-->
                                        <div class="gpu_box_index">1</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU1</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">2</div>
                                        <div class="tooltip_box">
                                          <div class="gpu_card_title">GPU2</div>
                                          <div class="gpu_card_metrics">
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Avg</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                            <div class="gpu_card_metric">
                                              <div class="gpu_card_metric_label">GPU Mem</div>
                                              <div class="gpu_card_metric_value">46.9%</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">3</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">4</div>
                                      </div>
                                      <div class="gpu_box unknown">
                                        <div class="gpu_box_index">5</div>
                                      </div>
                                      <div class="gpu_box normal">
                                        <div class="gpu_box_index">6</div>
                                      </div>
                                      <div class="gpu_box critical">
                                        <div class="gpu_box_index">7</div>
                                      </div>
                                      <div class="gpu_box minor">
                                        <div class="gpu_box_index">8</div>
                                      </div>
                                    </section>
                                  
                                    <div class="gpu_card_metrics">
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Avg</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                      <div class="gpu_card_metric">
                                        <div class="gpu_card_metric_label">GPU Mem</div>
                                        <div class="gpu_card_metric_value">46.9%</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                              </div>
                              <div class="gpu_panel">
                                <div class="gpu_top">
                                  <div class="gpu_title">GPU 현황</div>
                                  <div class="gpu_status">
                                    <div class="gpu_summary">
                                      <span class="gpu_summary_main">50</span><span>/</span><span class="gpu_summary_total"> 70</span>
                                    </div>
                                    <div class="gpu_legend">
                                      <div class="gpu_legend_values">
                                        <div>10</div>
                                        <div>50</div>
                                        <div>10</div>
                                      </div>
                                      <div class="gpu_legend_dots">
                                        <div class="dot minor"></div>
                                        <div class="dot normal"></div>
                                        <div class="dot unknown"></div>
                                      </div>
                                      <div class="gpu_legend_labels">
                                        <div>경고</div>
                                        <div>정상</div>
                                        <div>미확인</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                            
                                <div class="gpu_chart">
                                  <div class="chart_section">
                                    <div class="chart_title">GPU 사용량 추이</div>
                                    <div class="chart_values">
                                      <div class="chart_total"><span>52%</span><span></span><span></span></div>
                                    </div>
                                    <div class="chart_gpu_trend" style="background: rgba(0, 0, 255, 0.02);"></div>
                                  </div>
                                  <div class="chart_section">
                                    <div class="chart_title">NVLink (Total)</div>
                                    <div class="chart_gpu_trend" style="background: rgba(0, 0, 255, 0.02);"></div>
                                  </div>
                                  <div class="chart_section">
                                    <div class="chart_title">IB 인바운드 (Total)</div>
                                    <div class="chart_gpu_trend" style="background: rgba(0, 0, 255, 0.02);"></div>
                                  </div>
                                  <div class="chart_section">
                                    <div class="chart_title">IB 아웃바운드 (Total)</div>
                                    <div class="chart_gpu_trend" style="background: rgba(0, 0, 255, 0.02);"></div>
                                  </div>
                                </div>
                              </div>   
                            </section>
                        </div>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`

  return panel
}

export const resourceUsagePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="resourceUsagePanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_RESOURCE_USAGE')}</label>
            <div class="right">
              <div class="dash_boxtab">
                <label htmlFor="name2_1">
                  <input type="radio" name="box-tab" id="name2_1" value="name3" checked />
                  <span>노드</span>
                </label>
                <label htmlFor="name2_2">
                  <input type="radio" name="box-tab" id="name2_2" value="name4" />
                  <span>${t('POD_PL')}</span>
                </label>
                <label htmlFor="name2_3">
                  <input type="radio" name="box-tab" id="name2_3" value="name5" />
                  <span>${t('RESOURCES_VM')}</span>
                </label>
                <label htmlFor="name2_4">
                  <input type="radio" name="box-tab" id="name2_4" value="name6" />
                  <span>KaaS</span>
                </label>
              </div>
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="grid_info style_chart">
            <div class="box type_chart">
              <div class="cont1">
                <div class="chart_tab on">
                  <div class="title">
                    <i class="ico-type-cpu"></i>
                    <h5>CPU</h5>
                  </div>
                  <div class="data">
                    <div class="number_wrap">
                      <p><span class="em">0.7</span> / 48 <span class="unit">Cores</span></p>
                      <p>5%</p>
                    </div>
                    <div class="graph_wrap">
                      <div class="graph_bar">
                        <div class="bar animate-bar" style="width: 5%" ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="chart_tab">
                  <div class="title">
                    <i class="ico-type-memory"></i>
                    <h5>${t('RESOURCES_MEMORY')}</h5>
                  </div>
                  <div class="data">
                    <div class="number_wrap">
                      <p><span class="em">9.66</span> / 21 <span class="unit">Gi</span></p>
                      <p>25%</p>
                    </div>

                    <div class="graph_wrap">
                      <div class="graph_bar">
                        <div class="bar animate-bar" style="width: 25%" ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="chart_tab">
                  <div class="title">
                    <i class="ico-type-disk"></i>
                    <h5>${t('RESOURCES_DISK')}</h5>
                  </div>
                  <div class="data">
                    <div class="number_wrap">
                      <p><span class="em">85.64</span> / 318.21 <span class="unit">GB</span></p>
                      <p>15%</p>
                    </div>
                    <div class="graph_wrap">
                      <div class="graph_bar">
                        <div class="bar animate-bar" style="width: 15%" ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="cont2">
                <div class="chart_01"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const networkTrafficPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="networkTrafficPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_NETWORK_TRAFFIC')}</label>
            <div class="right">
              <div class="dash_boxtab">
                <label htmlFor="name3">
                  <input type="radio" name="box-tab1" id="name3" value="name3" checked />
                  <span>노드</span>
                </label>
                <label htmlFor="name4">
                  <input type="radio" name="box-tab1" id="name4" value="name4" />
                  <span>${t('POD_PL')}</span>
                </label>
                <label htmlFor="name5">
                  <input type="radio" name="box-tab1" id="name5" value="name5" />
                  <span>${t('RESOURCES_VM')}</span>
                </label>
                <label htmlFor="name6">
                  <input type="radio" name="box-tab1" id="name6" value="name6" />
                  <span>KaaS</span>
                </label>
              </div>
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="grid_info style_chart">
            <div class="box type_chart">
              <div class="cont1">
                <div class="chart_tab no-tab">
                  <div class="title">
                    <i class="ico-type-outbound"></i>
                    <h5>Outbound</h5>
                  </div>
                  <div class="data">
                    <div class="number_wrap data-r">
                      <p><span class="em">2.26</span> <span class="unit">Mbps</span></p>
                    </div>
                  </div>
                </div>
                <div class="chart_tab no-tab">
                  <div class="title">
                    <i class="ico-type-inbound"></i>
                    <h5>Inbound</h5>
                  </div>
                  <div class="data">
                    <div class="number_wrap data-r">
                      <p><span class="em">1.51</span> <span class="unit">Mbps</span></p>
                    </div>
                  </div>
                </div>
                <div class="chart_tab no-tab">
                  <div class="title">
                    <i class="ico-type-network"></i>
                    <h5>Total</h5>
                  </div>
                  <div class="data">
                    <div class="number_wrap data-r">
                      <p><span class="em">3.77</span> <span class="unit">Mbps</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="cont2">
                <div class="chart_02"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const usageTop5Panel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="usageTop5Panel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_RESOURCE_USAGE_TOP')}</label>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="grid_info style_list">
            <div class="select_wrap">
              <div class="d-flex align-start w-100">
                <div class="content-box" style="width: 60%" >
                  <div class="select-list-box">
                    <div class="selected-item single">
                      <p>
                        <strong>${t('RESOURCES_CPU_USAGE')}</strong>
                      </p>
                    </div>

                    <ul class="select-list scroll-gray">
                      <li class="selected">
                        <p>
                          <strong>${t('RESOURCES_CPU_USAGE')}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          <strong>${t('RESOURCES_MEMORY_USAGE')}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          <strong>${t('RESOURCES_DISK_USAGE')}</strong>
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="content-box" style="width: 38%" >
                  <div class="select-list-box">
                    <div class="selected-item single">
                      <p>
                        <strong>${t('RESOURCES_NODE')}</strong>
                      </p>
                    </div>

                    <ul class="select-list scroll-gray">
                      <li class="selected">
                        <p>
                          <strong>${t('RESOURCES_NODE')}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          <strong>${t('POD_PL')}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          <strong>${t('RESOURCES_VM')}</strong>
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
              </div>
            </div>
            <ul class="list_01">
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-clusternode"></i>
                  <h6 class="list_title">
                    Worker01
                    <span>192.168.16.87</span>
                  </h6>
                </div>
                <div class="info">
                  <h6>2%
                    <span>${t('RESOURCES_CPU_USAGE')}</span>
                  </h6>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-clusternode"></i>
                  <h6 class="list_title">
                    Worker02
                    <span>192.168.16.87</span>
                  </h6>
                </div>
                <div class="info">
                  <h6>2%
                    <span>${t('RESOURCES_CPU_USAGE')}</span>
                  </h6>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-clusternode"></i>
                  <h6 class="list_title">
                    Worker03
                    <span>192.168.16.87</span>
                  </h6>
                </div>
                <div class="info">
                  <h6>2%
                    <span>${t('RESOURCES_CPU_USAGE')}</span>
                  </h6>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-clusternode"></i>
                  <h6 class="list_title">
                    Master01
                    <span>192.168.16.87</span>
                  </h6>
                </div>
                <div class="info warning">
                  <h6>80%
                    <span>${t('RESOURCES_CPU_USAGE')}</span>
                  </h6>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-clusternode"></i>
                  <h6 class="list_title">
                    Worker04
                    <span>192.168.16.87</span>
                  </h6>
                </div>
                <div class="info">
                  <h6>2%
                    <span>${t('RESOURCES_CPU_USAGE')}</span>
                  </h6>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const recentResourcePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="recentResourcePanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_RECENT_CREATE_RESOURCE')} (${t(
    'RESOURCES_WEEKEND'
  )})</label>
            <i class="ico-btn-trash"></i>
          </div>
          <div class="grid_info style_list">
            <ul class="list_01">
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-clusternode"></i>
                  <h6 class="list_title">
                    Worker01
                    <span>2023-08-23</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_node">${t('RESOURCES_NODE')}</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-pod"></i>
                  <h6 class="list_title">
                    Worker01
                    <span>2023-08-22</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_pod">${t('POD_PL')}</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-container"></i>
                  <h6 class="list_title">
                    Worker01
                    <span>2023-08-21</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_container">KaaS</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-vm"></i>
                  <h6 class="list_title">
                    Worker01
                    <span>2023-08-20</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_vm">${t('RESOURCES_VM')}</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-vm"></i>
                  <h6 class="list_title">
                    Worker01
                    <span>2023-08-20</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_vm">${t('RESOURCES_VM')}</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-type24-vm"></i>
                  <h6 class="list_title">
                    Worker01
                    <span>2023-08-20</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_vm">${t('RESOURCES_VM')}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const issuePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="issuePanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_ISSUE')}</label>
            <i class="ico-btn-trash"></i>
          </div>
          <div class="grid_info style_list">
            <ul class="list_01">
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-info-warning"></i>
                  <h6 class="list_title">
                    Add the usage to 'worker02' node.
                    <span>2023-08-23</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_node">${t('RESOURCES_NODE')}</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-info-warning"></i>
                  <h6 class="list_title">
                    Can't reserve the new Pod by 1 node.
                    <span>2023-08-23</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_pod">${t('POD_PL')}</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-info-warning"></i>
                  <h6 class="list_title">
                    abcnavme installation has ended.
                    <span>2023-08-21</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_container">KaaS</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-info-warning-2"></i>
                  <h6 class="list_title">
                    pod_avme is Ready.
                    <span>2023-08-20</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_vm">${t('RESOURCES_VM')}</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-info-warning"></i>
                  <h6 class="list_title">
                    Add the memory usage to 'worker02' node.
                    <span>2023-08-16</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_vm">${t('RESOURCES_VM')}</span>
                </div>
              </li>
              <li class="li_type_01">
                <div class="lft">
                  <i class="ico-info-warning"></i>
                  <h6 class="list_title">
                    Add the usage to 'worker02' node.
                    <span>2023-08-14</span>
                  </h6>
                </div>
                <div class="type">
                  <span class="type_vm">${t('RESOURCES_VM')}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const computingNetworkPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="computingNetworkPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_COMPUTING_NETWORK_CURRENT_SITUATION')}</label>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_status box_nth">

                <div class="box type_status">
                  <h5><i class="ico-type24-loadbalancer"></i>${t(
                    'RESOURCES_LOAD_BALANCER'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">4</span> / 5</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">4</div>
                        <p class="status used"><span>Used</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unused"><span>Unused</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-floatingip"></i>${t(
                    'RESOURCES_FLOATING_IP'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">2</span> / 3</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">2</div>
                        <p class="status used"><span>Used</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unused"><span>Unused</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-security"></i>${t(
                    'RESOURCES_SECURITY_GROUP'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">2</span> / 3</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">2</div>
                        <p class="status used"><span>Used</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unused"><span>Unused</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-router"></i>${t(
                    'RESOURCES_VROUTER'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">8</span></p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">7</div>
                        <p class="status internal"><span>Internal</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status external"><span>External</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-network"></i>${t(
                    'RESOURCES_NETWORK'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">5</span></p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">4</div>
                        <p class="status internal"><span>Internal</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status external"><span>External</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-soriv"></i>${t(
                    'RESOURCES_SR_IOV_NETWORK'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">8</span></p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">7</div>
                        <p class="status internal"><span>Internal</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status external"><span>External</span></p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const computingTemplatePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="computingTemplatePanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t(
              'RESOURCES_COMPUTING_TEMPLATE_CURRENT_SITUATION'
            )}</label>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_status box_nth">

                <div class="box type_status">
                  <h5><i class="ico-type24-mediatedvgpu"></i>${t(
                    'RESOURCES_MEDIATED_DEVICE'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">4</span> / 5</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">4</div>
                        <p class="status used"><span>Used</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unused"><span>Unused</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-hostdevice"></i>${t(
                    'RESOURCES_HOST_DEVICE'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">2</span> / 3</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">2</div>
                        <p class="status used"><span>Used</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unused"><span>Unused</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-image"></i>${t(
                    'RESOURCES_IMAGE'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">2</span> / 3</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">2</div>
                        <p class="status used"><span>Used</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unused"><span>Unused</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-keypair"></i>${t(
                    'RESOURCES_KEYPAIR'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">4</span> / 7</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">7</div>
                        <p class="status used"><span>Used</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unused"><span>Unused</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-flavor"></i>Flavor</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">4</span> / 5</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">4</div>
                        <p class="status used"><span>Used</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unused"><span>Unused</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="box type_status">
                  <h5><i class="ico-type24-kaasimage"></i>${t(
                    'RESOURCES_KAAS_IMAGE'
                  )}</h5>
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">7</span> / 8</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">7</div>
                        <p class="status used"><span>Used</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unused"><span>Unused</span></p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>`

  return panel
}

export const resourceChangePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="resourceChangePanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_RESOURCE_CHANGE_AMOUNT')}</label>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_status box_long">
                <div class="box type_status">
                  <div class="cont_group">
                    <h5><i class="ico-type-pod"></i>${t('POD_PL')}</h5>
                    <div class="number_wrap">
                      <p><span class="em">12</span></p>
                    </div>
                    <div class="chart chart_03">
                    </div>
                  </div>
                </div>
              </div>
              <div class="grid_info style_status box_long">
                <div class="box type_status">
                  <div class="cont_group">
                    <h5><i class="ico-type-vm"></i>${t('RESOURCES_VM')}</h5>
                    <div class="number_wrap">
                      <p><span class="em">7</span></p>
                    </div>
                    <div class="chart chart_03">
                    </div>
                  </div>
                </div>
              </div>
              <div class="grid_info style_status box_long">
                <div class="box type_status">
                  <div class="cont_group">
                    <h5><i class="ico-type-container"></i>KaaS</h5>
                    <div class="number_wrap">
                      <p><span class="em">1</span></p>
                    </div>
                    <div class="chart chart_03">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const clusterStatusPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="clusterStatusPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_CLUSTER_COMPONENT_STATE')}</label>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="grid_info style_status box_nth_wrap">
            <div class="box type_component selected">
              <h5><i class="ico-type-kubernetes-component"></i>Kubeproxy</h5>
              <div class="status_box">
                <p class="status_active">3</p>
                <p class="status_inactive">0</p>
              </div>
              <div class="box_pop">
                <h6>Kubeproxy</h6>
                <div class="status_wrap">
                  <p class="status active"><span>Worker1</span></p>
                </div>
                <div class="status_wrap">
                  <p class="status inactive"><span>Worker2</span></p>
                </div>
                <div class="status_wrap">
                  <p class="status error"><span>Master</span></p>
                </div>
              </div>
            </div>
            <div class="box type_component">
              <h5><i class="ico-type-kubernetes-component"></i>coreDNS</h5>
              <div class="status_box">
                <p class="status_active">3</p>
                <p class="status_inactive">0</p>
              </div>
            </div>
            <div class="box type_component">
              <h5><i class="ico-type-kubernetes-component"></i>Kubelet</h5>
              <div class="status_box">
                <p class="status_active">3</p>
                <p class="status_inactive">0</p>
              </div>
            </div>
            <div class="box type_component">
              <h5><i class="ico-type-kubernetes-component"></i>kube-scheduler</h5>
              <div class="status_box">
                <p class="status_active">3</p>
                <p class="status_inactive">0</p>
              </div>
            </div>
            <div class="box type_component">
              <h5><i class="ico-type-kubernetes-component"></i>kube-scheduler</h5>
              <div class="status_box">
                <p class="status_active">3</p>
                <p class="status_inactive">0</p>
              </div>
            </div>
            <div class="box type_component">
              <h5><i class="ico-type-kubernetes-component"></i>kube-controller-manager</h5>
              <div class="status_box">
                <p class="status_active">3</p>
                <p class="status_inactive">0</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>`

  return panel
}

export const bmcNodePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="bmcNodePanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_BAREMETAL_NODE_CURRENT_SITUATION')}</label>
            <div class="view-result">${t('RESOURCES_TOTAL')} 99${t(
    'RESOURCES_COUNT_GUN'
  )}</div>
            <div class="dash_boxtab">
              <label htmlFor="name9">
                <input type="radio" name="box-tab2" id="name9" value="name3" checked />
                <span>${t('RESOURCES_ALL')}</span>
              </label>
              <label htmlFor="name10">
                <input type="radio" name="box-tab2" id="name10" value="name4" />
                <span>ARM</span>
              </label>
              <label htmlFor="name11">
                <input type="radio" name="box-tab2" id="name11" value="name5" />
                <span>x86</span>
              </label>
            </div>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="grid_info style_status style_node">
            <div class="box type_node">
              <div class="cont3">
                <div class="box type_status">
                  <div class="cont_group">
                    <div class="cont1">
                      <div class="number_wrap">
                        <p><span class="em">8</span> / 12</p>
                      </div>
                    </div>
                    <div class="cont2">
                      <div class="status_wrap">
                        <div class="value">15</div>
                        <p class="status on"><span>On</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">4</div>
                        <p class="status off"><span>Off</span></p>
                      </div>
                      <div class="status_wrap">
                        <div class="value">1</div>
                        <p class="status unknown"><span>Unknown</span></p>
                      </div>
                    </div>
                  </div>
                  <div class="hexagon_wrap">
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon off"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon off"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon"><span>ARM</span></div>
                      <div class="hexagon unknown"><span>x86</span></div>
                      <div class="hexagon"><span>x86</span></div>
                      <div class="hexagon"><span>x86</span></div>
                      <div class="hexagon"><span>x86</span></div>
                  </div>
                </div>
              </div>
              <div class="cont4">
                <div class="list_02">
                  <div class="fixed_head_scroll">
                    <div class="box-radius none-shadow">
                      <table class="tbl_list">
                        <caption>목록</caption>
                        <colgroup>
                          <col style="width: auto"  />
                          <col style="width: 15%"  />
                          <col style="width: 18%"  />
                          <col style="width: 18%"  />
                          <col style="width: 15%"  />
                        </colgroup>
                        <thead>
                          <tr>
                            <th><strong>${t(
                              'RESOURCES_BAREMETAL_NODE'
                            )}</strong></th>
                            <th><strong>CPU</strong></th>
                            <th><strong>${t('RESOURCES_MEMORY')}</strong></th>
                            <th><strong>${t('RESOURCES_DISK')}</strong></th>
                            <th><strong>${t('RESOURCES_POWER')}</strong></th>
                            <th><strong>${t(
                              'RESOURCES_TEMPERRATURE'
                            )}</strong></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="tbl_tit"><i class="ico-type24-arm on"></i>
                              <p>Arm_node_01</p>
                            </td>
                            <td>
                              <p>15%</p><span>2.0 GHz</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>141 <span class="unit">Watt</span></p>
                            </td>
                            <td>
                              <p>41 <span class="unit">°C</span></p>
                            </td>
                          </tr>
                          <tr>
                            <td class="tbl_tit"><i class="ico-type24-arm off"></i>
                              <p>Arm_node_01</p>
                            </td>
                            <td>
                              <p>15%</p><span>2.0 GHz</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>141 <span class="unit">Watt</span></p>
                            </td>
                            <td>
                              <p>41 <span class="unit">°C</span></p>
                            </td>
                          </tr>
                          <tr>
                            <td class="tbl_tit"><i class="ico-type24-arm unknown"></i>
                              <p>Arm_node_01</p>
                            </td>
                            <td>
                              <p>15%</p><span>2.0 GHz</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>141 <span class="unit">Watt</span></p>
                            </td>
                            <td>
                              <p>41 <span class="unit">°C</span></p>
                            </td>
                          </tr>
                          <tr>
                            <td class="tbl_tit"><i class="ico-type24-arm on"></i>
                              <p>Arm_node_01</p>
                            </td>
                            <td>
                              <p>15%</p><span>2.0 GHz</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>141 <span class="unit">Watt</span></p>
                            </td>
                            <td>
                              <p>41 <span class="unit">°C</span></p>
                            </td>
                          </tr>
                          <tr>
                            <td class="tbl_tit"><i class="ico-type24-arm on"></i>
                              <p>Arm_node_01</p>
                            </td>
                            <td>
                              <p>15%</p><span>2.0 GHz</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>141 <span class="unit">Watt</span></p>
                            </td>
                            <td>
                              <p>41 <span class="unit">°C</span></p>
                            </td>
                          </tr>
                          <tr>
                            <td class="tbl_tit"><i class="ico-type24-arm on"></i>
                              <p>Arm_node_01</p>
                            </td>
                            <td>
                              <p>15%</p><span>2.0 GHz</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>141 <span class="unit">Watt</span></p>
                            </td>
                            <td>
                              <p>41 <span class="unit">°C</span></p>
                            </td>
                          </tr>
                          <tr>
                            <td class="tbl_tit"><i class="ico-type24-arm on"></i>
                              <p>Arm_node_01</p>
                            </td>
                            <td>
                              <p>15%</p><span>2.0 GHz</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>25%</p><span>232 GB / 100 GB</span>
                            </td>
                            <td>
                              <p>141 <span class="unit">Watt</span></p>
                            </td>
                            <td>
                              <p>41 <span class="unit">°C</span></p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const cpuPowerPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="cpuPowerPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t(
              'RESOURCES_CPU_POWER_CONSUMPTION_ONE_TO_AVERAGE'
            )}</label>
            <div class="right">
              <div class="dash_boxtab">
                <label htmlFor="cpupower_name1">
                  <input type="radio" name="cpupower" id="cpupower_name1" value="name3" checked />
                  <span>${t('RESOURCES_LAST_TIME_HOUR')}</span>
                </label>
                <label htmlFor="cpupower_name2">
                  <input type="radio" name="cpupower" id="cpupower_name2" value="name4" />
                  <span>${t('RESOURCES_LAST_TIME_DAY')}</span>
                </label>
                <label htmlFor="cpupower_name3">
                  <input type="radio" name="cpupower" id="cpupower_name3" value="name5" />
                  <span>${t('RESOURCES_LAST_TIME_WEEKEND')}</span>
                </label>
                <label htmlFor="cpupower_name4">
                  <input type="radio" name="cpupower" id="cpupower_name4" value="name6" />
                  <span>${t('RESOURCES_LAST_TIME_MONTH')}</span>
                </label>
              </div>
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_chart_2">
                <div class="box type_chart">
                  <div class="divwrap">
                    <div class="divwrap div_left">
                      <div class="power_chart_01"></div>
                    </div>
                    <div class="divwrap div_right">
                      <div class="power_chart_02"></div>
                    </div>                
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const carbonPowerPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="carbonPowerPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_CARBON_FOOTPRINT')} - ${t(
    'RESOURCES_POWER_USAGE'
  )}</label>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_chart_2">
                <div class="box type_chart">
                  <div class="cont4">
                    <div class="bar_value">
                      <dl class="rgt">
                        <dt>ARM</dt>
                        <dd>5,000.0 kWh</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt>
                        <dd>6,000.0 kWh</dd>
                      </dl>
                    </div>
                    <div class="bar_chart">
                      <div class="graph_wrap">
                        <div class="graph_bar rgt">
                          <div class="bar animate-bar" style="width: 40%" ></div>
                        </div>
                      </div>
                      <div class="center_icon"><i class="ico-type-power"></i></div>
                      <div class="graph_wrap">
                        <div class="graph_bar">
                          <div class="bar second animate-bar" style="width: 60%" ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const carbonCo2Panel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="carbonCo2Panel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_CARBON_FOOTPRINT')} - ${t(
    'RESOURCES_CO2_EMISSIONS'
  )}</label>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_chart_2">
                <div class="box type_chart">
                  <div class="cont4">
                    <div class="bar_value">
                      <dl class="rgt">
                        <dt>ARM</dt>
                        <dd>5,000.0 KG</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt>
                        <dd>6,000.0 KG</dd>
                      </dl>
                    </div>
                    <div class="bar_chart">
                      <div class="graph_wrap">
                        <div class="graph_bar rgt">
                          <div class="bar animate-bar" style="width: 40%" ></div>
                        </div>
                      </div>
                      <div class="center_icon"><i class="ico-type-co2"></i></div>
                      <div class="graph_wrap">
                        <div class="graph_bar">
                          <div class="bar second animate-bar" style="width: 60%" ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const carbonTreePanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="carbonTreePanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_CARBON_FOOTPRINT')} - ${t(
    'RESOURCES_PINE_TREE'
  )}</label>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_chart_2">
                <div class="box type_chart">
                  <div class="cont4">
                    <div class="bar_value">
                      <dl class="rgt">
                        <dt>ARM</dt>
                        <dd>2,000 ${t('RESOURCES_TREE')}</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt>
                        <dd>3,000 ${t('RESOURCES_TREE')}</dd>
                      </dl>
                    </div>
                    <div class="bar_chart">
                      <div class="graph_wrap">
                        <div class="graph_bar rgt">
                          <div class="bar animate-bar" style="width: 40%" ></div>
                        </div>
                      </div>
                      <div class="center_icon"><i class="ico-type-tree"></i></div>
                      <div class="graph_wrap">
                        <div class="graph_bar">
                          <div class="bar second animate-bar" style="width: 60%" ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const carbonCostPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="carbonCostPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_CARBON_FOOTPRINT')} - ${t(
    'RESOURCES_COST'
  )}</label>
            <div class="right">
              <i class="ico-btn-trash"></i>
            </div>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_chart_2">
                <div class="box type_chart">
                  <div class="cont4">
                    <div class="bar_value">
                      <dl class="rgt">
                        <dt>ARM</dt>
                        <dd>2,000,000 ${t('RESOURCES_WON')}</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt>
                        <dd>3,000,000 ${t('RESOURCES_WON')}</dd>
                      </dl>
                    </div>
                    <div class="bar_chart">
                      <div class="graph_wrap">
                        <div class="graph_bar rgt">
                          <div class="bar animate-bar" style="width: 40%" ></div>
                        </div>
                      </div>
                      <div class="center_icon"><i class="ico-type-money"></i></div>
                      <div class="graph_wrap">
                        <div class="graph_bar">
                          <div class="bar second animate-bar" style="width: 60%" ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const carbonIndicatorPanel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="carbonIndicatorPanel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_CARBON_INDICATOR')} (2023.10)</label>
            <i class="ico-btn-trash"></i>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_list">
                <ul class="list_02">
                  <li class="li_type_02">
                    <div class="lft">
                      <i class="ico-type-bmcnode"></i>
                    </div>
                    <div class="rgt">
                      <div class="value">24<span>대</span></div>
                      <dl>
                        <dt>ARM</dt>
                        <dd>12</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt>
                        <dd>12</dd>
                      </dl>
                    </div>
                  </li>
                  <li class="li_type_02">
                    <div class="lft">
                      <i class="ico-type-power"></i>
                    </div>
                    <div class="rgt">
                      <div class="value">1,200.0<span>kWh</span></div>
                      <dl>
                        <dt>ARM</dt>
                        <dd>700</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt>
                        <dd>500</dd>
                      </dl>
                    </div>
                  </li>
                  <li class="li_type_02">
                    <div class="lft">
                      <i class="ico-type-co2"></i>
                    </div>
                    <div class="rgt">
                      <div class="value">0.4781<span>KG</span></div>
                      <dl>
                        <dt>ARM</dt>
                        <dd>3,000</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt>
                        <dd>2,000</dd>
                      </dl>
                    </div>
                  </li>
                  <li class="li_type_02">
                    <div class="lft">
                      <i class="ico-type-tree"></i>
                    </div>
                    <div class="rgt">
                      <div class="value">0.1157625 <span>그루</span></div>
                      <dl>
                        <dt>ARM</dt>
                        <dd>3</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt>
                        <dd>2</dd>
                      </dl>
                    </div>
                  </li>
                  <li class="li_type_02">
                    <div class="lft">
                      <i class="ico-type-money"></i>
                    </div>
                    <div class="rgt">
                      <div class="value">5,000,000<span>원</span></div>
                      <dl>
                        <dt>ARM</dt>
                        <dd>3,000,000</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt>
                        <dd>2,000,000</dd>
                      </dl>
                    </div>
                  </li>
                </ul>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}

export const powerUsageTop5Panel = ({ x, y, w, h }) => {
  const panel = `<div class="grid-stack-item" gs-x=${x} gs-y=${y} gs-w=${w} gs-h=${h} id="powerUsageTop5Panel">
      <div class="grid-stack-item-content">
        <div class="grid_item">
          <div class="grid_title">
            <label>${t('RESOURCES_POWER_USAGE_TOP_FIVE')}</label>
            <div class="dash_boxtab">
              <label htmlFor="name13">
                <input type="radio" name="box-tab5" id="name13" value="name3" checked />
                <span>${t('RESOURCES_ALL')}</span>
              </label>
              <label htmlFor="name14">
                <input type="radio" name="box-tab5" id="name14" value="name4" />
                <span>ARM</span>
              </label>
              <label htmlFor="name15">
                <input type="radio" name="box-tab5" id="name15" value="name5" />
                <span>x86</span>
              </label>
            </div>
            <i class="ico-btn-trash"></i>
          </div>
          <div class="spin-nested-loading">
            <div class="spin-container">
              <div class="grid_info style_list">
                <ul class="list_01">
                  <li class="li_type_01">
                    <div class="lft">
                      <i class="ico-type24-x86"></i>
                      <h6 class="list_title">
                        x86_hostname1
                        <span>192.168.16.87</span>
                      </h6>
                    </div>
                    <div class="info2">
                      <h6>400 kWh
                        <span>25%</span>
                      </h6>
                      <div class="graph_wrap">
                        <div class="graph_bar">
                          <div class="bar animate-bar" style="width: 25%" ></div>
                        </div>
                      </div>
                    </div>

                  </li>
                  <li class="li_type_01">
                    <div class="lft">
                      <i class="ico-type24-x86"></i>
                      <h6 class="list_title">
                        x86_hostname2
                        <span>192.168.16.87</span>
                      </h6>
                    </div>
                    <div class="info2">
                      <h6>370 kWh
                        <span>23.1%</span>
                      </h6>
                      <div class="graph_wrap">
                        <div class="graph_bar">
                          <div class="bar animate-bar" style="width: 23.1%" ></div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="li_type_01">
                    <div class="lft">
                      <i class="ico-type24-x86"></i>
                      <h6 class="list_title">
                        x86_hostname3
                        <span>192.168.16.87</span>
                      </h6>
                    </div>
                    <div class="info2">
                      <h6>320 kWh
                        <span>20%</span>
                      </h6>
                      <div class="graph_wrap">
                        <div class="graph_bar">
                          <div class="bar animate-bar" style="width: 20%" ></div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="li_type_01">
                    <div class="lft">
                      <i class="ico-type24-arm"></i>
                      <h6 class="list_title">
                        ARM_hostname1
                        <span>192.168.16.87</span>
                      </h6>
                    </div>
                    <div class="info2 warning">
                      <h6>270 kWh
                        <span>16.8%</span>
                      </h6>
                      <div class="graph_wrap">
                        <div class="graph_bar">
                          <div class="bar animate-bar" style="width: 16.8%" ></div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li class="li_type_01">
                    <div class="lft">
                      <i class="ico-type24-arm"></i>
                      <h6 class="list_title">
                        ARM_hostname2
                        <span>192.168.16.87</span>
                      </h6>
                    </div>
                    <div class="info2">
                      <h6>240 kWh
                        <span>15%</span>
                      </h6>
                      <div class="graph_wrap">
                        <div class="graph_bar">
                          <div class="bar animate-bar" style="width: 15%" ></div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`

  return panel
}
