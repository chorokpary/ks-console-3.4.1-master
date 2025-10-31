import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'

const Gpu = ({
  dataList,
  filter,
  sort,
  range,
  getAreaColor,
  setPopOpen,
  popOpen,
  vmList,
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

  const [selectGpu, setSelectGpu] = useState({})

  return (
    <>
      <div id="gpu-map" className="gpu_map">
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
                return a.util - b.util
              case 'usageDesc':
                return b.util - a.util
              default:
                return 0
            }
          })
          .map((gpuItem, index) => (
            <div
              className={`gpu_tile ${getAreaColor(gpuItem?.util)} ${
                gpuItem.state === 'minor' ? 'gpu_alert' : ''
              }`}
              key={`${gpuItem.group}-${gpuItem.gpu}-${index}`}
              onClick={() => {
                setSelectGpu({
                  vmName: gpuItem.group,
                  gpuIndex: gpuItem.gpu,
                  data: gpuItem,
                })
                setPopOpen(true)
              }}
            >
              <div className="name">
                <span className="name_text">
                  GPU-{gpuItem.gpu} ({gpuItem.group})
                </span>
              </div>
              <div className="percent">{gpuItem.util}%</div>
              {(gpuItem.state === 'minor' || gpuItem.state === 'unknown') && (
                <div className={`badge_alert ${gpuItem.state}`}></div>
              )}
            </div>
          ))}
      </div>
      <div className={`gpu_backdrop ${popOpen && 'active'}`}>
        <div
          className={`gpu_popover ${getAreaColor(
            selectGpu?.data?.util
          )} ${popOpen && 'active'}`}
        >
          <div className="data_gpu">
            <div className="title">
              <span>
                <i className="ico-type24-gpuaas-gpu"></i>
                GPU-{selectGpu?.gpuIndex}
              </span>
              <span
                className="close_btn"
                onClick={() => {
                  setPopOpen(false)
                }}
              >
                ✕
              </span>
            </div>
            <div className="gpu_data_info">
              <div>
                <span className="label" style={{ flex: 'none' }}>
                  {t('RESOURCES_NODE')}
                </span>
                <span className="value">
                  {vmList.find(item => item.name === selectGpu?.vmName)?.node}
                </span>
                <Link
                  to={`/clusters/${props.cluster}/gpunodes/${
                    vmList.find(item => item.name === selectGpu?.vmName)?.node
                  }`}
                >
                  <span className="link"></span>
                </Link>
              </div>
              <div>
                <span className="label" style={{ flex: 'none' }}>
                  {t('RESOURCES_VM')}
                </span>
                <span className="value">{selectGpu?.vmName}</span>
                <Link
                  to={`/clusters/${props.cluster}/projects/${
                    vmList.find(item => item.name === selectGpu?.vmName)
                      ?.project
                  }/vms/${selectGpu?.vmName}`}
                >
                  <span className="link"></span>
                </Link>
              </div>
            </div>
          </div>
          <div className="gpu_info">
            <div className="gpu_usage_info">
              <span className="label">
                {t('RESOURCES_GPU_UTILIZATION_PERCENT')}
              </span>
              <span className="value">{selectGpu?.data?.util || 0}%</span>
            </div>
            <div className="gpu_usage_info">
              <span className="label">
                {t('RESOURCES_GPU_MEMORY_UTILIZATION_PERCENT')}
              </span>
              <span className="value">{selectGpu?.data?.mem || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Gpu
