import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const RecentResource = () => {
  return (
    <>
      <div className="grid-stack-item" gs-x="9" gs-y="8" gs-w="3" gs-h="9">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>최근 생성된 리소스 (일주일)</label>

            </div>
            <div className="grid_info style_list">
              {/* // select_wrap */}
              <ul className="list_01">
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-page-list-clusternode"></i>
                    <h6 className="list_title">
                      Worker01
                      <span>2023-08-23</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_node">노드</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-page-list-pod"></i>
                    <h6 className="list_title">
                      Worker01
                      <span>2023-08-22</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_pod">Pod</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-page-list-container"></i>
                    <h6 className="list_title">
                      Worker01
                      <span>2023-08-21</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_container">쿠버네티스</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-page-list-vm"></i>
                    <h6 className="list_title">
                      Worker01
                      <span>2023-08-20</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_vm">가상머신</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-page-list-vm"></i>
                    <h6 className="list_title">
                      Worker01
                      <span>2023-08-20</span>
                    </h6>
                  </div>
                  <div className="type">
                    <span className="type_vm">가상머신</span>
                  </div>
                </li>
                <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-page-list-vm"></i>
                    <h6 className="list_title">
                      Worker01
                      <span>2023-08-20</span>
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

export default RecentResource