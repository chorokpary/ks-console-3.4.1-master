import React, { useEffect, useState } from 'react'
import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css';
import './../dashboard.css'
import { inject, observer } from 'mobx-react';
import queryString from 'query-string';
import DashboardInfo from 'stores/dashboard/dashboardInfo'

import cookie from 'react-cookies';
const CustomDashboardEdit = (props) => {

  const { cluster } = props.match.params
  const { routing } = props.rootStore;

  const { search } = props.location;
  const queryObj = queryString.parse(search);

  const { idx } = queryObj;

  const [activeDashboard, setActiveDashboard] = useState(cookie.load('dashboardInfo')[idx])

  // accordion
  var accordionButtons;
  var accordionContents;
  var openAllButton;
  var closeAllButton;

  // popover preview
  var openButtons;
  var popoverContainers;
  var closeButtons;
  var addButtons;

  // switch 토글 전체 열고 닫기
  var toggleAll;
  var toggles;

  const options = {
    column: 15,
    float: false,
    disableOneColumnMode: true,
    handleClass: 'grid-stack-item-content .grid_item .grid_title',
    cellHeight: 59,
    verticalMargin: 20,
  };

  useEffect(() => {
    GridStack.init(options);

    accordionButtons = document.querySelectorAll('.accordion-btn');
    accordionContents = document.querySelectorAll('.accordion-content');
    openAllButton = document.getElementById('openAll');
    closeAllButton = document.getElementById('closeAll');

    openButtons = document.querySelectorAll(".open-popover-button");
    popoverContainers = document.querySelectorAll(".popover-container");
    closeButtons = document.querySelectorAll(".close-popover-button");
    addButtons = document.querySelectorAll(".btn_add");

    toggleAll = document.getElementById('toggle-all');
    toggles = document.querySelectorAll('.toggle');

    // 모든 아코디언 초기로 열기
    accordionButtons.forEach((button, index) => {
      button.classList.add('active');
      const content = accordionContents[index];
      content.style.maxHeight = content.scrollHeight + "px";
    });

    // 각 버튼을 클릭할 때 팝오버 열기
    openButtons.forEach(function (openButton, index) {
      openButton.addEventListener("click", function (event) {
        // 다른 팝오버 닫기
        closeAllPopovers();

        var popoverContainer = popoverContainers[index];
        var buttonRect = openButton.getBoundingClientRect();

        // 해당 팝오버를 버튼의 오른쪽에 위치
        popoverContainer.style.top = (buttonRect.top - 80) + "px";
        popoverContainer.style.left = buttonRect.right + "px";
        popoverContainer.style.display = "block";

        // 팝오버의 top 위치가 400px보다 많을 때 position을 bottom: 50px로 변경
        if (buttonRect.top > 450) {
          popoverContainer.style.top = "auto";
          popoverContainer.style.bottom = "100px";
        } else {
          popoverContainer.style.bottom = "auto";
        }

        // 팝오버가 열렸을 때 문서의 다른 부분을 클릭하면 닫히도록 이벤트 리스너 추가
        document.addEventListener("click", function closePopoverOutside(event) {
          if (!popoverContainer.contains(event.target)) {
            popoverContainer.style.display = "none";
            document.removeEventListener("click", closePopoverOutside);
          }
        });

        event.stopPropagation();
      });
    });

    toggleAll.addEventListener('change', () => {
      const toggleAllChecked = toggleAll.checked;
      toggles.forEach(toggle => {
        toggle.checked = toggleAllChecked;
      });
    });

    toggles.forEach(toggle => {
      toggle.addEventListener('change', () => {
        const allTogglesChecked = Array.from(toggles).every(t => t.checked);
        toggleAll.checked = allTogglesChecked;
      });
    });
  }, [])

  useEffect(() => {
    // 각 팝오버의 닫기 버튼을 클릭할 때 팝오버 닫기
    closeButtons.forEach(function (closeButton) {
      closeButton.addEventListener("click", function () {
        var popoverContainer = closeButton.closest(".popover-container");
        popoverContainer.style.display = "none";
      });
    });
    return () => {
      closeButtons.forEach(function (closeButton) {
        closeButton.removeEventListener("click", function () {
          var popoverContainer = closeButton.closest(".popover-container");
          popoverContainer.style.display = "none";
        });
      });
    }
  }, [])


  // 전체 열기 버튼 클릭 시 모든 아코디언 열기
  const openAll = () => {
    accordionButtons.forEach((button, index) => {
      button.classList.add('active');
      accordionContents[index].style.maxHeight = accordionContents[index].scrollHeight + "px";
    });
  }
  // 전체 닫기 버튼 클릭 시 모든 아코디언 닫기
  const closeAll = () => {
    accordionButtons.forEach((button, index) => {
      button.classList.remove('active');
      accordionContents[index].style.maxHeight = null;
    });
  }

  // 팝오버 닫기 함수
  const closeAllPopovers = () => {
    popoverContainers.forEach(function (popoverContainer) {
      popoverContainer.style.display = "none";
    });
  }

  const cancelEdit = () => {
    routing.push(`/clusters/${cluster}/overview`)
  }

  return (
    <>
      <div className="dashboard">
        <div className="dash_edit">
          <div className="content_wrap">
            <div className="dash_wrap">

              <section>
                {/* tab-content */}
                <div className="tab-content edit">
                  <div className="grid_wrap">
                    <div className="grid-stack">

                      {/* 01 */}
                      {activeDashboard.clusterNode &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.clusterNode.x}
                          gs-y={activeDashboard.clusterNode.y}
                          gs-w={activeDashboard.clusterNode.w}
                          gs-h={activeDashboard.clusterNode.h}
                        // gs-x="0"
                        // gs-y="0"
                        // gs-w="3"
                        // gs-h="4"
                        >
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>클러스터 노드</label>
                                <i className="ico-btn-trash"></i>
                              </div>
                              <div className="grid_info style_status">
                                <div className="box type_status">
                                  <div className="cont_group">
                                    <div className="cont1">
                                      <div className="number_wrap">
                                        <i className="ico-type-clusternode"><span>Master</span></i>

                                        <p><span className="em">1</span>/1</p>
                                      </div>
                                      <div className="number_wrap">
                                        <i className="ico-type-clusternode"><span>Worker</span></i>
                                        <p><span className="em">4</span>/4</p>
                                      </div>
                                    </div>
                                    <div className="cont3">
                                      <div className="status_wrap">
                                        <div className="value">4</div>
                                        <p className="status running"><span>Running</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">1</div>
                                        <p className="status warning"><span>Warning</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">0</div>
                                        <p className="status unschedulable"><span>Unschedulable</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">5</div>
                                        <p className="status total"><span>Total</span></p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 01 */}

                      {/* 01 */}
                      {activeDashboard.pod &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.pod.x}
                          gs-y={activeDashboard.pod.y}
                          gs-w={activeDashboard.pod.w}
                          gs-h={activeDashboard.pod.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>Pod</label>
                                <i className="ico-btn-trash"></i>
                              </div>
                              <div className="grid_info style_status">
                                <div className="box type_status">
                                  <div className="cont_group">
                                    <div className="cont1">
                                      <div className="number_wrap">
                                        <i className="ico-type-pod"></i>
                                        <p><span className="em">8</span> / 12</p>
                                      </div>
                                    </div>
                                    <div className="cont2">
                                      <div className="status_wrap">
                                        <div className="value">2</div>
                                        <p className="status waiting"><span>Waiting</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">8</div>
                                        <p className="status running"><span>Running</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">1</div>
                                        <p className="status completed"><span>Completed</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">1</div>
                                        <p className="status error"><span>Error</span></p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 01 */}

                      {/* 01 */}
                      {activeDashboard.vm &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.vm.x}
                          gs-y={activeDashboard.vm.y}
                          gs-w={activeDashboard.vm.w}
                          gs-h={activeDashboard.vm.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>가상머신</label>
                                <i className="ico-btn-trash"></i>
                              </div>
                              <div className="grid_info style_status">
                                <div className="box type_status">
                                  <div className="cont_group">
                                    <div className="cont1">
                                      <div className="number_wrap">
                                        <i className="ico-type-vm"></i>
                                        <p><span className="em">3</span> / 7</p>
                                      </div>
                                    </div>
                                    <div className="cont2">
                                      <div className="status_wrap">
                                        <div className="value">2</div>
                                        <p className="status waiting"><span>Progressing</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">3</div>
                                        <p className="status running"><span>Running</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">1</div>
                                        <p className="status warning"><span>Stopped</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">1</div>
                                        <p className="status error"><span>Error</span></p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 01 */}

                      {/* 01 */}
                      {activeDashboard.kaas &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.kaas.x}
                          gs-y={activeDashboard.kaas.y}
                          gs-w={activeDashboard.kaas.w}
                          gs-h={activeDashboard.kaas.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>KaaS</label>
                                <i className="ico-btn-trash"></i>
                              </div>
                              <div className="grid_info style_status">
                                <div className="box type_status">
                                  <div className="cont_group">
                                    <div className="cont1">
                                      <div className="number_wrap">
                                        <i className="ico-type-container"></i>
                                        <p><span className="em">4</span> / 9</p>
                                      </div>
                                    </div>
                                    <div className="cont2">
                                      <div className="status_wrap">
                                        <div className="value">1</div>
                                        <p className="status running"><span>Ready</span></p>
                                      </div>
                                      <div className="status_wrap">
                                        <div className="value">4</div>
                                        <p className="status waiting"><span>NotReady</span></p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 01 */}

                      {/* 02 */}
                      {activeDashboard.resourceUsage &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.resourceUsage.x}
                          gs-y={activeDashboard.resourceUsage.y}
                          gs-w={activeDashboard.resourceUsage.w}
                          gs-h={activeDashboard.resourceUsage.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>리소스 사용량</label>
                                <div className="right">
                                  <div className="dash_boxtab">
                                    <label htmlFor="name2_1">
                                      <input type="radio" name="box-tab" id="name2_1" value="name3" defaultChecked />
                                      <span>노드</span>
                                    </label>
                                    <label htmlFor="name2_2">
                                      <input type="radio" name="box-tab" id="name2_2" value="name4" />
                                      <span>Pod</span>
                                    </label>
                                    <label htmlFor="name2_3">
                                      <input type="radio" name="box-tab" id="name2_3" value="name5" />
                                      <span>가상머신</span>
                                    </label>
                                    <label htmlFor="name2_4">
                                      <input type="radio" name="box-tab" id="name2_4" value="name6" />
                                      <span>쿠버네티스</span>
                                    </label>
                                  </div>
                                  <i className="ico-btn-trash"></i>
                                </div>
                              </div>
                              <div className="grid_info style_chart">
                                <div className="box type_chart">
                                  <div className="cont1">
                                    <div className="chart_tab on">
                                      <div className="title">
                                        <i className="ico-type-cpu"></i>
                                        <h5>CPU</h5>
                                      </div>
                                      <div className="data">
                                        <div className="number_wrap">
                                          <p><span className="em">0.7</span> / 48 <span className="unit">Cores</span></p>
                                          <p>5%</p>
                                        </div>
                                        <div className="graph_wrap">
                                          <div className="graph_bar">
                                            <div className="bar animate-bar" style={{ width: "5%" }}></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="chart_tab">
                                      <div className="title">
                                        <i className="ico-type-memory"></i>
                                        <h5>메모리</h5>
                                      </div>
                                      <div className="data">
                                        <div className="number_wrap">
                                          <p><span className="em">9.66</span> / 21 <span className="unit">Gi</span></p>
                                          <p>25%</p>
                                        </div>

                                        <div className="graph_wrap">
                                          <div className="graph_bar">
                                            <div className="bar animate-bar" style={{ width: "25%" }}></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="chart_tab">
                                      <div className="title">
                                        <i className="ico-type-disk"></i>
                                        <h5>디스크</h5>
                                      </div>
                                      <div className="data">
                                        <div className="number_wrap">
                                          <p><span className="em">85.64</span> / 318.21 <span className="unit">GB</span></p>
                                          <p>15%</p>
                                        </div>
                                        <div className="graph_wrap">
                                          <div className="graph_bar">
                                            <div className="bar animate-bar" style={{ width: "15%" }}></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="cont2">
                                    <div className="chart_01"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 02 */}

                      {/* 02 */}
                      {activeDashboard.networkTraffic &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.networkTraffic.x}
                          gs-y={activeDashboard.networkTraffic.y}
                          gs-w={activeDashboard.networkTraffic.w}
                          gs-h={activeDashboard.networkTraffic.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>네트워크 트래픽</label>
                                <div className="right">
                                  <div className="dash_boxtab">
                                    <label htmlFor="name3">
                                      <input type="radio" name="box-tab1" id="name3" value="name3" defaultChecked />
                                      <span>노드</span>
                                    </label>
                                    <label htmlFor="name4">
                                      <input type="radio" name="box-tab1" id="name4" value="name4" />
                                      <span>Pod</span>
                                    </label>
                                    <label htmlFor="name5">
                                      <input type="radio" name="box-tab1" id="name5" value="name5" />
                                      <span>가상머신</span>
                                    </label>
                                    <label htmlFor="name6">
                                      <input type="radio" name="box-tab1" id="name6" value="name6" />
                                      <span>쿠버네티스</span>
                                    </label>
                                  </div>
                                  <i className="ico-btn-trash"></i>
                                </div>
                              </div>
                              <div className="grid_info style_chart">
                                <div className="box type_chart">
                                  <div className="cont1">
                                    <div className="chart_tab no-tab">
                                      <div className="title">
                                        <i className="ico-type-outbound"></i>
                                        <h5>Outbound</h5>
                                      </div>
                                      <div className="data">
                                        <div className="number_wrap data-r">
                                          <p><span className="em">2.26</span> <span className="unit">Mbps</span></p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="chart_tab no-tab">
                                      <div className="title">
                                        <i className="ico-type-inbound"></i>
                                        <h5>Inbound</h5>
                                      </div>
                                      <div className="data">
                                        <div className="number_wrap data-r">
                                          <p><span className="em">1.51</span> <span className="unit">Mbps</span></p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="chart_tab no-tab">
                                      <div className="title">
                                        <i className="ico-type-network"></i>
                                        <h5>전체</h5>
                                      </div>
                                      <div className="data">
                                        <div className="number_wrap data-r">
                                          <p><span className="em">3.77</span> <span className="unit">Mbps</span></p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="cont2">
                                    <div className="chart_02"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 02 */}


                      {/* 03 */}
                      {activeDashboard.usageTop5 &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.usageTop5.x}
                          gs-y={activeDashboard.usageTop5.y}
                          gs-w={activeDashboard.usageTop5.w}
                          gs-h={activeDashboard.usageTop5.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>리소스 사용량 Top 5</label>
                                <i className="ico-btn-trash"></i>
                              </div>
                              <div className="grid_info style_list">
                                <div className="select_wrap">
                                  <div className="d-flex align-start w-100">
                                    <div className="content-box" style={{ width: "60%" }}>
                                      <div className="select-list-box">
                                        <div className="selected-item single">
                                          <p>
                                            <strong>CPU 사용량</strong>
                                          </p>
                                        </div>

                                        <ul className="select-list scroll-gray">
                                          <li className="selected">
                                            <p>
                                              <strong>CPU 사용량</strong>
                                            </p>
                                          </li>
                                          <li>
                                            <p>
                                              <strong>메모리 사용량</strong>
                                            </p>
                                          </li>
                                          <li>
                                            <p>
                                              <strong>디스크 사용량</strong>
                                            </p>
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                    <div className="content-box" style={{ width: "38%" }}>
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
                                              <strong>쿠버네티스</strong>
                                            </p>
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* // select_wrap */}
                                <ul className="list_01">
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-clusternode"></i>
                                      <h6 className="list_title">
                                        Worker01
                                        <span>192.168.16.87</span>
                                      </h6>
                                    </div>
                                    <div className="info">
                                      <h6>2%
                                        <span>CPU 사용량</span>
                                      </h6>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-clusternode"></i>
                                      <h6 className="list_title">
                                        Worker02
                                        <span>192.168.16.87</span>
                                      </h6>
                                    </div>
                                    <div className="info">
                                      <h6>2%
                                        <span>CPU 사용량</span>
                                      </h6>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-clusternode"></i>
                                      <h6 className="list_title">
                                        Worker03
                                        <span>192.168.16.87</span>
                                      </h6>
                                    </div>
                                    <div className="info">
                                      <h6>2%
                                        <span>CPU 사용량</span>
                                      </h6>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-clusternode"></i>
                                      <h6 className="list_title">
                                        Master01
                                        <span>192.168.16.87</span>
                                      </h6>
                                    </div>
                                    <div className="info warning">
                                      <h6>80%
                                        <span>CPU 사용량</span>
                                      </h6>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-clusternode"></i>
                                      <h6 className="list_title">
                                        Worker04
                                        <span>192.168.16.87</span>
                                      </h6>
                                    </div>
                                    <div className="info">
                                      <h6>2%
                                        <span>CPU 사용량</span>
                                      </h6>
                                    </div>
                                  </li>
                                </ul>

                                {/* <div className="grid_text">
                   <span>데이터가 없습니다.</span>
                  </div> */}
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 03 */}

                      {/* 03 */}
                      {activeDashboard.recentResource &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.recentResource.x}
                          gs-y={activeDashboard.recentResource.y}
                          gs-w={activeDashboard.recentResource.w}
                          gs-h={activeDashboard.recentResource.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>최근 생성된 리소스 (일주일)</label>
                                <i className="ico-btn-trash"></i>
                              </div>
                              <div className="grid_info style_list">
                                {/* // select_wrap */}
                                <ul className="list_01">
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-clusternode"></i>
                                      <h6 className="list_title">
                                        Worker01
                                        <span>2023-08-23</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_node">노드</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-pod"></i>
                                      <h6 className="list_title">
                                        Worker01
                                        <span>2023-08-22</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_pod">Pod</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-container"></i>
                                      <h6 className="list_title">
                                        Worker01
                                        <span>2023-08-21</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_container">쿠버네티스</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-vm"></i>
                                      <h6 className="list_title">
                                        Worker01
                                        <span>2023-08-20</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_vm">가상머신</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-vm"></i>
                                      <h6 className="list_title">
                                        Worker01
                                        <span>2023-08-20</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_vm">가상머신</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-type24-vm"></i>
                                      <h6 className="list_title">
                                        Worker01
                                        <span>2023-08-20</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_vm">가상머신</span>
                                    </div>
                                  </li>
                                </ul>

                                {/* <div className="grid_text">
                   <span>데이터가 없습니다.</span>
                  </div> */}
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 03 */}

                      {/* 03 */}
                      {activeDashboard.issue &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.issue.x}
                          gs-y={activeDashboard.issue.y}
                          gs-w={activeDashboard.issue.w}
                          gs-h={activeDashboard.issue.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>이슈</label>
                                <i className="ico-btn-trash"></i>
                              </div>
                              <div className="grid_info style_list">
                                {/* // select_wrap */}
                                <ul className="list_01">
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-info-warning"></i>
                                      <h6 className="list_title">
                                        worker02 노드의 사용량을 추가하십시오.
                                        <span>2023-08-23</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_node">노드</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-info-warning"></i>
                                      <h6 className="list_title">
                                        1개의 노드가 새로운 Pod를 예약할 수 없습니다.
                                        <span>2023-08-23</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_pod">Pod</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-info-warning"></i>
                                      <h6 className="list_title">
                                        abcnavme이 설치 종료되었습니다.
                                        <span>2023-08-21</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_container">쿠버네티스</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-info-warning-2"></i>
                                      <h6 className="list_title">
                                        pod_avme이 준비 상태입니다.
                                        <span>2023-08-20</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_vm">가상머신</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-info-warning"></i>
                                      <h6 className="list_title">
                                        worker02 노드의 메모리 사용량을 추가하십시오.
                                        <span>2023-08-16</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_vm">가상머신</span>
                                    </div>
                                  </li>
                                  <li className="li_type_01">
                                    <div className="lft">
                                      <i className="ico-info-warning"></i>
                                      <h6 className="list_title">
                                        worker02 노드의 사용량을 추가하십시오.
                                        <span>2023-08-14</span>
                                      </h6>
                                    </div>
                                    <div className="type">
                                      <span className="type_vm">가상머신</span>
                                    </div>
                                  </li>
                                </ul>

                                {/* <div className="grid_text">
                   <span>데이터가 없습니다.</span>
                  </div> */}
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 03 */}

                      {/* 04 */}
                      {activeDashboard.computingNetwork &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.computingNetwork.x}
                          gs-y={activeDashboard.computingNetwork.y}
                          gs-w={activeDashboard.computingNetwork.w}
                          gs-h={activeDashboard.computingNetwork.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>컴퓨팅 네트워크 현황</label>
                                <div className="right">
                                  <i className="ico-btn-trash"></i>
                                </div>
                              </div>
                              <div className="spin-nested-loading">
                                <div className="spin-container">
                                  <div className="grid_info style_status box_nth">

                                    <div className="box type_status">
                                      <h5><i className="ico-type24-loadbalancer"></i>로드밸런서</h5>
                                      <div className="cont_group">
                                        <div className="cont1">
                                          <div className="number_wrap">
                                            <p><span className="em">4</span> / 5</p>
                                          </div>
                                        </div>
                                        <div className="cont2">
                                          <div className="status_wrap">
                                            <div className="value">4</div>
                                            <p className="status used"><span>Used</span></p>
                                          </div>
                                          <div className="status_wrap">
                                            <div className="value">1</div>
                                            <p className="status unused"><span>Unused</span></p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="box type_status">
                                      <h5><i className="ico-type24-floatingip"></i>플로팅 IP</h5>
                                      <div className="cont_group">
                                        <div className="cont1">
                                          <div className="number_wrap">
                                            <p><span className="em">2</span> / 3</p>
                                          </div>
                                        </div>
                                        <div className="cont2">
                                          <div className="status_wrap">
                                            <div className="value">2</div>
                                            <p className="status used"><span>Used</span></p>
                                          </div>
                                          <div className="status_wrap">
                                            <div className="value">1</div>
                                            <p className="status unused"><span>Unused</span></p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="box type_status">
                                      <h5><i className="ico-type24-security"></i>보안그룹</h5>
                                      <div className="cont_group">
                                        <div className="cont1">
                                          <div className="number_wrap">
                                            <p><span className="em">2</span> / 3</p>
                                          </div>
                                        </div>
                                        <div className="cont2">
                                          <div className="status_wrap">
                                            <div className="value">2</div>
                                            <p className="status used"><span>Used</span></p>
                                          </div>
                                          <div className="status_wrap">
                                            <div className="value">1</div>
                                            <p className="status unused"><span>Unused</span></p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="box type_status">
                                      <h5><i className="ico-type24-router"></i>가상라우터</h5>
                                      <div className="cont_group">
                                        <div className="cont1">
                                          <div className="number_wrap">
                                            <p><span className="em">8</span></p>
                                          </div>
                                        </div>
                                        <div className="cont2">
                                          <div className="status_wrap">
                                            <div className="value">7</div>
                                            <p className="status internal"><span>Internal</span></p>
                                          </div>
                                          <div className="status_wrap">
                                            <div className="value">1</div>
                                            <p className="status external"><span>External</span></p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="box type_status">
                                      <h5><i className="ico-type24-network"></i>네트워크</h5>
                                      <div className="cont_group">
                                        <div className="cont1">
                                          <div className="number_wrap">
                                            <p><span className="em">5</span></p>
                                          </div>
                                        </div>
                                        <div className="cont2">
                                          <div className="status_wrap">
                                            <div className="value">4</div>
                                            <p className="status internal"><span>Internal</span></p>
                                          </div>
                                          <div className="status_wrap">
                                            <div className="value">1</div>
                                            <p className="status external"><span>External</span></p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="box type_status">
                                      <h5><i className="ico-type24-soriv"></i>SR-IOV 네트워크</h5>
                                      <div className="cont_group">
                                        <div className="cont1">
                                          <div className="number_wrap">
                                            <p><span className="em">8</span></p>
                                          </div>
                                        </div>
                                        <div className="cont2">
                                          <div className="status_wrap">
                                            <div className="value">7</div>
                                            <p className="status internal"><span>Internal</span></p>
                                          </div>
                                          <div className="status_wrap">
                                            <div className="value">1</div>
                                            <p className="status external"><span>External</span></p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                  </div>
                                </div>
                              </div>
                              {/*// grid_info style_status */}


                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 04 */}
                      {activeDashboard.computingTemplate &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.computingTemplate.x}
                          gs-y={activeDashboard.computingTemplate.y}
                          gs-w={activeDashboard.computingTemplate.w}
                          gs-h={activeDashboard.computingTemplate.h}>
                          <div className="grid-stack-item-content">
                            <div className="grid-stack-item-content">
                              <div className="grid_item">
                                <div className="grid_title">
                                  <label>컴퓨팅 템플릿 현황</label>
                                  <div className="right">
                                    <i className="ico-btn-trash"></i>
                                  </div>
                                </div>
                                <div className="spin-nested-loading">
                                  <div className="spin-container">
                                    <div className="grid_info style_status box_nth">

                                      <div className="box type_status">
                                        <h5><i className="ico-type24-mediatedvgpu"></i>Mediated 디바이스</h5>
                                        <div className="cont_group">
                                          <div className="cont1">
                                            <div className="number_wrap">
                                              <p><span className="em">4</span> / 5</p>
                                            </div>
                                          </div>
                                          <div className="cont2">
                                            <div className="status_wrap">
                                              <div className="value">4</div>
                                              <p className="status used"><span>Used</span></p>
                                            </div>
                                            <div className="status_wrap">
                                              <div className="value">1</div>
                                              <p className="status unused"><span>Unused</span></p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="box type_status">
                                        <h5><i className="ico-type24-hostdevice"></i>Host 디바이스</h5>
                                        <div className="cont_group">
                                          <div className="cont1">
                                            <div className="number_wrap">
                                              <p><span className="em">2</span> / 3</p>
                                            </div>
                                          </div>
                                          <div className="cont2">
                                            <div className="status_wrap">
                                              <div className="value">2</div>
                                              <p className="status used"><span>Used</span></p>
                                            </div>
                                            <div className="status_wrap">
                                              <div className="value">1</div>
                                              <p className="status unused"><span>Unused</span></p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="box type_status">
                                        <h5><i className="ico-type24-image"></i>이미지</h5>
                                        <div className="cont_group">
                                          <div className="cont1">
                                            <div className="number_wrap">
                                              <p><span className="em">2</span> / 3</p>
                                            </div>
                                          </div>
                                          <div className="cont2">
                                            <div className="status_wrap">
                                              <div className="value">2</div>
                                              <p className="status used"><span>Used</span></p>
                                            </div>
                                            <div className="status_wrap">
                                              <div className="value">1</div>
                                              <p className="status unused"><span>Unused</span></p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="box type_status">
                                        <h5><i className="ico-type24-keypair"></i>키페어</h5>
                                        <div className="cont_group">
                                          <div className="cont1">
                                            <div className="number_wrap">
                                              <p><span className="em">4</span> / 7</p>
                                            </div>
                                          </div>
                                          <div className="cont2">
                                            <div className="status_wrap">
                                              <div className="value">7</div>
                                              <p className="status used"><span>Used</span></p>
                                            </div>
                                            <div className="status_wrap">
                                              <div className="value">1</div>
                                              <p className="status unused"><span>Unused</span></p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="box type_status">
                                        <h5><i className="ico-type24-flavor"></i>Flavor</h5>
                                        <div className="cont_group">
                                          <div className="cont1">
                                            <div className="number_wrap">
                                              <p><span className="em">4</span> / 5</p>
                                            </div>
                                          </div>
                                          <div className="cont2">
                                            <div className="status_wrap">
                                              <div className="value">4</div>
                                              <p className="status used"><span>Used</span></p>
                                            </div>
                                            <div className="status_wrap">
                                              <div className="value">1</div>
                                              <p className="status unused"><span>Unused</span></p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="box type_status">
                                        <h5><i className="ico-type24-kaasimage"></i>KaaS 이미지</h5>
                                        <div className="cont_group">
                                          <div className="cont1">
                                            <div className="number_wrap">
                                              <p><span className="em">7</span> / 8</p>
                                            </div>
                                          </div>
                                          <div className="cont2">
                                            <div className="status_wrap">
                                              <div className="value">7</div>
                                              <p className="status used"><span>Used</span></p>
                                            </div>
                                            <div className="status_wrap">
                                              <div className="value">1</div>
                                              <p className="status unused"><span>Unused</span></p>
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
                        </div>
                      }

                      {/* 05 */}
                      {activeDashboard.resourceChange &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.resourceChange.x}
                          gs-y={activeDashboard.resourceChange.y}
                          gs-w={activeDashboard.resourceChange.w}
                          gs-h={activeDashboard.resourceChange.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>리소스 변화량</label>
                                <div className="right">
                                  <i className="ico-btn-trash"></i>
                                </div>
                              </div>
                              <div className="grid_info style_status box_long">
                                <div className="box type_status">
                                  <div className="cont_group">
                                    <h5><i className="ico-type-pod"></i>Pod</h5>
                                    <div className="number_wrap">
                                      <p><span className="em">12</span></p>
                                    </div>
                                    {/* <div className="cont2">
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p><span>Created</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">0</div>
                                      <p><span>Deleted</span></p>
                                    </div>
                                  </div> */}
                                    <div className="chart chart_03">
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/*// grid_info style_status */}
                              <div className="grid_info style_status box_long">
                                <div className="box type_status">
                                  <div className="cont_group">
                                    <h5><i className="ico-type-vm"></i>가상머신</h5>
                                    <div className="number_wrap">
                                      <p><span className="em">7</span></p>
                                    </div>
                                    <div className="chart chart_03">
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/*// grid_info style_status */}
                              <div className="grid_info style_status box_long">
                                <div className="box type_status">
                                  <div className="cont_group">
                                    <h5><i className="ico-type-container"></i>쿠버네티스</h5>
                                    <div className="number_wrap">
                                      <p><span className="em">1</span></p>
                                    </div>
                                    <div className="chart chart_03">
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/*// grid_info style_status */}
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 05 */}

                      {/* 04 */}
                      {activeDashboard.clusterStatus &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.clusterStatus.x}
                          gs-y={activeDashboard.clusterStatus.y}
                          gs-w={activeDashboard.clusterStatus.w}
                          gs-h={activeDashboard.clusterStatus.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>쿠버네티스 컴포넌트 상태</label>
                                <div className="right">
                                  <i className="ico-btn-trash"></i>
                                </div>
                              </div>
                              <div className="grid_info style_status box_nth_wrap">
                                <div className="box type_component selected">
                                  <h5><i className="ico-type-kubernetes-component"></i>Kubeproxy</h5>
                                  <div className="status_box">
                                    <p className="status_active">3</p>
                                    <p className="status_inactive">0</p>
                                    {/* <p className="status_error">1</p> */}
                                  </div>
                                  <div className="box_pop">
                                    <h6>Kubeproxy</h6>
                                    <div className="status_wrap">
                                      <p className="status active"><span>Worker1</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <p className="status inactive"><span>Worker2</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <p className="status error"><span>Master</span></p>
                                    </div>
                                  </div>
                                </div>
                                <div className="box type_component">
                                  <h5><i className="ico-type-kubernetes-component"></i>coreDNS</h5>
                                  <div className="status_box">
                                    <p className="status_active">3</p>
                                    <p className="status_inactive">0</p>
                                    {/* <p className="status_error">1</p> */}
                                  </div>
                                </div>
                                <div className="box type_component">
                                  <h5><i className="ico-type-kubernetes-component"></i>Kubelet</h5>
                                  <div className="status_box">
                                    <p className="status_active">3</p>
                                    <p className="status_inactive">0</p>
                                    {/* <p className="status_error">1</p> */}
                                  </div>
                                </div>
                                <div className="box type_component">
                                  <h5><i className="ico-type-kubernetes-component"></i>kube-scheduler</h5>
                                  <div className="status_box">
                                    <p className="status_active">3</p>
                                    <p className="status_inactive">0</p>
                                    {/* <p className="status_error">1</p> */}
                                  </div>
                                </div>
                                <div className="box type_component">
                                  <h5><i className="ico-type-kubernetes-component"></i>kube-scheduler</h5>
                                  <div className="status_box">
                                    <p className="status_active">3</p>
                                    <p className="status_inactive">0</p>
                                    {/* <p className="status_error">1</p> */}
                                  </div>
                                </div>
                                <div className="box type_component">
                                  <h5><i className="ico-type-kubernetes-component"></i>kube-controller-manager</h5>
                                  <div className="status_box">
                                    <p className="status_active">3</p>
                                    <p className="status_inactive">0</p>
                                    {/* <p className="status_error">1</p> */}
                                  </div>
                                </div>
                              </div>
                              {/*// grid_info style_status */}

                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 04 */}

                      {/* 06 */}
                      {activeDashboard.bmcNode &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.bmcNode.x}
                          gs-y={activeDashboard.bmcNode.y}
                          gs-w={activeDashboard.bmcNode.w}
                          gs-h={activeDashboard.bmcNode.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>베어메탈 노드 현황</label>
                                <div className="view-result">총 99건</div>
                                <div className="dash_boxtab">
                                  <label htmlFor="name9">
                                    <input type="radio" name="box-tab2" id="name9" value="name3" defaultChecked />
                                    <span>전체</span>
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
                                <div className="right">
                                  <i className="ico-btn-trash"></i>
                                </div>
                              </div>
                              <div className="grid_info style_status style_node">
                                <div className="box type_node">
                                  <div className="cont3">
                                    <div className="box type_status">
                                      <div className="cont_group">
                                        <div className="cont1">
                                          <div className="number_wrap">
                                            <p><span className="em">13</span> / 18</p>
                                          </div>
                                        </div>
                                        <div className="cont2">
                                          <div className="status_wrap">
                                            <div className="value">13</div>
                                            <p className="status on"><span>On</span></p>
                                          </div>
                                          <div className="status_wrap">
                                            <div className="value">4</div>
                                            <p className="status off"><span>Off</span></p>
                                          </div>
                                          <div className="status_wrap">
                                            <div className="value">1</div>
                                            <p className="status error"><span>Error</span></p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="hexagon_wrap">
                                        <div className="hexagon_group">
                                          <div className="hexagon"><span>ARM</span></div>
                                          <div className="hexagon"><span>ARM</span></div>
                                          <div className="hexagon"><span>ARM</span></div>
                                          <div className="hexagon off"><span>ARM</span></div>
                                          <div className="hexagon"><span>ARM</span></div>
                                          <div className="hexagon off"><span>ARM</span></div>
                                          <div className="hexagon"><span>ARM</span></div>
                                          <div className="hexagon"><span>ARM</span></div>
                                        </div>
                                        <div className="hexagon_group">
                                          <div className="hexagon"><span>ARM</span></div>
                                          <div className="hexagon"><span>ARM</span></div>
                                          <div className="hexagon"><span>ARM</span></div>
                                          <div className="hexagon off"><span>ARM</span></div>
                                          <div className="hexagon"><span>ARM</span></div>
                                          <div className="hexagon"><span>ARM</span></div>
                                        </div>
                                        <div className="hexagon_group">
                                          <div className="hexagon"><span>x86</span></div>
                                          <div className="hexagon off"><span>x86</span></div>
                                          <div className="hexagon"><span>x86</span></div>
                                          <div className="hexagon error"><span>x86</span></div>
                                        </div>
                                      </div>
                                      {/* // hexagon_wrap */}
                                    </div>
                                    {/* // box type_node */}
                                  </div>
                                  {/* // cont3 */}
                                  <div className="cont4">
                                    <div className="list_02">
                                      <div className="fixed_head_scroll">
                                        <div className="box-radius none-shadow">
                                          <table className="tbl_list">
                                            <caption>네트워크 목록</caption>
                                            <colgroup>
                                              <col style={{ width: "auto" }} />
                                              <col style={{ width: "15%" }} />
                                              <col style={{ width: "18%" }} />
                                              <col style={{ width: "18%" }} />
                                              <col style={{ width: "15%" }} />
                                            </colgroup>
                                            <thead>
                                              <tr>
                                                <th><strong>베어메탈 노드</strong></th>
                                                <th><strong>CPU</strong></th>
                                                <th><strong>메모리</strong></th>
                                                <th><strong>디스크</strong></th>
                                                <th><strong>파워</strong></th>
                                                <th><strong>온도</strong></th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {/* 데이터 모두 사용시 */}
                                              {/*                                     <tr>
                                      <td colspan="6" className="msg-text">
                                          <p>데이터가 없습니다.</p>
                                      </td>
                                    </tr> */}
                                              {/* 데이터 모두 사용시 */}
                                              <tr>
                                                <td className="tbl_tit">
                                                  <i className="ico-type24-arm"></i>
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
                                                  <p>141 <span className="unit">Watt</span></p>
                                                </td>
                                                <td>
                                                  <p>41 <span className="unit">°C</span></p>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td className="tbl_tit">
                                                  <i className="ico-type24-arm"></i>
                                                  <p>Arm_node_02</p>
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
                                                  <p>141 <span className="unit">Watt</span></p>
                                                </td>
                                                <td>
                                                  <p>41 <span className="unit">°C</span></p>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td className="tbl_tit">
                                                  <i className="ico-type24-arm"></i>
                                                  <p>Arm_node_03</p>
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
                                                  <p>141 <span className="unit">Watt</span></p>
                                                </td>
                                                <td>
                                                  <p>41 <span className="unit">°C</span></p>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td className="tbl_tit">
                                                  <i className="ico-type24-arm"></i>
                                                  <p>Arm_node_04</p>
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
                                                  <p>141 <span className="unit">Watt</span></p>
                                                </td>
                                                <td>
                                                  <p>41 <span className="unit">°C</span></p>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td className="tbl_tit">
                                                  <i className="ico-type24-arm"></i>
                                                  <p>Arm_node_05</p>
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
                                                  <p>141 <span className="unit">Watt</span></p>
                                                </td>
                                                <td>
                                                  <p>41 <span className="unit">°C</span></p>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td className="tbl_tit">
                                                  <i className="ico-type24-arm"></i>
                                                  <p>Arm_node_06</p>
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
                                                  <p>141 <span className="unit">Watt</span></p>
                                                </td>
                                                <td>
                                                  <p>41 <span className="unit">°C</span></p>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td className="tbl_tit">
                                                  <i className="ico-type24-arm"></i>
                                                  <p>Arm_node_07</p>
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
                                                  <p>141 <span className="unit">Watt</span></p>
                                                </td>
                                                <td>
                                                  <p>41 <span className="unit">°C</span></p>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>

                                    </div>
                                  </div>
                                </div>
                                {/* // box type_node */}

                              </div>
                              {/* // grid-info */}

                            </div>
                          </div>
                        </div>
                      }
                      {/* // grid_item */}


                      {/* 02 */}
                      {activeDashboard.cpuPower &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.cpuPower.x}
                          gs-y={activeDashboard.cpuPower.y}
                          gs-w={activeDashboard.cpuPower.w}
                          gs-h={activeDashboard.cpuPower.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>CPU 소비 전력량 비교 (1대 평균)</label>
                                <div className="right">
                                  <div className="dash_boxtab">
                                    <label htmlFor="cpupower_name1">
                                      <input type="radio" name="cpupower" id="cpupower_name1" value="name3" defaultChecked />
                                      <span>최근 1시간</span>
                                    </label>
                                    <label htmlFor="cpupower_name2">
                                      <input type="radio" name="cpupower" id="cpupower_name2" value="name4" />
                                      <span>최근 1일</span>
                                    </label>
                                    <label htmlFor="cpupower_name3">
                                      <input type="radio" name="cpupower" id="cpupower_name3" value="name5" />
                                      <span>최근 1주일</span>
                                    </label>
                                    <label htmlFor="cpupower_name4">
                                      <input type="radio" name="cpupower" id="cpupower_name4" value="name6" />
                                      <span>최근 1달</span>
                                    </label>
                                  </div>
                                  {/*<i className="ico-btn-trash"></i>*/}
                                </div>
                              </div>
                              <div className="spin-nested-loading">
                                <div className="spin-container">
                                  <div className="grid_info style_chart_2">
                                    <div className="box type_chart">
                                      <div className="cont1">
                                        <div className="chart_tab no-tab">
                                          <div className="chart_group">
                                            <div className="title">
                                              <i className="ico-type24-arm"></i>
                                              <h5>ARM</h5>
                                            </div>
                                            <div className="data">
                                              <div className="number_wrap data-r">
                                                <p><i className="ico-type24-powericon"></i> <span className="em">141</span> <span
                                                  className="unit">W</span></p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar animate-bar" style={{ width: "30%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="chart_tab no-tab">
                                          <div className="chart_group">
                                            <div className="title">
                                              <i className="ico-type24-x86"></i>
                                              <h5>x86</h5>
                                            </div>
                                            <div className="data">
                                              <div className="number_wrap data-r">
                                                <p><i className="ico-type24-powericon"></i> <span className="em">160</span> <span
                                                  className="unit">W</span></p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar second animate-bar" style={{ width: "40%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="cont2">
                                        <div className="chart_04"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 02 */}

                      {/* 08 */}
                      {activeDashboard.carbonPower &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.carbonPower.x}
                          gs-y={activeDashboard.carbonPower.y}
                          gs-w={activeDashboard.carbonPower.w}
                          gs-h={activeDashboard.carbonPower.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>탄소 발자국 - 전력 사용량</label>
                              </div>
                              <div className="spin-nested-loading">
                                <div className="spin-container">
                                  <div className="grid_info style_chart_2">
                                    <div className="box type_chart">
                                      <div className="cont4">
                                        <div className="bar_value">
                                          <dl className="rgt">
                                            <dt>ARM</dt>
                                            <dd>5,000.0 kWh</dd>
                                          </dl>
                                          <dl>
                                            <dt>x86</dt>
                                            <dd>6,000.0 kWh</dd>
                                          </dl>
                                        </div>
                                        <div className="bar_chart">
                                          <div className="graph_wrap">
                                            <div className="graph_bar rgt">
                                              <div className="bar animate-bar" style={{ width: "40%" }}></div>
                                            </div>
                                          </div>
                                          <div className="center_icon"><i className="ico-type-power"></i></div>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar second animate-bar" style={{ width: "60%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 08 */}

                      {/* 08 */}
                      {activeDashboard.carbonCo2 &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.carbonCo2.x}
                          gs-y={activeDashboard.carbonCo2.y}
                          gs-w={activeDashboard.carbonCo2.w}
                          gs-h={activeDashboard.carbonCo2.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>탄소 발자국 - CO2 발생량</label>
                              </div>
                              <div className="spin-nested-loading">
                                <div className="spin-container">
                                  <div className="grid_info style_chart_2">
                                    <div className="box type_chart">
                                      <div className="cont4">
                                        <div className="bar_value">
                                          <dl className="rgt">
                                            <dt>ARM</dt>
                                            <dd>5,000.0 KG</dd>
                                          </dl>
                                          <dl>
                                            <dt>x86</dt>
                                            <dd>6,000.0 KG</dd>
                                          </dl>
                                        </div>
                                        <div className="bar_chart">
                                          <div className="graph_wrap">
                                            <div className="graph_bar rgt">
                                              <div className="bar animate-bar" style={{ width: "40%" }}></div>
                                            </div>
                                          </div>
                                          <div className="center_icon"><i className="ico-type-co2"></i></div>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar second animate-bar" style={{ width: "60%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 08 */}

                      {/* 08 */}
                      {activeDashboard.carbonTree &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.carbonTree.x}
                          gs-y={activeDashboard.carbonTree.y}
                          gs-w={activeDashboard.carbonTree.w}
                          gs-h={activeDashboard.carbonTree.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>탄소 발자국 - 나무</label>
                              </div>
                              <div className="spin-nested-loading">
                                <div className="spin-container">
                                  <div className="grid_info style_chart_2">
                                    <div className="box type_chart">
                                      <div className="cont4">
                                        <div className="bar_value">
                                          <dl className="rgt">
                                            <dt>ARM</dt>
                                            <dd>2,000 그루</dd>
                                          </dl>
                                          <dl>
                                            <dt>x86</dt>
                                            <dd>3,000 그루</dd>
                                          </dl>
                                        </div>
                                        <div className="bar_chart">
                                          <div className="graph_wrap">
                                            <div className="graph_bar rgt">
                                              <div className="bar animate-bar" style={{ width: "40%" }}></div>
                                            </div>
                                          </div>
                                          <div className="center_icon"><i className="ico-type-tree"></i></div>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar second animate-bar" style={{ width: "60%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 08 */}

                      {/* 08 */}
                      {activeDashboard.carbonCost &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.carbonCost.x}
                          gs-y={activeDashboard.carbonCost.y}
                          gs-w={activeDashboard.carbonCost.w}
                          gs-h={activeDashboard.carbonCost.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>탄소 발자국 - 비용</label>
                              </div>
                              <div className="spin-nested-loading">
                                <div className="spin-container">
                                  <div className="grid_info style_chart_2">
                                    <div className="box type_chart">
                                      <div className="cont4">
                                        <div className="bar_value">
                                          <dl className="rgt">
                                            <dt>ARM</dt>
                                            <dd>2,000,000 원</dd>
                                          </dl>
                                          <dl>
                                            <dt>x86</dt>
                                            <dd>3,000,000 원</dd>
                                          </dl>
                                        </div>
                                        <div className="bar_chart">
                                          <div className="graph_wrap">
                                            <div className="graph_bar rgt">
                                              <div className="bar animate-bar" style={{ width: "40%" }}></div>
                                            </div>
                                          </div>
                                          <div className="center_icon"><i className="ico-type-money"></i></div>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar second animate-bar" style={{ width: "60%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 08 */}

                      {/* 03 */}
                      {activeDashboard.carbonIndicator &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.carbonIndicator.x}
                          gs-y={activeDashboard.carbonIndicator.y}
                          gs-w={activeDashboard.carbonIndicator.w}
                          gs-h={activeDashboard.carbonIndicator.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>탄소 지표 (2023.10)</label>
                                {/*<i className="ico-btn-trash"></i>*/}
                              </div>
                              <div className="spin-nested-loading">
                                <div className="spin-container">
                                  <div className="grid_info style_list">
                                    {/* // select_wrap */}
                                    <ul className="list_02">
                                      <li className="li_type_02">
                                        <div className="lft">
                                          <i className="ico-type-bmcnode"></i>
                                        </div>
                                        <div className="rgt">
                                          <div className="value">24<span>대</span></div>
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
                                      <li className="li_type_02">
                                        <div className="lft">
                                          <i className="ico-type-power"></i>
                                        </div>
                                        <div className="rgt">
                                          <div className="value">1,200.0<span>kWh</span></div>
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
                                      <li className="li_type_02">
                                        <div className="lft">
                                          <i className="ico-type-co2"></i>
                                        </div>
                                        <div className="rgt">
                                          <div className="value">0.4781<span>KG</span></div>
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
                                      <li className="li_type_02">
                                        <div className="lft">
                                          <i className="ico-type-tree"></i>
                                        </div>
                                        <div className="rgt">
                                          <div className="value">0.1157625 <span>그루</span></div>
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
                                      <li className="li_type_02">
                                        <div className="lft">
                                          <i className="ico-type-money"></i>
                                        </div>
                                        <div className="rgt">
                                          <div className="value">5,000,000<span>원</span></div>
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
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 03 */}

                      {/* 03 */}
                      {activeDashboard.powerUsageTop5 &&
                        <div className="grid-stack-item"
                          gs-x={activeDashboard.powerUsageTop5.x}
                          gs-y={activeDashboard.powerUsageTop5.y}
                          gs-w={activeDashboard.powerUsageTop5.w}
                          gs-h={activeDashboard.powerUsageTop5.h}>
                          <div className="grid-stack-item-content">
                            {/* grid_item */}
                            <div className="grid_item">
                              <div className="grid_title">
                                <label>전력 사용량 Top 5</label>
                                <div className="dash_boxtab">
                                  <label htmlFor="name13">
                                    <input type="radio" name="box-tab5" id="name13" value="name3" defaultChecked />
                                    <span>전체</span>
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
                                {/*<i className="ico-btn-trash"></i>*/}
                              </div>
                              <div className="spin-nested-loading">
                                <div className="spin-container">
                                  <div className="grid_info style_list">
                                    <ul className="list_01">
                                      <li className="li_type_01">
                                        <div className="lft">
                                          <i className="ico-type24-x86"></i>
                                          <h6 className="list_title">
                                            x86_hostname1
                                            <span>192.168.16.87</span>
                                          </h6>
                                        </div>
                                        <div className="info2">
                                          <h6>400 kWh
                                            <span>25%</span>
                                          </h6>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar animate-bar" style={{ width: "25%" }}></div>
                                            </div>
                                          </div>
                                        </div>

                                      </li>
                                      <li className="li_type_01">
                                        <div className="lft">
                                          <i className="ico-type24-x86"></i>
                                          <h6 className="list_title">
                                            x86_hostname2
                                            <span>192.168.16.87</span>
                                          </h6>
                                        </div>
                                        <div className="info2">
                                          <h6>370 kWh
                                            <span>23.1%</span>
                                          </h6>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar animate-bar" style={{ width: "23.1%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                      <li className="li_type_01">
                                        <div className="lft">
                                          <i className="ico-type24-x86"></i>
                                          <h6 className="list_title">
                                            x86_hostname3
                                            <span>192.168.16.87</span>
                                          </h6>
                                        </div>
                                        <div className="info2">
                                          <h6>320 kWh
                                            <span>20%</span>
                                          </h6>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar animate-bar" style={{ width: "20%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                      <li className="li_type_01">
                                        <div className="lft">
                                          <i className="ico-type24-arm"></i>
                                          <h6 className="list_title">
                                            ARM_hostname1
                                            <span>192.168.16.87</span>
                                          </h6>
                                        </div>
                                        <div className="info2 warning">
                                          <h6>270 kWh
                                            <span>16.8%</span>
                                          </h6>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar animate-bar" style={{ width: "16.8%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                      <li className="li_type_01">
                                        <div className="lft">
                                          <i className="ico-type24-arm"></i>
                                          <h6 className="list_title">
                                            ARM_hostname2
                                            <span>192.168.16.87</span>
                                          </h6>
                                        </div>
                                        <div className="info2">
                                          <h6>240 kWh
                                            <span>15%</span>
                                          </h6>
                                          <div className="graph_wrap">
                                            <div className="graph_bar">
                                              <div className="bar animate-bar" style={{ width: "15%" }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* // grid_item */}
                          </div>
                        </div>
                      }
                      {/* // 03 */}
                    </div>
                  </div>

                </div>
                {/* // grid-stack */}

              </section>
            </div>
            {/* // grid_wrap */}

          </div>
        </div>
        {/* edit_left */}
        <div className="edit_left">
          <div className="edit_top">
            <div className="content-box">
              <label aria-required>대시보드 이름</label>
              <div className="input-byte">
                <input type="text" placeholder="입력해 주세요." />
              </div>
            </div>
          </div>
          <div className="accordion">
            <div className="acc_top">
              <div className="left">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-all" />
                  <span className="slider"></span>
                </label>
                <div className="text">전체선택</div>
              </div>
              <div className="right">
                <button id="closeAll" onClick={() => closeAll()}><i className="ico-fold-all"></i></button>
                <button id="openAll" onClick={() => openAll()}><i className="ico-fold-unfold-all"></i></button>
              </div>
            </div>

            <button className="accordion-btn">리소스 현황 및 사용량<i className="ico-arrow-clamp-up"></i></button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-1" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">클러스터 노드</label>
                <button className="open-popover-button icon_preview"><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_01">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-2" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">Pod</label>
                <button className="open-popover-button icon_preview"><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_02">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-3" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">가상머신</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_03">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-4" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">KaaS</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_04">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-5" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">리소스 사용량</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_05">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-6" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">네트워크 트래픽</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_06">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-7" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">리소스 변화량</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_07">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-8" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">리소스 사용량 Top 5</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_08">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-9" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">최근 생성된 리소스</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_09">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
            </div>

            <button className="accordion-btn">컴퓨팅 컴포넌트 현황<i className="ico-arrow-clamp-up"></i></button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-10" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">컴퓨팅 템플릿 현황</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_10">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-11" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">컴퓨팅 네트워크 현황</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_11">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
            </div>
            <button className="accordion-btn">베어메탈 현황 및 전력사용량<i className="ico-arrow-clamp-up"></i></button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-12" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">베어메탈 노드 현황</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_12">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-13" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">CPU & 소비 전력량 비교</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_13">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-14" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">탄소발자국 - 소나무</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_14">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-15" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">탄소 발자국 - 비용</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_15">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-16" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">탄소 발자국 - 전력 사용량</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_16">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-17" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">탄소 발자국 - CO2 발생량</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_17">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-18" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">탄소 지표</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_18">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-19" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">전력 사용량 Top 5</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_19">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
            </div>

            <button className="accordion-btn">기타<i className="ico-arrow-clamp-up"></i></button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-13" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">이슈</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>미리보기</h5>
                    <div className="preview_cont">

                      <div className="view img_13">미리보기</div>
                    </div>
                    <button className="close-popover-button"><i className="ico-close"></i></button>
                  </div>
                  <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div>
                </div>

              </div>
            </div>

            <div className="footer">
              <button type="button" className="btn btn-default" onClick={() => cancelEdit()}>취소</button>
              <button type="button" className="btn btn-primary">저장</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default inject('rootStore')(observer(CustomDashboardEdit));