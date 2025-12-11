import { get } from 'lodash'
import React, { useEffect, useState } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Indicator, Panel, Text } from 'components/Base'
import { TinyArea } from 'components/Charts'
import { Link } from 'react-router-dom'

import CustomStore from 'stores/monitoring/custom/monitor'
import GpuClustersStore from 'stores/resources/gpuclusters'

import { getLocalTime } from 'utils'
import * as common from 'utils/resources'
import { getAreaChartOps } from 'utils/monitoring'

import {
  Button,
  Icon,
  InputSearch,
  Level,
  LevelLeft,
  LevelRight,
  Loading,
  Pagination,
  Tooltip,
} from '@kube-design/components'
import styles from './index.scss'
import { namespace } from 'd3-selection'

const DetailGpuVmList = props => {
  // props = {
  //   type : '이미지' // 빈 화면 일때 사용할 이름,
  //   variables : 'image' // vm 데이터 내에서 비교할 파라미터,
  //   name : 'ubuntu' // 예시대로 vm 데이터 내의 image 이름이 ubuntu 인 것,
  // }

  const rootStore = props.rootStore

  const store = new GpuClustersStore()
  const customStore = new CustomStore()

  const cluster = props.cluster

  const [vmDataList, setVmDataList] = useState([])

  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchFlag, setIsSearchFlag] = useState(false)

  const [vmCpuData, setVmCpuData] = useState([])
  const [vmMemoryData, setVmMemoryData] = useState([])

  const [vmGpuUtilData, setVmGpuUtilData] = useState([])
  const [vmGpuRamData, setVmGpuRamData] = useState([])

  const perPage = 6
  const [currentPage, setCurrentPage] = useState(1)
  const [searchValue, setSearchValue] = useState()

  const [total, setTotal] = useState(0)

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
    fetchData()
  }, [])

  useEffect(() => {
    const params = searchValue
      ? { name: searchValue, page: currentPage }
      : { page: currentPage }

    fnGetData(params)

    const intervalId = setInterval(() => {
      fnGetData(params)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [searchValue, currentPage])

  const fnGetData = async ({ ...params } = {}) => {
    setIsLoading(false)
    setIsSearchFlag(false)
    const page = get(params, 'page', 1)
    const detailParams = {
      namespace: props.namespace,
      resource: props.variables,
      id: props.id,
      name: props.name,
      page: page,
      limit: perPage,
    }

    if (params.name !== '' && params.name !== undefined) {
      ;(detailParams.searchType = 'vmName'),
        (detailParams.searchName = params.name)
    }

    const vmData = await store.fetchVmsDetail(detailParams)
    const vmList = vmData.vmList
    props.setVmList(vmList)

    setTotal(vmData.total)
    setCurrentPage(page)
    setVmDataList(vmList)
    setIsLoading(false)
    if (
      vmList.length === 0 &&
      !detailParams.searchType &&
      !detailParams.searchName
    ) {
      props.handleEmpty()
    }
  }

  const fetchData = async () => {
    const params = { times: 50, step: '10m' }

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
      const data = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{service="launcher-node-exporter",mode="idle"}[5m])) * 100)) / 100`,
        ...paramsData,
        cluster,
      })

      setVmCpuData(data)
    }

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const data = await customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        ...paramsData,
        cluster,
      })

      setVmMemoryData(data)
    }

    const getVmGpuUtilData = async () => {
      const gpuUtilDataExpr = `DCGM_FI_DEV_GPU_UTIL{job="launcher-dcgm-exporter"} / 100`

      const vmGpuUtilData = await customStore.fetchMetric({
        expr: gpuUtilDataExpr,
        ...paramsData,
        cluster,
      })

      setVmGpuUtilData(vmGpuUtilData)
    }

    const getVmGpuRamData = async () => {
      const gpuRamDataExpr = `DCGM_FI_DEV_FB_USED{job="launcher-dcgm-exporter"} * 1000000`

      const vmGpuRamData = await customStore.fetchMetric({
        expr: gpuRamDataExpr,
        ...paramsData,
        cluster,
      })

      setVmGpuRamData(vmGpuRamData)
    }

    getVmCpuUsageData()
    getVmMemoryUsageData()
    getVmGpuUtilData()
    getVmGpuRamData()
  }

  const getMonitoringCfgs = (cpuData, memoryData, gpuData, gpuMemoryData) => [
    // {
    //   type: 'cpu',
    //   title: 'CPU',
    //   unitType: 'cpu',
    //   legend: ['USED'],
    //   data: cpuData,
    //   bgColor: 'transparent',
    // },
    // {
    //   type: 'memory',
    //   title: 'MEMORY',
    //   unitType: 'memory',
    //   legend: ['USED'],
    //   data: memoryData,
    //   bgColor: 'transparent',
    // },
    {
      type: 'cpu',
      title: 'RESOURCES_GPU_UTILIZATION',
      unitType: 'cpu',
      legend: ['USED'],
      data: gpuData,
      bgColor: 'transparent',
    },
    {
      type: 'memory',
      title: 'RESOURCES_GPU_RAM_USAGE',
      unitType: 'memory',
      legend: ['USED'],
      data: gpuMemoryData,
      bgColor: 'transparent',
    },
  ]

  const renderContent = () => {
    if (vmDataList.length === 0) {
      return (
        <div className={styles.nodata}>{t('RESOURCES_NOT_FOUND_RESOURCE')}</div>
      )
    }

    const content = vmDataList.map((obj, index) => {
      return (
        <div className={styles.wrapper} key={`${obj.vmName}-${index}`}>
          <div
            className={classnames(styles.expandItem, '', {
              [styles.expanded]:
                obj.vmName === expandItem ? isExpandFlag : false,
            })}
          >
            <div className={styles.itemMain}>
              <div className={styles.icon}>
                <i className="ico-type40-vm"></i>
                <Indicator
                  className={styles.indicator}
                  type={getState(obj.vmPhase)}
                  flicker
                />
              </div>
              {renderContentDetail(obj)}
            </div>
          </div>
        </div>
      )
    })

    return (
      <Loading spinning={isLoading}>
        <>{content}</>
      </Loading>
    )
  }

  const renderContentDetail = obj => {
    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
            <div>
              <Link
                to={`/clusters/${cluster}/projects/${obj.namespace}/vms/${obj.vmName}`}
              >
                {obj.vmName}
              </Link>
              {/* <Tooltip content={t('VNC')}>
                <Icon
                  className="margin-l8"
                  name="terminal"
                  size={16}
                  clickable
                  onClick={() => handleOpenVnc(obj.id, obj.project)}
                />
              </Tooltip> */}
            </div>
            <p>{t('RESOURCES_NAME')}</p>
          </div>
          <div className={styles.text}>
            <div>{t(`RESOURCES_${obj.vmPhase.toUpperCase()}`)}</div>
            <p>{t('RESOURCES_STATE')}</p>
          </div>
          <div className={styles.text}>
            <div>
              {obj.nodeName ? (
                // <Link to={`/clusters/${cluster}/nodes/${obj.vmi.node_hostname}`}>
                //   {obj.vmi.node_hostname}
                // </Link>
                <div>{obj.nodeName}</div>
              ) : (
                '-'
              )}
            </div>
            <p>{t('RESOURCES_NODE')}</p>
          </div>
          {renderMonitorings(obj.vmName, isExpandFlag)}
        </div>
      </>
    )
  }

  const renderMonitorings = (vmId, isExpand) => {
    // const isExpand = false;
    const loading = false

    if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>

    const vmCpuMetricData = _.find(vmCpuData, data => {
      if (data.metric.pod === vmId) return data
    })

    const vmMemoryMetricData = _.find(vmMemoryData, data => {
      if (data.metric.pod === vmId) return data
    })

    const vmGpuMetricData = _.find(vmGpuUtilData, data => {
      if (data.metric.pod === vmId) return data
    })

    const vmGpuMemoryMetricData = _.find(vmGpuRamData, data => {
      if (data.metric.pod === vmId) return data
    })

    // if (!vmCpuMetricData && !vmMemoryMetricData && !vmGpuMetricData && !vmGpuMemoryMetricData)
    if (!vmGpuMetricData && !vmGpuMemoryMetricData)
      return <div className={styles.monitors}>{t('NO_MONITORING_DATA')}</div>

    const vmCpuArray = []
    vmCpuArray.push(vmCpuMetricData)

    const vmMemoryArray = []
    vmMemoryArray.push(vmMemoryMetricData)

    const vmGpuArray = []
    vmGpuArray.push(vmGpuMetricData)

    const vmGpuMemoryArray = []
    vmGpuMemoryArray.push(vmGpuMemoryMetricData)

    const configs = getMonitoringCfgs(
      vmCpuArray,
      vmMemoryArray,
      vmGpuArray,
      vmGpuMemoryArray
    )

    return (
      <div className={styles.monitors}>
        <div className={styles.charts}>
          {configs.map(item => {
            const config = getAreaChartOps(item)

            return (
              <div key={`${item.type}-${item.title}`}>
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

  const getPagination = () => {
    return { page: currentPage, limit: perPage, total }
  }

  const handleSearch = value => {
    setSearchValue(value)
    fnGetData({
      name: value,
    })
  }

  const handleRefresh = () => {
    const params = searchValue
      ? { name: searchValue, page: currentPage }
      : { page: currentPage }
    fnGetData(params)
  }

  const handlePage = page => {
    const params = page ? { page, name: searchValue } : {}
    fnGetData(params)
  }

  const handleCreate = () => {
    rootStore.triggerAction('gpuclusters.regist', {
      store,
      cluster,
      namespace: props.detailStore?.detail.data.namespace,
      id: props.id,
      name: props.name,
      type: props.name,
      success: fnGetData,
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
          <Button type="flat" icon="refresh" onClick={handleRefresh} />
        </div>
        <div className={styles.actions}>
          <Button
            type="control"
            onClick={() => {
              handleCreate()
            }}
            className={classnames(styles['btn'], styles['btn-control'])}
          >
            {t('CREATE_BTN')}
          </Button>
        </div>
      </div>
    )
  }

  const renderFooter = () => {
    const pagination = getPagination()
    const { total } = pagination

    return (
      <Level className={styles.footer}>
        <LevelLeft>{t('TOTAL_ITEMS', { num: total })}</LevelLeft>
        <LevelRight>
          <Pagination {...pagination} onChange={handlePage} />
        </LevelRight>
      </Level>
    )
  }

  const getState = state => {
    // console.log("state : "+ state)
    if (
      state === 'Provisioning' ||
      state === 'Starting' ||
      state === 'Booting' ||
      state === 'Stopping' ||
      state === 'Terminating' ||
      state === 'Migrating'
    ) {
      return 'waiting'
    }
    if (state === 'Running') {
      return 'running'
    }
    if (state === 'Stopped' || state === 'Paused') {
      return 'stopped'
    }
    if (state === 'Unknown') {
      return 'error'
    }
    return 'error'
  }

  const handleOpenVnc = (vmId, project) => {
    // 실제 URL 로 변경 요망
    const apiUrl = `http://${location.hostname}:30020`
    let param = `path=k8s/apis/subresources.kubevirt.io/v1alpha3/namespaces/${project}/virtualmachineinstances/`
    param = `${param + vmId}/vnc`

    const popupName = vmId.replaceAll('-', '')
    window.open(
      `${apiUrl}/vnc_lite.html?${param}`,
      popupName,
      'resizable=yes,toolbar=no,location=no,status=no,scrollbars=no,menubar=no,width=1280,height=840'
    )
  }

  return (
    <>
      <Panel title={t('RESOURCES_VM')} className={classnames(styles.main)}>
        {renderHeader()}
        {vmDataList.length > 0 && renderContent()}
        {vmDataList.length === 0 && (
          <div className={styles.wrapper}>
            {isLoading ? (
              <div className={styles.loading}>
                <Loading />
              </div>
            ) : props.variables === 'project' ? (
              <div className={styles.empty}>
                {t('RESOURCES_NOT_FOUND_RESOURCE')}
              </div>
            ) : (
              <div className={styles.empty}>{t('RESOURCES_NO_VM')}</div>
            )}
          </div>
        )}
        {renderFooter()}
      </Panel>
    </>
  )
}

export default inject('detailStore', 'rootStore')(observer(DetailGpuVmList))
