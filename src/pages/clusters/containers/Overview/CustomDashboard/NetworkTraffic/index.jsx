import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getAreaChartOps } from 'utils/monitoring'
import { get } from 'lodash'
import { SimpleArea } from 'components/Charts'

const MetricTypes = {
  // cpu_utilisation: 'cluster_cpu_utilisation',
  // memory_utilisation: 'cluster_memory_utilisation',
  // cpu_load1: 'cluster_load1',
  // cpu_load5: 'cluster_load5',
  // cpu_load15: 'cluster_load15',
  // disk_size_usage: 'cluster_disk_size_usage',
  // disk_inode_utilisation: 'cluster_disk_inode_utilisation',
  // disk_inode_usage: 'cluster_disk_inode_usage',
  // disk_inode_total: 'cluster_disk_inode_total',
  // disk_read_iops: 'cluster_disk_read_iops',
  // disk_write_iops: 'cluster_disk_write_iops',
  // disk_read_throughput: 'cluster_disk_read_throughput',
  // disk_write_throughput: 'cluster_disk_write_throughput',
  net_transmitted: 'cluster_net_bytes_transmitted',
  net_received: 'cluster_net_bytes_received',
  // pod_running_count: 'cluster_pod_running_count',
  // pod_abnormal_count: 'cluster_pod_abnormal_count',
  // pod_completed_count: 'cluster_pod_succeeded_count',
}

const NetworkTraffic = ({ monitorStore }) => {

  const [tabData, setTabData] = useState();
  const [metricData, setMetricData] = useState([]);
  const [tabContentData, setTabContentData] = useState([]);
  const [tabContent, setTabContent] = useState();
  const [tabContentActive, setTabContentActive] = useState(false);
  const [loading, setLoading] = useState(false);

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

    const data = result.map(item => ({
      props: item,
    }))
    setTabContentData(data)
  }

  useEffect(() => {
    if (tabContentData.length > 0) {
      setTabContent(tabContentData?.[0])
      setTabContentActive(true)

      const config = getAreaChartOps(tabContentData?.[0].props)
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
                    <input type="radio" name="box-tab1" id="name3" value="name3" defaultChecked />
                    <span>노드</span>
                  </label>
                  <label htmlFor="name4">
                    <input type="radio" name="box-tab1" id="name4" value="name4" />
                    <span>Pod</span>
                  </label>
                  <label htmlFor="name5">
                    <input type="radio" name="box-tab1" id="name5" value="name5" />
                    <span>가상머신</span>
                  </label>
                  <label htmlFor="name6">
                    <input type="radio" name="box-tab1" id="name6" value="name6" />
                    <span>쿠버네티스</span>
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
                    <TabContent option={tabContent?.props}></TabContent>
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