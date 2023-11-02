import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getLastMonitoringData, getAreaChartOps, getSuitableUnit, getValueByUnit } from 'utils/monitoring'
import { get, last } from 'lodash'
import { SimpleArea } from 'components/Charts'
import VmStore from 'stores/resources/vms'
import PodStore from 'stores/monitoring/pod'
import CustomStore from 'stores/monitoring/custom/monitor'
import { getContentOptions, getData } from './handleTab'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter
} from "recharts";

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

  const [metricData, setMetricData] = useState([]);
  const [tabData, setTabData] = useState();
  const [tabActive, setTabActive] = useState('cpu');
  const [tabContentData, setTabContentData] = useState([]);
  const [tabContent, setTabContent] = useState();
  const [tabContentActive, setTabContentActive] = useState(false);
  const [rightTab, setRightTab] = useState('node')
  const [loading, setLoading] = useState(false);

  const [podData, setPodData] = useState([]);

  const [vmList, setVmList] = useState([])
  const [vmData, setVmData] = useState({ cpuData: [], memoryData: [] });
  const [kaasData, setKaasData] = useState({ cpuData: [], memoryData: [] });
  const [vmCpuData, setVmCpuData] = useState([]);
  const [vmMemoryData, setVmMemoryData] = useState([]);

  useEffect(() => {

    const getData = async () => {
      setLoading(true)

      // node data
      const metricData = await monitorStore.fetchMetrics({
        // step - time interval
        // times - 표시할 총 시간
        // ex - 그래프 길이 = 5m * 100 
        // -> 현재시간부터 500분을 5분 단위로 표기
        metrics: Object.values(MetricTypes),
        step: '5m',
        times: 100,
      })
      setMetricData(metricData)

      // pod data
      const podData = await podStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        step: '5m',
        times: 100,
      })
      handlePodData(podData)

      // vm list
      const vmList = await vmStore.fetchList({ limit: 1000 })
      setVmList(vmList)

      // vm cpu data
      const step = '5m'
      const times = 100
      var currentTime = Math.floor(Date.now() / 1000);
      const vmCpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[${step}])) * ${times})) / 100`,
        start: currentTime - 30000,
        end: currentTime,
      })
      setVmCpuData(vmCpuData)
      // vm memory data
      const vmMemoryData = await customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        start: currentTime - 30000,
        end: currentTime,
      })
      setVmMemoryData(vmMemoryData)

      setLoading(false)
    };
    getData();

  }, [])

  const handlePodData = (podData) => {
    const data = {
      'pod_cpu_usage': [{ values: sumPodDataValue(get(podData, `pod_cpu_usage.data.result`)) }],
      'pod_memory_usage': [{ values: sumPodDataValue(get(podData, `pod_memory_usage.data.result`)) }],
    }
    setPodData(data)
  }
  const sumPodDataValue = (_podData) => {
    const _values = _podData.map(obj => (obj.values))
    let valueArr = [];
    _values.map((arr, idx) => {
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

  // vm, kass > cpu, memory set
  useEffect(() => {
    let vmCpuFilteredData = [];
    let vmMemoryFilteredData = [];
    let kaasCpuFilteredData = [];
    let kaasMemoryFilteredData = [];

    if (vmCpuData.length > 0) {
      vmCpuData.map(obj => {
        if (vmList.find(vmObj => vmObj.name == obj.metric.pod)) {
          vmCpuFilteredData.push(obj)
        } else {
          kaasCpuFilteredData.push(obj)
        }
      })
    }
    if (vmMemoryData.length > 0) {
      vmMemoryData.map(obj => {
        if (vmList.find(vmObj => vmObj.name == obj.metric.pod)) {
          vmMemoryFilteredData.push(obj)
        } else {
          kaasMemoryFilteredData.push(obj)
        }
      })
    }

    setVmData({ ...vmData, ['cpuData']: vmCpuFilteredData, ['memoryData']: vmMemoryFilteredData })
    setKaasData({ ...kaasData, ['cpuData']: kaasCpuFilteredData, ['memoryData']: kaasMemoryFilteredData })
  }, [vmCpuData, vmMemoryData, vmList])

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
              <label>리소스 사용량</label>
              <div className="right">
                <div className="dash_boxtab">
                  <label htmlFor="name2_1">
                    <input type="radio" name="box-tab" id="name2_1" value="name3" defaultChecked onClick={() => onClickRightTab('node', metricData)} />
                    <span>노드</span>
                  </label>
                  <label htmlFor="name2_2">
                    <input type="radio" name="box-tab" id="name2_2" value="name4" onClick={() => onClickRightTab('pod', podData)} />
                    <span>Pod</span>
                  </label>
                  <label htmlFor="name2_3">
                    <input type="radio" name="box-tab" id="name2_3" value="name5" onClick={() => onClickRightTab('vm', vmData)} />
                    <span>가상머신</span>
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

  const data = [
    {
      name: "Page A",
      uv: 20,
      pv: 800,
      pq: 800,
      amt: 12,
      cnt: 490
    },
    {
      name: "Page B",
      uv: 50,
      pv: 967,
      pq: 868,
      amt: 125,
      cnt: 590
    },
    {
      name: "Page C",
      uv: 10,
      pv: 1098,
      pq: 1506,
      amt: 55,
      cnt: 350
    },
    {
      name: "Page D",
      uv: 100,
      pv: 1200,
      pq: 480,
      amt: 7,
      cnt: 480
    },
    {
      name: "Page E",
      uv: 52,
      pv: 1108,
      pq: 1228,
      amt: 64,
      cnt: 460
    },
    {
      name: "Page F",
      uv: 162,
      pv: 680,
      pq: 1520,
      amt: 23,
      cnt: 380
    }
  ];

  return (
    <SimpleArea {...commonProps} {...config} style={{ padding: '10px', color: 'white' }} />
    // <ResponsiveContainer width={'100%'} height={'100%'} debounce={1}>
    //   <ComposedChart
    //     width={500}
    //     height={400}
    //     data={data}
    //     margin={{
    //       top: 20,
    //       right: 20,
    //       bottom: 20,
    //       left: 20
    //     }}
    //   >
    //     <CartesianGrid
    //       stroke={'#d8dee5'}
    //       strokeDasharray="2 2"
    //       vertical={false}
    //     />
    //     <XAxis dataKey="name" />
    //     <YAxis yAxisId="left" type="number" dataKey="pq" name="weight" stroke="#8884d8" />
    //     <YAxis
    //       yAxisId="right"
    //       type="number"
    //       dataKey="uv"
    //       name="weight"
    //       // unit="kg"
    //       orientation="right"
    //     // stroke="#82ca9d"
    //     />
    //     <Tooltip />
    //     <Legend />
    //     <Bar yAxisId="left" dataKey="pv" barSize={20} fill="#413ea0" />
    //     <Bar yAxisId="left" dataKey="pq" barSize={20} fill="#213ea1" />
    //     <Line yAxisId="right" type="monotone" dataKey="uv" stroke="#ff7300" />
    //     <Line yAxisId="right" type="monotone" dataKey="amt" stroke="#ff1300" />
    //   </ComposedChart>
    // </ResponsiveContainer>
  )
}