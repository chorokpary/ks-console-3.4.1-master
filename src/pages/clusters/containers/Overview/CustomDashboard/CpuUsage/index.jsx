import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

const CpuUsage = () => {

    return (
        <>
            <div className="grid-stack-item" gs-x="0" gs-y="37" gs-w="9" gs-h="4">
                <div className="grid-stack-item-content">
                    {/* grid_item */}
                    <div className="grid_item">
                        <div className="grid_title">
                            <label>CPU 사용률 / 소비전력</label>
                        </div>
                        <div className="grid_info style_chart_2">
                            <div className="box type_chart">
                                <div className="cont3">
                                    <div className="title">
                                        <h6>CPU 평균 사용률</h6>
                                    </div>
                                    <div className="bar_value">
                                        <dl className="rgt">
                                            <dt>ARM</dt>
                                            <dd>2.6 GHz</dd>
                                        </dl>
                                        <dl>
                                            <dt>x86</dt>
                                            <dd>3.1 GHz</dd>
                                        </dl>
                                    </div>
                                    <div className="bar_chart">
                                        <div className="graph_wrap">
                                            <div className="graph_bar rgt">
                                                <div className="bar animate-bar" style={{ width: "20%" }}></div>
                                            </div>
                                        </div>
                                        <div className="center_icon"><i className="ico-type-cpu"></i></div>
                                        <div className="graph_wrap">
                                            <div className="graph_bar">
                                                <div className="bar second animate-bar" style={{ width: "40%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="cont3">
                                    <div className="title">
                                        <h6>현재 소비 전력량</h6>
                                    </div>
                                    <div className="bar_value">
                                        <dl className="rgt">
                                            <dt>ARM</dt>
                                            <dd>5,000.0 kWh</dd>
                                        </dl>
                                        <dl>
                                            <dt>x86</dt>
                                            <dd>6,000.0 kWh</dd>
                                        </dl>
                                    </div>
                                    <div className="bar_chart">
                                        <div className="graph_wrap">
                                            <div className="graph_bar rgt">
                                                <div className="bar animate-bar" style={{ width: "40%" }}></div>
                                            </div>
                                        </div>
                                        <div className="center_icon"><i className="ico-type-power"></i></div>
                                        <div className="graph_wrap">
                                            <div className="graph_bar">
                                                <div className="bar second animate-bar" style={{ width: "60%" }}></div>
                                            </div>
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

export default CpuUsage