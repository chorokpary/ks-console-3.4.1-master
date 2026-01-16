import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { SimpleCircle } from 'components/Charts'
import VmStore from 'stores/resources/vms'
import CustomStore from 'stores/monitoring/custom/monitor'
import styles from './index.scss'
import { getCustomValue } from 'utils/monitoring'
import { get, last, set } from 'lodash'

const MemoryUsage = ({ widgetKey, monitorStore, ...props }) => {
  const customStore = new CustomStore()
  const vmStore = new VmStore()

  const [loading, setLoading] = useState(false)
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [memoryNonUsage, setMemoryNonUsage] = useState(0)
  const [memoryUsageAll, setMemoryUsageAll] = useState(0)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)

    const vmList = await vmStore.vmList({ limit: -1, ...props })
    let promsql_pod_vm_list = ''
    let vm_list_length = 0
    vmList.map(obj => {
      promsql_pod_vm_list = promsql_pod_vm_list + obj.name + '|'
      vm_list_length++
    })

    var currentTime = Math.floor(Date.now() / 1000)
    const memoryUsageData = await customStore.fetchMetric({
      expr: `sum(node_memory_MemTotal_bytes{namespace="default",service="launcher-node-exporter",pod!~"${promsql_pod_vm_list}"} 
      - node_memory_MemAvailable_bytes{namespace="default",service="launcher-node-exporter",pod!~"${promsql_pod_vm_list}"}) 
      / ${getCustomValue('memory', 'Gi')}`,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    const usage = last(memoryUsageData?.[0].values)[1]
    setMemoryUsage(Math.floor(usage))

    const memoryNonUsageData = await customStore.fetchMetric({
      expr: `sum(node_memory_MemAvailable_bytes{namespace="default",service="launcher-node-exporter",pod!~"${promsql_pod_vm_list}"}) 
      / ${getCustomValue('memory', 'Gi')}`,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    const nonUsage = last(memoryNonUsageData?.[0].values)[1]
    setMemoryNonUsage(Math.floor(nonUsage))

    const memoryUsageDataAll = await customStore.fetchMetric({
      expr: `(sum(node_memory_MemTotal_bytes{namespace="default",service="launcher-node-exporter"}) 
      - sum(node_memory_MemTotal_bytes{namespace="default",service="launcher-node-exporter",pod=~"${promsql_pod_vm_list}"})) 
      / ${getCustomValue('memory', 'Gi')}`,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    const usageAll = last(memoryUsageDataAll?.[0].values)[1]
    setMemoryUsageAll(Math.floor(usageAll))

    setLoading(false)
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_MEMORY_AVAILABLE')}</label>
        </div>
        <Loading spinning={loading}>
          <div className="grid_info style_status">
            <div className="box type_status">
              <div className="cont_group">
                <div className="cont1">
                  <div className={styles.card}>
                    <div className={styles.chart}>
                      <SimpleCircle
                        width="100%"
                        height="100%"
                        value={parseFloat(memoryUsage)}
                        total={parseFloat(memoryUsageAll)}
                        startAngle={90}
                        endAngle={-270}
                        isTooltip={false}
                        showRate={true}
                        renderCustomCenter={() => (
                          <div style={{ fontSize: '20px' }}>
                            {((memoryUsage / memoryUsageAll) * 100).toFixed(1)}%
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="cont2">
                  <div className="status_wrap">
                    <div className="value">{memoryUsage}</div>
                    <p className="status used_gpu">
                      <span>{t('RESOURCES_USING')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{memoryUsageAll - memoryUsage}</div>
                    <p className="status waiting">
                      <span>{t('RESOURCES_UNUSED')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{memoryUsageAll}</div>
                    <p className="status total">
                      <span>{t('RESOURCES_ALL')}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Loading>
      </div>
    </>
  )
}

export default MemoryUsage
