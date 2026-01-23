import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { SimpleCircle } from 'components/Charts'
import GpuNodeStore from 'stores/resources/gpunodes'
import VmStore from 'stores/resources/vms'
import styles from './index.scss'

const GpuUsage = ({ widgetKey, monitorStore, ...props }) => {
  const gpuNodeStore = new GpuNodeStore()
  const vmStore = new VmStore()

  const [runningCount, setRunningCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    const gpuNodeList = await gpuNodeStore.fetchList({ limit: -1, ...props })
    const totalCnt = gpuNodeList.reduce((prev, curr) => prev + curr.count, 0)
    setTotalCount(totalCnt)

    const vmData = await vmStore.fetchList({ limit: -1, ...props })
    const vmCnt = vmData.reduce(
      (prev, curr) => (curr.node != '' ? prev + curr.gpus.length : prev),
      0
    )

    setRunningCount(vmCnt)
    setLoading(false)
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_GPU_AVAILABLE')}</label>
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
                        value={parseFloat(runningCount)}
                        total={parseFloat(totalCount)}
                        startAngle={90}
                        endAngle={-270}
                        isTooltip={false}
                        showRate={true}
                        renderCustomCenter={() => (
                          <div style={{ fontSize: '20px' }}>
                            {totalCount
                              ? ((runningCount / totalCount) * 100).toFixed(1)
                              : 0}
                            %
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="cont2">
                  <div className="status_wrap">
                    <div className="value">{runningCount}</div>
                    <p className="status used_gpu">
                      <span>{t('RESOURCES_USING')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{totalCount - runningCount}</div>
                    <p className="status waiting">
                      <span>{t('RESOURCES_UNUSED')}</span>
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

export default GpuUsage
