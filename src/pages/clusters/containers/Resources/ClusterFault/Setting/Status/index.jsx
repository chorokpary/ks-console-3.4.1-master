import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import styles from './index.scss'
import { get } from 'lodash'

import classnames from 'classnames'
import { Table } from '@kube-design/components'
// import Table from 'components/Tables/List'
// 1. kube design 은 직접 custom
// 2. Tables/List 는 기존 tableaction 적용됨
// 1을 이용하면 2를 참고해서 드롭다운 구현해야하고
// 2를 이용하면 헤더푸터도 달라져서 코드 수정해야함

import { Panel, Text, Indicator } from 'components/Base'
import { getLocalTime } from 'utils'

import ClusterFaultStore from 'stores/resources/clusterFault'
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
import { Radio } from '@kube-design/components/lib/components/Radio'

const store = new ClusterFaultStore();

const Status = (props) => {

  const [vmDataList, setVmDataList] = useState([]);
  const [vmSliceDataList, setVmSliceDataList] = useState([]);
  const [vmSearchDataList, setVmSearchDataList] = useState([]);

  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFlag, setIsSearchFlag] = useState(false);

  const [vmCpuData, setVmCpuData] = useState([]);
  const [vmMemoryData, setVmMemoryData] = useState([]);

  const perPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState();

  useEffect(() => {
    fnGetData();
  }, [])

  const fnGetData = async ({ ...params }) => {
    let asd = await store.fetchCrList(params)
    console.log(asd)
    setVmDataList(asd);
  }

  const getPagination = () => {
    const total = !isSearchFlag ? vmDataList.length : vmSearchDataList.length;
    const pagination = { "page": currentPage, "limit": perPage, "total": total }
    return pagination
  }

  const getSearchData = (data, searchText) => {
    setIsSearchFlag(true);
    const resultList = data.filter((row) => {
      return row["name"]?.toLowerCase().includes(searchText.toLowerCase());
    });
    return resultList;
  }

  const getSliceData = (data, page) => {
    const currentPage = page;
    const sliceData = data.slice((currentPage - 1) * perPage, (currentPage) * perPage);
    return sliceData;
  }

  const handleSearch = value => {
    setSearchValue(value);
    fnGetData({
      name: value,
    })
  }

  const handleRefresh = () => {
    const params = searchValue ? { name: searchValue, page: currentPage } : { page: currentPage }
    fnGetData(params);
  }

  const handlePage = page => {
    const params = page ? { page: page } : {}
    fnGetData(params);
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
        <Button type="control" onClick={showCreate} data-test="table-create">
          생성
        </Button>
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

  const getColumns = () => [
    {
      title: t('사용'),
      dataIndex: '',
      render: (a) => (
        <Radio />
      )
    },
    {
      title: t('이름'),
      dataIndex: 'metadata.name',
    },
    {
      title: t('Project/DevOps Project'),
      dataIndex: 'metadata.namespace',
    },
    {
      title: t('등록일'),
      dataIndex: 'metadata.creationTimestamp',
      render: (creationTimestamp) => (
        getLocalTime(creationTimestamp).format('YYYY-MM-DD HH:mm:ss')
      )
    },
    {
      key: 'more',
      width: 20,
      // render: renderMore(),
      render: () => (
        <Button icon="more" type="flat" />
      ),
    },
  ]

  // const renderMore = (field, record) => {
  //   if (isEmpty(this.enabledItemActions)) {
  //     return null
  //   }

  //   const content = this.renderMoreMenu(record)

  //   if (content === null) {
  //     return null
  //   }

  //   return (
  //     <Dropdown content={content} trigger="click" placement="bottomRight">
  //       <Button icon="more" type="flat" />
  //     </Dropdown>
  //   )
  // }

  const itemActions = () => {
    return [
      {
        key: 'delete',
        icon: 'trash',
        text: t('DELETE'),
        action: 'delete',
        show: true,
        // onClick: item =>
        //   props.rootStore.triggerAction('clusterfault.regist', {
        //     type: 'qwe',
        //     detail: item,
        //   }),
      },
    ]
  }


  const showCreate = () => {
    const { match, module } = props
    return props.rootStore.triggerAction('clusterfault.regist', {
      module,
      namespace: match.params.namespace,
      cluster: match.params.cluster,
    })
  }

  const renderContent = () => {
    return (
      <Table
        className={styles.table}
        dataSource={vmDataList}
        itemActions={itemActions()}
        columns={getColumns()}
      // onCreate={() => showCreate()}
      // loading={loading}
      />
    )
  }

  return (
    <>
      {vmDataList.length > 0 &&
        <Panel
          className={classnames(styles.main)}
          styles={{ padding: '0px !important' }}
        >
          {renderHeader()}
          {renderContent()}
          {renderFooter()}
        </Panel>
      }

      {vmDataList.length == 0 &&
        <Panel styles={{ padding: '0px !important' }}>
          <div className={styles.wrapper}>
            {isLoading ?
              <div><Loading /></div>
              : props.variables == "project"
                ? <div className={styles.empty}>{t('RESOURCES_NOT_FOUND_RESOURCE')}</div>
                : <div className={styles.empty}>{props.type}{props.type === t('RESOURCES_SECURITY_GROUP') ? t('RESOURCES_EUL') : t('RESOURCES_LEUL')} {t('RESOURCES_NO_USE_VM')}</div>
            }
          </div>
        </Panel>
      }
    </>
  );
};

export default inject('detailStore', 'rootStore')(observer(Status))

