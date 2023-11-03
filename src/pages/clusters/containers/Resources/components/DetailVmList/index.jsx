import { get, groupBy, isEmpty } from 'lodash'
import React, {useState, useEffect} from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel, Text, Indicator } from 'components/Base'
import { Icon, Loading } from '@kube-design/components'
import { TinyArea } from 'components/Charts'

import styles from './index.scss'

import VmStore from 'stores/resources/vms'
import CustomStore from 'stores/monitoring/custom/monitor'

import * as common from 'utils/resources'
import { getAreaChartOps } from 'utils/monitoring'

const DetailVmList = (props) => {

  // props = {
  //   type : '이미지' // 빈 화면 일때 사용할 이름,
  //   variables : 'image' // vm 데이터 내에서 비교할 파라미터,
  //   name : 'ubuntu' // 예시대로 vm 데이터 내의 image 이름이 ubuntu 인 것,
  // }

  const store = new VmStore();
  const customStore = new CustomStore();

  const [vmDataList, setVmDataList] = useState([]);

  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [vmCpuData, setVmCpuData] = useState([]);
  const [vmMemoryData, setVmMemoryData] = useState([]);

  const intiParams = {"times":50,"step":"10m"}

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
    const fnGetExternalNetwork = async () => {
      const vmList = await store.fetchList();
        if (props.variables === 'security_groups') {
            setVmDataList(vmList?.filter((row) => row[props.variables].includes(props.name)))
        } else {
            setVmDataList(vmList?.filter((row) => row[props.variables] === props.name))
        }
        setIsLoading(false)
    };

    fnGetExternalNetwork();
    fetchData(intiParams);

  }, []) 

  const fetchData = async (params) => {

    const paramsData = Object.assign(params, {
      start : params.start,
      end : params.end,
      step: getMinuteValue(params.step),
      times : params.times ,
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

  const renderContent = (obj) => {

    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
              <div>{obj.name}</div>
              <p>이름</p>
          </div>
          <div className={styles.text}>
              <div>{obj.state}</div>
              <p>상태</p>
          </div>
          <div className={styles.text}>
              <div>{obj.node != "N/A" ? obj.node : "-"}</div>
              <p>노드</p>
          </div>
          {renderMonitorings(obj.name)}  
          <div className={styles.arrow}>
            <Icon name="chevron-down" type={obj.name != expandItem ? '' : (obj.name == expandItem && isExpandFlag == false) ? '' : 'light'}size={20} />
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
                  <p>Flavor</p>
                </div>
                <div className={styles.title}>
                  <div>
                   {
                    networkList.length >= 1 ?  
                    networkList.length == 1 ? networkList[0].name : networkList[0].name + " 외 " + (networkList.length - 1) + "개" 
                    : "-"
                   }
                  </div>
                  <p>네트워크</p>
                </div>     
                <div className={styles.title}>
                      <Text
                        key='CPU'
                        icon='cpu'
                        title={obj.flavor_detail.vcpus +" Core"}
                        description={t('CPU')}
                      />
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='Memory'
                        icon='memory'
                        title={common.fnSetBytes(obj.flavor_detail.ram) +" Gib"}
                        description={t('Memory')}
                      />
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='Disk'
                        icon='storage'
                        title={obj.flavor_detail.root_disk +" Gib"}
                        description={t('Disk')}
                      />
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='GPU'
                        icon='gpu'
                        title={obj.flavor_detail.gpus.length >= 1 ?  
                          obj.flavor_detail.gpus.length == 1 ? obj.flavor_detail.gpus[0].name : obj.flavor_detail.gpus[0].name + " 외 " + (obj.flavor_detail.gpus.length - 1) + "개" 
                          : "-"}
                        description={t('GPU')}
                      />
                    </div>
              </div>          
          </div>        
        </div>
    )
  }

  const renderMonitorings = (vnName) => {
    // const { metrics = {}, isExpand, loading } = props

    const isExpand = false;
    const loading = false;
    const metrics = {}

    if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>

    const vmCpuMetricData = _.find(vmCpuData, (data) => {
      if (data.metric.pod === vnName ) return data;
    });
    
    const vmMemoryMetricData = _.find(vmMemoryData, (data) => {
      if (data.metric.pod === vnName ) return data;
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

  const getState = (state) =>  {
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
    }else{
      return "error"
    }
  }

  return (
    <>  

      {vmDataList.length > 0 && 
       
          <Panel title={"가상 머신"} >
            { vmDataList.map((obj, index) => {
              return (
                <div className={styles.wrapper} key={index}>
                <div
                  className={classnames(styles.expandItem, "", {
                    [styles.expanded]: (obj.name == expandItem ? isExpandFlag : false),
                  })}
                >
                  <div className={styles.itemMain} onClick={() => handleExpand(obj.name)}>
                    <div className={styles.icon}>
                      {/* <Icon name="templet" size={40} type={obj.name != expandItem ? 'dark' : (obj.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} /> */}
                      <i className="ico-type40-vm"></i>
                      <Indicator
                        className={styles.indicator}
                        type={getState(obj.state)}
                        flicker
                      />
                    </div>
                    {renderContent(obj)}
                  </div>
                  {renderExtraContent(obj)}
                </div>
              </div>
              )
            }
            )}
          </Panel>       
      }
      
      {vmDataList.length == 0 &&
        <Panel title={"가상 머신"}>
          <div className={styles.wrapper}>
            {isLoading? 
              <div><Loading /></div>
              : <div>{props.type}{props.type === "보안그룹" ? "을" : "를"} 사용하는 가상머신이 없습니다.</div>
            }
          </div>
        </Panel> 
      }

    </>
  );
};

export default DetailVmList

