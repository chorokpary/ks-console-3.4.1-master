import { get, isEmpty } from 'lodash'
import React, { Fragment, useEffect, useState } from 'react'
import { inject } from 'mobx-react'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import {
  Button,
  Icon,
  InputSearch,
  Level,
  LevelLeft,
  LevelRight,
  Loading,
  Pagination,
} from '@kube-design/components'
import { TinyArea } from 'components/Charts'
import { Indicator, Panel, Text } from 'components/Base'
import { getAreaChartOps } from 'utils/monitoring'

import ContainerResourceStore from 'stores/resources/containerresource'
import CustomStore from 'stores/monitoring/custom/monitor'
import { getLocalTime } from 'utils'
import styles from './index.scss'

const DetailMachineList = props => {
  // props = {
  //   type : '이미지' // 빈 화면 일때 사용할 이름,
  //   variables : 'image' // vm 데이터 내에서 비교할 파라미터,
  //   name : 'ubuntu' // 예시대로 vm 데이터 내의 image 이름이 ubuntu 인 것,
  // }

  const kaasStore = new ContainerResourceStore()
  const customStore = new CustomStore()

  const cluster = props.detailStore?.detail.cluster

  const [machineSearchDataList, setMachineSearchDataList] = useState([])
  const [machineSliceDataList, setMachineSliceDataList] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [isSearchFlag, setIsSearchFlag] = useState(false)

  const step = '5m'
  const times = 100
  const [machineData, setMachineData] = useState({
    cpuData: [],
    memoryData: [],
  })
  let timer = 0

  useEffect(() => {
    fetchData(0)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const perPage = 6
  const [currentPage, setCurrentPage] = useState(1)
  const [searchValue, setSearchValue] = useState()

  const [machines, setMachines] = useState([])

  useEffect(() => {
    fnGetData()
  }, [])

  const fnGetData = async ({ ...params } = {}) => {
    setIsLoading(true)
    setIsSearchFlag(false)
    const page = get(params, 'page', 1)

    const machineList = await kaasStore.fetchMachinesAll({
      namespace: props.project,
    })
    const filteredMachineList = machineList.filter(
      machine => machine.name === props.name
    )
    setMachines(filteredMachineList)

    const machineSearchData =
      params.name !== '' && params.name !== undefined
        ? getSearchData(filteredMachineList, params.name)
        : []
    const machineSliceData =
      machineSearchData.length > 0
        ? getSliceData(machineSearchData, page)
        : params.name !== '' && params.name !== undefined
          ? getSliceData(machineSearchData, page)
          : getSliceData(filteredMachineList, page)

    setCurrentPage(page)
    setMachineSearchDataList(machineSearchData)
    setMachineSliceDataList(machineSliceData)

    setIsLoading(false)
  }

  const fetchData = timerSec => {
    timer = setTimeout(async () => {
      const kaasCpuFilteredData = []
      const kaasMemoryFilteredData = []

      Promise.all([getCpuUsageData(), getMemoryUsageData()]).then(values => {
        if (values[0].length > 0) {
          // eslint-disable-next-line array-callback-return
          values[0].map(obj => {
            if (obj.metric.pod.indexOf(props.name) === 0) {
              kaasCpuFilteredData.push(obj)
            }
          })
        }

        if (values[1].length > 0) {
          // eslint-disable-next-line array-callback-return
          values[1].map(obj => {
            if (obj.metric.pod.indexOf(props.name) === 0) {
              kaasMemoryFilteredData.push(obj)
            }
          })
        }

        setMachineData({
          ...machineData,
          cpuData: kaasCpuFilteredData,
          memoryData: kaasMemoryFilteredData,
        })
      })
      fetchData(5000)
    }, timerSec)
  }

  // kaas cpu data
  const getCpuUsageData = () => {
    const currentTime = Math.floor(Date.now() / 1000)
    return new Promise(resolve => {
      const cpuFetchData = customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{service="launcher-node-exporter",mode="idle"}[${step}])) * ${times})) / 100`,
        start: currentTime - 30000,
        end: currentTime,
        cluster,
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
        cluster,
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
  const renderMonitorings = (nodeName, nodeNetwork) => {
    const loading = isLoading
    const podName = machineData.memoryData?.find(
      obj => obj.metric?.instance?.split(':')[0] === nodeNetwork?.ip
    )?.metric?.pod
    const metrics = {
      cpu: machineData.cpuData.find(obj => obj.metric.pod === podName),
      memory: machineData.memoryData.find(obj => obj.metric.pod === podName),
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

  const renderContent = () => {
    const content = machineSliceDataList.map((obj, index) => {
      return (
        <div className={styles.wrapper} key={index}>
          <div className={styles.itemMain}>
            <div className={styles.icon}>
              <Icon name="nodes" size={40} />
              <Indicator
                className={styles.indicator}
                type={getState(obj.ready_status, obj.phase)}
                flicker
              />
            </div>
            <div className={styles.content}>
              <div className={styles.text} style={{ width: '20%' }}>
                <div>{obj.name}</div>
                <p>
                  {t('CREATED_TIME', {
                    diff: getLocalTime(obj.timestamp).format(
                      'YYYY-MM-DD HH:mm:ss'
                    ),
                  })}
                </p>
              </div>
              <div className={styles.text} style={{ width: '10%' }}>
                <div>{t(`RESOURCES_MACHINE_${obj.phase.toUpperCase()}`)}</div>
                <p>{t('RESOURCES_STATE')}</p>
              </div>
              <div className={styles.text} style={{ width: '10%' }}>
                <div>
                  <Link
                    className={styles.title}
                    to={`/clusters/${cluster}/containerResource/${obj.cluster}`}
                  >
                    {obj.cluster}
                  </Link>
                </div>
                <p>{t('RESOURCES_CLUSTER')}</p>
              </div>
              <div className={styles.text}>
                <Text
                  title={obj.networks
                    .filter(network => network.name !== 'k8s-pod-network')
                    .map(o => `${o.ip} (${o.name})`)}
                  description={`${t('RESOURCES_NETWORK')}`}
                />
              </div>
              {renderMonitorings(
                obj.name,
                obj.networks.find(net => net.name === 'k8s-pod-network')
              )}
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

  const getPagination = () => {
    const total = !isSearchFlag ? machines.length : machineSearchDataList.length
    return { page: currentPage, limit: perPage, total }
  }

  const getSearchData = (data, searchText) => {
    setIsSearchFlag(true)
    return data.filter(row => {
      return row.name?.toLowerCase().includes(searchText.toLowerCase())
    })
  }

  const getSliceData = (data, page) => {
    // eslint-disable-next-line no-shadow
    const currentPage = page
    return data.slice((currentPage - 1) * perPage, currentPage * perPage)
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
    const params = page ? { page } : {}
    fnGetData(params)
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

  const getState = (state, phase) => {
    if (phase !== 'Provisioned' && phase !== 'Running') {
      return 'updating'
    }

    if (state) {
      return 'running'
    }
    return 'inactive'
  }

  return (
    <>
      {machines.length > 0 && (
        <Panel
          title={t('RESOURCES_KAAS_RESOURCE')}
          className={classnames(styles.main)}
        >
          {renderHeader()}
          {renderContent()}
          {renderFooter()}
        </Panel>
      )}

      {machines.length === 0 && (
        <Panel title={t('RESOURCES_KAAS_RESOURCE')}>
          <div className={styles.wrapper}>
            {isLoading ? (
              <div>
                <Loading />
              </div>
            ) : (
              <div>
                <div className={styles.empty}>
                  {props.type} {t('RESOURCES_LEUL')}{' '}
                  {t('RESOURCES_NO_USE_KAAS_RESOURCE')}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
    </>
  )
}

export default inject('detailStore')(DetailMachineList)
