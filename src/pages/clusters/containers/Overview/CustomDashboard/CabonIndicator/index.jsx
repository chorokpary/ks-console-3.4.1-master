import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import CustomStore from 'stores/monitoring/custom/monitor'

const CabonIndicator = ({ x, y, w, h }) => {

  const customStore = new CustomStore();

  useEffect(() => {

    var currentTime = Math.floor(Date.now() / 1000);
    const asd = async () => {
      const qq = await customStore.fetchMetric({
        expr: `avg by ( job) (redfish_chassis_power_powersupply_last_power_output_watts)`,
        start: currentTime,
        end: currentTime,
      })
      console.log('qq : ', qq)
    };
    asd();
  }, [])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>탄소 지표 (2023.10)</label>
              {/*<i className="ico-btn-trash"></i>*/}
            </div>
            <div className="grid_info style_list">
              {/* // select_wrap */}
              <ul className="list_02">
                <li className="li_type_02">
                  <div className="lft">
                    <i className="ico-type-bmcnode"></i>
                  </div>
                  <div className="rgt">
                    <div className="value">24<span>대</span></div>
                    <dl>
                      <dt>ARM</dt>
                      <dd>12</dd>
                    </dl>
                    <dl>
                      <dt>x86</dt>
                      <dd>12</dd>
                    </dl>
                  </div>
                </li>
                <li className="li_type_02">
                  <div className="lft">
                    <i className="ico-type-power"></i>
                  </div>
                  <div className="rgt">
                    <div className="value">1,200.0<span>kWh</span></div>
                    <dl>
                      <dt>ARM</dt>
                      <dd>700</dd>
                    </dl>
                    <dl>
                      <dt>x86</dt>
                      <dd>500</dd>
                    </dl>
                  </div>
                </li>
                <li className="li_type_02">
                  <div className="lft">
                    <i className="ico-type-co2"></i>
                  </div>
                  <div className="rgt">
                    <div className="value">5,000.0<span>KG</span></div>
                    <dl>
                      <dt>ARM</dt>
                      <dd>3,000</dd>
                    </dl>
                    <dl>
                      <dt>x86</dt>
                      <dd>2,000</dd>
                    </dl>
                  </div>
                </li>
                <li className="li_type_02">
                  <div className="lft">
                    <i className="ico-type-tree"></i>
                  </div>
                  <div className="rgt">
                    <div className="value">5<span>그루</span></div>
                    <dl>
                      <dt>ARM</dt>
                      <dd>3</dd>
                    </dl>
                    <dl>
                      <dt>x86</dt>
                      <dd>2</dd>
                    </dl>
                  </div>
                </li>
                <li className="li_type_02">
                  <div className="lft">
                    <i className="ico-type-money"></i>
                  </div>
                  <div className="rgt">
                    <div className="value">5,000,000<span>원</span></div>
                    <dl>
                      <dt>ARM</dt>
                      <dd>3,000,000</dd>
                    </dl>
                    <dl>
                      <dt>x86</dt>
                      <dd>2,000,000</dd>
                    </dl>
                  </div>
                </li>
              </ul>

            </div>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default CabonIndicator