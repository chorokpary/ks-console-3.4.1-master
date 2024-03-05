import React, { PureComponent, useState } from 'react';
import { toJS } from 'mobx';
import {
  PieChart,
  Pie,
  Label,
  LabelList,
  Cell,
  Tooltip as ChartTooltip,
} from 'recharts';
// import { Tooltip } from '@kubed/components';
import Banner from 'components/Cards/Banner';
import { Panel, Text } from 'components/Base';
import DetailClusterList from 'pages/clusters/containers/Resources/components/DetailClusterList';
import 'pages/clusters/containers/Overview/CustomDashboard/custom_style.css';
import 'pages/clusters/containers/Overview/CustomDashboard/custom_icon.css';
import 'pages/clusters/containers/Overview/CustomDashboard/dashboard.css';

import withList, { ListPage } from 'components/HOCs/withList';

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
    const clusterInfo = data?.clusterInfo;
    const chartOption = [
      {
        name: 'passing',
        value: data?.scoreInfo?.passing || 0,
        color: '#55BC8A',
      },
      {
        name: 'warning',
        value: data?.scoreInfo?.warning || 0,
        color: '#F5A623',
      },
      {
        name: 'dangerous',
        value: data?.scoreInfo?.dangerous || 0,
        color: '#CA2621',
      },
    ];

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
                            <Pie
                              data={chartOption}
                              cx={300}
                              cy={75}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={1}
                              dataKey="value"
                            >
                              {chartOption.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                              <Label
                                value={data?.scoreInfo?.score}
                                position="center"
                                fontSize={50}
                                dy={-10}
                              />
                              <Label
                                value={`Health Score`}
                                position="bottom"
                                fontSize={13}
                                dy={25}
                                dx={70}
                              />
                            </Pie>
                            <ChartTooltip />
                          </PieChart>
                        </div>
                      </div>
                      <div className="cont2">
                        <div className="status_wrap">
                          <p className="status title">
                            <span>전체 점검 항목</span>
                          </p>
                          <div className="value">
                            {data?.scoreInfo?.total || 0}
                          </div>
                        </div>
                        <div className="status_wrap">
                          <p className="status pass">
                            <span>Pass</span>
                          </p>
                          <div className="value">
                            {data?.scoreInfo?.passing || 0}
                          </div>
                        </div>
                        <div className="status_wrap">
                          <p className="status warning">
                            <span>Warning</span>
                          </p>
                          <div className="value">
                            {data?.scoreInfo?.warning || 0}
                          </div>
                        </div>
                        <div className="status_wrap">
                          <p className="status danger">
                            <span>Danger</span>
                          </p>
                          <div className="value">
                            {data?.scoreInfo?.dangerous || 0}
                          </div>
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
                      <div className="value">{clusterInfo?.version || 0}</div>
                    </li>
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-clusternode"></i>
                        <h6 className="list_title">클러스터 노드</h6>
                      </div>
                      <div className="value">
                        {clusterInfo?.nodesCount || 0}
                      </div>
                    </li>
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-clusternode"></i>
                        <h6 className="list_title">네임스페이스 개수</h6>
                      </div>
                      <div className="value">
                        {clusterInfo?.namespacesCount || 0}
                      </div>
                    </li>
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-clusternode"></i>
                        <h6 className="list_title">워크로드 개수</h6>
                      </div>
                      <div className="value">
                        {clusterInfo?.workloadsCount || 0}
                      </div>
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

        <DetailClusterList {...data} tabValue={tabValue} />
      </>
    );
  }
}
