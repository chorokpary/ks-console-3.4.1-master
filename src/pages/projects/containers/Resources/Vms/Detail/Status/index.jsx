import { isEmpty, find } from 'lodash'
import React, { useState, useEffect, useMemo } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Icon } from '@kube-design/components'
import { Link } from 'react-router-dom'
import { Panel, Text, Indicator } from 'components/Base'
import { TinyArea } from 'components/Charts'

import * as common from 'utils/resources'
import { getAreaChartOps } from 'utils/monitoring'

import DetailSecurityGroupList from 'pages/clusters/containers/Resources/components/DetailSecurityGroupList'

import CustomStore from 'stores/monitoring/custom/monitor'
import styles from './index.scss'

const Status = props => {
  const store = props.detailStore
  const customStore = new CustomStore()

  const { cluster } = props.match.params

  const [detailFlavor, setDetailFlavor] = useState(null)
  const [detailNetwork, setDetailNetwork] = useState([])
  const [detailSecurityGroup, setDetailSecurityGroup] = useState([])
  const [detailVolume, setDetailVolume] = useState([])
  const [detailNetworkStorage, setDetailNetworkStorage] = useState(null)

  const [vmCpuData, setVmCpuData] = useState([])
  const [vmMemoryData, setVmMemoryData] = useState([])

  const intiParams = { times: 50, step: '10m' }

  const categoryOrder = {
    networks: 0,
    sriovs: 1,
    physicalnetworks: 2,
  };

  const sortedDetailNetwork = useMemo(() => {
    return [...detailNetwork].sort((a, b) => {
      // first compare by category priority
      const catDiff = categoryOrder[a.endpoint] - categoryOrder[b.endpoint];
      if (catDiff !== 0) return catDiff;

      // if same category, compare by name
      return a.name.localeCompare(b.name);
    });
  }, [detailNetwork]);

  const sortedDetailVolume = common.useSorted(detailVolume, 'name')
  const sortedDetailSecurityGroup = common.useSorted(detailSecurityGroup, 'name')

  useEffect(() => {
    if (!store.detail.vm) return

    const fnGetFlavor = async () => {
      setDetailFlavor(store.detail.vm?.flavor)
    }

    const fnGetNetwork = async () => {
      setDetailNetwork([])

      const networkData = store.networksList
      const networkNameArray = store.detail.vm?.networks.map(item => item.name)
      const filterData = networkData.filter(item => {
        return networkNameArray.includes(item.name)
      })

      const sriovNetworkData = store.sriov_networks
      const sriovFilterData = sriovNetworkData.filter(item => {
        return networkNameArray.includes(item.name)
      })

      const physicalNetworkData = store.physicalnetworksList
      const physicalNetworkFilterData = physicalNetworkData?.filter(item => {
        return networkNameArray.includes(item.name)
      })

      if (filterData.length > 0) {
        const promises = filterData.filter(async network => {
          if (network.name !== 'k8s-pod-network') {
            const networkDetail = await request.get(
              `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.match.params.cluster}/edgetron/resources/kubevirt/networks/${network.name}?project=${network.project}`
            )
            networkDetail.network.endpoint = 'networks'
            networkDetail.network.unique = 'project_name'
            setDetailNetwork(value => [...value, networkDetail.network])
          }
        })
        await Promise.all(promises)
      }

      if (sriovFilterData.length > 0) {
        const promises = sriovFilterData.filter(async network => {
          if (network.name !== 'k8s-pod-network') {
            const networkDetail = await request.get(
              `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.match.params.cluster}/edgetron/resources/kubevirt/sriov_networks/${network.name}`
            )
            networkDetail.network.endpoint = 'sriovs'
            networkDetail.network.unique = 'name'
            setDetailNetwork(value => [...value, networkDetail.network])
          }
        })
        await Promise.all(promises)
      }

      if (physicalNetworkFilterData.length > 0) {
        const promises = physicalNetworkFilterData.filter(async network => {
          if (network.name !== 'k8s-pod-network') {
            const networkDetail = await request.get(
              `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.match.params.cluster}/edgetron/resources/kubevirt/physical_networks/${network.name}?project=${network.project}`
            )
            networkDetail.physicalnetwork.endpoint = 'physicalnetworks'
            networkDetail.physicalnetwork.unique = 'project_name'
            setDetailNetwork(value => [...value, networkDetail.physicalnetwork])
          }
        })
        await Promise.all(promises)
      }
    }

    const fnGetSecurityGroup = async () => {
      setDetailSecurityGroup([])
      const securityData = store.securigyGroupList
      const securityIdArray = store.detail.vm.security_groups.map(
        item => item.name
      )
      const filterData = securityData.filter(item =>
        securityIdArray.includes(item.name)
      )
      setDetailSecurityGroup(filterData)
    }

    const fnGetVolume = async () => {
      const volumeData = store.volumeList?.filter(
        el => el.used_by_vmi === store.detail.vm?.name
      )
      setDetailVolume(volumeData)
    }
    
    const fnGetNetworkStorage = async () => {
      setDetailNetworkStorage(store.networkStorageInfo)
    }

    fnGetFlavor()
    fnGetNetwork()
    fnGetSecurityGroup()
    fnGetVolume()
    fetchData(intiParams)
    fnGetNetworkStorage()
  }, [store])

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

  const fetchData = async params => {
    const paramsData = Object.assign(params, {
      start: params.start,
      end: params.end,
      step: getMinuteValue(params.step),
      times: params.times,
      namespace: store.detail.vm.project,
    })

    if (!paramsData.start || !paramsData.end) {
      const timeRange = getTimeRange(paramsData)
      paramsData.start = timeRange.start
      paramsData.end = timeRange.end
    }

    const getVmCpuUsageData = async () => {
      const cpuLinuxDataExpr = `linux:vm:cpu:usage_percent:5m`
      const cpuWindowsDataExpr = `windows:vm:cpu:usage_percent:5m`

      const cpuData = await customStore.fetchMetric({
        expr:
          store.detail.vm.os_type === 'linux'
            ? cpuLinuxDataExpr
            : cpuWindowsDataExpr,
        ...paramsData,
      })

      const vmCpuMetricData = find(cpuData, data => {
        if (
          data.metric.pod === store.detail.vm.name &&
          data.metric.namespace === store.detail.vm.project
        )
          return data
      })

      // 배열 처리
      const vmCpuArray = []
      !!vmCpuMetricData && vmCpuArray.push(vmCpuMetricData)
      setVmCpuData(vmCpuArray)
    }

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const memoryLinuxDataExpr = `linux:vm:memory:used_bytes:raw`
      const memoryWindowsDataExpr = `windows:vm:memory:used_bytes:raw`

      const memoryData = await customStore.fetchMetric({
        expr:
          store.detail.vm.os_type === 'linux'
            ? memoryLinuxDataExpr
            : memoryWindowsDataExpr,
        ...paramsData,
      })

      const vmMemoryMetricData = find(memoryData, data => {
        if (
          data.metric.pod === store.detail.vm.name &&
          data.metric.namespace === store.detail.vm.project
        )
          return data
      })

      // 배열 처리
      const vmMemoryArray = []
      !!vmMemoryMetricData && vmMemoryArray.push(vmMemoryMetricData)
      setVmMemoryData(vmMemoryArray)
    }

    getVmCpuUsageData()
    getVmMemoryUsageData()
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
    const isExpand = false
    const loading = false

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

  const getState = state => {
    if (
      state === 'Provisioning' ||
      state === 'Starting' ||
      state === 'Booting' ||
      state === 'Stopping' ||
      state === 'Terminating' ||
      state === 'Migrating' ||
      state === 'WaitingForVolumeBinding'
    ) {
      return 'waiting'
    }
    if (state === 'Running') {
      return 'running'
    }
    if (state === 'Stopped' || state === 'Paused') {
      return 'stopped'
    }

    return 'error'
  }

  return (
    <>
      <div>
        {/* 가상 머신 */}
        <Panel title={t('RESOURCES_VM')}>
          <div className={styles.wrapper}>
            <div className={styles.itemVm}>
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
                  <div>
                    {t(`RESOURCES_${store.detail.vm?.state.toUpperCase()}`)}
                  </div>

                  <p>{t('RESOURCES_STATE')}</p>
                </div>
                <div className={styles.text}>
                  <div>
                    {store.detail.vm?.node ? store.detail.vm?.node : '-'}
                  </div>
                  <p>{t('RESOURCES_NODE')}</p>
                </div>
                {renderMonitorings()}
              </div>
            </div>
          </div>
        </Panel>

        {/* Flavor */}
        {!!detailFlavor && (
          <Panel title={'Flavor'}>
            <div className={styles.wrapper}>
              <div className={classnames(styles.itemFlavor)}>
                <div className={styles.icon}>
                  <Icon name="apps" size={40} />
                </div>
                <div className={classnames(styles.title, styles.name)}>
                  <div>
                    <Link
                      to={`/clusters/${cluster}/flavors/${detailFlavor.name}`}
                    >
                      {detailFlavor.name}
                    </Link>
                  </div>
                  <p>{t('RESOURCES_NAME')}</p>
                </div>
                <div className={styles.title}>
                  <Text
                    key="CPU"
                    icon="cpu"
                    title={`${detailFlavor.vcpus} Core`}
                    description={t('CPU')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key="Memory"
                    icon="memory"
                    title={`${common.fnSetBytes(detailFlavor.ram)} GiB`}
                    description={t('Memory')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key="Disk"
                    icon="storage"
                    title={`${detailFlavor.root_disk} GiB`}
                    description={t('Disk')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key="GPU"
                    icon="gpu"
                    title={
                      detailFlavor.gpus.length >= 1
                        ? detailFlavor.gpus.length === 1
                          ? `${detailFlavor.gpus[0].quantity} ${detailFlavor.gpus[0].name}`
                          : `${detailFlavor.gpus[0].name} ${t(
                              'RESOURCES_BESIDES'
                            )} ${detailFlavor.gpus.length - 1}${t(
                              'RESOURCES_COUNT'
                            )}`
                        : '-'
                    }
                    description={t('GPU')}
                  />
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* 보안그룹 */}
        {store.detail.vm?.security_groups.length > 0 && (
          <DetailSecurityGroupList
            securityGroupData={sortedDetailSecurityGroup}
            cluster={cluster}
            namespace={store.detail.vm.project}
          />
        )}

        {/* 네트워크 */}
        {detailNetwork.length > 0 && (
          <Panel title={t('RESOURCES_NETWORK')}>
            <div className={styles.wrapper}>
              {sortedDetailNetwork.map((obj, index) => (
                <div className={classnames(styles.itemNetwork)} key={index}>
                  <div className={styles.icon}>
                    {!obj.resource_name ? (
                      <Icon name={`network-duotone`} size={40} />
                    ) : (
                      <i className="ico-type40-sriov"></i>
                    )}
                  </div>
                  <div className={classnames(styles.title, styles.name)}>
                    <div>
                      {obj.unique === 'name' ? (
                        <Link
                          to={`/clusters/${cluster}/${obj.endpoint}/${obj.name}`}
                        >
                          {obj.name}
                        </Link>
                      ) : (
                        <Link
                          to={`/clusters/${cluster}/projects/${obj.project}/${obj.endpoint}/${obj.name}`}
                        >
                          {obj.name}
                        </Link>
                      )}
                    </div>
                    <p>{t('RESOURCES_NAME')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.type.toUpperCase()}</div>
                    <p>{t('RESOURCES_TYPE_YOO')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.cidr}</div>
                    <p>CIDR</p>
                  </div>
                  <div className={styles.title}>
                    <div>
                      {`${
                        obj.gateway_ip === undefined || obj.gateway_ip === ''
                          ? '-'
                          : obj.gateway_ip
                      }`}
                    </div>
                    <p>{t('RESOURCES_GATEWAY')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* 볼륨 */}
        {detailVolume.length > 0 && (
          <Panel title={t('RESOURCES_VOLUME')}>
            <div className={styles.wrapper}>
              {sortedDetailVolume.map((obj, index) => {
                return (
                  <div className={classnames(styles.itemVolume)} key={index}>
                    <div className={styles.icon}>
                      <Icon name="storage" size={40} />
                    </div>
                    <div className={classnames(styles.title, styles.name)}>
                      <div>
                        <Link
                          to={`/clusters/${cluster}/projects/${obj.project}/resourcesvolumes/${obj.name}`}
                        >
                          {obj.name}
                        </Link>
                      </div>
                      <p>{t('RESOURCES_NAME')}</p>
                    </div>
                    <div className={styles.attribute}>
                      <div>
                        {obj.access_modes.map(mode => (
                          <p key={mode}>{mode}</p>
                        ))}
                      </div>
                      <p>{t('RESOURCES_ACCESS_MODE')}</p>
                    </div>
                    <div className={styles.attribute}>
                      <div>{obj.capacity}</div>
                      <p>{t('RESOURCES_CAPACITY')}</p>
                    </div>
                    <div className={styles.attribute}>
                      <div>
                        {t(`RESOURCES_IMAGE_${obj.phase.toUpperCase()}`)}
                      </div>
                      <p>{t('RESOURCES_STATE')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        )}

        {/* 네트워크 스토리지 */}
        {!!detailNetworkStorage && (
          <Panel title={t('RESOURCES_NETWORK_STORAGE')}>
            <div className={styles.wrapper}>
              <div className={classnames(styles.itemVolume)}>
                <div className={styles.icon}>
                  <Icon name="storage" size={40} />
                </div>
                <div className={classnames(styles.title, styles.name)}>
                  <div>
                    <Link
                      to={`/clusters/${cluster}/projects/${detailNetworkStorage.project}/networkstorages/${detailNetworkStorage.name}`}
                    >
                      {detailNetworkStorage.name}
                    </Link>
                  </div>
                  <p>{t('RESOURCES_NAME')}</p>
                </div>
                <div className={styles.attribute}>
                  <div>{detailNetworkStorage.protocol.toUpperCase()}</div>
                  <p>{t('RESOURCES_PROTOCOL')}</p>
                </div>
                <div className={styles.attribute}>
                  <div>{detailNetworkStorage.transport.toUpperCase()}</div>
                  <p>{t('RESOURCES_TRANSPORT')}</p>
                </div>
                <div className={styles.attribute}>
                  <div>{detailNetworkStorage.mount_point}</div>
                  <p>{t('RESOURCES_MOUNT_POINT')}</p>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </>
  )
}

export default inject('detailStore')(observer(Status))