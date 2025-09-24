import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'
import CustomStore from 'stores/monitoring/custom/monitor'

const GpuStatus = ({ widgetKey, monitorStore, ...props }) => {
  const [minorCount, setMinorCount] = useState(0)
  const [normalCount, setNormalCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const customStore = new CustomStore()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    var currentTime = Math.floor(Date.now() / 1000)

    // Xid Error
    const gpuXidExpr = `DCGM_FI_DEV_XID_ERRORS{job="launcher-dcgm-exporter"}`
    const gpuXidData = await customStore.fetchMetric({
      expr: gpuXidExpr,
    })

    const gpuXidExprChangeExpr = `changes((max by (gpu, pod) (DCGM_FI_DEV_XID_ERRORS{job="launcher-dcgm-exporter"})[10m:])) > 0`
    const gpuXidExprChangeData = await customStore.fetchMetric({
      expr: gpuXidExprChangeExpr,
      start: currentTime - 3600, // 1시간 기준 > 3600
      end: currentTime,
    })
    transformXidDataToObject(gpuXidData, gpuXidExprChangeData)
  }

  const transformXidDataToObject = (data1, data2) => {
    let minorCount = 0
    let normalCount = 0
    let totalCount = 0

    const comparePods = new Set(
      data2.map(item => `${item.metric.pod}-${item.metric.gpu}`)
    )

    data1.forEach(item => {
      const pod = item.metric.pod
      const gpu = item.metric.gpu
      const key = `${pod}-${gpu}`
      const errCode = item.metric.err_code

      if (comparePods.has(key) && errCode !== '0') {
        minorCount++
      } else {
        if (Number(errCode) >= 0 && Number(errCode) <= 143) {
          normalCount++
        }
      }
      totalCount++
    })
    setMinorCount(minorCount)
    setNormalCount(normalCount)
    setTotalCount(totalCount)
    setLoading(false)
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>GPU</label>
        </div>
        <Loading spinning={loading}>
          <div className="grid_info style_status">
            <div className="box type_status">
              <div className="cont_group">
                <div className="cont1">
                  <div className="number_wrap">
                    <i className="ico-type-gpuaas-gpu"></i>
                    <p>
                      <span className="em">{normalCount}</span> / {totalCount}
                    </p>
                  </div>
                </div>
                <div className="cont2">
                  <div className="status_wrap">
                    <div className="value">{normalCount}</div>
                    <p className="status running">
                      <span>정상</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">
                      {totalCount - normalCount - minorCount}
                    </div>
                    <p className="status unknown">
                      <span>미확인</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{minorCount}</div>
                    <p className="status warning">
                      <span>경고</span>
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

export default GpuStatus
