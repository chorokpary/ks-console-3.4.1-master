import { get, groupBy, isEmpty } from 'lodash'
import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel, Text, Indicator } from 'components/Base'
import { TinyArea } from 'components/Charts'

import styles from './index.scss'

import ContainerResourceStore from 'stores/resources/containerresource'
import CustomStore from 'stores/monitoring/custom/monitor'
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
  Tooltip
} from '@kube-design/components'
import { async } from 'q'

const DetailKaasList = (props) => {

  // props = {
  //   type : '이미지' // 빈 화면 일때 사용할 이름,
  //   variables : 'image' // vm 데이터 내에서 비교할 파라미터,
  //   name : 'ubuntu' // 예시대로 vm 데이터 내의 image 이름이 ubuntu 인 것,
  // }

  const kaasStore = new ContainerResourceStore();

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

  const [machines, setMachines] = useState([]);

  const handleExpand = async (name) => {
    await kaasStore.fetchDetail({ name });
    setMachines(kaasStore.machines)
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

    const vmList = await kaasStore.fetchList();
    const vmFilterData = vmList?.filter((row) => row['kube_image'] === props.name)
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
                  <Icon name="kubernetes" size={40} type={obj.name != expandItem ? 'dark' : (obj.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
                  <Indicator
                    className={styles.indicator}
                    type={getState(obj.cluster_ready)}
                    flicker
                  />
                </div>
                {renderContentDetail(obj)}
              </div>
              {machines.length > 0 &&
                renderExtraContent(obj)
              }
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
            <div>
              {obj.name}
            </div>
            <p>Name</p>
          </div>
          <div className={styles.text}>
            <div>{obj.phase}</div>
            <p>배포 단계</p>
          </div>
          <div className={styles.text}>
            <div>{obj.cluster_ready ? "Ready" : "Not-ready"}</div>
            <p>상태</p>
          </div>
          <div className={styles.text}>
            <div>{obj.kube_version}</div>
            <p>Version</p>
          </div>
          <div className={styles.arrow} onClick={() => handleExpand(obj.name)}>
            <Icon name="chevron-down" type={obj.name != expandItem ? '' : (obj.name == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
          </div>
        </div>
      </>
    )
  }

  const renderExtraContent = () => {

    return (
      <div className={styles.itemExtra}>
        <div className={styles.containers} >
          {machines.map((obj, idx) => (
            <>
              {obj.name.includes('control-plane') ? 'Master 노드' : idx < 2 && 'Worker 노드'}
              <div className={classnames(styles.item)} key={idx}>
                <div className={styles.icon}>
                  <Icon name="nodes" size={40} />
                </div>
                <div className={classnames(styles.title, styles.name)}>
                  <div>{obj.name}</div>
                  <p>이름</p>
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
                    title={obj.ready_status ? "Ready" : "Not-ready"}
                    description={t('상태')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    // key='Disk'
                    // icon='storage'
                    title={obj.networks.filter(network => network.name != "k8s-pod-network").map(o => `${o.ip} (${o.name})`)}
                    description={t('IP (네트워크)')}
                  />
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    )
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

  const getState = (state) => {
    if (state) {
      return "running"
    } else {
      return "inactive"
    }
  }

  return (
    <>
      {vmDataList.length > 0 &&
        <Panel title={"Kaas 리소스"}
          className={classnames(styles.main)}
        >
          {renderHeader()}
          {renderContent()}
          {renderFooter()}
        </Panel>
      }

      {vmDataList.length == 0 &&
        <Panel title={"Kaas 리소스"} >
          <div className={styles.wrapper}>
            {isLoading ?
              <div><Loading /></div>
              : <div>
                {props.type} 를 사용하는 KaaS 리소스가 없습니다.</div>
            }
          </div>
        </Panel>
      }
    </>
  );
};

export default DetailKaasList

