import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import * as common from 'utils/resources'

const CarbonCost = ({ x, y, w, h,
  armCost, x86Cost, loading
}) => {

  {/* 1대 평균 기준 22232 원  */ }
  const [maxUsage, setMaxUsage] = useState(22232)
  const [arm, setArm] = useState(0)
  const [x86, setX86] = useState(0)
  const [armBar, setArmBar] = useState(0)
  const [x86Bar, setX86Bar] = useState(0)

  useEffect(() => {
    if (!isNaN(armCost)) {
      setArm(armCost)
      setArmBar(armCost / maxUsage * 100)
    }
  }, [armCost])

  useEffect(() => {
    if (!isNaN(x86Cost)) {
      setX86(x86Cost)
      setX86Bar(x86Cost / maxUsage * 100)
    }
  }, [x86Cost])


  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_CARBON_FOOTPRINT')} - {t('RESOURCES_COST')} ({t('RESOURCES_ONE_TO_AVERAGE')})</label>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_chart_2">
                <div className="box type_chart">
                  <div className="cont4">
                    <div className="bar_value">
                      <dl className="rgt">
                        <dt>ARM</dt><dd>{common.fnAddCommar(arm)} {t('RESOURCES_WON')}</dd>
                      </dl>
                      <dl>
                        <dt>x86</dt><dd>{common.fnAddCommar(x86)} {t('RESOURCES_WON')}</dd>
                      </dl>
                    </div>
                    <div className="bar_chart">
                      <div className="graph_wrap">
                        <div className="graph_bar rgt">
                          <div className="bar animate-bar" style={{ width: armBar + '%' }}></div>
                        </div>
                      </div>
                      <div className="center_icon"><i className="ico-type-money"></i></div>
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

export default CarbonCost