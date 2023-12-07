import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import * as common from 'utils/resources'

const CarbonPower = ({ x, y, w, h,
  armUsage,
  x86Usage,
  loading
}) => {

  {/* 1대 평균 기준 200kwh  */ }
  const [maxUsage, setMaxUsage] = useState(200)
  const [arm, setArm] = useState(0)
  const [x86, setX86] = useState(0)
  const [armBar, setArmBar] = useState(0)
  const [x86Bar, setX86Bar] = useState(0)

  useEffect(() => {
    if (!isNaN(armUsage)) {
      setArm(armUsage)
      setArmBar(armUsage / maxUsage * 100)
    }
  }, [armUsage])

  useEffect(() => {
    if (!isNaN(x86Usage)) {
      setX86(x86Usage)
      setX86Bar(x86Usage / maxUsage * 100)
    }
  }, [x86Usage])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_CARBON_FOOTPRINT')} - {t('RESOURCES_POWER_USAGE')}</label>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_chart_2">
                <div className="box type_chart">
                  <div className="cont4">
                    <div className="bar_value">
                      <dl className="rgt">
                        <dt>ARM</dt><dd>{common.fnAddCommar(arm.toFixed(2))} kWh</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt><dd>{common.fnAddCommar(x86.toFixed(2))} kWh</dd>
                      </dl>
                    </div>
                    <div className="bar_chart">
                      <div className="graph_wrap">
                        <div className="graph_bar rgt">
                          <div className="bar animate-bar" style={{ width: armBar + '%' }}></div>
                        </div>
                      </div>
                      <div className="center_icon"><i className="ico-type-power"></i></div>
                      <div className="graph_wrap">
                        <div className="graph_bar">
                          <div className="bar second animate-bar" style={{ width: x86Bar + '%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Loading>
          </div>
        </div>
      </div>
    </>
  )
}

export default CarbonPower