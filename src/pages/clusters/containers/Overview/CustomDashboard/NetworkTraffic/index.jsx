import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getAreaChartOps, getValueByUnit, getSuitableUnit } from 'utils/monitoring'
import { get, last } from 'lodash'
import { SimpleArea } from 'components/Charts'
import VmStore from 'stores/resources/vms'
import CustomStore from 'stores/monitoring/custom/monitor'
import PodStore from 'stores/monitoring/pod'
import { getContentOptions, getData } from './handleTab'

const MetricTypes = {
  net_transmitted: 'cluster_net_bytes_transmitted',
  net_received: 'cluster_net_bytes_received',
  net_utilisation: 'cluster_net_utilisation',
  pod_net_bytes_transmitted: 'pod_net_bytes_transmitted',
  pod_net_bytes_received: 'pod_net_bytes_received'
}

const NetworkTraffic = ({ monitorStore }) => {
  const podStore = new PodStore();
  const customStore = new CustomStore();
  const vmStore = new VmStore();

  const [tabData, setTabData] = useState();
  const [metricData, setMetricData] = useState([]);
  const [tabContentData, setTabContentData] = useState([]);
  const [tabContent, setTabContent] = useState();
  const [tabContentActive, setTabContentActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabActive, setTabActive] = useState('OUT');
  const [rightTabActive, setRightTabActive] = useState('node');

  const [podData, setPodData] = useState([]);

  const [vmList, setVmList] = useState([])
  const [vmData, setVmData] = useState({ vmInboundData: [], vmOutboundData: [] });
  const [kaasData, setKaasData] = useState({ vmInboundData: [], vmOutboundData: [] });
  const [vmInboundData, setVmInboundData] = useState([]);
  const [vmOutboundData, setVmOutboundData] = useState([]);

  useEffect(() => {
    // node data
    const getNetworkTrafficData = async () => {
      setLoading(true)
      const metricData = await monitorStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        step: '5m', // Time interval
        times: 100,
        // step: '3600s', // 최근 7일
        // times: 160,
      })
      setMetricData(metricData)
      setLoading(false)
    };
    getNetworkTrafficData();

    // pod data
    const getPodTrafficData = async () => {
      const podData = await podStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        step: '5m',
        times: 100,
      })
      setPodData(podData)
    };
    getPodTrafficData();

    // vm list
    const getVmList = async () => {
      const vmList = await vmStore.fetchList({ limit: 1000 })
      setVmList(vmList)
    };
    getVmList();

    // vm inbound data
    var currentTime = Math.floor(Date.now() / 1000);
    const getVmInboundData = async () => {
      const vmInboundData = await customStore.fetchMetric({
        expr: `irate(node_network_receive_bytes_total{service='launcher-node-exporter',device=~"net.*|eth.*"}[5m])`,
        start: currentTime - 30000,
        end: currentTime,
      })
      setVmInboundData(vmInboundData)
    };
    getVmInboundData();
    // vm outbound data
    const getVmOutboundData = async () => {
      const vmOutboundData = await customStore.fetchMetric({
        expr: `irate(node_network_transmit_bytes_total{namespace='default',service='launcher-node-exporter',device=~"net.*|eth.*"}[5m])`,
        start: currentTime - 30000,
        end: currentTime,
      })
      setVmOutboundData(vmOutboundData)
    };
    getVmOutboundData();

  }, [])

  // vm, kaas > inbound, outbound data set
  useEffect(() => {
    let vmInboundFilteredData = [];
    let vmOutboundFilteredData = [];
    let kaasInboundFilteredData = [];
    let kaasOutboundFilteredData = [];

    if (vmInboundData.length > 0) {
      vmInboundData.map(obj => {
        if (vmList.find(vmObj => vmObj.name == obj.metric.pod)) {
          vmInboundFilteredData.push(obj)
        } else {
          kaasInboundFilteredData.push(obj)
        }
      })
    }
    if (vmOutboundData.length > 0) {
      vmOutboundData.map(obj => {
        if (vmList.find(vmObj => vmObj.name == obj.metric.pod)) {
          vmOutboundFilteredData.push(obj)
        } else {
          kaasOutboundFilteredData.push(obj)
        }
      })
    }

    setVmData({ ...vmData, ['vmInboundData']: vmInboundFilteredData, ['vmOutboundData']: vmOutboundFilteredData })
    setKaasData({ ...kaasData, ['vmInboundData']: kaasInboundFilteredData, ['vmOutboundData']: kaasOutboundFilteredData })
  }, [vmInboundData, vmOutboundData, vmList])

  // first render
  useEffect(() => {
    handleData('node', metricData);
    handleContenOption('node', metricData);
  }, [metricData])

  // handle left data
  const handleData = (rightTabActive, data) => {
    setTabData(getData(rightTabActive, data))
  }

  // handle right data
  const handleContenOption = (rightTabActive, data) => {
    setTabContentData(getContentOptions(rightTabActive, data))
  }

  // left tab active
  const onClickLeftTab = (activeTab) => {
    setTabActive(activeTab)
    setTabContent(tabContentData.filter(obj => obj.activeTab == activeTab)[0])
  }

  // right tab active
  const onClickRightTab = (tab, data) => {
    setRightTabActive(tab)
    handleContenOption(tab, data)
    handleData(tab, data)
    setTabActive('OUT')
  }

  useEffect(() => {
    if (tabContentData.length > 0) {
      setTabContent(tabContentData?.[0])
      setTabContentActive(true)
    }
  }, [tabContentData])

  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="10" gs-w="12" gs-h="6">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>네트워크 트래픽</label>
              <div className="right">
                <div className="dash_boxtab">
                  <label htmlFor="name3">
                    <input type="radio" name="box-tab1" id="name3" value="name3" defaultChecked onClick={() => onClickRightTab('node', metricData)} />
                    <span>노드</span>
                  </label>
                  <label htmlFor="name4">
                    <input type="radio" name="box-tab1" id="name4" value="name4" onClick={() => onClickRightTab('pod', podData)} />
                    <span>Pod</span>
                  </label>
                  <label htmlFor="name5">
                    <input type="radio" name="box-tab1" id="name5" value="name5" onClick={() => onClickRightTab('vm', vmData)} />
                    <span>가상머신</span>
                  </label>
                  <label htmlFor="name6">
                    <input type="radio" name="box-tab1" id="name6" value="name6" onClick={() => onClickRightTab('kaas', kaasData)} />
                    <span>KaaS</span>
                  </label>
                </div>

              </div>
            </div>
            {(rightTabActive != 'vm' && rightTabActive != 'kaas') &&
              <div className="grid_info style_chart">
                <div className="box type_chart">
                  <div className="cont1">
                    <div className="chart_tab no-tab">
                      <div className="title">
                        <i className="ico-type-outbound"></i>
                        <h5>Outbound</h5>
                      </div>
                      <div className="data">
                        <div className="number_wrap data-r">
                          <p><span className="em">{tabData?.OUT}</span> <span className="unit">{tabData?.UNIT}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="chart_tab no-tab">
                      <div className="title">
                        <i className="ico-type-inbound"></i>
                        <h5>Inbound</h5>
                      </div>
                      <div className="data">
                        <div className="number_wrap data-r">
                          <p><span className="em">{tabData?.IN}</span> <span className="unit">{tabData?.UNIT}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="chart_tab no-tab">
                      <div className="title">
                        <i className="ico-type-network"></i>
                        <h5>Total</h5>
                      </div>
                      <div className="data">
                        <div className="number_wrap data-r">
                          <p><span className="em">{tabData?.TOTAL}</span> <span className="unit">{tabData?.UNIT}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="cont2">
                    {tabContentActive &&
                      <TabContent option={tabContent}></TabContent>
                    }
                    {/* <div className="chart_02"></div> */}
                  </div>
                </div>
              </div>
            }
            {(rightTabActive == 'vm' || rightTabActive == 'kaas') &&
              <div className="grid_info style_chart">
                <div className="box type_chart">
                  <div className="cont1">
                    <div className={`chart_tab ${tabActive == 'OUT' ? 'on' : ''}`} onClick={() => onClickLeftTab('OUT')}>
                      <div className="title">
                        <i className="ico-type-outbound"></i>
                        <h5>Outbound</h5>
                      </div>
                      <div className="data">
                        <div className="number_wrap data-r">
                          <p><span className="em">{tabData?.OUT}</span> <span className="unit">{tabData?.UNIT}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className={`chart_tab ${tabActive == 'IN' ? 'on' : ''}`} onClick={() => onClickLeftTab('IN')}>
                      <div className="title">
                        <i className="ico-type-inbound"></i>
                        <h5>Inbound</h5>
                      </div>
                      <div className="data">
                        <div className="number_wrap data-r">
                          <p><span className="em">{tabData?.IN}</span> <span className="unit">{tabData?.UNIT}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="chart_tab no-tab">
                      <div className="title">
                        <i className="ico-type-network"></i>
                        <h5>Total</h5>
                      </div>
                      <div className="data">
                        <div className="number_wrap data-r">
                          <p><span className="em">{tabData?.TOTAL}</span> <span className="unit">{tabData?.UNIT}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="cont2">
                    {tabContentActive &&
                      <TabContent option={tabContent}></TabContent>
                    }
                    {/* <div className="chart_02"></div> */}
                  </div>
                </div>
              </div>
            }
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default NetworkTraffic

const TabContent = ({ option }) => {

  const commonProps = {
    key: option?.title,
    width: '100%',
    height: '100%',
  }
  const config = getAreaChartOps(option)
  return (
    <SimpleArea {...commonProps} {...config} style={{ padding: '10px', color: 'white' }} />
  )
}
