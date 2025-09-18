import React, { useEffect, useState } from 'react'
import { get, last, set } from 'lodash'
import { Loading, Select } from '@kube-design/components'
import CustomStore from 'stores/monitoring/custom/monitor'
import {
  getSuitableValue,
  getSuitableUnit,
  getValueByUnit,
  getAreaChartOps,
  getCustomValue,
} from 'utils/monitoring'
import TinyArea from 'projects/containers/Overview/ResourceUsage/TinyArea'

const typeOption = [
  {
    value: 3600,
    label: t('최근 1시간'),
  },
  {
    value: 10800,
    label: t('최근 3시간'),
  },
  {
    value: 21600,
    label: t('최근 6시간'),
  },
  {
    value: 86400,
    label: t('최근 1일'),
  },
  {
    value: 172800,
    label: t('최근 2일'),
  },
  {
    value: 604800,
    label: t('최근 7일'),
  },
]
const GpuUsageStatus = ({ widgetKey, monitorStore, ...props }) => {
  const customStore = new CustomStore()
  const [nvlinkData, setNvlinkData] = useState()

  const [xidTimeRange, setXidTimeRange] = useState(3600)
  const [nvlinkLast, setNvlinkLast] = useState(0)

  useEffect(() => {
    getData()

    // select
    const selectedItems = document.querySelectorAll(
      '.select-list-box .selected-item'
    )
    const selectItemList = document.querySelectorAll(
      '.select-list-box .select-list li'
    )

    selectedItems.forEach((item, index) => {
      item.addEventListener(
        'click',
        e => {
          selectedItems.forEach((item, index) => {
            item.classList.remove('active')
          })

          if (e.currentTarget.className.indexOf('active') > -1) {
            e.currentTarget.classList.remove('active')
          } else {
            e.currentTarget.classList.add('active')
          }
        },
        false
      )
    })

    selectItemList.forEach((item, index) => {
      item.addEventListener(
        'click',
        () => {
          selectedItems.forEach((item, index) => {
            item.classList.remove('active')
          })
        },
        false
      )
    })
  }, [])

  const getData = async () => {
    var currentTime = Math.floor(Date.now() / 1000)
    const times = 7
    const step = Math.floor(xidTimeRange / times)
    const gpuNvlinkDataExpr = `sum(DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL{job="launcher-dcgm-exporter"}) * ${getCustomValue(
      'bandwidthBytes',
      'MBps'
    )}`
    const gpuNvlinkData = await customStore.fetchMetric({
      expr: gpuNvlinkDataExpr,
      start: currentTime - xidTimeRange,
      end: currentTime,
      step: `${step}s`, // 초 단위 step
      times: times,
    })
    setNvlinkData(gpuNvlinkData)
    const nvlinkLastData = last(gpuNvlinkData?.[0].values)[1]
    setNvlinkLast(getSuitableValue(nvlinkLastData, 'bandwidthBytes'))
  }

  useEffect(() => {
    getData()
  }, [xidTimeRange])

  return (
    <>
      <div className="grid_item">
        <div className="d-flex align-start w-100">
          <div className="content-box" style={{ width: '60%' }}>
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>GPU 사용 현황</label>
            </div>
          </div>
          <div
            className="content-box"
            style={{ width: '18%', marginTop: '-10px' }}
          >
            <div className="select-list-box">
              <div className="usageTab">
                <Select
                  value={xidTimeRange}
                  onChange={e => setXidTimeRange(e)}
                  options={typeOption}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="spin-nested-loading">
          <div className="spin-container">
            <div className="gpu_usage_grid">
              <div className="gpu_usage_card">
                <h3 className="gpu_usage_card_title">GPU 평균 사용률</h3>
                <p className="gpu_usage_card_value">76%</p>
                <div className="gpu_usage_card_chart">
                  <img src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png" />
                </div>
              </div>

              <div className="gpu_usage_card">
                <h3 className="gpu_usage_card_title">GPU 메모리 사용률</h3>
                <p className="gpu_usage_card_value">52%</p>
                <div className="gpu_usage_card_chart">
                  <img src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png" />
                </div>
              </div>

              <div className="gpu_usage_card">
                <h3 className="gpu_usage_card_title">GPU 온도 (최고 / 평균)</h3>
                <p className="gpu_usage_card_value">95℃ / 72℃</p>
                <div className="gpu_usage_card_chart">
                  <img src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png" />
                </div>
              </div>

              <div className="gpu_usage_card">
                <h3 className="gpu_usage_card_title">전력 사용량 (Total)</h3>
                <p className="gpu_usage_card_value">3,200w</p>
                <div className="gpu_usage_card_chart">
                  <img src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png" />
                </div>
              </div>

              <div className="gpu_usage_card">
                <h3 className="gpu_usage_card_title">NVLink (Total)</h3>
                <p className="gpu_usage_card_value">{nvlinkLast}</p>
                <div className="gpu_usage_card_chart">
                  {nvlinkData?.length > 0 &&
                    nvlinkData.map((item, idx) => {
                      const config = getAreaChartOps({
                        type: 'bandwidth',
                        legend: ['Gpu'],
                        unitType: 'bandwidthBytes',
                        data: [item] || [],
                      })
                      return (
                        <div key={idx}>
                          <TinyArea
                            {...config}
                            bgColor="transparent"
                            width={180}
                            height={100}
                            pointCount={8}
                          />
                        </div>
                      )
                    })}
                  {/* <img src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png" /> */}
                </div>
              </div>

              <div className="gpu_usage_card gpu_usage_network">
                <h3 className="gpu_usage_card_title">Infiniband (Total)</h3>
                <div className="gpu_network_section">
                  <section className="network_section">
                    <p>
                      <span className="badge">TX</span>
                      <span className="value">95GB/s</span>
                    </p>
                    <div className="network_chart">
                      <img src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png" />
                    </div>
                  </section>
                  <section className="network_section">
                    <p>
                      <span className="badge">RX</span>
                      <span className="value">90GB/s</span>
                    </p>
                    <div className="network_chart">
                      <img src="/assets/resources/images/dummy/img-dummy-chart-dash-gpuusage.png" />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GpuUsageStatus
