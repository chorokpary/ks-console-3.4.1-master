import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

import * as common from 'utils/resources'
import { cloneDeep, get, omit, find } from 'lodash'
import { getLocalTime } from 'utils'

import CustomStore from 'stores/monitoring/custom/monitor'
import BareMetalStore from 'stores/resources/baremetal'

const Carbon = (props) => {

  const customStore = new CustomStore();
  const bareMetalStore = new BareMetalStore();

  const [serverTotalCount, setServerTotalCount] = useState(0)
  const [armServerCount, setArmServerCount] = useState(0)
  const [x86ServerCount, setX86ServerCount] = useState(0)

  const [useKwh, setUseKwh] = useState(0)
  const [armKwh, setArmKwh] = useState(0)
  const [x86Kwh, setX86Kwh] = useState(0)

  const [useCo2, setUseCo2] = useState(0)
  const [armCo2, setArmCo2] = useState(0)
  const [x86Co2, setX86Co2] = useState(0)

  const [useTree, setUseTree] = useState(0)
  const [armTree, setArmTree] = useState(0)
  const [x86Tree, setX86Tree] = useState(0)

  const [usePrice, setUsePrice] = useState(0)
  const [armPrice, setArmPrice] = useState(0)
  const [x86Price, setX86Price] = useState(0)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    let timer = setTimeout(() => { fetchData() }, 2000);
    return () => { clearTimeout(timer) }
  }, [])

  // 7일 기간
  const getTimeRange = ({ step = '3600s', times = 24, days=7 } = {}) => {
    const interval = parseFloat(step) * times * days
    const end = Math.floor(Date.now() / 1000)
    const start = Math.floor(end - interval)

    const start_year = (new Date(start*1000)).getFullYear();
    const start_month = (new Date(start*1000)).getMonth() + 1;
    const start_date = (new Date(start*1000)).getDate();

    const end_year = (new Date(end*1000)).getFullYear();
    const end_month = (new Date(end*1000)).getMonth() + 1;
    const end_date = (new Date(end*1000)).getDate();
  
    const startDate = `${start_year}-${start_month >= 10 ? start_month : '0' + start_month}-${start_date >= 10 ? start_date : '0' + start_date}`
    const endDate = `${end_year}-${end_month >= 10 ? end_month : '0' + end_month}-${end_date >= 10 ? end_date : '0' + end_date}`

    return { start, end, startDate, endDate }
  }

  const fetchData = async () => {

    const { data } = props.store.list;

    // node list
    const nodeList = await bareMetalStore.fetchList({ limit: 1000 })

    const timeRange = getTimeRange(paramsData)

    setStartDate(timeRange.startDate)
    setEndDate(timeRange.endDate)

    // 1시간 간격 
    const paramsData = {
      step: (1 * 3600) + 's',
      //times: 72,
      start: timeRange.start,
      end: timeRange.end
    }

    let promql_node_list = []
    nodeList.map((obj) => {
      promql_node_list.push(get(obj, 'name'))
    })

    const metric_type = await customStore.fetchMetric({
      expr: `group by(instance, machine) (node_uname_info{nodename=~"${promql_node_list.join('|')}"})`,
      ...props.match.params
    })

    const metric_power = await customStore.fetchMetric({
      expr: `sum by(target) (redfish_chassis_power_powersupply_last_power_output_watts)`,
      ...props.match.params,
      ...paramsData
    })

    let total_power = 0;
    let total_x86_power = 0;
    let total_arm_power = 0;

    let total_x86_count = 0;
    let total_arm_count = 0;

    await data.map(async (obj) => {
      const instance = obj.system_type == "C" ? obj.name : obj.nodeExporter.ip;
      const target = obj.openBMC?.address;

      const type_data = metric_type.find(item => (get(item, 'metric.instance').split(":")[0] === instance))
      const type = get(type_data, 'metric.machine', '')
      const x86Array = ['x86_64', 'amd']
      const armArray = ['arm', 'aarch64']

      if (x86Array.includes(type.toLowerCase())) total_x86_count++;
      if (armArray.includes(type.toLowerCase())) total_arm_count++;

      const power_data = metric_power.find(item => (get(item, 'metric.target') === target))
      const power = Number(get(power_data, 'values[0][1]', 0)) / 1000;

      let instance_total_power = 0;
      let values_count = 1;
      if(power > 0 ){
        const values = power_data.values;
        values_count = power_data.values.length;
        await values.map((item) => {
          instance_total_power += Number(item[1])
        })
      }

      const power_wh = Number(instance_total_power) / 1000;
      // console.log("power_data : "+ JSON.stringify(power_data?.values))
      // console.log("instance_total_power "+target+ ": "+ instance_total_power)
      // console.log("values_count "+target+ ": "+ values_count)
      // console.log("type : "+ type)
      // console.log("power_wh : "+ power_wh)
      if (x86Array.includes(type.toLowerCase())) {
        total_x86_power += power_wh;
        total_power += power_wh;
      }
      if (armArray.includes(type.toLowerCase())) {
        total_arm_power += power_wh;
        total_power += power_wh;
      }

    })

    setServerTotalCount(total_arm_count + total_x86_count)
    setArmServerCount(total_arm_count)
    setX86ServerCount(total_x86_count)

    // 전기 사용량
    setUseKwh(total_power > 1000 ? common.fnAddCommar(total_power) : total_power.toFixed(1))
    setArmKwh(total_arm_power > 1000 ? common.fnAddCommar(total_arm_power) : total_arm_power.toFixed(1))
    setX86Kwh(total_x86_power > 1000 ? common.fnAddCommar(total_x86_power) : total_x86_power.toFixed(1))

    // CO2 발생량
    setUseCo2((total_power * 0.4781).toFixed(1))
    setArmCo2((total_arm_power * 0.4781).toFixed(1))
    setX86Co2((total_x86_power * 0.4781).toFixed(1))

    // 필요소나무
    setUseTree((total_power * 0.1157625).toFixed(1))
    setArmTree((total_arm_power * 0.1157625).toFixed(1))
    setX86Tree((total_x86_power * 0.1157625).toFixed(1))

    // 금액
    const armPrice = Math.round(total_arm_power * 111.16);
    const x86Price = Math.round(total_x86_power * 111.16);
    const totalPrice = Number(armPrice) + Number(x86Price)

    setUsePrice(totalPrice > 1000 ? common.fnAddCommar(totalPrice) : totalPrice)
    setArmPrice(armPrice > 1000 ? common.fnAddCommar(armPrice) : armPrice)
    setX86Price(x86Price > 1000 ? common.fnAddCommar(x86Price) : x86Price)

  }

  return (
    <>
      <div className="gridbox_wrap">
        <div className="grid_item">
          <div className="grid_title">
            <label>{t('RESOURCES_CARBON_INDICATOR')} {!!startDate && `(${startDate} ~ ${endDate})`}</label>
            {/* <!--<i className="ico-btn-trash"></i>--> */}
          </div>
          <div className="grid_info style_list">
            {/* <!-- // select_wrap --> */}
            <ul className="list_02">
              <li className="li_type_02">
                <div className="lft">
                  <i className="ico-type-bmcnode"></i>
                </div>
                <div className="rgt">
                  <div className="value">{serverTotalCount}<span>{t('RESOURCES_DAE')}</span></div>
                  <dl><dt>{t('RESOURCES_ARM')}</dt><dd>{armServerCount}</dd></dl>
                  <dl><dt>{t('RESOURCES_X86')}</dt><dd>{x86ServerCount}</dd></dl>
                </div>
              </li>
              <li className="li_type_02">
                <div className="lft">
                  <i className="ico-type-power"></i>
                </div>
                <div className="rgt">
                  <div className="value">{(Number(armKwh)+Number(x86Kwh)).toFixed(1)}<span>kWh</span></div>
                  <dl><dt>{t('RESOURCES_ARM')}</dt><dd>{armKwh}</dd></dl>
                  <dl><dt>{t('RESOURCES_X86')}</dt><dd>{x86Kwh}</dd></dl>
                </div>
              </li>
              <li className="li_type_02">
                <div className="lft">
                  <i className="ico-type-co2"></i>
                </div>
                <div className="rgt">
                  <div className="value">{useCo2}<span>KG</span></div>
                  <dl><dt>{t('RESOURCES_ARM')}</dt><dd>{armCo2}</dd></dl>
                  <dl><dt>{t('RESOURCES_X86')}</dt><dd>{x86Co2}</dd></dl>
                </div>
              </li>
              <li className="li_type_02">
                <div className="lft">
                  <i className="ico-type-tree"></i>
                </div>
                <div className="rgt">
                  <div className="value">{useTree}<span>{t('RESOURCES_TREE')}</span></div>
                  <dl><dt>{t('RESOURCES_ARM')}</dt><dd>{armTree}</dd></dl>
                  <dl><dt>{t('RESOURCES_X86')}</dt><dd>{x86Tree}</dd></dl>
                </div>
              </li>
              <li className="li_type_02">
                <div className="lft">
                  <i className="ico-type-money"></i>
                </div>
                <div className="rgt">
                  <div className="value">{usePrice}<span>{t('RESOURCES_WON')}</span></div>
                  <dl><dt>{t('RESOURCES_ARM')}</dt><dd>{armPrice}</dd></dl>
                  <dl><dt>{t('RESOURCES_X86')}</dt><dd>{x86Price}</dd></dl>
                </div>
              </li>
            </ul>

          </div>
        </div>
      </div>
    </>
  )
}

export default Carbon