import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import GpuClusterStore from 'stores/resources/gpuclusters'
import TinyArea from 'projects/containers/Overview/ResourceUsage/TinyArea'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'
import CustomStore from 'stores/monitoring/custom/monitor'
import { get, set } from 'lodash'
import {
  getSuitableValue,
  getSuitableUnit,
  getValueByUnit,
  getAreaChartOps,
} from 'utils/monitoring'

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

const GpuCluster = ({
  monitorStore,
  x,
  y,
  w,
  h,
  activeDashboard,
  ...props
}) => {
  const gpuClusterStore = new GpuClusterStore()
  const customStore = new CustomStore()

  const fetchData = async () => {
    return await gpuClusterStore.fetchList({ limit: 1000, ...props })
  }
  const [gpuClusterList, error, loading] = cleanupTrigger(fetchData, [])

  const [panelLoading, setPanelLoading] = useState(false)

  const [selectedGpuCluster, setSelectedGpuCluster] = useState()
  const [gpuCluster, setGpuCluster] = useState('')
  const [vmTotal, setVmTotal] = useState(0)
  const [gpuTotal, setGpuTotal] = useState(0)
  const [temp, setTemp] = useState()
  const [gpuAvgUsage, setGpuAvgUsage] = useState()
  const [usage, setUsage] = useState()
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [memoryTotalUsage, setMemoryTotalUsage] = useState(0)

  const [gpuUtilData, setGpuUtilData] = useState({})
  const [gpuMemData, setGpuMemData] = useState({})
  const [gpuXidData, setGpuXidData] = useState({})

  const [inboundData, setInboundData] = useState(0)
  const [outboundData, setOutboundData] = useState(0)
  const [nvlinkData, setNvlinkData] = useState(0)

  const [criticalCount, setCriticalCount] = useState(0)
  const [minorCount, setMinorCount] = useState(0)
  const [normalCount, setNormalCount] = useState(0)
  const [unknownCount, setUnknownCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (gpuClusterList.length > 0) {
      const activeDashboardName = localStorage.getItem('activeDashboardName')
      const selectedGpuClusterObj = JSON.parse(
        localStorage.getItem('selectedGpuCluster')
      )
      const selectedGpuClusterName =
        selectedGpuClusterObj?.[activeDashboardName]
      if (selectedGpuClusterName) {
        setSelectedGpuCluster(
          gpuClusterList.find(item => item.name === selectedGpuClusterName)
        )
      } else {
        setSelectedGpuCluster(gpuClusterList[0])
      }
    }
  }, [gpuClusterList, activeDashboard])

  useEffect(() => {
    if (gpuClusterList.length > 0) {
      setGpuCluster(selectedGpuCluster.name)
      setVmTotal(selectedGpuCluster.instances?.length || 0)
      setGpuTotal(
        selectedGpuCluster.instances?.filter(
          instance => instance.vmType === 'gpu'
        ).length || 0
      )
    }
  }, [selectedGpuCluster])

  useEffect(() => {
    // 모든 상태가 세팅된 후 getData() 호출
    if (gpuCluster && vmTotal !== null && gpuTotal !== null) {
      getData()
    }
  }, [gpuCluster, vmTotal, gpuTotal])

  const getData = async () => {
    setPanelLoading(true)
    var currentTime = Math.floor(Date.now() / 1000)
    const paramsData = {
      // start: currentTime - 30000,
      start: currentTime,
      end: currentTime,
      cluster: selectedGpuCluster?.namespace,
    }

    const vmList =
      selectedGpuCluster?.instances?.map(item => item.vmName).join('|') || ''
    //const vmList = 'gpu-wbl-aicm|gpu-wbl-petasus'

    const tempData = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_GPU_TEMP{pod=~"${vmList}"})`,
      // start: currentTime - 30000,
      // end: currentTime,
      // cluster: selectedGpuCluster?.namespace,
    })
    const avgTemp = tempData[0]?.value?.[1]
      ? Math.floor(parseFloat(tempData[0].value[1]))
      : 0
    setTemp(avgTemp)

    const gpuAvgUsageData = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_GPU_UTIL{pod=~"${vmList}"})`,
      start: currentTime - 30000,
      end: currentTime,
      cluster: selectedGpuCluster?.namespace,
      step: '50m',
      times: 10,
    })
    handleGpuAvgUsage(gpuAvgUsageData)
    const avgValue = gpuAvgUsageData[0]?.values?.[
      gpuAvgUsageData.length - 1
    ]?.[1]
      ? parseFloat(
          gpuAvgUsageData[0].values[gpuAvgUsageData[0].values.length - 1][1]
        ).toFixed(1)
      : 0
    setUsage(avgValue)

    const gpuAvgMemoryUsage = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_FB_USED{pod=~"${vmList}"})`,
      ...paramsData,
    })
    const avgMemory = gpuAvgMemoryUsage[0]?.values?.[
      gpuAvgMemoryUsage[0]?.values.length - 1
    ]?.[1]
      ? parseFloat(
          gpuAvgMemoryUsage[0].values[
            gpuAvgMemoryUsage[0]?.values.length - 1
          ][1]
        )
      : 0
    // setMemoryUsage(getSuitableValue(avgMemory, 'disk'))
    setMemoryUsage(((avgMemory * 8 * vmTotal) / 1024).toFixed(1))

    const gpuAvgMemoryTotalUsage = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_FB_USED{pod=~"${vmList}"} + DCGM_FI_DEV_FB_FREE{pod=~"${vmList}"})`,
      ...paramsData,
    })
    const avgTotalMemory = gpuAvgMemoryTotalUsage[0]?.values?.[
      gpuAvgMemoryTotalUsage[0]?.values.length - 1
    ]?.[1]
      ? parseFloat(
          gpuAvgMemoryTotalUsage[0].values[
            gpuAvgMemoryTotalUsage[0]?.values.length - 1
          ][1]
        )
      : 0
    // setMemoryTotalUsage(getSuitableValue(avgTotalMemory, 'disk'))
    setMemoryTotalUsage(((avgTotalMemory * 8 * vmTotal) / 1024).toFixed(1))

    const inboundLinuxDataExpr = `rate(node_infiniband_port_data_received_bytes_total{job="launcher-node-exporter", pod=~"${vmList}", namespace="${selectedGpuCluster?.namespace}"}[5m]) * 8`
    const gpuInboundData = await customStore.fetchMetric({
      expr: inboundLinuxDataExpr,
      ...paramsData,
      namespace: selectedGpuCluster?.namespace,
    })
    setInboundData(
      gpuInboundData?.[gpuInboundData?.length - 1]?.values?.[0][1] || 0
    )

    const outboundLinuxDataExpr = `rate(node_infiniband_port_data_transmitted_bytes_total{job="launcher-node-exporter", pod=~"${vmList}", namespace="${selectedGpuCluster?.namespace}"}[5m]) * 8`
    const gpuOutboundData = await customStore.fetchMetric({
      expr: outboundLinuxDataExpr,
      ...paramsData,
      namespace: selectedGpuCluster?.namespace,
    })

    setOutboundData(
      gpuOutboundData?.[gpuOutboundData?.length - 1]?.values?.[0][1] || 0
    )

    const gpuNvlinkDataExpr = `DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${selectedGpuCluster?.namespace}"}`
    const gpuNvlinkData = await customStore.fetchMetric({
      expr: gpuNvlinkDataExpr,
      ...paramsData,
      namespace: selectedGpuCluster?.namespace,
      step: '600s',
    })

    setNvlinkData(
      gpuNvlinkData?.[gpuNvlinkData?.length - 1]?.values?.[0][1] || 0
    )

    const gpuUtilDataExpr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${selectedGpuCluster?.namespace}"}`

    const gpuUtilData = await customStore.fetchMetric({
      expr: gpuUtilDataExpr,
      ...paramsData,
    })
    const gpuUtilTransform = transformDataToObject(gpuUtilData)
    setGpuUtilData(gpuUtilTransform)

    const gpuMemDataExpr = `DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${selectedGpuCluster?.namespace}"} / (DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${selectedGpuCluster?.namespace}"} + DCGM_FI_DEV_FB_FREE{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${selectedGpuCluster?.namespace}"}) * 100`

    const gpuMemData = await customStore.fetchMetric({
      expr: gpuMemDataExpr,
      ...paramsData,
    })
    const gpuMemTransform = transformDataToObject(gpuMemData)
    setGpuMemData(gpuMemTransform)

    const gpuXidExpr = `DCGM_FI_DEV_XID_ERRORS{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${selectedGpuCluster?.namespace}"}`

    const gpuXidData = await customStore.fetchMetric({
      expr: gpuXidExpr,
      ...paramsData,
    })
    const gpuXidTransform = transformXidDataToObject(gpuXidData)
    setGpuXidData(gpuXidTransform)

    setPanelLoading(false)
  }

  function toggleDropdown() {
    const dropdown = document.getElementById('dropdown')
    dropdown.classList.toggle('hidden')
  }

  const transformDataToObject = data => {
    const result = {}

    data.forEach(item => {
      const host = item.metric.Hostname
      const gpu = item.metric.gpu
      const values = item.values
      const lastValue = values.length > 0 ? values[values.length - 1][1] : 0

      if (!result[host]) {
        result[host] = {}
      }

      let formattedValue = 0
      if (lastValue && Number(lastValue) !== 0) {
        formattedValue = Number(lastValue).toFixed(2) // 소수점 둘째자리까지
      }

      result[host][gpu] = formattedValue
    })

    return result
  }

  const transformXidDataToObject = data => {
    const result = {}
    let criticalCount = 0
    let minorCount = 0
    let normalCount = 0
    let unknownCount = 0

    data.forEach(item => {
      const host = item.metric.Hostname
      const gpu = item.metric.gpu
      const errCode = item.metric.err_code
      let errValue = 'unknown'
      if (
        errCode == '31' ||
        errCode == '32' ||
        errCode == '43' ||
        errCode == '45' ||
        errCode == '48' ||
        errCode == '56' ||
        errCode == '61' ||
        errCode == '79' ||
        errCode == '89'
      ) {
        errValue = 'critical'
        criticalCount++
      } else if (
        errCode == '1' ||
        errCode == '4' ||
        errCode == '5' ||
        errCode == '8' ||
        errCode == '13' ||
        errCode == '31' ||
        errCode == '47' ||
        errCode == '74'
      ) {
        errValue = 'minor'
        minorCount++
      } else if (errCode == '0') {
        errValue = 'normal'
        normalCount++
      } else {
        unknownCount++
      }

      if (!result[host]) {
        result[host] = {}
      }

      result[host][gpu] = errValue
    })

    setCriticalCount(criticalCount)
    setMinorCount(minorCount)
    setNormalCount(normalCount)
    setUnknownCount(unknownCount)
    setTotalCount(vmTotal * 8)

    return result
  }

  const handleGpuAvgUsage = gpuAvgUsage => {
    const data = get(
      getAreaChartOps({
        type: 'avg',
        title: 'AVG',
        legend: ['Gpu'],
        unit: '',
        data: [gpuAvgUsage?.[0]] || [],
      }),
      'data'
    )
    setGpuAvgUsage({ data: data })
  }

  const handleSelectGpuCluster = item => {
    const activeDashboardName = localStorage.getItem('activeDashboardName')

    const prev = JSON.parse(localStorage.getItem('selectedGpuCluster') || '{}')

    const next = {
      ...prev,
      [activeDashboardName]: item.name,
    }

    localStorage.setItem('selectedGpuCluster', JSON.stringify(next))
  }

  const getState = state => {
    if (
      state === 'Provisioning' ||
      state === 'Starting' ||
      state === 'Stopping' ||
      state === 'Terminating' ||
      state === 'Migrating' ||
      state === 'WaitingForVolumeBinding'
    ) {
      return 'minor'
    }
    if (state === 'Running') {
      return 'normal'
    }
    if (state === 'Stopped' || state === 'Paused') {
      return 'unknown'
    }

    return 'critical'
  }

  return (
    <>
      <div
        className="grid-stack-item"
        gs-x={x}
        gs-y={y}
        gs-w={w}
        gs-h={h}
        id="gpuClusterPanel"
      >
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title">
              <label>{t('RESOURCES_GPU_CLUSTER')}</label>
            </div>
            <Loading spinning={loading}>
              <div className="spin-nested-loading">
                <div className="spin-container">
                  <div className="grid_info style_groupnode">
                    <div className="box_gpucluster">
                      <div className="card_wrapper">
                        <div className="card_header">
                          <div
                            className="select_cluster"
                            onClick={toggleDropdown}
                          >
                            <div className="icon_vgpu">
                              <i className="ico-type-gpucluster"></i>
                              <p className="cluster_name">{gpuCluster}</p>
                            </div>

                            <div className="dropdown_icon"></div>

                            <ul id="dropdown" className="dropdown hidden">
                              {gpuClusterList.map((item, idx) => (
                                <li
                                  className="dropdown_option"
                                  key={idx}
                                  onClick={() => {
                                    setSelectedGpuCluster(item)
                                    handleSelectGpuCluster(item)
                                  }}
                                >
                                  <div className="icon_vgpu">
                                    <i className="ico-type-gpucluster"></i>
                                    <p className="cluster_name">{item.name}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="status_group">
                            <div className="status_item">
                              <p className="status_label">가상머신</p>
                              <span className="status_value">{vmTotal}</span>
                            </div>
                            <div className="status_item">
                              <p className="status_label">총 GPU</p>
                              <span className="status_value">
                                {gpuTotal * 8}
                              </span>
                            </div>
                            <div className="status_item">
                              <p className="status_label">GPU 평균 사용률</p>
                              <span className="status_value">{usage}%</span>
                            </div>
                            <div className="status_item">
                              <p className="status_label">GPU 메모리 사용량</p>
                              <span className="status_value">
                                {memoryUsage}/{memoryTotalUsage}
                                <span className="unit">GiB</span>
                              </span>
                            </div>
                            <div className="status_item">
                              <p className="status_label">평균 온도</p>
                              <span className="status_value">
                                {temp}
                                <span className="unit">°C</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <section className="flex_row">
                        <div className="gpu_group">
                          <TransformWrapper
                            initialScale={1}
                            initialPositionX={10}
                            initialPositionY={10}
                            minScale={0.5}
                            maxScale={3}
                            onTransformed={ctx => setScale(ctx.state.scale)}
                          >
                            {({ zoomIn, zoomOut, resetTransform }) => (
                              <>
                                <Controls
                                  zoomIn={zoomIn}
                                  zoomOut={zoomOut}
                                  resetTransform={resetTransform}
                                />
                                <TransformComponent
                                  onTransformChange={transform =>
                                    console.log('Transform changed:', transform)
                                  }
                                  wrapperStyle={{
                                    width: '1000px',
                                    height: '390px',
                                  }}
                                >
                                  <Loading spinning={panelLoading}>
                                    <div className="gpu_card_group">
                                      {selectedGpuCluster?.instances &&
                                        selectedGpuCluster.instances.length >
                                          0 &&
                                        [...selectedGpuCluster.instances]
                                          .sort((a, b) =>
                                            a.vmName.localeCompare(b.vmName)
                                          )
                                          .map((instance, index) => (
                                            <div
                                              className="gpu_card"
                                              key={index}
                                            >
                                              <div className="gpu_card_header">
                                                <div className="gpu_card_title">
                                                  {instance.vmName}
                                                </div>
                                                <div
                                                  className={`gpu_card_status_dot ${getState(
                                                    instance.vmPhase
                                                  )}`}
                                                ></div>
                                              </div>
                                              <GpuBoxValues
                                                gpuUtilData={gpuUtilData}
                                                gpuMemData={gpuMemData}
                                                gpuXidData={gpuXidData}
                                                vmName={instance.vmName}
                                              />
                                              {scale >= 1 && (
                                                <div className="gpu_card_metrics">
                                                  <div className="gpu_card_metric">
                                                    <div className="gpu_card_metric_label">
                                                      GPU Avg
                                                    </div>
                                                    <div className="gpu_card_metric_value">
                                                      {gpuUtilData[
                                                        instance.vmName
                                                      ] &&
                                                        (
                                                          Number(
                                                            Object.values(
                                                              gpuUtilData[
                                                                instance.vmName
                                                              ]
                                                            ).reduce(
                                                              (acc, v) =>
                                                                acc + Number(v),
                                                              0
                                                            )
                                                          ) / 8
                                                        ).toFixed(2)}
                                                      %
                                                    </div>
                                                  </div>
                                                  <div className="gpu_card_metric">
                                                    <div className="gpu_card_metric_label">
                                                      GPU Mem
                                                    </div>
                                                    <div className="gpu_card_metric_value">
                                                      {gpuMemData[
                                                        instance.vmName
                                                      ] &&
                                                        (
                                                          Number(
                                                            Object.values(
                                                              gpuMemData[
                                                                instance.vmName
                                                              ]
                                                            ).reduce(
                                                              (acc, v) =>
                                                                acc + Number(v),
                                                              0
                                                            )
                                                          ) / 8
                                                        ).toFixed(2)}
                                                      %
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                    </div>
                                  </Loading>
                                </TransformComponent>
                              </>
                            )}
                          </TransformWrapper>
                        </div>
                        <div className="gpu_panel">
                          <div className="gpu_top">
                            <div className="gpu_title">GPU 현황</div>
                            <div className="gpu_status">
                              <div className="gpu_summary">
                                <span className="gpu_summary_main">
                                  {normalCount}
                                </span>
                                <span>/</span>
                                <span className="gpu_summary_total">
                                  {totalCount}
                                </span>
                              </div>
                              <div className="gpu_legend">
                                <div className="gpu_legend_values">
                                  <div>{criticalCount}</div>
                                  <div>{minorCount}</div>
                                  <div>{normalCount}</div>
                                  <div>{unknownCount}</div>
                                </div>
                                <div className="gpu_legend_dots">
                                  <div className="dot critical"></div>
                                  <div className="dot minor"></div>
                                  <div className="dot normal"></div>
                                  <div className="dot unknown"></div>
                                </div>
                                <div className="gpu_legend_labels">
                                  <div>
                                    {t('RESOURCES_GPUCLUSTER_CRITICAL')}
                                  </div>
                                  <div>{t('RESOURCES_GPUCLUSTER_MINOR')}</div>
                                  <div>{t('RESOURCES_GPUCLUSTER_NORMAL')}</div>
                                  <div>{t('RESOURCES_GPUCLUSTER_UNKNOWN')}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="gpu_chart">
                            <div className="chart_section">
                              <div className="chart_title">GPU 사용률 추이</div>
                              <div className="chart_values">
                                <div className="chart_total">
                                  <span>{usage}%</span>
                                  {/* <span>/</span>
                                  <span>6.4 TB</span> */}
                                  <span></span>
                                  <span></span>
                                </div>
                                {/* <div className="chart_percent">52%</div> */}
                              </div>
                              <div className="chart_gpu_trend">
                                {gpuAvgUsage?.data?.length > 0 && (
                                  <TinyArea
                                    {...gpuAvgUsage}
                                    bgColor="transparent"
                                    width={256}
                                    height={32}
                                  />
                                )}
                              </div>
                            </div>

                            <div className="chart_section">
                              <div className="chart_title">NVLink (Total)</div>
                              <NVLinkValues nvlinkData={nvlinkData} />
                            </div>

                            <div className="chart_section">
                              <div className="chart_title">Infiniband</div>
                              <InfinibandValues
                                inboundData={inboundData}
                                outboundData={outboundData}
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </Loading>
          </div>
        </div>
      </div>
    </>
  )
}

const NVLinkValues = ({ nvlinkData }) => {
  const nvlinkDataUnit = getSuitableUnit(nvlinkData, 'bandwidthBytes')
  const nvlinkDataValue = getValueByUnit(nvlinkData, nvlinkDataUnit)

  return (
    <div className="chart_values">
      <div className="chart_total">
        <span>{nvlinkDataValue} </span>
        <span>{nvlinkDataUnit}</span>
      </div>
    </div>
  )
}

const InfinibandValues = ({ inboundData, outboundData }) => {
  const inboundUnit = getSuitableUnit(inboundData, 'bandwidth')
  const inboundValue = getValueByUnit(inboundData, inboundUnit)
  const outboundUnit = getSuitableUnit(outboundData, 'bandwidth')
  const outboundValue = getValueByUnit(outboundData, outboundUnit)

  return (
    <div className="chart_values">
      <div className="chart_total">
        <span className="title">TX </span>
        <span className="lg">{inboundValue}</span>
        <span>{inboundUnit}</span>
      </div>
      <div className="chart_total">
        <span className="title"> RX </span>
        <span className="lg">{outboundValue}</span>
        <span>{outboundUnit}</span>
      </div>
    </div>
  )
}

const GpuBoxValues = ({ gpuUtilData, gpuMemData, gpuXidData, vmName }) => {
  const index = [0, 1, 2, 3, 4, 5, 6, 7]
  return (
    <section className="gpu_card_gpu_list">
      {index.map(el => (
        <div
          className={`gpu_box ${gpuXidData?.[vmName]?.[el] || 'unknown'}`}
          key={el}
        >
          <div className="gpu_box_index">{el + 1}</div>
          <div className="tooltip_box">
            <div className="gpu_card_title">GPU{el + 1}</div>
            <div className="gpu_card_metrics">
              <div className="gpu_card_metric">
                <div className="gpu_card_metric_label">GPU Avg</div>
                <div className="gpu_card_metric_value">
                  {(gpuUtilData && gpuUtilData?.[vmName]?.[el]) || 0}%
                </div>
              </div>
              <div className="gpu_card_metric">
                <div className="gpu_card_metric_label">GPU Mem</div>
                <div className="gpu_card_metric_value">
                  {(gpuMemData && gpuMemData?.[vmName]?.[el]) || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

const Controls = ({ zoomIn, zoomOut, resetTransform }) => (
  <>
    <div className="zoomin_icon">
      <button id="zoomIn" className="btn_zoom_icon" onClick={() => zoomIn()}>
        <i className="ico-plus"></i>
      </button>
      <button id="zoomOut" className="btn_zoom_icon" onClick={() => zoomOut()}>
        <i className="ico-minus"></i>
      </button>
      <button
        id="resetZoom"
        className="btn_zoom_icon"
        onClick={() => resetTransform()}
      >
        <i className="ico-reset"></i>
      </button>
      <div id="result"></div>
    </div>
  </>
)

export default GpuCluster
