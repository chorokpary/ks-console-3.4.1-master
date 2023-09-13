import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const K8sStatus = () => {

  return (
    <>
      <div className="grid-stack-item" gs-x="4" gs-y="16" gs-w="5" gs-h="5">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>쿠버네티스 컴포넌트 상태</label>
              <div className="right">

              </div>
            </div>
            <div className="grid_info style_status box_nth_wrap">
              <div className="box type_component selected">
                <h5><i className="ico ico-type-kubernetes-component"></i>Kubeproxy</h5>
                <div className="status_box">
                  <p className="status_active">3</p>
                  <p className="status_inactive">0</p>
                  {/* <p className="status_error">1</p> */}
                </div>
                <div className="box_pop">
                  <h6>Kubeproxy</h6>
                  <div className="status_wrap">
                    <p className="status active"><span>Worker1</span></p>
                  </div>
                  <div className="status_wrap">
                    <p className="status inactive"><span>Worker2</span></p>
                  </div>
                  <div className="status_wrap">
                    <p className="status error"><span>Master</span></p>
                  </div>
                </div>
              </div>
              <div className="box type_component">
                <h5><i className="ico ico-type-kubernetes-component"></i>coreDNS</h5>
                <div className="status_box">
                  <p className="status_active">3</p>
                  <p className="status_inactive">0</p>
                  {/* <p className="status_error">1</p> */}
                </div>
              </div>
              <div className="box type_component">
                <h5><i className="ico ico-type-kubernetes-component"></i>Kubelet</h5>
                <div className="status_box">
                  <p className="status_active">3</p>
                  <p className="status_inactive">0</p>
                  {/* <p className="status_error">1</p> */}
                </div>
              </div>
              <div className="box type_component">
                <h5><i className="ico ico-type-kubernetes-component"></i>kube-scheduler</h5>
                <div className="status_box">
                  <p className="status_active">3</p>
                  <p className="status_inactive">0</p>
                  {/* <p className="status_error">1</p> */}
                </div>
              </div>
              <div className="box type_component">
                <h5><i className="ico ico-type-kubernetes-component"></i>kube-scheduler</h5>
                <div className="status_box">
                  <p className="status_active">3</p>
                  <p className="status_inactive">0</p>
                  {/* <p className="status_error">1</p> */}
                </div>
              </div>
              <div className="box type_component">
                <h5><i className="ico ico-type-kubernetes-component"></i>kube-controller-manager</h5>
                <div className="status_box">
                  <p className="status_active">3</p>
                  <p className="status_inactive">0</p>
                  {/* <p className="status_error">1</p> */}
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

export default K8sStatus