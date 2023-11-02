import { get, isEmpty, find } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import { getChartData, getAreaChartOps } from 'utils/monitoring'

import VmStore from 'stores/resources/vms'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea } from 'components/Charts'

import styles from './index.scss'

const index = (props) => {

  const customStore = new CustomStore();
  const vmStore = new VmStore();

  const [vmList, setVmList] = useState([])
  const [vmData, setVmData] = useState({ cpuData: [], memoryData: [] });
  const [kaasData, setKaasData] = useState({ cpuData: [], memoryData: [] });

  const [vmCpuData, setVmCpuData] = useState([]);
  const [vmMemoryData, setVmMemoryData] = useState([]);
  const [vmInboundData, setVmInboundData] = useState({});
  const [vmOutboundData, setVmOutboundData] = useState({});

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

     // vm list
     const vmList = await vmStore.fetchList({ limit: 1000 })
     setVmList(vmList)


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

    const getVmCpuUsageData = async () => {
      const vmCpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[5m])) * 100)) / 100`,
        // expr: `(1 - avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance))`,
        ...paramsData,
      })
      setVmCpuData(vmCpuData)
    };

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const vmMemoryData = await customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        ...paramsData,
      })
      setVmMemoryData(vmMemoryData)
    };

    const getVmInboundData = async () => {
      const vmInboundData = await customStore.fetchMetric({
        expr: `irate(node_network_receive_bytes_total{service='launcher-node-exporter',device=~"net.*|eth.*"}[5m])`,
        ...paramsData,
      })
    };
   
    // vm outbound data
    const getVmOutboundData = async () => {
      const vmOutboundData= await customStore.fetchMetric({
        expr: `irate(node_network_transmit_bytes_total{namespace='default',service='launcher-node-exporter',device=~"net.*|eth.*"}[5m])`,
        ...paramsData,
      })
    };
    
    getVmCpuUsageData();
    getVmMemoryUsageData();
    getVmInboundData();
    getVmOutboundData()    

  }

   // vm, kass > cpu, memory set
   useEffect(() => {
    let vmCpuFilteredData = [];
    let vmMemoryFilteredData = [];
    let kaasCpuFilteredData = [];
    let kaasMemoryFilteredData = [];

    if (vmCpuData.length > 0) {
      vmCpuData.map(obj => {
        if (vmList.find(vmObj => vmObj.name == obj.metric.pod)) {
          vmCpuFilteredData.push(obj)
        } else {
          kaasCpuFilteredData.push(obj)
        }
      })
    }
    if (vmMemoryData.length > 0) {
      vmMemoryData.map(obj => {
        if (vmList.find(vmObj => vmObj.name == obj.metric.pod)) {
          vmMemoryFilteredData.push(obj)
        } else {
          kaasMemoryFilteredData.push(obj)
        }
      })
    }

    setVmData({ ...vmData, ['cpuData']: vmCpuFilteredData, ['memoryData']: vmMemoryFilteredData })
    setKaasData({ ...kaasData, ['cpuData']: kaasCpuFilteredData, ['memoryData']: kaasMemoryFilteredData })
  }, [vmCpuData, vmMemoryData, vmList])


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
        data: [vmOutboundData , vmInboundData],
      },
    ]
  }

  const { isLoading, isRefreshing } = customStore
  const configs = getMonitoringCfgs()

  console.log("vmData : "+ JSON.stringify(vmData))

  return (
      <MonitoringController
          title={t('컴퓨팅/KaaS 리소스')}
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

export default inject('rootStore')(observer(index))

