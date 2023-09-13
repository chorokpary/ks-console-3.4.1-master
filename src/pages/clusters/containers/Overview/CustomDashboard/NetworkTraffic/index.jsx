import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const NetworkTraffic = () => {

  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="10" gs-w="9" gs-h="6">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>네트워크 트래픽</label>
              <div className="right">
                <div className="dash_boxtab">
                  <label htmlFor="name3">
                    <input type="radio" name="box-tab1" id="name3" value="name3" defaultChecked />
                    <span>노드</span>
                  </label>
                  <label htmlFor="name4">
                    <input type="radio" name="box-tab1" id="name4" value="name4" />
                    <span>Pod</span>
                  </label>
                  <label htmlFor="name5">
                    <input type="radio" name="box-tab1" id="name5" value="name5" />
                    <span>가상머신</span>
                  </label>
                  <label htmlFor="name6">
                    <input type="radio" name="box-tab1" id="name6" value="name6" />
                    <span>쿠버네티스</span>
                  </label>
                </div>

              </div>
            </div>
            <div className="grid_info style_chart">
              <div className="box type_chart">
                <div className="cont1">
                  <div className="chart_tab no-tab">
                    <div className="title">
                      <i className="ico ico-type-outbound"></i>
                      <h5>Outbound</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap data-r">
                        <p><span className="em">2.26</span> <span className="unit">Mbps</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="chart_tab no-tab">
                    <div className="title">
                      <i className="ico ico-type-inbound"></i>
                      <h5>Inbound</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap data-r">
                        <p><span className="em">1.51</span> <span className="unit">Mbps</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cont2">
                  <div className="chart_02"></div>
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

export default NetworkTraffic