import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const Computing = () => {

  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="21" gs-w="9" gs-h="4">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>컴퓨팅 유형별 현황</label>
              <div className="right">

              </div>
            </div>
            <div className="grid_info style_status box_nth">

              <div className="box type_status">
                <h5><i className="ico ico-page-list-loadbalancer"></i>로드밸런서</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">4</span> / 5</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">4</div>
                      <p className="status running"><span>Active</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status waiting"><span>Inactive</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico ico-page-list-floatingip"></i>플로팅 IP</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">2</span> / 3</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status running"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status waiting"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico ico-page-list-router"></i>가상라우터</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">7</span> / 8</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">7</div>
                      <p className="status running"><span>Active</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status waiting"><span>Inactive</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico ico-page-list-security"></i>보안그룹</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">2</span> / 3</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">2</div>
                      <p className="status running"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status waiting"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico ico-page-list-network"></i>Mediated 디바이스</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">4</span> / 5</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">4</div>
                      <p className="status running"><span>Used</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status waiting"><span>Unused</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="box type_status">
                <h5><i className="ico ico-page-list-network2"></i>Host 디바이스</h5>
                <div className="cont_group">
                  <div className="cont1">
                    <div className="number_wrap">
                      <p><span className="em">7</span> / 8</p>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">7</div>
                      <p className="status running"><span>Active</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p className="status waiting"><span>Inactive</span></p>
                    </div>
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

export default Computing