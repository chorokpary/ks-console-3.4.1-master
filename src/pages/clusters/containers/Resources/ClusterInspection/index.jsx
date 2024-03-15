import React, { PureComponent, useState } from 'react';
import { toJS } from 'mobx';
import {
  PieChart,
  Pie,
  Label,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
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
        name: t('CLUSTER_INSPECTION_PASS'),
        value: data?.scoreInfo?.passing || 0,
        color: '#55BC8A',
      },
      {
        name: t('CLUSTER_INSPECTION_WARNING'),
        value: data?.scoreInfo?.warning || 0,
        color: '#F5A623',
      },
      {
        name: t('CLUSTER_INSPECTION_DANGER'),
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
                  <label>{t('CLUSTER_INSPECTION_CLUSTER_STATUS')}</label>
                </div>
                <div className="grid_info style_status">
                  <div className="box type_status">
                    <div className="cont_group">
                      <div className="cont1">
                        <div
                          className="chart_pie"
                          style={{ width: '100%', height: '200px' }}
                        >
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={chartOption}
                                cx="50%"
                                cy="50%"
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
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="cont2">
                        <div className="status_wrap">
                          <p className="status title">
                            <span>
                              {t('CLUSTER_INSPECTION_CHECK_ALL_LIST')}
                            </span>
                          </p>
                          <div className="value">
                            {data?.scoreInfo?.total || 0}
                          </div>
                        </div>
                        <div className="status_wrap">
                          <p className="status pass">
                            <span>{t('CLUSTER_INSPECTION_PASS')}</span>
                          </p>
                          <div className="value">
                            {data?.scoreInfo?.passing || 0}
                          </div>
                        </div>
                        <div className="status_wrap">
                          <p className="status warning">
                            <span>{t('CLUSTER_INSPECTION_WARNING')}</span>
                          </p>
                          <div className="value">
                            {data?.scoreInfo?.warning || 0}
                          </div>
                        </div>
                        <div className="status_wrap">
                          <p className="status danger">
                            <span>{t('CLUSTER_INSPECTION_DANGER')}</span>
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
                  <label>{t('CLUSTER_INSPECTION_CLUSTER_INFO')}</label>
                </div>
                <div className="grid_info style_list">
                  <ul className="list_01">
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-container"></i>
                        <h6 className="list_title">
                          {t('CLUSTER_INSPECTION_K8S_VERSION')}
                        </h6>
                      </div>
                      <div className="value">{clusterInfo?.version || 0}</div>
                    </li>
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-clusternode"></i>
                        <h6 className="list_title">
                          {t('CLUSTER_INSPECTION_NODE')}
                        </h6>
                      </div>
                      <div className="value">
                        {clusterInfo?.nodesCount || 0}
                      </div>
                    </li>
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-clusternode"></i>
                        <h6 className="list_title">
                          {t('CLUSTER_INSPECTION_NAMESPACE_CNT')}
                        </h6>
                      </div>
                      <div className="value">
                        {clusterInfo?.namespacesCount || 0}
                      </div>
                    </li>
                    <li className="li_type_01">
                      <div className="lft">
                        <i className="ico-type24-clusternode"></i>
                        <h6 className="list_title">
                          {t('CLUSTER_INSPECTION_WORKLOAD_CNT')}
                        </h6>
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
          title={t('CLUSTER_INSPECTION_MORNITORING')}
          description={t('CLUSTER_INSPECTION_DESC')}
        />
        {this.renderChart()}

        <DetailClusterList {...data} tabValue={tabValue} />
      </>
    );
  }
}
