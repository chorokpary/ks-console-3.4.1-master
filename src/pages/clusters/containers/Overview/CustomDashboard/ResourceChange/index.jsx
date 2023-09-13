import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const ResourceChange = () => {

  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="16" gs-w="4" gs-h="5">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>리소스 변화량</label>
              <div className="right">

              </div>
            </div>
            <div className="grid_info style_status box_long">
              <div className="box type_status">
                <div className="cont_group">
                  <h5><i className="ico ico-type-pod"></i>Pod</h5>
                  <div className="number_wrap">
                    <p><span className="em">12</span></p>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p><span>Created</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">0</div>
                      <p><span>Deleted</span></p>
                    </div>
                  </div>
                  <div className="chart chart_03">
                  </div>
                </div>
              </div>
            </div>
            {/*// grid_info style_status */}
            <div className="grid_info style_status box_long">
              <div className="box type_status">
                <div className="cont_group">
                  <h5><i className="ico ico-type-vm"></i>가상머신</h5>
                  <div className="number_wrap">
                    <p><span className="em">7</span></p>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p><span>Created</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">0</div>
                      <p><span>Deleted</span></p>
                    </div>
                  </div>
                  <div className="chart chart_03">
                  </div>
                </div>
              </div>
            </div>
            {/*// grid_info style_status */}
            <div className="grid_info style_status box_long">
              <div className="box type_status">
                <div className="cont_group">
                  <h5><i className="ico ico-type-container"></i>쿠버네티스</h5>
                  <div className="number_wrap">
                    <p><span className="em">1</span></p>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p><span>Created</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">0</div>
                      <p><span>Deleted</span></p>
                    </div>
                  </div>
                  <div className="chart chart_03">
                  </div>
                </div>
              </div>
            </div>
            {/*// grid_info style_status */}
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default ResourceChange