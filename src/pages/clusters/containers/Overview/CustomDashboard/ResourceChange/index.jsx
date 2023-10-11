import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getAreaChartOps } from 'utils/monitoring'
import { get } from 'lodash'
import TinyArea from 'projects/containers/Overview/ResourceUsage/TinyArea'

const MetricTypes = {
  pod_running_count: 'cluster_pod_running_count',
}

const ResourceChange = ({ monitorStore }) => {

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
        // step: `${Math.floor(4320)}s`, // Time interval
        // times: 10,
        fillZero: true,
        step: '1d',
        times: 10,
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
        type: 'pod',
        title: 'POD',
        legend: ['RUNNING_PODS'],
        unit: '',
        metricType: MetricTypes.pod_running_count,
        data: [
          get(metricData, `${MetricTypes.pod_running_count}.data.result[0]`, {}),
        ],
      },
    ]

    setTabContentData(result)
  }

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
      <div className="grid-stack-item" gs-x="0" gs-y="16" gs-w="4" gs-h="5">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>리소스 변화량</label>
              <div className="right">

              </div>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_status box_long">
                <div className="box type_status">
                  <div className="cont_group">
                    <h5><i className="ico-type-pod"></i>Pod</h5>
                    <div className="number_wrap">
                      <p><span className="em">{tabData?.RUNNING_PODS}</span></p>
                    </div>
                    {/* <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p><span>Created</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">0</div>
                      <p><span>Deleted</span></p>
                    </div>
                  </div> */}
                    {tabContentActive &&
                      <TabContent option={tabContent}></TabContent>
                    }
                    {/* <div className="chart chart_03"></div> */}
                  </div>
                </div>
              </div>
            </Loading>
            {/*// grid_info style_status */}
            <div className="grid_info style_status box_long">
              <div className="box type_status">
                <div className="cont_group">
                  <h5><i className="ico-type-vm"></i>가상머신</h5>
                  <div className="number_wrap">
                    <p><span className="em">7</span></p>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p><span>Created</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">0</div>
                      <p><span>Deleted</span></p>
                    </div>
                  </div>
                  <div className="chart chart_03">
                  </div>
                </div>
              </div>
            </div>
            {/*// grid_info style_status */}
            <div className="grid_info style_status box_long">
              <div className="box type_status">
                <div className="cont_group">
                  <h5><i className="ico-type-container"></i>KaaS</h5>
                  <div className="number_wrap">
                    <p><span className="em">1</span></p>
                  </div>
                  <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p><span>Created</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">0</div>
                      <p><span>Deleted</span></p>
                    </div>
                  </div>
                  <div className="chart chart_03">
                  </div>
                </div>
              </div>
            </div>
            {/*// grid_info style_status */}
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default ResourceChange

const TabContent = ({ option }) => {

  const commonProps = {
    key: option?.title,
  }
  const config = getAreaChartOps(option)

  return (
    <TinyArea {...commonProps} {...config} bgColor="transparent" />
  )
}