import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'
import GpuClustersStore from 'stores/resources/gpuclusters'
import { StatusCircle } from 'components/Cards/Monitoring'
import { SimpleCircle } from 'components/Charts'
import classnames from 'classnames'
import CustomStore from 'stores/monitoring/custom/monitor'

import styles from './index.scss'
import { set } from 'lodash'

const GpuUsage = ({ widgetKey, monitorStore, ...props }) => {
  const customStore = new CustomStore()
  const [runningCount, setRunningCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    var currentTime = Math.floor(Date.now() / 1000)

    const gpuUtilDataExpr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter"}`

    const gpuUtilData = await customStore.fetchMetric({
      expr: gpuUtilDataExpr,
      start: currentTime - 1000,
      end: currentTime - 1000,
    })
    transformDataToObject(gpuUtilData)
  }

  const transformDataToObject = data => {
    let runningCount = 0
    let totalCount = 0

    data.forEach(item => {
      const values = item.values
      const lastValue = values.length > 0 ? values[values.length - 1][1] : 0

      if (lastValue && Number(lastValue) > 0) {
        runningCount++
      }
      totalCount++
    })
    setRunningCount(runningCount)
    setTotalCount(totalCount)
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
                        renderCustomCenter={() => (
                          <div style={{ fontSize: '20px' }}>
                            {(runningCount / totalCount) * 100}%
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
