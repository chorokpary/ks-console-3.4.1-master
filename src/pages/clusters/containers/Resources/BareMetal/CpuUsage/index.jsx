import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

import { cloneDeep, get, isEmpty, omit, find, remove } from 'lodash'
import { getChartData, getAreaChartOps } from 'utils/monitoring'
import { getLocalTime } from 'utils'

import CustomStore from 'stores/monitoring/custom/monitor'
import BareMetalStore from 'stores/resources/baremetal'

import { CustomChart } from 'components/Charts'

const CpuUsage = (props) => {

  const customStore = new CustomStore();
  const bareMetalStore = new BareMetalStore();

  const [stepParams, setStepParams] = useState({ step: '6m', times: 10 })

  const [x86CpuData, setX86CpuData] = useState([]);
  const [armCpuData, setArmCpuData] = useState([]);
  const [x86PowerData, setX86PowerData] = useState([]);
  const [armPowerData, setArmPowerData] = useState([]);
  const [x86PowerPercent, setX86PowerPercent] = useState(0);
  const [armPowerPercent, setArmPowerPercent] = useState(0);

  const getMinuteValue = (timeStr = '60s', hasUnit = true) => {
    const unit = timeStr.slice(-1)
    let value = parseFloat(timeStr)

    switch (unit) {
      default:
      case 's':
        break
      case 'm':
        value *= 60
        break
      case 'h':
        value *= 60 * 60
        break
      case 'd':
        value = value * 24 * 60 * 60
        break
    }
    return hasUnit ? `${value}s` : value
  }

  const getTimeRange = ({ step = '600s', times = 20 } = {}) => {
    const interval = parseFloat(step) * times
    const end = Math.floor(Date.now() / 1000)
    const start = Math.floor(end - interval)

    return { start, end }
  }

  /**
   * data 내 values들의 각 시간에 따른 총합 
   * @param {*} data 
   * @returns 
   */
  const sumValuesByTime = (data) => {
    const sumByTime = {};
    data.forEach(item => {
      item?.values?.forEach(([time, value]) => {
        if (!sumByTime[time]) {
          sumByTime[time] = 0;
        }
        sumByTime[time] += parseInt(value);
      });
    });

    let values = []
    for (const [key, value] of Object.entries(sumByTime)) {
      values.push([key, value])
    }
    return { values }
  };

  useEffect(() => {
    fetchData(stepParams);
  }, [stepParams])

  const fetchData = async (params) => {

    const paramsData = Object.assign(params, {
      start: params.start,
      end: params.end,
      step: getMinuteValue(params.step),
      times: params.times,
    })

    if (!paramsData.start || !paramsData.end) {
      const timeRange = getTimeRange(paramsData)
      paramsData.start = timeRange.start
      paramsData.end = timeRange.end
    }

    // node list
    const nodeList = await bareMetalStore.fetchList({ limit: 1000 })

    let promql_node_list = []
    nodeList.map((obj) => {
      promql_node_list.push(get(obj, 'name'))
    })

    const metric_type = await customStore.fetchMetric({
      expr: `group by(instance, machine) (node_uname_info{nodename=~"${promql_node_list.join('|')}"})`,
      ...props.match.params
    });

    const metric_power = await customStore.fetchMetric({
      expr: `sum by (target) (redfish_chassis_power_powersupply_last_power_output_watts)`,
      ...props.match.params,
      ...paramsData
    })

    /**
     * 베어메탈 node list 를 순회하며
     * metric type data 에서 x86과 arm 을 구분하여 해당 openBMC address 를 저장
     * 해당 openBMC address으로 metric power data 에서 metric.target과 비교하여
     * 실제 x86, arm 데이터를 구분함./
     */
    let promql_x86_names = []
    let promql_arm_names = []
    let promql_x86_node_list = []
    let promql_arm_node_list = []
    const x86Array = ['x86_64', 'amd'];
    const armArray = ['arm', 'aarch64'];
    nodeList.map(async obj => {
      const metrics =
        obj.system_type === 'C' ?
          metric_type.find(item => get(item, 'metric.instance') === obj.name)
          : metric_type.find(item => get(item, 'metric.instance', ':').split(':')[0] === obj.nodeExporter.ip)

      const machine = get(metrics, 'metric.machine', '');
      if (x86Array.includes(machine.toLowerCase())) {
        promql_x86_node_list.push(get(obj, 'openBMC.address'))
        promql_x86_names.push(get(obj, 'name'));
      }
      if (armArray.includes(machine.toLowerCase())) {
        promql_arm_node_list.push(get(obj, 'openBMC.address'))
        promql_arm_names.push(get(obj, 'name'));
      }
    })

    // promql_arm_names.push('cmp-meh')
    // promql_arm_node_list.push('10.24.3.17')
    // ------ metric power 전체 중, metric.target이 x86, arm에 해당하는지 구분
    let x86_data = [];
    let arm_data = [];
    metric_power.map(obj => {
      if (promql_x86_node_list.includes(get(obj, 'metric.target'))) {
        x86_data.push(obj)
      }
      if (promql_arm_node_list.includes(get(obj, 'metric.target'))) {
        arm_data.push(obj)
      }
    })

    // -------------------- CPU 소비 전력량 비교 right data (power) ---------------------
    const x86Power = sumValuesByTime(x86_data)
    const armPower = sumValuesByTime(arm_data)

    setX86PowerData([x86Power])
    setArmPowerData([armPower])
    // ------------------------------------------------------------------------------


    // -------------------- CPU 소비 전력량 비교 left data ---------------------
    const x86PowerLastData = get(x86Power, `values[${x86Power.values.length - 1}][1]`, '0');
    const armPowerLastData = get(armPower, `values[${armPower.values.length - 1}][1]`, '0');

    const x86PowerAvg = Math.round(x86PowerLastData / x86_data.length);
    const armPowerAvg = Math.round(armPowerLastData / arm_data.length);

    const max_power = 200000;

    let x86PowerPercent = ((x86PowerAvg / max_power) * 100)
    let armPowerPercent = ((armPowerAvg / max_power) * 100)

    x86PowerPercent = (isNaN(x86PowerPercent) || !isFinite(x86PowerPercent)) ? 0 : x86PowerPercent.toFixed(2);
    armPowerPercent = (isNaN(armPowerPercent) || !isFinite(armPowerPercent)) ? 0 : armPowerPercent.toFixed(2);

    setX86PowerPercent(x86PowerPercent);
    setArmPowerPercent(armPowerPercent);
    // ----------------------------------------------------------------------


    // -------------------- CPU 소비 전력량 비교 right data (usage) ---------------------
    const metric_cpu_x86 = await customStore.fetchMetric({
      expr: `sum by (machine) (rate(node_cpu_seconds_total{mode!="idle"}[5m]) * on (instance) group_left(machine) (max by(instance, machine) (node_uname_info{nodename=~"${promql_x86_names.join('|')}"})))`,
      ...props.match.params,
      ...paramsData
    })
    const metric_cpu_arm = await customStore.fetchMetric({
      expr: `sum by (machine) (rate(node_cpu_seconds_total{mode!="idle"}[5m]) * on (instance) group_left(machine) (max by(instance, machine) (node_uname_info{nodename=~"${promql_arm_names.join('|')}"})))`,
      ...props.match.params,
      ...paramsData
    })

    const x86CpuArray = [metric_cpu_x86?.[0]];
    const armCpuArray = [metric_cpu_arm?.[0]];

    setX86CpuData(x86CpuArray)
    setArmCpuData(armCpuArray)
    // ------------------------------------------------------------------------------

  }

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
    // console.log("ComposedData : "+ JSON.stringify(ComposedData))
    return ComposedData;
  }

  const onClickTab = (step) => {
    const stepData = {
      h: { step: '6m', times: 10 },
      d: { step: '60m', times: 24 },
      w: { step: '5h', times: 33.6 },
      m: { step: '10h', times: 72 },
    }
    setStepParams(get(stepData, step))
  }

  return (
    <>
      <div className="gridbox_wrap">
        <div className="grid_item">
          <div className="grid_title" style={{ cursor: 'default' }}>
            <label>{t('RESOURCES_CPU_POWER_CONSUMPTION_ONE_TO_AVERAGE')}</label>
            <div className="right">
              <div className="boxtab">
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
              {/* <!--<i className="ico-btn-trash"></i>--> */}
            </div>
          </div>
          <div className="grid_info style_chart_2">
            <div className="box type_chart">
              <div className="cont1">
                <div className="chart_tab no-tab">
                  <div className="chart_group">
                    <div className="title">
                      <i className="ico-type24-arm"></i>
                      <h5>{t('RESOURCES_ARM')} ({t('RESOURCES_ONE_TO_AVERAGE')})</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap data-r">
                        <p><i className="ico-type24-powericon"></i> <span className="em">{armPowerPercent}</span> <span className="unit">W</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="graph_wrap">
                    <div className="graph_bar">
                      <div className="bar animate-bar" style={{ width: `${armPowerPercent}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="chart_tab no-tab">
                  <div className="chart_group">
                    <div className="title">
                      <i className="ico-type24-x86"></i>
                      <h5>{t('RESOURCES_X86')} ({t('RESOURCES_ONE_TO_AVERAGE')})</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap data-r">
                        <p><i className="ico-type24-powericon"></i> <span className="em">{x86PowerPercent}</span> <span className="unit">W</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="graph_wrap">
                    <div className="graph_bar">
                      <div className="bar second animate-bar" style={{ width: `${x86PowerPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="cont2 baremetalChart">
                <CustomChart data={getComposedData()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CpuUsage
