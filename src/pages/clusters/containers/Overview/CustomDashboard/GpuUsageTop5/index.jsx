import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import CustomStore from 'stores/monitoring/custom/monitor'

const GpuUsageTop5 = ({ widgetKey, monitorStore, ...props }) => {
  const customStore = new CustomStore()

  const [gpuUsageTop5Data, setGpuUsageTop5Data] = useState()
  const [gpuMemUsageTop5Data, setGpuMemUsageTop5Data] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    const gpuUsageTop5Expr = `topk(5, max by (pod,gpu) (DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter"}))`
    const gpuUsageTop5 = await customStore.fetchMetric({
      expr: gpuUsageTop5Expr,
    })
    setGpuUsageTop5Data(gpuUsageTop5)

    const gpuMemUsageTop5Expr = `topk(5, max by (pod,gpu) (
        (DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter"} * 100)
        / (DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter"} + DCGM_FI_DEV_FB_FREE{job="launcher-dcgm-exporter"})
      ))
      `
    const gpuMemUsageTop5 = await customStore.fetchMetric({
      expr: gpuMemUsageTop5Expr,
    })
    setGpuMemUsageTop5Data(gpuMemUsageTop5)
    setLoading(false)
  }
  //gpu 사용 현황 Top5 gpu 이름 길어서 ellipsis 처리 될 때 tooltip 표현
  document.querySelectorAll('.gpu_name').forEach(el => {
    el.setAttribute('data-text', el.textContent.trim())
  })

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_GPU_USAGE_STATUS_TOP5')}</label>
          <div className="right"></div>
        </div>
        <Loading spinning={loading}>
          <div className="gpu_usage_top_wrap">
            <div className="gpu_usage_top">
              <h3 className="gpu_usage_top_title">
                GPU {t('RESOURCES_USAGE')} (%)
              </h3>
              <ul className="gpu_usage_list">
                {gpuUsageTop5Data?.map((item, idx) => (
                  <li className="gpu_usage_item" key={idx}>
                    <span className="gpu_name">
                      {item.metric.pod}/{item.metric.gpu}
                    </span>
                    <div className="bar_wrapper">
                      <div
                        className="bar"
                        style={{
                          width: `${Number(item.value[1]).toFixed(0) || 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="percent">
                      {Number(item.value[1]).toFixed(0) || 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="gpu_usage_top color2">
              <h3 className="gpu_usage_top_title">
                GPU {t('RESOURCES_GPU_AVG_MEMORY_USAGE')} (%)
              </h3>
              <ul className="gpu_usage_list">
                {gpuMemUsageTop5Data?.map((item, idx) => (
                  <li className="gpu_usage_item" key={idx}>
                    <span className="gpu_name">
                      {item.metric.pod}/{item.metric.gpu}
                    </span>
                    <div className="bar_wrapper">
                      <div
                        className="bar"
                        style={{
                          width: `${Number(item.value[1]).toFixed(0) || 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="percent">
                      {Number(item.value[1]).toFixed(0) || 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Loading>
      </div>
    </>
  )
}

export default GpuUsageTop5
