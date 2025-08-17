import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import GpuClusterStore from 'stores/resources/gpuclusters'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'
import CustomStore from 'stores/monitoring/custom/monitor'

const GpuCluster = ({ monitorStore, x, y, w, h, ...props }) => {
  const gpuClusterStore = new GpuClusterStore()
  const customStore = new CustomStore()

  const fetchData = async () => {
    return await gpuClusterStore.fetchList({ limit: 1000, ...props })
  }
  const [gpuClusterList, error, loading] = cleanupTrigger(fetchData, [])

  const [selectedGpuCluster, setSelectedGpuCluster] = useState()
  const [gpuCluster, setGpuCluster] = useState('')
  const [vmTotal, setVmTotal] = useState(0)
  const [gpuTotal, setGpuTotal] = useState(0) 
  const [temp, setTemp] = useState()
  const [usage, setUsage] = useState()
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [memoryTotalUsage, setMemoryTotalUsage] = useState(0)

  const [originData, setOriginData] = useState()

  useEffect(() => {
    if (gpuClusterList.length > 0) {

      setSelectedGpuCluster(gpuClusterList[0])

      setOriginData(gpuClusterList)
    }
  }, [gpuClusterList])

  useEffect(() => {
    if (gpuClusterList.length > 0) {
      setGpuCluster(selectedGpuCluster.name)
      setVmTotal(selectedGpuCluster.instances?.length || 0)
      setGpuTotal(selectedGpuCluster.instances?.filter(instance => instance.vmType === "gpu").length || 0)
    }
  }, [selectedGpuCluster])

  useEffect(() => {
    // 모든 상태가 세팅된 후 getData() 호출
    if (gpuCluster && vmTotal !== null && gpuTotal !== null) {
      getData()
    }
  }, [gpuCluster, vmTotal, gpuTotal])

  const convertTB = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) {      
      return 0;
    }  
    const tb = bytes / (1024 ** 4);
    return tb !== 0 ? parseFloat(tb.toFixed(1)) : 0;
  };

  const getData = async () => {
    const vmList = selectedGpuCluster?.instances?.map(item => item.vmName).join('|') || ''
    //const vmList = 'gpu-wbl-aicm|gpu-wbl-petasus'

    const step = '5m'
    const times = 100
    var currentTime = Math.floor(Date.now() / 1000)

    const tempData = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_GPU_TEMP{pod=~"${vmList}"})`,
      // start: currentTime - 30000,
      // end: currentTime,
      // cluster: props.cluster,
    })
    const avgTemp = tempData[0]?.value?.[1] ? Math.floor(parseFloat(tempData[0].value[1])) : 0;
    setTemp(avgTemp)

    const gpuAvgUsage = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_GPU_UTIL{pod=~"${vmList}"})`,
      start: currentTime - 30000,
      end: currentTime,
      cluster: props.cluster,
    })
    const avgValue = gpuAvgUsage[0]?.values?.[0]?.[1] ? parseFloat(gpuAvgUsage[0].values[0][1]) : 0;
    setUsage(avgValue)

    const gpuAvgMemoryUsage = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_FB_USED{pod=~"${vmList}"})`,
      start: currentTime - 30000,
      end: currentTime,
      cluster: props.cluster,
    })
    const avgMemory = gpuAvgMemoryUsage[0]?.values?.[0]?.[1] ? parseFloat(gpuAvgMemoryUsage[0].values[0][1]) : 0;
    setMemoryUsage(convertTB(avgMemory))

    const gpuAvgMemoryTotalUsage = await customStore.fetchMetric({
      expr: `avg(DCGM_FI_DEV_FB_USED{pod=~"${vmList}"} + DCGM_FI_DEV_FB_FREE{pod=~"${vmList}"})`,
      start: currentTime - 30000,
      end: currentTime,
      cluster: props.cluster,
    })
    const avgTotalMemory = gpuAvgMemoryTotalUsage[0]?.values?.[0]?.[1] ? parseFloat(gpuAvgMemoryTotalUsage[0].values[0][1]) : 0;
    setMemoryTotalUsage(convertTB(avgTotalMemory))
  }

  function toggleDropdown() {
    const dropdown = document.getElementById('dropdown')
    dropdown.classList.toggle('hidden')
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
                                  onClick={() => setSelectedGpuCluster(item)}
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
                                {memoryUsage}/{memoryTotalUsage} <span className="unit">TB</span>
                              </span>
                            </div>
                            <div className="status_item">
                              <p className="status_label">평균 온도</p>
                              <span className="status_value">
                                {temp}<span className="unit">°C</span>
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
                            <div className="gpu_card">
                              <div className="gpu_card_header">
                                <div className="gpu_card_title">Node-01</div>
                                <div className="gpu_card_status_dot normal"></div>
                              </div>

                              <section className="gpu_card_gpu_list">
                                <div className="gpu_box normal">
                                  {' '}
                                  {/*주석삭제 : normal, critical, minor, unknown*/}
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
                        </div>
                        <div className="gpu_panel">
                          <div className="gpu_top">
                            <div className="gpu_title">GPU 현황</div>
                            <div className="gpu_status">
                              <div className="gpu_summary">
                                <span className="gpu_summary_main">58</span>
                                <span>/</span>
                                <span className="gpu_summary_total"> 80</span>
                              </div>
                              <div className="gpu_legend">
                                <div className="gpu_legend_values">
                                  <div>2</div>
                                  <div>10</div>
                                  <div>58</div>
                                  <div>10</div>
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
                              <div className="chart_title">GPU 사용량 추이</div>
                              <div className="chart_values">
                                <div className="chart_total">
                                  <span>3.8</span>
                                  <span>/</span>
                                  <span>6.4 TB</span>
                                </div>
                                <div className="chart_percent">52%</div>
                              </div>
                              <div
                                className="chart_gpu_trend"
                                style={{ background: 'rgba(0, 0, 255, 0.02)' }}
                              ></div>
                            </div>

                            <div className="chart_section">
                              <div className="chart_title">NVLink (Total)</div>
                              <div className="chart_values">
                                <div className="chart_total">
                                  <span>38 </span>
                                  <span>GB/s</span>
                                </div>
                              </div>
                            </div>

                            <div className="chart_section">
                              <div className="chart_title">Infiniband</div>
                              <div className="chart_values">
                                <div className="chart_total">
                                  <span className="title">TX </span>
                                  <span className="lg">95 </span>
                                  <span>GB/s</span>
                                </div>
                                <div className="chart_total">
                                  <span className="title"> RX </span>
                                  <span className="lg">92 </span>
                                  <span>GB/s</span>
                                </div>
                              </div>
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

export default GpuCluster
