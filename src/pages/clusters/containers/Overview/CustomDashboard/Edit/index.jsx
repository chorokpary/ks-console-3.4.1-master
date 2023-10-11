import React, { useEffect, useState } from 'react'
import 'gridstack/dist/gridstack.min.css';
import { GridStack } from 'gridstack'
import './../dashboard.css'
import { inject, observer } from 'mobx-react';

const CustomDashboardEdit = (props) => {

  const { cluster } = props.match.params
  const { routing } = props.rootStore;

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
    float: false,
    disableOneColumnMode: true,
    handleClass: 'grid-stack-item-content .grid_item .grid_title',
    cellHeight: 59,
    verticalMargin: 20,
    disableResize: true, // resize 
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
                      <div className="grid-stack-item" gs-x="0" gs-y="0" gs-w="3" gs-h="4">
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
                      {/* // 01 */}

                      {/* 01 */}
                      <div className="grid-stack-item" gs-x="3" gs-y="0" gs-w="2" gs-h="4">
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
                                      <p className="status warning"><span>Waiting</span></p>
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
                      {/* // 01 */}

                      {/* 01 */}
                      <div className="grid-stack-item" gs-x="5" gs-y="0" gs-w="2" gs-h="4">
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
                                      <p className="status waiting"><span>Waiting</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">3</div>
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
                      {/* // 01 */}

                      {/* 01 */}
                      <div className="grid-stack-item" gs-x="7" gs-y="0" gs-w="2" gs-h="4">
                        <div className="grid-stack-item-content">
                          {/* grid_item */}
                          <div className="grid_item">
                            <div className="grid_title">
                              <label>쿠버네티스</label>
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
                                      <p className="status waiting"><span>Waiting</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">4</div>
                                      <p className="status running"><span>Running</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">2</div>
                                      <p className="status completed"><span>Completed</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">2</div>
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
                      {/* // 01 */}

                      {/* 02 */}
                      <div className="grid-stack-item" gs-x="0" gs-y="4" gs-w="9" gs-h="6">
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
                      {/* // 02 */}

                      {/* 02 */}
                      <div className="grid-stack-item" gs-x="0" gs-y="10" gs-w="9" gs-h="6">
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
                      {/* // 02 */}


                      {/* 03 */}
                      <div className="grid-stack-item" gs-x="9" gs-y="0" gs-w="3" gs-h="8">
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
                      {/* // 03 */}

                      {/* 03 */}
                      <div className="grid-stack-item" gs-x="9" gs-y="8" gs-w="3" gs-h="9">
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
                      {/* // 03 */}

                      {/* 03 */}
                      <div className="grid-stack-item" gs-x="9" gs-y="17" gs-w="3" gs-h="9">
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
                      {/* // 03 */}

                      {/* 04 */}
                      <div className="grid-stack-item" gs-x="0" gs-y="21" gs-w="9" gs-h="4">
                        <div className="grid-stack-item-content">
                          {/* grid_item */}
                          <div className="grid_item">
                            <div className="grid_title">
                              <label>컴퓨팅 유형별 현황</label>
                              <div className="right">
                                <i className="ico-btn-trash"></i>
                              </div>
                            </div>
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
                                      <p className="status running"><span>Active</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p className="status waiting"><span>Inactive</span></p>
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
                                      <p className="status running"><span>Used</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p className="status waiting"><span>Unused</span></p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="box type_status">
                                <h5><i className="ico-type24-router"></i>가상라우터</h5>
                                <div className="cont_group">
                                  <div className="cont1">
                                    <div className="number_wrap">
                                      <p><span className="em">4</span> / 8</p>
                                    </div>
                                  </div>
                                  <div className="cont2">
                                    <div className="status_wrap">
                                      <div className="value">7</div>
                                      <p className="status running"><span>Active</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p className="status waiting"><span>Inactive</span></p>
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
                                      <p className="status running"><span>Used</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p className="status waiting"><span>Unused</span></p>
                                    </div>
                                  </div>
                                </div>
                              </div>
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
                                      <p className="status running"><span>Used</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p className="status waiting"><span>Unused</span></p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="box type_status">
                                <h5><i className="ico-type24-hostdevice"></i>Host 디바이스</h5>
                                <div className="cont_group">
                                  <div className="cont1">
                                    <div className="number_wrap">
                                      <p><span className="em">7</span> / 8</p>
                                    </div>
                                  </div>
                                  <div className="cont2">
                                    <div className="status_wrap">
                                      <div className="value">7</div>
                                      <p className="status running"><span>Active</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p className="status waiting"><span>Inactive</span></p>
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
                      {/* // 04 */}

                      {/* 05 */}
                      <div className="grid-stack-item" gs-x="0" gs-y="16" gs-w="4" gs-h="5">
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
                                  <div className="cont2">
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p><span>Created</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">0</div>
                                      <p><span>Deleted</span></p>
                                    </div>
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
                                  <h5><i className="ico-type-vm"></i>가상머신</h5>
                                  <div className="number_wrap">
                                    <p><span className="em">7</span></p>
                                  </div>
                                  <div className="cont2">
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p><span>Created</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">0</div>
                                      <p><span>Deleted</span></p>
                                    </div>
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
                                  <div className="cont2">
                                    <div className="status_wrap">
                                      <div className="value">1</div>
                                      <p><span>Created</span></p>
                                    </div>
                                    <div className="status_wrap">
                                      <div className="value">0</div>
                                      <p><span>Deleted</span></p>
                                    </div>
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
                      {/* // 05 */}

                      {/* 04 */}
                      <div className="grid-stack-item" gs-x="4" gs-y="16" gs-w="5" gs-h="5">
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
                      {/* // 04 */}

                      {/* 06 */}
                      <div className="grid-stack-item" gs-x="0" gs-y="25" gs-w="9" gs-h="7">
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
                                                <div className="hexagon"><span>ARM</span></div>
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
                                                <div className="hexagon"><span>ARM</span></div>
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
                                                <div className="hexagon"><span>ARM</span></div>
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
                                                <div className="hexagon"><span>ARM</span></div>
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
                                                <div className="hexagon"><span>ARM</span></div>
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
                                                <div className="hexagon"><span>ARM</span></div>
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
                                                <div className="hexagon"><span>ARM</span></div>
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
                      {/* // grid_item */}
                    </div>
                  </div>
                  {/* // 06 */}

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
                <label className="section-title">쿠버네티스</label>
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

            <button className="accordion-btn">컴퓨팅 & 컴포넌트 현황<i className="ico-arrow-clamp-up"></i></button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-10" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">컴퓨팅 유형별 현황</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
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
                <label className="section-title">쿠버네티스 컴포넌트 상태</label>
                <button className="icon_preview open-popover-button "><i className="ico-etc-preview"></i></button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
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
              <div className="section-content">
                <label className="switch type_text">
                  <input type="checkbox" id="toggle-12" className="toggle" />
                  <span className="slider"></span>
                </label>
                <label className="section-title">BMC 노드 현황</label>
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