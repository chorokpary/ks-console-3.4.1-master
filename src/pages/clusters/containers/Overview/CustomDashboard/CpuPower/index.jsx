import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const CpuPower = () => {

    return (
        <>
            <div className="grid-stack-item" gs-x="0" gs-y="49" gs-w="12" gs-h="5">
                <div className="grid-stack-item-content">
                    {/* grid_item */}
                    <div className="grid_item">
                        <div className="grid_title">
                            <label>CPU 소비 전력량 비교 (1대 평균)</label>
                            <div className="right">
                                <div className="dash_boxtab">
                                    <label htmlFor="cpupower_name1">
                                        <input type="radio" name="cpupower" id="cpupower_name1" value="name3" defaultChecked />
                                        <span>최근 1시간</span>
                                    </label>
                                    <label htmlFor="cpupower_name2">
                                        <input type="radio" name="cpupower" id="cpupower_name2" value="name4" />
                                        <span>최근 1일</span>
                                    </label>
                                    <label htmlFor="cpupower_name3">
                                        <input type="radio" name="cpupower" id="cpupower_name3" value="name5" />
                                        <span>최근 1주일</span>
                                    </label>
                                    <label htmlFor="cpupower_name4">
                                        <input type="radio" name="cpupower" id="cpupower_name4" value="name6" />
                                        <span>최근 1달</span>
                                    </label>
                                </div>
                                {/*<i className="ico-btn-trash"></i>*/}
                            </div>
                        </div>
                        <div className="grid_info style_chart_2">
                            <div className="box type_chart">
                                <div className="cont1">
                                    <div className="chart_tab no-tab">
                                        <div className="chart_group">
                                            <div className="title">
                                                <i className="ico-type24-arm"></i>
                                                <h5>ARM</h5>
                                            </div>
                                            <div className="data">
                                                <div className="number_wrap data-r">
                                                    <p><i className="ico-type24-powericon"></i> <span className="em">141</span> <span
                                                        className="unit">W</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="graph_wrap">
                                            <div className="graph_bar">
                                                <div className="bar animate-bar" style={{ width: "30%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="chart_tab no-tab">
                                        <div className="chart_group">
                                            <div className="title">
                                                <i className="ico-type24-x86"></i>
                                                <h5>x86</h5>
                                            </div>
                                            <div className="data">
                                                <div className="number_wrap data-r">
                                                    <p><i className="ico-type24-powericon"></i> <span className="em">160</span> <span
                                                        className="unit">W</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="graph_wrap">
                                            <div className="graph_bar">
                                                <div className="bar second animate-bar" style={{ width: "40%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="cont2">
                                    <div className="chart_04"></div>
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

export default CpuPower