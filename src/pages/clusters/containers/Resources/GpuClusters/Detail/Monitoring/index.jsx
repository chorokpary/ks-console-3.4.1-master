import { get, isEmpty, find, min, set } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import { Panel } from 'components/Base'

import { getChartData, getAreaChartOps } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea } from 'components/Charts'

import styles from './index.scss'
import { Button, InputSearch } from '@kube-design/components'
import VmStore from 'stores/resources/vms'

const index = props => {
  const customStore = new CustomStore()

  const store = new VmStore()
  const cluster = props.detailStore?.detail.cluster
  const perPage = 6
  const [vmDataList, setVmDataList] = useState([])

  const [vmCpuData, setVmCpuData] = useState([])
  const [vmMemoryData, setVmMemoryData] = useState([])
  const [vmInboundData, setVmInboundData] = useState({})
  const [vmOutboundData, setVmOutboundData] = useState({})
  const [vmDiskData, setVmDiskData] = useState([])

  const [selectedVm, setSelectedVm] = useState()
  const [fetchParams, setFetchParams] = useState({})

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

  useEffect(() => {
    fnGetData()
  }, [])

  const fnGetData = async ({ ...params } = {}) => {
    const page = get(params, 'page', 1)
    const detailParams = {
      cluster,
      resource: props.variables,
      id: props.id,
      name: name,
      page: page,
      limit: perPage,
    }

    if (params.name !== '' && params.name !== undefined) {
      ;(detailParams.searchType = 'vm_name'),
        (detailParams.searchName = params.name)
    }

    const vmList = await store.fetchVmsDetail(detailParams)
    const vmData = vmList.vms

    // setVmDataList(vmData)
    // selectedVm ?? setSelectedVm(vmData[0]?.id || '')

    setVmDataList([
      { vmi: { vm_name: 'gpu-wbl-petasus' } },
      { vmi: { vm_name: 'gpu-wbl-aicm' } },
    ])
    selectedVm ?? setSelectedVm('gpu-wbl-petasus')
  }

  const fetchData = async params => {
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

    const getVmCpuUsageData = async () => {
      const cpuLinuxDataExpr = `((sum by (pod,instance) (irate(node_cpu_seconds_total{service="launcher-node-exporter",mode!~"guest.*|idle|iowait"}[5m])) + on(pod, instance) node_uname_info) - 1) / 2`
      const vmCpuData = await customStore.fetchMetric({
        expr: cpuLinuxDataExpr,
        ...paramsData,
        // cluster: props.match.params.cluster,
        cluster: 'wbl-skt-dev',
      })

      const vmCpuMetricData = _.find(vmCpuData, data => {
        if (data.metric.pod === selectedVm) return data
      })

      // 배열 처리
      const vmCpuArray = []
      vmCpuArray.push(vmCpuMetricData)
      setVmCpuData(vmCpuArray)
    }

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const memoryLinuxDataExpr = `node_memory_MemTotal_bytes{service="launcher-node-exporter",pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service="launcher-node-exporter",pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service="launcher-node-exporter",pod!~"virt-launcher-.*"}`

      const vmMemoryData = await customStore.fetchMetric({
        expr: memoryLinuxDataExpr,
        ...paramsData,
        // cluster: props.match.params.cluster,
        cluster: 'wbl-skt-dev',
      })

      const vmMemoryMetricData = _.find(vmMemoryData, data => {
        if (data.metric.pod === selectedVm) return data
      })

      // 배열 처리
      const vmMemoryArray = []
      vmMemoryArray.push(vmMemoryMetricData)
      setVmMemoryData(vmMemoryArray)
    }

    // vm inbound data
    const getVmInboundData = async () => {
      const inboundLinuxDataExpr = `sum by (pod) (irate(node_network_receive_bytes_total{service="launcher-node-exporter",device=~"net.*"}[5m]))`

      const vmInboundData = await customStore.fetchMetric({
        expr: inboundLinuxDataExpr,
        ...paramsData,
        // cluster: props.match.params.cluster,
        cluster: 'wbl-skt-dev',
      })

      const vmInboundMetricData = _.find(vmInboundData, data => {
        if (data.metric.pod === selectedVm) return data
      })

      setVmInboundData(vmInboundMetricData)
    }

    // vm outbound data
    const getVmOutboundData = async () => {
      const outboundLinuxDataExpr = `sum by (pod) (irate(node_network_transmit_bytes_total{service="launcher-node-exporter",device=~"net.*"}[5m]))`

      const vmOutboundData = await customStore.fetchMetric({
        expr: outboundLinuxDataExpr,
        ...paramsData,
        // cluster: props.match.params.cluster,
        cluster: 'wbl-skt-dev',
      })

      const vmOutboundMetricData = _.find(vmOutboundData, data => {
        if (data.metric.pod === selectedVm) return data
      })

      setVmOutboundData(vmOutboundMetricData)
    }

    const getVmDiskUsageData = async () => {
      const diskLinuxDataExpr = `(100 - (((sum by(pod) (node_filesystem_avail_bytes)) / sum by(pod) (node_filesystem_size_bytes)) * 100)) / 100`

      const vmDiskData = await customStore.fetchMetric({
        expr: diskLinuxDataExpr,
        ...paramsData,
        // cluster: props.match.params.cluster,
        cluster: 'wbl-skt-dev',
      })

      const vmDiskMetricData = _.find(vmDiskData, data => {
        if (data.metric?.pod === selectedVm) return data
      })

      // 배열 처리
      const vmDiskArray = []
      vmDiskArray.push(vmDiskMetricData)
      setVmDiskData(vmDiskArray)
    }

    getVmCpuUsageData()
    getVmMemoryUsageData()
    getVmInboundData()
    getVmOutboundData()
    getVmDiskUsageData()
  }

  const getMonitoringCfgs = () => {
    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend: ['CPU_USAGE'],
        data: vmCpuData,
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: ['MEMORY_USAGE'],
        data: vmMemoryData,
      },
      {
        type: 'bandwidth',
        title: 'NETWORK_TRAFFIC',
        unitType: 'bandwidth',
        legend: ['OUT', 'IN'],
        data: [vmOutboundData, vmInboundData],
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_DISK_USAGE'),
        unit: '%',
        legend: [t('RESOURCES_DISK_USAGE')],
        data: vmDiskData,
      },
    ]
  }

  const handleSearch = value => {
    fnGetData({
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
        {/* <div className={styles.actions}>
          <Button
            type="flat"
            icon="refresh"
            onClick={handleRefresh}
          />
        </div> */}
      </div>
    )
  }

  useEffect(() => {
    if (selectedVm) {
      fetchData({ ...fetchParams })
    }
  }, [selectedVm])

  const { isLoading, isRefreshing } = customStore
  const configs = getMonitoringCfgs()

  return (
    <MonitoringController
      title={t('RESOURCES_MONITORING')}
      onFetch={fetchData}
      loading={isLoading}
      refreshing={isRefreshing}
    >
      {/* todo - 화면 분리 */}
      <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
        <div
          style={{
            flex: 1,
            width: '100%',
            position: 'relative',
            paddingRight: '20px',
          }}
        >
          <Panel>
            <div style={{ height: '600px', overflowY: 'scroll' }}>
              {renderHeader()}
              <div className={styles.content}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t('가상머신')}</th>
                    </tr>
                  </thead>
                  <tbody className={styles.vm_list}>
                    {vmDataList.map((vm, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            backgroundColor:
                              selectedVm === vm.id ? '#EEF2FF' : '',
                          }}
                          onClick={() => {
                            setSelectedVm(vm.id)
                          }}
                        >
                          <div
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <i className="ico-type-vm"></i>
                            <span style={{ marginLeft: 8 }}>{vm.name}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>
        </div>

        <div style={{ flex: 4, position: 'relative', width: '100%' }}>
          {configs.map((item, idx) => {
            const config = getAreaChartOps(item)
            if (isEmpty(config.data)) return null

            if (idx % 2 === 0) {
              const nextConfig =
                configs[idx + 1] && getAreaChartOps(configs[idx + 1])
              return (
                <div
                  style={{
                    display: 'flex',
                    position: 'relative',
                    width: '100%',
                  }}
                  key={config.title}
                >
                  <div style={{ position: 'relative', width: '50%' }}>
                    <SimpleArea {...config} />
                  </div>
                  {nextConfig && !isEmpty(nextConfig.data) && (
                    <div style={{ position: 'relative', width: '50%' }}>
                      <SimpleArea {...nextConfig} />
                    </div>
                  )}
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </MonitoringController>
  )
}

export default inject('detailStore')(observer(index))
