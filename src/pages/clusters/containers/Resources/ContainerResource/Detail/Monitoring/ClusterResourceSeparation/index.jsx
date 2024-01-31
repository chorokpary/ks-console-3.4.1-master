import { get, isEmpty, find } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { getChartData, getAreaChartOps } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'
import ResourceStore from 'stores/resources/containerresource'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea } from 'components/Charts'

import styles from './index.scss'

const index = (props) => {

  const customStore = new CustomStore();
  const resourceStore = new ResourceStore();

  const [kaasCpuData, setKaasCpuData] = useState([]);
  const [kaasMemoryData, setKaasMemoryData] = useState([]);

  const [kaasInboundData, setKaasInboundData] = useState([]);
  const [kaasOutboundData, setKaasOutboundData] = useState([]);

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

  const fetchData = async (params) => {

    // kaas list
    const kaasList = await resourceStore.fetchList({ limit: 1000 })
    let promsql_pod_kaas_list = ""
    kaasList.map((obj) => {
      const kaasName = get(obj, 'name')
      promsql_pod_kaas_list += promsql_pod_kaas_list != "" ? ("|" + kaasName + '.*') : kaasName + '.*';
    })

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
      const kaasCpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle",pod=~"${promsql_pod_kaas_list}"}[5m])) * 100)) / 100`,
        ...paramsData,
      })

      setKaasCpuData(kaasCpuData)
    };

    // kaas memory data
    const getKaasMemoryUsageData = async () => {
      const kaasMemoryData = await customStore.fetchMetric({
        expr: `sum by (pod) (node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_kaas_list}"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_kaas_list}"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_kaas_list}"})`,
        ...paramsData,
      })

      setKaasMemoryData(kaasMemoryData)
    };

    // inbound data
    const getKaasInboundData = async () => {
      const kaasInboundData = await customStore.fetchMetric({
        expr: `sum by (pod) (irate(node_network_receive_bytes_total{service='launcher-node-exporter',device=~"net.*|eth.*",pod=~"${promsql_pod_kaas_list}"}[5m]))`,
        ...paramsData,
      })

      setKaasInboundData(kaasInboundData);
    };

    // outbound data
    const getKaasOutboundData = async () => {
      const kaasOutboundData = await customStore.fetchMetric({
        expr: `sum by (pod) (irate(node_network_transmit_bytes_total{namespace='default',service='launcher-node-exporter',device=~"net.*|eth.*",pod=~"${promsql_pod_kaas_list}"}[5m]))`,
        ...paramsData,
      })

      setKaasOutboundData(kaasOutboundData);
    };

    getKaasCpuUsageData();
    getKaasMemoryUsageData();
    getKaasInboundData();
    getKaasOutboundData();

  }

  const getMonitoringCfgs = () => {
    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend:
          kaasCpuData.map(item => (
            item.metric.pod
          )),
        data: kaasCpuData,
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend:
          kaasMemoryData.map(item => (
            item.metric.pod
          )),
        data: kaasMemoryData,
      },
      {
        type: 'bandwidth',
        title: 'RESOURCES_NETWORK_TRAFFIC_IN',
        unitType: 'bandwidth',
        legend:
          kaasInboundData.map(item => (
            item.metric.pod
          )),
        data: kaasInboundData,
      },
      {
        type: 'bandwidth',
        title: 'RESOURCES_NETWORK_TRAFFIC_OUT',
        unitType: 'bandwidth',
        legend:
          kaasOutboundData.map(item => (
            item.metric.pod
          )),
        data: kaasOutboundData,
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
  );
};

export default inject('detailStore')(observer(index))

