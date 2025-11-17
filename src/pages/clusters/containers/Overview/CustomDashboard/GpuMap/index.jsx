import React, { useEffect, useState, useRef } from 'react'
import { Loading, Select } from '@kube-design/components'
import CustomStore from 'stores/monitoring/custom/monitor'
import GpuNodeStore from 'stores/resources/gpunodes'
import VmStore from 'stores/resources/vms'
import Node from './Node'
import Vm from './Vm'
import Gpu from './Gpu'

const typeOption = [
  {
    value: 'node',
    label: t('RESOURCES_NODE'),
  },
  {
    value: 'vm',
    label: t('RESOURCES_VM_SHORT'),
  },
  {
    value: 'gpu',
    label: t('GPU'),
  },
]
const rangeOption = [
  {
    value: 3600,
    label: t('RESOURCES_LAST_TIME_HOUR_CUSTOM', { hour: 1 }),
  },
  {
    value: 3600 * 2,
    label: t('RESOURCES_LAST_TIME_HOUR_CUSTOM', { hour: 2 }),
  },
  {
    value: 3600 * 3,
    label: t('RESOURCES_LAST_TIME_HOUR_CUSTOM', { hour: 3 }),
  },
  {
    value: 3600 * 12,
    label: t('RESOURCES_LAST_TIME_HOUR_CUSTOM', { hour: 12 }),
  },
  {
    value: 3600 * 24,
    label: t('RESOURCES_LAST_TIME_HOUR_CUSTOM', { hour: 24 }),
  },
]
const sortOption = [
  {
    value: 'nameAsc',
    label: t('RESOURCES_NAME') + ' ↓',
  },
  {
    value: 'nameDesc',
    label: t('RESOURCES_NAME') + ' ↑',
  },
  {
    value: 'usageAsc',
    label: t('RESOURCES_USAGE') + ' ↓',
  },
  {
    value: 'usageDesc',
    label: t('RESOURCES_USAGE') + ' ↑',
  },
]

const GpuMap = ({ widgetKey, monitorStore, ...props }) => {
  const customStore = new CustomStore()
  const gpuNodeStore = new GpuNodeStore()
  const vmStore = new VmStore()

  const [loading, setLoading] = useState(false)
  const [gpuLoading, setGpuLoading] = useState(false)
  const [vmLoading, setVmLoading] = useState(false)
  const [nodeLoading, setNodeLoading] = useState(false)

  const [type, setType] = useState('node')
  const [range, setRange] = useState(3600)
  const [sort, setSort] = useState('nameAsc')
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const dropdownRef = useRef(null)
  const dropdownRefRange = useRef(null)

  const [clusterArr, setClusterArr] = useState([])
  const [popOpen, setPopOpen] = useState(false)
  const [selectCluster, setSelectCluster] = useState()
  const [vmList, setVmList] = useState([])
  const [vmResultList, setVmResultList] = useState([])
  const [nodeList, setNodeList] = useState([])

  const [dataList, setDataList] = useState([])
  const [gpuDataList, setGpuDataList] = useState([])
  const [gpuXidData, setGpuXidData] = useState({})

  const toggleLegend = () => {
    const dropdown = document.getElementById('legendDropdown')
    // toggle
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
      dropdown.style.display = 'block'
    } else {
      dropdown.style.display = 'none'
    }
  }

  // 바깥 클릭 감지
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
      if (
        dropdownRefRange.current &&
        !dropdownRefRange.current.contains(e.target)
      ) {
        dropdownRefRange.current.classList.remove('active')
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    getLandingData()
  }, [])

  const getLandingData = async () => {
    setLoading(true)

    const nodeData = await vmStore.fetchVmListNode({ limit: 1000, ...props })
    const gpuNodeData = await gpuNodeStore.fetchList({ limit: 1000, ...props })
    const gpuNodeList =
      nodeData?.nodes?.filter(item => {
        return gpuNodeData.map(i => i.name).includes(item.name)
      }) || []
    if (gpuNodeList.length > 0) getGpuNodeList(gpuNodeList, true)

    const vmData = await vmStore.fetchList({ limit: 1000, ...props })
    const vmList = vmData.filter(item => {
      return item.gpus.length > 0 && item.node
    })
    setVmList(vmList)

    setLoading(false)
  }

  useEffect(() => {
    if (vmList.length > 0) {
      getVmAvgData()
    }
  }, [vmList])

  const getVmAvgData = async () => {
    setVmLoading(true)

    var currentTime = Math.floor(Date.now() / 1000)
    const paramsData = {
      start: currentTime - range,
      end: currentTime,
    }

    const vmNameList = vmList
      .map(item => {
        return item.name
      })
      .join('|')
    const exprUtil = `(
              avg by (pod) (
                  DCGM_FI_DEV_GPU_UTIL{pod=~"${vmNameList}"}
              )
            )`
    const exprMem = `(
              avg by (pod) (DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmNameList}"} / (DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmNameList}"} + DCGM_FI_DEV_FB_FREE{job="launcher-dcgm-exporter", pod=~"${vmNameList}"}) * 100)
            )`

    const vmAvgUsageData = await customStore.fetchMetric({
      expr: exprUtil,
      paramsData,
    })
    const vmAvgMemoryUsage = await customStore.fetchMetric({
      expr: exprMem,
      paramsData,
    })

    const result = vmList.map(c => {
      const metricUtil = vmAvgUsageData.find(m => m.metric.pod === c.name)
      const metricMem = vmAvgMemoryUsage.find(m => m.metric.pod === c.name)
      return {
        group: c.name,
        value: metricUtil ? Number(Number(metricUtil.value[1]).toFixed(0)) : 0,
        valueMem: metricMem ? Number(Number(metricMem.value[1]).toFixed(0)) : 0,
        state: metricUtil
          ? c.state === 'Running'
            ? 'normal'
            : 'abnormal'
          : 'unknown',
        node: c.node,
        namespace: c.project,
      }
    })

    setVmLoading(false)
    setVmResultList(result)
  }

  const getGpuNodeList = (nodeList, isLanding) => {
    setNodeLoading(true)
    let clusterArr = []
    nodeList.map(item => {
      const clusterName = item.name
      clusterArr.push({
        clusterName,
        vmList: item.vm_list,
        namespace: item.namespace,
        state: item.state,
      })
    })
    setClusterArr(clusterArr)

    const vmList = clusterArr
      .map(item => item?.vmList?.map(obj => obj.split('/')[1]))
      .join('|')

    const getData = async () => {
      var currentTime = Math.floor(Date.now() / 1000)
      const paramsData = {
        start: currentTime,
        end: currentTime,
      }

      const nodeAvgUsageData = await customStore.fetchMetric({
        expr: `avg by (pod) (DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter",pod=~"${vmList}"})`,
        paramsData,
      })

      const nodeAvgUsageMetric = nodeAvgUsageData.map(item => {
        const pod = item.metric.pod
        let node
        clusterArr.map(c =>
          c?.vmList.map(
            obj => obj.split('/')[1] === pod && (node = c.clusterName)
          )
        )
        return { ...item, metric: { group: node } }
      })

      const nodeAvgMemData = await customStore.fetchMetric({
        expr: `avg by (pod) (DCGM_FI_DEV_FB_USED{pod=~"${vmList}", job="launcher-dcgm-exporter"}/(DCGM_FI_DEV_FB_USED{pod=~"${vmList}", job="launcher-dcgm-exporter"} + DCGM_FI_DEV_FB_FREE{pod=~"${vmList}", job="launcher-dcgm-exporter"})) * 100`,
        paramsData,
      })

      const nodeAvgMemMetric = nodeAvgMemData.map(item => {
        const pod = item.metric.pod
        let node
        clusterArr.map(c =>
          c?.vmList.map(
            obj => obj.split('/')[1] === pod && (node = c.clusterName)
          )
        )
        return { ...item, metric: { group: node } }
      })

      const result = clusterArr.map(c => {
        const metricUtil = nodeAvgUsageMetric.find(
          m => m.metric.group === c.clusterName
        )
        const metricMem = nodeAvgMemMetric.find(
          m => m.metric.group === c.clusterName
        )
        return {
          group: c.clusterName,
          value: metricUtil ? Number(metricUtil.value[1]).toFixed(0) : 0,
          valueMem: metricMem ? Number(metricMem.value[1]).toFixed(0) : 0,
          state: metricUtil ? c.state : 'unknown',
          vmList: c.vmList,
          namespace: c.namespace,
        }
      })

      setNodeLoading(false)
      setNodeList(result)
      if (isLanding) setDataList(result)
    }
    getData()
  }

  const getAreaColor = value => {
    if (value >= 80) {
      return 'gpu_state_usage4'
    } else if (value >= 60) {
      return 'gpu_state_usage3'
    } else if (value >= 30) {
      return 'gpu_state_usage2'
    } else if (value > 0) {
      return 'gpu_state_usage1'
    } else {
      return 'gpu_state_unknown'
    }
  }

  const transformXidDataToObject = (data1, data2, gpuUtil, gpuMem) => {
    const resultMap = {}

    const comparePods = new Set(
      data2.map(item => `${item.metric.pod}-${item.metric.gpu}`)
    )

    data1.forEach(item => {
      const pod = item.metric.pod
      const gpu = item.metric.gpu
      const key = `${pod}-${gpu}`
      const errCode = item.metric.err_code

      // pod 단위 결과 객체 초기화
      if (!resultMap[pod]) {
        resultMap[pod] = {}
      }

      if (comparePods.has(key) && errCode !== '0') {
        resultMap[pod][gpu] = {
          state: 'minor',
          errCode: errCode,
          errMsg: item.metric.err_msg,
          util: gpuUtil?.[pod] ? gpuUtil[pod][gpu] : 0,
          mem: gpuMem?.[pod] ? gpuMem[pod][gpu] : 0,
        }
      } else {
        if (Number(errCode) >= 0 && Number(errCode) <= 143) {
          resultMap[pod][gpu] = {
            state: 'normal',
            errCode: errCode,
            errMsg: item.metric.err_msg,
            util: gpuUtil?.[pod] ? gpuUtil[pod][gpu] : 0,
            mem: gpuMem?.[pod] ? gpuMem[pod][gpu] : 0,
          }
        } else {
          resultMap[pod][gpu] = {
            state: 'unknown',
            errCode: errCode,
            errMsg: item.metric.err_msg,
            util: gpuUtil?.[pod] ? gpuUtil[pod][gpu] : 0,
            mem: gpuMem?.[pod] ? gpuMem[pod][gpu] : 0,
          }
        }
      }
    })

    return resultMap
  }

  const getGpuListData = () => {
    setGpuLoading(true)
    var currentTime = Math.floor(Date.now() / 1000)
    const vmNameList = vmList
      .map(item => {
        return item.name
      })
      .join('|')
    const getData = async () => {
      const gpuUtilDataExpr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod=~"${vmNameList}"}`

      const gpuUtilData = await customStore.fetchMetric({
        expr: gpuUtilDataExpr,
        start: currentTime - range, // 1시간 기준 > 3600
        end: currentTime,
      })
      const gpuUtilTransform = transformDataToObject(gpuUtilData)

      const gpuMemDataExpr = `DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmNameList}"} / (DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod=~"${vmNameList}"} + DCGM_FI_DEV_FB_FREE{job="launcher-dcgm-exporter", pod=~"${vmNameList}"}) * 100`
      const gpuMemData = await customStore.fetchMetric({
        expr: gpuMemDataExpr,
        start: currentTime - range, // 1시간 기준 > 3600
        end: currentTime,
      })
      const gpuMemTransform = transformDataToObject(gpuMemData)

      // Xid Error
      const gpuXidExpr = `DCGM_FI_DEV_XID_ERRORS{job="launcher-dcgm-exporter", pod=~"${vmNameList}"}`
      const gpuXidData = await customStore.fetchMetric({
        expr: gpuXidExpr,
        // cluster: selectCluster?.namespace,
      })

      // Xid Error - 최근 10분간 변화량이 있는지 확인
      const gpuXidExprChangeExpr = `changes((max by (gpu, pod) (DCGM_FI_DEV_XID_ERRORS{job="launcher-dcgm-exporter", pod=~"${vmNameList}"})[10m:])) > 0`
      const gpuXidExprChangeData = await customStore.fetchMetric({
        expr: gpuXidExprChangeExpr,
        // cluster: selectCluster?.namespace,
        start: currentTime - range, // 1시간 기준 > 3600
        end: currentTime,
      })
      const gpuXidTransform = transformXidDataToObject(
        gpuXidData,
        gpuXidExprChangeData,
        gpuUtilTransform,
        gpuMemTransform
      )

      let gpuDataList = []
      Object.entries(gpuXidTransform).map(([vmName, gpuData]) => {
        Object.entries(gpuData).map(([gpuIndex, gpuItem]) => {
          gpuDataList.push({
            group: vmName,
            gpu: gpuIndex,
            state: gpuItem.state,
            util: gpuItem.util,
            mem: gpuItem.mem,
          })
        })
      })
      setDataList(gpuDataList)

      setGpuLoading(false)
    }
    getData()
  }

  const transformDataToObject = data => {
    const result = {}

    data.forEach(item => {
      const pod = item.metric.pod
      const gpu = item.metric.gpu
      const values = item.values
      const lastValue = values.length > 0 ? values[values.length - 1][1] : 0

      if (!result[pod]) {
        result[pod] = {}
      }

      let formattedValue = 0
      if (lastValue && Number(lastValue) !== 0) {
        formattedValue = Number(lastValue).toFixed(0)
      }

      result[pod][gpu] = formattedValue
    })

    return result
  }

  useEffect(() => {
    if (type === 'node') {
      setDataList(nodeList)
    } else if (type === 'vm') {
      setDataList(vmResultList)
    } else if (type === 'gpu') {
      getGpuListData()
    }
  }, [type])

  useEffect(() => {
    if (type === 'vm' && vmList.length > 0) {
      getVmAvgData()
    } else if (type === 'node' && clusterArr.length > 0) {
      getGpuNodeList(clusterArr, false)
    } else if (type === 'gpu' && vmList.length > 0) {
      getGpuListData()
    }
  }, [range])

  useEffect(() => {
    if (!popOpen) setGpuDataList([])
  }, [popOpen])

  useEffect(() => {
    setPopOpen(false)
  }, [filter, type])

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_GPU_STATUS_MAP')}</label>
          <div className="right" style={{ width: '22%' }}>
            <div
              className="select-list-box"
              style={{ width: '70%', marginTop: '-7px' }}
            >
              <div className="usageTab">
                <Select
                  value={type}
                  onChange={e => {
                    setType(e)
                  }}
                  options={typeOption}
                />
              </div>
            </div>
            <div className="icon_dropdown_wrap" ref={dropdownRef}>
              <button
                className="icon icon_dropdown_btn"
                onClick={() => !popOpen && setOpen(prev => !prev)}
              >
                <i className="ico-list-filter"></i>
              </button>
              <div className={`icon_dropdown_box ${open && 'open'}`}>
                <ul className="icon_dropdown_list">
                  {sortOption.map(opt => (
                    <li
                      key={opt.value}
                      className={sort === opt.value ? 'selected' : ''}
                      onClick={() => {
                        setSort(opt.value)
                        setOpen(false)
                      }}
                    >
                      <span>{opt.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="grid_option_area">
          <div className="legend_button_wrapper">
            <button className="legend_toggle_button" onClick={toggleLegend}>
              {t('RESOURCES_LEGEND')}
            </button>
            <div
              className="legend_dropdown_container"
              id="legendDropdown"
              style={{ display: 'none' }}
            >
              <div className="legend_container">
                <div className="legend_item_label">
                  {t('RESOURCES_GPU_UTILIZATION_PERCENT')}
                </div>
                <div className="legend_items">
                  <div className="legend_item">
                    <div className="color_bar gpu_state_unknown"></div>
                    <span className="level">0</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage1"></div>
                    <span className="level">30%</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage2"></div>
                    <span className="level">60%</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage3"></div>
                    <span className="level">80%</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage4"></div>
                    <span className="level">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="alert_tab">
            <label htmlFor="al_name_1">
              <input
                type="radio"
                name="box-tab"
                id="al_name_1"
                value="al_name_1"
                defaultChecked
                onClick={() => setFilter('all')}
              />
              <span>
                <span className="gpu_badge_number">{dataList.length}</span>
                <span>{t('RESOURCES_ALL')}</span>
              </span>
            </label>
            <label htmlFor="al_name_3">
              <input
                type="radio"
                name="box-tab"
                id="al_name_3"
                value="al_name_3"
                onClick={() => setFilter('minor')}
              />
              <span>
                <span className="gpu_badge_number minor">
                  {dataList.filter(item => item.state === 'abnormal').length}
                </span>
                <span>{t('RESOURCES_GPUCLUSTER_MINOR')}</span>
              </span>
            </label>
            <label htmlFor="al_name_4">
              <input
                type="radio"
                name="box-tab"
                id="al_name_4"
                value="al_name_4"
                onClick={() => setFilter('unknown')}
              />
              <span>
                <span className="gpu_badge_number unknown">
                  {dataList.filter(item => item.state === 'unknown').length}
                </span>
                <span>{t('RESOURCES_GPUCLUSTER_UNKNOWN')}</span>
              </span>
            </label>
            <div className="select_wrap">
              <div className="select-list-box">
                <div className="selected-item single" ref={dropdownRefRange}>
                  <p>
                    <strong>
                      {rangeOption.find(obj => obj.value === range)?.label}
                    </strong>
                  </p>
                </div>
                <ul className="select-list scroll-gray">
                  {rangeOption.map(opt => (
                    <li
                      key={opt.value}
                      className={range === opt.value ? 'selected' : ''}
                      onClick={() => {
                        setRange(opt.value)
                        setOpen(false)
                      }}
                    >
                      <p>
                        <strong>{opt.label}</strong>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Loading spinning={loading || gpuLoading || vmLoading || nodeLoading}>
          <div className="gpu_map_wrap">
            {dataList.length === 0 && <div>{t('RESOURCES_NO_DATA')}</div>}
            {type === 'node' && dataList.length > 0 && (
              <Node
                setPopOpen={setPopOpen}
                setSelectCluster={setSelectCluster}
                dataList={dataList}
                filter={filter}
                sort={sort}
                getAreaColor={getAreaColor}
                range={range}
                customStore={customStore}
                setGpuDataList={setGpuDataList}
                setGpuXidData={setGpuXidData}
                gpuXidData={gpuXidData}
                transformXidDataToObject={transformXidDataToObject}
                selectCluster={selectCluster}
                gpuDataList={gpuDataList}
                popOpen={popOpen}
                {...props}
              />
            )}
            {type === 'vm' && dataList.length > 0 && (
              <Vm
                setPopOpen={setPopOpen}
                setSelectCluster={setSelectCluster}
                dataList={dataList}
                filter={filter}
                sort={sort}
                getAreaColor={getAreaColor}
                range={range}
                customStore={customStore}
                setGpuDataList={setGpuDataList}
                setGpuXidData={setGpuXidData}
                gpuXidData={gpuXidData}
                transformXidDataToObject={transformXidDataToObject}
                selectCluster={selectCluster}
                gpuDataList={gpuDataList}
                popOpen={popOpen}
                {...props}
              />
            )}
            {type === 'gpu' && dataList.length > 0 && (
              <Gpu
                setPopOpen={setPopOpen}
                dataList={dataList}
                filter={filter}
                sort={sort}
                getAreaColor={getAreaColor}
                range={range}
                popOpen={popOpen}
                vmList={vmList}
                {...props}
              />
            )}
          </div>
        </Loading>
      </div>
    </>
  )
}

export default GpuMap
