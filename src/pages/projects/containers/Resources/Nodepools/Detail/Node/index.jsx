import React, { Fragment, useEffect, useState } from 'react'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'

import { isEmpty } from 'lodash'
import { Indicator, Panel, Text } from 'components/Base'

import {
  Button,
  Icon,
  InputSearch,
  Level,
  LevelItem,
  LevelRight,
} from '@kube-design/components'
import { TinyArea } from 'components/Charts'
import { getAreaChartOps } from 'utils/monitoring'

import CustomStore from 'stores/monitoring/custom/monitor'

import { getLocalTime } from 'utils'
import * as common from 'utils/resources'

import NodePoolStore from 'stores/resources/nodepools'
import styles from './index.scss'

const nodePoolStore = new NodePoolStore()

const step = '5m'
const times = 100

const Node = props => {
  const customStore = new CustomStore()

  const [nodes, setNodes] = useState([])

  const flavor = props.detailStore.nodepool.flavor_detail
  let isMounted = false

  const getState = (state, phase) => {
    if (phase !== 'Provisioned' && phase !== 'Running') {
      return 'updating'
    }

    if (state) {
      return 'running'
    }
    return 'inactive'
  }

  //  Search
  const [searchValue, setSearchValue] = useState()

  useEffect(() => {
    isMounted = true
    fnGetData()
    return () => {
      isMounted = false
    }
  }, [])

  const fnGetData = async ({ ...params } = {}) => {
    const nodeList = await nodePoolStore.fetchNodePoolNodes(props.match.params)

    const filteredNodes =
      params.name !== '' && params.name !== undefined
        ? getSearchData(nodeList, params.name)
        : nodeList

    if (isMounted) {
      setNodes(filteredNodes)
    }
  }

  const getSearchData = (data, searchText) => {
    return data.filter(row => {
      return row['name']?.toLowerCase().includes(searchText.toLowerCase())
    })
  }

  const handleSearch = value => {
    isMounted = true
    setSearchValue(value)
    fnGetData({
      name: value,
    })
    return () => {
      isMounted = false
    }
  }

  const handleRefresh = () => {
    isMounted = true
    const params = searchValue ? { name: searchValue } : {}
    fnGetData(params)
    return () => {
      isMounted = false
    }
  }

  // monitoring script----------------------------------------------
  const [kaasData, setKaasData] = useState({ cpuData: [], memoryData: [] })
  const [isLoading, setIsLoading] = useState(true)
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
          // eslint-disable-next-line array-callback-return
          values[0].map(obj => {
            if (
              obj.metric.pod.indexOf(
                `${props.match.params.clustername}-${props.match.params.name}`
              ) === 0
            ) {
              kaasCpuFilteredData.push(obj)
            }
          })
        }

        if (values[1].length > 0) {
          // eslint-disable-next-line array-callback-return
          values[1].map(obj => {
            if (
              obj.metric.pod.indexOf(
                `${props.match.params.clustername}-${props.match.params.name}`
              ) === 0
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
    setIsLoading(false)
  }, [kaasData])

  // kaas cpu data
  const getCpuUsageData = () => {
    const currentTime = Math.floor(Date.now() / 1000)
    return new Promise(resolve => {
      const cpuFetchData = customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[${step}])) * ${times})) / 100`,
        start: currentTime - 30000,
        end: currentTime,
        cluster: props.match.params.cluster,
      })
      resolve(cpuFetchData)
    })
  }

  // kaas memory data
  const getMemoryUsageData = () => {
    const currentTime = Math.floor(Date.now() / 1000)
    return new Promise(resolve => {
      const memoryFetchData = customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        start: currentTime - 30000,
        end: currentTime,
        cluster: props.match.params.cluster,
      })
      resolve(memoryFetchData)
    })
  }

  const getMonitoringCfgs = metrics => [
    {
      type: 'cpu',
      title: 'CPU',
      unitType: 'cpu',
      legend: ['USED'],
      data: [metrics.cpu],
      bgColor: 'transparent',
    },
    {
      type: 'memory',
      title: 'MEMORY',
      unitType: 'memory',
      legend: ['USED'],
      data: [metrics.memory],
      bgColor: 'transparent',
    },
  ]

  const renderMonitorings = (nodeName, mgmtIP) => {
    const loading = isLoading
    const podName = kaasData.memoryData?.find(
      obj => obj.metric?.instance?.split(':')[0] === mgmtIP
    )?.metric?.pod
    const metrics = {
      cpu: kaasData.cpuData.find(obj => obj.metric.pod === podName),
      memory: kaasData.memoryData.find(obj => obj.metric.pod === podName),
    }

    if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>

    if (isEmpty(metrics.cpu) && isEmpty(metrics.memory))
      return <div className={styles.monitors}>{t('NO_MONITORING_DATA')}</div>

    const configs = getMonitoringCfgs(metrics)

    return (
      <div className={styles.monitors}>
        <div className={styles.charts}>
          {configs.map(item => {
            const config = getAreaChartOps(item)

            return (
              <div key={item.type}>
                <TinyArea
                  key={item.type}
                  width="100%"
                  height={40}
                  {...config}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <Panel title={'Flavor'}>
        <Fragment>
          <div className={classnames(styles.item)}>
            <div className={styles.icon}>
              <Icon name="apps" size={40} />
            </div>
            <div className={classnames(styles.title, styles.name)}>
              <div>{flavor.name}</div>
              <p>Flavor</p>
            </div>
            <div className={styles.title}>
              <Text
                key="CPU"
                icon="cpu"
                title={`${flavor.vcpus} Core`}
                description={t('CPU')}
              />
            </div>
            <div className={styles.title}>
              <Text
                key="Memory"
                icon="memory"
                title={`${common.fnSetBytes(flavor.ram)} GiB`}
                description={t('Memory')}
              />
            </div>
            <div className={styles.title}>
              <Text
                key="Disk"
                icon="storage"
                title={`${flavor.root_disk} GiB`}
                description={t('Disk')}
              />
            </div>
            <div className={styles.title}>
              <Text
                key="GPU"
                icon="gpu"
                title={
                  flavor.gpus.length >= 1
                    ? flavor.gpus.length === 1
                      ? `${flavor.gpus[0].quantity} ${flavor.gpus[0].name}`
                      : `${flavor.gpus[0].name} ${t(
                          'RESOURCES_BESIDES'
                        )} ${flavor.gpus.length - 1}${t('RESOURCES_COUNT')}`
                    : '-'
                }
                description={t('GPU')}
              />
            </div>
          </div>
        </Fragment>
      </Panel>
      <Panel title={'Nodes'}>
        <div className={styles.wrapper}>
          <Level>
            <LevelItem>
              <InputSearch
                className={styles.search}
                name="search"
                placeholder={t('SEARCH_BY_NAME')}
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            </LevelItem>
            <LevelRight>
              <div className={styles.actions}>
                <Button type="flat" icon="refresh" onClick={handleRefresh} />
              </div>
            </LevelRight>
          </Level>
          {!!nodes &&
            nodes.map(detail => (
              <Fragment>
                <div className={classnames(styles.item)}>
                  <div className={styles.icon}>
                    <Icon className="ico-type-vm" size={40} />
                    <Indicator
                      className={styles.indicator}
                      type={getState(detail?.ready_status, detail?.phase)}
                      flicker
                    />
                  </div>
                  <div className={styles.title} style={{ width: '30%' }}>
                    <div>{detail.name}</div>
                    <p>
                      {getLocalTime(detail.timestamp).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )}
                      {t('RESOURCES_CREATED')}
                    </p>
                  </div>
                  <div className={styles.title} style={{ width: '10%' }}>
                    <div>
                      {t(`RESOURCES_MACHINE_${detail.phase.toUpperCase()}`)}
                    </div>
                    <p>{t('RESOURCES_STATE')}</p>
                  </div>
                  <div className={styles.title} style={{ width: '15%' }}>
                    {detail?.addresses?.service_ip ? (
                      <div>
                        <div>{detail.addresses.service_ip}</div>
                      </div>
                    ) : (
                      <div>-</div>
                    )}
                    <p>{t('RESOURCES_NODE_IP')}</p>
                  </div>
                  <div style={{ width: '45%' }}>
                    {renderMonitorings(detail.name, detail.addresses.mgmt_ip)}
                  </div>
                </div>
              </Fragment>
            ))}
        </div>
      </Panel>
    </>
  )
}

export default inject('detailStore')(observer(Node))
