import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getLastMonitoringData, getAreaChartOps, getSuitableUnit, getValueByUnit } from 'utils/monitoring'
import { get, last } from 'lodash'
import { SimpleArea } from 'components/Charts'
import PodStore from 'stores/monitoring/pod'

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

const ResourcesUsage = ({ monitorStore }) => {
  const podStore = new PodStore();

  const [metricData, setMetricData] = useState([]);
  const [tabData, setTabData] = useState();
  const [tabActive, setTabActive] = useState('cpu');
  const [tabContentData, setTabContentData] = useState([]);
  const [tabContent, setTabContent] = useState();
  const [tabContentActive, setTabContentActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const [podData, setPodData] = useState([]);
  const [rightTabActive, setRightTabActive] = useState('node');


  useEffect(() => {
    const getResourceUsageData = async () => {
      setLoading(true)
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
      setLoading(false)
    };
    getResourceUsageData();

    const getPodUsageData = async () => {
      const podData = await podStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        step: '5m',
        times: 100,
      })
      handlePodData(podData)
    };
    getPodUsageData();
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
      valueArr.push([arr[idx][0], a / arr.length]);
    })
    return valueArr;
  }

  useEffect(() => {
    getData();
    getContentOptions();
  }, [metricData, podData])

  const getValue = data => get(data, 'value[1]', 0)

  const getData = () => {
    const lastData = getLastMonitoringData(metricData)
    const result = [
      {
        activeTab: 'cpu',
        name: 'CPU',
        unitType: 'cpu',
        used: getValue(lastData[MetricTypes.cpu_usage]),
        total: getValue(lastData[MetricTypes.cpu_total]),
      },
      {
        activeTab: 'memory',
        name: 'MEMORY',
        unitType: 'memory',
        used: getValue(lastData[MetricTypes.memory_usage]),
        total: getValue(lastData[MetricTypes.memory_total]),
      },
      {
        activeTab: 'disk',
        name: 'DISK',
        unitType: 'disk',
        used: getValue(lastData[MetricTypes.disk_size_usage]),
        total: getValue(lastData[MetricTypes.disk_size_capacity]),
      },
    ]

    result.map(obj => {
      obj._unit = getSuitableUnit(obj.total || obj.used, obj.unitType) || obj.unit
      obj._used = getValueByUnit(obj.used, obj._unit)
      obj._total = getValueByUnit(obj.total, obj._unit)
      obj._percent = obj._used / obj._total * 100
    })

    setTabData(result)
  }

  const getData2 = () => {
    const result = [
      {
        activeTab: 'cpu',
        name: 'CPU',
        unitType: 'cpu',
        used: last(podData.pod_cpu_usage[0].values)[1],
        total: last(podData.pod_cpu_usage[0].values)[1],
      },
      {
        activeTab: 'memory',
        name: 'MEMORY',
        unitType: 'memory',
        used: last(podData.pod_memory_usage[0].values)[1],
        total: 99999999,
      },
    ]

    result.map(obj => {
      obj._unit = getSuitableUnit(obj.total || obj.used, obj.unitType) || obj.unit
      obj._used = getValueByUnit(obj.used, obj._unit)
      obj._total = getValueByUnit(obj.total, obj._unit)
      obj._percent = obj._used / obj._total * 100
    })

    setTabData(result)
  }

  const getContentOptions = () => {
    const result = [
      {
        activeTab: 'cpu',
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        // unitType: 'cpu',
        legend: ['USAGE'],
        data: get(metricData, `${MetricTypes.cpu_utilisation}.data.result`),
      },
      {
        activeTab: 'memory',
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        // unitType: 'memory',
        legend: ['USAGE'],
        data: get(metricData, `${MetricTypes.memory_utilisation}.data.result`),
      },
      {
        activeTab: 'disk',
        type: 'utilisation',
        title: 'DISK_USAGE',
        unit: '%',
        // unitType: 'disk',
        legend: ['USAGE'],
        data: get(metricData, `${MetricTypes.disk_utilisation}.data.result`),
      },
    ]
    setTabContentData(result)
  }

  const getContentOptions2 = () => {
    const result = [
      {
        activeTab: 'cpu',
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        unitType: 'cpu',
        legend: ['USAGE'],
        data: podData.pod_cpu_usage
      },
      {
        activeTab: 'memory',
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: ['USAGE'],
        data: podData.pod_memory_usage
      },
    ]
    setTabContentData(result)
  }

  const onclickTab = (tab) => {
    setRightTabActive(tab);
  }
  useEffect(() => {
    if (rightTabActive == 'node') {
      getContentOptions()
      getData()
    } else if (rightTabActive == 'pod') {
      getContentOptions2()
      getData2()
    } else if (rightTabActive == 'vm') {
      setTabContentActive(false)
      setTabData([])
    } else if (rightTabActive == 'k8s') {
      setTabContentActive(false)
      setTabData([])
    }
    setTabActive('cpu')
  }, [rightTabActive])


  useEffect(() => {
    if (tabContentData.length > 0) {
      setTabContent(tabContentData?.[0])
      setTabContentActive(true)
    }
  }, [tabContentData])

  const onClickTabData = (activeTab) => {
    setTabActive(activeTab)
    setTabContent(tabContentData.filter(obj => obj.activeTab == activeTab)[0])
  }


  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="4" gs-w="9" gs-h="6">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>리소스 사용량</label>
              <div className="right">
                <div className="dash_boxtab">
                  <label htmlFor="name2_1">
                    <input type="radio" name="box-tab" id="name2_1" value="name3" defaultChecked onClick={() => onclickTab('node')} />
                    <span>노드</span>
                  </label>
                  <label htmlFor="name2_2">
                    <input type="radio" name="box-tab" id="name2_2" value="name4" onClick={() => onclickTab('pod')} />
                    <span>Pod</span>
                  </label>
                  <label htmlFor="name2_3">
                    <input type="radio" name="box-tab" id="name2_3" value="name5" onClick={() => onclickTab('vm')} />
                    <span>가상머신</span>
                  </label>
                  <label htmlFor="name2_4">
                    <input type="radio" name="box-tab" id="name2_4" value="name6" onClick={() => onclickTab('k8s')} />
                    <span>KaaS</span>
                  </label>
                </div>
              </div>
            </div>
            {/* <Loading spinning={loading}> */}
            <div className="grid_info style_chart">
              <div className="box type_chart">
                <div className="cont1">
                  {tabData && tabData.map(data => (
                    <div className={`chart_tab ${tabActive == data.activeTab ? 'on' : ''}`} key={data.name} onClick={() => onClickTabData(data.activeTab)}>
                      <div className="title">
                        <i className={`ico ico-big-${data.unitType}`}></i>
                        <h5>{data.name}</h5>
                      </div>
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
            {/* </Loading> */}
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
    <SimpleArea {...commonProps} {...config} style={{ padding: '10px', color: 'white' }} />
  )
}