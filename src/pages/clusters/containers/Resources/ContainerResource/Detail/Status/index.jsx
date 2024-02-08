import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import classnames from 'classnames'

import { isEmpty, throttle } from 'lodash'
import { Indicator } from 'components/Base'
import ReplicaCard from 'clusters/components/Cards/Replica'
import { Panel, Text } from 'components/Base'
import { Icon, Button, Notify } from '@kube-design/components'
import { TinyArea } from 'components/Charts'
import { getAreaChartOps } from 'utils/monitoring'

import CustomStore from 'stores/monitoring/custom/monitor'

import { getLocalTime } from 'utils'
import * as common from 'utils/resources'

import styles from './index.scss'

const step = '5m'
const times = 100

const Status = (props) => {
  const store = props.detailStore;
  const machines = props.detailStore.machines;
  const customStore = new CustomStore();

  const state = [
    { nums: store.detail?.cluster?.cp?.replicas, unavailableNums: store.detail?.cluster?.cp?.replicas },
    { nums: store.detail?.cluster?.md?.replicas, unavailableNums: store.detail?.cluster?.md?.replicas }
  ]

  const names = [t('RESOURCES_MASTER_COUNT'), t('RESOURCES_WORKER_COUNT')]
  const text = { title: t('RESOURCES_ADJUST_WORKER') , content: t('RESOURCES_CHANGE_WORKER_COUNT') }

  const enabledActions = () => {
    return globals.app.getActions({
      module: module(),
      ...props.match.params,
      project: props.match.params.namespace,
    })
  }

  const module = () => {
    return store.module
  }

  const handleScale = () => {
    const { cluster, namespace, name } = store.detail
    store.scale = { cluster, namespace, name }
  }

  const enableScaleReplica = () => {
    return (
      enabledActions().includes('edit')
    )
  }

  //node script----------------------------------
  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState();

  const getState = (state, phase) => {

    if(phase != "Provisioned"){
      return "updating"
    }

    if (state) {
      return "running"
    } else {
      return "inactive"
    }
  }

  const renderExtraContent = (obj) => {

    return (
      <div className={styles.itemExtra}>
        <div className={styles.containers} >
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
                key='CPU'
                icon='cpu'
                title={obj.flavor_detail.vcpus + " Core"}
                description={t('CPU')}
              />
            </div>
            <div className={styles.title}>
              <Text
                key='Memory'
                icon='memory'
                title={common.fnSetBytes(obj.flavor_detail.ram) + " Gib"}
                description={t('Memory')}
              />
            </div>
            <div className={styles.title}>
              <Text
                key='Disk'
                icon='storage'
                title={obj.flavor_detail.root_disk + " Gib"}
                description={t('Disk')}
              />
            </div>
            <div className={styles.title}>
              <Text
                key='GPU'
                icon='gpu'
                title={obj.flavor_detail.gpus.length >= 1 ?
                  obj.flavor_detail.gpus.length == 1 ? obj.flavor_detail.gpus[0].name : obj.flavor_detail.gpus[0].name + ' ' + t('RESOURCES_BESIDES') + ' ' + (obj.flavor_detail.gpus.length - 1) + t('RESOURCES_COUNT')
                  : "-"}
                description={t('GPU')}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleExpand = (name) => {
    setExpandItem(name);
    setIsExpandFlag(!isExpandFlag)
  }

  //monitoring script----------------------------------------------
  const [kaasData, setKaasData] = useState({ cpuData: [], memoryData: [] });
  const [isLoading, setIsLoading] = useState(true);
  let timer = 0;

  useEffect(() => {
    fetchData(0);

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const fetchData = (timerSec) => {

    timer = setTimeout(async () => {

      let kaasCpuFilteredData = [];
      let kaasMemoryFilteredData = [];

      Promise.all([getCpuUsageData(), getMemoryUsageData()]).then((values) => {
        if (values[0].length > 0) {
          values[0].map(obj => {
            if (obj.metric.pod.split("-control-")[0] === props.match.params.name || obj.metric.pod.split("-md-")[0] === props.match.params.name) {
              kaasCpuFilteredData.push(obj)
            }
          })
        }

        if (values[1].length > 0) {
          values[1].map(obj => {
            if (obj.metric.pod.split("-control-")[0] === props.match.params.name || obj.metric.pod.split("-md-")[0] === props.match.params.name) {
              kaasMemoryFilteredData.push(obj)
            }
          })
        }

        setKaasData({ ...kaasData, ['cpuData']: kaasCpuFilteredData, ['memoryData']: kaasMemoryFilteredData })
      });
      fetchData(5000);
    }, timerSec)
  }

  useEffect(() => {
    setIsLoading(false)
  }, [kaasData])

  // kaas cpu data
  const getCpuUsageData = () => {
    const currentTime = Math.floor(Date.now() / 1000);
    return new Promise(async (resolve, reject) => {
      const cpuFetchData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[${step}])) * ${times})) / 100`,
        start: currentTime - 30000,
        end: currentTime,
      })
      resolve(cpuFetchData)
    })
  };

  // kaas memory data
  const getMemoryUsageData = () => {
    const currentTime = Math.floor(Date.now() / 1000);
    return new Promise(async (resolve, reject) => {
      const memoryFetchData = await customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        start: currentTime - 30000,
        end: currentTime,
      })
      resolve(memoryFetchData)
    })
  };

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

  const renderMonitorings = (nodeName, isExpandFlag, nodeNetwork) => {

    const isExpand = (nodeName == expandItem && isExpandFlag);
    const loading = isLoading;
    const podName = kaasData.memoryData?.find(obj => obj.metric?.instance?.split(":")[0] === nodeNetwork?.ip)?.metric?.pod
    const metrics = {
      ['cpu']: kaasData.cpuData.find(obj => obj.metric.pod === podName)
      , ['memory']: kaasData.memoryData.find(obj => obj.metric.pod === podName)
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

  return (
    <>
      <ReplicaCard
        module={module()}
        detail={{ ...store.detail, state }}
        names={names}
        text={text}
        onScale={handleScale()}
        onFetchData={store.fetchData}
        enableScale={enableScaleReplica()}
        countRange={[1, 10]}
      />

      <Panel title={"Master Node"}>
        <div className={styles.wrapper}>
          {!!machines && machines.filter((obj) => { return obj.name.indexOf(store.detail?.cluster?.cp?.name) > -1 }).map((detail, index) => (
            <div
              className={classnames(styles.expandItem, "", {
                [styles.expanded]: (detail.name == expandItem ? isExpandFlag : false),
              })} key={index}
            >
              <div className={styles.itemMain}>

                <div className={styles.icon}>
                  <Icon name="nodes" size={40} type={detail.name != expandItem ? 'dark' : (detail.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
                  <Indicator
                    className={styles.indicator}
                    type={getState(detail?.ready_status, detail?.phase)}
                    flicker
                  />
                </div>
                <div className={styles.content}>
                  <div className={styles.text} style={{ width: '25%' }}>
                    <div>{detail.name}</div>
                    <p>{getLocalTime(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
                  </div>
                  <div className={styles.text} style={{ width: '15%' }}>
                    <div>{detail.phase}</div>
                    <p>{detail?.ready_status ? 'Ready' : 'Not-ready'}</p>
                  </div>
                  <div className={styles.text}>
                    {detail?.networks?.filter((network) => network.name != "k8s-pod-network").length > 0 ?
                      (<div>
                        {(detail.networks).filter((network) => network.name != "k8s-pod-network").map((obj) => (
                          <div key={obj.name}>{obj.ip}({obj.name})</div>
                        ))}
                      </div>)
                      :
                      <div>-</div>
                    }
                    <p>IP({t('RESOURCES_NETWORK')})</p>
                  </div>
                  {renderMonitorings(detail.name, isExpandFlag, detail.networks.find(obj => obj.name === "k8s-pod-network"))}
                  <div className={styles.arrow} onClick={() => handleExpand(detail.name)}>
                    <Icon name="chevron-down" type={detail.name != expandItem ? '' : (detail.name == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
                  </div>
                </div>

              </div>
              {renderExtraContent(detail)}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={"Worker Node"}>
        <div className={styles.wrapper}>
          {!!machines && machines.filter((obj) => { return obj.name.indexOf(store.detail?.cluster?.cp?.name) == -1 }).map((detail, index) => (
            <div
              className={classnames(styles.expandItem, "", {
                [styles.expanded]: (detail.name == expandItem ? isExpandFlag : false),
              })} key={index}
            >
              <div className={styles.itemMain}>

                <div className={styles.icon}>
                  <Icon name="nodes" size={40} type={detail.name != expandItem ? 'dark' : (detail.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
                  <Indicator
                    className={styles.indicator}
                    type={getState(detail?.ready_status, detail?.phase)}
                    flicker
                  />
                </div>
                <div className={styles.content}>
                  <div className={styles.text} style={{ width: '25%' }}>
                    <div>{detail.name}</div>
                    <p>{getLocalTime(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
                  </div>
                  <div className={styles.text} style={{ width: '15%' }}>
                    <div>{detail.phase}</div>
                    <p>{detail?.ready_status ? 'Ready' : 'Not-ready'}</p>
                  </div>
                  <div className={styles.text}>
                    {detail?.networks?.filter((network) => network.name != "k8s-pod-network").length > 0 ?
                      (<div>
                        {(detail.networks).filter((network) => network.name != "k8s-pod-network").map((obj) => (
                          <div key={obj.name}>{obj.ip}({obj.name})</div>
                        ))}
                      </div>)
                      :
                      <div>-</div>
                    }
                    <p>IP({t('RESOURCES_NETWORK')})</p>
                  </div>
                  {renderMonitorings(detail.name, isExpandFlag, detail.networks.find(obj => obj.name === "k8s-pod-network"))}
                  <div className={styles.arrow} onClick={() => handleExpand(detail.name)}>
                    <Icon name="chevron-down" type={detail.name != expandItem ? '' : (detail.name == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
                  </div>
                </div>

              </div>
              {renderExtraContent(detail)}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
};

export default inject('detailStore')(observer(Status))

