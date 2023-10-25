import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

import * as common from 'utils/resources'

const Carbon = () => {

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

    const armServerCount = 12;
    const x86ServerCount = 12;

    setServerTotalCount(armServerCount + x86ServerCount)
    setArmServerCount(armServerCount)
    setX86ServerCount(x86ServerCount)

    const armKwh = 700;
    const x86Kwh = 300;

    const totalKwh = armKwh + x86Kwh;

    // 전기 사용량
    setUseKwh(common.fnAddCommar(totalKwh))
    setArmKwh(armKwh);
    setX86Kwh(x86Kwh);

    // CO2 발생량
    setUseCo2((Math.round((totalKwh * 0.4781) / 0.1) * 0.1).toFixed(1))
    setArmCo2((Math.round((armKwh * 0.4781) / 0.1) * 0.1).toFixed(1))
    setX86Co2((Math.round((x86Kwh * 0.4781) / 0.1) * 0.1).toFixed(1))

    // // 필요소나무
    // setUseTree((Math.round(((imsiKwh * 0.4781) / 4.13)/0.1)*0.1).toFixed(1))
    // setArmTree((Math.round(((armKwh * 0.4781) / 4.13)/0.1)*0.1).toFixed(1))
    // setX86Tree((Math.round(((x86Kwh * 0.4781) / 4.13)/0.1)*0.1).toFixed(1))
    setUseTree((Math.round((totalKwh * 0.1157625) / 0.1) * 0.1).toFixed(1))
    setArmTree((Math.round((armKwh * 0.1157625) / 0.1) * 0.1).toFixed(1))
    setX86Tree((Math.round((x86Kwh * 0.1157625) / 0.1) * 0.1).toFixed(1))

    const armPrice = 3000000;
    const x86Price = 2000000;

    setUsePrice(common.fnAddCommar(armPrice + x86Price))
    setArmPrice(common.fnAddCommar(armPrice))
    setX86Price(common.fnAddCommar(x86Price))

  }, [])

  return (
    <>
      <div className="gridbox_wrap">
        <div className="grid_item">
          <div className="grid_title" style={{ cursor: 'default' }}>
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