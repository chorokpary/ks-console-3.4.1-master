import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const Issue = () => {

  return (
    <>
      <div className="grid-stack-item" gs-x="9" gs-y="17" gs-w="3" gs-h="9">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>이슈</label>

            </div>
            <div className="grid_info style_list">
              {/* // select_wrap */}
              <ul className="list_01">
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-info-warning"></i>
                    <h6 className="list_title">
                      worker02 노드의 사용량을 추가하십시오.
                      <span>2023-08-23</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_node">노드</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-info-warning"></i>
                    <h6 className="list_title">
                      1개의 노드가 새로운 Pod를 예약할 수 없습니다.
                      <span>2023-08-23</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_pod">Pod</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-info-warning"></i>
                    <h6 className="list_title">
                      abcnavme이 설치 종료되었습니다.
                      <span>2023-08-21</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_container">쿠버네티스</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-info-warning-2"></i>
                    <h6 className="list_title">
                      pod_avme이 준비 상태입니다.
                      <span>2023-08-20</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_vm">가상머신</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-info-warning"></i>
                    <h6 className="list_title">
                      worker02 노드의 메모리 사용량을 추가하십시오.
                      <span>2023-08-16</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_vm">가상머신</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-info-warning"></i>
                    <h6 className="list_title">
                      worker02 노드의 사용량을 추가하십시오.
                      <span>2023-08-14</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_vm">가상머신</span>
                  </div>
                </li>
              </ul>

              {/* <div className="grid_text">
   <span>데이터가 없습니다.</span>
  </div> */}
            </div>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default Issue