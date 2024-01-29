import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getLastMonitoringData, getAreaChartOps, getSuitableUnit, getValueByUnit } from 'utils/monitoring'
import { get, last } from 'lodash'
import { SimpleArea } from 'components/Charts'
import VmStore from 'stores/resources/vms'
import PodStore from 'stores/monitoring/pod'
import CustomStore from 'stores/monitoring/custom/monitor'
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
  pod_memory_usage: 'pod_memory_usage'
}

const ResourcesUsage = ({ monitorStore, x, y, w, h }) => {
  const podStore = new PodStore();
  const customStore = new CustomStore();
  const vmStore = new VmStore();

  const [tabData, setTabData] = useState();
  const [tabActive, setTabActive] = useState('cpu');
  const [tabContentData, setTabContentData] = useState([]);
  const [tabContent, setTabContent] = useState();
  const [tabContentActive, setTabContentActive] = useState(false);
  const [rightTab, setRightTab] = useState('node')
  const [loading, setLoading] = useState(false);

  const [metricData, setMetricData] = useState([]);
  const [vmData, setVmData] = useState({ cpuData: [], memoryData: [] });
  const [kaasData, setKaasData] = useState({ cpuData: [], memoryData: [] });
  const [podData, setPodData] = useState([]);

  useEffect(() => {

    let cleanupTrigger = true;
    const getData = async () => {
      setLoading(true)

      // node data
      const metricData = await monitorStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        step: '5m', // Time interval
        times: 100,
        // step: '3600s', // 최근 7일
        // times: 160,
      })

      // pod data
      const podData = await podStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        step: '5m',
        times: 100,
      })

      // vm list
      const vmList = await vmStore.vmList()
      let vmUuid = '';
      vmList.map(obj =>
        vmUuid = vmUuid + obj.id + "|")

      // vm cpu data
      const step = '5m'
      const times = 100
      var currentTime = Math.floor(Date.now() / 1000);
      const vmCpuData = await customStore.fetchMetric({
        expr: `sum(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle",pod=~"${vmUuid}"}[${step}])) * ${times})) / 100`,
        start: currentTime - 30000,
        end: currentTime,
      })

      // vm memory data
      const vmMemoryData = await customStore.fetchMetric({
        expr: `sum(node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${vmUuid}"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${vmUuid}"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${vmUuid}"})`,
        start: currentTime - 30000,
        end: currentTime,
      })

      // kaas cpu data
      const kaasCpuData = await customStore.fetchMetric({
        expr: `sum(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle",pod!~"${vmUuid}"}[${step}])) * ${times})) / 100`,
        start: currentTime - 30000,
        end: currentTime,
      })

      // kaas memory data
      const kaasMemoryData = await customStore.fetchMetric({
        expr: `sum(node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod!~"${vmUuid}"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod!~"${vmUuid}"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod!~"${vmUuid}"})`,
        start: currentTime - 30000,
        end: currentTime,
      })

      if (cleanupTrigger) {
        setMetricData(metricData)
        handlePodData(podData)
        setVmData({ ...vmData, ['cpuData']: vmCpuData, ['memoryData']: vmMemoryData })
        setKaasData({ ...kaasData, ['cpuData']: kaasCpuData, ['memoryData']: kaasMemoryData })
        setLoading(false)
      }
    };
    getData();
    return () => {
      cleanupTrigger = false
      setLoading(false)
    }

  }, [])

  const handlePodData = (podData) => {
    const data = {
      'pod_cpu_usage': [{ values: sumPodDataValue(get(podData, `pod_cpu_usage.data.result`)) }],
      'pod_memory_usage': [{ values: sumPodDataValue(get(podData, `pod_memory_usage.data.result`)) }],
    }
    setPodData(data)
  }
  const sumPodDataValue = (_podData) => {
    const _values = _podData?.map(obj => (obj.values))
    let valueArr = [];
    _values?.map((arr, idx) => {
      let a = 0;
      arr.map((arr2) => {
        a += Number(arr2[1]);
      })
      valueArr.push([arr[idx]?.[0], a / arr.length]);
    })
    return valueArr;
  }

  // first render
  useEffect(() => {
    handleData('node', metricData);
    handleContenOption('node', metricData);
  }, [metricData])

  // handle left data
  const handleData = (rightTabActive, metricData) => {
    setTabData(getData(rightTabActive, metricData))
  }

  // handle right data
  const handleContenOption = (rightTabActive, metricData) => {
    setTabContentData(getContentOptions(rightTabActive, metricData))
  }

  // left tab active
  const onClickLeftTab = (activeTab) => {
    setTabActive(activeTab)
    setTabContent(tabContentData.filter(obj => obj.activeTab == activeTab)[0])
  }

  // right tab active
  const onClickRightTab = (tab, data) => {
    handleContenOption(tab, data)
    handleData(tab, data)
    setTabActive('cpu')
    setRightTab(tab)
  }

  useEffect(() => {
    if (tabContentData.length > 0) {
      setTabContent(tabContentData?.[0])
      setTabContentActive(true)
    }
  }, [tabContentData])


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
                    <input type="radio" name="box-tab" id="name2_1" value="name3" defaultChecked onClick={() => onClickRightTab('node', metricData)} />
                    <span>{t('RESOURCES_NODE')}</span>
                  </label>
                  <label htmlFor="name2_2">
                    <input type="radio" name="box-tab" id="name2_2" value="name4" onClick={() => onClickRightTab('pod', podData)} />
                    <span>Pod</span>
                  </label>
                  <label htmlFor="name2_3">
                    <input type="radio" name="box-tab" id="name2_3" value="name5" onClick={() => onClickRightTab('vm', vmData)} />
                    <span>{t('RESOURCES_VM')}</span>
                  </label>
                  <label htmlFor="name2_4">
                    <input type="radio" name="box-tab" id="name2_4" value="name6" onClick={() => onClickRightTab('kaas', kaasData)} />
                    <span>KaaS</span>
                  </label>
                </div>
              </div>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_chart">
                <div className="box type_chart">
                  <div className="cont1">
                    {tabData && tabData.map(data => (
                      <div className={`chart_tab ${tabActive == data.activeTab ? 'on' : ''}`} key={data.name} onClick={() => onClickLeftTab(data.activeTab)}>
                        <div className="title">
                          <i className={`ico-type-${data.unitType} ${data.name}`}></i>
                          <h5>{data.name}</h5>
                        </div>
                        {rightTab == 'node' ?
                          <div className="data">
                            <div className="number_wrap">
                              <p><span className="em">{data._used}</span> / {data._total} <span className="unit">{t(data._unit)}</span></p>
                              <p>{Math.round(data._percent)}%</p>
                            </div>
                            <div className="graph_wrap">
                              <div className="graph_bar">
                                <div className="bar animate-bar" style={{ width: `${Math.round(data._percent)}%` }}></div>
                              </div>
                            </div>
                          </div>
                          :
                          <div className="data">
                            <div className="number_wrap rgt">
                              <p><span className="em">{data._used}</span><span className="unit">{t(data._unit)}</span></p>
                            </div>
                          </div>
                        }
                      </div>
                    ))}
                  </div>
                  <div className="cont2">
                    {tabContentActive &&
                      <TabContent option={tabContent}></TabContent>
                    }
                    {/* <div className="chart_01"></div> */}
                  </div>
                </div>
              </div>
            </Loading>
          </div>
          {/* // grid_item */}
        </div>
      </div >
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
      {config.data.length > 0 ?
        <SimpleArea {...commonProps} {...config} style={{ padding: '10px', color: 'white' }} />
        :
        <div className="grid_text">
          <span>{t('RESOURCES_NO_DATA')}</span>
        </div>
      }
    </>
  )
}