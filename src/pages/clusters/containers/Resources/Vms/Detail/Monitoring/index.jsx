import { get, isEmpty } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { getChartData, getAreaChartOps } from 'utils/monitoring'
import NodeMonitorStore from 'stores/monitoring/node'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea } from 'components/Charts'

import styles from './index.scss'


const MetricTypes = {
  cpu_utilisation: 'node_cpu_utilisation',
  cpu_load1: 'node_load1',
  cpu_load5: 'node_load5',
  cpu_load15: 'node_load15',
  memory_utilisation: 'node_memory_utilisation',
  disk_utilisation: 'node_disk_size_utilisation',
  disk_inode_utilisation: 'node_disk_inode_utilisation',
  device_size_utilisation: 'node_device_size_utilisation',
  disk_inode_usage: 'node_disk_inode_usage',
  disk_inode_total: 'node_disk_inode_total',
  disk_read_iops: 'node_disk_read_iops',
  disk_write_iops: 'node_disk_write_iops',
  disk_read_throughput: 'node_disk_read_throughput',
  disk_write_throughput: 'node_disk_write_throughput',
  net_transmitted: 'node_net_bytes_transmitted',
  net_received: 'node_net_bytes_received',
}

const index = (props) => {

  const store = props.detailStore;

  const cluster = props.match.params.cluster

  const monitorStore = new NodeMonitorStore({ cluster: cluster })

  const [metrics, setMetrics] = useState(monitorStore.data)

  const fetchData = async (params) => {
    // const { name, role = [] } = this.store.detail
    let name = "worker01"
    let role = ""
    await monitorStore.fetchMetrics({
      resources: [name],
      metrics: Object.values(MetricTypes),
      fillZero: !role.includes('edge'),
      ...params,
    })
    
    setMetrics(monitorStore.data)
  }

  const getMonitoringCfgs = () => {

    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend: ['CPU_USAGE'],
        data: get(metrics, `${MetricTypes.cpu_utilisation}.data.result`),
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        legend: ['MEMORY_USAGE'],
        data: get(
          metrics,
          `${MetricTypes.memory_utilisation}.data.result`
        ),
      },
      {
        type: 'bandwidth',
        title: 'NETWORK_TRAFFIC',
        unitType: 'bandwidth',
        legend: ['OUT', 'IN'],
        data: [
          get(
            metrics,
            `${MetricTypes.net_transmitted}.data.result[0]`,
            {}
          ),
          get(metrics, `${MetricTypes.net_received}.data.result[0]`, {}),
        ],
      },
    ]
  }

  const { isLoading, isRefreshing } = monitorStore
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
              isEmpty={isEmpty(metrics)}              
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

