import React, { useEffect, useRef, useState } from 'react'
import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import './dashboard.css'
import { inject, observer } from 'mobx-react'
import ClusterMonitorStore from 'stores/monitoring/cluster'
import { Notify, Toggle } from '@kube-design/components'
import { Modal } from 'components/Base'
import DeleteModal from 'components/Modals/Delete'

import Node from './Node'
import VirtualMachine from './VirtualMachine'
import GpuStatus from './GpuStatus'
import GpuUsage from './GpuUsage'
import KaasGpu from './KaasGpu'
import GpuMap from './GpuMap'
import GpuUsageStatus from './GpuUsageStatus'
import GpuUsageTop5 from './GpuUsageTop5'
import Alarm from './Alarm'
import ClusterNode from './ClusterNode'
import Pod from './Pod'
import Vm from './Vm'
import UsageTop5 from './UsageTop5'
import RecentResource from './RecentResource'
import Kaas from './Kaas'
import ResourcesUsage from './ResourceUsage'
import NetworkTraffic from './NetworkTraffic'
import Issue from './Issue'
import Computing from './Computing'
import ResourceChange from './ResourceChange'
import ClusterStatus from './ClusterStatus'
import Bmc from './Bmc'
import GpuCluster from './GpuCluster'

import DashboardInfo from 'stores/dashboard/dashboardInfo'
import CustomDashboardInfo from 'stores/dashboard/customDashboardInfo'
import { makePanels } from 'stores/dashboard/panels'

const CustomDashboard = props => {
  const { cluster } = props.match.params
  const { routing, user } = props.rootStore

  const monitorStore = new ClusterMonitorStore()

  const [activeDashboard, setActiveDashboard] = useState({})

  const [dashboardArr, setDashboardArr] = useState([])

  var grid
  const options = {
    column: 15,
    float: false,
    disableOneColumnMode: true,
    handleClass: 'grid-stack-item-content .grid_item .grid_title',
    cellHeight: 59,
    verticalMargin: 20,
    disableResize: true, // resize
    disableDrag: true, // drag
  }

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

  useEffect(() => {
    var dashboardArr = JSON.parse(localStorage.getItem('dashboardArr'))
    if (!dashboardArr) {
      const dash = new CustomDashboardInfo()
      dashboardArr = [dash]
      localStorage.setItem('dashboardArr', JSON.stringify(dashboardArr))
    }

    setDashboardArr(dashboardArr)
    setActiveDashboard(dashboardArr[0])
  }, [])

  const editMode = () => {
    routing.push(`/clusters/${cluster}/overview/edit`)
  }

  const handleClickOutside = e => {
    if (!e.target.closest('.tab-quick-menu')) {
      document.querySelectorAll('.tab-quick-menu button').forEach(removeBtn => {
        removeBtn.classList.remove('active')
      })
    }
  }
  useEffect(() => {
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const actvieQuick = e => {
    e.target.parentElement.classList.add('active')
  }

  const deleteDashboard = (idx, name) => {
    const modal = Modal.open({
      onOk: () => {
        dashboardArr.splice(idx, 1)
        localStorage.setItem('dashboardArr', JSON.stringify(dashboardArr))
        const spliceArr = JSON.parse(localStorage.getItem('dashboardArr'))
        Modal.close(modal)
        Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })

        const prev = JSON.parse(
          localStorage.getItem('selectedGpuCluster') || '{}'
        )
        delete prev[name]
        localStorage.setItem('selectedGpuCluster', JSON.stringify(prev))

        setDashboardArr(spliceArr)
      },
      modal: DeleteModal,
      title: t('RESOURCES_DELETE_DASHBOARD'),
      desc: `${name} ${t('RESOURCES_EUL')} ${t('RESOURCES_DELETE_DESC')}`,
    })
  }

  useEffect(() => {
    if (dashboardArr.length > 0) {
      setActiveDashboard(dashboardArr[0])
      localStorage.setItem('activeDashboardName', dashboardArr[0].name)
      document.getElementById('dashTab0').click()
    }
  }, [dashboardArr])

  const editDashboard = idx => {
    routing.push(`/clusters/${cluster}/overview/edit?idx=${idx}`)
  }

  useEffect(() => {
    if (!_.isEmpty(activeDashboard)) {
      let maxHeight = 0
      const keys = Object.keys(activeDashboard)
      keys.map(obj => {
        const panel = activeDashboard[obj]
        let y = panel.y
        let h = panel.h
        if (maxHeight < y + h) {
          maxHeight = y + h
        }
      })

      const minHeight = maxHeight * 60
      document.querySelector('.grid-stack').style.minHeight = `${minHeight}px`

      grid = GridStack.init(options)
    }
  }, [activeDashboard])

  return (
    <>
      <div className="dashboard">
        <div className="content-wrapper content_wrap">
          <div className="dash_wrap">
            <section>
              {/* Top area */}
              <div
                className="dash_top_align"
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div className="dash_toptab">
                  {dashboardArr.map((obj, idx) => (
                    <label htmlFor={`dashTab${idx}`} key={idx}>
                      <input
                        type="radio"
                        name="mode"
                        id={`dashTab${idx}`}
                        value={`dashTab${idx}`}
                        defaultChecked={idx == 0 ? true : false}
                      />
                      <span
                        onClick={() => {
                          setActiveDashboard(obj)
                          localStorage.setItem('activeDashboardName', obj.name)
                        }}
                      >
                        {obj.name}
                        <div className="tab-quick-menu" onClick={actvieQuick}>
                          <button type="button" className="btn_quick">
                            <i className="ico-quick-menu"></i>
                          </button>
                          <ul className="quick-menu-list">
                            <li onClick={() => editDashboard(idx)}>
                              <i className="ico-quick-pannel"></i>
                              <span>{t('RESOURCES_EDIT_DASHBOARD')}</span>
                            </li>
                            {dashboardArr.length > 1 && (
                              <li
                                onClick={() => deleteDashboard(idx, obj.name)}
                              >
                                <i className="ico-quick-trash"></i>
                                <span>{t('RESOURCES_DELETE_DASHBOARD')}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </span>
                    </label>
                  ))}
                  {dashboardArr.length <= 10 && (
                    <button
                      type="button"
                      className="btn_dash_add"
                      onClick={() => editMode()}
                    >
                      <i className="ico-plus"></i>
                    </button>
                  )}
                </div>
                <div
                  className="dash_toggle"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: '32px',
                    padding: '2px',
                    marginLeft: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <Toggle
                    checked={user.showMenu}
                    onChange={() => user.handlechangeShowMenu(!user.showMenu)}
                  />
                  <span>{user.showMenu ? ' 좌측 메뉴' : ' 좌측 메뉴'}</span>
                </div>
              </div>
              {/* // Top area */}

              {/* tab-content */}
              <div className="tab-content">
                <div className="grid_wrap">
                  <div className="grid-stack">
                    {activeDashboard && !_.isEmpty(activeDashboard) && (
                      <>
                        {Object.entries(activeDashboard).map(([key, value]) => {
                          if (key === 'name') return null // name은 탭 이름으로만 쓰고 건너뜀
                          const Comp = widgetMap[key]
                          return (
                            <GridItem key={key} {...value}>
                              {Comp ? (
                                <Comp
                                  widgetKey={key}
                                  monitorStore={monitorStore}
                                  {...(key === 'gpuCluster'
                                    ? { activeDashboard }
                                    : {})}
                                  {...props.match.params}
                                />
                              ) : (
                                <div>{key}</div>
                              )}
                            </GridItem>
                          )
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {/* // grid-stack */}
            </section>
          </div>
          {/* // grid_wrap */}
        </div>
      </div>
    </>
  )
}

export default inject('rootStore')(observer(CustomDashboard))

const widgetMap = {
  node: props => <Node {...props} />,
  virtualMachine: props => <VirtualMachine {...props} />,
  gpuStatus: props => <GpuStatus {...props} />,
  gpuUsage: props => <GpuUsage {...props} />,
  kaasGpu: props => <KaasGpu {...props} />,
  gpuMap: props => <GpuMap {...props} />,
  gpuUsageStatus: props => <GpuUsageStatus {...props} />,
  gpuUsageTop5: props => <GpuUsageTop5 {...props} />,
  alarmVertical: props => <Alarm {...props} />,
  alarmHorizontal: props => <Alarm isVertical={true} {...props} />,
  clusterNode: props => <ClusterNode {...props} />,
  pod: props => <Pod {...props} />,
  vm: props => <Vm {...props} />,
  kaas: props => <Kaas {...props} />,
  usageTop5: props => <UsageTop5 {...props} />,
  gpuCluster: props => <GpuCluster {...props} />,
  recentResource: props => <RecentResource {...props} />,
  resourceUsage: props => <ResourcesUsage {...props} />,
  issue: props => <Issue {...props} />,
  networkTraffic: props => <NetworkTraffic {...props} />,
  resourceChange: props => <ResourceChange {...props} />,
  clusterStatus: props => <ClusterStatus {...props} />,
  computingTemplate: props => <Computing {...props} />,
  computingNetwork: props => <Computing {...props} />,
  bmcNode: props => <Bmc {...props} />,
  carbonIndicator: props => <Bmc {...props} />,
  powerUsageTop5: props => <Bmc {...props} />,
  carbonPower: props => <Bmc {...props} />,
  carbonCo2: props => <Bmc {...props} />,
  carbonTree: props => <Bmc {...props} />,
  carbonCost: props => <Bmc {...props} />,
  cpuPower: props => <Bmc {...props} />,
}

// Grid Item
const GridItem = ({ x, y, w, h, children }) => {
  return (
    <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
      <div className="grid-stack-item-content">{children}</div>
    </div>
  )
}
