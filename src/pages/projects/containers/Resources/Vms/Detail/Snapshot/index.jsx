import { get, groupBy, isEmpty } from 'lodash'
import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel, Text, Indicator } from 'components/Base'
import { TinyArea } from 'components/Charts'

import styles from './index.scss'

import VmStore from 'stores/resources/vms'
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'

import {
  Button,
  Icon,
  InputSearch,
  Level,
  LevelLeft,
  LevelRight,
  Loading,
  Pagination,
  Tooltip
} from '@kube-design/components'

const Snapshot = (props) => {
  
  const { cluster, namespace } = props.match?.params;
  const vmsRole = get(globals.user.projectRules, [cluster, namespace, 'vms'])

  const store = new VmStore();
  const vmState = props.detailStore.detail?.vm?.state;

  const [dataList, setDataList] = useState([]);
  const [sliceDataList, setSliceDataList] = useState([]);
  const [searchDataList, setSearchDataList] = useState([]);

  const [restoreDataList, setRestoreDataList] = useState([]);
  
  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFlag, setIsSearchFlag] = useState(false);

  const perPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState();

  const handleExpand = (name) => {
    setExpandItem(name);
    setIsExpandFlag(!isExpandFlag)
  }

  useEffect(() => {
    fnGetData();
    fnGetRestoreData();
  }, [])

  const fnGetRestoreData = async () => {
    const restoreList = await store.restoreList(props.match.params);
    setRestoreDataList(restoreList);
    setIsLoading(false);
  }

  const fnGetData = async ({ ...params } = {}) => {

    setIsLoading(true);
    setIsSearchFlag(false);
    const page = get(params, "page", 1);

    const filterData = await store.snapshotList(props.match.params);
    const searchData = (params.name != "" && params.name != undefined) ? getSearchData(filterData, params.name) : [];

    const sliceData = searchData.length > 0 ? getSliceData(searchData, page) :
      (params.name != "" && params.name != undefined) ? getSliceData(searchData, page) : getSliceData(filterData, page);

    setCurrentPage(page);
    setDataList(filterData);
    setSliceDataList(sliceData);
    setSearchDataList(searchData)

    setIsLoading(false);
  };


  const renderContent = () => {

    if (sliceDataList.length == 0) {
      const content = (
        <div className={styles.nodata}>
          {t('RESOURCES_NOT_FOUND_RESOURCE')}
        </div>
      )
      return content;
    }

    const content = (
      sliceDataList.map((obj, index) => {
        return (
          <div className={styles.wrapper} key={index}>
            <div
              className={classnames(styles.expandItem, "", {
                [styles.expanded]: (obj.id == expandItem ? isExpandFlag : false),
              })}
            >
              <div className={styles.itemMain}>
                <div className={styles.icon}>
                  <i className="ico-type-snapshot"></i>
                </div>
                {renderContentDetail(obj)}
              </div>
              {renderExtraContent(obj.id)}
            </div>
          </div>
        )
      }
      )
    )

    return <Loading spinning={isLoading}>{content}</Loading>
  }

  const renderContentDetail = (obj) => {

    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
            <div>{getLocalTime(obj.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
            <p>Timestamp</p>
          </div>
          <div className={styles.text}>
            <div>{obj.id}</div>
            <p>ID</p>
          </div>
          <div className={styles.text}>
            <div>{obj.phase}</div>
            <p>Phase</p>
          </div>
          <div className={styles.text}>
            <div>{obj.ready_to_use ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</div>
            <p>Ready to use</p>
          </div>
          <div className={styles.text}>
            {(obj.snapshot_volumes).length > 0 ? (obj.snapshot_volumes).map((item) => <div>{item}</div>) : "-"}
            <p>Snapshot Volume</p>
          </div>  
          {/* <div className={styles.text}>
            <div>{get(obj, "description", "-")}</div>
            <p>Description</p>
          </div>      */}
          { vmsRole.includes('manage') && 
            <div className={styles.button}>
                <div className={styles.div_top}><Button type="primary" onClick={() => handleRestore(obj.id)}>Restore</Button></div>
                <div className={styles.div_bottom}><Button type="danger" onClick={() => handleDeleteSnapshot(obj.id)} style={{width: "92.69px"}}>Delete</Button></div>  
            </div> 
          }
          <div className={styles.arrow} onClick={() => handleExpand(obj.id)}>
            <Icon name="chevron-down" type={obj.id != expandItem ? '' : (obj.id == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
          </div>
        </div>
      </>
    )
  }

  const renderExtraContent = (id) => {

    const restoreFilterList = restoreDataList.filter(item => item.snapshot_id == id);
    return (
      <div className={styles.itemExtra}>
            <div className={styles.containers} >

              {restoreFilterList.length == 0 && 
                <div className={styles.emptyRestore}>{t('RESOURCES_NO_DATA_RESTORE_LOG')}</div>
              }

              {restoreFilterList.map(obj => 
              <div className={classnames(styles.item)}>
                <div className={styles.icon}>
                  <i className="ico-type-restore"></i>
                </div>
                <div className={classnames(styles.title, styles.name)}>
                  <div>{getLocalTime(obj.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                  <p>Timestamp</p>
                </div>
                <div className={styles.title}>
                  <div>{obj.id}</div>
                  <p>ID</p>
                </div>
                {/* <div className={styles.text}>
                  <div>{get(obj, "description", "-")}</div>
                  <p>Description</p>
                </div>      */}
                <div className={styles.complete}>
                  <div>{obj.complete ? t('RESOURCES_COMPLETE') : t('RESOURCES_NOT_COMPLETE')}</div>
                  <p>Complete</p>
                </div>
                { vmsRole.includes('manage') && 
                  <div className={styles.arrow}>
                    <Button type="danger" onClick={() => handleDeleteRestore(obj.id)}>Delete</Button>
                  </div>
                }
              </div>  
              )}

            </div>
      </div>
    )
  }

  const handleDeleteSnapshot = (id) => {
    props.rootStore.triggerAction('vm.snapshotDelete', {
      type: 'VM_DETAIL',
      id : id,
      store: store,
      success: fnGetData,
      ...props.match.params
    })
  }

  const handleDeleteRestore = (id) => {
    props.rootStore.triggerAction('vm.restoreDelete', {
      type: 'VM_DETAIL',
      id : id,
      store: store,
      success: () => {
        fnGetRestoreData();
      },
      ...props.match.params
    })
  }

  const handleRestore = (id) => {
    if(vmState != "Stopped"){
      props.rootStore.triggerAction('vm.alertPop', {
        store: store,
        desc: t('RESOURCES_NOT_TERMINATE_VM_CONFIRM_TIP'),
        success: fnGetData,
      })
    }else{
      props.rootStore.triggerAction('vm.restorePop', {
        id : id,
        store: store,
        success: () => {
          fnGetRestoreData();
        },
        ...props.match.params
      })
    }   
  }

  const getPagination = () => {
    const total = !isSearchFlag ? dataList.length : searchDataList.length;
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

  return (
    <>  
      {dataList.length > 0 &&
          <Panel
            className={classnames(styles.main)}
          >
            {renderHeader()}
            {renderContent()}
            {renderFooter()}
          </Panel>
        }

        {dataList.length == 0 &&
          <Panel >
            <div className={styles.wrapper}>
              {isLoading ?
                <div className={styles.loading}><Loading /></div>
                : <div className={styles.empty}>{t('RESOURCES_NO_DATA_SNAPSHOT_RESOURCE')}</div>
              }
            </div>
          </Panel>
        }   
    </>
  );
};

export default inject('rootStore', 'detailStore')(observer(Snapshot))

