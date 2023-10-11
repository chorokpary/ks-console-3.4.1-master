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
import K8sStatus from './K8sStatus';
import BmcNode from './BmcNode';

const CustomDashboard = (props) => {

  const { cluster } = props.match.params
  const { routing } = props.rootStore;

  const monitorStore = new ClusterMonitorStore({ cluster })

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

  }, [])



  const editMode = () => {
    routing.push(`/clusters/${cluster}/overview/edit`)
  }
  return (
    <>
      <div className="dashboard">
        <div className="content-wrapper content_wrap">
          <div className="dash_wrap">

            <section>
              {/* Top area */}
              <div className="dash_toptab">
                <label htmlFor="name1">
                  <input type="radio" name="mode" id="name1" value="name1" defaultChecked />
                  <span>대시보드 1
                    <div className="tab-quick-menu">
                      <button type="button" className="btn_quick"><i className="ico-quick-menu"></i></button>
                      <ul className="quick-menu-list">
                        <li><i className="ico-quick-pannel"></i><span>대시보드 편집</span></li>
                        <li><i className="ico-quick-trash"></i><span>대시보드 삭제</span></li>
                      </ul>
                    </div>
                  </span>
                </label>
                {/* <label htmlFor="name2">
                  <input type="radio" name="mode" id="name2" value="name2" />
                  <span>대시보드 2
                    <div className="tab-quick-menu">
                      <button type="button" className="btn_quick"><i className="ico-quick-menu"></i></button>
                      <ul className="quick-menu-list">
                        <li><i className="ico-quick-pannel"></i><span>대시보드 편집</span></li>
                        <li><i className="ico-quick-trash"></i><span>대시보드 삭제</span></li>
                      </ul>
                    </div>
                  </span>
                </label> */}
                <button type="button" className="btn_dash_add" onClick={() => editMode()}><i className="ico-plus"></i></button>
              </div>
              {/* // Top area */}

              {/* tab-content */}
              <div className="tab-content">

                <div className="grid_wrap">
                  <div className="grid-stack">

                    {/* 클러스터 노드 */}
                    <ClusterNode />

                    {/* 파드 */}
                    <Pod />

                    {/* 가상머신 */}
                    <Vm />

                    {/* 쿠버네티스 */}
                    <Kaas />

                    {/* 리소스 사용량 */}
                    <ResourcesUsage monitorStore={monitorStore} />

                    {/* 네트워크 트래픽 */}
                    <NetworkTraffic monitorStore={monitorStore} />

                    {/* 리소스 사용량 Top 5 */}
                    <UsageTop5 />

                    {/* 최근 생성된 리소스 (일주일) */}
                    <RecentResource />

                    {/* 이슈 */}
                    <Issue />

                    {/* 컴퓨팅 유형별 현황 */}
                    <Computing />

                    {/* 리소스 변화량 */}
                    <ResourceChange monitorStore={monitorStore} />

                    {/* BMC 노드 현황 */}
                    <BmcNode />

                    {/* 쿠버네티스 컴포넌트 상태 */}
                    <K8sStatus />
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