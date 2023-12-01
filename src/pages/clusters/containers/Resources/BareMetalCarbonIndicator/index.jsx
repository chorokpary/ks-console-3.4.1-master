import React, { useEffect, useReducer, useState } from 'react'

import Banner from 'components/Cards/Banner'
import { Checkbox } from '@kube-design/components'
import { get, isEmpty } from 'lodash'
import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { Card } from 'components/Base'
import { getAreaChartOps } from 'utils/monitoring'
import { getMinuteValue, getTimeRange } from 'stores/monitoring/base'
import { SimpleArea } from 'components/Charts'
import CustomStore from 'stores/monitoring/custom/monitor'

import styles from './index.scss'

const BareMetalCarbonIndicator = () => {

  const customStore = new CustomStore();

  const [loading, setLoading] = useState(false);
  const [armPowerData, setArmPowerData] = useState([]);
  const [x86PowerData, setX86PowerData] = useState([]);
  const [armActive, setArmActive] = useReducer(armActive => !armActive, true)
  const [x86Active, setX86Active] = useReducer(x86Active => !x86Active, true)

  const [checkboxWidth, setCheckboxWidth] = useState('340px')

  useEffect(() => {
    fetchData({ step: '2m', times: 50 })
  }, [])

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
    let width = document.querySelector('.src-components-Cards-Monitoring-Controller-index__operations') ? document.querySelector('.src-components-Cards-Monitoring-Controller-index__operations').clientWidth : 340
    setCheckboxWidth((width + 10) + 'px')

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

    const x86PowerArray = [x86PowerMetricData];
    const armPowerArray = [armPowerMetricData];

    setX86PowerData(x86PowerArray)
    setArmPowerData(armPowerArray)

    setLoading(false)
  }

  const getMonitoringCfgs = (data) => {
    const arr = [
      {
        type: 'utilisation',
        title: t('RESOURCES_POWER_USAGE'),
        legend: [t('RESOURCES_POWER_USAGE')],
        unit: 'carbonPower',
        unitTxt: 'kWh',
        data,
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_CO2_EMISSIONS'),
        legend: [t('RESOURCES_CO2_EMISSIONS')],
        unit: 'carbonCo2',
        unitTxt: 'Kg',
        dat: 1,
        data,
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_POWER_USAGE_FEE'),
        legend: [t('RESOURCES_POWER_USAGE_FEE')],
        unit: 'carbonCost',
        unitTxt: t('RESOURCES_WON'),
        dat: 0,
        data,
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_NEED_TO_TREE'),
        legend: [t('RESOURCES_NEED_TO_TREE')],
        unit: 'carbonTree',
        unitTxt: t('RESOURCES_TREE'),
        dat: 1,
        data,
      },
    ]


    return arr
  }

  return (
    <>
      <Banner
        icon="linechart"
        title={t('RESOURCES_BAREMETAL_CARBON_INDICATOR_STATISTICS')}
        description={t('RESOURCES_BAREMETAL_CARBON_INDICATOR_STATISTICS_DESC')}
      // description={t('MONITORING_CLUSTER_DESC')}
      // routes={this.routes}
      />

      <MonitoringController
        title={t('RESOURCES_CARBON_INDICATOR_STATISTICS')}
        onFetch={fetchData}
        loading={loading}
      // refreshing={isRefreshing}
      >
        <div style={{
          position: 'absolute',
          top: '-35px',
          right: checkboxWidth
        }}>
          <Checkbox checked={armActive} onClick={() => setArmActive()}>ARM</Checkbox>
          <Checkbox checked={x86Active} onClick={() => setX86Active()}>x86</Checkbox>
        </div>

        {armActive &&
          <Card
            title={'ARM'}
            empty={t('NO_MONITORING_DATA')}
            isEmpty={!armPowerData[0]}
          >
            <div className={styles.content}>
              {getMonitoringCfgs(armPowerData).map(item => {
                const config = getAreaChartOps(item)

                if (isEmpty(config.data)) return null

                return (
                  <div key={'arm' + item.title} className={styles.box}>
                    <SimpleArea width="100%" height={190} {...config} unit={item.unitTxt} />
                  </div>
                )
              })}
            </div>
          </Card>
        }
        {x86Active &&
          <Card
            title={'x86'}
            empty={t('NO_MONITORING_DATA')}
            isEmpty={!x86PowerData[0]}
          >
            <div className={styles.content}>
              {getMonitoringCfgs(x86PowerData).map(item => {
                const config = getAreaChartOps(item)

                if (isEmpty(config.data)) return null

                return (
                  <div key={'x86' + item.title} className={styles.box}>
                    <SimpleArea width="100%" height={190} {...config} unit={item.unitTxt} />
                  </div>
                )
              })}
            </div>
          </Card>
        }
      </MonitoringController>
    </>
  )
}

export default BareMetalCarbonIndicator