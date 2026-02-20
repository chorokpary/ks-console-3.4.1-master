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
  selectCluster,
  gpuDataList,
  setSelectCluster,
  setPopOpen,
  getVmAvgData,
  ...props
}) => {
  useEffect(() => {
    //gpu_tile .name 길어서 ellipsis 처리 될 때 tooltip 표현 (27자 이상일 때만)
    document.querySelectorAll('.gpu_tile .name').forEach(el => {
      const text = el.textContent.trim()
      if (text.length > 27) {
        el.setAttribute('data-text', text)
      }
    })
  }, [])

  useEffect(() => {
    if (selectCluster) {
      getVmAvgData()
    }
  }, [range])

  return (
    <>
      <div id="gpunode-map" className="gpunode_map">
        {dataList
          .filter(item => {
            if (filter === 'all') return true
            if (filter === 'minor') return item?.state === 'abnormal'
            if (filter === 'unknown') return item?.state === 'unknown'
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
                  setSelectCluster(item)
                  setPopOpen(true)
                }}
              >
                <div className="name">
                  <span className="name_text">{item.group}</span>
                </div>
                <div className="percent">{item.value}%</div>
                {(item?.state === 'abnormal' || item?.state === 'unknown') && (
                  <div className={`badge_alert ${item?.state}`}></div>
                )}
              </div>
            )
          })}
      </div>
      <div
        className={`gpu_backdrop ${popOpen && 'active'}`}
        ref={props.backdropRef}
      >
        <div
          className={`gpu_popover ${getAreaColor(
            selectCluster?.value
          )} ${popOpen && 'active'}`}
          ref={props.popoverRef}
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
                ?.sort((a, b) => a.gpu - b.gpu)
                .map(
                  (item, index) =>
                    item.group === selectCluster?.group && (
                      <div
                        className={`gpu_pop_box ${getAreaColor(
                          item?.value?.[1]
                        )} ${item?.state === 'minor' ? 'gpu_alert' : ''}`}
                        key={index}
                      >
                        <div className="name">GPU-{item?.gpu}</div>
                        <div className="percent">
                          {Number(item?.value?.[1]) || 0}%
                        </div>
                        {item?.state === 'minor' && (
                          <div className="badge_alert"></div>
                        )}
                      </div>
                    )
                )}
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
