import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const ResourcesUsage = () => {

  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="4" gs-w="9" gs-h="6">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>리소스 사용량</label>
              <div className="right">
                <div className="dash_boxtab">
                  <label htmlFor="name2_1">
                    <input type="radio" name="box-tab" id="name2_1" value="name3" defaultChecked />
                    <span>노드</span>
                  </label>
                  <label htmlFor="name2_2">
                    <input type="radio" name="box-tab" id="name2_2" value="name4" />
                    <span>Pod</span>
                  </label>
                  <label htmlFor="name2_3">
                    <input type="radio" name="box-tab" id="name2_3" value="name5" />
                    <span>가상머신</span>
                  </label>
                  <label htmlFor="name2_4">
                    <input type="radio" name="box-tab" id="name2_4" value="name6" />
                    <span>쿠버네티스</span>
                  </label>
                </div>

              </div>
            </div>
            <div className="grid_info style_chart">
              <div className="box type_chart">
                <div className="cont1">
                  <div className="chart_tab on">
                    <div className="title">
                      <i className="ico ico-big-cpu"></i>
                      <h5>CPU</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap">
                        <p><span className="em">0.7</span> / 48 <span className="unit">Cores</span></p>
                        <p>5%</p>
                      </div>
                      <div className="graph_wrap">
                        <div className="graph_bar">
                          <div className="bar animate-bar" style={{ width: "5%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chart_tab">
                    <div className="title">
                      <i className="ico ico-big-memory"></i>
                      <h5>메모리</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap">
                        <p><span className="em">9.66</span> / 21 <span className="unit">Gi</span></p>
                        <p>25%</p>
                      </div>

                      <div className="graph_wrap">
                        <div className="graph_bar">
                          <div className="bar animate-bar" style={{ width: "25%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chart_tab">
                    <div className="title">
                      <i className="ico ico-big-disk"></i>
                      <h5>디스크</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap">
                        <p><span className="em">85.64</span> / 318.21 <span className="unit">GB</span></p>
                        <p>15%</p>
                      </div>
                      <div className="graph_wrap">
                        <div className="graph_bar">
                          <div className="bar animate-bar" style={{ width: "15%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cont2">
                  <div className="chart_01"></div>
                </div>
              </div>
            </div>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default ResourcesUsage