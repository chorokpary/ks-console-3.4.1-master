import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const CarbonCo2 = ({ x, y, w, h }) => {

  const [maxUsage, setMaxUsage] = useState(95.6)

  return (
    <>
      {/* 1대 평균 기준 95.6 KG  */}
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>탄소 발자국 - CO2 발생량</label>
            </div>
            <div className="grid_info style_chart_2">
              <div className="box type_chart">
                <div className="cont4">
                  <div className="bar_value">
                    <dl className="rgt">
                      <dt>ARM</dt><dd>5,000.0 KG</dd>
                    </dl>
                    <dl>
                      <dt>x86</dt><dd>6,000.0 KG</dd>
                    </dl>
                  </div>
                  <div className="bar_chart">
                    <div className="graph_wrap">
                      <div className="graph_bar rgt">
                        <div className="bar animate-bar" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                    <div className="center_icon"><i className="ico-type-co2"></i></div>
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

export default CarbonCo2