import { get, isEmpty, find } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import { getChartData, getAreaChartOps } from 'utils/monitoring'

import VmStore from 'stores/resources/vms'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea, MediumArea } from 'components/Charts'

import styles from './index.scss'

const index = (props) => {

  const customStore = new CustomStore();
  const vmStore = new VmStore();

  const [vmList, setVmList] = useState([])
  const [vmData, setVmData] = useState({ cpuData: [], memoryData: [] });
  const [kaasData, setKaasData] = useState({ cpuData: [], memoryData: [] });

  const [cpuData, setCpuData] = useState([]);
  const [memoryData, setMemoryData] = useState([]);
  const [inboundData, setInboundData] = useState({});
  const [outboundData, setOutboundData] = useState({});

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
      const cpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[5m])) * 100)) / 100`,
        // expr: `(1 - avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance))`,
        ...paramsData,
      })
      setCpuData(cpuData)
    };

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const memoryData = await customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        ...paramsData,
      })
      setMemoryData(memoryData)
    };

    // vm inbound data
    const getVmInboundData = async () => {
      const inboundData = await customStore.fetchMetric({
        expr: `irate(node_network_receive_bytes_total{service='launcher-node-exporter',device=~"net.*|eth.*"}[5m])`,
        ...paramsData,
      })
      
      setInboundData(inboundData[0])
    };
   
    // vm outbound data
    const getVmOutboundData = async () => {
      const outboundData= await customStore.fetchMetric({
        expr: `irate(node_network_transmit_bytes_total{namespace='default',service='launcher-node-exporter',device=~"net.*|eth.*"}[5m])`,
        ...paramsData,
      })

      setOutboundData(outboundData[0])
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

    if (cpuData.length > 0) {
      cpuData.map(obj => {
        if (vmList.find(vmObj => vmObj.name == obj.metric.pod)) {
          vmCpuFilteredData.push(obj)
        } else {
          kaasCpuFilteredData.push(obj)
        }
      })
    }
    if (memoryData.length > 0) {
      memoryData.map(obj => {
        if (vmList.find(vmObj => vmObj.name == obj.metric.pod)) {
          vmMemoryFilteredData.push(obj)
        } else {
          kaasMemoryFilteredData.push(obj)
        }
      })
    }

    //  작업 중~~~~
    if(vmCpuFilteredData.length > 0 ){

      console.log("vmCpuFilteredData.length : "+ vmCpuFilteredData.length)
      vmCpuFilteredData.map(data => {
        (data.values).map(obj => {

        })
      })

      const standardJson = vmCpuFilteredData[0]
      const standardValues = standardJson.values;
      // console.log("tempJson : "+ JSON.stringify(tempJson))

      let sumCpu = 0;
      standardValues.map(obj => {
        // console.log(obj[1])
        sumCpu += Number(obj[1])
      })
      // console.log("sumCpu : "+ sumCpu)


      // console.log(JSON.stringify(standardValues))
      const standardData = getAreaChartOps({
        type: 'utilisation',
        title: 'CPU_USAGE_X86',
        unit: '%',
        legend: ['CPU_USAGE_X86'],
        data: [standardJson],
      })

      const chartDataArray = [];
      vmCpuFilteredData.map(data => {
        const chartData = getAreaChartOps({
            type: 'utilisation',
            title: 'CPU_USAGE_X86',
            unit: '%',
            legend: ['CPU_USAGE_X86'],
            data: [data],
          })

        chartDataArray.push(chartData)  
      })


      // console.log(JSON.stringify(chartDataArray))
    }

   


    setVmData({ ...vmData, ['cpuData']: vmCpuFilteredData, ['memoryData']: vmMemoryFilteredData })
    setKaasData({ ...kaasData, ['cpuData']: kaasCpuFilteredData, ['memoryData']: kaasMemoryFilteredData })


  }, [cpuData, memoryData, vmList])

  const getMonitoringCfgs = () => {

    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend: ['CPU_USAGE'],
        data: cpuData,
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: ['MEMORY_USAGE'],
        data: memoryData,
      },
      {
        type: 'bandwidth',
        title: 'NETWORK_TRAFFIC',
        unitType: 'bandwidth',
        legend: ['OUT', 'IN'],
        data: [outboundData , inboundData],
      },
    ]
  }

  const { isLoading, isRefreshing } = customStore
  const configs = getMonitoringCfgs()

  return (
   
      <MonitoringController
          title={t('컴퓨팅/KaaS 리소스')}
          onFetch={fetchData}
          loading={isLoading}
          refreshing={isRefreshing}       
        >
          <div className={styles.title}>컴퓨팅 리소스 사용량</div>
          <div className={styles.divwrap}>
            {configs.map((item, index) => {
              const config = getAreaChartOps(item)

              if (isEmpty(config.data)) return null
              if (item.type != "utilisation") return null
              return (
                <div key={config.title} className={index%2 == 1 ? styles.div_right : styles.div_left}>
                    <MediumArea width="100%" height={150} {...config} />
                </div>
              )
            })}
          </div>
          {configs.map((item, index) => {
            const config = getAreaChartOps(item)

            if (isEmpty(config.data)) return null
            if (item.type != "bandwidth") return null
            return <SimpleArea key={config.title} width="100%" {...config} />

          })}
        </MonitoringController>    
  

  );
};

export default inject('rootStore')(observer(index))

