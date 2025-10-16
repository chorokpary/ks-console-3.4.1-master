import React, { useEffect, useState, useRef } from 'react'
import { Loading, Select } from '@kube-design/components'
import { Link } from 'react-router-dom'
import CustomStore from 'stores/monitoring/custom/monitor'
import GpuNodeStore from 'stores/resources/gpunodes'
import VmStore from 'stores/resources/vms'

const typeOption = [
  {
    value: 'node',
    label: t('노드'),
  },
  {
    value: 'vm',
    label: t('가상머신'),
  },
  {
    value: 'gpu',
    label: t('GPU'),
  },
]
const rangeOption = [
  {
    value: 3600,
    label: t('최근 1시간'),
  },
  {
    value: 3600 * 2,
    label: t('최근 2시간'),
  },
  {
    value: 3600 * 3,
    label: t('최근 3시간'),
  },
  {
    value: 3600 * 12,
    label: t('최근 12시간'),
  },
  {
    value: 3600 * 24,
    label: t('최근 24시간'),
  },
]
const sortOption = [
  {
    value: 'nameAsc',
    label: t('이름 ↓'),
  },
  {
    value: 'nameDesc',
    label: t('이름 ↑'),
  },
  {
    value: 'usageAsc',
    label: t('사용률 ↓'),
  },
  {
    value: 'usageDesc',
    label: t('사용률 ↑'),
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

  const [clusterArr, setClusterArr] = useState([])
  const [popOpen, setPopOpen] = useState(false)
  const [selectCluster, setSelectCluster] = useState()
  const [vmList, setVmList] = useState([])
  const [vmResultList, setVmResultList] = useState([])
  const [nodeList, setNodeList] = useState([])

  const [dataList, setDataList] = useState([])
  const [gpuDataList, setGpuDataList] = useState([])
  const [gpuXidData, setGpuXidData] = useState({})
  const [selectGpu, setSelectGpu] = useState({})

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
    console.log('gpuNodeList', gpuNodeList)
    if (gpuNodeList.length > 0) getGpuNodeList(gpuNodeList, true)

    const vmData = await vmStore.fetchList({ limit: 1000, ...props })
    const vmList = vmData.filter(item => {
      return item.gpus.length > 0
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
              avg by (pod) (
                  DCGM_FI_DEV_FB_USED{pod=~"${vmNameList}"}
              )
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

    const getData = async () => {
      var currentTime = Math.floor(Date.now() / 1000)
      const paramsData = {
        start: currentTime,
        end: currentTime,
      }

      const expr = clusterArr
        .map(item => {
          console.log('item', item)
          const vmList = item?.vmList
            ?.map(obj => {
              return obj.split('/')[1]
            })
            .join('|')
          console.log('vmList', vmList)
          return `(
              avg by (group) (
                label_replace(
                  DCGM_FI_DEV_GPU_UTIL{pod=~"${vmList}",namespace="${item.namespace}"},
                  "group", "${item.clusterName}", "", ""
                )
              )
            )`
        })
        .join(' or ')

      const gpuAvgUsageData = await customStore.fetchMetric({
        expr: expr,
        paramsData,
      })
      const result = clusterArr.map(c => {
        const metric = gpuAvgUsageData.find(
          m => m.metric.group === c.clusterName
        )
        return {
          group: c.clusterName,
          value: metric ? Number(metric.value[1]).toFixed(0) : 0,
          state: metric ? c.state : 'unknown',
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

  useEffect(() => {
    if (selectCluster) {
      var currentTime = Math.floor(Date.now() / 1000)
      const paramsData = {
        start: currentTime - 1000,
        end: currentTime - 1000,
      }
      const getGpuData = async () => {
        const expr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod="${selectCluster.group}",namespace="${selectCluster.namespace}"} / 100`
        const gpuAvgUsageData = await customStore.fetchMetric({
          expr: expr,
          paramsData,
        })

        setGpuDataList(gpuAvgUsageData)

        // Xid Error
        const gpuXidExpr = `DCGM_FI_DEV_XID_ERRORS{job="launcher-dcgm-exporter", pod="${selectCluster.group}",namespace="${selectCluster.namespace}"}`
        const gpuXidData = await customStore.fetchMetric({
          expr: gpuXidExpr,
          cluster: selectCluster?.namespace,
        })

        // Xid Error - 최근 10분간 변화량이 있는지 확인
        const gpuXidExprChangeExpr = `changes((max by (gpu, pod) (DCGM_FI_DEV_XID_ERRORS{job="launcher-dcgm-exporter", pod="${selectCluster.group}",namespace="${selectCluster.namespace}"})[10m:])) > 0`
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

      getGpuData()
    }
  }, [selectCluster, range])

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
        formattedValue = Number(lastValue).toFixed(2) // 소수점 둘째자리까지
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
          <label>GPU 현황 맵</label>
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
              범례
            </button>
            <div
              className="legend_dropdown_container"
              id="legendDropdown"
              style={{ display: 'none' }}
            >
              <div className="legend_container">
                <div className="legend_items">
                  <div className="legend_item">
                    <div className="color_bar gpu_state_unknown"></div>
                    <span className="level">0</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage1"></div>
                    <span className="level">30</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage2"></div>
                    <span className="level">60</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage3"></div>
                    <span className="level">80</span>
                  </div>
                  <div className="legend_item">
                    <div className="color_bar gpu_state_usage4"></div>
                    <span className="level">100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="alert_tab" style={{ width: '50%' }}>
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
                <span>전체</span>
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
                <span>경고</span>
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
                <span>미확인</span>
              </span>
            </label>
            <div className="usageTab usageTabCustom">
              <div className="select-list-box" style={{ width: '29%' }}>
                <Select
                  value={range}
                  onChange={e => setRange(e)}
                  options={rangeOption}
                />
                <style>
                  {`
                    .usageTabCustom .select-control {
                      height: 25px !important;
                    }
                  `}
                </style>
              </div>
            </div>
          </div>
        </div>
        <Loading spinning={loading || gpuLoading || vmLoading || nodeLoading}>
          <div className="gpu_map_wrap">
            {dataList.length === 0 && <div>데이터가 없습니다.</div>}
            {type !== 'gpu' && dataList.length > 0 && (
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
                          setPopOpen(true)
                          setSelectCluster(item)
                        }}
                      >
                        <div className="name" title={item.group}>
                          {item.group}
                        </div>
                        <div className="percent">{item.value}%</div>
                        {(item.state === 'abnormal' ||
                          item.state === 'unknown') && (
                          <div className={`badge_alert ${item.state}`}></div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
            {type === 'gpu' && dataList.length > 0 && (
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
                        setPopOpen(true)
                        setSelectGpu({
                          vmName: gpuItem.group,
                          gpuIndex: gpuItem.gpu,
                          data: gpuItem,
                        })
                      }}
                    >
                      <div className="name" title={gpuItem.group}>
                        GPU-{gpuItem.gpu}
                      </div>
                      <div className="percent">{gpuItem.util}%</div>
                      {(gpuItem.state === 'minor' ||
                        gpuItem.state === 'unknown') && (
                        <div className={`badge_alert ${gpuItem.state}`}></div>
                      )}
                    </div>
                  ))}
              </div>
            )}
            {/* 팝오버 샘플 : 팝오버는 tile의 색상값과 동일한 색상값과 동일한 클래스 추가 필요 */}
            {/* close_btn, gpu_backdrop 클릭시 팝오버 닫히게 개발 필요*/}
            <div className={`gpu_backdrop ${popOpen && 'active'}`}>
              <div
                className={`gpu_popover ${getAreaColor(
                  type !== 'gpu' ? selectCluster?.value : selectGpu?.util
                )} ${popOpen && 'active'}`}
              >
                {type === 'node' && (
                  <div className="data_node">
                    <div className="title">
                      <span>{selectCluster?.group}</span>
                      <Link
                        to={`/clusters/${props.cluster}/gpunodes/${selectCluster?.group}`}
                      >
                        <span className="link"></span>
                      </Link>
                      <span
                        className="close_btn"
                        onClick={() => setPopOpen(false)}
                      >
                        ✕
                      </span>
                    </div>
                    <div className="gpu_data_info">
                      <div>
                        <span className="label" style={{ flex: 'none' }}>
                          가상머신 개수
                        </span>
                        <span className="value">
                          {selectCluster?.vmList?.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {type === 'vm' && (
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
                            노드
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
                )}
                {type === 'gpu' && (
                  <>
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
                            노드
                          </span>
                          <span className="value">
                            {
                              vmList.find(
                                item => item.name === selectGpu?.vmName
                              )?.node
                            }
                          </span>
                          <Link
                            to={`/clusters/${props.cluster}/gpunodes/${
                              vmList.find(
                                item => item.name === selectGpu?.vmName
                              )?.node
                            }`}
                          >
                            <span className="link"></span>
                          </Link>
                        </div>
                        <div>
                          <span className="label" style={{ flex: 'none' }}>
                            가상머신
                          </span>
                          <span className="value">{selectGpu?.vmName}</span>
                          <Link
                            to={`/clusters/${props.cluster}/projects/${
                              vmList.find(
                                item => item.name === selectGpu?.vmName
                              )?.project
                            }/vms/${selectGpu?.vmName}`}
                          >
                            <span className="link"></span>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="gpu_info">
                      <div className="gpu_usage_info">
                        <span className="label">GPU 사용률</span>
                        <span className="value">{selectGpu?.util || 0}%</span>
                      </div>
                      <div className="gpu_usage_info">
                        <span className="label">GPU 메모리 사용률</span>
                        <span className="value">{selectGpu?.mem || 0}%</span>
                      </div>
                    </div>
                  </>
                )}
                {type !== 'gpu' && (
                  <>
                    <div className="gpu_info">
                      <div className="gpu_usage_info">
                        <span className="label">GPU 사용률</span>
                        <span className="value">
                          {selectCluster?.value || 0}%
                        </span>
                      </div>
                      <div className="gpu_usage_info">
                        <span className="label">GPU 메모리 사용률</span>
                        <span className="value">
                          {selectCluster?.valueMem || 0}%
                        </span>
                      </div>
                    </div>
                    {gpuDataList.length > 0 && (
                      <div className="gpu_pop_boxes">
                        {gpuDataList
                          ?.sort((a, b) => a.metric.gpu - b.metric.gpu)
                          .map((item, index) => (
                            <div
                              className={`gpu_pop_box ${getAreaColor(
                                item?.value?.[1]
                              )} ${
                                gpuXidData?.[item.metric.pod]?.[item.metric.gpu]
                                  .state === 'minor'
                                  ? 'gpu_alert'
                                  : ''
                              }`}
                              key={index}
                            >
                              <div className="name">
                                GPU-{item?.metric?.gpu}
                              </div>
                              <div className="percent">
                                {Number(item?.value?.[1]) || 0}%
                              </div>
                              {gpuXidData?.[item.metric.pod]?.[item.metric.gpu]
                                .state === 'minor' && (
                                <div className="badge_alert"></div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </>
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
                          XID error
                          vm:vm023124234234241231231423421312314142342423,
                          gpu:2, error_code:43
                        </span>
                      </p>
                    </div>
                    <p className="alert_date">2025-08-23</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Loading>
      </div>
    </>
  )
}

export default GpuMap
