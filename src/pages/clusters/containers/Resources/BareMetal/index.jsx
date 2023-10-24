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
import { Avatar, Status, Panel, Text, Modal } from 'components/Base'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'
import Empty from 'components/Tables/Base/Empty'

import { Button, Notify } from '@kube-design/components'
import { cloneDeep, get, isEmpty, omit, find } from 'lodash'
import { getValueByUnit } from 'utils/monitoring'

import BareMetalStore from 'stores/resources/baremetal'
import CustomStore from 'stores/monitoring/custom/monitor'

import '../../Overview/CustomDashboard/custom_icon.css'
import '../../Overview/CustomDashboard/custom_style.css'

import Carbon from './Carbon'
import CpuUsage from './CpuUsage';


@withList({
  store: new BareMetalStore(),
  module: 'baremetal',
  authKey: 'baremetal',
  name: '베어메탈',
})
export default class BareMetalDashboard extends React.Component {
  
  customStore = new CustomStore()

  //auto refresh start  ##################################
  constructor(props) {
    super(props)
    this.refreshTimer = setInterval(() => this.refreshHandler(), 40000)

    const currentTime = Math.floor(Date.now() / 1000);
    this.currentTime = currentTime
    this.step = "5m";
    this.times = 100;
    this.start = currentTime - 30000;
    this.end = currentTime;

    this.state = {
      metricFlag : true,
      metricStateData : [],
      metricModelData : [],
      metricTypeData : [],
      metricCoreData : [],
      metricCpuData : [],
      metricMemoryTotalData : [],
      metricMemoryFreeData : [],
      metricDiskTotalData : [],
      metricDiskFreeData : [],
      metricPowerData : [],
      metricTemperatureData : [],
    };
  }
 
  componentDidUpdate() {
    if (this.refreshTimer === null && this.isRuning) {
      this.refreshTimer = setInterval(() => this.refreshHandler(), 40000)
    }

    const { metricFlag } = this.state;
    if(metricFlag){ 
      this.getMetricData() 
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
  getMetricData = async () => {

    const metric_state = await this.customStore.fetchMetric({
      expr: `max by(instance) (redfish_system_power_state)`,
      start: this.currentTime,
      end: this.currentTime,
    })

    const metric_model = await this.customStore.fetchMetric({
      expr: `max by(instance, model) (redfish_chassis_model_info)`,
      start: this.currentTime,
      end: this.currentTime,
    })

    const metric_type = await this.customStore.fetchMetric({
      expr: `max by(instance, machine) (node_uname_info)`,
      start: this.currentTime,
      end: this.currentTime,
    })

    const metric_core = await this.customStore.fetchMetric({
      expr: `count(node_cpu_seconds_total{mode="idle"}) without (cpu,mode)`,
      start: this.currentTime,
      end: this.currentTime,
    })

    const metric_cpu = await this.customStore.fetchMetric({
      expr: `sum by(instance) (rate(node_cpu_seconds_total{mode!="idle"}[5m]))`,
      start: this.currentTime,
      end: this.currentTime,
    })

    const metric_memory_total = await this.customStore.fetchMetric({
      expr: `avg by(instance) (node_memory_MemTotal_bytes)`,
      start: this.currentTime,
      end: this.currentTime,
    })

    const metric_memory_free = await this.customStore.fetchMetric({
      expr: `avg by (instance) (node_memory_MemFree_bytes)`,
      start: this.currentTime,
      end: this.currentTime,
    })

    // const metric_disk_total = await this.customStore.fetchMetric({
    //   expr: `avg by(instance) (node_memory_MemTotal_bytes)`,
    //   start: this.currentTime,
    //   end: this.currentTime,
    // })

    // const metric_disk_free = await this.customStore.fetchMetric({
    //   expr: `avg by (instance) (node_memory_MemFree_bytes)`,
    //   start: this.currentTime,
    //   end: this.currentTime,
    // })


    const metric_power = await this.customStore.fetchMetric({
      expr: `avg by(instance) (redfish_chassis_power_powersupply_last_power_output_watts)`,
      start: this.currentTime,
      end: this.currentTime,
    })

   
    const metric_temperature = await this.customStore.fetchMetric({
      expr: `avg by(instance) (redfish_chassis_temperature_celsius)`,
      start: this.currentTime,
      end: this.currentTime,
    })


    this.setState({
      metricFlag: false,
      metricStateData: metric_state,
      metricModelData: metric_model,
      metricTypeData: metric_type,
      metricCoreData: metric_core,
      metricCpuData : metric_cpu,
      metricMemoryTotalData : metric_memory_total,
      metricMemoryFreeData : metric_memory_free,
      metricDiskTotalData : [],
      metricDiskFreeData : [],
      metricPowerData : metric_power,
      metricTemperatureData : metric_temperature,   
    });

  };
  // metric get data end  ##################################


  showAction(record) {
    return globals.user.username !== record.name
  }

  get itemActions() {
    const { getData, trigger } = this.props
    return [
      {
        key: 'action1',
        icon: 'pen',
        text: t('Force-Off'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'action2',
        icon: 'pen',
        text: t('Force-Restart'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'action3',
        icon: 'pen',
        text: t('Graceful-Shutdown'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'action4',
        icon: 'pen',
        text: t('Turn On'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
      // {
      //   key: 'delete',
      //   icon: 'trash',
      //   text: t('삭제'),
      //   action: 'delete',
      //   show: this.showAction,
      //   onClick: item =>
      //     trigger('keypair.remove', {
      //       detail: item,
      //       success: getData,
      //       ...this.props.match.params,
      //     }),
      // },
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
          text: t('등록'),
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

  getColumns = () => {
    const { getSortOrder } = this.props
    const { cluster } = this.props.match.params
    return [
      {
        title: t('노드명'),
        dataIndex: 'job',
        sorter: true,
        sortOrder: getSortOrder('job'),
        render: name => (
          <Avatar
            icon="nodes"
            iconSize={40}
            to={`/clusters/${cluster}/baremetalmonitoring/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('상태'),
        key: 'state',
        isHideable: true,
        render: record => {
          const { metricStateData } = this.state;
          const metrics = metricStateData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const state = get(metrics, 'values[0][1]');
          const statText = (state == 1 || state == 3) ? "On" : "Off"
          return (
            <Text title={`${statText}`}/>
          )
        }
      },
      {
        title: t('서버 모델명'),
        key: 'model',
        isHideable: true,
        render: record => {
          const { metricModelData } = this.state;
          const metrics = metricModelData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const modelName = get(metrics, 'metric.model')     
          return (
            <Text title={`${modelName}`}/>
          )
        }
      },
      {
        title: t('유형'),
        key: 'type',
        isHideable: true,
        render: record => {
          const { metricTypeData } = this.state;
          const metrics = metricTypeData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const machine = get(metrics, 'metric.machine',"NOT")     
          const typeText = (machine == "NOT") ? "-" : machine.includes('x86') ? "X86" : "ARM"
          return (
            <Text title={`${typeText}`} />
          )
        }
      },
      {
        title: t('코어 수'),
        key: 'core',
        isHideable: true,
        render: record => {         
          const { metricCoreData } = this.state;
          const metrics = metricCoreData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const coreCount = get(metrics, 'values[0][1]', 0);         
          return (
            <Text title={`${coreCount}`}/>
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
          const { metricCpuData, metricCoreData } = this.state;

          const metrics_cpu = metricCpuData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const cpu = Math.round(get(metrics_cpu, 'values[0][1]', 0) * 100);

          const metrics_core = metricCoreData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const coreCount = get(metrics_core, 'values[0][1]', 0);
          return (
            <Text title={`${cpu}%`} description={`${coreCount}core`} />
          )
        }
      },
      {
        title: t('메모리'),
        key: 'memory',
        isHideable: true,
        render: record => {
          const { metricMemoryTotalData, metricMemoryFreeData } = this.state;

          const metrics_memory_total = metricMemoryTotalData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const memory_total_data = get(metrics_memory_total, 'values[0][1]', 0);

          const metrics_memory_free = metricMemoryFreeData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const memory_free_data = get(metrics_memory_free, 'values[0][1]', 0);

          const memory_total = getValueByUnit(memory_total_data, "Gi")
          const memory_free = getValueByUnit(memory_free_data, "Gi")
          const memory_used = (memory_total-memory_free).toFixed(2)

          const memory_percent = ((memory_used/memory_total)*100).toFixed(0)
          return (
            <Text title={`${memory_percent}%`} description={`${memory_used}Gi/${memory_total}Gi`} />
          )
        }
      },
      {
        title: t('디스크'),
        key: 'disk',
        isHideable: true,
        render: record => {
          const disk = "25"
          return (
            <Text title={`${disk}%`} description={`232GB/1000GB`} />
          )
        }
      },
      {
        title: t('파워(kW)'),
        key: 'power',
        isHideable: true,
        render: record => {
          const { metricPowerData } = this.state;
          const metrics = metricPowerData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const power = get(metrics, 'values[0][1]', 0);
          return (
            <Text title={`${power}`}/>
          )
        }
      },
      {
        title: t('온도(°C)'),
        key: 'temperature',
        isHideable: true,
        render: record => {
          const { metricTemperatureData } = this.state;
          const metrics = metricTemperatureData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const temperature = get(metrics, 'values[0][1]', 0);
          return (
            <Text title={`${temperature}`}/>
          )
        }
      },
      {
        title: t('탄소 배출량(Kg)'),
        key: 'cabon',
        isHideable: true,
        render: record => {
          const { metricPowerData } = this.state;
          const metrics = metricPowerData.find(item => get(item, 'metric.instance').split(":")[0] === toJS(record.instance).split(":")[0])
          const power = get(metrics, 'values[0][1]', 0);
          const cabon = (Math.round((power  * 0.4781) / 0.1)*0.1).toFixed(1);
          return (
            <Text title={`${cabon}`}/>
          )
        }
      },      
    ]
  }

  get emptyProps() {
    return { desc: t('Please create a data.') }
  }


  handleCreate = () => {
    const { trigger, module } = this.props

    trigger('keypair.regist', {
      module,
      trigger,
      success: this.getData,
    })
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
          desc="Please create a data"
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
        hideSearch
        hideRefresh
      />
    )
  }

  render() {
    
    const { bannerProps } = this.props
    // console.log({ ...this.props })
    return (
      
      <ListPage {...this.props}>

        <div className="content_box_wrap">

          {/* CPU 소비 전력량 비교 */}
          <Carbon />

          {/* CPU 소비 전력량 비교 */}
          <CpuUsage />

          <div className="value_box_wrap">
            <div className="value_box">
              <div className="div_value">
                <div className="txt_group">
                    <div className="text_title">전체</div>
                  </div>
                <div className="number_wrap">24</div>
              </div>
              <div className="div_value">
                <div className="txt_group">
                  <div className="status_point"></div>
                  <div className="text_title">On</div>
                </div>
                <div className="number_wrap">19</div>
              </div>
              <div className="div_value">
                <div className="txt_group">
                  <div className="status_point_off"></div>
                  <div className="text_title">Off</div>
                </div>
                <div className="number_wrap">1</div>
              </div>
              <div className="div_value">
                <div className="txt_group">
                  <div className="status_point_error"></div>
                  <div className="text_title">Error</div>
                </div>
                <div className="number_wrap">1</div>
              </div>
            </div>
          </div>
          
        </div>

          {/* 리스트  */}
          {this.renderContent()}

    </ListPage>
     
    )
  }
}
