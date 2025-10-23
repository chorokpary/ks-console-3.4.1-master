import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'

const Vm = ({
  dataList,
  filter,
  sort,
  range,
  popOpen,
  getAreaColor,
  customStore,
  gpuXidData,
  transformXidDataToObject,
  selectCluster,
  gpuDataList,
  setGpuDataList,
  setGpuXidData,
  setSelectCluster,
  setPopOpen,
  ...props
}) => {
  useEffect(() => {
    if (selectCluster) {
      getGpuData(selectCluster)
    }
  }, [range])

  const getGpuData = async selectCluster => {
    var currentTime = Math.floor(Date.now() / 1000)
    const paramsData = {
      start: currentTime - 1000,
      end: currentTime - 1000,
    }
    // avg by (gpu) (DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod=~"gpu-wbl-upstage-580-01", namespace="default"}) / 100
    const expr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod="${selectCluster.group}"}`
    const gpuAvgUsageData = await customStore.fetchMetric({
      expr: expr,
      paramsData,
    })

    setGpuDataList(gpuAvgUsageData)

    // Xid Error
    const gpuXidExpr = `DCGM_FI_DEV_XID_ERRORS{job="launcher-dcgm-exporter", pod="${selectCluster.group}"}`
    const gpuXidData = await customStore.fetchMetric({
      expr: gpuXidExpr,
      cluster: selectCluster?.namespace,
    })

    // Xid Error - 최근 10분간 변화량이 있는지 확인
    const gpuXidExprChangeExpr = `changes((max by (gpu, pod) (DCGM_FI_DEV_XID_ERRORS{job="launcher-dcgm-exporter", pod="${selectCluster.group}"})[10m:])) > 0`
    const gpuXidExprChangeData = await customStore.fetchMetric({
      expr: gpuXidExprChangeExpr,
      cluster: selectCluster?.namespace,
      start: currentTime - range, // 1시간 기준 > 3600
      end: currentTime,
    })
    const gpuXidTransform = transformXidDataToObject(
      gpuXidData,
      gpuXidExprChangeData
    )
    setGpuXidData(gpuXidTransform)
  }

  return (
    <>
      <div id="gpunode-map" className="gpunode_map">
        {dataList
          .filter(item => {
            if (filter === 'all') return true
            if (filter === 'minor') return item.state === 'abnormal'
            if (filter === 'unknown') return item.state === 'unknown'
            return true
          })
          .sort((a, b) => {
            switch (sort) {
              case 'nameAsc':
                return a.group.localeCompare(b.group)
              case 'nameDesc':
                return b.group.localeCompare(a.group)
              case 'usageAsc':
                return a.value - b.value
              case 'usageDesc':
                return b.value - a.value
              default:
                return 0
            }
          })
          .map((item, index) => {
            return (
              <div
                className={`gpu_tile ${getAreaColor(item.value)}`}
                key={`${item.group} - ${index}`}
                onClick={() => {
                  getGpuData(item)
                  setSelectCluster(item)
                  setPopOpen(true)
                }}
              >
                <div className="name" title={item.group}>
                  {item.group}
                </div>
                <div className="percent">{item.value}%</div>
                {(item.state === 'abnormal' || item.state === 'unknown') && (
                  <div className={`badge_alert ${item.state}`}></div>
                )}
              </div>
            )
          })}
      </div>
      <div className={`gpu_backdrop ${popOpen && 'active'}`}>
        <div
          className={`gpu_popover ${getAreaColor(
            selectCluster?.value
          )} ${popOpen && 'active'}`}
        >
          <div className="data_vm">
            <div className="title">
              <span>{selectCluster?.group}</span>
              <Link
                to={`/clusters/${props.cluster}/projects/${selectCluster?.namespace}/vms/${selectCluster?.group}`}
              >
                <span className="link"></span>
              </Link>
              <span
                className="close_btn"
                onClick={() => {
                  setPopOpen(false)
                }}
              >
                ✕
              </span>
            </div>
            {selectCluster?.node && (
              <div className="gpu_data_info">
                <div>
                  <span className="label" style={{ flex: 'none' }}>
                    {t('RESOURCES_NODE')}
                  </span>
                  <span className="value">{selectCluster?.node}</span>
                  <Link
                    to={`/clusters/${props.cluster}/gpunodes/${selectCluster?.node}`}
                  >
                    <span className="link"></span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="gpu_info">
            <div className="gpu_usage_info">
              <span className="label">
                {t('RESOURCES_GPU_UTILIZATION_PERCENT')}
              </span>
              <span className="value">{selectCluster?.value || 0}%</span>
            </div>
            <div className="gpu_usage_info">
              <span className="label">
                {t('RESOURCES_GPU_MEMORY_UTILIZATION_PERCENT')}
              </span>
              <span className="value">{selectCluster?.valueMem || 0}%</span>
            </div>
          </div>
          {gpuDataList.length > 0 && (
            <div className="gpu_pop_boxes">
              {gpuDataList
                ?.sort((a, b) => a.metric.gpu - b.metric.gpu)
                .map((item, index) => (
                  <div
                    className={`gpu_pop_box ${getAreaColor(item?.value?.[1])} ${
                      gpuXidData?.[item.metric.pod]?.[item.metric.gpu].state ===
                      'minor'
                        ? 'gpu_alert'
                        : ''
                    }`}
                    key={index}
                  >
                    <div className="name">GPU-{item?.metric?.gpu}</div>
                    <div className="percent">
                      {Number(item?.value?.[1]) || 0}%
                    </div>
                    {gpuXidData?.[item.metric.pod]?.[item.metric.gpu].state ===
                      'minor' && <div className="badge_alert"></div>}
                  </div>
                ))}
            </div>
          )}

          {/* alert_card는 초기 미노출, 에러 gpu_pop_box.gpu_alert 클릭시에만 해당 에러 노출  */}
          <div className="alert_card">
            <div className="alert_content">
              <div className="alert_header">
                <span className="alert_status minor">경고</span>
                <span className="alert_resource type_gpu">GPU</span>
              </div>
              <div className="alert_body">
                <p className="alert_message">
                  GPU의 디스플레이 엔진 응답 지연을 감지했습니다.
                </p>
                <p className="alert_badge">
                  <span className="alert_errorcode">
                    XID error vm:vm023124234234241231231423421312314142342423,
                    gpu:2, error_code:43
                  </span>
                </p>
              </div>
              <p className="alert_date">2025-08-23</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Vm
