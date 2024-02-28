import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { toJS } from 'mobx'
import { get, remove } from 'lodash'
import { getAreaChartOps } from 'utils/monitoring'

import CustomStore from 'stores/monitoring/custom/monitor'
import { getMinuteValue, getTimeRange } from 'stores/monitoring/base'
import { CustomChart } from 'components/Charts'

const stepData = {
  h: { step: '6m', times: 10 },
  d: { step: '60m', times: 24 },
  w: { step: '5h', times: 33.6 },
  m: { step: '10h', times: 72 },
}

const CpuPower = ({ x, y, w, h,
  nodeData
}) => {

  useEffect(() => {
    setNodeList(nodeData)
  }, [nodeData])



  const customStore = new CustomStore();

  const [loading, setLoading] = useState(false);
  const [metricType, setMetricType] = useState([])
  const [metricPower, setMetricPower] = useState([])

  const [nodeList, setNodeList] = useState([]);
  const [x86CpuData, setX86CpuData] = useState([]);
  const [armCpuData, setArmCpuData] = useState([]);
  const [x86PowerData, setX86PowerData] = useState([]);
  const [armPowerData, setArmPowerData] = useState([]);

  useEffect(() => {

    let cleanupTrigger = true;
    const getData = async () => {
      setLoading(true)


      let promql_node_list = ""
      nodeList.map((obj) => {
        const nodeName = get(obj, 'name')
        promql_node_list += promql_node_list != "" ? ("|" + nodeName) : nodeName;
      })

      const metric_type = await customStore.fetchMetric({
        expr: `group by(instance, machine) (node_uname_info{nodename=~"${promql_node_list}"})`,
      })

      const metric_power_last = await customStore.fetchMetric({
        expr: `sum by (machine) (redfish_chassis_power_powersupply_last_power_output_watts) * on (target) group_left(machine) (max by(target, machine) (label_replace(node_uname_info{nodename=~"${promql_node_list}"}, "target", "$1", "instance", "(.+):.+")))`,
      })

      if (cleanupTrigger) {
        setMetricType(metric_type)
        setMetricPower(metric_power_last)
        fetchData(get(stepData, 'h'))
        setLoading(false)
      }
    }
    getData()
    return () => {
      cleanupTrigger = false
      setLoading(false)
    }
  }, [])


  const getMonitoringCfgs = () => {
    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE_X86',
        legend: ['CPU_USAGE_X86'],
        data: x86CpuData,
      },
      {
        type: 'utilisation',
        title: 'CPU_USAGE_ARM',
        legend: ['CPU_USAGE_ARM'],
        data: armCpuData,
      },
      {
        type: 'utilisation',
        title: 'POWER_X86',
        legend: ['POWER_X86'],
        data: x86PowerData,
      },
      {
        type: 'utilisation',
        title: 'POWER_ARM',
        legend: ['POWER_ARM'],
        data: armPowerData,
      },
    ]
  }

  const fetchData = async (params) => {
    setLoading(true)

    const paramsData = {
      ...getTimeRange({
        ...params,
        step: getMinuteValue(params.step)
      }),
      step: params.step,
      times: params.times
    }

    let promql_node_list = ""
    nodeList.map((obj) => {
      const nodeName = get(obj, 'name')
      promql_node_list += promql_node_list != "" ? ("|" + nodeName) : nodeName;
    })


    const metric_cpu = await customStore.fetchMetric({
      expr: `sum by (machine) (rate(node_cpu_seconds_total{mode!="idle"}[5m]) * on (instance) group_left(machine) (max by(instance, machine) (node_uname_info{nodename=~"${promql_node_list}"})))`,
      ...paramsData
    })

    const x86CpuMetricData = _.find(metric_cpu, (data) => {
      if (get(data, 'metric.machine').includes('x86')) return data;
    });

    const armCpuMetricData = _.find(metric_cpu, (data) => {
      if (get(data, 'metric.machine').includes('arm')) return data;
    });

    const x86CpuArray = [];
    const armCpuArray = [];

    x86CpuArray.push(x86CpuMetricData)
    x86CpuArray.push(armCpuMetricData)

    setX86CpuData(x86CpuArray)
    setArmCpuData(armCpuArray)

    const metric_power = await customStore.fetchMetric({
      expr: `sum by (machine) (redfish_chassis_power_powersupply_last_power_output_watts) * on (target) group_left(machine) (max by(target, machine) (label_replace(node_uname_info{nodename=~"${promql_node_list}"}, "target", "$1", "instance", "(.+):.+")))`,
      ...paramsData
    })

    const x86PowerMetricData = _.find(metric_power, (data) => {
      if (get(data, 'metric.machine').includes('x86')) return data;
    });

    const armPowerMetricData = _.find(metric_power, (data) => {
      if (get(data, 'metric.machine').includes('arm')) return data;
    });

    const x86PowerArray = [];
    const armPowerArray = [];

    x86PowerArray.push(x86PowerMetricData)
    armPowerArray.push(armPowerMetricData)

    setX86PowerData(x86PowerArray)
    setArmPowerData(armPowerArray)

    setLoading(false)
  }

  const getComposedData = () => {

    const configs = getMonitoringCfgs()

    const x86CpuConfigData = getAreaChartOps(configs.find(item => item.title === 'CPU_USAGE_X86'))
    const armCpuConfigData = getAreaChartOps(configs.find(item => item.title === 'CPU_USAGE_ARM'))
    const x86PowerConfigData = getAreaChartOps(configs.find(item => item.title === 'POWER_X86'))
    const armPowerConfigData = getAreaChartOps(configs.find(item => item.title === 'POWER_ARM'))

    // 기준이되는 데이터 생성
    let standardArray = [];
    standardArray = x86CpuConfigData.data.length > 0 ? x86CpuConfigData.data : armCpuConfigData.data;
    if (standardArray.length < 1) {
      standardArray = x86PowerConfigData.data.length > 0 ? x86PowerConfigData.data : armPowerConfigData.data;
    }

    const ComposedData = [];
    standardArray.map((obj) => {
      const data = {
        time: obj.time,
        x86_usage: get(_.find(x86CpuConfigData.data, { 'time': obj.time }), 'CPU_USAGE_X86', 0),
        arm_usage: get(_.find(armCpuConfigData.data, { 'time': obj.time }), 'CPU_USAGE_ARM', 0),
        x86_power: get(_.find(x86PowerConfigData.data, { 'time': obj.time }), 'POWER_X86', 0),
        arm_power: get(_.find(armPowerConfigData.data, { 'time': obj.time }), 'POWER_ARM', 0),
      }
      ComposedData.push(data)
    })
    return ComposedData;
  }

  const onClickTab = (step) => {
    fetchData(get(stepData, step))
  }

  const getPower = (nodeType) => {

    let cnt = 0;
    nodeList.map((obj) => {
      const instance = toJS(obj.system_type == "C" ? obj.name : obj.nodeExporter.ip)
      const type_data = metricType.find(item => (get(item, 'metric.instance').split(":")[0] === instance))
      const type = get(type_data, 'metric.machine', '')
      if (nodeType == 'x86') {
        if (type.includes(nodeType)) cnt++;
      } else {
        if (!type.includes('x86')) cnt++;
      }
    })

    const metricLastData = _.find(metricPower, (data) => {
      if (get(data, 'metric.machine').includes(nodeType)) return data;
    });

    const lastData = get(metricLastData, 'value[1]', '0');

    const powerAvg = Math.round(lastData / cnt);

    const max_power = 200000; // 200kwh 기준
    const powerPercent = ((powerAvg / max_power) * 100).toFixed(0)

    return isNaN(powerPercent) ? 0 : powerPercent
  }

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_CPU_POWER_CONSUMPTION_ONE_TO_AVERAGE')}</label>
              <div className="right">
                <div className="dash_boxtab">
                  <label htmlFor="cpupower_name1">
                    <input type="radio" name="cpupower" id="cpupower_name1" value="name3" defaultChecked onClick={() => onClickTab('h')} />
                    <span>{t('RESOURCES_LAST_TIME_HOUR')}</span>
                  </label>
                  <label htmlFor="cpupower_name2">
                    <input type="radio" name="cpupower" id="cpupower_name2" value="name4" onClick={() => onClickTab('d')} />
                    <span>{t('RESOURCES_LAST_TIME_DAY')}</span>
                  </label>
                  <label htmlFor="cpupower_name3">
                    <input type="radio" name="cpupower" id="cpupower_name3" value="name5" onClick={() => onClickTab('w')} />
                    <span>{t('RESOURCES_LAST_TIME_WEEKEND')}</span>
                  </label>
                  <label htmlFor="cpupower_name4">
                    <input type="radio" name="cpupower" id="cpupower_name4" value="name6" onClick={() => onClickTab('m')} />
                    <span>{t('RESOURCES_LAST_TIME_MONTH')}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="grid_info style_chart_2">
              <div className="box type_chart">
                <div className="cont1">
                  <div className="chart_tab no-tab">
                    <div className="chart_group">
                      <div className="title">
                        <i className="ico-type24-arm"></i>
                        <h5>ARM</h5>
                      </div>
                      <div className="data">
                        <div className="number_wrap data-r">
                          <p><i className="ico-type24-powericon"></i> <span className="em">{getPower('arm')}</span> <span className="unit">W</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="graph_wrap">
                      <div className="graph_bar">
                        <div className="bar animate-bar" style={{ width: `${getPower('arm')}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="chart_tab no-tab">
                    <div className="chart_group">
                      <div className="title">
                        <i className="ico-type24-x86"></i>
                        <h5>x86</h5>
                      </div>
                      <div className="data">
                        <div className="number_wrap data-r">
                          <p><i className="ico-type24-powericon"></i> <span className="em">{getPower('x86')}</span> <span className="unit">W</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="graph_wrap">
                      <div className="graph_bar">
                        <div className="bar second animate-bar" style={{ width: `${getPower('x86')}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cont2">
                  <Loading spinning={loading}>
                    <CustomChart data={getComposedData()} />
                  </Loading>
                </div>
              </div>
            </div>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default CpuPower