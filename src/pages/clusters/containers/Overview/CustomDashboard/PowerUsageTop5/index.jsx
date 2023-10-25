import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const PowerUsageTop5 = ({ x, y, w, h }) => {

    return (
        <>
            <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
                <div className="grid-stack-item-content">
                    {/* grid_item */}
                    <div className="grid_item">
                        <div className="grid_title" style={{ cursor: 'default' }}>
                            <label>전력 사용량 Top 5</label>
                            <div className="dash_boxtab">
                                <label htmlFor="name13">
                                    <input type="radio" name="box-tab5" id="name13" value="name3" defaultChecked />
                                    <span>전체</span>
                                </label>
                                <label htmlFor="name14">
                                    <input type="radio" name="box-tab5" id="name14" value="name4" />
                                    <span>ARM</span>
                                </label>
                                <label htmlFor="name15">
                                    <input type="radio" name="box-tab5" id="name15" value="name5" />
                                    <span>x86</span>
                                </label>
                            </div>
                            {/*<i className="ico-btn-trash"></i>*/}
                        </div>
                        <div className="grid_info style_list">
                            <ul className="list_01">
                                <li className="li_type_01">
                                    <div className="lft">
                                        <i className="ico-type24-x86"></i>
                                        <h6 className="list_title">
                                            x86_hostname1
                                            <span>192.168.16.87</span>
                                        </h6>
                                    </div>
                                    <div className="info2">
                                        <h6>400 kWh
                                            <span>25%</span>
                                        </h6>
                                        <div className="graph_wrap">
                                            <div className="graph_bar">
                                                <div className="bar animate-bar" style={{ width: "25%" }}></div>
                                            </div>
                                        </div>
                                    </div>

                                </li>
                                <li className="li_type_01">
                                    <div className="lft">
                                        <i className="ico-type24-x86"></i>
                                        <h6 className="list_title">
                                            x86_hostname2
                                            <span>192.168.16.87</span>
                                        </h6>
                                    </div>
                                    <div className="info2">
                                        <h6>370 kWh
                                            <span>23.1%</span>
                                        </h6>
                                        <div className="graph_wrap">
                                            <div className="graph_bar">
                                                <div className="bar animate-bar" style={{ width: "23.1%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li className="li_type_01">
                                    <div className="lft">
                                        <i className="ico-type24-x86"></i>
                                        <h6 className="list_title">
                                            x86_hostname3
                                            <span>192.168.16.87</span>
                                        </h6>
                                    </div>
                                    <div className="info2">
                                        <h6>320 kWh
                                            <span>20%</span>
                                        </h6>
                                        <div className="graph_wrap">
                                            <div className="graph_bar">
                                                <div className="bar animate-bar" style={{ width: "20%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li className="li_type_01">
                                    <div className="lft">
                                        <i className="ico-type24-arm"></i>
                                        <h6 className="list_title">
                                            ARM_hostname1
                                            <span>192.168.16.87</span>
                                        </h6>
                                    </div>
                                    <div className="info2 warning">
                                        <h6>270 kWh
                                            <span>16.8%</span>
                                        </h6>
                                        <div className="graph_wrap">
                                            <div className="graph_bar">
                                                <div className="bar animate-bar" style={{ width: "16.8%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li className="li_type_01">
                                    <div className="lft">
                                        <i className="ico-type24-arm"></i>
                                        <h6 className="list_title">
                                            ARM_hostname2
                                            <span>192.168.16.87</span>
                                        </h6>
                                    </div>
                                    <div className="info2">
                                        <h6>240 kWh
                                            <span>15%</span>
                                        </h6>
                                        <div className="graph_wrap">
                                            <div className="graph_bar">
                                                <div className="bar animate-bar" style={{ width: "15%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* // grid_item */}
                </div>
            </div>
        </>
    )
}

export default PowerUsageTop5