import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'

const CabonIndicator = ({ x, y, w, h,
  loading,

  serverTotalCount,
  armServerCount,
  x86ServerCount,

  useKwh,
  armKwh,
  x86Kwh,

  useCo2,
  armCo2,
  x86Co2,

  useTree,
  armTree,
  x86Tree,

  usePrice,
  armPrice,
  x86Price,
}) => {

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>탄소 지표 ({getLocalTime(Date.now()).format('YYYY.MM')})</label>
              {/*<i className="ico-btn-trash"></i>*/}
            </div>
            <div className="grid_info style_list">
              {/* // select_wrap */}
              <Loading spinning={loading}>
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
                      <div className="value">{useKwh > 1000 ? common.fnAddCommar(useKwh) : useKwh.toFixed(1)}<span>kWh</span></div>
                      <dl><dt>ARM</dt><dd>{armKwh > 1000 ? common.fnAddCommar(armKwh) : armKwh.toFixed(1)}</dd></dl>
                      <dl><dt>x86</dt><dd>{x86Kwh > 1000 ? common.fnAddCommar(x86Kwh) : x86Kwh.toFixed(1)}</dd></dl>
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
                      <div className="value">{common.fnAddCommar(usePrice)}<span>원</span></div>
                      <dl><dt>ARM</dt><dd>{common.fnAddCommar(armPrice)}</dd></dl>
                      <dl><dt>x86</dt><dd>{common.fnAddCommar(x86Price)}</dd></dl>
                    </div>
                  </li>
                </ul>
              </Loading>
            </div>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default CabonIndicator