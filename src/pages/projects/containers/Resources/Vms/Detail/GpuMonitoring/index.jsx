import { isEmpty } from 'lodash'
import React, { useState } from 'react'
import { observer, inject } from 'mobx-react'

import { getAreaChartOps } from 'utils/monitoring'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea } from 'components/Charts'

const index = props => {
  const store = props.detailStore
  const customStore = new CustomStore()

  const { cluster, namespace } = props.match.params

  const [vmGpuUtilData, setVmGpuUtilData] = useState([])
  const [vmGpuRamData, setVmGpuRamData] = useState([])
  const [vmGpuTempData, setVmGpuTempData] = useState([])
  const [vmGpuPowerData, setVmGpuPowerData] = useState([])

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
    })

    if (!paramsData.start || !paramsData.end) {
      const timeRange = getTimeRange(paramsData)
      paramsData.start = timeRange.start
      paramsData.end = timeRange.end
    }

    const getVmGpuUtilData = async () => {
      const gpuUtilDataExpr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter", pod="${store.detail.vm.name}", namespace="${store.detail.vm.project}"} / 100`

      const gpuUtilData = await customStore.fetchMetric({
        expr: gpuUtilDataExpr,
        ...paramsData,
        cluster,
        namespace,
      })

      setVmGpuUtilData(gpuUtilData)
    }

    const getVmGpuRamData = async () => {
      const gpuRamDataExpr = `DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter", pod="${store.detail.vm.name}", namespace="${store.detail.vm.project}"} * 1000000`

      const gpuRamData = await customStore.fetchMetric({
        expr: gpuRamDataExpr,
        ...paramsData,
        cluster,
        namespace,
      })

      setVmGpuRamData(gpuRamData)
    }

    const getVmGpuPowerData = async () => {
      const gpuPowerDataExpr = `DCGM_FI_DEV_POWER_USAGE{job="launcher-dcgm-exporter", pod="${store.detail.vm.name}", namespace="${store.detail.vm.project}"}`

      const gpuPowerData = await customStore.fetchMetric({
        expr: gpuPowerDataExpr,
        ...paramsData,
        cluster,
        namespace,
      })

      setVmGpuPowerData(gpuPowerData)
    }

    const getVmGpuTempData = async () => {
      const gpuTempDataExpr = `DCGM_FI_DEV_GPU_TEMP{job="launcher-dcgm-exporter", pod="${store.detail.vm.name}", namespace="${store.detail.vm.project}"}`

      const gpuTempData = await customStore.fetchMetric({
        expr: gpuTempDataExpr,
        ...paramsData,
        cluster,
        namespace,
      })

      setVmGpuTempData(gpuTempData)
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

  const { isLoading, isRefreshing } = customStore
  const configs = getMonitoringCfgs()

  return (
    <MonitoringController
      title={t('RESOURCES_GPU_MONITORING')}
      onFetch={fetchData}
      loading={isLoading}
      refreshing={isRefreshing}
    >
      {configs.map(item => {
        const config = getAreaChartOps(item)
        if (isEmpty(config.data)) return null
        return <SimpleArea key={config.title} width="100%" {...config} />
      })}
    </MonitoringController>
  )
}

export default inject('detailStore')(observer(index))
