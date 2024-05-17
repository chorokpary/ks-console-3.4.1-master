import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { toJS } from 'mobx'
import { cloneDeep, get, isEmpty, omit, find, remove } from 'lodash'
import { getAreaChartOps } from 'utils/monitoring'

import CustomStore from 'stores/monitoring/custom/monitor'
import { getMinuteValue, getTimeRange } from 'stores/monitoring/base'
import { CustomChart, SimpleArea } from 'components/Charts'

import styles from './index.scss'

const stepData = {
  h: { step: '6m', times: 10 },
  d: { step: '60m', times: 24 },
  w: { step: '5h', times: 33.6 },
  m: { step: '10h', times: 72 },
}

const CpuPower = ({ x, y, w, h,
  nodeData, cluster
}) => {

  const customStore = new CustomStore();

  const [stepParams, setStepParams] = useState({ step: '6m', times: 10 })

  const [loading, setLoading] = useState(false);

  const [x86CpuData, setX86CpuData] = useState([]);
  const [armCpuData, setArmCpuData] = useState([]);
  const [x86PowerData, setX86PowerData] = useState([]);
  const [armPowerData, setArmPowerData] = useState([]);
  const [x86PowerPercent, setX86PowerPercent] = useState(0);
  const [armPowerPercent, setArmPowerPercent] = useState(0);

  const [x86CpuDataJson, setX86CpuDataJson] = useState({});
  const [armCpuDataJson, setArmCpuDataJson] = useState({});
  const [x86PowerDataJson, setX86PowerDataJson] = useState({});
  const [armPowerDataJson, setArmPowerDataJson] = useState({});

  useEffect(() => {
    if (nodeData.length > 0) {
      fetchData(get(stepData, 'h'))
    }
  }, [nodeData])

  useEffect(() => {
    fetchData(stepParams);
  }, [stepParams])

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

  const getMonitoringCfgsPower = () => {
    return [
      {
        type: 'utilisation',
        title: t('RESOURCES_POWER_USAGE')+ ' (W)',
        legend: ['ARM', 'x86'],
        data: [armPowerDataJson, x86PowerDataJson],
      },
    ]
  }

  const getMonitoringCfgsCpu = () => {
    return [
      {
        type: 'utilisation',
        title: t('RESOURCES_CPU_USAGE') + ' (%)',
        legend: ['ARM', 'x86'],
        data: [armCpuDataJson, x86CpuDataJson],
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

    let promql_node_list = []
    nodeData.map((obj) => {
      promql_node_list.push(get(obj, 'name'))
    })

    const metric_type = await customStore.fetchMetric({
      expr: `group by(instance, machine) (node_uname_info{nodename=~"${promql_node_list.join('|')}"})`,
      cluster
    });

    const metric_power = await customStore.fetchMetric({
      expr: `sum by (target) (redfish_chassis_power_powersupply_last_power_output_watts)`,
      cluster,
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
    nodeData.map(async obj => {
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

    setX86PowerDataJson(x86Power)
    setArmPowerDataJson(armPower)

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
      cluster,
      ...paramsData
    })
    const metric_cpu_arm = await customStore.fetchMetric({
      expr: `sum by (machine) (rate(node_cpu_seconds_total{mode!="idle"}[5m]) * on (instance) group_left(machine) (max by(instance, machine) (node_uname_info{nodename=~"${promql_arm_names.join('|')}"})))`,
      cluster,
      ...paramsData
    })

    const x86CpuArray = [metric_cpu_x86?.[0]];
    const armCpuArray = [metric_cpu_arm?.[0]];

    setX86CpuDataJson(x86CpuArray[0])
    setArmCpuDataJson(armCpuArray[0])

    setX86CpuData(x86CpuArray)
    setArmCpuData(armCpuArray)
    // ------------------------------------------------------------------------------

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
    setStepParams(get(stepData, step))
  }

  const configs_cpu = getMonitoringCfgsCpu()
  const configs_power = getMonitoringCfgsPower()

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
                </div>
              </div>
            </div>
            <div className="grid_info style_chart_2">
              <div className="box type_chart">
                <div className={styles.divwrap}>
                  <div className={styles.div_left}>
                    {(!!!x86CpuDataJson && !!!armCpuDataJson) ?
                          <div className={styles.divwrap}>
                            <div className={styles.empty}>{t('NO_MONITORING_DATA')}</div>
                          </div>
                          :
                          configs_power.map((item, index) => {
                            const config = getAreaChartOps(item)

                            if (isEmpty(config.data)) return null
                            return (
                              <div className={styles.divwrap} key={config.title}>
                                <SimpleArea width="100%" {...config} />
                              </div>
                            )
                          })
                        }
                  </div>
                  <div className={styles.div_right}>
                      {(!!!x86CpuDataJson && !!!armCpuDataJson) ?
                        <div className={styles.divwrap}>
                          <div className={styles.empty}>{t('NO_MONITORING_DATA')}</div>
                        </div>
                        :
                        configs_cpu.map((item, index) => {
                          const config = getAreaChartOps(item)

                          if (isEmpty(config.data)) return null
                          return (
                            <div className={styles.divwrap} key={config.title}>
                              <SimpleArea width="100%" {...config} />
                            </div>
                          )
                        })
                      }
                  </div>                
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