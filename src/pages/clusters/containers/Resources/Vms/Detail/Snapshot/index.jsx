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

  const store = new VmStore();

  const [vmDataList, setVmDataList] = useState([]);
  const [vmSliceDataList, setVmSliceDataList] = useState([]);
  const [vmSearchDataList, setVmSearchDataList] = useState([]);

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
  }, [])

  const fnGetData = async ({ ...params } = {}) => {

    setIsLoading(true);
    setIsSearchFlag(false);
    const page = get(params, "page", 1);

    const vmList = (props.variables != 'kube_image') ? await store.fetchList() : await kaasStore.fetchList();
    const vmFilterData = vmList?.filter((row) => props.variables === 'security_groups' ? row[props.variables].includes(props.name) : row[props.variables] === props.name)
    const vmSearchData = (params.name != "" && params.name != undefined) ? getSearchData(vmFilterData, params.name) : [];

    const vmSliceData = vmSearchData.length > 0 ? getSliceData(vmSearchData, page) :
      (params.name != "" && params.name != undefined) ? getSliceData(vmSearchData, page) : getSliceData(vmFilterData, page);

    setCurrentPage(page);
    setVmDataList(vmFilterData);
    setVmSliceDataList(vmSliceData);
    setVmSearchDataList(vmSearchData)

    setIsLoading(false);
  };


  const renderContent = () => {

    if (vmSliceDataList.length == 0) {
      const content = (
        <div className={styles.nodata}>
          리소스를 찾을 수 없음
        </div>
      )
      return content;
    }

    const content = (
      vmSliceDataList.map((obj, index) => {
        return (
          <div className={styles.wrapper} key={index}>
            <div
              className={classnames(styles.expandItem, "", {
                [styles.expanded]: (obj.name == expandItem ? isExpandFlag : false),
              })}
            >
              <div className={styles.itemMain}>
                <div className={styles.icon}>
                  {/* <i className="ico-type40-vm"></i> */}
                  <Icon name="snapshot" size={40} />
                </div>
                {renderContentDetail(obj)}
              </div>
              {renderExtraContent(obj)}
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
            <div>{getLocalTime(obj.creation_timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
            <p>Timestamp</p>
          </div>
          <div className={styles.text}>
            <div>{obj.name}</div>
            <p>Name</p>
          </div>
          <div className={styles.text}>
            <div>{obj.node != "N/A" ? obj.node : "-"}</div>
            <p>Phase</p>
          </div>
          <div className={styles.text}>
            <div>{obj.state}</div>
            <p>Ready to use</p>
          </div>
          <div className={styles.text}>
            <div>{obj.state}</div>
            <p>Snapshot Volume</p>
          </div>  
          <div className={styles.text}>
            <div>{obj.state}</div>
            <p>Description</p>
          </div>      
          <div className={styles.button}>
              <div className={styles.div_top}><Button type="primary" onClick={() => handleRestore(obj.name)}>Restore</Button></div>
              <div className={styles.div_bottom}><Button type="danger" onClick={() => handleDelete(obj.name)} style={{width: "92.69px"}}>Delete</Button></div>  
          </div> 
          <div className={styles.arrow} onClick={() => handleExpand(obj.name)}>
            <Icon name="chevron-down" type={obj.name != expandItem ? '' : (obj.name == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
          </div>
        </div>
      </>
    )
  }

  const renderExtraContent = (obj) => {

    const networkList = obj.networks.filter((network) => network.name != "k8s-pod-network");
    return (
      <div className={styles.itemExtra}>
        <div className={styles.containers} >
          <div className={classnames(styles.item)}>
            <div className={styles.icon}>
              <Icon name="apps" size={40} />
            </div>
            <div className={classnames(styles.title, styles.name)}>
              <div>{obj.flavor_detail.name}</div>
              <p>Timestamp</p>
            </div>
            <div className={styles.title}>
              <div>{obj.flavor_detail.name}</div>
              <p>Name</p>
            </div>
            <div className={styles.title}>
              <div>{obj.flavor_detail.name}</div>
              <p>Description</p>
            </div>
            <div className={styles.title}>
              <div>{obj.flavor_detail.name}</div>
              <p>Complete</p>
            </div>
            <div className={styles.arrow}>
              <Button type="danger" onClick={() => handleDelete(obj.name)}>Delete</Button>
            </div>
          </div>
        </div>
      </div>
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

  const handleRestore = (name) => {
    console.log("handleRestore!!");
    props.rootStore.triggerAction('vm.restorePop', {
      name : name,
      store: store,
      success: fnGetData,
    })
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
      {vmDataList.length > 0 &&
          <Panel
            className={classnames(styles.main)}
          >
            {renderHeader()}
            {renderContent()}
            {renderFooter()}
          </Panel>
        }

        {vmDataList.length == 0 &&
          <Panel >
            <div className={styles.wrapper}>
              {isLoading ?
                <div><Loading /></div>
                : <div> 스냅샷 이력이 없습니다.</div>
              }
            </div>
          </Panel>
        }   
    </>
  );
};

export default inject('rootStore')(observer(Snapshot))

