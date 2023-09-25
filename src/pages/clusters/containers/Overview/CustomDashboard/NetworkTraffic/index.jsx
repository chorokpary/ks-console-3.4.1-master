import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getAreaChartOps } from 'utils/monitoring'
import { get } from 'lodash'
import { SimpleArea } from 'components/Charts'
import PodStore from 'stores/monitoring/pod'


const MetricTypes = {
  net_transmitted: 'cluster_net_bytes_transmitted',
  net_received: 'cluster_net_bytes_received',
  pod_net_bytes_transmitted: 'pod_net_bytes_transmitted',
  pod_net_bytes_received: 'pod_net_bytes_received'
}

const NetworkTraffic = ({ monitorStore }) => {
  const podStore = new PodStore();

  const [tabData, setTabData] = useState();
  const [metricData, setMetricData] = useState([]);
  const [tabContentData, setTabContentData] = useState([]);
  const [tabContent, setTabContent] = useState();
  const [tabContentActive, setTabContentActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rightTabActive, setRightTabActive] = useState('node');
  const [podData, setPodData] = useState([]);

  useEffect(() => {
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

    const getPodTrafficData = async () => {
      const podData = await podStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        step: '5m',
        times: 100,
      })
      setPodData(podData)
    };
    getPodTrafficData();
  }, [])

  useEffect(() => {
    // getData();
    getContentOptions();
  }, [metricData])


  const getContentOptions = () => {
    const result = [
      {
        type: 'bandwidth',
        title: 'NETWORK_TRAFFIC',
        unitType: 'bandwidth',
        legend: ['OUT', 'IN'],
        data: [
          get(metricData, `${MetricTypes.net_transmitted}.data.result[0]`, {}),
          get(metricData, `${MetricTypes.net_received}.data.result[0]`, {}),
        ],
      },
    ]

    setTabContentData(result)
  }

  const getContentOptions2 = () => {
    const result = [
      {
        type: 'bandwidth',
        title: 'NETWORK_TRAFFIC',
        unitType: 'bandwidth',
        legend: ['OUT', 'IN'],
        data: [
          get(podData, `${MetricTypes.pod_net_bytes_transmitted}.data.result[0]`, {}),
          get(podData, `${MetricTypes.pod_net_bytes_received}.data.result[0]`, {}),
        ],
      },
    ]

    setTabContentData(result)
  }

  const onclickTab = (tab) => {
    setRightTabActive(tab);
  }
  useEffect(() => {
    if (rightTabActive == 'node') {
      getContentOptions()
    } else if (rightTabActive == 'pod') {
      getContentOptions2()
    } else if (rightTabActive == 'vm') {
      setTabContentActive(false)
      setTabData('')
    } else if (rightTabActive == 'k8s') {
      setTabContentActive(false)
      setTabData('')
    }
  }, [rightTabActive])

  useEffect(() => {
    if (tabContentData.length > 0) {
      setTabContent(tabContentData?.[0])
      setTabContentActive(true)

      const config = getAreaChartOps(tabContentData?.[0])
      const lastData = config.data[config.data.length - 1];
      setTabData(lastData)
    }
  }, [tabContentData])

  return (
    <>
      <div className="grid-stack-item" gs-x="0" gs-y="10" gs-w="9" gs-h="6">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>네트워크 트래픽</label>
              <div className="right">
                <div className="dash_boxtab">
                  <label htmlFor="name3">
                    <input type="radio" name="box-tab1" id="name3" value="name3" defaultChecked onClick={() => onclickTab('node')} />
                    <span>노드</span>
                  </label>
                  <label htmlFor="name4">
                    <input type="radio" name="box-tab1" id="name4" value="name4" onClick={() => onclickTab('pod')} />
                    <span>Pod</span>
                  </label>
                  <label htmlFor="name5">
                    <input type="radio" name="box-tab1" id="name5" value="name5" onClick={() => onclickTab('vm')} />
                    <span>가상머신</span>
                  </label>
                  <label htmlFor="name6">
                    <input type="radio" name="box-tab1" id="name6" value="name6" onClick={() => onclickTab('k8s')} />
                    <span>KaaS</span>
                  </label>
                </div>

              </div>
            </div>
            <div className="grid_info style_chart">
              <div className="box type_chart">
                <div className="cont1">
                  <div className="chart_tab no-tab">
                    <div className="title">
                      <i className="ico ico-type-outbound"></i>
                      <h5>Outbound</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap data-r">
                        <p><span className="em">{tabData?.OUT}</span> <span className="unit">Mbps</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="chart_tab no-tab">
                    <div className="title">
                      <i className="ico ico-type-inbound"></i>
                      <h5>Inbound</h5>
                    </div>
                    <div className="data">
                      <div className="number_wrap data-r">
                        <p><span className="em">{tabData?.IN}</span> <span className="unit">Mbps</span></p>
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
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default NetworkTraffic

const TabContent = ({ option }) => {
  // console.log(option)

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