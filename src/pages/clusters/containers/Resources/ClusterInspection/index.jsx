import React, { PureComponent, useState } from 'react';
import { toJS } from 'mobx';
import { PieChart, Pie, Label, Cell } from 'recharts';
import Banner from 'components/Cards/Banner';
import { Panel, Text } from 'components/Base';
import DetailClusterList from 'pages/clusters/containers/Resources/components/DetailClusterList';
import 'pages/clusters/containers/Overview/CustomDashboard/custom_style.css';
import 'pages/clusters/containers/Overview/CustomDashboard/custom_icon.css';
import 'pages/clusters/containers/Overview/CustomDashboard/dashboard.css';

import withList, { ListPage } from 'components/HOCs/withList';

// import { getLocalTime } from 'utils';
// import { ICON_TYPES } from 'utils/constants';

// import RoleStore from 'stores/role';
import ClusterInspectionStore from 'stores/resources/clusterInspection';
import * as common from 'utils/resources';

const tabValue = '';
@withList({
  store: new ClusterInspectionStore(),
  module: 'clusterInspection',
  authKey: 'clusterInspection',
  name: 'ClusterInspection',
})
export default class ClusterInspection extends React.Component {
  componentDidMount() {
    this.props.store.fetchList();
  }

  renderChart() {
    const { data } = toJS(this.props.store.list);
    // console.log('this.props.store', this.props.store.list);
    const clusterInfo = data?.clusterInfo;

    const arrPass = [];
    const arrWarning = [];
    const arrDanger = [];

    data?.auditResults?.map(auditResult => {
      return auditResult.resultInfos.map(resultInfo => {
        return resultInfo.resourceInfos.items.filter(item => {
          arrPass.push(item.level === 'ignore');
          arrWarning.push(item.level === 'warning');
          arrDanger.push(item.level === 'danger');
        });
      });
    });

    const sumPass = arrPass.reduce((prev, curr) => prev + curr, 0);
    const sumWarning = arrWarning.reduce((prev, curr) => prev + curr, 0);
    const sumDanger = arrDanger.reduce((prev, curr) => prev + curr, 0);

    const chartOption = [
      { name: 'Group A', value: sumPass, color: '#55BC8A' },
      { name: 'Group B', value: sumWarning, color: '#F5A623' },
      { name: 'Group C', value: sumDanger, color: '#CA2621' },
    ];
    const COLORS = ['#55BC8A', '#F5A623', '#CA2621'];

    return (
      <>
        <div className="content_box_wrap">
          <div className="grid_wrap cluster">
            <div className="gridbox_wrap">
              <div className="grid_item">
                <div className="grid_title">
                  <label>클러스터 상태</label>
                </div>
                <div className="grid_info style_status">
                  <div className="box type_status">
                    <div className="cont_group">
                      <div className="cont1">
                        <div className="chart_pie">
                          <PieChart width={500} height={160}>
                            {/* width={800} height={400} */}
                            <Pie
                              data={chartOption}
                              //   cs={120}
                              //   cy={200}
                              innerRadius={60}
                              outerRadius={80}
                              //   fill={COLORS}
                              paddingAngle={1}
                              dataKey="value"
                            />
                            {chartOption.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                // fill={COLORS[index % COLORS.length]}
                                fill={entry.color}
                              />
                            ))}
                          </PieChart>
                        </div>
                      </div>
                      <div className="cont2">
                        <div className="status_wrap">
                          <p className="status title">
                            <span>전체 점검 항목</span>
                          </p>
                          <div className="value">
                            {sumPass + sumWarning + sumDanger}
                          </div>
                        </div>
                        <div className="status_wrap">
                          <p className="status pass">
                            <span>Pass</span>
                          </p>
                          <div className="value">{sumPass}</div>
                        </div>
                        <div className="status_wrap">
                          <p className="status warning">
                            <span>Warning</span>
                          </p>
                          <div className="value">{sumWarning}</div>
                        </div>
                        <div className="status_wrap">
                          <p className="status danger">
                            <span>Danger</span>
                          </p>
                          <div className="value">{sumDanger}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="gridbox_wrap">
              <div className="grid_item">
                <div className="grid_title">
                  <label>클러스터 정보</label>
                </div>
                <div className="grid_info style_list">
                  <ul className="list_01">
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-container"></i>
                        <h6 className="list_title">쿠버네티스 버전</h6>
                      </div>
                      <div className="value">{clusterInfo?.version}</div>
                    </li>
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-clusternode"></i>
                        <h6 className="list_title">클러스터 노드</h6>
                      </div>
                      <div className="value">{clusterInfo?.nodesCount}</div>
                    </li>
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-clusternode"></i>
                        <h6 className="list_title">네임스페이스 개수</h6>
                      </div>
                      <div className="value">
                        {clusterInfo?.namespacesCount}
                      </div>
                    </li>
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-clusternode"></i>
                        <h6 className="list_title">워크로드 개수</h6>
                      </div>
                      <div className="value">{clusterInfo?.workloadsCount}</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  render() {
    const { list, bannerProps } = this.props.store;
    const { data } = toJS(this.props.store.list);

    return (
      <>
        <Banner
          icon="apps"
          {...bannerProps}
          title={`클러스터 인스펙션 모니터링`}
          description={`클러스터의 상태를 모니터링 합니다.`}
        />
        {this.renderChart()}
        {/* <Tabs tabs={this.tabs} /> */}

        <DetailClusterList {...data} tabValue={tabValue} />
      </>
    );
  }
}
