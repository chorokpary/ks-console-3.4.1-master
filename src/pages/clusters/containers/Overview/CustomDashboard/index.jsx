import React, { useEffect, useState } from 'react'
import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css';
import './dashboard.css'
import { inject, observer } from 'mobx-react';
import ClusterMonitorStore from 'stores/monitoring/cluster'

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
import BmcNode from './BmcNode';
import CabonIndicator from './CabonIndicator';
import PowerUsageTop5 from './PowerUsageTop5';
import CpuPower from './CpuPower';
import CarbonPower from './CarbonPower';
import CarbonCo2 from './CarbonCo2';
import CarbonTree from './CarbonTree';
import CarbonCost from './CarbonCost';

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

  useEffect(() => {
    GridStack.init(options);

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

  const deleteDashboard = idx => {
    dashboardArr.splice(idx, 1)
    localStorage.setItem("dashboardArr", JSON.stringify(dashboardArr))
    const spliceArr = JSON.parse(localStorage.getItem("dashboardArr"))

    setDashboardArr(spliceArr)
  }

  useEffect(() => {
    setActiveDashboard(dashboardArr[0])
    document.getElementById("dashTab0").click()
  }, [dashboardArr])

  const editDashboard = idx => {
    routing.push(`/clusters/${cluster}/overview/edit?idx=${idx}`)
  }

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
                          <li onClick={() => editDashboard(idx)}><i className="ico-quick-pannel"></i><span>대시보드 편집</span></li>
                          {dashboardArr.length > 1 &&
                            <li onClick={() => deleteDashboard(idx)}><i className="ico-quick-trash"></i><span>대시보드 삭제</span></li>
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

                    {/* BMC 노드 현황 */}
                    {activeDashboard.bmcNode &&
                      <BmcNode
                        x={activeDashboard.bmcNode.x}
                        y={activeDashboard.bmcNode.y}
                        w={activeDashboard.bmcNode.w}
                        h={activeDashboard.bmcNode.h}
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

                    {/* 탄소 지표 */}
                    {activeDashboard.carbonIndicator &&
                      <CabonIndicator
                        x={activeDashboard.carbonIndicator.x}
                        y={activeDashboard.carbonIndicator.y}
                        w={activeDashboard.carbonIndicator.w}
                        h={activeDashboard.carbonIndicator.h}
                      />
                    }

                    {/* 전력 사용량 TOP 5 */}
                    {activeDashboard.powerUsageTop5 &&
                      <PowerUsageTop5
                        x={activeDashboard.powerUsageTop5.x}
                        y={activeDashboard.powerUsageTop5.y}
                        w={activeDashboard.powerUsageTop5.w}
                        h={activeDashboard.powerUsageTop5.h}
                      />
                    }

                    {/* CPU 소비 전력량 비교 (1대 평균) */}
                    {activeDashboard.cpuPower &&
                      <CpuPower
                        x={activeDashboard.cpuPower.x}
                        y={activeDashboard.cpuPower.y}
                        w={activeDashboard.cpuPower.w}
                        h={activeDashboard.cpuPower.h}
                      />
                    }

                    {/* 탄소 발자국 - 전력 사용량 */}
                    {activeDashboard.carbonPower &&
                      <CarbonPower
                        x={activeDashboard.carbonPower.x}
                        y={activeDashboard.carbonPower.y}
                        w={activeDashboard.carbonPower.w}
                        h={activeDashboard.carbonPower.h}
                      />
                    }
                    {/* 탄소 발자국 - CO2 발생량 */}
                    {activeDashboard.carbonCo2 &&
                      <CarbonCo2
                        x={activeDashboard.carbonCo2.x}
                        y={activeDashboard.carbonCo2.y}
                        w={activeDashboard.carbonCo2.w}
                        h={activeDashboard.carbonCo2.h}
                      />
                    }
                    {/* 탄소 발자국 - 나무 */}
                    {activeDashboard.carbonTree &&
                      <CarbonTree
                        x={activeDashboard.carbonTree.x}
                        y={activeDashboard.carbonTree.y}
                        w={activeDashboard.carbonTree.w}
                        h={activeDashboard.carbonTree.h}
                      />
                    }
                    {/* 탄소 발자국 - 비용 */}
                    {activeDashboard.carbonCost &&
                      <CarbonCost
                        x={activeDashboard.carbonCost.x}
                        y={activeDashboard.carbonCost.y}
                        w={activeDashboard.carbonCost.w}
                        h={activeDashboard.carbonCost.h}
                      />
                    }
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