import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const BmcNode = ({ x, y, w, h }) => {

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>베어메탈 노드 현황</label>
              <div className="view-result">총 99건</div>
              <div className="dash_boxtab">
                <label htmlFor="name9">
                  <input type="radio" name="box-tab2" id="name9" value="name3" defaultChecked />
                  <span>전체</span>
                </label>
                <label htmlFor="name10">
                  <input type="radio" name="box-tab2" id="name10" value="name4" />
                  <span>ARM</span>
                </label>
                <label htmlFor="name11">
                  <input type="radio" name="box-tab2" id="name11" value="name5" />
                  <span>x86</span>
                </label>
              </div>
              {/* <div className="right">
              <i className="ico-btn-trash"></i>
            </div> */}
            </div>
            <div className="grid_info style_status style_node">
              <div className="box type_node">
                <div className="cont3">
                  <div className="box type_status">
                    <div className="cont_group">
                      <div className="cont1">
                        <div className="number_wrap">
                          <p><span className="em">13</span> / 18</p>
                        </div>
                      </div>
                      <div className="cont2">
                        <div className="status_wrap">
                          <div className="value">13</div>
                          <p className="status on"><span>On</span></p>
                        </div>
                        <div className="status_wrap">
                          <div className="value">4</div>
                          <p className="status off"><span>Off</span></p>
                        </div>
                        <div className="status_wrap">
                          <div className="value">1</div>
                          <p className="status error"><span>Error</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="hexagon_wrap">
                      <div className="hexagon_group">
                        <div className="hexagon"><span>ARM</span></div>
                        <div className="hexagon"><span>ARM</span></div>
                        <div className="hexagon"><span>ARM</span></div>
                        <div className="hexagon off"><span>ARM</span></div>
                        <div className="hexagon"><span>ARM</span></div>
                        <div className="hexagon off"><span>ARM</span></div>
                        <div className="hexagon"><span>ARM</span></div>
                        <div className="hexagon"><span>ARM</span></div>
                      </div>
                      <div className="hexagon_group">
                        <div className="hexagon"><span>ARM</span></div>
                        <div className="hexagon"><span>ARM</span></div>
                        <div className="hexagon"><span>ARM</span></div>
                        <div className="hexagon off"><span>ARM</span></div>
                        <div className="hexagon"><span>ARM</span></div>
                        <div className="hexagon"><span>ARM</span></div>
                      </div>
                      <div className="hexagon_group">
                        <div className="hexagon"><span>x86</span></div>
                        <div className="hexagon off"><span>x86</span></div>
                        <div className="hexagon"><span>x86</span></div>
                        <div className="hexagon error"><span>x86</span></div>
                      </div>
                    </div>
                    {/* // hexagon_wrap */}
                  </div>
                  {/* // box type_node */}
                </div>
                {/* // cont3 */}
                <div className="cont4">
                  <div className="list_02">
                    <div className="fixed_head_scroll">
                      <div className="box-radius none-shadow">
                        <table className="tbl_list">
                          <caption>네트워크 목록</caption>
                          <colgroup>
                            <col style={{ width: "auto" }} />
                            <col style={{ width: "15%" }} />
                            <col style={{ width: "18%" }} />
                            <col style={{ width: "18%" }} />
                            <col style={{ width: "15%" }} />
                          </colgroup>
                          <thead>
                            <tr>
                              <th><strong>베어메탈 노드</strong></th>
                              <th><strong>CPU</strong></th>
                              <th><strong>메모리</strong></th>
                              <th><strong>디스크</strong></th>
                              <th><strong>파워</strong></th>
                              <th><strong>온도</strong></th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* 데이터 모두 사용시 */}
                            {/*                                     <tr>
                      <td colspan="6" className="msg-text">
                          <p>데이터가 없습니다.</p>
                      </td>
                    </tr> */}
                            {/* 데이터 모두 사용시 */}
                            <tr>
                              <td className="tbl_tit">
                                <i className="ico-type24-arm"></i>
                                <p>Arm_node_01</p>
                              </td>
                              <td>
                                <p>15%</p><span>2.0 GHz</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>141 <span className="unit">Watt</span></p>
                              </td>
                              <td>
                                <p>41 <span className="unit">°C</span></p>
                              </td>
                            </tr>
                            <tr>
                              <td className="tbl_tit">
                                <i className="ico-type24-arm"></i>
                                <p>Arm_node_02</p>
                              </td>
                              <td>
                                <p>15%</p><span>2.0 GHz</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>141 <span className="unit">Watt</span></p>
                              </td>
                              <td>
                                <p>41 <span className="unit">°C</span></p>
                              </td>
                            </tr>
                            <tr>
                              <td className="tbl_tit">
                                <i className="ico-type24-arm"></i>
                                <p>Arm_node_03</p>
                              </td>
                              <td>
                                <p>15%</p><span>2.0 GHz</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>141 <span className="unit">Watt</span></p>
                              </td>
                              <td>
                                <p>41 <span className="unit">°C</span></p>
                              </td>
                            </tr>
                            <tr>
                              <td className="tbl_tit">
                                <i className="ico-type24-arm"></i>
                                <p>Arm_node_04</p>
                              </td>
                              <td>
                                <p>15%</p><span>2.0 GHz</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>141 <span className="unit">Watt</span></p>
                              </td>
                              <td>
                                <p>41 <span className="unit">°C</span></p>
                              </td>
                            </tr>
                            <tr>
                              <td className="tbl_tit">
                                <i className="ico-type24-arm"></i>
                                <p>Arm_node_05</p>
                              </td>
                              <td>
                                <p>15%</p><span>2.0 GHz</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>141 <span className="unit">Watt</span></p>
                              </td>
                              <td>
                                <p>41 <span className="unit">°C</span></p>
                              </td>
                            </tr>
                            <tr>
                              <td className="tbl_tit">
                                <i className="ico-type24-arm"></i>
                                <p>Arm_node_06</p>
                              </td>
                              <td>
                                <p>15%</p><span>2.0 GHz</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>141 <span className="unit">Watt</span></p>
                              </td>
                              <td>
                                <p>41 <span className="unit">°C</span></p>
                              </td>
                            </tr>
                            <tr>
                              <td className="tbl_tit">
                                <i className="ico-type24-arm"></i>
                                <p>Arm_node_07</p>
                              </td>
                              <td>
                                <p>15%</p><span>2.0 GHz</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>25%</p><span>232 GB / 100 GB</span>
                              </td>
                              <td>
                                <p>141 <span className="unit">Watt</span></p>
                              </td>
                              <td>
                                <p>41 <span className="unit">°C</span></p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              {/* // box type_node */}

            </div>
            {/* // grid-info */}

          </div>

        </div>
      </div>
    </>
  )
}

export default BmcNode