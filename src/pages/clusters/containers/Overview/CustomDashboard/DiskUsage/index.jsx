import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { SimpleCircle } from 'components/Charts'
import VmStore from 'stores/resources/vms'
import CustomStore from 'stores/monitoring/custom/monitor'
import styles from './index.scss'
import { getCustomValue } from 'utils/monitoring'
import { get, last, set } from 'lodash'

const DiskUsage = ({ widgetKey, monitorStore, ...props }) => {
  const customStore = new CustomStore()
  const vmStore = new VmStore()

  const [loading, setLoading] = useState(false)
  const [diskUsage, setDiskUsage] = useState(0)
  const [diskNonUsage, setDiskNonUsage] = useState(0)
  const [diskUsageAll, setDiskUsageAll] = useState(0)

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
    const diskUsageData = await customStore.fetchMetric({
      expr: `sum(node_filesystem_size_bytes{fstype!~"tmpfs|fuse.lxcfs|squashfs|vfat",pod!~"${promsql_pod_vm_list}"} 
      - node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lxcfs|squashfs|vfat",pod!~"${promsql_pod_vm_list}"})
        / ${getCustomValue('disk', 'GB')}`,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    const usage = last(diskUsageData?.[0].values)[1]
    setDiskUsage(Math.floor(usage))

    const diskNonUsageData = await customStore.fetchMetric({
      expr: `sum(node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lxcfs|squashfs|vfat",pod!~"${promsql_pod_vm_list}"})
        / ${getCustomValue('disk', 'GB')}`,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    const nonUsage = last(diskNonUsageData?.[0].values)[1]
    setDiskNonUsage(Math.floor(nonUsage))

    const diskUsageDataAll = await customStore.fetchMetric({
      expr: `(sum(node_filesystem_size_bytes{fstype!~"tmpfs|fuse.lxcfs|squashfs|vfat"})
      - sum(node_filesystem_size_bytes{fstype!~"tmpfs|fuse.lxcfs|squashfs|vfat",pod=~"${promsql_pod_vm_list}"}))
        / ${getCustomValue('disk', 'GB')}`,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    const usageAll = last(diskUsageDataAll?.[0].values)[1]
    setDiskUsageAll(Math.floor(usageAll))

    setLoading(false)
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_DISK_AVAILABLE')}</label>
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
                        value={parseFloat(diskUsage)}
                        total={parseFloat(diskUsageAll)}
                        startAngle={90}
                        endAngle={-270}
                        isTooltip={false}
                        showRate={true}
                        renderCustomCenter={() => (
                          <div style={{ fontSize: '20px' }}>
                            {((diskUsage / diskUsageAll) * 100).toFixed(1)}%
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="cont2">
                  <div className="status_wrap">
                    <div className="value">{diskUsage}</div>
                    <p className="status used_gpu">
                      <span>{t('RESOURCES_USING')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{diskUsageAll - diskUsage}</div>
                    <p className="status waiting">
                      <span>{t('RESOURCES_UNUSED')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{diskUsageAll}</div>
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

export default DiskUsage
