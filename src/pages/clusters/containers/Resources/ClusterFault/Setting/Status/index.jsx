import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import styles from './index.scss'
import { get } from 'lodash'

import classnames from 'classnames'

import { Panel, Text, Indicator } from 'components/Base'
import { getLocalTime } from 'utils'

import ClusterFaultStore from 'stores/resources/clusterFault'
import {
  Table,
  Menu,
  Dropdown,
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

const moreAction = [
  {
    key: 'triangle-right',
    text: '사용 대상 설정',
    onClick: (item) => {
      console.log(item)
    }
  },
  {
    key: 'pen',
    text: '정보 편집',
    onClick: (item) => {
      console.log(item)
    }
  },
  {
    key: 'trash',
    text: '삭제',
    onClick: (item) => {
      console.log(item)
    }
  },
]

const store = new ClusterFaultStore();

const Status = (props) => {

  const [crList, setCrList] = useState([]);
  const [sliceDataList, setSliceDataList] = useState([]);
  const [searchDataList, setSearchDataList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFlag, setIsSearchFlag] = useState(false);

  const [activeCr, setActiveCr] = useState('')
  const perPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState();

  useEffect(() => {
    fnGetData();
  }, [])

  const fnGetData = async ({ ...params }) => {
    let activeCr = await store.activeCrDetail()
    setActiveCr(activeCr)

    let crList = await store.fetchCrList(params)
    console.log(crList)
    setIsLoading(false)
    setCrList(crList);
  }

  const getPagination = () => {
    const total = !isSearchFlag ? crList.length : searchDataList.length;
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
    const params = value && value !== '' ? { ['metadata.name']: value } : {}
    fnGetData(params)
  }

  const handleRefresh = () => {
    const params = searchValue ? { ['metadata.name']: searchValue, page: currentPage } : { page: currentPage }
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
      render: (_, item) => (
        item.metadata.name === activeCr ? <Icon name="check" /> : ''
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
      render: (more, item) => (
        renderMore(item)
      ),
    },
  ]

  /**
   * row별 more btn
   */
  const renderMore = (item) => {
    const content = renderMoreMenu(item)

    return (
      <Dropdown content={content} trigger="click" placement="bottomRight">
        <Button icon="more" type="flat" />
      </Dropdown>
    )
  }

  /**
   * moreAction 에서 메뉴 리스트 rendering
   */
  const renderMoreMenu = item => {
    const actionList = [...moreAction]
    item.metadata.name === activeCr ? delete actionList[0] : actionList
    const items = actionList.map(obj => {
      return (
        <Menu.MenuItem key={obj.key}>
          <Icon name={obj.key} />{' '}
          <span data-test={`table-item-${obj.key}`}>{obj.text}</span>
        </Menu.MenuItem>
      )
    })

    return (
      <Menu onClick={handleMoreMenuClick(item)}>
        {items}
      </Menu>
    )
  }

  /**
   * more btn별 action 주입
   */
  const handleMoreMenuClick = item => (e, key) => {
    const action = moreAction.find(
      _action => _action.key === key
    )
    if (action && action.onClick) {
      action.onClick(item)
    }
  }

  /**
   * 생성 버튼
   */
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
        dataSource={crList}
        columns={getColumns()}
        loading={isLoading}
        emptyText={renderEmpty()}
      />
    )
  }

  const renderEmpty = () => {
    return <div className={styles.empty}>{props.type}{t('RESOURCES_NO_DATA')}</div>
  }

  return (
    <Panel
      className={classnames(styles.main)}
      styles={{ padding: '0px !important' }}
    >
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </Panel>
  );
};

export default inject('detailStore', 'rootStore')(observer(Status))

