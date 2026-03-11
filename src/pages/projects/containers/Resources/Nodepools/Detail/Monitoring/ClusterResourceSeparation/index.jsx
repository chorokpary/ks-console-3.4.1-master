import { isEmpty } from 'lodash'
import React, { useState } from 'react'
import { observer, inject } from 'mobx-react'

import { getAreaChartOps } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea } from 'components/Charts'

const index = props => {
  const customStore = new CustomStore()

  const [kaasCpuData, setKaasCpuData] = useState([])
  const [kaasMemoryData, setKaasMemoryData] = useState([])

  const [kaasInboundData, setKaasInboundData] = useState([])
  const [kaasOutboundData, setKaasOutboundData] = useState([])

  const [kaasDiskData, setKaasDiskData] = useState([])
  const [kaasDiskPercent, setKaasDiskPercent] = useState([])
  const [kaasIopsReadData, setKaasIopsReadData] = useState([])
  const [kaasIopsWriteData, setKaasIopsWriteData] = useState([])

  const project = props.namespace

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

    const getKaasCpuUsageData = async () => {
      const cpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="${project}",service="launcher-node-exporter",mode="idle",pod=~"${props.kaasNodePoolName}.*"}[5m])) * 100)) / 100`,
        ...paramsData,
        cluster: props.cluster,
      })

      setKaasCpuData(cpuData)
    }

    // kaas memory data
    const getKaasMemoryUsageData = async () => {
      const memoryData = await customStore.fetchMetric({
        expr: `sum by (pod) (node_memory_MemTotal_bytes{namespace="${project}",service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${props.kaasNodePoolName}.*"}-node_memory_MemFree_bytes{namespace="${project}",service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${props.kaasNodePoolName}.*"}-node_memory_Cached_bytes{namespace="${project}",service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${props.kaasNodePoolName}.*"})`,
        ...paramsData,
        cluster: props.cluster,
      })

      setKaasMemoryData(memoryData)
    }

    // inbound data
    const getKaasInboundData = async () => {
      const inboundData = await customStore.fetchMetric({
        expr: `sum by (pod) (irate(node_network_receive_bytes_total{namespace="${project}",service='launcher-node-exporter',device=~"net.*|eth.*",pod=~"${props.kaasNodePoolName}.*"}[5m]))`,
        ...paramsData,
        cluster: props.cluster,
      })

      setKaasInboundData(inboundData)
    }

    // outbound data
    const getKaasOutboundData = async () => {
      const outboundData = await customStore.fetchMetric({
        expr: `sum by (pod) (irate(node_network_transmit_bytes_total{namespace="${project}",service='launcher-node-exporter',device=~"net.*|eth.*",pod=~"${props.kaasNodePoolName}.*"}[5m]))`,
        ...paramsData,
        cluster: props.cluster,
      })

      setKaasOutboundData(outboundData)
    }

    const getKaasDiskUsageData = async () => {
      const diskData = await customStore.fetchMetric({
        expr: `sum by (pod) (node_filesystem_size_bytes{namespace="${project}",service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${props.kaasNodePoolName}.*"}-node_filesystem_avail_bytes{namespace="${project}",service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${props.kaasNodePoolName}.*"}})`,
        ...paramsData,
        cluster: props.cluster,
      })

      setKaasDiskData(diskData)
    }

    const getKaasDiskPercentData = async () => {
      const diskData = await customStore.fetchMetric({
        expr: `1 - (sum by (pod) (node_filesystem_avail_bytes{namespace="${project}", service="launcher-node-exporter", pod!~"virt-launcher-.*",pod=~"${props.kaasNodePoolName}.*"}) / (sum by (pod) (node_filesystem_size_bytes{namespace="${project}", service="launcher-node-exporter", pod!~"virt-launcher-.*",pod=~"${props.kaasNodePoolName}.*"}) + 1e-9) )`,
        ...paramsData,
        cluster: props.cluster,
      })

      setKaasDiskPercent(diskData)
    }

    const getKaasIopsReadData = async () => {
      const diskData = await customStore.fetchMetric({
        expr: `sum by (pod) (irate(node_disk_reads_completed_total{namespace="${project}",service='launcher-node-exporter',device=~"^(sd.*|nvme.*|vd.*|xvd.*)",pod=~"${props.kaasNodePoolName}.*"}[5m]))`,
        ...paramsData,
        cluster: props.cluster,
      })

      setKaasIopsReadData(diskData)
    }

    const getKaasIopsWriteData = async () => {
      const diskData = await customStore.fetchMetric({
        expr: `sum by (pod) (irate(node_disk_writes_completed_total{namespace="${project}",service='launcher-node-exporter',device=~"^(sd.*|nvme.*|vd.*|xvd.*)",pod=~"${props.kaasNodePoolName}.*"}[5m]))`,
        ...paramsData,
        cluster: props.cluster,
      })

      setKaasIopsWriteData(diskData)
    }

    getKaasCpuUsageData()
    getKaasMemoryUsageData()
    getKaasInboundData()
    getKaasOutboundData()
    getKaasDiskUsageData()
    getKaasDiskPercentData()
    getKaasIopsReadData()
    getKaasIopsWriteData()
  }

  const getMonitoringCfgs = () => {
    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend: kaasCpuData.map(item => item.metric.pod),
        data: kaasCpuData,
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: kaasMemoryData.map(item => item.metric.pod),
        data: kaasMemoryData,
      },
      {
        type: 'bandwidth',
        title: 'RESOURCES_NETWORK_TRAFFIC_IN',
        unitType: 'bandwidth',
        legend: kaasInboundData.map(item => item.metric.pod),
        data: kaasInboundData,
      },
      {
        type: 'bandwidth',
        title: 'RESOURCES_NETWORK_TRAFFIC_OUT',
        unitType: 'bandwidth',
        legend: kaasOutboundData.map(item => item.metric.pod),
        data: kaasOutboundData,
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_DISK_USAGE'),
        unitType: 'disk',
        legend: kaasDiskData.map(item => item.metric.pod),
        data: kaasDiskData,
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_DISK_PERCENT'),
        unit: '%',
        legend: kaasDiskPercent.map(item => item.metric.pod),
        data: kaasDiskPercent,
      },
      {
        type: 'iops',
        title: 'IOPS READ',
        legend: kaasIopsReadData.map(item => item.metric.pod),
        data: kaasIopsReadData,
      },
      {
        type: 'iops',
        title: 'IOPS WRITE',
        legend: kaasIopsWriteData.map(item => item.metric.pod),
        data: kaasIopsWriteData,
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
