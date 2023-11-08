import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

import { cloneDeep, get, isEmpty, omit, find, remove } from 'lodash'
import { getChartData, getAreaChartOps } from 'utils/monitoring'
import { getLocalTime } from 'utils'

import CustomStore from 'stores/monitoring/custom/monitor'
import { CustomChart } from 'components/Charts'

const CpuUsage = (props) => {

  const customStore = new CustomStore();

  const [stepParams, setStepParams] = useState({ step: '6m', times: 10 })

  const [x86CpuData, setX86CpuData] = useState([]);
  const [armCpuData, setArmCpuData] = useState([]);
  const [x86PowerData, setX86PowerData] = useState([]);
  const [armPowerData, setArmPowerData] = useState([]);
  const [x86PowerAvgData, setX86PowerAvgData] = useState(0);
  const [armPowerAvgData, setArmPowerAvgData] = useState(0);
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

  useEffect(() => {
    fetchData(stepParams);
  }, [stepParams])

  const fetchData = async (params) => {

    const { data } = props.store.list;

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

    const getTypeData = async () => {

      const metric_type = await customStore.fetchMetric({
        expr: `max by(instance, machine) (node_uname_info)`,
      })

      const metric_power_last = await customStore.fetchMetric({
        expr: `sum by (machine) (label_replace(redfish_chassis_power_powersupply_last_power_output_watts, "instanceurl", "$1", "instance", "(.+):.+")) * on (instanceurl) group_left(machine) (max by(instanceurl, machine) (label_replace(node_uname_info, "instanceurl", "$1", "instance", "(.+):.+")))`,
      })

      let total_x86_count = 0;
      let total_arm_count = 0;

      await data.map((obj) => {
        const type_data = metric_type.find(item => (get(item, 'metric.instance').split(":")[0] === obj.ip))
        const type = get(type_data, 'metric.machine', '')
        type.includes('x86') ? total_x86_count += 1 : total_arm_count += 1;
      })

      const x86PowerMetricLastData = _.find(metric_power_last, (data) => {
        if (get(data, 'metric.machine').includes('x86')) return data;
      });

      const armPowerMetricLastData = _.find(metric_power_last, (data) => {
        if (get(data, 'metric.machine').includes('arm')) return data;
      });

      const x86PowerLastData = get(x86PowerMetricLastData, 'value[1]', '0');
      const armPowerLastData = get(armPowerMetricLastData, 'value[1]', '0');

      const x86PowerAvg = Math.round(x86PowerLastData / total_x86_count);
      const armPowerAvg = Math.round(armPowerLastData / total_arm_count);

      setX86PowerAvgData(x86PowerAvg);
      setArmPowerAvgData(armPowerAvg);

      const max_power = 200000;
      let x86PowerPercent = ((x86PowerAvg / max_power) * 100).toFixed(0);
      let armPowerPercent = ((armPowerAvg / max_power) * 100).toFixed(0);

      x86PowerPercent = x86PowerPercent == "Infinity" ? 0 : x86PowerPercent;
      armPowerPercent = armPowerPercent == "Infinity" ? 0 : x86PowerPercent;

      setX86PowerPercent(x86PowerPercent);
      setArmPowerPercent(armPowerPercent);
    };

    const getCpuUsageData = async () => {
      const metric_cpu = await customStore.fetchMetric({
        expr: `sum by (machine) (rate(node_cpu_seconds_total{mode!="idle"}[5m]) * on (instance) group_left(machine) (max by(instance, machine) (node_uname_info)))`,
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
    };

    const getPowerUsageData = async () => {

      const metric_power = await customStore.fetchMetric({
        expr: `sum by (machine) (label_replace(redfish_chassis_power_powersupply_last_power_output_watts, "instanceurl", "$1", "instance", "(.+):.+")) * on (instanceurl) group_left(machine) (max by(instanceurl, machine) (label_replace(node_uname_info, "instanceurl", "$1", "instance", "(.+):.+")))`,
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
    };


    getTypeData();
    getCpuUsageData();
    getPowerUsageData();
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
      w: { step: '60m', times: 168 },
      m: { step: '1h', times: 697 },
    }
    setStepParams(get(stepData, step))
  }

  return (
    <>
      <div className="gridbox_wrap">
        <div className="grid_item">
          <div className="grid_title" style={{ cursor: 'default' }}>
            <label>CPU 소비 전력량 비교 (1대 평균)</label>
            <div className="right">
              <div className="boxtab">
                <label htmlFor="cpupower_name1">
                  <input type="radio" name="cpupower" id="cpupower_name1" value="name3" defaultChecked onClick={() => onClickTab('h')} />
                  <span>최근 1시간</span>
                </label>
                <label htmlFor="cpupower_name2">
                  <input type="radio" name="cpupower" id="cpupower_name2" value="name4" onClick={() => onClickTab('d')} />
                  <span>최근 1일</span>
                </label>
                <label htmlFor="cpupower_name3">
                  <input type="radio" name="cpupower" id="cpupower_name3" value="name5" onClick={() => onClickTab('w')} />
                  <span>최근 1주일</span>
                </label>
                <label htmlFor="cpupower_name4">
                  <input type="radio" name="cpupower" id="cpupower_name4" value="name6" onClick={() => onClickTab('m')} />
                  <span>최근 1달</span>
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
                      <h5>ARM</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap data-r">
                        <p><i className="ico-type24-powericon"></i> <span className="em">{(isNaN(x86PowerPercent) || isFinite(x86PowerPercent)) ? 0 : x86PowerPercent}</span> <span className="unit">W</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="graph_wrap">
                    <div className="graph_bar">
                      <div className="bar animate-bar" style={{ width: `${(isNaN(x86PowerPercent) || isFinite(x86PowerPercent)) ? 0 : x86PowerPercent}%` }}></div>
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
                        <p><i className="ico-type24-powericon"></i> <span className="em">{(isNaN(armPowerPercent) || isFinite(armPowerPercent)) ? 0 : armPowerPercent}</span> <span className="unit">W</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="graph_wrap">
                    <div className="graph_bar">
                      <div className="bar second animate-bar" style={{ width: `${(isNaN(armPowerPercent) || isFinite(armPowerPercent)) ? 0 : armPowerPercent}%` }}></div>
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
