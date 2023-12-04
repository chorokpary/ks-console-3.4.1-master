import React, { useEffect, useState } from 'react'
import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css';
import './dashboard.css'
import { inject, observer } from 'mobx-react';
import ClusterMonitorStore from 'stores/monitoring/cluster'
import { Notify } from '@kube-design/components'
import { Modal } from 'components/Base'
import DeleteModal from 'components/Modals/Delete'

import ClusterNode from './ClusterNode';
import Pod from './Pod';
import Vm from './Vm';
import UsageTop5 from './UsageTop5';
import RecentResource from './RecentResource';
import Kaas from './Kaas';
import ResourcesUsage from './ResourceUsage';
import NetworkTraffic from './NetworkTraffic';
import Issue from './Issue';
import Computing from './Computing';
import ResourceChange from './ResourceChange';
import ClusterStatus from './ClusterStatus';
import Bmc from './Bmc';

import DashboardInfo from 'stores/dashboard/dashboardInfo'

const CustomDashboard = (props) => {

  const { cluster } = props.match.params
  const { routing } = props.rootStore;

  const monitorStore = new ClusterMonitorStore({ cluster })

  const [activeDashboard, setActiveDashboard] = useState(new DashboardInfo())

  const [dashboardArr, setDashboardArr] = useState(new Array(new DashboardInfo()))

  const options = {
    column: 15,
    float: false,
    disableOneColumnMode: true,
    handleClass: 'grid-stack-item-content .grid_item .grid_title',
    cellHeight: 59,
    verticalMargin: 20,
    disableResize: true, // resize
    disableDrag: true // drag
  };

  var grid
  useEffect(() => {
    var dashboardArr = JSON.parse(localStorage.getItem("dashboardArr"))
    if (!dashboardArr) {
      const dash = new DashboardInfo()
      dashboardArr = [dash]
      localStorage.setItem("dashboardArr", JSON.stringify(dashboardArr))
    }

    setDashboardArr(dashboardArr)
  }, [])

  const editMode = () => {
    routing.push(`/clusters/${cluster}/overview/edit`)
  }

  const handleClickOutside = (e) => {
    if (!e.target.closest('.tab-quick-menu')) {
      document.querySelectorAll('.tab-quick-menu button').forEach((removeBtn) => {
        removeBtn.classList.remove('active')
      })
    }
  };
  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const actvieQuick = e => {
    e.target.parentElement.classList.add('active')
  }

  const deleteDashboard = (idx, name) => {
    const modal = Modal.open({
      onOk: () => {
        dashboardArr.splice(idx, 1)
        localStorage.setItem("dashboardArr", JSON.stringify(dashboardArr))
        const spliceArr = JSON.parse(localStorage.getItem("dashboardArr"))
        Modal.close(modal)
        Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })

        setDashboardArr(spliceArr)
      },
      modal: DeleteModal,
      title: t('RESOURCES_DELETE_DASHBOARD'),
      desc: `${name} ${t('RESOURCES_EUL')}/${t('RESOURCES_LEUL')} ${t('RESOURCES_DELETE_DESC')}`,
    })
  }

  useEffect(() => {
    if (dashboardArr.length > 0) {
      setActiveDashboard(dashboardArr[0])
      document.getElementById("dashTab0").click()
    }
  }, [dashboardArr])

  const editDashboard = idx => {
    routing.push(`/clusters/${cluster}/overview/edit?idx=${idx}`)
  }

  useEffect(() => {
    if (!_.isEmpty(activeDashboard)) {

      let maxHeight = 0;
      const keys = Object.keys(activeDashboard)
      keys.map(obj => {
        const panel = activeDashboard[obj]
        let y = panel.y
        let h = panel.h
        if (maxHeight < y + h) {
          maxHeight = y + h
        }
      })

      const minHeight = (maxHeight) * 60
      document.querySelector('.grid-stack').style.minHeight = `${minHeight}px`

      grid = GridStack.init(options);
    }
  }, [activeDashboard])


  return (
    <>
      <div className="dashboard">
        <div className="content-wrapper content_wrap">
          <div className="dash_wrap">

            <section>
              {/* Top area */}
              <div className="dash_toptab">
                {dashboardArr.map((obj, idx) => (
                  <label htmlFor={`dashTab${idx}`} key={idx}>
                    <input type="radio" name="mode" id={`dashTab${idx}`} value={`dashTab${idx}`} defaultChecked={idx == 0 ? true : false} />
                    <span onClick={() => setActiveDashboard(obj)}>{obj.name}
                      <div className="tab-quick-menu" onClick={actvieQuick}>
                        <button type="button" className='btn_quick' ><i className="ico-quick-menu"></i></button>
                        <ul className="quick-menu-list">
                          <li onClick={() => editDashboard(idx)}><i className="ico-quick-pannel"></i><span>{t('RESOURCES_EDIT_DASHBOARD')}</span></li>
                          {dashboardArr.length > 1 &&
                            <li onClick={() => deleteDashboard(idx, obj.name)}><i className="ico-quick-trash"></i><span>{t('RESOURCES_DELETE_DASHBOARD')}</span></li>
                          }
                        </ul>
                      </div>
                    </span>
                  </label>
                ))}
                {dashboardArr.length <= 10 &&
                  <button type="button" className="btn_dash_add" onClick={() => editMode()}><i className="ico-plus"></i></button>
                }
              </div>
              {/* // Top area */}

              {/* tab-content */}
              <div className="tab-content">
                <div className="grid_wrap">
                  <div className="grid-stack">
                    {/* 클러스터 노드 */}
                    {activeDashboard.clusterNode &&
                      <ClusterNode
                        x={activeDashboard.clusterNode.x}
                        y={activeDashboard.clusterNode.y}
                        w={activeDashboard.clusterNode.w}
                        h={activeDashboard.clusterNode.h}
                      />
                    }

                    {/* 파드 */}
                    {activeDashboard.pod &&
                      <Pod
                        x={activeDashboard.pod.x}
                        y={activeDashboard.pod.y}
                        w={activeDashboard.pod.w}
                        h={activeDashboard.pod.h}
                      />
                    }

                    {/* 가상머신 */}
                    {activeDashboard.vm &&
                      <Vm
                        x={activeDashboard.vm.x}
                        y={activeDashboard.vm.y}
                        w={activeDashboard.vm.w}
                        h={activeDashboard.vm.h}
                      />
                    }

                    {/* 쿠버네티스 */}
                    {activeDashboard.kaas &&
                      <Kaas
                        x={activeDashboard.kaas.x}
                        y={activeDashboard.kaas.y}
                        w={activeDashboard.kaas.w}
                        h={activeDashboard.kaas.h}
                      />
                    }

                    {/* 리소스 사용량 */}
                    {activeDashboard.resourceUsage &&
                      <ResourcesUsage monitorStore={monitorStore}
                        x={activeDashboard.resourceUsage.x}
                        y={activeDashboard.resourceUsage.y}
                        w={activeDashboard.resourceUsage.w}
                        h={activeDashboard.resourceUsage.h}
                      />
                    }

                    {/* 네트워크 트래픽 */}
                    {activeDashboard.networkTraffic &&
                      <NetworkTraffic monitorStore={monitorStore}
                        x={activeDashboard.networkTraffic.x}
                        y={activeDashboard.networkTraffic.y}
                        w={activeDashboard.networkTraffic.w}
                        h={activeDashboard.networkTraffic.h}
                      />
                    }

                    {/* 리소스 사용량 Top 5 */}
                    {activeDashboard.usageTop5 &&
                      <UsageTop5
                        x={activeDashboard.usageTop5.x}
                        y={activeDashboard.usageTop5.y}
                        w={activeDashboard.usageTop5.w}
                        h={activeDashboard.usageTop5.h}
                      />
                    }

                    {/* 최근 생성된 리소스 (일주일) */}
                    {activeDashboard.recentResource &&
                      <RecentResource
                        x={activeDashboard.recentResource.x}
                        y={activeDashboard.recentResource.y}
                        w={activeDashboard.recentResource.w}
                        h={activeDashboard.recentResource.h}
                      />
                    }

                    {/* 이슈 */}
                    {activeDashboard.issue &&
                      <Issue
                        x={activeDashboard.issue.x}
                        y={activeDashboard.issue.y}
                        w={activeDashboard.issue.w}
                        h={activeDashboard.issue.h}
                      />
                    }

                    {/* 컴퓨팅 */}
                    <Computing
                      computing={activeDashboard}
                    />

                    {/* 리소스 변화량 */}
                    {activeDashboard.resourceChange &&
                      <ResourceChange monitorStore={monitorStore}
                        x={activeDashboard.resourceChange.x}
                        y={activeDashboard.resourceChange.y}
                        w={activeDashboard.resourceChange.w}
                        h={activeDashboard.resourceChange.h}
                      />
                    }

                    {/* 클러스터 컴포넌트 상태 */}
                    {activeDashboard.clusterStatus &&
                      <ClusterStatus
                        x={activeDashboard.clusterStatus.x}
                        y={activeDashboard.clusterStatus.y}
                        w={activeDashboard.clusterStatus.w}
                        h={activeDashboard.clusterStatus.h}
                      />
                    }

                    {/* bmc 관련 
                    (BMC 노드 현황, 탄소지표, 전력사용량 top 5, cpu 소비 전력량 비교 1대평균
                    탄소 발자국 - 전력 사용량, co2 발생량, 나무, 비용)*/}
                    <Bmc
                      bmc={activeDashboard}
                    />

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

export default inject('rootStore')(observer(CustomDashboard));