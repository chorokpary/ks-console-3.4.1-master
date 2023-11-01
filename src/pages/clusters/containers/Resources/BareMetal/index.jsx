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
      expr: `max by(instance) (redfish_system_power_state)`,
    })

    const metric_model = await this.customStore.fetchMetric({
      expr: `max by(instance, model) (redfish_chassis_model_info)`,
    })

    const metric_type = await this.customStore.fetchMetric({
      expr: `max by(instance, machine) (node_uname_info)`,
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
      expr: `avg by(instance) (redfish_chassis_power_powersupply_last_power_output_watts)`,
    })

    const metric_temperature = await this.customStore.fetchMetric({
      expr: `avg by(instance) (redfish_chassis_temperature_celsius)`,
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
      metricDiskTotalData : metric_disk_total,
      metricDiskFreeData : metric_disk_free,
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

  getMetricData = (metricData , record) => {
    const instance = toJS(record.ip)
    const metrics = this.state[metricData].find(item => get(item, 'metric.instance').split(":")[0] === instance)
    return metrics;
  }

  getMetricValue = (metricData , record) => {
    const instance = toJS(record.ip)
    const metrics = this.state[metricData].find(item => get(item, 'metric.instance').split(":")[0] === instance)
    const value = get(metrics, 'value[1]', '0');
    return value;
  }

  getColumns = () => {
    const { getSortOrder } = this.props
    const { cluster } = this.props.match.params
    return [
      {
        title: t('노드명'),
        dataIndex: 'name',
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
        render: record => {
          const state = this.getMetricValue('metricStateData', record)
          const statText = (state == 1 || state == 3) ? "On" : (state == 2 || state == 4) ? "Off" : "Unknown"
          return (
            <Text title={`${statText}`}/>
          )
        }
      },
      {
        title: t('서버 모델명'),
        key: 'model',
        render: record => {
          const metrics = this.getMetricData('metricModelData', record)  
          const modelName = get(metrics, 'metric.model', '-')     
          return (
            <Text title={`${modelName}`}/>
          )
        }
      },
      {
        title: t('유형'),
        key: 'type',
        render: record => {
          const metrics = this.getMetricData('metricTypeData', record)  
          const machine = get(metrics, 'metric.machine',"NOT")     
          const typeText = (machine == "NOT") ? "ARM" : machine.includes('x86') ? "X86" : "ARM"
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
          const coreCount = this.getMetricValue('metricCoreData', record)       
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
          const cpu = Math.round(this.getMetricValue('metricCpuData', record) * 100);
          const coreCount = this.getMetricValue('metricCoreData', record) 
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
          const memory_total_data = this.getMetricValue('metricMemoryTotalData', record) 
          const memory_free_data = this.getMetricValue('metricMemoryFreeData', record) 

          const memory_total = getValueByUnit(memory_total_data, "Gi")
          const memory_free = getValueByUnit(memory_free_data, "Gi")
          const memory_used = (memory_total-memory_free).toFixed(2)

          const memory_percent = isNaN(((memory_used/memory_total)*100).toFixed(0)) ? 0 : ((memory_used/memory_total)*100).toFixed(0)
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
          const disk_total_data = this.getMetricValue('metricDiskTotalData', record) 
          const disk_free_data = this.getMetricValue('metricDiskFreeData', record) 

          const disk_total = getValueByUnit(disk_total_data, "GB")
          const disk_free = getValueByUnit(disk_free_data, "GB")
          const disk_used = (disk_total-disk_free).toFixed(2)

          const disk_percent = isNaN(((disk_used/disk_total)*100).toFixed(0)) ? 0 :((disk_used/disk_total)*100).toFixed(0)
          return (
            <Text title={`${disk_percent}%`} description={`${disk_used}GB/${disk_total}GB`} />
          )
        }
      },
      {
        title: t('파워(kW)'),
        key: 'power',
        isHideable: true,
        render: record => {
          const power = this.getMetricValue('metricPowerData', record) 
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
          const temperature = this.getMetricValue('metricTemperatureData', record) 
          return (
            <Text title={`${temperature}`}/>
          )
        }
      },
      {
        title: t('탄소 배출량(Kg)'),
        key: 'carbon',
        isHideable: true,
        render: record => {
          const power = this.getMetricValue('metricPowerData', record) 
          const carbon = (Math.round((power  * 0.4781) / 0.1)*0.1).toFixed(1);
          return (
            <Text title={`${carbon}`}/>
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


  renderNodeStateContent() {
  
    const { metricStateData } = this.state;

    const { data } = toJS(this.props.store.list)

    const totalCount = data.length;
    const nodeOnData = metricStateData.filter(item => (get(item, 'value[1]') == 1 || get(item, 'values[1]') == 3))
    const nodeOffData = metricStateData.filter(item => (get(item, 'value[1]') == 2 || get(item, 'values[1]') == 4))
    
    // error 관련 flag가 없기 때문에 APi 등록된 전체에서 on, off 갯수를 뺀다.
    let nodeErrorCount = 0 ;
    nodeErrorCount = totalCount - (nodeOnData.length + nodeOffData.length);

    return (
      <div className="value_box_wrap">
        <div className="value_box">
          <div className="div_value">
            <div className="txt_group">
                <div className="text_title">전체</div>
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
              <div className="status_point_error"></div>
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
          <Carbon {...this.props}/>

          {/* CPU 소비 전력량 비교 */}
          <CpuUsage {...this.props}/>

          {/* 노드 상태  */}
          {this.renderNodeStateContent()}          
        </div>

        {/* 리스트  */}
        {this.renderContent()}

    </ListPage>
     
    )
  }
}
