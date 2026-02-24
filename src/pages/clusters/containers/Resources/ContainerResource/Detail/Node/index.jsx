import React, { Fragment, useEffect, useState } from 'react'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'

import { isEmpty } from 'lodash'
import { Indicator, Panel, Text, Modal } from 'components/Base'
import NodePoolRegistModal from 'clusters/containers/Resources/components/Modals/NodePools/Regist'

import {
  Button,
  Icon,
  InputSearch,
  Level,
  LevelItem,
  LevelRight,
  Notify,
  Tooltip,
} from '@kube-design/components'
import { TinyArea } from 'components/Charts'
import { getAreaChartOps } from 'utils/monitoring'

import CustomStore from 'stores/monitoring/custom/monitor'

import { getLocalTime } from 'utils'
import * as common from 'utils/resources'

import KaasStore from 'stores/resources/containerresource'
import NodePoolStore from 'stores/resources/nodepools'
import { Link } from 'react-router-dom'
import styles from './index.scss'

const kaasStore = new KaasStore()
const nodePoolStore = new NodePoolStore()

const step = '5m'
const times = 100

const Node = props => {
  const customStore = new CustomStore()

  const [machines, setMachines] = useState([])
  const [nodepools, setNodepools] = useState([])

  let isMounted = false

  // node script----------------------------------
  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState()

  // eslint-disable-next-line no-shadow
  const getState = (state, phase) => {
    if (phase !== 'Provisioned' && phase !== 'Running') {
      return 'updating'
    }

    if (state) {
      return 'running'
    }
    return 'inactive'
  }

  const getPhase = phase => {
    if (phase === 'Running') {
      return 'running'
    }
    return 'updating'
  }

  const renderExtraContent = obj => {
    return (
      <div className={styles.itemExtra}>
        <div className={styles.containers}>
          <Fragment>
            Flavor
            <div className={classnames(styles.item)}>
              <div className={styles.icon}>
                <Icon name="apps" size={40} />
              </div>
              <div className={classnames(styles.title, styles.name)}>
                <div>{obj.flavor_detail.name}</div>
                <p>Flavor</p>
              </div>
              <div className={styles.title}>
                <Text
                  key="CPU"
                  icon="cpu"
                  title={`${obj.flavor_detail.vcpus} Core`}
                  description={t('CPU')}
                />
              </div>
              <div className={styles.title}>
                <Text
                  key="Memory"
                  icon="memory"
                  title={`${common.fnSetBytes(obj.flavor_detail.ram)} GiB`}
                  description={t('Memory')}
                />
              </div>
              <div className={styles.title}>
                <Text
                  key="Disk"
                  icon="storage"
                  title={`${obj.flavor_detail.root_disk} GiB`}
                  description={t('Disk')}
                />
              </div>
              <div className={styles.title}>
                <Text
                  key="GPU"
                  icon="gpu"
                  title={
                    obj.flavor_detail.gpus.length >= 1
                      ? obj.flavor_detail.gpus.length === 1
                        ? `${obj.flavor_detail.gpus[0].quantity} ${obj.flavor_detail.gpus[0].name}`
                        : `${obj.flavor_detail.gpus[0].name} ${t(
                          'RESOURCES_BESIDES'
                        )} ${obj.flavor_detail.gpus.length - 1}${t(
                          'RESOURCES_COUNT'
                        )}`
                      : '-'
                  }
                  description={t('GPU')}
                />
              </div>
            </div>
          </Fragment>
        </div>
      </div>
    )
  }

  const handleExpand = name => {
    setExpandItem(name)
    setIsExpandFlag(!isExpandFlag)
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
    const nodepoolList = await nodePoolStore.fetchListNodePools(
      props.match.params
    )

    const filteredNodepools =
      params.name !== '' && params.name !== undefined
        ? getSearchData(nodepoolList, params.name)
        : nodepoolList

    if (isMounted) {
      setNodepools(filteredNodepools)
    }

    const response = await kaasStore.fetchDetailFlavor(props.match.params)
    if (isMounted) {
      setMachines(response._originData.machines)
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

  // nodepool create
  const handleNodepoolCreate = () => {
    const modal = Modal.open({
      onOk: data => {
        nodePoolStore.createNodePool(data, props.match.params).then(() => {
          Modal.close(modal)
          Notify.success({ content: t('RESOURCES_SAVE_SUCCESSFUL') })
          handleRefresh()
        })
      },
      modal: NodePoolRegistModal,
      store: nodePoolStore,
      ...props,
    })
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
            if (obj.metric.pod.indexOf(props.match.params.name) === 0) {
              kaasCpuFilteredData.push(obj)
            }
          })
        }

        if (values[1].length > 0) {
          // eslint-disable-next-line array-callback-return
          values[1].map(obj => {
            if (obj.metric.pod.indexOf(props.match.params.name) === 0) {
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
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="${props.detailStore.detail.cluster.project}",service="launcher-node-exporter",mode="idle"}[${step}])) * ${times})) / 100`,
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
        expr: `node_memory_MemTotal_bytes{namespace="${props.detailStore.detail.cluster.project}",service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
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

  // eslint-disable-next-line no-shadow
  const renderMonitorings = (nodeName, isExpandFlag, nodeNetwork) => {
    const isExpand = nodeName === expandItem && isExpandFlag
    const loading = isLoading
    const podName = kaasData.memoryData?.find(
      obj => obj.metric?.instance?.split(':')[0] === nodeNetwork?.ip
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
                  darkMode={isExpand}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const handleOpenVnc = (name, namespace) => {
    // 실제 URL 로 변경 요망
    const apiUrl = `http://${location.hostname}:30020`
    let param = `path=k8s/apis/subresources.kubevirt.io/v1alpha3/namespaces/${namespace}/virtualmachineinstances/`
    param = `${param + name}/vnc`

    const popupName = name.replaceAll('-', '')
    window.open(
      `${apiUrl}/vnc_lite.html?${param}`,
      popupName,
      'resizable=yes,toolbar=no,location=no,status=no,scrollbars=no,menubar=no,width=1280,height=840'
    )
  }

  return (
    <>
      <Panel title={'ControlPlane Nodes'}>
        <div className={styles.wrapper}>
          {!!machines &&
            machines
              .filter(machine => {
                return (
                  machine.cluster === props.match.params.name &&
                  machine.controlplane
                )
              })
              .map((detail, index) => (
                <div
                  className={classnames(styles.expandItem, '', {
                    [styles.expanded]:
                      detail.name === expandItem ? isExpandFlag : false,
                  })}
                  key={index}
                >
                  <div className={styles.itemMain}>
                    <div className={styles.icon}>
                      <Icon
                        name="etcd"
                        size={40}
                        type={
                          detail.name !== expandItem
                            ? 'dark'
                            : detail.name === expandItem &&
                              isExpandFlag === false
                              ? 'dark'
                              : 'light'
                        }
                      />
                      <Indicator
                        className={styles.indicator}
                        type={getState(detail?.ready_status, detail?.phase)}
                        flicker
                      />
                    </div>
                    <div className={styles.content}>
                      <div className={styles.text} style={{ width: '25%' }}>
                        <div>
                          {detail.name}
                          <Tooltip content={t('VNC')}>
                            <Icon
                              className="margin-l8"
                              name="terminal"
                              size={16}
                              clickable
                              onClick={() => handleOpenVnc(detail.name, props.match.params.namespace)}
                            />
                          </Tooltip>
                        </div>
                        <p>
                          {t('CREATED_TIME', {
                            diff: getLocalTime(detail.timestamp).format(
                              'YYYY-MM-DD HH:mm:ss'
                            ),
                          })}
                        </p>
                      </div>
                      <div className={styles.text} style={{ width: '15%' }}>
                        <div>
                          {t(`RESOURCES_${detail.phase.toUpperCase()}`)}
                        </div>
                        <p>{t('RESOURCES_STATE')}</p>
                      </div>
                      <div className={styles.text}>
                        {detail?.networks?.filter(
                          network => network.name !== 'k8s-pod-network'
                        ).length > 0 ? (
                          <div>
                            {detail.networks
                              .filter(
                                network => network.name !== 'k8s-pod-network'
                              )
                              .map(obj => (
                                <div key={obj.name}>
                                  {obj.ip} ({obj.name})
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div>-</div>
                        )}
                        <p>{t('RESOURCES_NETWORK')}</p>
                      </div>
                      {renderMonitorings(
                        detail.name,
                        isExpandFlag,
                        detail.networks.find(
                          obj => obj.name === 'k8s-pod-network'
                        )
                      )}
                      <div
                        className={styles.arrow}
                        onClick={() => handleExpand(detail.name)}
                      >
                        <Icon
                          name="chevron-down"
                          type={
                            detail.name !== expandItem
                              ? ''
                              : detail.name === expandItem &&
                                isExpandFlag === false
                                ? ''
                                : 'light'
                          }
                          size={20}
                        />
                      </div>
                    </div>
                  </div>
                  {renderExtraContent(detail)}
                </div>
              ))}
        </div>
      </Panel>
      <Panel title={'NodePools'}>
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
              <Button type="control" onClick={handleNodepoolCreate}>
                {t('RESOURCES_CREATE')}
              </Button>
            </LevelRight>
          </Level>
          {!!nodepools &&
            nodepools.map((detail, index) => (
              <div
                className={classnames(styles.expandItem, '', {
                  [styles.expanded]:
                    detail.name === expandItem ? isExpandFlag : false,
                })}
                key={index}
              >
                <div className={styles.itemMain}>
                  <div className={styles.icon}>
                    <Icon
                      name="nodes"
                      size={40}
                      type={
                        detail.name !== expandItem
                          ? 'dark'
                          : detail.name === expandItem && isExpandFlag === false
                            ? 'dark'
                            : 'light'
                      }
                    />
                    <Indicator
                      className={styles.indicator}
                      type={getPhase(detail?.phase)}
                      flicker
                    />
                  </div>
                  <div className={styles.content}>
                    <div className={styles.text} style={{ width: '20%' }}>
                      <div className={styles.title}>
                        <Link
                          to={`/clusters/${props.match.params.cluster}/projects/${props.match.params.namespace}/nodepools/${props.match.params.name}/${detail.name}`}
                        >
                          {detail.name}
                        </Link>
                      </div>
                      <p>
                        {t('CREATED_TIME', {
                          diff: getLocalTime(detail.timestamp).format(
                            'YYYY-MM-DD HH:mm:ss'
                          ),
                        })}
                      </p>
                    </div>
                    <div className={styles.text} style={{ width: '14%' }}>
                      <div>{t(`RESOURCES_${detail.phase.toUpperCase()}`)}</div>
                      <p>{t('RESOURCES_STATE')}</p>
                    </div>
                    <div className={styles.text} style={{ width: '20%' }}>
                      <div>{detail.kube_image}</div>
                      <p>{t('RESOURCES_IMAGE')}</p>
                    </div>
                    <div className={styles.text} style={{ width: '14%' }}>
                      <div>{detail.flavor}</div>
                      <p>{t('RESOURCES_FLAVOR')}</p>
                    </div>
                    <div className={styles.text} style={{ width: '8%' }}>
                      <div>{detail.nodepool_replicas}</div>
                      <p>Replicas</p>
                    </div>
                    <div className={styles.text} style={{ width: '8%' }}>
                      <div>{detail.ready_replicas}</div>
                      <p>Ready</p>
                    </div>
                    <div className={styles.text} style={{ width: '8%' }}>
                      <div>{detail.unavailable_replicas}</div>
                      <p>Unavailable</p>
                    </div>
                    <div className={styles.text} style={{ width: '8%' }}>
                      <div>{detail.updated_replicas}</div>
                      <p>Updated</p>
                    </div>
                    <div
                      className={styles.arrow}
                      onClick={() => handleExpand(detail.name)}
                    >
                      <Icon
                        name="chevron-down"
                        type={
                          detail.name !== expandItem
                            ? ''
                            : detail.name === expandItem &&
                              isExpandFlag === false
                              ? ''
                              : 'light'
                        }
                        size={20}
                      />
                    </div>
                  </div>
                </div>
                {renderExtraContent(detail)}
              </div>
            ))}
        </div>
      </Panel>
    </>
  )
}

export default inject('detailStore')(observer(Node))
