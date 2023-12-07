import { get, groupBy, isEmpty } from 'lodash'
import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import { toJS } from 'mobx'

import { Panel, Text, Indicator } from 'components/Base'

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

const Clone = (props) => {

  const store = new VmStore();

  const [dataList, setDataList] = useState([]);
  const [sliceDataList, setSliceDataList] = useState([]);
  const [searchDataList, setSearchDataList] = useState([]);

  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFlag, setIsSearchFlag] = useState(false);

  const perPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState();

  useEffect(() => {
    fnGetData();
  }, [])

  const fnGetData = async ({ ...params } = {}) => {

    setIsLoading(true);
    setIsSearchFlag(false);
    const page = get(params, "page", 1);

    const filterData = await store.cloneList(props.match.params.name);
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
                [styles.expanded]: (obj.name == expandItem ? isExpandFlag : false),
              })}
            >
              <div className={styles.itemMain}>
                <div className={styles.icon}>
                  <i className="ico-type-clone"></i>
                </div>
                {renderContentDetail(obj)}
              </div>
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
          <div className={styles.name}>
            <div>{obj.name}</div>
            <p>Name</p>
          </div>
          <div className={styles.text}>
            <div>{obj.target_vm_name}</div>
            <p>Target VM name</p>
          </div>
          <div className={styles.text}>
            <div>{obj.phase}</div>
            <p>Phase</p>
          </div>
          <div className={styles.text}>
            <div>{obj.state}</div>
            {(obj.networks).length > 0 ? (obj.networks).map((item) => <div>{item.name}</div>) : "-"}
            <p>Networks</p>
          </div>
          {/* <div className={styles.text}>
            <div>{get(obj, "description", "-")}</div>
            <p>Description</p>
          </div>         */}
          <div className={styles.arrow}>
            <Button type="danger" onClick={() => handleDelete(obj.name)}>Delete</Button>
          </div>
        </div>
      </>
    )
  }

  const handleDelete = (name) => {
    console.log("handleDelete!!");
    props.rootStore.triggerAction('vm.cloneDelete', {
      type: 'VM_DETAIL',
      name : name,
      store: store,
      success: fnGetData,
    })
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
                : <div className={styles.empty}> {t('RESOURCES_NO_DATA_CLONE_LOG')}</div>
              }
            </div>
          </Panel>
        }   
    </>
  );
};

export default inject('rootStore')(observer(Clone))

