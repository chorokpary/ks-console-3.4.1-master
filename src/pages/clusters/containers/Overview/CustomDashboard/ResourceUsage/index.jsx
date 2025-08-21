import React, { useEffect, useRef, useState } from 'react'
import { Loading } from '@kube-design/components'
import {
  getLastMonitoringData,
  getAreaChartOps,
  getSuitableUnit,
  getValueByUnit,
} from 'utils/monitoring'
import { get, last } from 'lodash'
import { SimpleArea } from 'components/Charts'
import VmStore from 'stores/resources/vms'
import PodStore from 'stores/monitoring/pod'
import CustomStore from 'stores/monitoring/custom/monitor'
import ResourceStore from 'stores/resources/containerresource'
import { getContentOptions, getData } from './handleTab'

const MetricTypes = {
  cpu_usage: 'cluster_cpu_usage',
  cpu_total: 'cluster_cpu_total',
  cpu_utilisation: 'cluster_cpu_utilisation',
  memory_usage: 'cluster_memory_usage_wo_cache',
  memory_total: 'cluster_memory_total',
  memory_utilisation: 'cluster_memory_utilisation',
  disk_size_usage: 'cluster_disk_size_usage',
  disk_size_capacity: 'cluster_disk_size_capacity',
  disk_utilisation: 'cluster_disk_size_utilisation',
  // pod_count: 'cluster_pod_running_count',
  // pod_capacity: 'cluster_pod_quota',
  pod_utilisation: 'cluster_pod_utilisation',
  pod_cpu_usage: 'pod_cpu_usage',
  pod_memory_usage: 'pod_memory_usage',
}

const ResourcesUsage = ({ monitorStore, x, y, w, h, ...props }) => {
  const podStore = new PodStore()
  const customStore = new CustomStore()
  const vmStore = new VmStore()
  const resourceStore = new ResourceStore()

  const [tabData, setTabData] = useState()
  const [tabActive, setTabActive] = useState('cpu')
  const [tabContentData, setTabContentData] = useState([])
  const [tabContent, setTabContent] = useState()
  const [tabContentActive, setTabContentActive] = useState(false)
  const [rightTab, setRightTab] = useState('node')
  const [loading, setLoading] = useState(false)

  const [metricData, setMetricData] = useState([])
  const [vmData, setVmData] = useState({ cpuData: [], memoryData: [] })
  const [kaasData, setKaasData] = useState({ cpuData: [], memoryData: [] })
  const [podData, setPodData] = useState([])
  const podFetchedRef = useRef(false)

  useEffect(() => {
    let cleanupTrigger = true
    const getData = async () => {
      setLoading(true)

      // node data
      const metricData = await monitorStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        step: '5m', // Time interval
        times: 100,
        // step: '3600s', // 최근 7일
        // times: 160,
        cluster: props.cluster,
      })

      // first render
      handleData('node', metricData)
      handleContenOption('node', metricData)
      setMetricData(metricData)

      // vm list
      const vmList = await vmStore.vmList({ limit: -1, ...props })
      let promsql_pod_vm_list = ''
      let vm_list_length = 0
      vmList.map(obj => {
        promsql_pod_vm_list = promsql_pod_vm_list + obj.id + '|'
        vm_list_length++
      })

      // kaas list
      const kaasList = await resourceStore.fetchList({ limit: 1000, ...props })
      let promsql_pod_kaas_list = ''
      let kaas_list_length = 0
      kaasList.map(obj => {
        const kaasName = get(obj, 'name')
        promsql_pod_kaas_list +=
          promsql_pod_kaas_list != '' ? '|' + kaasName + '.*' : kaasName + '.*'
        kaas_list_length++
      })

      // vm cpu data
      const step = '5m'
      const times = 100
      var currentTime = Math.floor(Date.now() / 1000)
      const vmCpuData = await customStore.fetchMetric({
        expr: `sum(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle",pod=~"${promsql_pod_vm_list}"}[${step}])) * ${times})) / 100 / ${vm_list_length}`,
        start: currentTime - 30000,
        end: currentTime,
        cluster: props.cluster,
      })

      // vm memory data
      const vmMemoryData = await customStore.fetchMetric({
        expr: `sum(node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_vm_list}"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_vm_list}"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_vm_list}"}) / ${vm_list_length}`,
        start: currentTime - 30000,
        end: currentTime,
        cluster: props.cluster,
      })
      setVmData({
        ...vmData,
        ['cpuData']: vmCpuData,
        ['memoryData']: vmMemoryData,
      })

      // kaas cpu data
      const kaasCpuData = await customStore.fetchMetric({
        expr: `sum(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle",pod!~"${promsql_pod_kaas_list}"}[${step}])) * ${times})) / 100 / ${kaas_list_length}`,
        start: currentTime - 30000,
        end: currentTime,
        cluster: props.cluster,
      })

      // kaas memory data
      const kaasMemoryData = await customStore.fetchMetric({
        expr: `sum(node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod!~"${promsql_pod_kaas_list}"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod!~"${promsql_pod_kaas_list}"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod!~"${promsql_pod_kaas_list}"})/ ${kaas_list_length}`,
        start: currentTime - 30000,
        end: currentTime,
        cluster: props.cluster,
      })
      setKaasData({
        ...kaasData,
        ['cpuData']: kaasCpuData,
        ['memoryData']: kaasMemoryData,
      })

      if (cleanupTrigger) {
        setLoading(false)
      }
    }
    getData()
    return () => {
      cleanupTrigger = false
      setLoading(false)
    }
  }, [])

  const handlePodData = podData => {
    const data = {
      pod_cpu_usage: [
        { values: sumPodDataValue(get(podData, `pod_cpu_usage.data.result`)) },
      ],
      pod_memory_usage: [
        {
          values: sumPodDataValue(get(podData, `pod_memory_usage.data.result`)),
        },
      ],
    }
    setPodData(data)
    return data
  }
  const sumPodDataValue = _podData => {
    const _values = _podData?.map(obj => obj.values)
    let valueArr = []
    _values?.map((arr, idx) => {
      let a = 0
      arr.map(arr2 => {
        a += Number(arr2[1])
      })
      valueArr.push([arr[idx]?.[0], a / arr.length])
    })
    return valueArr
  }

  // handle left data
  const handleData = (rightTabActive, metricData) => {
    setTabData(getData(rightTabActive, metricData))
  }

  // handle right data
  const handleContenOption = (rightTabActive, metricData) => {
    setTabContentData(getContentOptions(rightTabActive, metricData))
  }

  // left tab active
  const onClickLeftTab = activeTab => {
    setTabActive(activeTab)
    setTabContent(tabContentData.filter(obj => obj.activeTab == activeTab)[0])
  }

  // right tab active
  const onClickRightTab = async tab => {
    setRightTab(tab)
    let data
    if (tab === 'node') {
      data = metricData
    } else if (tab === 'pod') {
      if (!podFetchedRef.current) {
        setLoading(true)

        const fetchedPodData = await podStore.fetchMetrics({
          metrics: Object.values(MetricTypes),
          step: '5m',
          times: 100,
          cluster: props.cluster,
        })
        const handleData = handlePodData(fetchedPodData)
        podFetchedRef.current = true // 호출 기록
        data = handleData
        setLoading(false)
      } else {
        data = podData
      }
    } else if (tab === 'vm') {
      data = vmData
    } else if (tab === 'kaas') {
      data = kaasData
    }
    handleContenOption(tab, data)
    handleData(tab, data)
    setTabActive('cpu')
  }

  useEffect(() => {
    if (tabContentData.length > 0) {
      setTabContent(tabContentData?.[0])
      setTabContentActive(true)
    }
  }, [tabContentData])

  useEffect(() => {
    if (!loading) {
      onClickRightTab(rightTab)
    }
  }, [loading])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_RESOURCE_USAGE')}</label>
              <div className="right">
                <div className="dash_boxtab">
                  <label htmlFor="name2_1">
                    <input
                      type="radio"
                      name="box-tab"
                      id="name2_1"
                      value="name3"
                      defaultChecked
                      onClick={() => onClickRightTab('node')}
                    />
                    <span>{t('RESOURCES_NODE')}</span>
                  </label>
                  <label htmlFor="name2_2">
                    <input
                      type="radio"
                      name="box-tab"
                      id="name2_2"
                      value="name4"
                      onClick={() => onClickRightTab('pod')}
                    />
                    <span>{t('POD_PL')}</span>
                  </label>
                  <label htmlFor="name2_3">
                    <input
                      type="radio"
                      name="box-tab"
                      id="name2_3"
                      value="name5"
                      onClick={() => onClickRightTab('vm')}
                    />
                    <span>{t('RESOURCES_VM')}</span>
                  </label>
                  <label htmlFor="name2_4">
                    <input
                      type="radio"
                      name="box-tab"
                      id="name2_4"
                      value="name6"
                      onClick={() => onClickRightTab('kaas')}
                    />
                    <span>KaaS</span>
                  </label>
                </div>
              </div>
            </div>
            <Loading spinning={loading && rightTab !== 'node'}>
              <div className="grid_info style_chart">
                <div className="box type_chart">
                  <div className="cont1">
                    {tabData &&
                      tabData.map(data => (
                        <div
                          className={`chart_tab ${
                            tabActive == data.activeTab ? 'on' : ''
                          }`}
                          key={data.name}
                          onClick={() => onClickLeftTab(data.activeTab)}
                        >
                          <div className="title">
                            <i
                              className={`ico-type-${data.unitType} ${data.name}`}
                            ></i>
                            <h5>{data.name}</h5>
                          </div>
                          {rightTab == 'node' ? (
                            <div className="data">
                              <div className="number_wrap">
                                <p>
                                  <span className="em">{data._used}</span> /{' '}
                                  {data._total}
                                  <span
                                    className="unit"
                                    style={{ marginLeft: '3px' }}
                                  >
                                    {' '}
                                    {t(data._unit)}
                                  </span>
                                </p>
                                <p>{Math.round(data._percent)}%</p>
                              </div>
                              <div className="graph_wrap">
                                <div className="graph_bar">
                                  <div
                                    className="bar animate-bar"
                                    style={{
                                      width: `${Math.round(data._percent)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="data">
                              <div className="number_wrap rgt">
                                <p>
                                  <span className="em">
                                    {isNaN(data._used) ? 0 : data._used}
                                  </span>
                                  <span className="unit">{t(data._unit)}</span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                  <div className="cont2">
                    {tabContentActive && (
                      <TabContent option={tabContent}></TabContent>
                    )}
                    {/* <div className="chart_01"></div> */}
                  </div>
                </div>
              </div>
            </Loading>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default ResourcesUsage

const TabContent = ({ option }) => {
  const commonProps = {
    key: option?.title,
    width: '100%',
    height: '100%',
  }
  const config = getAreaChartOps(option)

  return (
    <>
      {config.data.length > 0 ? (
        <SimpleArea
          {...commonProps}
          {...config}
          style={{ padding: '10px', color: 'white' }}
        />
      ) : (
        <div className="grid_text">
          <span>{t('RESOURCES_NO_DATA')}</span>
        </div>
      )}
    </>
  )
}
