import { get, isEmpty, find } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { getChartData, getAreaChartOps } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea } from 'components/Charts'

import styles from './index.scss'

const index = (props) => {

  const store = props.detailStore;
  const customStore = new CustomStore();

  const { cluster, namespace } = props.match.params;

  const [vmCpuData, setVmCpuData] = useState([]);
  const [vmMemoryData, setVmMemoryData] = useState([]);
  const [vmInboundData, setVmInboundData] = useState({});
  const [vmOutboundData, setVmOutboundData] = useState({});
  const [vmDiskData, setVmDiskData] = useState([]);

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
      const vmCpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[5m])) * 100)) / 100`,
        // expr: `(1 - avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance))`,
        ...paramsData,
        cluster, namespace
      })

      const vmCpuMetricData = _.find(vmCpuData, (data) => {
        if (data.metric.pod === store.detail.id) return data;
      });

      // 배열 처리 
      const vmCpuArray = [];
      vmCpuArray.push(vmCpuMetricData)
      setVmCpuData(vmCpuArray)
    };

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const vmMemoryData = await customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        ...paramsData,
        cluster, namespace
      })

      const vmMemoryMetricData = _.find(vmMemoryData, (data) => {
        if (data.metric.pod === store.detail.id) return data;
      });

      // 배열 처리 
      const vmMemoryArray = [];
      vmMemoryArray.push(vmMemoryMetricData)
      setVmMemoryData(vmMemoryArray)

    };

    // vm inbound data
    const getVmInboundData = async () => {
      const vmInboundData = await customStore.fetchMetric({
        expr: `irate(node_network_receive_bytes_total{service='launcher-node-exporter',device=~"net.*|eth.*"}[5m])`,
        ...paramsData,
        cluster, namespace
      })

      const vmInboundMetricData = _.find(vmInboundData, (data) => {
        if (data.metric.pod === store.detail.id) return data;
      });

      setVmInboundData(vmInboundMetricData)

    };

    // vm outbound data
    const getVmOutboundData = async () => {
      const vmOutboundData = await customStore.fetchMetric({
        expr: `irate(node_network_transmit_bytes_total{namespace='default',service='launcher-node-exporter',device=~"net.*|eth.*"}[5m])`,
        ...paramsData,
        cluster, namespace
      })

      const vmOutboundMetricData = _.find(vmOutboundData, (data) => {
        if (data.metric.pod === store.detail.id) return data;
      });

      setVmOutboundData(vmOutboundMetricData)

    };

    const getVmDiskUsageData = async () => {
      const vmDiskData = await customStore.fetchMetric({
        expr: `(100 - ((sum by(pod) (node_filesystem_avail_bytes) * 100) / sum by(pod) (node_filesystem_size_bytes))) / 100`,
        ...paramsData,
        cluster, namespace
      })

      const vmDiskMetricData = _.find(vmDiskData, (data) => {
        if (data.metric?.pod === store.detail.id) return data;
      });

      // 배열 처리 
      const vmDiskArray = [];
      vmDiskArray.push(vmDiskMetricData)
      setVmDiskData(vmDiskArray)
    };

    getVmCpuUsageData();
    getVmMemoryUsageData();
    getVmInboundData();
    getVmOutboundData();
    getVmDiskUsageData();

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
  );
};

export default inject('detailStore')(observer(index))

