import React, { useEffect, useState } from 'react'
import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import { inject, observer } from 'mobx-react'
import queryString from 'query-string'
import DashboardInfo from 'stores/dashboard/dashboardInfo'
import CustomDashboardInfo from 'stores/dashboard/customDashboardInfo'
import { Notify } from '@kube-design/components'

import './edit.css'

import { makePanels } from 'stores/dashboard/panels'
const CustomDashboardEdit = props => {
  const { cluster } = props.match.params
  const { routing } = props.rootStore

  const { search } = props.location
  const queryObj = queryString.parse(search)

  const { idx } = queryObj

  const [isNew, setIsNew] = useState(idx ? false : true)
  const [activeDashboard, setActiveDashboard] = useState(
    idx
      ? JSON.parse(localStorage.getItem('dashboardArr'))[idx]
      : new CustomDashboardInfo()
  )
  const [dashboardName, setDashboardName] = useState(activeDashboard.name)

  var grid

  // 위치를 위한 초기 grid 그려주기
  useEffect(() => {
    const drawExPanel = new DashboardInfo()
    grid = GridStack.init(options)
    const keys = Object.keys(drawExPanel)
    keys.map(obj => {
      const panel = drawExPanel[obj] ? makePanels(obj, drawExPanel[obj]) : null
      if (panel) {
        grid.addWidget(panel)
      }
    })
    grid.removeAll()
  }, [])

  // accordion
  var accordionButtons
  var accordionContents

  // popover preview
  var openButtons
  var popoverContainers
  var closeButtons

  const options = {
    column: 15,
    float: false,
    disableOneColumnMode: true,
    handleClass: 'grid-stack-item-content .grid_item .grid_title',
    cellHeight: 59,
    verticalMargin: 20,
    disableResize: true,
  }

  useEffect(() => {
    grid = GridStack.init(options)

    // grid add event
    grid.on('added', function(event, items) {
      items.forEach(function(item) {
        // trash click trigger
        var trash = item.el.querySelector('.ico-btn-trash')
        trash.addEventListener('click', function() {
          // handle left toggle
          const panelId = item.el.id
          document.getElementById(panelId + '-toggle').checked = false
          // remove widget
          grid.removeWidget(item.el)
        })
      })
    })
    grid.on('removed', function(event, items) {
      // items.forEach(function (item) {
      // console.log(item)
      // console.log(item.grid.el.childNodes)
      // });
    })

    openButtons = document.querySelectorAll('.open-popover-button')
    popoverContainers = document.querySelectorAll('.popover-container')
    closeButtons = document.querySelectorAll('.close-popover-button')

    // 각 버튼을 클릭할 때 팝오버 열기
    openButtons.forEach(function(openButton, index) {
      openButton.addEventListener('click', function(event) {
        // 다른 팝오버 닫기
        closeAllPopovers()

        var popoverContainer = popoverContainers[index]
        var buttonRect = openButton.getBoundingClientRect()

        // 해당 팝오버를 버튼의 오른쪽에 위치
        popoverContainer.style.top = buttonRect.top - 80 + 'px'
        popoverContainer.style.left = buttonRect.right + 'px'
        popoverContainer.style.display = 'block'

        // 팝오버가 열렸을 때 문서의 다른 부분을 클릭하면 닫히도록 이벤트 리스너 추가
        document.addEventListener('click', function closePopoverOutside(event) {
          if (!popoverContainer.contains(event.target)) {
            popoverContainer.style.display = 'none'
            document.removeEventListener('click', closePopoverOutside)
          }
        })

        event.stopPropagation()
      })
    })

    // 모든 아코디언 초기로 열기
    openAll()
  }, [])

  useEffect(() => {
    grid = GridStack.init(options)
    const keys = Object.keys(activeDashboard)
    keys.map(obj => {
      const panel = activeDashboard[obj]
        ? makePanels(obj, activeDashboard[obj])
        : null
      if (panel) {
        grid.addWidget(panel)
      }
    })
  }, [activeDashboard])

  const toggleHandler = (e, panelName) => {
    grid = GridStack.init(options)
    const isChecked = e.target.previousSibling.checked
    if (!isChecked) {
      grid.addWidget(makePanels(panelName))
    } else {
      grid.removeWidget(document.getElementById(panelName + 'Panel'))
    }
  }

  useEffect(() => {
    // 각 팝오버의 닫기 버튼을 클릭할 때 팝오버 닫기
    closeButtons.forEach(function(closeButton) {
      closeButton.addEventListener('click', function() {
        var popoverContainer = closeButton.closest('.popover-container')
        popoverContainer.style.display = 'none'
      })
    })
    return () => {
      closeButtons.forEach(function(closeButton) {
        closeButton.removeEventListener('click', function() {
          var popoverContainer = closeButton.closest('.popover-container')
          popoverContainer.style.display = 'none'
        })
      })
    }
  }, [])

  // 전체 열기 버튼 클릭 시 모든 아코디언 열기
  const openAll = () => {
    accordionButtons = document.querySelectorAll('.accordion-btn')
    accordionContents = document.querySelectorAll('.accordion-content')
    accordionButtons.forEach((button, index) => {
      button.classList.add('active')
      accordionContents[index].style.maxHeight =
        accordionContents[index].scrollHeight + 'px'
    })
  }
  // 전체 닫기 버튼 클릭 시 모든 아코디언 닫기
  const closeAll = () => {
    accordionButtons = document.querySelectorAll('.accordion-btn')
    accordionContents = document.querySelectorAll('.accordion-content')
    accordionButtons.forEach((button, index) => {
      button.classList.remove('active')
      accordionContents[index].style.maxHeight = null
    })
  }

  // 팝오버 닫기 함수
  const closeAllPopovers = () => {
    popoverContainers.forEach(function(popoverContainer) {
      popoverContainer.style.display = 'none'
    })
  }

  const cancelEdit = () => {
    routing.push(`/clusters/${cluster}/overview`)
  }

  const validSave = () => {
    if (dashboardName.trim().length == 0) {
      Notify.error({ content: t('RESOURCES_DASHBOARD_NAME_MIN_DESC') })
      document.getElementById('dashboardName').focus()
    } else if (dashboardName.trim().length > 15) {
      Notify.error({ content: t('RESOURCES_DASHBOARD_NAME_MAX_DESC') })
      document.getElementById('dashboardName').focus()
    } else {
      var arr = JSON.parse(localStorage.getItem('dashboardArr'))
      var duplicateName = arr.find(el => el.name == dashboardName.trim())
      grid = GridStack.init()

      if (isNew && duplicateName) {
        Notify.error({ content: t('RESOURCES_DUPLICATE_NAME') })
        document.getElementById('dashboardName').style.borderColor = 'red'
        document.getElementById('dashboardName').focus()
      } else if (
        !isNew &&
        activeDashboard.name != dashboardName.trim() &&
        duplicateName
      ) {
        Notify.error({ content: t('RESOURCES_DUPLICATE_NAME') })
        document.getElementById('dashboardName').style.borderColor = 'red'
        document.getElementById('dashboardName').focus()
      } else if (grid.engine.nodes.length == 0) {
        Notify.error({ content: t('RESOURCES_SELECT_MIN_ONE_PANEL') })
      } else {
        saveDashboard(grid, arr)
      }
    }
  }

  const saveDashboard = (grid, arr) => {
    const o = new Object()
    grid.engine.nodes.map(obj => {
      const id = obj.el.id.slice(0, -5)
      o[id] = { x: obj.x, y: obj.y, w: obj.w, h: obj.h }
    })
    o['name'] = dashboardName

    if (idx) {
      arr.splice(idx, 1)
    }
    arr.unshift(o)

    localStorage.setItem('dashboardArr', JSON.stringify(arr))

    routing.push(`/clusters/${cluster}/overview`)
  }

  const handleAccordion = e => {
    const el = e.currentTarget
    if (el.classList.contains('active')) {
      el.classList.remove('active')
      el.nextElementSibling.style.maxHeight = null
    } else {
      el.classList.add('active')
      el.nextElementSibling.style.maxHeight =
        el.nextElementSibling.scrollHeight + 'px'
    }
  }

  return (
    <>
      <div className="dashboard">
        <div className="dash_edit">
          <div className="content_wrap">
            <div className="dash_wrap">
              <section>
                <div className="tab-content edit">
                  <div className="grid_wrap">
                    <div className="grid-stack"></div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* edit_left */}
        <div className="edit_left">
          <div className="edit_top">
            <div className="content-box">
              <label aria-required>{t('RESOURCES_DASHBOARD_NAME')}</label>
              <div className="input-byte">
                <input
                  type="text"
                  id="dashboardName"
                  placeholder={t('RESOURCES_INPUT_EMPTY_DESC')}
                  defaultValue={dashboardName}
                  onChange={e => setDashboardName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="accordion">
            <div className="acc_top">
              <div className="left">
                {/* todo
                전체선택 추가 작업 필요 
                bmc 개발 이후 예정 */}
                {/* <label className="switch type_text">
                  <input type="checkbox" id="toggle-all" />
                  <span className="slider"></span>
                </label>
                <div className="text">전체선택</div> */}
              </div>
              <div className="right">
                <button id="closeAll" onClick={() => closeAll()}>
                  <i className="ico-fold-all"></i>
                </button>
                <button id="openAll" onClick={() => openAll()}>
                  <i className="ico-fold-unfold-all"></i>
                </button>
              </div>
            </div>

            <button className="accordion-btn" onClick={e => handleAccordion(e)}>
              {t('GPU')}
              <i className="ico-arrow-clamp-up"></i>
            </button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="nodePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.node}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'node')}
                  ></span>
                </label>
                <label className="section-title">{t('노드')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_31">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="virtualMachinePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.virtualMachine}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'virtualMachine')}
                  ></span>
                </label>
                <label className="section-title">{t('가상머신')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_32">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="gpuStatusPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.gpuStatus}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'gpuStatus')}
                  ></span>
                </label>
                <label className="section-title">{t('GPU 현황')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_33">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="gpuUsagePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.gpuUsage}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'gpuUsage')}
                  ></span>
                </label>
                <label className="section-title">{t('GPU 가용률')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_34">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="kaasGpuPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.kaasGpu}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'kaasGpu')}
                  ></span>
                </label>
                <label className="section-title">{t('KaaS')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_35">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="gpuMapPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.gpuMap}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'gpuMap')}
                  ></span>
                </label>
                <label className="section-title">{t('GPU 현황 맵')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_36">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="gpuUsageStatusPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.gpuUsageStatus}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'gpuUsageStatus')}
                  ></span>
                </label>
                <label className="section-title">{t('GPU 사용 현황')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_37">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="gpuUsageTop5Panel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.gpuUsageTop5}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'gpuUsageTop5')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('GPU 사용 현황 Top5')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_38">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="alarmVerticalPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.alarmVertical}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'alarmVertical')}
                  ></span>
                </label>
                <label className="section-title">{t('알람 (세로)')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_39">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="alarmHorizontalPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.alarmHorizontal}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'alarmHorizontal')}
                  ></span>
                </label>
                <label className="section-title">{t('알람 (가로)')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_40">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button className="accordion-btn" onClick={e => handleAccordion(e)}>
              {t('RESOURCES_RESOURCE_CURRENT_SITUATION_USAGE')}
              <i className="ico-arrow-clamp-up"></i>
            </button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="clusterNodePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.clusterNode}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'clusterNode')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_CLUSTER_NODE')}
                </label>
                <button className="open-popover-button icon_preview">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_01">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="podPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.pod}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'pod')}
                  ></span>
                </label>
                <label className="section-title">{t('POD_PL')}</label>
                <button className="open-popover-button icon_preview">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_02">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="vmPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.vm}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'vm')}
                  ></span>
                </label>
                <label className="section-title">{t('RESOURCES_VM')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_03">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="kaasPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.kaas}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'kaas')}
                  ></span>
                </label>
                <label className="section-title">KaaS</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_04">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="gpuClusterPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.gpuCluster}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'gpuCluster')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_GPU_CLUSTER')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_22">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="resourceUsagePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.resourceUsage}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'resourceUsage')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_RESOURCE_USAGE')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_05">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="networkTrafficPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.networkTraffic}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'networkTraffic')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_NETWORK_TRAFFIC')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_06">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="resourceChangePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.resourceChange}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'resourceChange')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_RESOURCE_CHANGE_AMOUNT')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_07">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="usageTop5Panel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.usageTop5}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'usageTop5')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_RESOURCE_USAGE_TOP')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_08">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="recentResourcePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.recentResource}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'recentResource')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_RECENT_CREATE_RESOURCE')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_09">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
            </div>

            <button className="accordion-btn" onClick={e => handleAccordion(e)}>
              {t('RESOURCES_COMPUTING_COMPONENT_CURRENT_SITUATION')}
              <i className="ico-arrow-clamp-up"></i>
            </button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="computingTemplatePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.computingTemplate}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'computingTemplate')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_COMPUTING_TEMPLATE_CURRENT_SITUATION')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_10">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="computingNetworkPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.computingNetwork}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'computingNetwork')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_COMPUTING_NETWORK_CURRENT_SITUATION')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_11">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>

              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="clusterStatusPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.clusterStatus}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'clusterStatus')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_KAAS_COMPONENT_STATE')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_21">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
            </div>
            <button className="accordion-btn" onClick={e => handleAccordion(e)}>
              {t('RESOURCES_BAREMETAL_CURRENT_SITUATION_AND_POWER_USAGE')}
              <i className="ico-arrow-clamp-up"></i>
            </button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="bmcNodePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.bmcNode}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'bmcNode')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_BAREMETAL_NODE_CURRENT_SITUATION')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_12">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="cpuPowerPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.cpuPower}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'cpuPower')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_COMPARE_CPU_POWER_CONSUMPTION')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_13">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="carbonTreePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.carbonTree}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'carbonTree')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_CARBON_FOOTPRINT')} - {t('RESOURCES_PINE_TREE')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_14">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="carbonCostPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.carbonCost}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'carbonCost')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_CARBON_FOOTPRINT')} - {t('RESOURCES_COST')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_15">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="carbonPowerPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.carbonPower}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'carbonPower')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_CARBON_FOOTPRINT')} -{' '}
                  {t('RESOURCES_POWER_USAGE')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_16">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="carbonCo2Panel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.carbonCo2}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'carbonCo2')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_CARBON_FOOTPRINT')} -{' '}
                  {t('RESOURCES_CO2_EMISSIONS')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_17">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="carbonIndicatorPanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.carbonIndicator}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'carbonIndicator')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_CARBON_INDICATOR')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_18">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="powerUsageTop5Panel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.powerUsageTop5}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'powerUsageTop5')}
                  ></span>
                </label>
                <label className="section-title">
                  {t('RESOURCES_POWER_USAGE_TOP_FIVE')}
                </label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_19">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
            </div>

            <button className="accordion-btn" onClick={e => handleAccordion(e)}>
              {t('RESOURCES_ETC')}
              <i className="ico-arrow-clamp-up"></i>
            </button>
            <div className="accordion-content">
              <div className="section-content">
                <label className="switch type_text">
                  <input
                    type="checkbox"
                    id="issuePanel-toggle"
                    className="toggle"
                    defaultChecked={activeDashboard.issue}
                  />
                  <span
                    className="slider"
                    onClick={e => toggleHandler(e, 'issue')}
                  ></span>
                </label>
                <label className="section-title">{t('RESOURCES_ISSUE')}</label>
                <button className="icon_preview open-popover-button ">
                  <i className="ico-etc-preview"></i>
                </button>

                <div className="popover-container">
                  <div className="popover-content">
                    {/* 팝오버 내용  */}
                    <h5>{t('RESOURCES_PREVIEW')}</h5>
                    <div className="preview_cont">
                      <div className="view img_20">
                        {t('RESOURCES_PREVIEW')}
                      </div>
                    </div>
                    <button className="close-popover-button">
                      <i className="ico-close"></i>
                    </button>
                  </div>
                  {/* <div className="footer">
                    <button className="btn btn-primary">추가</button>
                  </div> */}
                </div>
              </div>
            </div>

            <div className="footer">
              <button
                type="button"
                className="btn btn-default"
                onClick={() => cancelEdit()}
              >
                {t('RESOURCES_CANCEL')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => validSave()}
              >
                {t('RESOURCES_SAVE')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default inject('rootStore')(observer(CustomDashboardEdit))
