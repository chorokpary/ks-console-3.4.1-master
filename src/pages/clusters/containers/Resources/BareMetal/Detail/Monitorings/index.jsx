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

  const [nodeCpuData, setNodeCpuData] = useState([]);
  const [nodeMemoryData, setNodeMemoryData] = useState([]);
  const [nodeDiskData, setNodeDiskData] = useState([]);
  const [nodePowerData, setNodePowerData] = useState([]);
  const [nodeTemperatureData, setNodeTemperatureData] = useState([]);  

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

    const detailData = toJS(store.detail)
    const instance = detailData.systemType == "C" ? detailData.name : (detailData.baremetals).find(item => item.name == detailData.name).nodeExporter.ip;
    const target = detailData.systemType == "C" ? (detailData.clusters).find(item => item.name == detailData.name).openBMC?.address
                                                : (detailData.baremetals).find(item => item.name == detailData.name).openBMC?.address;
    
    // cpu 사용량
    const getNodeCpuUsageData = async () => {
      const nodeCpuData = await customStore.fetchMetric({
        expr: `(1 - avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance))`,
        ...paramsData,
      })

      const nodeCpuMetricData = _.find(nodeCpuData, (data) => {
        if (get(data, 'metric.instance').split(":")[0] === instance ) return data;        
      });

      // 배열 처리 
      const nodeCpuArray = [];
      nodeCpuArray.push(nodeCpuMetricData)
      setNodeCpuData(nodeCpuArray)
    };

    // Memory 사용량
    // 사용률: `(1 - ((avg_over_time(node_memory_MemFree_bytes[5m]) + avg_over_time(node_memory_Cached_bytes[5m]) + avg_over_time(node_memory_Buffers_bytes[5m])) / avg_over_time(node_memory_MemTotal_bytes[5m])))`,
    // 사용량: `sum(node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Cached_bytes + node_memory_Buffers_bytes)) by (instance)`,
    const getNodeMemoryUsageData = async () => {
      const nodeMemoryData = await customStore.fetchMetric({
        expr: `sum(node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Cached_bytes + node_memory_Buffers_bytes)) by (instance)`,
        ...paramsData,
      })

      const nodeMemoryMetricData = _.find(nodeMemoryData, (data) => {
        if (get(data, 'metric.instance').split(":")[0] === instance ) return data;  
      });

      // 배열 처리 
      const nodeMemoryArray = [];
      nodeMemoryArray.push(nodeMemoryMetricData)
      setNodeMemoryData(nodeMemoryArray)
    };

    // Disk 사용량
    const getNodeDiskUsageData = async () => {
      const nodeDiskData = await customStore.fetchMetric({
        expr: `sum(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) by (instance)`,        
        ...paramsData,
      })

      const nodeDiskMetricData = _.find(nodeDiskData, (data) => {
        if (get(data, 'metric.instance').split(":")[0] === instance ) return data;  
      });

      // 배열 처리 
      const nodeDiskArray = [];
      nodeDiskArray.push(nodeDiskMetricData)
      setNodeDiskData(nodeDiskArray)
    };

    // 파워 사용량
    const getNodePowerUsageData = async () => {
      const nodePowerData = await customStore.fetchMetric({
        expr: `avg(redfish_chassis_power_powersupply_last_power_output_watts) by (target)`,        
        ...paramsData,
      })

      const nodePowerMetricData = _.find(nodePowerData, (data) => {
        if (get(data, 'metric.target') === target ) return data;  
      });

      // 배열 처리 
      const nodePowerArray = [];
      nodePowerArray.push(nodePowerMetricData)
      setNodePowerData(nodePowerArray)
    };

    // 온도
    const getNodeTemperatureData = async () => {
      const nodeTemperatureData = await customStore.fetchMetric({
        expr: `avg(redfish_chassis_temperature_celsius) by (target)`,        
        ...paramsData,
      })

      const nodeTemperatureMetricData = _.find(nodeTemperatureData, (data) => {
        if (get(data, 'metric.target') === target ) return data;  
      });
   
      // 배열 처리 
      const nodeTemperatureArray = [];
      nodeTemperatureArray.push(nodeTemperatureMetricData)
      setNodeTemperatureData(nodeTemperatureArray)
    };

    getNodeCpuUsageData();
    getNodeMemoryUsageData();
    getNodeDiskUsageData();
    getNodePowerUsageData();
    getNodeTemperatureData();

  }

  const getMonitoringCfgs = () => {
    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend: ['CPU_USAGE'],
        data: nodeCpuData,
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: "GB",
        legend: ['MEMORY_USAGE'],
        data: nodeMemoryData,
      },
      {
        type: 'utilisation',
        title: 'DISK_USAGE',
        unitType: 'disk',
        legend: ['DISK_USAGE'],
        data: nodeDiskData,
      },
      {
        type: 'utilisation',
        title: 'Power Usage',
        unit: 'kWh',
        legend: ['Power Usage'],
        data: nodePowerData,
      },
      {
        type: 'utilisation',
        title: 'Temperature',
        unit: '℃',
        legend: ['Temperature'],
        data: nodeTemperatureData,
      },

    ]
  }

  const { isLoading, isRefreshing } = customStore
  const configs = getMonitoringCfgs()

  return (
    <>  
        <div>
          <div className={styles.wrapper}>
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
          </div>
      </div>         
    </>
  );
};

export default inject('detailStore')(observer(index))

