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
  const [vmMemoryData, setVmMemoryData] = useState([]);

  const fetchData = async (params) => {

    var currentTime = Math.floor(Date.now() / 1000);

    console.log(params)

    const step = ((params.step).replace('m', '') * params.times) + 'm';
    const start = (params.start == '' || !!!params.start) ? currentTime - 3000 : Math.floor(params.start);
    const end = (params.end == '' || !!!params.end) ? currentTime : Math.floor(params.end);

    // const vmName = store.detail.name;
    const vmName = "vpc-test";

    const getNodeCpuUsageData = async () => {
      const nodeCpuData = await customStore.fetchMetric({
        expr: `(1 - avg(irate(node_cpu_seconds_total{mode="idle"}[${step}])) by (instance)) * 100`,
        start,
        end,
      })

      console.log("nodeCpuData : "+ JSON.stringify(nodeCpuData))
      const nodeCpuMetricData = _.find(nodeCpuData, (data) => {
        if (data.metric.pod === vmName ) return data;
      });
  
      // 배열 처리 
      const nodeCpuArray = [];
      nodeCpuArray.push(nodeCpuMetricData)
      setNodeCpuData(nodeCpuArray)
    };

    // vm memory data
    const getNodeMemoryUsageData = async () => {
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
    
    getNodeCpuUsageData();
    getNodeMemoryUsageData();

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
        unit: '%',
        unitType: 'memory',
        legend: ['MEMORY_USAGE'],
        data: vmMemoryData,
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

