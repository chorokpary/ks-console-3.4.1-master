import { get } from 'lodash'
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
import { Indicator, Panel, Text } from 'components/Base'

import ContainerResourceStore from 'stores/resources/containerresource'
import styles from './index.scss'

const DetailMachineList = props => {
  // props = {
  //   type : '이미지' // 빈 화면 일때 사용할 이름,
  //   variables : 'image' // vm 데이터 내에서 비교할 파라미터,
  //   name : 'ubuntu' // 예시대로 vm 데이터 내의 image 이름이 ubuntu 인 것,
  // }

  const kaasStore = new ContainerResourceStore()

  const cluster = props.detailStore?.detail.cluster

  const [machineSearchDataList, setMachineSearchDataList] = useState([])
  const [machineSliceDataList, setMachineSliceDataList] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [isSearchFlag, setIsSearchFlag] = useState(false)

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

    const machineList = await kaasStore.fetchMachinesAll()
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

  const renderContent = () => {
    const content = machineSliceDataList.map((obj, index) => {
      return (
        <div className={styles.wrapper} key={index}>
          <div className={classnames(styles.item)}>
            <div className={styles.icon}>
              <Icon name="nodes" size={40} />
              <Indicator
                className={styles.indicator}
                type={getState(obj.ready_status, obj.phase)}
                flicker
              />
            </div>
            <div className={classnames(styles.title, styles.name)}>
              <div>{obj.name}</div>
              <p>{t('RESOURCES_NAME')}</p>
            </div>
            <div className={styles.title}>
              <Text
                title={obj.ready_status ? t('RESOURCES_CLUSTER_READY') : t('RESOURCES_CLUSTER_NOT_READY')}
                description={t('RESOURCES_NODE_STATUS')}
              />
            </div>
            <div className={styles.title}>
              <div>{t(`RESOURCES_MACHINE_${obj.phase.toUpperCase()}`)}</div>
              <p>{t('RESOURCES_INFRA_STATUS')}</p>
            </div>
            <div className={styles.title}>
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
            <div className={styles.title}>
              <Text
                title={obj.flavor}
                description={t('Flavor')}
              />
            </div>
            <div className={styles.title}>
              <Text
                title={obj.networks
                  .filter(network => network.name !== 'k8s-pod-network')
                  .map(o => `${o.ip} (${o.name})`)}
                description={`IP (${t('RESOURCES_NETWORK')})`}
              />
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