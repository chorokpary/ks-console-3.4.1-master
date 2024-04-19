/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import { toJS } from 'mobx'
import { Avatar, Text, Indicator } from 'components/Base'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'
import Empty from 'components/Tables/Base/Empty'
import classNames from 'classnames'

import Banner from 'components/Cards/Banner'
import { Button, Notify } from '@kube-design/components'
import { cloneDeep, get, isEmpty, omit, find } from 'lodash'
import { getValueByUnit } from 'utils/monitoring'

import styles from './index.scss'

import BareMetalStore from 'stores/resources/baremetal'
import CustomStore from 'stores/monitoring/custom/monitor'

import Carbon from './Carbon'
import CpuUsage from './CpuUsage';

@withList({
  store: new BareMetalStore(),
  module: 'baremetal',
  authKey: 'baremetal',
  name: t('RESOURCES_BAREMETAL'),
})
export default class BareMetalDashboard extends React.Component {

  customStore = new CustomStore()

  //auto refresh start  ##################################
  constructor(props) {
    super(props)
    this.refreshTimer = setInterval(() => this.refreshHandler(), 40000)

    this.state = {
      metricFlag: true,
      metricStateData: [],
      metricModelData: [],
      metricTypeData: [],
      metricCoreData: [],
      metricCpuData: [],
      metricMemoryTotalData: [],
      metricMemoryFreeData: [],
      metricDiskTotalData: [],
      metricDiskFreeData: [],
      metricPowerData: [],
      metricTemperatureData: [],
    };
  }

  componentDidUpdate() {
    if (this.refreshTimer === null && this.isRuning) {
      this.refreshTimer = setInterval(() => this.refreshHandler(), 40000)
    }

    const { metricFlag } = this.state;
    if (metricFlag) {
      this.getInitMetricData()
    }
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer)
    this.unsubscribe && this.unsubscribe()
  }

  refreshHandler = () => {
    if (this.isRuning) {
      this.getData({ silent: true })
    } else {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  get isRuning() {
    const { data } = toJS(this.props.store.list)
    const runingData = data.filter(
      item => item.status !== 'failed' && item.status !== 'successful'
    )
    return !isEmpty(runingData)
  }

  getData = params => {
    this.props.store.fetchList({
      ...this.props.match.params,
      ...params,
    })
  }
  //auto refresh end  ##################################

  // metric get data start  ##################################
  getInitMetricData = async () => {

    const metric_state = await this.customStore.fetchMetric({
      expr: `group by(target) (redfish_system_power_state)`,
    })

    const metric_model = await this.customStore.fetchMetric({
      expr: `group by(target, model) (redfish_chassis_model_info)`,
    })

    const metric_type = await this.customStore.fetchMetric({
      expr: `group by(instance, machine) (node_uname_info)`,
    })

    const metric_core = await this.customStore.fetchMetric({
      expr: `count(node_cpu_seconds_total{mode="idle"}) without (cpu,mode)`,
    })

    const metric_cpu = await this.customStore.fetchMetric({
      expr: `sum by(instance) (rate(node_cpu_seconds_total{mode!="idle"}[5m]))`,
    })

    const metric_memory_total = await this.customStore.fetchMetric({
      expr: `avg by(instance) (node_memory_MemTotal_bytes)`,
    })

    const metric_memory_free = await this.customStore.fetchMetric({
      expr: `avg by (instance) (node_memory_MemFree_bytes)`,
    })

    const metric_disk_total = await this.customStore.fetchMetric({
      expr: `sum by(instance) (node_filesystem_size_bytes)`,
    })

    const metric_disk_free = await this.customStore.fetchMetric({
      expr: `sum by(instance) (node_filesystem_avail_bytes)`,
    })

    const metric_power = await this.customStore.fetchMetric({
      expr: `avg by(target) (redfish_chassis_power_powersupply_last_power_output_watts)`,
    })

    const metric_temperature = await this.customStore.fetchMetric({
      expr: `avg by(target) (redfish_chassis_temperature_celsius)`,
    })

    this.setState({
      metricFlag: false,
      metricStateData: metric_state,
      metricModelData: metric_model,
      metricTypeData: metric_type,
      metricCoreData: metric_core,
      metricCpuData: metric_cpu,
      metricMemoryTotalData: metric_memory_total,
      metricMemoryFreeData: metric_memory_free,
      metricDiskTotalData: metric_disk_total,
      metricDiskFreeData: metric_disk_free,
      metricPowerData: metric_power,
      metricTemperatureData: metric_temperature,
    });

  };
  // metric get data end  ##################################


  showAction(record) {
    return globals.user.username !== record.name
  }

  showEdit(record) {
    const address = get(record, ['openBMC', 'address'])
    const username = get(record, ['openBMC', 'username'])
    const password = get(record, ['openBMC', 'password'])
    const showFlag = (!!address && !!username && !!password) ? true : false;
    return showFlag;
  }

  get itemActions() {
    const { getData, trigger } = this.props
    return [
      {
        key: 'action1',
        icon: 'pen',
        text: t('Force-Off'),
        action: 'edit',
        show: record => this.showEdit(record),
        onClick: item => {
          trigger('baremetal.action', {
            detail: item,
            resetType: "ForceOff",
            success: getData,
            ...this.props.match.params,
          })
        },
      },
      {
        key: 'action2',
        icon: 'pen',
        text: t('Graceful-Restart'),
        action: 'edit',
        show: record => this.showEdit(record),
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            resetType: "GracefulRestart",
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'action3',
        icon: 'pen',
        text: t('Graceful-Shutdown'),
        action: 'edit',
        show: record => this.showEdit(record),
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            resetType: "GracefulShutdown",
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'action4',
        icon: 'pen',
        text: t('Turn On'),
        action: 'edit',
        show: record => this.showEdit(record),
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            resetType: "On",
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('RESOURCES_DELETE'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('baremetal.remove', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
    ]
  }

  get tableActions() {
    const { trigger, getData, routing, tableProps } = this.props

    return {
      ...tableProps.tableActions,
      actions: [
        {
          key: 'regist',
          type: 'control',
          text: t('RESOURCES_REGISTRATION'),
          action: 'create',
          onClick: () =>
            trigger('baremetal.regist', {
              ...this.props.match.params,
              type: this.name,
              success: getData,
            }),
        },
      ],
      selectActions: [
      ],
    }
  }

  getMetricData = (metricData, record, type) => {
    const instance = record.system_type == "C" ? record.name : record.nodeExporter.ip;
    const target = record.openBMC?.address;

    const metrics = type == "redfish" ? this.state[metricData].find(item => get(item, 'metric.target') === target)
      : record.system_type == "C"
        ? this.state[metricData].find(item => get(item, 'metric.instance') === instance)
        : this.state[metricData].find(item => get(item, 'metric.instance', ':').split(":")[0] === instance);
    return metrics;
  }

  getMetricValue = (metricData, record, type) => {
    const instance = record.system_type == "C" ? record.name : record.nodeExporter.ip;
    const target = record.openBMC?.address;

    const metrics = type == "redfish" ? this.state[metricData].find(item => get(item, 'metric.target') === target)
      : record.system_type == "C"
        ? this.state[metricData].find(item => get(item, 'metric.instance') === instance)
        : this.state[metricData].find(item => get(item, 'metric.instance', ':').split(":")[0] === instance);
    const value = get(metrics, 'value[1]', '0');
    return value;
  }

  getState(state) {
    if (state === 'on') {
      return "active"
    } else if (state === 'off') {
      return "inactive"
    } else {
      return "warning"
    }
  }

  getColumns = () => {
    const { getSortOrder } = this.props
    const { cluster } = this.props.match.params
    return [
      {
        title: t('RESOURCES_NODE_NAME'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('job'),
        render: (name, record) => {
          const ip = record.system_type == "C" ? "" : record.nodeExporter.ip;
          return (
            <Avatar
              icon="nodes"
              iconSize={40}
              to={`/clusters/${cluster}/baremetalmonitoring/${name}`}
              title={name}
              desc={ip}
            />
          )
        }
      },
      {
        title: t('RESOURCES_STATE'),
        key: 'state',
        isHideable: true,
        render: record => {
          const state = this.getMetricValue('metricStateData', record, 'redfish')
          const statText = (state == 1 || state == 3) ? "On" : (state == 2 || state == 4) ? "Off" : "Unknown"
          return (
            <Text title={`${statText}`} />
          )
        }
      },
      {
        title: t('RESOURCES_SERVER_MODEL_NAME'),
        key: 'model',
        isHideable: true,
        render: record => {
          const metrics = this.getMetricData('metricModelData', record, 'redfish')
          const modelName = get(metrics, 'metric.model', '-')
          return (
            <Text title={`${modelName}`} />
          )
        }
      },
      {
        title: t('RESOURCES_CPU_TYPE'),
        key: 'type',
        isHideable: true,
        render: record => {
          const metrics = this.getMetricData('metricTypeData', record)
          const machine = get(metrics, 'metric.machine', "NOT")
          const x86Array = ['x86_64', 'amd']
          const typeText = x86Array.includes(machine.toLowerCase()) ? t('RESOURCES_AMD64') : machine == "NOT" ? "-" : t('RESOURCES_ARM64')
          return (
            <Text title={`${typeText}`} />
          )
        }
      },
      {
        title: t('RESOURCES_CORE_COUNT'),
        key: 'core',
        isHideable: true,
        render: record => {
          const coreCount = this.getMetricValue('metricCoreData', record)
          return (
            <Text title={`${coreCount}`} />
          )
        }
      },
      // {
      //   title: t('Max, Clock Rate(GHz)'),
      //   key: 'rate',
      //   isHideable: true,
      //   render: record => {
      //     const clockRate = "8"
      //     return (
      //       <Text title={`${clockRate}`}/>
      //     )
      //   }
      // },
      {
        title: t('CPU'),
        key: 'cpu',
        isHideable: true,
        render: record => {
          const cpu = Math.round(this.getMetricValue('metricCpuData', record)).toFixed(1);
          const coreCount = this.getMetricValue('metricCoreData', record)
          return (
            <Text title={`${cpu}%`} description={`${coreCount}core`} />
          )
        }
      },
      {
        title: t('RESOURCES_MEMORY'),
        key: 'memory',
        isHideable: true,
        render: record => {
          const memory_total_data = this.getMetricValue('metricMemoryTotalData', record)
          const memory_free_data = this.getMetricValue('metricMemoryFreeData', record)

          const memory_total = getValueByUnit(memory_total_data, "Gi")
          const memory_free = getValueByUnit(memory_free_data, "Gi")
          const memory_used = (memory_total - memory_free).toFixed(2)

          const memory_percent = isNaN(((memory_used / memory_total) * 100).toFixed(0)) ? 0 : ((memory_used / memory_total) * 100).toFixed(0)
          return (
            <Text title={`${memory_percent}%`} description={`${memory_used}Gi/${memory_total}Gi`} />
          )
        }
      },
      {
        title: t('RESOURCES_DISK'),
        key: 'disk',
        isHideable: true,
        render: record => {
          const disk_total_data = this.getMetricValue('metricDiskTotalData', record)
          const disk_free_data = this.getMetricValue('metricDiskFreeData', record)

          const disk_total = getValueByUnit(disk_total_data, "GB")
          const disk_free = getValueByUnit(disk_free_data, "GB")
          const disk_used = (disk_total - disk_free).toFixed(2)

          const disk_percent = isNaN(((disk_used / disk_total) * 100).toFixed(0)) ? 0 : ((disk_used / disk_total) * 100).toFixed(0)
          return (
            <Text title={`${disk_percent}%`} description={`${disk_used}GB/${disk_total}GB`} />
          )
        }
      },
      {
        title: t('RESOURCES_POWER') + '(Watt)',
        key: 'power',
        isHideable: true,
        render: record => {
          var power = this.getMetricValue('metricPowerData', record, 'redfish')
          return (
            <Text title={`${power}`} />
          )
        }
      },
      {
        title: t('RESOURCES_TEMPERRATURE') + '(°C)',
        key: 'temperature',
        isHideable: true,
        render: record => {
          const temperature = this.getMetricValue('metricTemperatureData', record, 'redfish')
          return (
            <Text title={`${Math.round(Number(temperature))}`} />
          )
        }
      },
      {
        title: t('RESOURCES_CARBON_EMISSIONS') + '(Kg)',
        key: 'carbon',
        isHideable: true,
        render: record => {
          const power = this.getMetricValue('metricPowerData', record)
          const carbon = (Math.round((power * 0.4781) / 0.1) * 0.1).toFixed(1);
          return (
            <Text title={`${carbon}`} />
          )
        }
      },
    ]
  }

  get emptyProps() {
    return { desc: t('RESOURCES_PLEASE_CREATE_DATA') }
  }


  handleCreate = () => {
    const { trigger, module } = this.props

    trigger('baremetal.regist', {
      module,
      trigger,
      success: this.getData,
    })
  }


  renderNodeStateContent() {

    const { metricStateData } = this.state;
    const { data } = toJS(this.props.store.list)

    const totalCount = data.length;
    const nodeOnData = metricStateData.filter(item => (get(item, 'value[1]') == 1 || get(item, 'values[1]') == 3))
    const nodeOffData = metricStateData.filter(item => (get(item, 'value[1]') == 2 || get(item, 'values[1]') == 4))

    // error 관련 flag가 없기 때문에 APi 등록된 전체에서 on, off 갯수를 뺀다.
    let nodeErrorCount = 0;
    nodeErrorCount = totalCount - (nodeOnData.length + nodeOffData.length);

    return (
      <div className="value_box_wrap">
        <div className="value_box">
          <div className="div_value">
            <div className="txt_group">
              <div className="text_title">{t('RESOURCES_ALL')}</div>
            </div>
            <div className="number_wrap">{totalCount}</div>
          </div>
          <div className="div_value">
            <div className="txt_group">
              <div className="status_point"></div>
              <div className="text_title">On</div>
            </div>
            <div className="number_wrap">{nodeOnData.length}</div>
          </div>
          <div className="div_value">
            <div className="txt_group">
              <div className="status_point_off"></div>
              <div className="text_title">Off</div>
            </div>
            <div className="number_wrap">{nodeOffData.length}</div>
          </div>
          <div className="div_value">
            <div className="txt_group">
              <div className="status_point_unknown"></div>
              <div className="text_title">Unknown</div>
            </div>
            <div className="number_wrap">{nodeErrorCount}</div>
          </div>
        </div>
      </div>
    )
  }

  renderContent() {
    const {
      data = [],
      filters,
      isLoading,
      total,
      page,
      limit,
      selectedRowKeys,
    } = toJS(this.props.store.list)

    const isEmptyList = isLoading === false && total === 0
    const omitFilters = omit(filters, ['limit', 'page'])
    const showCreate = this.handleCreate;

    if (isEmptyList && Object.keys(omitFilters).length <= 0) {
      return (
        <Empty
          name="BareMetal"
          desc={t('RESOURCES_PLEASE_CREATE_DATA')}
          action={
            showCreate ? (
              <Button onClick={showCreate} type="control">
                {t('CREATE')}
              </Button>
            ) : null
          }
        />
      )
    }

    const pagination = { total, page, limit }

    const { tableProps } = this.props
    //console.log({ ...this.props })

    return (
      <Table
        {...tableProps}
        rowKey="name"
        data={data}
        selectedRowKeys={toJS(selectedRowKeys)}
        columns={this.getColumns()}
        filters={omitFilters}
        pagination={pagination}
        isLoading={isLoading}
        onCreate={showCreate}
        tableActions={this.tableActions}
        itemActions={this.itemActions}
        hideRefresh
        hideSearch
        style={{ overflow: 'unset' }}
      />
    )
  }

  getBanner = () => {
    return <i className="ico-type-bmcnode"></i>
  }

  render() {

    const { bannerProps } = this.props
    // console.log({ ...this.props })
    return (

      <ListPage {...this.props}>

        <Banner
          // icon="linechart"
          icon={this.getBanner}
          title={t('RESOURCES_BAREMETAL_MONITORING')}
          description={t('RESOURCES_BAREMETAL_MONITORING_DESC')}
        />

        <div className="content_box_wrap">
          {/* 탄소 지표 */}
          <Carbon {...this.props} />

          {/* CPU 소비 전력량 비교 */}
          <CpuUsage {...this.props} />

          {/* 노드 상태  */}
          {this.renderNodeStateContent()}
        </div>

        {/* 리스트  */}
        {this.renderContent()}

      </ListPage>

    )
  }
}
