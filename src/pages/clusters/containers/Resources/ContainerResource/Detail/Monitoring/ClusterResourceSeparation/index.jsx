import { get, isEmpty, find } from 'lodash'
import React, {useState, useEffect} from 'react'
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

  const [kaasCpuData, setKaasCpuData] = useState([]);
  const [kaasMemoryData, setKaasMemoryData] = useState([]);

  const [kaasCpuLegend, setKaasCpuLegend] = useState([]);
  const [kaasMemoryLegend, setKaasMemoryLegend] = useState([]);

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
      start : params.start,
      end : params.end,
      step: getMinuteValue(params.step),
      times : params.times ,
    })

    if (!paramsData.start || !paramsData.end) {
      const timeRange = getTimeRange(paramsData)
      paramsData.start = timeRange.start
      paramsData.end = timeRange.end
    }

    const getKaasCpuUsageData = async () => {
      const kaasCpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[5m])) * 100)) / 100`,
        ...paramsData,
      })

      // 배열 처리 
      const kaasCpuArray = [];
      const kaasCpuLegendArray = [];
      kaasCpuData.map(obj => {
        if (obj.metric.pod.split("-control-")[0] === store.detail.cluster.name || obj.metric.pod.split("-md-")[0] === store.detail.cluster.name) {
          kaasCpuArray.push(obj)
          kaasCpuLegendArray.push(obj.metric.pod)
        }
       })

      setKaasCpuData(kaasCpuArray)
      setKaasCpuLegend(kaasCpuLegendArray);
    };

    // kaas memory data
    const getKaasMemoryUsageData = async () => {
      const kaasMemoryData = await customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        ...paramsData,
      })

      // 배열 처리 
      const kaasMemoryArray = [];
      const kaasMemoryLegendArray = [];
      kaasMemoryData.map(obj => {
          if (obj.metric.pod.split("-control-")[0] === store.detail.cluster.name || obj.metric.pod.split("-md-")[0] === store.detail.cluster.name) {
            kaasMemoryArray.push(obj)
            kaasMemoryLegendArray.push(obj.metric.pod)
          }
      })
      setKaasMemoryData(kaasMemoryArray)
      setKaasMemoryLegend(kaasMemoryLegendArray);
    };

    getKaasCpuUsageData();
    getKaasMemoryUsageData();

  }

  const getMonitoringCfgs = () => {
    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend: kaasCpuLegend,
        data: kaasCpuData,
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: kaasMemoryLegend,
        data: kaasMemoryData,
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

