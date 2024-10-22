import { get } from 'lodash'
import React, { Fragment, useEffect, useState } from 'react'
import classnames from 'classnames'

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
import { Indicator, Panel, Text } from 'components/Base'

import ContainerResourceStore from 'stores/resources/containerresource'
import styles from './index.scss'

const DetailKaasList = props => {
  // props = {
  //   type : '이미지' // 빈 화면 일때 사용할 이름,
  //   variables : 'image' // vm 데이터 내에서 비교할 파라미터,
  //   name : 'ubuntu' // 예시대로 vm 데이터 내의 image 이름이 ubuntu 인 것,
  // }

  const kaasStore = new ContainerResourceStore()

  const [clusterDataList, setClusterDataList] = useState([])
  const [clusterSliceDataList, setClusterSliceDataList] = useState([])
  const [clusterSearchDataList, setClusterSearchDataList] = useState([])

  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [isSearchFlag, setIsSearchFlag] = useState(false)

  const perPage = 6
  const [currentPage, setCurrentPage] = useState(1)
  const [searchValue, setSearchValue] = useState()

  const [machines, setMachines] = useState([])
  const [machinesData, setMachinesData] = useState([])

  const handleExpand = async name => {
    if (!isExpandFlag) {
      const filter = machinesData.filter(arr => arr.cluster === name)
      setMachines(filter)
      setExpandItem(name)
    }
    setIsExpandFlag(!isExpandFlag)
  }

  useEffect(() => {
    fnGetData()
  }, [])

  const fnGetData = async ({ ...params } = {}) => {
    setIsLoading(true)
    setIsSearchFlag(false)
    const page = get(params, 'page', 1)

    const clusterList = await kaasStore.fetchList()
    const machineList = await kaasStore.fetchMachinesAll()

    setMachinesData(machineList)

    const clusterFilterData = clusterList?.filter(
      row => row[props.variables] === props.name
    )

    const clusterSearchData =
      params.name !== '' && params.name !== undefined
        ? getSearchData(clusterFilterData, params.name)
        : []
    const clusterSliceData =
      clusterSearchData.length > 0
        ? getSliceData(clusterSearchData, page)
        : params.name !== '' && params.name !== undefined
        ? getSliceData(clusterSearchData, page)
        : getSliceData(clusterFilterData, page)

    setCurrentPage(page)
    setClusterDataList(clusterFilterData)
    setClusterSliceDataList(clusterSliceData)
    setClusterSearchDataList(clusterSearchData)

    setIsLoading(false)
  }

  const renderContent = () => {
    if (clusterSliceDataList.length === 0) {
      return (
        <div className={styles.nodata}>{t('RESOURCES_NOT_FOUND_RESOURCE')}</div>
      )
    }

    const content = clusterSliceDataList.map((obj, index) => {
      return (
        <div className={styles.wrapper} key={index}>
          <div
            className={classnames(styles.expandItem, '', {
              [styles.expanded]: obj.name === expandItem ? isExpandFlag : false,
            })}
          >
            <div className={styles.itemMain}>
              <div className={styles.icon}>
                <Icon
                  name="kubernetes"
                  size={40}
                  type={
                    obj.name !== expandItem
                      ? 'dark'
                      : obj.name === expandItem && isExpandFlag === false
                      ? 'dark'
                      : 'light'
                  }
                />
                <Indicator
                  className={styles.indicator}
                  type={getState(obj.cluster_ready, obj.phase)}
                  flicker
                />
              </div>
              {renderContentDetail(obj)}
            </div>
            {machines.length > 0 && renderExtraContent(obj)}
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
            <div>{obj.name}</div>
            <p>{t('RESOURCES_NAME')}</p>
          </div>
          <div className={styles.text}>
            <div>{t(`RESOURCES_CLUSTER_${obj.phase.toUpperCase()}`)}</div>
            <p>{t('RESOURCES_DEPLOY_STEP')}</p>
          </div>
          <div className={styles.text}>
            <div>
              {obj.cluster_ready
                ? t('RESOURCES_CLUSTER_READY')
                : t('RESOURCES_CLUSTER_NOT_READY')}
            </div>
            <p>{t('RESOURCES_STATE')}</p>
          </div>
          <div className={styles.text}>
            <div>{obj.kube_version}</div>
            <p>{t('RESOURCES_VERSION')}</p>
          </div>
          <div className={styles.arrow} onClick={() => handleExpand(obj.name)}>
            <Icon
              name="chevron-down"
              type={
                obj.name !== expandItem
                  ? ''
                  : obj.name === expandItem && isExpandFlag === false
                  ? ''
                  : 'light'
              }
              size={20}
            />
          </div>
        </div>
      </>
    )
  }

  const renderExtraContent = () => {
    return (
      <div className={styles.itemExtra}>
        <div className={styles.containers}>
          {machines
            .filter(machine => machine.controlplane)
            .map((obj, idx) => (
              <Fragment key={idx}>
                {idx === 0 && `Master ${t('RESOURCES_NODE')}`}
                <div className={classnames(styles.item)}>
                  <div className={styles.icon}>
                    <Icon name="nodes" size={40} />
                    <Indicator
                      className={styles.indicator}
                      type={getState(obj?.ready_status, obj?.phase)}
                      flicker
                    />
                  </div>
                  <div className={classnames(styles.title, styles.name)}>
                    <div>{obj.name}</div>
                    <p>{t('RESOURCES_NAME')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>
                      {t(`RESOURCES_MACHINE_${obj.phase.toUpperCase()}`)}
                    </div>
                    <p>{t('RESOURCES_DEPLOY_STEP')}</p>
                  </div>
                  <div className={styles.title}>
                    <Text
                      // key='CPU'
                      // icon='cpu'
                      title={obj.flavor}
                      description={t('Flavor')}
                    />
                  </div>
                  <div className={styles.title}>
                    <Text
                      // key='Memory'
                      // icon='memory'
                      title={
                        obj.ready_status
                          ? t('RESOURCES_CLUSTER_READY')
                          : t('RESOURCES_CLUSTER_NOT_READY')
                      }
                      description={t('RESOURCES_STATE')}
                    />
                  </div>
                  <div className={styles.title}>
                    <Text
                      // key='Disk'
                      // icon='storage'
                      title={obj.networks
                        .filter(network => network.name !== 'k8s-pod-network')
                        .map(o => `${o.ip} (${o.name})`)}
                      description={`IP (${t('RESOURCES_NETWORK')})`}
                    />
                  </div>
                </div>
              </Fragment>
            ))}
          {machines
            .filter(machine => !machine.controlplane)
            .map((obj, idx) => (
              <Fragment key={idx}>
                {idx === 0 && `Worker ${t('RESOURCES_NODE')}`}
                <div className={classnames(styles.item)}>
                  <div className={styles.icon}>
                    <Icon name="nodes" size={40} />
                    <Indicator
                      className={styles.indicator}
                      type={getState(obj?.ready_status, obj?.phase)}
                      flicker
                    />
                  </div>
                  <div className={classnames(styles.title, styles.name)}>
                    <div>{obj.name}</div>
                    <p>{t('RESOURCES_NAME')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.phase}</div>
                    <p>Phase</p>
                  </div>
                  <div className={styles.title}>
                    <Text
                      // key='CPU'
                      // icon='cpu'
                      title={obj.flavor}
                      description={t('Flavor')}
                    />
                  </div>
                  <div className={styles.title}>
                    <Text
                      // key='Memory'
                      // icon='memory'
                      title={
                        obj.ready_status
                          ? t('RESOURCES_CLUSTER_READY')
                          : t('RESOURCES_CLUSTER_NOT_READY')
                      }
                      description={t('RESOURCES_STATE')}
                    />
                  </div>
                  <div className={styles.title}>
                    <Text
                      // key='Disk'
                      // icon='storage'
                      title={obj.networks
                        .filter(network => network.name !== 'k8s-pod-network')
                        .map(o => `${o.ip} (${o.name})`)}
                      description={`IP (${t('RESOURCES_NETWORK')})`}
                    />
                  </div>
                </div>
              </Fragment>
            ))}
        </div>
      </div>
    )
  }

  const getPagination = () => {
    const total = !isSearchFlag
      ? clusterDataList.length
      : clusterSearchDataList.length
    return { page: currentPage, limit: perPage, total }
  }

  const getSearchData = (data, searchText) => {
    setIsSearchFlag(true)
    return data.filter(row => {
      return row['name']?.toLowerCase().includes(searchText.toLowerCase())
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
      {clusterDataList.length > 0 && (
        <Panel
          title={t('RESOURCES_KAAS_RESOURCE')}
          className={classnames(styles.main)}
        >
          {renderHeader()}
          {renderContent()}
          {renderFooter()}
        </Panel>
      )}

      {clusterDataList.length === 0 && (
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

export default DetailKaasList
