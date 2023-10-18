import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const ComputingNetwork = () => {
  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="21" gs-w="9" gs-h="4">
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title">
              <label>컴퓨팅 네트워크 현황</label>
              <div className="right">
                {/* <i className="ico-btn-trash"></i> */}
              </div>
            </div>
            <div className="grid_info style_status box_nth">

              <div className="box type_status">
                <h5><i className="ico-type24-loadbalancer"></i>로드밸런서</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">4</span> / 5</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">4</div>
                      <p className="status used"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status unused"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-floatingip"></i>플로팅 IP</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">2</span> / 3</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status used"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status unused"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-security"></i>보안그룹</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">2</span> / 3</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status used"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status unused"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-router"></i>가상라우터</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">8</span></p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">7</div>
                      <p className="status internal"><span>Internal</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status external"><span>External</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-network"></i>네트워크</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">5</span></p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">4</div>
                      <p className="status internal"><span>Internal</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status external"><span>External</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico-type24-soriv"></i>SR-IOV 네트워크</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">8</span></p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">7</div>
                      <p className="status internal"><span>Internal</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status external"><span>External</span></p>
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

export default ComputingNetwork