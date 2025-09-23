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
  const [loading, setLoading] = useState(false)

  const [xidTimeRange, setXidTimeRange] = useState(3600)

  const [gpuAvgUsage, setGpuAvgUsage] = useState()
  const [gpuAvgUsageLast, setGpuAvgUsageLast] = useState(0)
  const [gpuAvgMemUsage, setGpuAvgMemUsage] = useState()
  const [gpuAvgMemUsageLast, setGpuAvgMemUsageLast] = useState(0)
  const [tempData, setTempData] = useState()
  const [gpuTempLast, setGpuTempLast] = useState(0)
  const [gpuPowerData, setGpuPowerData] = useState()
  const [gpuPowerLast, setGpuPowerLast] = useState(0)

  const [inboundData, setInboundData] = useState()
  const [outboundData, setOutboundData] = useState()
  const [inboundLast, setInboundLast] = useState(0)
  const [outboundLast, setOutboundLast] = useState(0)
  const [nvlinkData, setNvlinkData] = useState()
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
    setLoading(true)

    var currentTime = Math.floor(Date.now() / 1000)
    const times = 7
    const step = Math.floor(xidTimeRange / times)
    const paramsData = {
      start: currentTime - xidTimeRange,
      end: currentTime,
      step: `${step}s`, // 초 단위 step
      times: times,
    }

    const gpuAvgUsageData = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter"})/ 100`,
      ...paramsData,
    })
    setGpuAvgUsage(gpuAvgUsageData)
    const gpuAvgUsageLastData = last(gpuAvgUsageData?.[0].values)[1] * 100
    setGpuAvgUsageLast(getSuitableValue(gpuAvgUsageLastData, 'utilisation'))

    const gpuAvgMemoryUsageData = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter"}) * ${getCustomValue(
        'memory',
        'Mi'
      )}`,
      ...paramsData,
    })
    setGpuAvgMemUsage(gpuAvgMemoryUsageData)
    const gpuAvgMemoryUsageLastData = last(gpuAvgMemoryUsageData?.[0].values)[1]
    setGpuAvgMemUsageLast(getSuitableValue(gpuAvgMemoryUsageLastData, 'memory'))

    const tempData = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_GPU_TEMP{job="launcher-dcgm-exporter"})`,
      ...paramsData,
    })
    setTempData(tempData)
    const gpuTempLastData = last(tempData?.[0].values)[1]
    setGpuTempLast(getSuitableValue(gpuTempLastData, 'temperature'))

    const gpuPowerDataExpr = `avg(DCGM_FI_DEV_POWER_USAGE{job="launcher-dcgm-exporter"})`
    const gpuPowerData = await customStore.fetchMetric({
      expr: gpuPowerDataExpr,
      ...paramsData,
    })
    setGpuPowerData(gpuPowerData)
    const gpuPowerLastData = last(gpuPowerData?.[0].values)[1]
    setGpuPowerLast(getSuitableValue(gpuPowerLastData, 'power'))

    const gpuNvlinkDataExpr = `sum(DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL{job="launcher-dcgm-exporter"}) * ${getCustomValue(
      'bandwidthBytes',
      'MBps'
    )}`
    const gpuNvlinkData = await customStore.fetchMetric({
      expr: gpuNvlinkDataExpr,
      ...paramsData,
    })
    setNvlinkData(gpuNvlinkData)
    const nvlinkLastData = last(gpuNvlinkData?.[0].values)[1]
    setNvlinkLast(getSuitableValue(nvlinkLastData, 'bandwidthBytes'))

    const inboundLinuxDataExpr = `sum(rate(node_infiniband_port_data_received_bytes_total{job="launcher-node-exporter"}[5m]) * 8)`
    const gpuInboundData = await customStore.fetchMetric({
      expr: inboundLinuxDataExpr,
      ...paramsData,
    })
    setInboundData(gpuInboundData)
    const inboundLastData = last(gpuInboundData?.[0].values)[1]
    setInboundLast(getSuitableValue(inboundLastData, 'bandwidth'))

    const outboundLinuxDataExpr = `sum(rate(node_infiniband_port_data_transmitted_bytes_total{job="launcher-node-exporter"}[5m]) * 8)`
    const gpuOutboundData = await customStore.fetchMetric({
      expr: outboundLinuxDataExpr,
      ...paramsData,
    })
    setOutboundData(gpuOutboundData)
    const outboundLastData = last(gpuOutboundData?.[0].values)[1]
    setOutboundLast(getSuitableValue(outboundLastData, 'bandwidth'))

    setLoading(false)
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
        <Loading spinning={loading}>
          <div className="gpu_usage_grid">
            <div className="gpu_usage_card">
              <h3 className="gpu_usage_card_title">GPU 평균 사용률</h3>
              <p className="gpu_usage_card_value">{gpuAvgUsageLast}%</p>
              <div className="gpu_usage_card_chart">
                {gpuAvgUsage?.length > 0 &&
                  gpuAvgUsage.map((item, idx) => {
                    const config = getAreaChartOps({
                      type: 'utilisation',
                      legend: ['Gpu'],
                      unit: '%',
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
              </div>
            </div>

            <div className="gpu_usage_card">
              <h3 className="gpu_usage_card_title">GPU 메모리 사용량</h3>
              <p className="gpu_usage_card_value">{gpuAvgMemUsageLast}</p>
              <div className="gpu_usage_card_chart">
                {gpuAvgMemUsage?.length > 0 &&
                  gpuAvgMemUsage.map((item, idx) => {
                    const config = getAreaChartOps({
                      type: 'utilisation',
                      legend: ['Gpu'],
                      unit: '%',
                      unitType: 'memory',
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
              </div>
            </div>

            <div className="gpu_usage_card">
              <h3 className="gpu_usage_card_title">GPU 온도 평균</h3>
              <p className="gpu_usage_card_value">{gpuTempLast}°C</p>
              <div className="gpu_usage_card_chart">
                {tempData?.length > 0 &&
                  tempData.map((item, idx) => {
                    const config = getAreaChartOps({
                      type: 'utilisation',
                      legend: ['Gpu'],
                      unit: '°C',
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
              </div>
            </div>

            <div className="gpu_usage_card">
              <h3 className="gpu_usage_card_title">전력 사용량 (Total)</h3>
              <p className="gpu_usage_card_value">{gpuPowerLast}W</p>
              <div className="gpu_usage_card_chart">
                {gpuPowerData?.length > 0 &&
                  gpuPowerData.map((item, idx) => {
                    const config = getAreaChartOps({
                      type: 'utilisation',
                      legend: ['Gpu'],
                      unit: 'W',
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
                    <span className="value">{inboundLast}</span>
                  </p>
                  <div className="network_chart">
                    {inboundData?.length > 0 &&
                      inboundData.map((item, idx) => {
                        const config = getAreaChartOps({
                          type: 'bandwidth',
                          legend: ['Gpu'],
                          unitType: 'bandwidth',
                          data: [item] || [],
                        })
                        return (
                          <div key={idx}>
                            <TinyArea
                              {...config}
                              bgColor="transparent"
                              width={180}
                              height={50}
                              pointCount={8}
                            />
                          </div>
                        )
                      })}
                  </div>
                </section>
                <section className="network_section">
                  <p>
                    <span className="badge">RX</span>
                    <span className="value">{outboundLast}</span>
                  </p>
                  <div className="network_chart">
                    {outboundData?.length > 0 &&
                      outboundData.map((item, idx) => {
                        const config = getAreaChartOps({
                          type: 'bandwidth',
                          legend: ['Gpu'],
                          unitType: 'bandwidth',
                          data: [item] || [],
                        })
                        return (
                          <div key={idx}>
                            <TinyArea
                              {...config}
                              bgColor="transparent"
                              width={180}
                              height={50}
                              pointCount={8}
                            />
                          </div>
                        )
                      })}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </Loading>
      </div>
    </>
  )
}

export default GpuUsageStatus
