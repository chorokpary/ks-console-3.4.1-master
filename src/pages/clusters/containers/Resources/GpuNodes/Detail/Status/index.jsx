/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
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
import { observer, inject } from 'mobx-react'

import { toJS } from 'mobx'
import { get, isEmpty, flatten } from 'lodash'
import { getSuitableUnit, getCustomValue } from 'utils/monitoring'

import { Panel } from 'components/Base'
import MonitorTab from 'components/Cards/Monitoring/MonitorTab'
import DeploymentCard from './DeploymentCard'
import DetailGpuDeviceList from 'pages/clusters/containers/Resources/components/DetailGpuDeviceList';

import NodeMonitoringStore from 'stores/monitoring/node'
import VmStore from 'stores/resources/vms'
import CustomStore from 'stores/monitoring/custom/monitor'

import styles from './index.scss'

@inject('detailStore')
@observer
export default class Status extends React.Component {
  constructor(props) {
    super(props)

    this.store = props.detailStore
    this.monitoringStore = new NodeMonitoringStore({ cluster: this.cluster })
    this.vmStore = new VmStore({ cluster: this.cluster })
    this.customStore = new CustomStore({ cluster: this.cluster })
    
    this.state = {
      fetchParams: {},
      vmDataList: [],     
      vmGpuUtilData: null,
      vmGpuRamData: null,
      vmGpuPowerData: null,
      vmGpuTempData: null,
      vmGpuNvlinkData: null,
      vmGpuInboundData: null,
      vmGpuOutboundData: null,
    }
  }

  componentDidMount() {
    this.fnGetData()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.vmDataList !== this.state.vmDataList) {
      this.fetchDataGpu({ ...this.fetchParams });
    }
  }

  getMinuteValue = (timeStr = '60s', hasUnit = true) => {
    const unit = timeStr.slice(-1)
    let value = parseFloat(timeStr)

    switch (unit) {
      default:
      case 's':
        break
      case 'm':
        value *= 60
        break
      case 'h':
        value *= 60 * 60
        break
      case 'd':
        value = value * 24 * 60 * 60
        break
    }
    return hasUnit ? `${value}s` : value
  }

  getTimeRange = ({ step = '180s', times = 20 } = {}) => {
    const interval = parseFloat(step) * times
    const end = Math.floor(Date.now() / 1000)
    const start = Math.floor(end - interval)

    return { start, end }
  }

  fnGetData = async () => {
    const params = {
      cluster: this.store.detail.cluster,
      limit: 10000,
    }

    const vmList = await this.vmStore.fetchList(params)
    const vmData = vmList.filter(item => item.node === this.store.detail.name).map(item => item.name).join('|') || ''

    this.setState({ vmDataList: vmData });
  }

  fetchDataGpu = async (params) => {
    this.setState({ fetchParams: params });

    const paramsData = Object.assign({}, params, {
      start: params.start,
      end: params.end,
      step: this.getMinuteValue(params.step),
      times: params.times,
    });

    if (!paramsData.start || !paramsData.end) {
      const timeRange = this.getTimeRange(paramsData);
      paramsData.start = timeRange.start;
      paramsData.end = timeRange.end;
    }

    const { vmDataList } = this.state;

    const getVmGpuUtilData = async () => {
      const gpuUtilDataExpr = `avg(DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${this.store.detail.cluster}"}) / 100`;
      const gpuUtilData = await this.customStore.fetchMetric({
        expr: gpuUtilDataExpr,
        ...paramsData,
        cluster: this.store.detail.cluster,
      });
      this.setState({ vmGpuUtilData: gpuUtilData });
    };

    const getVmGpuRamData = async () => {
      const gpuRamDataExpr = `avg(DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${this.store.detail.cluster}"}) * 1000000`;
      const gpuRamData = await this.customStore.fetchMetric({
        expr: gpuRamDataExpr,
        ...paramsData,
        cluster: this.store.detail.cluster,
      });
      this.setState({ vmGpuRamData: gpuRamData });
    };

    const getVmGpuPowerData = async () => {
      const gpuPowerDataExpr = `avg(DCGM_FI_DEV_POWER_USAGE{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${this.store.detail.cluster}"})`;
      const gpuPowerData = await this.customStore.fetchMetric({
        expr: gpuPowerDataExpr,
        ...paramsData,
        cluster: this.store.detail.cluster,
      });
      this.setState({ vmGpuPowerData: gpuPowerData });
    };

    const getVmGpuTempData = async () => {
      const gpuTempDataExpr = `avg(DCGM_FI_DEV_GPU_TEMP{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${this.store.detail.cluster}"})`;
      const gpuTempData = await this.customStore.fetchMetric({
        expr: gpuTempDataExpr,
        ...paramsData,
        cluster: this.store.detail.cluster,
      });
      this.setState({ vmGpuTempData: gpuTempData });
    };

    const getVmGpuNvlinkData = async () => {
      const gpuNvlinkDataExpr = `sum(DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${this.store.detail.cluster}"}) * ${getCustomValue(
        'bandwidthBytes',
        'MBps'
      )}`;
      const gpuNvlinkData = await this.customStore.fetchMetric({
        expr: gpuNvlinkDataExpr,
        ...paramsData,
        cluster: this.store.detail.cluster,
      });
      this.setState({ vmGpuNvlinkData: gpuNvlinkData });
    };

    const getVmGpuInboundData = async () => {
      const inboundLinuxDataExpr = `sum(rate(node_infiniband_port_data_received_bytes_total{job="launcher-node-exporter", pod=~"${vmDataList}", namespace="${this.store.detail.cluster}"}[2m]) * 8)`;
      const gpuInboundData = await this.customStore.fetchMetric({
        expr: inboundLinuxDataExpr,
        ...paramsData,
        cluster: this.store.detail.cluster,
      });
      this.setState({ vmGpuInboundData: gpuInboundData });
    };

    const getVmGpuOutboundData = async () => {
      const outboundLinuxDataExpr = `sum(rate(node_infiniband_port_data_transmitted_bytes_total{job="launcher-node-exporter", pod=~"${vmDataList}", namespace="${this.store.detail.cluster}"}[2m]) * 8)`;
      const gpuOutboundData = await this.customStore.fetchMetric({
        expr: outboundLinuxDataExpr,
        ...paramsData,
        cluster: this.store.detail.cluster,
      });
      this.setState({ vmGpuOutboundData: gpuOutboundData });
    };

    getVmGpuUtilData();
    getVmGpuRamData();
    getVmGpuTempData();
    getVmGpuPowerData();
    getVmGpuNvlinkData();
    getVmGpuInboundData();
    getVmGpuOutboundData();
  };

  renderResourceStatus() {

     const {   
      vmGpuUtilData,
      vmGpuRamData,
      vmGpuPowerData,
      vmGpuTempData,
      vmGpuNvlinkData,
      vmGpuInboundData,
      vmGpuOutboundData, 
    } = this.state;

    return (
      <Panel
        className={styles.resources}
        title={t('RESOURCE_USAGE')}
        loading={vmGpuOutboundData ? false : true}
      >
        <MonitorTab
          tabs={[
            {
              key: 'gpucluster',
              icon: 'ico-type-hostgpu',
              unit: '%',
              legend: ['RESOURCES_GPU_UTILIZATION'],
              title: 'RESOURCES_GPU_UTILIZATION',
              data: vmGpuUtilData,
            },
            {
              key: 'memory',
              icon: 'memory',
              unit: getSuitableUnit(flatten(vmGpuRamData?.map(result => get(result, 'values') || [])), 'memory'),
              legend: ['RESOURCES_GPU_RAM_USAGE'],
              title: 'RESOURCES_GPU_RAM_USAGE',
              data: vmGpuRamData,
            },            
            {
              key: 'temperature',
              icon: 'ico-type-temperature',
              unit: '°C',
              legend: ['RESOURCES_GPU_TEMPERATURE'],
              title: 'RESOURCES_GPU_TEMPERATURE',
              data: vmGpuTempData,
            },
            {
              key: 'power',
              icon: 'ico-type-power',
              unit: 'W',
              legend: ['RESOURCES_GPU_POWER'],
              title: 'RESOURCES_GPU_POWER',
              data: vmGpuPowerData,
            },
            {
              key: 'inbound',
              icon: 'ico-type-inbound',
              type: 'bandwidth',
              unit: getSuitableUnit(flatten(vmGpuInboundData?.map(result => get(result, 'values') || [])), 'bandwidth'),
              legend: ['RESOURCES_GPU_IB_INBOUND'],
              title: 'RESOURCES_GPU_IB_INBOUND',
              data: vmGpuInboundData,
            },
            {
              key: 'outbound',
              icon: 'ico-type-outbound',
              type: 'bandwidth',
              unit: getSuitableUnit(flatten(vmGpuOutboundData?.map(result => get(result, 'values') || [])), 'bandwidth'),
              legend: ['RESOURCES_GPU_IB_OUTBOUND'],
              title: 'RESOURCES_GPU_IB_OUTBOUND',
              data: vmGpuOutboundData,
            },
            {
              key: 'traffic',
              icon: 'topology',
              type: 'bandwidth',
              unit: getSuitableUnit(flatten(vmGpuNvlinkData?.map(result => get(result, 'values') || [])), 'bandwidthBytes'),
              legend: ['RESOURCES_GPU_NVLINK_TRAFFIC'],
              title: 'RESOURCES_GPU_NVLINK_TRAFFIC',
              data: vmGpuNvlinkData,
            },
          ]}
        />
      </Panel>
    )
  }
  renderDeployments() {
    const { deploy } = this.store.detail.gpunode
    const container_toolkit = { name: "container_toolkit", flag: deploy.container_toolkit }
    const dcgm = { name: "dcgm", flag: deploy.dcgm }
    const dcgm_exporter = { name: "dcgm_exporter", flag: deploy.dcgm_exporter }
    const device_plugin = { name: "device_plugin", flag: deploy.device_plugin }
    const operator_validator = { name: "operator_validator", flag: deploy.operator_validator }
    const mig_manager = { name: "mig_manager", flag: deploy.mig_manager }
    const sandbox_device_plugin = { name: "sandbox_device_plugin", flag: deploy.sandbox_device_plugin }
    const cc_manager = { name: "cc_manager", flag: deploy.cc_manager }
    const vfio_manager = { name: "vfio_manager", flag: deploy.vfio_manager }
    const sandbox_validator = { name: "sandbox_validator", flag: deploy.sandbox_validator }
    const vgpu_manager = { name: "vgpu_manager", flag: deploy.vgpu_manager }
    const vgpu_device_manager = { name: "vgpu_device_manager", flag: deploy.vgpu_device_manager }

    return (
      <>
      <Panel title={t('RESOURCES_GPU_CONTAINER_DEPLOYMENT_STATUS')}>
        <div className={styles.deployments}>
          <DeploymentCard key="container_toolkit" data={container_toolkit} />
          <DeploymentCard key="dcgm" data={dcgm} />
          <DeploymentCard key="dcgm_exporter" data={dcgm_exporter} />
          <DeploymentCard key="device_plugin" data={device_plugin} />
          <DeploymentCard key="operator_validator" data={operator_validator} />
          <DeploymentCard key="mig_manager" data={mig_manager} />
        </div>
      </Panel>
      <Panel title={t('RESOURCES_GPU_VM_PASSTHROUGH_DEPLOYMENT_STATUS')}>
        <div className={styles.deployments}>
          <DeploymentCard key="vfio_manager" data={vfio_manager} />
          <DeploymentCard key="sandbox_device_plugin" data={sandbox_device_plugin} />
          <DeploymentCard key="sandbox_validator" data={sandbox_validator} />
        </div>
      </Panel>
      <Panel title={t('RESOURCES_GPU_VM_VGPU_DEPLOYMENT_STATUS')}>
        <div className={styles.deployments}>
          <DeploymentCard key="vgpu_manager" data={vgpu_manager} />
          <DeploymentCard key="vgpu_device_manager" data={vgpu_device_manager} />
          <DeploymentCard key="sandbox_device_plugin" data={sandbox_device_plugin} />
          <DeploymentCard key="sandbox_validator" data={sandbox_validator} />
        </div>
      </Panel>
      </>
    )
  };

  render() {
    return (
      <div className={styles.main}>
        {this.renderResourceStatus()}
        {this.state.vmGpuOutboundData && this.renderDeployments()}
      </div>
    )
  }
}

