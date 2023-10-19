import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

import CustomStore from 'stores/monitoring/custom/monitor'

const CpuUsage = () => {

    const customStore = new CustomStore();

    const [vmList, setVmList] = useState([])
    const [vmData, setVmData] = useState({ cpuData: [], memoryData: [] });
    const [kaasData, setKaasData] = useState({ cpuData: [], memoryData: [] });
    const [vmCpuData, setVmCpuData] = useState([]);
    const [vmMemoryData, setVmMemoryData] = useState([]);

    useEffect(() => {

        // vm cpu data
        const step = '5m'
        const times = 100
        var currentTime = Math.floor(Date.now() / 1000);
        const getVmCpuUsageData = async () => {
        const vmCpuData = await customStore.fetchMetric({
            // expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[${step}])) * ${times})) / 100`,
            // expr: `redfish_exporter_collector_duration_seconds`,
            expr: `redfish_chassis_power_powersupply_last_power_output_watts`,    
            start: currentTime,
            end: currentTime,
        })
        console.log(JSON.stringify(vmCpuData))
        setVmCpuData(vmCpuData)
        // setVmCpuData(vmCpuDataDummy)
        };
        getVmCpuUsageData();
        
    },[])

    return (
        <>
           <div className="gridbox_wrap">
                <div className="grid_item">
                <div className="grid_title">
                    <label>CPU 소비 전력량 비교 (1대 평균)</label>
                    <div className="right">
                    <div className="boxtab">
                        <label htmlFor="cpupower_name1">
                            <input type="radio" name="cpupower" id="cpupower_name1" value="name3" defaultChecked/>
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
                    {/* <!--<i className="ico-btn-trash"></i>--> */}
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
                                <p><i className="ico-type24-powericon"></i> <span className="em">141</span> <span className="unit">W</span></p>
                            </div>
                            </div>
                        </div>
                        <div className="graph_wrap">
                            <div className="graph_bar">
                            <div className="bar animate-bar" style={{width: "30%"}}></div>
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
                                <p><i className="ico-type24-powericon"></i> <span className="em">160</span> <span className="unit">W</span></p>
                            </div>
                            </div>
                        </div>
                        <div className="graph_wrap">
                            <div className="graph_bar">
                            <div className="bar second animate-bar" style={{width: "40%"}}></div>
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
            </div>
        </>
    )
}

export default CpuUsage