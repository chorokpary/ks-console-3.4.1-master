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

  const [inboundData, setInboundData] = useState(0)
  const [outboundData, setOutboundData] = useState(0)
  const [nvlinkData, setNvlinkData] = useState(0)

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

  const convertTB = bytes => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) {
      return 0
    }
    const tb = bytes / 1024 ** 4
    return tb !== 0 ? parseFloat(tb.toFixed(1)) : 0
  }

  const getData = async () => {
    setPanelLoading(true)
    var currentTime = Math.floor(Date.now() / 1000)
    const paramsData = {
      // start: currentTime - 30000,
      start: currentTime,
      end: currentTime,
      cluster: props.cluster,
    }

    const vmList =
      selectedGpuCluster?.instances?.map(item => item.vmName).join('|') || ''
    //const vmList = 'gpu-wbl-aicm|gpu-wbl-petasus'

    const tempData = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_GPU_TEMP{pod=~"${vmList}"})`,
      // start: currentTime - 30000,
      // end: currentTime,
      // cluster: props.cluster,
    })
    const avgTemp = tempData[0]?.value?.[1]
      ? Math.floor(parseFloat(tempData[0].value[1]))
      : 0
    setTemp(avgTemp)

    const gpuAvgUsageData = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_GPU_UTIL{pod=~"${vmList}"})`,
      start: currentTime - 30000,
      end: currentTime,
      cluster: props.cluster,
      step: '50m',
      times: 10,
    })
    handleGpuAvgUsage(gpuAvgUsageData)

    const avgValue = gpuAvgUsageData[0]?.values?.[0]?.[1]
      ? getSuitableValue(gpuAvgUsageData[0].values[0][1])
      : 0
    setUsage(avgValue)

    const gpuAvgMemoryUsage = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_FB_USED{pod=~"${vmList}"})`,
      ...paramsData,
    })
    const avgMemory = gpuAvgMemoryUsage[0]?.values?.[0]?.[1]
      ? parseFloat(gpuAvgMemoryUsage[0].values[0][1])
      : 0
    // setMemoryUsage(getSuitableValue(avgMemory, 'disk'))
    setMemoryUsage(convertTB(avgMemory))

    const gpuAvgMemoryTotalUsage = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_FB_USED{pod=~"${vmList}"} + DCGM_FI_DEV_FB_FREE{pod=~"${vmList}"})`,
      ...paramsData,
    })
    const avgTotalMemory = gpuAvgMemoryTotalUsage[0]?.values?.[0]?.[1]
      ? parseFloat(gpuAvgMemoryTotalUsage[0].values[0][1])
      : 0
    // setMemoryTotalUsage(getSuitableValue(avgTotalMemory, 'disk'))
    setMemoryTotalUsage(convertTB(avgTotalMemory))

    const inboundLinuxDataExpr = `rate(node_infiniband_port_data_received_bytes_total{job="launcher-node-exporter", pod=~"${vmList}", namespace="${props.cluster}"}[5m]) * 8`
    const gpuInboundData = await customStore.fetchMetric({
      expr: inboundLinuxDataExpr,
      ...paramsData,
      namespace: selectedGpuCluster.namespace,
    })
    setInboundData(
      gpuInboundData?.[gpuInboundData?.length - 1]?.values?.[0][1] || 0
    )

    const outboundLinuxDataExpr = `rate(node_infiniband_port_data_transmitted_bytes_total{job="launcher-node-exporter", pod=~"${vmList}", namespace="${props.cluster}"}[5m]) * 8`
    const gpuOutboundData = await customStore.fetchMetric({
      expr: outboundLinuxDataExpr,
      ...paramsData,
      namespace: selectedGpuCluster.namespace,
    })

    setOutboundData(
      gpuOutboundData?.[gpuOutboundData?.length - 1]?.values?.[0][1] || 0
    )

    const gpuNvlinkDataExpr = `DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${props.cluster}"}`
    const gpuNvlinkData = await customStore.fetchMetric({
      expr: gpuNvlinkDataExpr,
      ...paramsData,
      namespace: selectedGpuCluster.namespace,
      step: '600s',
    })

    setNvlinkData(
      gpuNvlinkData?.[gpuNvlinkData?.length - 1]?.values?.[0][1] || 0
    )

    const gpuUtilDataExpr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${props.cluster}"} / 100`

    const gpuUtilData = await customStore.fetchMetric({
      expr: gpuUtilDataExpr,
      ...paramsData,
    })
    const gpuUtilTransform = transformDataToObject(gpuUtilData)
    setGpuUtilData(gpuUtilTransform)

    const gpumMemDataExpr = `DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${props.cluster}"} / (DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${props.cluster}"} + DCGM_FI_DEV_FB_FREE{job="launcher-dcgm-exporter", pod=~"${vmList}", namespace="${props.cluster}"})`

    const gpuMemData = await customStore.fetchMetric({
      expr: gpumMemDataExpr,
      ...paramsData,
    })
    const gpuMemTransform = transformDataToObject(gpuMemData)
    setGpuMemData(gpuMemTransform)

    setPanelLoading(false)
  }

  function toggleDropdown() {
    const dropdown = document.getElementById('dropdown')
    dropdown.classList.toggle('hidden')
  }

  function transformDataToObject(data) {
    const result = {}

    data.forEach(item => {
      const host = item.metric.Hostname
      const gpu = item.metric.gpu
      const values = item.values
      const lastValue = values.length > 0 ? values[values.length - 1][1] : null

      if (!result[host]) {
        result[host] = {}
      }

      result[host][gpu] = Number(lastValue)
    })

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
                              <span className="status_value">{gpuTotal}</span>
                            </div>
                            <div className="status_item">
                              <p className="status_label">GPU 평균 사용률</p>
                              <span className="status_value">{usage}%</span>
                            </div>
                            <div className="status_item">
                              <p className="status_label">GPU 메모리 사용량</p>
                              <span className="status_value">
                                {memoryUsage}/{memoryTotalUsage}{' '}
                                <span className="unit">TB</span>
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
                        <div className="zoomin_icon">
                          <button id="zoomIn" className="btn_zoom_icon">
                            <i className="ico-plus"></i>
                          </button>
                          <button id="zoomOut" className="btn_zoom_icon">
                            <i className="ico-minus"></i>
                          </button>
                          <button id="resetZoom" className="btn_zoom_icon">
                            <i className="ico-reset"></i>
                          </button>
                        </div>
                        <div className="gpu_group">
                          <Loading spinning={panelLoading}>
                            <div className="gpu_card_group">
                              {selectedGpuCluster?.instances &&
                                selectedGpuCluster.instances.length > 0 &&
                                selectedGpuCluster.instances.map(
                                  (instance, index) => (
                                    <div className="gpu_card" key={index}>
                                      <div className="gpu_card_header">
                                        <div className="gpu_card_title">
                                          {instance.vmName}
                                        </div>
                                        <div className="gpu_card_status_dot normal"></div>
                                      </div>
                                      <GpuBoxValues
                                        gpuUtilData={gpuUtilData}
                                        gpuMemData={gpuMemData}
                                        vmName={instance.vmName}
                                      />
                                      <div className="gpu_card_metrics">
                                        <div className="gpu_card_metric">
                                          <div className="gpu_card_metric_label">
                                            GPU Avg
                                          </div>
                                          <div className="gpu_card_metric_value">
                                            {gpuUtilData[instance.vmName] &&
                                              Object.values(
                                                gpuUtilData[instance.vmName]
                                              ).reduce((acc, v) => acc + v, 0)}
                                            %
                                          </div>
                                        </div>
                                        <div className="gpu_card_metric">
                                          <div className="gpu_card_metric_label">
                                            GPU Mem
                                          </div>
                                          <div className="gpu_card_metric_value">
                                            {gpuMemData[instance.vmName] &&
                                              Object.values(
                                                gpuMemData[instance.vmName]
                                              ).reduce((acc, v) => acc + v, 0)}
                                            %
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                            </div>
                          </Loading>
                        </div>
                        {/* <div className="gpu_group">
                          <div className="gpu_card_group">
                            <div className="gpu_card">
                              <div className="gpu_card_header">
                                <div className="gpu_card_title">Node-01</div>
                                <div className="gpu_card_status_dot normal"></div>
                              </div>

                              <section className="gpu_card_gpu_list">
                                <div className="gpu_box normal">
                                  <div className="gpu_box_index">1</div>
                                  <div className="tooltip_box">
                                    <div className="gpu_card_title">GPU1</div>
                                    <div className="gpu_card_metrics">
                                      <div className="gpu_card_metric">
                                        <div className="gpu_card_metric_label">
                                          GPU Avg
                                        </div>
                                        <div className="gpu_card_metric_value">
                                          46.9%
                                        </div>
                                      </div>
                                      <div className="gpu_card_metric">
                                        <div className="gpu_card_metric_label">
                                          GPU Mem
                                        </div>
                                        <div className="gpu_card_metric_value">
                                          46.9%
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="gpu_box normal">
                                  <div className="gpu_box_index">2</div>
                                  <div className="tooltip_box">
                                    <div className="gpu_card_title">GPU2</div>
                                    <div className="gpu_card_metrics">
                                      <div className="gpu_card_metric">
                                        <div className="gpu_card_metric_label">
                                          GPU Avg
                                        </div>
                                        <div className="gpu_card_metric_value">
                                          46.9%
                                        </div>
                                      </div>
                                      <div className="gpu_card_metric">
                                        <div className="gpu_card_metric_label">
                                          GPU Mem
                                        </div>
                                        <div className="gpu_card_metric_value">
                                          46.9%
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="gpu_box normal">
                                  <div className="gpu_box_index">3</div>
                                </div>
                                <div className="gpu_box normal">
                                  <div className="gpu_box_index">4</div>
                                </div>
                                <div className="gpu_box unknown">
                                  <div className="gpu_box_index">5</div>
                                </div>
                                <div className="gpu_box normal">
                                  <div className="gpu_box_index">6</div>
                                </div>
                                <div className="gpu_box critical">
                                  <div className="gpu_box_index">7</div>
                                </div>
                                <div className="gpu_box minor">
                                  <div className="gpu_box_index">8</div>
                                </div>
                              </section>

                              <div className="gpu_card_metrics">
                                <div className="gpu_card_metric">
                                  <div className="gpu_card_metric_label">
                                    GPU Avg
                                  </div>
                                  <div className="gpu_card_metric_value">
                                    46.9%
                                  </div>
                                </div>
                                <div className="gpu_card_metric">
                                  <div className="gpu_card_metric_label">
                                    GPU Mem
                                  </div>
                                  <div className="gpu_card_metric_value">
                                    46.9%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div> */}
                        <div className="gpu_panel">
                          <div className="gpu_top">
                            <div className="gpu_title">GPU 현황</div>
                            <div className="gpu_status">
                              <div className="gpu_summary">
                                <span className="gpu_summary_main">
                                  {vmTotal}
                                </span>
                                <span>/</span>
                                <span className="gpu_summary_total">
                                  {' '}
                                  {vmTotal}
                                </span>
                              </div>
                              <div className="gpu_legend">
                                <div className="gpu_legend_values">
                                  <div>0</div>
                                  <div>0</div>
                                  <div>{vmTotal}</div>
                                  <div>0</div>
                                </div>
                                <div className="gpu_legend_dots">
                                  <div className="dot critical"></div>
                                  <div className="dot minor"></div>
                                  <div className="dot normal"></div>
                                  <div className="dot unknown"></div>
                                </div>
                                <div className="gpu_legend_labels">
                                  <div>Critical</div>
                                  <div>Minor</div>
                                  <div>Normal</div>
                                  <div>Unknown</div>
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

const GpuBoxValues = ({ gpuUtilData, gpuMemData, vmName }) => {
  const index = [1, 2, 3, 4, 5, 6, 7, 8]
  return (
    <section className="gpu_card_gpu_list">
      {index.map(el => (
        <div className="gpu_box normal" key={el}>
          <div className="gpu_box_index">{el}</div>
          <div className="tooltip_box">
            <div className="gpu_card_title">GPU{el}</div>
            <div className="gpu_card_metrics">
              <div className="gpu_card_metric">
                <div className="gpu_card_metric_label">GPU Avg</div>
                <div className="gpu_card_metric_value">
                  {gpuUtilData && gpuUtilData?.[vmName]?.['2']}%
                </div>
              </div>
              <div className="gpu_card_metric">
                <div className="gpu_card_metric_label">GPU Mem</div>
                <div className="gpu_card_metric_value">
                  {gpuMemData && gpuMemData?.[vmName]?.['2']}%
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default GpuCluster
