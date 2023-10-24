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

  const [vmCpuData, setVmCpuData] = useState([]);
  const [vmMemoryData, setVmMemoryData] = useState([]);
  const [vmInboundData, setVmInboundData] = useState({});
  const [vmOutboundData, setVmOutboundData] = useState({});

  const fetchData = async (params) => {

    var currentTime = Math.floor(Date.now() / 1000);

    const step = params.step;
    const times = params.times;
    const start = (params.start == '' || !!!params.start) ? currentTime - 3000 : Math.floor(params.start);
    const end = (params.end == '' || !!!params.end) ? currentTime : Math.floor(params.end);

    
    // const vmName = store.detail.name;
    const vmName = "vpc-test";

    const getVmCpuUsageData = async () => {
      const vmCpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[${step}])) * ${times})) / 100`,
        start,
        end,
      })

      const vmCpuMetricData = _.find(vmCpuData, (data) => {
        if (data.metric.pod === vmName ) return data;
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
        start,
        end,
      })

      const vmMemoryMetricData = _.find(vmMemoryData, (data) => {
        if (data.metric.pod === vmName ) return data;
      });

      // 배열 처리 
      const vmMemoryArray = [];
      vmMemoryArray.push(vmMemoryMetricData)
      setVmMemoryData(vmMemoryArray)

    };

    const getVmInboundData = async () => {
      const vmInboundData = await customStore.fetchMetric({
        expr: `irate(node_network_receive_bytes_total{service='launcher-node-exporter',device=~"net.*|eth.*"}[${step}])`,
        start,
        end,
      })

      const vmInboundMetricData = _.find(vmInboundData, (data) => {
        if (data.metric.pod === vmName ) return data;
      });

      setVmInboundData(vmInboundMetricData)

    };
   
    // vm outbound data
    const getVmOutboundData = async () => {
      const vmOutboundData= await customStore.fetchMetric({
        expr: `irate(node_network_transmit_bytes_total{namespace='default',service='launcher-node-exporter',device=~"net.*|eth.*"}[${step}])`,
        start,
        end,
      })

      const vmOutboundMetricData = _.find(vmOutboundData, (data) => {
        if (data.metric.pod === vmName ) return data;
      });

      setVmOutboundData(vmOutboundMetricData)

    };
    
    getVmCpuUsageData();
    getVmMemoryUsageData();
    getVmInboundData();
    getVmOutboundData()    

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
        data: [vmOutboundData , vmInboundData],
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
              title={t('모니터링')}
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

