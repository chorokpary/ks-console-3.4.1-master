import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { SimpleCircle } from 'components/Charts'
import VmStore from 'stores/resources/vms'
import CustomStore from 'stores/monitoring/custom/monitor'
import styles from './index.scss'
import { getSuitableValue } from 'utils/monitoring'
import { get, last, set } from 'lodash'

const CpuUsage = ({ widgetKey, monitorStore, ...props }) => {
  const customStore = new CustomStore()
  const vmStore = new VmStore()

  const [loading, setLoading] = useState(false)
  const [cpuUsage, setCpuUsage] = useState(0)
  const [cpuNonUsage, setCpuNonUsage] = useState(0)
  const [cpuUsageAll, setCpuUsageAll] = useState(0)

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
    const cpuUsageData = await customStore.fetchMetric({
      expr: `sum(rate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode!="idle",pod!~"${promsql_pod_vm_list}"}[5m]))`,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    const usage = last(cpuUsageData?.[0].values)[1]
    setCpuUsage(Math.floor(usage))

    const vmNonUsageData = await customStore.fetchMetric({
      expr: `count(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}) - sum(rate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",pod=~"${promsql_pod_vm_list}"}[5m])) - sum(rate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode!="idle",pod!~"${promsql_pod_vm_list}"}[5m]))`,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    const nonUsage = last(vmNonUsageData?.[0].values)[1]
    setCpuNonUsage(Math.floor(nonUsage))

    const vmUsageDataAll = await customStore.fetchMetric({
      expr: `count(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}) - sum(rate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",pod=~"${promsql_pod_vm_list}"}[5m]))`,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    const usageAll = last(vmUsageDataAll?.[0].values)[1]
    setCpuUsageAll(Math.floor(usageAll))

    setLoading(false)
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_CPU_AVAILABLE')}</label>
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
                        value={cpuUsage}
                        total={cpuUsageAll}
                        startAngle={90}
                        endAngle={-270}
                        isTooltip={false}
                        showRate={true}
                        renderCustomCenter={() => (
                          <div style={{ fontSize: '20px' }}>
                            {cpuUsageAll
                              ? ((cpuUsage / cpuUsageAll) * 100).toFixed(1)
                              : 0}
                            %
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="cont_unit" style={{ justifyContent: 'center' }}>
                  <div className="status_wrap">
                    <div className="value">{cpuUsage}</div>
                    <p className="status used_gpu">
                      <span>{t('RESOURCES_USING')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{cpuNonUsage}</div>
                    <p className="status waiting">
                      <span>{t('RESOURCES_UNUSED')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{cpuUsageAll}</div>
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

export default CpuUsage
