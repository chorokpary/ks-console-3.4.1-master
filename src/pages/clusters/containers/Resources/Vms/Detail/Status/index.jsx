import { get, groupBy, isEmpty } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import axios from "axios";
import { Panel, Text, Indicator } from 'components/Base'
import { Icon, Button, Notify } from '@kube-design/components'
import { TinyArea } from 'components/Charts'
import { Link } from 'react-router-dom'

import styles from './index.scss'

import * as common from 'utils/resources'
import { getAreaChartOps } from 'utils/monitoring'

import DetailSecurityGroupList from 'pages/clusters/containers/Resources/components/DetailSecurityGroupList'

import CustomStore from 'stores/monitoring/custom/monitor'

const Status = (props) => {

  const store = props.detailStore;
  const customStore = new CustomStore();

  const { cluster } = props.match.params;

  const [detailFlavor, setDetailFlavor] = useState(null);
  const [detailNetwork, setDetailNetwork] = useState([]);
  const [detailSecurityGroup, setDetailSecurityGroup] = useState([]);
  const [detailVolume, setDetailVolume] = useState([]);

  const [vmCpuData, setVmCpuData] = useState([]);
  const [vmMemoryData, setVmMemoryData] = useState([]);

  const intiParams = { "times": 50, "step": "10m" }

  useEffect(() => {

    const fnGetFlavor = async () => {
      setDetailFlavor(store.detail.vm?.flavor);
    };

    const fnGetNetwork = async () => {
      setDetailNetwork([]);
      const promises = (store.detail.vm.networks).map(async (network) => {
        if (network.name != "k8s-pod-network") {
          const networkDetail = await axios.get("/edgetron/resources/kubevirt/networks/" + network.name);
          setDetailNetwork(detailNetwork => [...detailNetwork, networkDetail.data.network])
        }
      })
      await Promise.all(promises);
    };

    const fnGetSecurityGroup = async () => {
      setDetailSecurityGroup([]);
      const securityData = store.securigyGroupList;
      const filterData = securityData.filter(item => (store.detail.vm.security_groups).includes(item.name));
      setDetailSecurityGroup(filterData);
    };

    const fnGetVolume = async () => {
      const volumeData = store.volumeList?.filter(el => el.used_by_vmi == store.detail.vm?.name);
      setDetailVolume(volumeData);
    };

    store.detail.vm?.flavor && fnGetFlavor();
    store.detail.vm?.networks && fnGetNetwork();
    store.detail.vm?.security_groups && fnGetSecurityGroup();
    fnGetVolume();
    fetchData(intiParams);
  }, []);

  const getMinuteValue = (timeStr = '60s', hasUnit = true) => {
    const unit = timeStr.slice(-1)
    let value = parseFloat(timeStr)

    switch (unit) {
      default:
      case 's':
        break
      case 'm':
        value *= 60
        break
      case 'h':
        value *= 60 * 60
        break
      case 'd':
        value = value * 24 * 60 * 60
        break
    }
    return hasUnit ? `${value}s` : value
  }

  const getTimeRange = ({ step = '600s', times = 20 } = {}) => {
    const interval = parseFloat(step) * times
    const end = Math.floor(Date.now() / 1000)
    const start = Math.floor(end - interval)

    return { start, end }
  }

  const fetchData = async (params) => {

    const paramsData = Object.assign(params, {
      start: params.start,
      end: params.end,
      step: getMinuteValue(params.step),
      times: params.times,
    })

    if (!paramsData.start || !paramsData.end) {
      const timeRange = getTimeRange(paramsData)
      paramsData.start = timeRange.start
      paramsData.end = timeRange.end
    }

    const getVmCpuUsageData = async () => {
      const vmCpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[5m])) * 100)) / 100`,
        ...paramsData,
      })

      const vmCpuMetricData = _.find(vmCpuData, (data) => {
        if (data.metric.pod === store.detail.id) return data;
      });

      // 배열 처리 
      const vmCpuArray = [];
      !!vmCpuMetricData && vmCpuArray.push(vmCpuMetricData)
      setVmCpuData(vmCpuArray)
    };

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const vmMemoryData = await customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        ...paramsData,
      })

      const vmMemoryMetricData = _.find(vmMemoryData, (data) => {
        if (data.metric.pod === store.detail.id) return data;
      });

      // 배열 처리 
      const vmMemoryArray = [];
      !!vmMemoryMetricData && vmMemoryArray.push(vmMemoryMetricData)
      setVmMemoryData(vmMemoryArray)

    };

    getVmCpuUsageData();
    getVmMemoryUsageData();

  }

  const getMonitoringCfgs = () => [
    {
      type: 'cpu',
      title: 'CPU',
      unitType: 'cpu',
      legend: ['USED'],
      data: vmCpuData,
      bgColor: 'transparent',
    },
    {
      type: 'memory',
      title: 'MEMORY',
      unitType: 'memory',
      legend: ['USED'],
      data: vmMemoryData,
      bgColor: 'transparent',
    },
  ]

  const renderMonitorings = () => {

    const isExpand = false;
    const loading = false;

    if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>

    if (isEmpty(vmCpuData) && isEmpty(vmMemoryData))
      return <div className={styles.monitors}>{t('NO_MONITORING_DATA')}</div>

    const configs = getMonitoringCfgs()

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

  const getState = (state) => {
    if (state === 'Provisioning'
      || state === 'Starting'
      || state === 'Stopping'
      || state === 'Terminating'
      || state === 'Migrating') {
      return "waiting"
    } else if (state === 'Running') {
      return "running"
    } else if (state === 'Stopped' || state === 'Paused') {
      return "stopped"
    } else if (state === 'Unknown') {
      return "error"
    } else {
      return "error"
    }
  }

  return (
    <>
      <div>

        {/* 가상 머신 */}
        <Panel title={t('RESOURCES_VM')}>
          <div className={styles.wrapper}>
            <div className={styles.itemVm} >
              <div className={styles.icon}>
                <i className="ico-type40-vm"></i>
                <Indicator
                  className={styles.indicator}
                  type={getState(store.detail.vm?.state)}
                  flicker
                />
              </div>
              <div className={styles.content}>
                <div className={styles.text}>
                  <div>{store.detail.vm?.name}</div>
                  <p>{t('RESOURCES_NAME')}</p>
                </div>
                <div className={styles.text}>
                  <div>{store.detail.vm?.state}</div>
                  <p>{t('RESOURCES_STATE')}</p>
                </div>
                <div className={styles.text}>
                  <div>{store.detail.vm?.node}</div>
                  <p>{t('RESOURCES_NODE')}</p>
                </div>
                {renderMonitorings()}
              </div>
            </div>
          </div>
        </Panel>

        {/* Flavor */}
        {!!detailFlavor &&
          <Panel title={"Flavor"}>
            <div className={styles.wrapper}>
              <div className={classnames(styles.itemFlavor)}>
                <div className={styles.icon}>
                  <Icon name="apps" size={40} />
                </div>
                <div className={classnames(styles.title, styles.name)}>
                  <div><Link to={`/clusters/${cluster}/flavors/${detailFlavor.name}`}>{detailFlavor.name}</Link></div>
                  <p>{t('RESOURCES_NAME')}</p>
                </div>
                <div className={styles.title}>
                  <div>
                    {
                      detailFlavor.devices.length >= 1 ?
                        detailFlavor.devices.length == 1 ? detailFlavor.devices[0].name : detailFlavor.devices[0].name + " "+t('RESOURCES_BESIDES')+" " + (detailFlavor.devices.length - 1) + t('RESOURCES_COUNT')
                        : "-"
                    }
                  </div>
                  <p>{t('RESOURCES_HOST_DEVICE')}</p>
                </div>
                <div className={styles.title}>
                  <Text
                    key='CPU'
                    icon='cpu'
                    title={detailFlavor.vcpus + " Core"}
                    description={t('CPU')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key='Memory'
                    icon='memory'
                    title={common.fnSetBytes(detailFlavor.ram) + " Gib"}
                    description={t('Memory')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key='Disk'
                    icon='storage'
                    title={detailFlavor.root_disk + " Gib"}
                    description={t('Disk')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key='GPU'
                    icon='gpu'
                    title={detailFlavor.gpus.length >= 1 ?
                      detailFlavor.gpus.length == 1 ? detailFlavor.gpus[0].name : detailFlavor.gpus[0].name + " "+t('RESOURCES_BESIDES')+" " + (detailFlavor.gpus.length - 1) + t('RESOURCES_COUNT')
                      : "-"}
                    description={t('GPU')}
                  />
                </div>
              </div>
            </div>
          </Panel>
        }

        {/* 보안그룹 */}
        {
          store.detail.vm?.security_groups.length > 0 && <DetailSecurityGroupList securityGroupData={detailSecurityGroup} cluster={cluster}/>
        }

        {/* 네트워크 */}
        {detailNetwork.length > 0 &&
          <Panel title={"네트워크"}>
            <div className={styles.wrapper}>
              {detailNetwork.map((obj, index) => (
                <div className={classnames(styles.itemNetwork)} key={index}>
                  <div className={styles.icon}>
                    <Icon name="network-duotone" size={40} />
                  </div>
                  <div className={classnames(styles.title, styles.name)}>
                    <div><Link to={`/clusters/${cluster}/networks/${obj.name}`}>{obj.name}</Link></div>
                    <p>{t('RESOURCES_NAME')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.type}</div>
                    <p>{t('RESOURCES_TYPE_YOO')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.cidr}</div>
                    <p>CIDR</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.gateway_ip}</div>
                    <p>{t('RESOURCES_GATEWAY')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        }

        {/* 볼륨 */}
        {detailVolume.length > 0 &&
          <Panel title={t('RESOURCES_VOLUME')}>
            <div className={styles.wrapper}>
              {detailVolume.map((obj, index) => (
                <div className={classnames(styles.itemVolume)} key={index}>
                  <div className={styles.icon}>
                    <Icon name="storage" size={40} />
                  </div>
                  <div className={classnames(styles.title, styles.name)}>
                    <div><Link to={`/clusters/${cluster}/resourcesvolumes/${obj.name}`}>{obj.name}</Link></div>
                    <p>{t('RESOURCES_NAME')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>
                      {(obj.access_modes).map((mode) => (<p key={mode}>{mode}</p>))}
                    </div>
                    <p>{t('RESOURCES_ACCESS_MODE')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.capacity}</div>
                    <p>{t('RESOURCES_CAPACITY')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.phase}</div>
                    <p>{t('RESOURCES_STATE')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        }

      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status))

