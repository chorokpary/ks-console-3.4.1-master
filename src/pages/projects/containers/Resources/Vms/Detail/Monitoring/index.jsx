import { isEmpty, find } from 'lodash'
import React, { useState } from 'react'
import { observer, inject } from 'mobx-react'

import { getAreaChartOps } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea } from 'components/Charts'

const index = props => {
  const store = props.detailStore
  const customStore = new CustomStore()

  const { cluster, namespace } = props.match.params

  const [vmCpuData, setVmCpuData] = useState([])
  const [vmMemoryData, setVmMemoryData] = useState([])
  const [vmInboundData, setVmInboundData] = useState({})
  const [vmOutboundData, setVmOutboundData] = useState({})
  const [vmDiskData, setVmDiskData] = useState([])

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

  const fetchData = async params => {
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

    const getVmCpuUsageData = async () => {
      const cpuLinuxDataExpr = `linux:vm:cpu:usage_percent:5m / ${store.detail.vm.flavor.vcpus}`
      const cpuWindowsDataExpr = `windows:vm:cpu:usage_percent:5m / ${store.detail.vm.flavor.vcpus}`
      const cpuData = await customStore.fetchMetric({
        expr:
          store.detail.vm.os_type === 'linux'
            ? cpuLinuxDataExpr
            : cpuWindowsDataExpr,
        ...paramsData,
        cluster,
        namespace,
      })

      const vmCpuMetricData = find(cpuData, data => {
        if (
          data.metric.pod === store.detail.vm.name
        )
          return data
      })

      // 배열 처리
      const vmCpuArray = []
      vmCpuArray.push(vmCpuMetricData)
      setVmCpuData(vmCpuArray)
    }

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const memoryLinuxDataExpr = `linux:vm:memory:used_bytes:raw`
      const memoryWindowsDataExpr = `windows:vm:memory:used_bytes:raw`

      const memoryData = await customStore.fetchMetric({
        expr:
          store.detail.vm.os_type === 'linux'
            ? memoryLinuxDataExpr
            : memoryWindowsDataExpr,
        ...paramsData,
        cluster,
        namespace,
      })

      const vmMemoryMetricData = find(memoryData, data => {
        if (
          data.metric.pod === store.detail.vm.name
        )
          return data
      })

      // 배열 처리
      const vmMemoryArray = []
      vmMemoryArray.push(vmMemoryMetricData)
      setVmMemoryData(vmMemoryArray)
    }

    // vm inbound data
    const getVmInboundData = async () => {
      const inboundLinuxDataExpr = `linux:vm:net:rx_bytes:5m`
      const inboundWindowsDataExpr = `windows:vm:net:rx_bytes:5m`

      const inboundData = await customStore.fetchMetric({
        expr:
          store.detail.vm.os_type === 'linux'
            ? inboundLinuxDataExpr
            : inboundWindowsDataExpr,
        ...paramsData,
        cluster,
        namespace,
      })

      const vmInboundMetricData = find(inboundData, data => {
        if (
          data.metric.pod === store.detail.vm.name
        )
          return data
      })

      setVmInboundData(vmInboundMetricData)
    }

    // vm outbound data
    const getVmOutboundData = async () => {
      const outboundLinuxDataExpr = `linux:vm:net:tx_bytes:5m`
      const outboundWindowsDataExpr = `windows:vm:net:tx_bytes:5m`

      const outboundData = await customStore.fetchMetric({
        expr:
          store.detail.vm.os_type === 'linux'
            ? outboundLinuxDataExpr
            : outboundWindowsDataExpr,
        ...paramsData,
        cluster,
        namespace,
      })

      const vmOutboundMetricData = find(outboundData, data => {
        if (
          data.metric.pod === store.detail.vm.name
        )
          return data
      })

      setVmOutboundData(vmOutboundMetricData)
    }

    const getVmDiskUsageData = async () => {
      const diskLinuxDataExpr = `linux:vm:filesystem:usage_fraction:raw`
      const diskWindowsDataExpr = `windows:vm:disk:usage_fraction:raw`

      const diskData = await customStore.fetchMetric({
        expr:
          store.detail.vm.os_type === 'linux'
            ? diskLinuxDataExpr
            : diskWindowsDataExpr,
        ...paramsData,
        cluster,
        namespace,
      })

      const vmDiskMetricData = find(diskData, data => {
        if (data.metric?.pod === store.detail.vm.name) return data
      })

      // 배열 처리
      const vmDiskArray = []
      vmDiskArray.push(vmDiskMetricData)
      setVmDiskData(vmDiskArray)
    }

    getVmCpuUsageData()
    getVmMemoryUsageData()
    getVmInboundData()
    getVmOutboundData()
    getVmDiskUsageData()
  }

  const getMonitoringCfgs = () => {
    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend: ['CPU_USAGE'],
        data: vmCpuData,
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: ['MEMORY_USAGE'],
        data: vmMemoryData,
      },
      {
        type: 'bandwidth',
        title: 'NETWORK_TRAFFIC',
        unitType: 'bandwidth',
        legend: ['OUT', 'IN'],
        data: [vmOutboundData, vmInboundData],
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_DISK_USAGE'),
        unit: '%',
        legend: [t('RESOURCES_DISK_USAGE')],
        data: vmDiskData,
      },
    ]
  }

  const { isLoading, isRefreshing } = customStore
  const configs = getMonitoringCfgs()

  return (
    <MonitoringController
      title={t('RESOURCES_MONITORING')}
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
