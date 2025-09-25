import { isEmpty } from 'lodash'
import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

import pathToRegexp from 'path-to-regexp'
import { observer, inject } from 'mobx-react'
import { renderRoutes } from 'utils/router.config'

import { getAreaChartOps, getCustomValue } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import Banner from 'components/Cards/Banner'

import { SimpleArea } from 'components/Charts'

import { InputSearch, Button } from '@kube-design/components'

import VmStore from 'stores/resources/vms'
import GpuNodeStore from 'stores/resources/gpunodes'

import routes from './routes'
import styles from './index.scss'

const NODES = 'nodes'
const MIG_INSTANCE_COUNT_TAB = {
  name: t('RESOURCES_GPU_MONITORING_MIG_INSTANCE_COUNT'),
  icon: 'ico-type-instance',
  value: '-',
}

const sortByNameAsc = (arr) => {
  return arr.sort((a, b) => {
    const nameA = (a.name || '').toUpperCase()
    const nameB = (b.name || '').toUpperCase()

    if (nameA < nameB) {
      return -1
    }

    if (nameA > nameB) {
      return 1
    }

    return 0
  })
}

const getGpuType = (selected) => {
  if (!selected) {
    return '-'
  }

  if ('model' in selected) {
    return selected?.model ?? '-'
  }

  if ('gpus' in selected) {
    return selected?.gpus?.[0]?.split('/')[1] ?? '-'
  }
}

const getGpuCount = (selected) => {
  if (!selected) {
    return '-'
  }

  if ('gpus' in selected) {
    return selected?.gpus?.length ?? 0
  }

  if ('count' in selected) {
    return selected.count ?? 0
  }
  return '-'
}

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

const MonitorStatusTab = ({ icon, name, value }) => {
  return (
    <div className="data-box-card">
      <div className="data-box-icon">
        <i className={icon}></i>
      </div>
      <div className="data-box-info">
        <p className="data-box-label">{name}</p>
        <span className="data-box-value">{value}</span>
      </div>
    </div>
  )
}

const index = props => {
  const customStore = new CustomStore()
  const { isLoading, isRefreshing } = customStore

  const gpuNodeStore = new GpuNodeStore()
  const gpuVmStore = new VmStore()
  const cluster = props.match.params.cluster

  const [monitoringType, setMonitoringType] = useState(props.location.pathname.split('/').pop())

  const [gpuNodesData, setGpuNodesData] = useState([])
  const [gpuVmsData, setGpuVmsData] = useState([])

  const [vmGpuUtilData, setVmGpuUtilData] = useState([])
  const [vmGpuRamData, setVmGpuRamData] = useState([])
  const [vmGpuTempData, setVmGpuTempData] = useState([])
  const [vmGpuPowerData, setVmGpuPowerData] = useState([])
  const [vmGpuNvlinkData, setVmGpuNvlinkData] = useState([])
  const [vmGpuInboundData, setVmGpuInboundData] = useState([])
  const [vmGpuOutboundData, setVmGpuOutboundData] = useState([])

  const [nodeInVmCount, setNodeInVmCount] = useState('-')

  const [selected, setSelected] = useState(null)
  const [fetchParams, setFetchParams] = useState({})

  const fetchVmGpuStores = async () => {
    const vmStores = await gpuVmStore.fetchList({ cluster, limit: 10000 })
    return vmStores.filter(item => item.gpus.length > 0) || []
  }

  const fetchNodeStores = async () => {
    return await gpuNodeStore.fetchList({ cluster, limit: 10000 })
  }

  const getVmGpuUtilData = async (tabName, paramsData) => {
    let gpuUtilDataExpr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", ${selected?.name ? `pod="${selected.name}",` : ''} namespace="${cluster}"} / 100`
    if (tabName === NODES) {
      gpuUtilDataExpr = `avg by (gpu) (DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", ${selected?.name ? `pod=~"${selected.name}",` : ''} namespace="${cluster}"}) / 100`
    }

    const vmGpuUtilData = await customStore.fetchMetric({
      expr: gpuUtilDataExpr,
      ...paramsData,
      cluster,
    })

    setVmGpuUtilData(vmGpuUtilData)
  }

  const getVmGpuRamData = async (tabName, paramsData) => {
    let gpuRamDataExpr = `DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", ${selected?.name ? `pod="${selected.name}",` : ''} namespace="${cluster}"} * 1000000`

    if (tabName === NODES) {
      gpuRamDataExpr = `avg by (gpu)(DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", ${selected?.name ? `pod=~"${selected.name}",` : ''} namespace="${cluster}"}) * 1000000`
    }

    const vmGpuRamData = await customStore.fetchMetric({
      expr: gpuRamDataExpr,
      ...paramsData,
      cluster,
    })

    setVmGpuRamData(vmGpuRamData)
  }

  const getVmGpuPowerData = async (tabName, paramsData) => {
    let gpuPowerDataExpr = `DCGM_FI_DEV_POWER_USAGE{job="launcher-dcgm-exporter", ${selected?.name ? `pod="${selected.name}",` : ''} namespace="${cluster}"}`

    if (tabName === NODES) {
      gpuPowerDataExpr = `avg by (gpu)(DCGM_FI_DEV_POWER_USAGE{job="launcher-dcgm-exporter", ${selected?.name ? `pod=~"${selected.name}",` : ''} namespace="${cluster}"})`
    }

    const vmGpuPowerData = await customStore.fetchMetric({
      expr: gpuPowerDataExpr,
      ...paramsData,
      cluster,
    })

    setVmGpuPowerData(vmGpuPowerData)
  }

  const getVmGpuTempData = async (tabName, paramsData) => {
    let gpuTempDataExpr = `DCGM_FI_DEV_GPU_TEMP{job="launcher-dcgm-exporter", ${selected?.name ? `pod="${selected.name}",` : ''} namespace="${cluster}"}`
    if (tabName === NODES) {
      gpuTempDataExpr = `avg by (gpu)(DCGM_FI_DEV_GPU_TEMP{job="launcher-dcgm-exporter", ${selected?.name ? `pod=~"${selected.name}",` : ''} namespace="${cluster}"})`
    }

    const vmGpuTempData = await customStore.fetchMetric({
      expr: gpuTempDataExpr,
      ...paramsData,
      cluster,
    })

    setVmGpuTempData(vmGpuTempData)
  }

  const getVmGpuNvlinkData = async (tabName, paramsData) => {
    let gpuNvlinkDataExpr = `(DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL{job="launcher-dcgm-exporter", 
      ${selected?.name ? `pod="${selected.name}",` : ''} namespace="${cluster}"}) * ${getCustomValue('bandwidthBytes', 'MBps')}`

    if (tabName === NODES) {
      gpuNvlinkDataExpr = `sum by (gpu)(DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL{job="launcher-dcgm-exporter", ${selected?.name ? `pod=~"${selected.name}",` : ''} namespace="${cluster}"}) * ${getCustomValue(
        'bandwidthBytes',
        'MBps'
      )}`
    }
    const gpuNvlinkData = await customStore.fetchMetric({
      expr: gpuNvlinkDataExpr,
      ...paramsData,
      cluster,
      namespace: 'default',
    })
    setVmGpuNvlinkData(gpuNvlinkData)
  }

  const getVmGpuInboundData = async (tabName, paramsData) => {
    let inboundLinuxDataExpr = `rate(node_infiniband_port_data_received_bytes_total{job="launcher-node-exporter", ${selected?.name ? `pod="${selected.name}",` : ''} namespace="${cluster}"}[2m]) * 8`
    if (tabName === NODES) {
      inboundLinuxDataExpr = `sum by (device)(rate(node_infiniband_port_data_received_bytes_total{job="launcher-node-exporter", ${selected?.name ? `pod=~"${selected.name}",` : ''} namespace="${cluster}"}[2m]) * 8)`
    }

    const gpuInboundData = await customStore.fetchMetric({
      expr: inboundLinuxDataExpr,
      ...paramsData,
      cluster,
    })

    setVmGpuInboundData(gpuInboundData)
  }

  const getVmGpuOutboundData = async (tabName, paramsData) => {
    let outboundLinuxDataExpr = `rate(node_infiniband_port_data_transmitted_bytes_total{job="launcher-node-exporter", ${selected?.name ? `pod="${selected.name}",` : ''} namespace="${cluster}"}[2m]) * 8`
    if (tabName === NODES) {
      outboundLinuxDataExpr = `sum by (device)(rate(node_infiniband_port_data_transmitted_bytes_total{job="launcher-node-exporter", ${selected?.name ? `pod=~"${selected.name}",` : ''} namespace="${cluster}"}[2m]) * 8)`
    }
    const gpuOutboundData = await customStore.fetchMetric({
      expr: outboundLinuxDataExpr,
      ...paramsData,
      cluster,
    })

    setVmGpuOutboundData(gpuOutboundData)
  }

  const getNodeInVms = async () => {

    if (!selected || monitoringType !== NODES) {
      return
    }

    return await gpuVmStore.fetchVmsDetail({ match: 'node', cluster, name: selected?.node })
  }

  const getNodeMappingNames = (nodeStores, vmStores) => {
    return (
      nodeStores.map(node => {
        const foundVm = vmStores.find(vm => vm.node === node.name)
        return {
          ...node,
          name: foundVm ? foundVm.name : null,
          node: foundVm ? foundVm.node : null,
        }
      }) || []
    )
  }

  const fetchData = async () => {
    const vmStores = sortByNameAsc(await fetchVmGpuStores())
    const nodeStores = sortByNameAsc(await fetchNodeStores())
    const nodeMappingNames = getNodeMappingNames(nodeStores, vmStores)

    setGpuVmsData(vmStores)
    setGpuNodesData(nodeMappingNames)

    if (monitoringType === NODES) {
      setSelected(nodeMappingNames[0] ?? null)
    }

    if (monitoringType === 'vms') {
      setSelected(vmStores[0] ?? null)
    }
  }

  const getSearchData = async ({ ...params } = {}) => {

    const { name } = params

    if (!name) {
      return
    }

    const vmStores = sortByNameAsc(await fetchVmGpuStores())
    const nodeStores = sortByNameAsc(await fetchNodeStores())

    if (monitoringType === NODES) {
      const nodeMappingNames = getNodeMappingNames(nodeStores, vmStores)

      setGpuNodesData(nodeMappingNames.filter(node => node.node?.includes(name)) ?? [])
      return
    }

    setGpuVmsData(vmStores.filter(node => node.name.includes(name)) ?? [])
  }

  const fetchSearch = async params => {
    setFetchParams(params)
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

    const nodeInVms = await getNodeInVms()

    setNodeInVmCount(nodeInVms?.total ?? '-')
    getVmGpuUtilData(monitoringType, paramsData)
    getVmGpuRamData(monitoringType, paramsData)
    getVmGpuTempData(monitoringType, paramsData)
    getVmGpuPowerData(monitoringType, paramsData)
    getVmGpuNvlinkData(monitoringType, paramsData)
    getVmGpuInboundData(monitoringType, paramsData)
    getVmGpuOutboundData(monitoringType, paramsData)
  }

  const configs = [
    {
      type: 'utilisation',
      title: 'RESOURCES_GPU_UTILIZATION',
      unit: '%',
      legend: vmGpuUtilData.map(item => 'GPU' + item.metric.gpu),
      data: vmGpuUtilData,
    },
    {
      type: 'utilisation',
      title: 'RESOURCES_GPU_RAM_USAGE',
      unit: '%',
      unitType: 'memory',
      legend: vmGpuRamData.map(item => `GPU${item.metric.gpu}`),
      data: vmGpuRamData,
    },
    {
      type: 'utilisation',
      title: t('RESOURCES_GPU_TEMPERATURE'),
      unit: '°C',
      legend: vmGpuTempData.map(item => 'GPU' + item.metric.gpu),
      data: vmGpuTempData,
    },
    {
      type: 'utilisation',
      title: t('RESOURCES_GPU_POWER'),
      unit: 'W',
      legend: vmGpuPowerData.map(item => 'GPU' + item.metric.gpu),
      data: vmGpuPowerData,
    },
    {
      type: 'bandwidth',
      title: 'IB ' + t('RESOURCES_INBOUND'),
      unitType: 'bandwidth',
      legend: vmGpuInboundData.map(item => item.metric.device),
      data: vmGpuInboundData,
    },
    {
      type: 'bandwidth',
      title: 'IB ' + t('RESOURCES_OUTBOUND'),
      unitType: 'bandwidth',
      legend: vmGpuOutboundData.map(item => item.metric.device),
      data: vmGpuOutboundData,
    },
    {
      type: 'bandwidth',
      title: `NVLink ${t('TRAFFIC')}`,
      unitType: 'bandwidthBytes',
      legend: vmGpuNvlinkData.map(item => 'GPU' + item.metric.gpu),
      data: vmGpuNvlinkData,
    },
  ]

  const handleSearch = value => {
    getSearchData({
      name: value,
    })
  }

  const renderHeader = () => {
    return (
      <div className={styles.header}>
        <InputSearch
          className={styles.search}
          name="search"
          placeholder={t('SEARCH_BY_NAME')}
          onSearch={handleSearch}
        />
        <div className={styles.actions}>
          <Button type="flat" icon="refresh" onClick={() => fetchData()} />
        </div>
      </div>
    )
  }

  const renderNav = () => {
    const { params } = props.match
    return (
      <div className={styles.nav}>
        {routes.map(route => {
          if (!route.title) {
            return null
          }

          return (
            <NavLink
              key={`${route.path}-${route.title}`}
              className={styles.navItem}
              activeClassName={styles.active}
              to={pathToRegexp.compile(route.path)(params)}
            >
              {t(route.title)}
            </NavLink>
          )
        })}
      </div>
    )
  }

  const nodePanelTab = [
    // TODO: MIG 추후 지원
    // MIG_INSTANCE_COUNT_TAB,
    {
      name: t('RESOURCES_GPU_MONITORING_VM_COUNT'),
      icon: 'ico-type-gpucluster',
      value: nodeInVmCount,
    },
  ]

  const options = [
    {
      name: t('RESOURCES_GPU_MONITORING_TYPE'),
      icon: 'ico-type-clusternode-gpu',
      value: getGpuType(selected),
    },
    {
      name: t('RESOURCES_GPU_MONITORING_COUNT'),
      icon: 'ico-type-hostgpu',
      value: getGpuCount(selected),
    },
    ...(monitoringType === NODES ? nodePanelTab : []),
  ]

  useEffect(() => {
    fetchData()
  }, [monitoringType])

  useEffect(() => {
    if (!selected) {
      return
    }
    fetchSearch({ ...fetchParams })
  }, [selected])

  return (
    <>
      <Banner
        icon="linechart"
        title={t('RESOURCES_GPU_MONITORING')}
        description={t('RESOURCES_GPU_MONITORING_DESC')}
      />
      {renderNav()}
      <MonitoringController
        title={t('RESOURCES_GPU_MONITORING')}
        onFetch={fetchSearch}
        loading={isLoading}
        refreshing={isRefreshing}
      >
        {/* todo - 화면 분리 */}
        <div style={{ display: 'flex' }}>
          <div
            style={{
              flex: 1,
              paddingRight: '20px',
            }}
          >
            {renderRoutes(routes, {
              ...props,
              selected,
              setSelected,
              renderHeader,
              styles,
              gpuNodesData,
              gpuVmsData,
              setMonitoringType,
            })}
          </div>
          <div
            style={{
              flex: 4,
              overflow: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="gpu_mig_monitoring">
              {options.map(option => (
                <MonitorStatusTab
                  key={`${option.name}-${option.value}`}
                  icon={option.icon}
                  name={option.name}
                  value={option.value}
                />
              ))}
            </div>

            {configs.map((item, idx) => {
              const config = getAreaChartOps(item)
              if (isEmpty(config.data)) return null
              return (
                <div
                  key={`${config.title}-${idx}`}
                  style={{ marginBottom: '10px' }}
                >
                  <SimpleArea {...config} />
                </div>
              )
            })}
          </div>
        </div>
      </MonitoringController>
    </>
  )
}

export default inject('rootStore')(observer(index))
