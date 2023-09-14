import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getLastMonitoringData, getAreaChartOps, getSuitableUnit, getValueByUnit } from 'utils/monitoring'
import ClusterMonitorStore from 'stores/monitoring/cluster'
import { get } from 'lodash'
import { SimpleArea } from 'components/Charts'

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
  pod_count: 'cluster_pod_running_count',
  pod_capacity: 'cluster_pod_quota',
}

const ResourcesUsage = () => {

  const monitorStore = new ClusterMonitorStore({ cluster: 'default' })

  const [metricData, setMetricData] = useState([]);
  const [tabData, setTabData] = useState();
  const [tabActive, setTabActive] = useState('cpu');
  const [tabContentData, setTabContentData] = useState([]);
  const [tabContent, setTabContent] = useState();
  const [tabContentActive, setTabContentActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getResourceUsageData = async () => {
      setLoading(true)
      const metricData = await monitorStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        step: '5m',
        times: 100,
      })
      setMetricData(metricData)
      setLoading(false)
    };
    getResourceUsageData();
  }, [])

  useEffect(() => {
    getData();
    getContentOptions();
  }, [metricData])

  const getValue = data => get(data, 'value[1]', 0)

  const getData = () => {
    const lastData = getLastMonitoringData(metricData)
    const result = [
      {
        name: 'CPU',
        unitType: 'cpu',
        used: getValue(lastData[MetricTypes.cpu_usage]),
        total: getValue(lastData[MetricTypes.cpu_total]),
      },
      {
        name: 'MEMORY',
        unitType: 'memory',
        used: getValue(lastData[MetricTypes.memory_usage]),
        total: getValue(lastData[MetricTypes.memory_total]),
      },
      {
        name: 'DISK',
        unitType: 'disk',
        used: getValue(lastData[MetricTypes.disk_size_usage]),
        total: getValue(lastData[MetricTypes.disk_size_capacity]),
      },
      // {
      //   name: 'PODS',
      //   unit: '',
      //   used: getValue(lastData[MetricTypes.pod_count]),
      //   total: getValue(lastData[MetricTypes.pod_capacity]),
      // },
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
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        unitType: 'cpu',
        legend: ['USAGE'],
        data: get(metricData, `${MetricTypes.cpu_utilisation}.data.result`),
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: ['USAGE'],
        data: get(
          metricData,
          `${MetricTypes.memory_utilisation}.data.result`
        ),
      },
      {
        type: 'utilisation',
        title: 'DISK_USAGE',
        unit: '%',
        unitType: 'disk',
        legend: ['USAGE'],
        data: get(metricData, `${MetricTypes.disk_utilisation}.data.result`),
      },
      {
        title: 'POD_COUNT',
        unit: '',
        unitType: 'pod',
        legend: ['COUNT'],
        data: get(metricData, `${MetricTypes.pod_count}.data.result`),
      },
    ]

    const data = result.map(item => ({
      props: item,
    }))
    setTabContentData(data)
  }

  useEffect(() => {
    if (tabContentData.length > 0) {
      setTabContent(tabContentData?.[0])
      setTabContentActive(true)
    }
  }, [tabContentData])

  const onClickTabData = (unitType) => {
    setTabActive(unitType)
    setTabContent(tabContentData.filter(obj => obj.props.unitType == unitType)[0])
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
                    <input type="radio" name="box-tab" id="name2_1" value="name3" defaultChecked />
                    <span>노드</span>
                  </label>
                  <label htmlFor="name2_2">
                    <input type="radio" name="box-tab" id="name2_2" value="name4" />
                    <span>Pod</span>
                  </label>
                  <label htmlFor="name2_3">
                    <input type="radio" name="box-tab" id="name2_3" value="name5" />
                    <span>가상머신</span>
                  </label>
                  <label htmlFor="name2_4">
                    <input type="radio" name="box-tab" id="name2_4" value="name6" />
                    <span>쿠버네티스</span>
                  </label>
                </div>
              </div>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_chart">
                <div className="box type_chart">
                  <div className="cont1">
                    {tabData && tabData.map(data => (
                      <div className={`chart_tab ${tabActive == data.unitType ? 'on' : ''}`} key={data.name} onClick={() => onClickTabData(data.unitType)}>
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
                      <TabContent option={tabContent?.props}></TabContent>
                    }
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
    <SimpleArea {...commonProps} {...config} style={{ padding: '10px', color: 'white' }} />
  )
}