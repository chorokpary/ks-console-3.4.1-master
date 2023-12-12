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
  var outboundCnt = 0;
  data.vmOutboundData.map(obj => {
    outboundCnt += Number(last(obj.values)[1])
  })
  var inboundCnt = 0;
  data.vmInboundData.map(obj => {
    inboundCnt += Number(last(obj.values)[1])
  })

  const totalVal = outboundCnt + inboundCnt
  const outSumData = sumVmData(getAreaChartOps(getVmResult(data)[0]))
  const inSumData = sumVmData(getAreaChartOps(getVmResult(data)[1]))

  const lastData = {
    OUT: outSumData.sum,
    IN: inSumData.sum,
    UNIT: outSumData.unit || inSumData.unit,
    TOTAL: getValueByUnit(totalVal, getSuitableUnit(totalVal, 'bandwidth'))
  }

  return lastData
}

function sumVmData(config) {
  if (config.data.length > 0) {
    const lastData = config.data[config.data.length - 1];
    const { ...others } = lastData;
    const values = Object.values(others)
    const sum = values.reduce((a, b) => {
      return a + b
    }, 0);

    lastData.sum = sum ? sum : 0
    lastData.unit = config.unit
    return lastData
  } else {
    return { sum: 0, unit: '' }
  }
}

function getKaasData(data) {
  var outboundCnt = 0;
  data.vmOutboundData.map(obj => {
    outboundCnt += Number(last(obj.values)[1])
  })
  var inboundCnt = 0;
  data.vmInboundData.map(obj => {
    inboundCnt += Number(last(obj.values)[1])
  })

  const totalVal = outboundCnt + inboundCnt
  const outSumData = sumVmData(getAreaChartOps(getKaasResult(data)[0]))
  const inSumData = sumVmData(getAreaChartOps(getKaasResult(data)[1]))

  const lastData = {
    OUT: outSumData.sum,
    IN: inSumData.sum,
    UNIT: outSumData.unit || inSumData.unit,
    TOTAL: getValueByUnit(totalVal, getSuitableUnit(totalVal, 'bandwidth'))
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
      activeTab: 'OUT',
      type: 'bandwidth',
      title: 'NETWORK_TRAFFIC',
      unitType: 'bandwidth',
      legend:
        data.vmOutboundData.map(item => (
          item.metric.pod + '-' + item.metric.device
        ))
      ,
      data:
        data.vmOutboundData.map(item => (
          item
        ))
    },
    {
      activeTab: 'IN',
      type: 'bandwidth',
      title: 'NETWORK_TRAFFIC',
      unitType: 'bandwidth',
      legend:
        data.vmInboundData.map(item => (
          item.metric.pod + '-' + item.metric.device
        ))
      ,
      data:
        data.vmInboundData.map(item => (
          item
        ))
    },
  ]

  return result
}

function getKaasResult(data) {
  const result = [
    {
      activeTab: 'OUT',
      type: 'bandwidth',
      title: 'NETWORK_TRAFFIC',
      unitType: 'bandwidth',
      legend:
        data.vmOutboundData.map(item => (
          item.metric.pod + '-' + item.metric.device
        ))
      ,
      data:
        data.vmOutboundData.map(item => (
          item
        ))
    },
    {
      activeTab: 'IN',
      type: 'bandwidth',
      title: 'NETWORK_TRAFFIC',
      unitType: 'bandwidth',
      legend:
        data.vmInboundData.map(item => (
          item.metric.pod + '-' + item.metric.device
        ))
      ,
      data:
        data.vmInboundData.map(item => (
          item
        ))
    },
  ]

  return result
}
