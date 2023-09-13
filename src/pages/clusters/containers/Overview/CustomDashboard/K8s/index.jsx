import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const K8s = () => {

  return (
    <>
      <div className="grid-stack-item" gs-x="7" gs-y="0" gs-w="2" gs-h="4">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>쿠버네티스</label>

            </div>
            <div className="grid_info style_status">
              <div className="box type_status">
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <i className="ico ico-type-container"></i>
                      <p><span className="em">4</span> / 9</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status waiting"><span>Waiting</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">4</div>
                      <p className="status running"><span>Running</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status completed"><span>Completed</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status error"><span>Error</span></p>
                    </div>
                  </div>
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

export default K8s