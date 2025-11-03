import { isEmpty } from 'lodash'
import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'

import { getChartData, getAreaChartOps, getCustomValue } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'
import VmStore from 'stores/resources/vms'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea } from 'components/Charts'

const index = props => {
  const store = props.detailStore
  const customStore = new CustomStore()
  const vmStore = new VmStore()  

  const [vmProject, setVmProject] = useState('')
  const [vmDataList, setVmDataList] = useState([])
  const [fetchParams, setFetchParams] = useState({})

  const [vmGpuUtilData, setVmGpuUtilData] = useState([])
  const [vmGpuRamData, setVmGpuRamData] = useState([])
  const [vmGpuTempData, setVmGpuTempData] = useState([])
  const [vmGpuPowerData, setVmGpuPowerData] = useState([])

  const [vmGpuNvlinkData, setVmGpuNvlinkData] = useState([])

  const [vmGpuInboundData, setVmGpuInboundData] = useState([])
  const [vmGpuOutboundData, setVmGpuOutboundData] = useState([])

  const getMinuteValue = (timeStr = '60s', hasUnit = true) => {
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

  const getTimeRange = ({ step = '600s', times = 20 } = {}) => {
    const interval = parseFloat(step) * times
    const end = Math.floor(Date.now() / 1000)
    const start = Math.floor(end - interval)

    return { start, end }
  }

  useEffect(() => {
      fnGetData()
    }, [])
  
  const fnGetData = async () => {
    const params = {
      cluster: store.detail.cluster,
      limit: 10000,
    }

    const vmList = await vmStore.fetchList(params)
    const project = vmList.filter(item => item.node === store.detail.name)[0].project
    const vmData = vmList.filter(item => item.node === store.detail.name).map(item => item.name).join('|') || ''

    setVmProject(project)
    setVmDataList(vmData)
  }

  const fetchData = async params => {
    setFetchParams(params)
    const paramsData = Object.assign(params, {
      start: params.start,
      end: params.end,
      step: getMinuteValue(params.step),
      times: params.times,
    })

    if (!paramsData.start || !paramsData.end) {
      const timeRange = getTimeRange(paramsData)
      paramsData.start = timeRange.start
      paramsData.end = timeRange.end
    }

    const getVmGpuUtilData = async () => {
      const gpuUtilDataExpr = `avg by (gpu) (DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${vmProject}"}) / 100`

      const gpuUtilData = await customStore.fetchMetric({
        expr: gpuUtilDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuUtilData(gpuUtilData)
    }

    const getVmGpuRamData = async () => {
      const gpuRamDataExpr = `avg by (gpu)(DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${vmProject}"}) * 1000000`
      const gpuRamData = await customStore.fetchMetric({
        expr: gpuRamDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuRamData(gpuRamData)
    }

    const getVmGpuPowerData = async () => {
      const gpuPowerDataExpr = `avg by (gpu)(DCGM_FI_DEV_POWER_USAGE{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${vmProject}"})`

      const gpuPowerData = await customStore.fetchMetric({
        expr: gpuPowerDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuPowerData(gpuPowerData)
    }

    const getVmGpuTempData = async () => {
      const gpuTempDataExpr = `avg by (gpu)(DCGM_FI_DEV_GPU_TEMP{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${vmProject}"})`
      const gpuTempData = await customStore.fetchMetric({
        expr: gpuTempDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuTempData(gpuTempData)
    }

    const getVmGpuNvlinkData = async () => {
      const gpuNvlinkDataExpr = `sum by (gpu)(DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL{job="launcher-dcgm-exporter", pod=~"${vmDataList}", namespace="${vmProject}"}) * ${getCustomValue(
        'bandwidthBytes',
        'MBps'
      )}`
      const gpuNvlinkData = await customStore.fetchMetric({
        expr: gpuNvlinkDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })
      setVmGpuNvlinkData(gpuNvlinkData)
    }

    const getVmGpuInboundData = async () => {
      const inboundLinuxDataExpr = `sum by (device)(rate(node_infiniband_port_data_received_bytes_total{job="launcher-node-exporter", pod=~"${vmDataList}", namespace="${vmProject}"}[2m]) * 8)`
      const gpuInboundData = await customStore.fetchMetric({
        expr: inboundLinuxDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuInboundData(gpuInboundData)
    }

    const getVmGpuOutboundData = async () => {
      const outboundLinuxDataExpr = `sum by (device)(rate(node_infiniband_port_data_transmitted_bytes_total{job="launcher-node-exporter", pod=~"${vmDataList}", namespace="${vmProject}"}[2m]) * 8)`
      const gpuOutboundData = await customStore.fetchMetric({
        expr: outboundLinuxDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuOutboundData(gpuOutboundData)
    }

    getVmGpuUtilData()
    getVmGpuRamData()
    getVmGpuTempData()
    getVmGpuPowerData()
    getVmGpuNvlinkData()
    getVmGpuInboundData()
    getVmGpuOutboundData()
  }

  const getMonitoringCfgs = () => {
    return [
       {
        type: 'utilisation',
        title: 'RESOURCES_GPU_UTILIZATION',
        unit: '%',
        legend: vmGpuUtilData.map(item => 'GPU' + item.metric.gpu),
        data: vmGpuUtilData,
      },
      {
        type: 'utilisation',
        title: 'RESOURCES_GPU_RAM_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: vmGpuRamData.map(item => 'GPU' + item.metric.gpu),
        data: vmGpuRamData,
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_GPU_TEMPERATURE'),
        unit: '°C',
        legend: vmGpuTempData.map(item => 'GPU' + item.metric.gpu),
        data: vmGpuTempData,
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_GPU_POWER'),
        unit: 'W',
        legend: vmGpuPowerData.map(item => 'GPU' + item.metric.gpu),
        data: vmGpuPowerData,
      },
      {
        type: 'bandwidth',
        title: 'IB ' + t('RESOURCES_INBOUND'),
        unitType: 'bandwidth',
        legend: vmGpuInboundData.map(item => item.metric.device),
        data: vmGpuInboundData,
      },
      {
        type: 'bandwidth',
        title: 'IB ' + t('RESOURCES_OUTBOUND'),
        unitType: 'bandwidth',
        legend: vmGpuOutboundData.map(item => item.metric.device),
        data: vmGpuOutboundData,
      },
      {
        type: 'bandwidth',
        title: 'NVLink ' + t('TRAFFIC'),
        unitType: 'bandwidthBytes',
        legend: vmGpuNvlinkData.map(item => 'GPU' + item.metric.gpu),
        data: vmGpuNvlinkData,
      },
    ]
  }

  useEffect(() => {
    if (vmDataList) {
      fetchData({ ...fetchParams })
    }
  }, [vmDataList])  

  const { isLoading, isRefreshing } = customStore
  const configs = getMonitoringCfgs()

  return (
    <MonitoringController
      title={t('RESOURCES_GPU_MONITORING')}
      onFetch={fetchData}
      loading={isLoading}
      refreshing={isRefreshing}
    >
      {configs.map(item => {
        const config = getAreaChartOps(item)
        if (isEmpty(config.data)) return null
        return <SimpleArea key={config.title} width="100%" {...config} />
      })}
    </MonitoringController>
  )
}

export default inject('detailStore')(observer(index))
