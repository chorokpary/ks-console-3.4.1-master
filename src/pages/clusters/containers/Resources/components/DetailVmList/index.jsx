import { get, groupBy, isEmpty } from 'lodash'
import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel, Text, Indicator } from 'components/Base'
import { TinyArea } from 'components/Charts'
import { Link } from 'react-router-dom'

import styles from './index.scss'

import VmStore from 'stores/resources/vms'
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

const DetailVmList = (props) => {

  // props = {
  //   type : '이미지' // 빈 화면 일때 사용할 이름,
  //   variables : 'image' // vm 데이터 내에서 비교할 파라미터,
  //   name : 'ubuntu' // 예시대로 vm 데이터 내의 image 이름이 ubuntu 인 것,
  // }

  const store = new VmStore();
  const customStore = new CustomStore();

  const cluster = props.detailStore?.detail.cluster;

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

  const getMinuteValue = (timeStr = '60s', hasUnit = true) => {
    const unit = timeStr.slice(-1)
    let value = parseFloat(timeStr)

    switch (unit) {
      default:
      case 's':
        break
      case 'm':
        value *= 60
        break
      case 'h':
        value *= 60 * 60
        break
      case 'd':
        value = value * 24 * 60 * 60
        break
    }
    return hasUnit ? `${value}s` : value
  }

  const getTimeRange = ({ step = '600s', times = 20 } = {}) => {
    const interval = parseFloat(step) * times
    const end = Math.floor(Date.now() / 1000)
    const start = Math.floor(end - interval)

    return { start, end }
  }

  const handleExpand = (name) => {
    setExpandItem(name);
    setIsExpandFlag(!isExpandFlag)
  }

  useEffect(() => {
    fnGetData();
    fetchData();
  }, [])

  const fnGetData = async ({ ...params } = {}) => {

    setIsLoading(true);
    setIsSearchFlag(false);
    const page = get(params, "page", 1);

    const vmList = await store.fetchList();
    const vmFilterData = vmList?.filter((row) =>
      variablesFilter(row)
    )
    const vmSearchData = (params.name != "" && params.name != undefined) ? getSearchData(vmFilterData, params.name) : [];

    const vmSliceData = vmSearchData.length > 0 ? getSliceData(vmSearchData, page) :
      (params.name != "" && params.name != undefined) ? getSliceData(vmSearchData, page) : getSliceData(vmFilterData, page);

    setCurrentPage(page);
    setVmDataList(vmFilterData);
    setVmSliceDataList(vmSliceData);
    setVmSearchDataList(vmSearchData)

    setIsLoading(false);
  };

  const variablesFilter = (row) => {
    if (props.variables === 'security_group_objects') {
      return _.find(row[props.variables], { 'id': props.id })
    } else if (props.variables === 'networks') {
      return _.find(row[props.variables], { 'name': props.id })
    } else if (props.variables === 'flavor_object') {
      return row[props.variables].name === props.name
    } else if (props.variables == 'id') {
      return row[props.variables] === props.id
    }
    return row[props.variables] === props.name
  }

  const fetchData = async () => {

    const params = { "times": 50, "step": "10m" }

    const paramsData = Object.assign(params, {
      start: params.start,
      end: params.end,
      step: getMinuteValue(params.step),
      times: params.times,
    })

    if (!paramsData.start || !paramsData.end) {
      const timeRange = getTimeRange(paramsData)
      paramsData.start = timeRange.start
      paramsData.end = timeRange.end
    }

    const getVmCpuUsageData = async () => {
      const vmCpuData = await customStore.fetchMetric({
        expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{namespace="default",service="launcher-node-exporter",mode="idle"}[5m])) * 100)) / 100`,
        ...paramsData,
      })

      setVmCpuData(vmCpuData)
    };

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const vmMemoryData = await customStore.fetchMetric({
        expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*"}`,
        ...paramsData,
      })

      setVmMemoryData(vmMemoryData)

    };

    getVmCpuUsageData();
    getVmMemoryUsageData();

  }

  const getMonitoringCfgs = (cpuData, memoryData) => [
    {
      type: 'cpu',
      title: 'CPU',
      unitType: 'cpu',
      legend: ['USED'],
      data: cpuData,
      bgColor: 'transparent',
    },
    {
      type: 'memory',
      title: 'MEMORY',
      unitType: 'memory',
      legend: ['USED'],
      data: memoryData,
      bgColor: 'transparent',
    },
  ]

  const renderContent = () => {

    if (vmSliceDataList.length == 0) {
      const content = (
        <div className={styles.nodata}>
          {t('RESOURCES_NOT_FOUND_RESOURCE')}
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
                  {/* <Icon name="templet" size={40} type={obj.name != expandItem ? 'dark' : (obj.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} /> */}
                  <i className="ico-type40-vm"></i>
                  <Indicator
                    className={styles.indicator}
                    type={getState(obj.state)}
                    flicker
                  />
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

    return <Loading spinning={isLoading}><>{content}</></Loading>
  }

  const renderContentDetail = (obj) => {

    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
            <div>
              <Link to={`/clusters/${cluster}/vms/${obj.name}/${obj.id}`}>{obj.name}</Link>
              <Tooltip content={t('VNC')}>
                <Icon
                  className="margin-l8"
                  name="terminal"
                  size={16}
                  clickable
                  onClick={() => handleOpenVnc(obj.id)}
                />
              </Tooltip>
            </div>
            <p>{getLocalTime(obj.creation_timestamp).format('YYYY-MM-DD HH:mm:ss')}{t('RESOURCES_CREATED')}</p>
          </div>
          <div className={styles.text}>
            <div>{obj.state}</div>
            <p>{t('RESOURCES_STATE')}</p>
          </div>
          <div className={styles.text}>
            <div>{obj.node != "N/A" ? obj.node : "-"}</div>
            <p>{t('RESOURCES_NODE')}</p>
          </div>
          {renderMonitorings(obj.id)}
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
              <div>{obj.flavor_object.name}</div>
              <p>Flavor</p>
            </div>
            <div className={styles.title}>
              <div>
                {
                  networkList.length >= 1 ?
                    networkList.length == 1 ? networkList[0].alias : networkList[0].alias + " 외 " + (networkList.length - 1) + "개"
                    : "-"
                }
              </div>
              <p>{t('RESOURCES_NETWORK')}</p>
            </div>
            <div className={styles.title}>
              <Text
                key='CPU'
                icon='cpu'
                title={obj.flavor_object.vcpus + " Core"}
                description={t('CPU')}
              />
            </div>
            <div className={styles.title}>
              <Text
                key='Memory'
                icon='memory'
                title={common.fnSetBytes(obj.flavor_object.ram) + " Gib"}
                description={t('Memory')}
              />
            </div>
            <div className={styles.title}>
              <Text
                key='Disk'
                icon='storage'
                title={obj.flavor_object.root_disk + " Gib"}
                description={t('Disk')}
              />
            </div>
            <div className={styles.title}>
              <Text
                key='GPU'
                icon='gpu'
                title={obj.flavor_object.gpus.length >= 1 ?
                  obj.flavor_object.gpus.length == 1 ? obj.flavor_object.gpus[0].name : obj.flavor_object.gpus[0].name + " " + t('RESOURCES_BESIDES') + " " + (obj.flavor_object.gpus.length - 1) + t('RESOURCES_COUNT')
                  : "-"}
                description={t('GPU')}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMonitorings = (vmId) => {

    const isExpand = false;
    const loading = false;

    if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>

    const vmCpuMetricData = _.find(vmCpuData, (data) => {
      if (data.metric.pod === vmId) return data;
    });

    const vmMemoryMetricData = _.find(vmMemoryData, (data) => {
      if (data.metric.pod === vmId) return data;
    });

    if (!!!vmCpuMetricData && !!!vmMemoryMetricData)
      return <div className={styles.monitors}>{t('NO_MONITORING_DATA')}</div>

    const vmCpuArray = [];
    vmCpuArray.push(vmCpuMetricData)

    const vmMemoryArray = [];
    vmMemoryArray.push(vmMemoryMetricData)

    const configs = getMonitoringCfgs(vmCpuArray, vmMemoryArray)

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
                  darkMode={isExpand}
                />
              </div>
            )
          })}
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
    if (state === 'Provisioning'
      || state === 'Starting'
      || state === 'Stopping'
      || state === 'Terminating'
      || state === 'Migrating') {
      return "waiting"
    } else if (state === 'Running') {
      return "running"
    } else if (state === 'Stopped' || state === 'Paused') {
      return "stopped"
    } else if (state === 'Unknown') {
      return "error"
    } else {
      return "error"
    }
  }

  const handleOpenVnc = (vmId) => {
    //실제 URL 로 변경 요망
    var apiUrl = "http://" + location.hostname + ":30020";
    var param = "path=k8s/apis/subresources.kubevirt.io/v1alpha3/namespaces/default/virtualmachineinstances/";
    param = param + vmId + "/vnc";

    var popupName = vmId.replaceAll("-", "");
    window.open(apiUrl + '/vnc_lite.html?' + param, popupName, 'resizable=yes,toolbar=no,location=no,status=no,scrollbars=no,menubar=no,width=1280,height=840');
  }

  return (
    <>

      {vmDataList.length > 0 &&
        <Panel title={t('RESOURCES_VM')}
          className={classnames(styles.main)}
        >
          {renderHeader()}
          {renderContent()}
          {renderFooter()}
        </Panel>
      }

      {vmDataList.length == 0 &&
        <Panel title={t('RESOURCES_VM')} >
          <div className={styles.wrapper}>
            {isLoading ?
              <div><Loading /></div>
              : <div className={styles.empty}>{props.type}{props.type === t('RESOURCES_SECURITY_GROUP') ? t('RESOURCES_EUL') : t('RESOURCES_LEUL')} {t('RESOURCES_NO_USE_VM')}</div>
            }
          </div>
        </Panel>
      }

    </>
  );
};

export default inject('detailStore')(DetailVmList)

