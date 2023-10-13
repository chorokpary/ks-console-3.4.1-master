import { get, last } from "lodash"
import { getLastMonitoringData, getAreaChartOps, getSuitableUnit, getValueByUnit } from 'utils/monitoring'

const MetricTypes = {
  cpu_usage: 'cluster_cpu_usage',
  cpu_total: 'cluster_cpu_total',
  cpu_utilisation: 'cluster_cpu_utilisation',
  memory_usage: 'cluster_memory_usage_wo_cache',
  memory_total: 'cluster_memory_total',
  memory_utilisation: 'cluster_memory_utilisation',
  disk_size_usage: 'cluster_disk_size_usage',
  disk_size_capacity: 'cluster_disk_size_capacity',
  disk_utilisation: 'cluster_disk_size_utilisation',
  // pod_count: 'cluster_pod_running_count',
  // pod_capacity: 'cluster_pod_quota',
  pod_utilisation: 'cluster_pod_utilisation',
  pod_cpu_usage: 'pod_cpu_usage',
  pod_memory_usage: 'pod_memory_usage'
}

const getValue = data => get(data, 'value[1]', 0)

export function getData(activeTab, data) {

  var result;
  if (activeTab == 'node') {
    result = getNodeData(data)
  } else if (activeTab == 'pod') {
    result = getPodData(data)
  } else if (activeTab == 'vm') {
    result = getVmData(data)
  } else if (activeTab == 'kaas') {
    result = getKaasData(data)
  }
  return result;
}

export function getContentOptions(activeTab, data) {

  var result = [];
  if (activeTab == 'node') {
    result = getNodeResult(data)
  } else if (activeTab == 'pod') {
    result = getPodResult(data)
  } else if (activeTab == 'vm') {
    result = getVmResult(data)
  } else if (activeTab == 'kaas') {
    result = getKaasResult(data)
  }
  return result;
}

// ================================= left tab data =================================

function getNodeData(metricData) {
  const lastData = getLastMonitoringData(metricData)
  const result = [
    {
      activeTab: 'cpu',
      name: 'CPU',
      unitType: 'cpu',
      used: getValue(lastData[MetricTypes.cpu_usage]),
      total: getValue(lastData[MetricTypes.cpu_total]),
    },
    {
      activeTab: 'memory',
      name: '메모리',
      unitType: 'memory',
      used: getValue(lastData[MetricTypes.memory_usage]),
      total: getValue(lastData[MetricTypes.memory_total]),
    },
    {
      activeTab: 'disk',
      name: '디스크',
      unitType: 'disk',
      used: getValue(lastData[MetricTypes.disk_size_usage]),
      total: getValue(lastData[MetricTypes.disk_size_capacity]),
    },
  ]

  result.map(obj => {
    obj._unit = getSuitableUnit(obj.total || obj.used, obj.unitType) || obj.unit
    obj._used = getValueByUnit(obj.used, obj._unit)
    obj._total = getValueByUnit(obj.total, obj._unit)
    obj._percent = obj._used / obj._total * 100
  })

  return result
}

function getPodData(podData) {
  const result = [
    {
      activeTab: 'cpu',
      name: 'CPU',
      unitType: 'cpu',
      used: last(podData.pod_cpu_usage[0].values)[1],
      total: 1,
    },
    {
      activeTab: 'memory',
      name: '메모리',
      unitType: 'memory',
      used: last(podData.pod_memory_usage[0].values)[1],
      total: 99999999,
    },
  ]

  result.map(obj => {
    obj._unit = getSuitableUnit(obj.total || obj.used, obj.unitType) || obj.unit
    obj._used = getValueByUnit(obj.used, obj._unit)
    obj._total = getValueByUnit(obj.total, obj._unit)
    obj._percent = obj._used / obj._total * 100
  })
  return result
}

function getVmData(data) {
  var cpuCnt = 0;
  data.cpuData.map(obj => {
    cpuCnt += Number(last(obj.values)[1])
  })
  var memoryCnt = 0;
  data.memoryData.map(obj => {
    memoryCnt += Number(last(obj.values)[1])
  })

  const result = [
    {
      activeTab: 'cpu',
      name: 'CPU',
      unitType: 'cpu',
      unit: '%',
      used: cpuCnt,
      total: 1,
    },
    {
      activeTab: 'memory',
      name: '메모리',
      unitType: 'memory',
      unit: 'Gi',
      used: memoryCnt,
      total: 99999999999,
    },
  ]

  result.map(obj => {
    obj._unit = getSuitableUnit(obj.total || obj.used, obj.unitType) || obj.unit
    obj._used = getValueByUnit(obj.used, obj._unit)
    obj._total = getValueByUnit(obj.total, obj._unit)
    obj._percent = obj._used / obj._total * 100
  })
  return result
}

function getKaasData(data) {
  var cpuCnt = 0;
  data.cpuData.map(obj => {
    cpuCnt += Number(last(obj.values)[1])
  })
  var memoryCnt = 0;
  data.memoryData.map(obj => {
    memoryCnt += Number(last(obj.values)[1])
  })

  const result = [
    {
      activeTab: 'cpu',
      name: 'CPU',
      unitType: 'cpu',
      unit: '%',
      used: cpuCnt,
      total: 1,
    },
    {
      activeTab: 'memory',
      name: '메모리',
      unitType: 'memory',
      unit: 'Gi',
      used: memoryCnt,
      total: 99999999999,
    },
  ]

  result.map(obj => {
    obj._unit = getSuitableUnit(obj.total || obj.used, obj.unitType) || obj.unit
    obj._used = getValueByUnit(obj.used, obj._unit)
    obj._total = getValueByUnit(obj.total, obj._unit)
    obj._percent = obj._used / obj._total * 100
  })
  return result
}


// ================================= right tab data =================================
function getNodeResult(metricData) {
  const result = [
    {
      activeTab: 'cpu',
      type: 'utilisation',
      title: 'CPU_USAGE',
      unit: '%',
      // unitType: 'cpu',
      legend: ['USAGE'],
      data: get(metricData, `${MetricTypes.cpu_utilisation}.data.result`),
    },
    {
      activeTab: 'memory',
      type: 'utilisation',
      title: 'MEMORY_USAGE',
      unit: '%',
      // unitType: 'memory',
      legend: ['USAGE'],
      data: get(metricData, `${MetricTypes.memory_utilisation}.data.result`),
    },
    {
      activeTab: 'disk',
      type: 'utilisation',
      title: 'DISK_USAGE',
      unit: '%',
      // unitType: 'disk',
      legend: ['USAGE'],
      data: get(metricData, `${MetricTypes.disk_utilisation}.data.result`),
    },
  ]
  return result
}

function getPodResult(podData) {
  const result = [
    {
      activeTab: 'cpu',
      type: 'utilisation',
      title: 'CPU_USAGE',
      unit: '%',
      unitType: 'cpu',
      legend: ['USAGE'],
      data: podData.pod_cpu_usage
    },
    {
      activeTab: 'memory',
      type: 'utilisation',
      title: 'MEMORY_USAGE',
      unit: '%',
      unitType: 'memory',
      legend: ['USAGE'],
      data: podData.pod_memory_usage
    },
  ]
  return result
}

function getVmResult(data) {
  const result = [
    {
      activeTab: 'cpu',
      type: 'utilisation',
      title: 'CPU_USAGE',
      unit: '%',
      legend:
        data.cpuData.map(item => (
          item.metric.pod
        ))
      ,
      data:
        data.cpuData.map(item => (
          item
        ))
    },
    {
      activeTab: 'memory',
      type: 'utilisation',
      title: 'MEMORY_USAGE',
      unit: '%',
      unitType: 'memory',
      legend: ['USAGE'],
      legend:
        data.memoryData.map(item => (
          item.metric.pod
        ))
      ,
      data:
        data.memoryData.map(item => (
          item
        ))
    },
  ]
  return result
}

function getKaasResult(data) {
  const result = [
    {
      activeTab: 'cpu',
      type: 'utilisation',
      title: 'CPU_USAGE',
      unit: '%',
      legend:
        data.cpuData.map(item => (
          item.metric.pod
        ))
      ,
      data:
        data.cpuData.map(item => (
          item
        ))
    },
    {
      activeTab: 'memory',
      type: 'utilisation',
      title: 'MEMORY_USAGE',
      unit: '%',
      unitType: 'memory',
      legend: ['USAGE'],
      legend:
        data.memoryData.map(item => (
          item.metric.pod
        ))
      ,
      data:
        data.memoryData.map(item => (
          item
        ))
    },
  ]
  return result
}