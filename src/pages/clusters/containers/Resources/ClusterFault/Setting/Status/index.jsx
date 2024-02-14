import React, { useState, useEffect, useReducer } from 'react'
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
  Notify,
} from '@kube-design/components'

const store = new ClusterFaultStore();

const Status = (props) => {

  const [crList, setCrList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [activeCr, setActiveCr] = useState('')
  const perPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState();

  const [activationDeleting, setActivationDeleting] = useState(false);
  const [activationTrigger, setActivationTrigger] = useReducer(activationTrigger => !activationTrigger, false);

  const moreAction = [
    {
      key: 'triangle-right',
      text: '사용 대상 설정',
      onClick: (item) => {
        props.rootStore.triggerAction('clusterfault.activateCr', {
          store: store,
          activeCr: activeCr,
          item,
          name: get(item, 'metadata.name'),
          success: () => {
            activeCrListTrigger()
            fnGetData()
          }
        })
      }
    },
    {
      key: 'pen',
      text: '정보 편집',
      onClick: (item) => {
        showCreate(item)
      }
    },
    {
      key: 'trash',
      text: '삭제',
      onClick: (item) => {
        props.rootStore.triggerAction('clusterfault.delete', {
          store,
          activeCr: activeCr,
          name: get(item, 'metadata.name'),
          success: fnGetData,
        })
      }
    },
  ]
  let timer = 0;

  /**
   * 10초마다 활성 CR check
   */
  const activeCrListTimer = () => {
    timer = setTimeout(() => {
      activeCrListTrigger()
    }, 10000)
  }

  const activeCrListTrigger = async () => {
    clearTimeout(timer)
    const activeCrList = await store.activeCrList();

    let del = false;
    activeCrList.find(obj => {
      let deletionTimestamp = get(obj, 'metadata.deletionTimestamp') || false;
      del = deletionTimestamp || del
    })

    // deletionTimestamp 가 있는 경우, 삭제중인 CR 이 있는것으로 판단하여
    // more action 기능 통제
    if (del) {
      setActivationDeleting(true);
      setActivationTrigger();
    } else {
      setActivationDeleting(false);
    }
  }

  // activationTrigger 로 timer 주고
  // 화면 이탈 시, cleanup 적용을 위해 useeffect 활용
  useEffect(() => {
    activeCrListTimer()
    return () => {
      clearTimeout(timer)
    }
  }, [activationTrigger])

  useEffect(() => {
    fnGetData();
    // 화면 첫 진입 시, 전체 활성 CR정보 check trigger
    activeCrListTrigger();
  }, [])

  const fnGetData = async ({ ...params }) => {
    // 활성화된 CR
    let activeCr = await store.activeCrDetail()
    setActiveCr(activeCr)

    // CR list
    let crList = await store.fetchCrList(params)
    setIsLoading(false)
    setCrList(crList);
  }

  // --------------------- search  -------------------------
  const getPagination = () => {
    const total = crList.length;
    const pagination = { "page": currentPage, "limit": perPage, "total": total }
    return pagination
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
  // -------------------------------------------------------

  /**
   * 생성 버튼
   */
  const showCreate = () => {
    const { match, module } = props
    return props.rootStore.triggerAction('clusterfault.regist', {
      module,
      store,
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

  const disableMoreMenu = () => {
    return activationDeleting ? Notify.info('이전 Operator가 비활성화중입니다.') : ''
  }

  /**
   * row별 more btn
   */
  const renderMore = (item) => {
    const content = renderMoreMenu(item)

    return (
      <Dropdown content={!activationDeleting ? content : ''} trigger="click" placement="bottomRight" onClick={() => disableMoreMenu()}>
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
   * 데이터 없는 경우
   */
  const renderEmpty = () => {
    return <div className={styles.empty}>{props.type}{t('RESOURCES_NO_DATA')}</div>
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

