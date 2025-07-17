import { get, isEmpty, find, min, set } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import { Panel } from 'components/Base'

import { getChartData, getAreaChartOps } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleLine, SimpleArea } from 'components/Charts'

import styles from './index.scss'
import { Button, InputSearch } from '@kube-design/components'
import VmStore from 'stores/resources/vms'

const index = props => {
  const customStore = new CustomStore()

  const store = new VmStore()
  const cluster = props.detailStore?.detail.cluster

  const perPage = 6
  const [vmDataList, setVmDataList] = useState([])

  const [vmGpuUtilData, setVmGpuUtilData] = useState([])
  const [vmGpuRamData, setVmGpuRamData] = useState([])
  const [vmGpuTempData, setVmGpuTempData] = useState([])
  const [vmGpuPowerData, setVmGpuPowerData] = useState([])

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
    // setIsLoading(true)
    const page = get(params, 'page', 1)
    const detailParams = {
      cluster,
      resource: props.variables,
      id: props.id,
      name: props.name,
      page: page,
      limit: perPage,
    }

    if (params.name !== '' && params.name !== undefined) {
      detailParams.searchName = params.name
    }

    const vmList = await store.fetchVmsDetail(detailParams)
    const vmData = vmList.vms

    // setTotal(vmList.total)
    // setCurrentPage(page)
    setVmDataList(vmData)
    selectedVm ?? setSelectedVm(vmData[0]?.id || '')
    // setIsLoading(false)
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

    const getVmGpuUtilData = async () => {
      const gpuUtilDataExpr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod="${selectedVm}"} / 100`

      const vmGpuUtilData = await customStore.fetchMetric({
        expr: gpuUtilDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuUtilData(vmGpuUtilData)
    }

    const getVmGpuRamData = async () => {
      const gpuRamDataExpr = `DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod="${selectedVm}"} * 1000000`

      const vmGpuRamData = await customStore.fetchMetric({
        expr: gpuRamDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuRamData(vmGpuRamData)
    }

    const getVmGpuPowerData = async () => {
      const gpuPowerDataExpr = `DCGM_FI_DEV_POWER_USAGE{job="launcher-dcgm-exporter", pod="${selectedVm}"}`

      const vmGpuPowerData = await customStore.fetchMetric({
        expr: gpuPowerDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuPowerData(vmGpuPowerData)
    }

    const getVmGpuTempData = async () => {
      const gpuTempDataExpr = `DCGM_FI_DEV_GPU_TEMP{job="launcher-dcgm-exporter", pod="${selectedVm}"}`

      const vmGpuTempData = await customStore.fetchMetric({
        expr: gpuTempDataExpr,
        ...paramsData,
        cluster: props.match.params.cluster,
      })

      setVmGpuTempData(vmGpuTempData)
    }

    getVmGpuUtilData()
    getVmGpuRamData()
    getVmGpuTempData()
    getVmGpuPowerData()
  }

  const getMonitoringCfgs = () => {
    return [
      {
        type: 'utilisation',
        title: 'RESOURCES_GPU_UTILIZATION',
        unit: '%',
        legend: vmGpuUtilData.map(item => item.metric.device),
        data: vmGpuUtilData,
      },
      {
        type: 'utilisation',
        title: 'RESOURCES_GPU_RAM_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: vmGpuRamData.map(item => item.metric.device),
        data: vmGpuRamData,
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_GPU_TEMPERATURE'),
        unit: '°C',
        legend: vmGpuTempData.map(item => item.metric.device),
        data: vmGpuTempData,
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_GPU_POWER'),
        unit: 'W',
        legend: vmGpuPowerData.map(item => item.metric.device),
        data: vmGpuPowerData,
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
      title={t('RESOURCES_GPU_MONITORING')}
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
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <i className="ico-type-vm"></i>
                          <span style={{ marginLeft: 8 }}>{vm.name}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <SimpleLine {...config} />
                  </div>
                  {nextConfig && !isEmpty(nextConfig.data) && (
                    <div style={{ position: 'relative', width: '50%' }}>
                      <SimpleLine {...nextConfig} />
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
