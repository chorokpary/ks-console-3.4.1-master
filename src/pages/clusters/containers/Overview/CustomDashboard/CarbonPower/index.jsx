import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const CarbonPower = () => {

  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="46" gs-w="5" gs-h="3">
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title">
              <label>탄소 발자국 - 전력 사용량</label>
            </div>
            <div className="grid_info style_chart_2">
              <div className="box type_chart">
                <div className="cont4">
                  <div className="bar_value">
                    <dl className="rgt">
                      <dt>ARM</dt><dd>5,000.0 kWh</dd>
                    </dl>
                    <dl>
                      <dt>x86</dt><dd>6,000.0 kWh</dd>
                    </dl>
                  </div>
                  <div className="bar_chart">
                    <div className="graph_wrap">
                      <div className="graph_bar rgt">
                        <div className="bar animate-bar" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                    <div className="center_icon"><i className="ico-type-power"></i></div>
                    <div className="graph_wrap">
                      <div className="graph_bar">
                        <div className="bar second animate-bar" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CarbonPower