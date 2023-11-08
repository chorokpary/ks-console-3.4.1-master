import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

import * as common from 'utils/resources'
import { cloneDeep, get, omit, find } from 'lodash'

import CustomStore from 'stores/monitoring/custom/monitor'

const Carbon = (props) => {

  const customStore = new CustomStore();

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


  useEffect(() => {
    let timer = setTimeout(()=>{ fetchData() }, 2000);
    return ()=>{ clearTimeout(timer) }
  }, [])

  const fetchData = async () => {
    
    const { data } = props.store.list;

    const metric_type = await customStore.fetchMetric({
      expr: `max by(instance, machine) (node_uname_info)`,
    })

    const metric_power = await customStore.fetchMetric({
      expr: `avg by(instance) (redfish_chassis_power_powersupply_last_power_output_watts)`,
    })

    let total_power = 0;
    let total_x86_power = 0;
    let total_arm_power = 0;

    let total_x86_count = 0;
    let total_arm_count = 0;

    await data.map((obj) => {   
      const type_data = metric_type.find(item => (get(item, 'metric.instance').split(":")[0] === obj.ip))
      const type = get(type_data, 'metric.machine','')
      const x86Array = ['x86_64', 'amd']     

      x86Array.includes(type.toLowerCase()) ? total_x86_count += 1 : total_arm_count += 1;

      const power_data = metric_power.find(item => (get(item, 'metric.instance').split(":")[0] === obj.ip))
      const power = Number(get(power_data, 'value[1]', 0)) / 1000;

      total_power += power;
      x86Array.includes(type.toLowerCase()) ? total_x86_power += power : total_arm_power += power;
    })

    setServerTotalCount(total_arm_count + total_x86_count)
    setArmServerCount(total_arm_count)
    setX86ServerCount(total_x86_count)

    // 전기 사용량
    setUseKwh(common.fnAddCommar(total_power))
    setArmKwh(common.fnAddCommar(total_arm_power))
    setX86Kwh(common.fnAddCommar(total_x86_power))

    // CO2 발생량
    setUseCo2((Math.round((total_power  * 0.4781) / 0.1)*0.1).toFixed(1))
    setArmCo2((Math.round((total_arm_power  * 0.4781) / 0.1)*0.1).toFixed(1))
    setX86Co2((Math.round((total_x86_power  * 0.4781) / 0.1)*0.1).toFixed(1))

    // 필요소나무
    setUseTree((Math.round((total_power * 0.1157625)/0.1)*0.1).toFixed(1))
    setArmTree((Math.round((total_arm_power * 0.1157625)/0.1)*0.1).toFixed(1))
    setX86Tree((Math.round((total_x86_power * 0.1157625)/0.1)*0.1).toFixed(1))
    
    // 금액
    const armPrice = Math.round(total_arm_power * 111.16);
    const x86Price = Math.round(total_x86_power * 111.16);

    setUsePrice(common.fnAddCommar(Number(armPrice) + Number(x86Price)))
    setArmPrice(common.fnAddCommar(armPrice))
    setX86Price(common.fnAddCommar(x86Price))

  }

    return (
        <>
           <div className="gridbox_wrap">
              <div className="grid_item">
                <div className="grid_title">
                    <label>탄소 지표 (2023.10)</label>
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
                      <div className="value">{serverTotalCount}<span>대</span></div>
                      <dl><dt>ARM</dt><dd>{armServerCount}</dd></dl>
                      <dl><dt>x86</dt><dd>{x86ServerCount}</dd></dl>
                      </div>
                    </li>
                    <li className="li_type_02">
                      <div className="lft">
                        <i className="ico-type-power"></i>
                      </div>
                      <div className="rgt">
                      <div className="value">{useKwh}<span>kWh</span></div>
                      <dl><dt>ARM</dt><dd>{armKwh}</dd></dl>
                      <dl><dt>x86</dt><dd>{x86Kwh}</dd></dl>
                      </div>
                    </li>
                    <li className="li_type_02">
                      <div className="lft">
                        <i className="ico-type-co2"></i>
                      </div>
                      <div className="rgt">
                      <div className="value">{useCo2}<span>KG</span></div>
                      <dl><dt>ARM</dt><dd>{armCo2}</dd></dl>
                      <dl><dt>x86</dt><dd>{x86Co2}</dd></dl>
                      </div>
                    </li>
                    <li className="li_type_02">
                      <div className="lft">
                        <i className="ico-type-tree"></i>
                      </div>
                      <div className="rgt">
                      <div className="value">{useTree}<span>그루</span></div>
                      <dl><dt>ARM</dt><dd>{armTree}</dd></dl>
                      <dl><dt>x86</dt><dd>{x86Tree}</dd></dl>
                      </div>
                    </li>
                    <li className="li_type_02">
                      <div className="lft">
                        <i className="ico-type-money"></i>
                      </div>
                      <div className="rgt">
                      <div className="value">{usePrice}<span>원</span></div>
                      <dl><dt>ARM</dt><dd>{armPrice}</dd></dl>
                      <dl><dt>x86</dt><dd>{x86Price}</dd></dl>
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