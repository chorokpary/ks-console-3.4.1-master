import React, { useEffect, useState } from 'react'

import { Loading } from '@kube-design/components'
import { getAreaChartOps } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'

import { SimpleArea } from 'components/Charts'

import { getContentOptions, getData } from './handleTab'

const step = '5m'
const times = 100

const ClusterResourceStatus = props => {
  const customStore = new CustomStore()

  const [kaasData, setKaasData] = useState({ cpuData: [], memoryData: [] })
  const [isLoading, setIsLoading] = useState(true)

  const [tabData, setTabData] = useState()
  const [tabActive, setTabActive] = useState('cpu')
  const [tabContentData, setTabContentData] = useState([])
  const [tabContent, setTabContent] = useState()
  const [tabIdx, setTabIdx] = useState(0)
  let timer = 0

  useEffect(() => {
    fetchData(0)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const fetchData = timerSec => {
    timer = setTimeout(async () => {
      const kaasCpuFilteredData = []
      const kaasMemoryFilteredData = []

      Promise.all([getCpuUsageData(), getMemoryUsageData()]).then(values => {
        if (values[0].length > 0) {
          values[0].forEach(obj => {
            if (
              obj.metric.pod.split('-control-')[0] === props.kaasName ||
              obj.metric.pod.split('-md-')[0] === props.kaasName
            ) {
              kaasCpuFilteredData.push(obj)
            }
          })
        }

        if (values[1].length > 0) {
          values[1].forEach(obj => {
            if (
              obj.metric.pod.split('-control-')[0] === props.kaasName ||
              obj.metric.pod.split('-md-')[0] === props.kaasName
            ) {
              kaasMemoryFilteredData.push(obj)
            }
          })
        }

        setKaasData({
          ...kaasData,
          cpuData: kaasCpuFilteredData,
          memoryData: kaasMemoryFilteredData,
        })
      })
      fetchData(5000)
    }, timerSec)
  }

  useEffect(() => {
    setTabData(getData('kaas', kaasData))
    setTabContentData(getContentOptions('kaas', kaasData))

    setTabContent(getContentOptions('kaas', kaasData)?.[tabIdx])
    setIsLoading(false)
  }, [kaasData])

  // kaas cpu data
  const getCpuUsageData = async () => {
    const currentTime = Math.floor(Date.now() / 1000)
    return await customStore.fetchMetric({
      expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{service="launcher-node-exporter",mode="idle"}[${step}])) * ${times})) / 100`,
      start: currentTime - 30000,
      end: currentTime,
    })
  }

  // kaas memory data
  const getMemoryUsageData = async () => {
    const currentTime = Math.floor(Date.now() / 1000)
    return await customStore.fetchMetric({
      expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
      start: currentTime - 30000,
      end: currentTime,
    })
  }

  // -----------tab
  // left tab active
  const onClickLeftTab = (activeTab, idx) => {
    setTabActive(activeTab)
    setTabContent(tabContentData.filter(obj => obj.activeTab === activeTab)[0])
    setTabIdx(idx)
  }

  return (
    <>
      <div className="grid-stack-item">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <Loading spinning={isLoading}>
            <div className="grid_item">
              <div className="grid_info style_chart">
                <div className="box type_chart">
                  <div className="cont1">
                    {tabData &&
                      tabData.map((data, idx) => (
                        <div
                          className={`chart_tab ${
                            tabActive === data.activeTab ? 'on' : ''
                          }`}
                          key={data.name}
                          onClick={() => onClickLeftTab(data.activeTab, idx)}
                        >
                          <div className="title">
                            <i
                              className={`ico-type-${data.unitType} ${data.name}`}
                            ></i>
                            <h5>{data.name}</h5>
                          </div>
                          <div className="data">
                            <div className="number_wrap rgt">
                              <p>
                                <span className="em">{data._used}</span>
                                <span className="unit">{t(data._unit)}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="cont2">
                    {kaasData.cpuData.length > 0 &&
                    kaasData.memoryData.length > 0 ? (
                      <TabContent option={tabContent}></TabContent>
                    ) : (
                      <div>{t('RESOURCES_NO_MONITORING_DATA')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Loading>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default ClusterResourceStatus

const TabContent = ({ option }) => {
  const commonProps = {
    key: option?.title,
    width: '100%',
    height: '100%',
  }
  const config = getAreaChartOps(option)

  return (
    <SimpleArea
      {...commonProps}
      {...config}
      style={{ padding: '10px', color: 'white' }}
    />
  )
}
