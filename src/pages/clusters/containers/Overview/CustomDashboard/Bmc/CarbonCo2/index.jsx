import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import * as common from 'utils/resources'

const CarbonCo2 = ({ x, y, w, h,
  armCo2, x86Co2, loading
}) => {

  {/* 1대 평균 기준 95.6 KG  */ }
  const [maxUsage, setMaxUsage] = useState(95.6)
  const [arm, setArm] = useState(0)
  const [x86, setX86] = useState(0)
  const [armBar, setArmBar] = useState(0)
  const [x86Bar, setX86Bar] = useState(0)

  useEffect(() => {
    if (!isNaN(armCo2)) {
      setArm(armCo2)
      setArmBar(armCo2 / maxUsage * 100)
    }
  }, [armCo2])

  useEffect(() => {
    if (!isNaN(x86Co2)) {
      setX86(x86Co2)
      setX86Bar(x86Co2 / maxUsage * 100)
    }
  }, [x86Co2])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_CARBON_FOOTPRINT')} - {t('RESOURCES_CO2_EMISSIONS')}</label>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_chart_2">
                <div className="box type_chart">
                  <div className="cont4">
                    <div className="bar_value">
                      <dl className="rgt">
                        <dt>ARM</dt><dd>{common.fnAddCommar(arm)} KG</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt><dd>{common.fnAddCommar(x86)} KG</dd>
                      </dl>
                    </div>
                    <div className="bar_chart">
                      <div className="graph_wrap">
                        <div className="graph_bar rgt">
                          <div className="bar animate-bar" style={{ width: armBar + '%' }}></div>
                        </div>
                      </div>
                      <div className="center_icon"><i className="ico-type-co2"></i></div>
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

export default CarbonCo2