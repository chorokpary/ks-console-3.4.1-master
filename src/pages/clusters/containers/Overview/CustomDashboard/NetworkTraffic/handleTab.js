import { get, last } from "lodash";
import { getAreaChartOps, getValueByUnit, getSuitableUnit } from 'utils/monitoring'

const MetricTypes = {
  net_transmitted: 'cluster_net_bytes_transmitted',
  net_received: 'cluster_net_bytes_received',
  net_utilisation: 'cluster_net_utilisation',
  pod_net_bytes_transmitted: 'pod_net_bytes_transmitted',
  pod_net_bytes_received: 'pod_net_bytes_received'
}

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

  const totalVal = last(get(metricData, `${MetricTypes.net_utilisation}.data.result[0]`, {}).values)?.[1]
  const config = getAreaChartOps(getNodeResult(metricData)[0])
  var lastData = config.data[config.data.length - 1];
  if (lastData) {
    lastData.UNIT = config.unit
    lastData.TOTAL = getValueByUnit(totalVal, getSuitableUnit(totalVal, 'bandwidth'))
  }

  return lastData
}

function getPodData(podData) {
  const inbound = last(get(podData, `${MetricTypes.pod_net_bytes_received}.data.result[0]`, {}).values)?.[1]
  const outbound = last(get(podData, `${MetricTypes.pod_net_bytes_transmitted}.data.result[0]`, {}).values)?.[1]
  const totalVal = Number(inbound) + Number(outbound)
  const config = getAreaChartOps(getPodResult(podData)[0])
  var lastData = config.data[config.data.length - 1];
  if (lastData) {
    lastData.UNIT = config.unit
    lastData.TOTAL = getValueByUnit(totalVal, getSuitableUnit(totalVal, 'bandwidth'))
  }

  return lastData
}

function getVmData(data) {
  const inbound = last(data.vmInboundData[0]?.values)?.[1]
  const outbound = last(data.vmOutboundData[0]?.values)?.[1]
  const totalVal = Number(inbound) + Number(outbound)
  const config = getAreaChartOps(getVmResult(data)[0])

  var lastData = config.data[config.data.length - 1];
  if (lastData) {
    lastData.UNIT = config.unit
    lastData.TOTAL = getValueByUnit(totalVal, getSuitableUnit(totalVal, 'bandwidth'))
  }

  return lastData
}

function getKaasData(data) {
  const inbound = last(data.vmInboundData[0]?.values)?.[1]
  const outbound = last(data.vmOutboundData[0]?.values)?.[1]
  const totalVal = Number(inbound) + Number(outbound)
  const config = getAreaChartOps(getKaasResult(data)[0])

  var lastData = config.data[config.data.length - 1];
  if (lastData) {
    lastData.UNIT = config.unit
    lastData.TOTAL = getValueByUnit(totalVal, getSuitableUnit(totalVal, 'bandwidth'))
  }

  return lastData
}

// ================================= right tab data =================================
function getNodeResult(metricData) {
  const result = [
    {
      type: 'bandwidth',
      title: 'NETWORK_TRAFFIC',
      unitType: 'bandwidth',
      legend: ['OUT', 'IN'],
      data: [
        get(metricData, `${MetricTypes.net_transmitted}.data.result[0]`, {}),
        get(metricData, `${MetricTypes.net_received}.data.result[0]`, {}),
      ],
    },
  ]

  return result
}

function getPodResult(podData) {
  const result = [
    {
      type: 'bandwidth',
      title: 'NETWORK_TRAFFIC',
      unitType: 'bandwidth',
      legend: ['OUT', 'IN'],
      data: [
        get(podData, `${MetricTypes.pod_net_bytes_transmitted}.data.result[0]`, {}),
        get(podData, `${MetricTypes.pod_net_bytes_received}.data.result[0]`, {}),
      ],
    },
  ]

  return result
}

function getVmResult(data) {
  const result = [
    {
      type: 'bandwidth',
      title: 'NETWORK_TRAFFIC',
      unitType: 'bandwidth',
      legend: ['OUT', 'IN'],
      data: [
        data.vmOutboundData[0],
        data.vmInboundData[0],
      ],
    },
  ]

  return result
}

function getKaasResult(data) {
  const result = [
    {
      type: 'bandwidth',
      title: 'NETWORK_TRAFFIC',
      unitType: 'bandwidth',
      legend: ['OUT', 'IN'],
      data: [
        data.vmOutboundData[0],
        data.vmInboundData[0],
      ],
    },
  ]

  return result
}
