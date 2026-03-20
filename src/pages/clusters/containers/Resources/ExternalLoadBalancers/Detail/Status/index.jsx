import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'

import { Icon, Tabs } from '@kube-design/components'
import { get, groupBy, find } from 'lodash'

import classnames from 'classnames'
import styles from './index.scss'

import { Indicator, Panel, Text } from 'components/Base'
import { TinyArea } from 'components/Charts'

import CustomStore from 'stores/monitoring/custom/monitor'
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'
import { getAreaChartOps } from 'utils/monitoring'

import VmStore from 'stores/resources/vms'

const Status = (props) => {

    const store = props.detailStore;
    const cluster = props.detailStore?.cluster

    const lbName = store.detailData.detail.name

    const vmsStore = new VmStore()
    const customStore = new CustomStore()

    const [vmDataList, setVmDataList] = useState([])
    
    const [isExpandFlag, setIsExpandFlag] = useState(false)
    const [expandItem, setExpandItem] = useState()
    const [isLoading, setIsLoading] = useState(true)

    const [vmCpuData, setVmCpuData] = useState([])
    const [vmMemoryData, setVmMemoryData] = useState([])

    const [vmWinCpuData, setVmWinCpuData] = useState([])
    const [vmWinMemoryData, setVmWinMemoryData] = useState([])

    const getBesidesText = (arr = [], type, xlbName = '', col = '') => {  
        const first = type === 'O' ? arr?.[0]?.name : arr?.[0]
        const firstTxt = col == "L" ? first : first.replace(`${xlbName}-`,'')
        const sidesText = arr?.length
                            ? arr.length > 1
                                ? `${firstTxt} ${t('RESOURCES_BESIDES')} ${arr.length - 1} ${t('RESOURCES_COUNT')}`
                                : firstTxt
                            : '-'
                            
        return sidesText
    }

    const renderContent = (obj, index) => {
        return (
            <>
                <div className={styles.content}>
                    <div className={styles.text}>
                    <div>{obj.name}</div>
                        <p>{t('RESOURCES_NAME')}</p>
                    </div>
                    <div className={styles.text}>
                        <div>{obj.load_balancing_method}</div>
                        <p>{t('LB method')}</p>
                    </div>
                    <div className={styles.text}>
                        <div>{getBesidesText(obj.members, 'O', lbName, 'V')}</div>
                        <p>{t('RESOURCES_MEMBER')}</p>
                    </div>
                    <div className={styles.text}>
                        <div>{obj.monitor ? obj.monitor : "-"}</div>
                        <p>{t('RESOURCES_MONITOR')}</p>
                    </div>
                    {obj.members !== null &&
                        <div className={styles.arrow} onClick={() => handleExpand(index)}>
                            <Icon name="chevron-down" type={index != expandItem ? '' : (index == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
                        </div>              
                    }      
                </div>
            </>
        )
    }

    const renderExtraContent = (obj, index) => {

        return (
            <div className={styles.itemExtra}>
                <div className={styles.containers} >
                    <div>{t('RESOURCES_MEMBER')}</div>
                    {obj.pools[index].members &&
                         <>                           
                            {obj.pools[index].members.map((member, index) => ( 
                                <div className={classnames(styles.item)} key={`member_${index}`}>
                                    <div className={styles.icon}>
                                    <i className="ico-type40-vm"></i>
                                    </div>
                                    <div className={classnames(styles.title, styles.name)}>
                                    <div>
                                        {member.name}
                                    </div>
                                    <p>{t('RESOURCES_NAME')}</p>
                                    </div>
                                    <div className={styles.title}>
                                        <div>
                                            <Indicator
                                                className={styles.indicator}
                                                type={getState(getValueByVmDataList(member.name, 'state'))}
                                                flicker
                                            />
                                            {getValueByVmDataList(member.name, 'state')}
                                        </div>
                                        <p>{t('RESOURCES_STATE')}</p>
                                    </div>
                                    <div className={styles.title}>
                                        <div>{getValueByVmDataList(member.name, 'node')}</div>
                                        <p>{t('NODE')}</p>
                                    </div>
                                    {renderMonitorings(
                                        member.name, 
                                        getValueByVmDataList(member.name, 'os_type'),
                                        getValueByVmDataList(member.name, 'project')
                                    )}
                                </div>
                            ))}
                              
                            <div>{t('RESOURCES_MONITOR')}</div>
                            {obj.monitors.length > 0 ?
                                <div className={classnames(styles.item)} key={`monitor-${obj.monitor}-${index}`}>
                                    <div className={styles.title}>
                                        <div>{(obj.monitors[index].name).replace(`${lbName}-`,'')}</div>
                                        <p>{t('RESOURCES_NAME')}</p>
                                    </div>
                                    <div className={styles.title}>
                                        <div>{obj.monitors[index].type.toUpperCase()}</div>
                                        <p>{t('RESOURCES_TYPE')}</p>
                                    </div>
                                    <div className={styles.title}>
                                        <div>{obj.monitors[index].interval}</div>
                                        <p>{t('RESOURCES_INTERVAL')}</p>
                                    </div>
                                    <div className={styles.title}>
                                        <div>{obj.monitors[index].timeout}</div>
                                        <p>{t('RESOURCES_TIME_OUT')}</p>
                                    </div>
                                    <div className={styles.title}>
                                        <div>{obj.monitors[index]?.description || "-" }</div>
                                        <p>{t('RESOURCES_DESCRIPTION')}</p>
                                    </div>
                                </div>
                                :
                                <div className={classnames(styles.item)} key={`monitor-${index}`}>
                                    <div className={styles.empty}>
                                        {t('RESOURCES_NO_DATA')}
                                    </div>
                                </div>                                
                            }    
                        </>
                    }
                </div>
            </div>
        )
    }

    const handleExpand = (index) => {
        setExpandItem(index);
        setIsExpandFlag(!isExpandFlag)
    }

    const getValueByVmDataList = (vmName, fieldName) => {
        const getData = vmDataList.find(v => v.name === vmName);
        const getValue = getData?.[fieldName]
        return getValue
    }

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

    useEffect(() => {
        fnGetData()
        fetchData()
    }, [])

    const fnGetData = async () => {
        setIsLoading(true)

        const params = {
            cluster,
            match: props.match,
        }
        
        const vmList = await vmsStore.fetchVmsDetail(params)
        const vmData = vmList.vms

        setVmDataList(vmData)
        setIsLoading(false)
    }    

    const fetchData = async () => {
        const params = { times: 50, step: '10m' }

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
            const data = await customStore.fetchMetric({
                expr: `linux:vm:cpu:usage_percent:5m`,
                ...paramsData,
                cluster,
            })

            setVmCpuData(data)
        }

        const getVmWinCpuUsageData = async () => {
            const data = await customStore.fetchMetric({
                expr: `windows:vm:cpu:usage_percent:5m`,
                ...paramsData,
                cluster,
            })
            setVmWinCpuData(data)
        }

        // vm memory data
        const getVmMemoryUsageData = async () => {
            const data = await customStore.fetchMetric({
                expr: `linux:vm:memory:used_bytes:raw`,
                ...paramsData,
                cluster,
            })

            setVmMemoryData(data)
        }

        const getVmWinMemoryUsageData = async () => {
            const data = await customStore.fetchMetric({
                expr: `windows:vm:memory:used_bytes:raw`,
                ...paramsData,
                cluster,
            })

            setVmWinMemoryData(data)
        }

        getVmCpuUsageData()
        getVmMemoryUsageData()
        getVmWinCpuUsageData()
        getVmWinMemoryUsageData()
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
    
    const renderMonitorings = (vmName, osType, project) => {

        const loading = false
        
        if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>

        const vmCpuMetricData = find(
          osType === 'linux' ? vmCpuData : vmWinCpuData,
          data => {
            if (data.metric.pod === vmName && data.metric.namespace === project)
              return data
          }
        )
    
        const vmMemoryMetricData = find(
          osType === 'linux' ? vmMemoryData : vmWinMemoryData,
          data => {
            if (data.metric.pod === vmName && data.metric.namespace === project)
              return data
          }
        )

        if (!vmCpuMetricData && !vmMemoryMetricData)
          return <div className={styles.monitors}>{t('NO_MONITORING_DATA')}</div>
    
        const vmCpuArray = []
        vmCpuArray.push(vmCpuMetricData)
    
        const vmMemoryArray = []
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
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
    }

    const getState = (state) => {
        if (
        state === 'Provisioning' ||
        state === 'Starting' ||
        state === 'Stopping' ||
        state === 'Terminating' ||
        state === 'Migrating' ||
        state === 'Booting'
        ) {
        return 'waiting'
        }
        if (state === 'Running') {
        return 'running'
        }
        if (state === 'Stopped' || state === 'Paused') {
        return 'stopped'
        }
        if (state === 'Unknown') {
        return 'error'
        }
        return 'error'
    }    

    return (
        <>          
            <div>
                <Panel title={t('RESOURCES_LISTENER')}>                    
                    {store.listenersDetail?.length === 0 && (
                        <div className={styles.empty}>
                            {t('RESOURCES_NO_DATA')}
                        </div>
                    )}
                     {store.listenersDetail?.length > 0 && store.listenersDetail.map((listener, index) => (
                        <div className={styles.listenerWrapper} key={index}>
                            <div className={classnames(styles.item)}>
                                <div className={classnames(styles.title, styles.name)}>
                                    <div>{index == 0 ? listener.name : (listener.name).replace(`${lbName}-`,'')}</div>
                                    <p>{t('RESOURCES_NAME')}</p>
                                </div>
                                <div className={classnames(styles.title, styles.name)}>
                                    <div>{(listener.status).charAt(0).toUpperCase() + (listener.status).slice(1)}</div>
                                    <p>{t('RESOURCES_STATE')}</p>
                                </div>
                                <div className={classnames(styles.title, styles.name)}>
                                    <div>{listener.protocol.toUpperCase()}</div>
                                    <p>{t('RESOURCES_PROTOCOL')}</p>
                                </div>
                                <div className={classnames(styles.title, styles.name)}>
                                    <div>{listener.port}</div>
                                    <p>{t('PORT')}</p>
                                </div>
                            </div>
                        </div>
                     ))}
                </Panel>
            </div>
            
            <div>
                <Panel title={t('RESOURCES_POOL')}>  
                    {store.detailData.detail?.pools.length === 0 && (
                        <div className={styles.empty}>
                            {t('RESOURCES_NO_DATA')}
                        </div>
                    )}
                    {(store.detailData.detail.pools).map((obj, index) => {
                        return (
                            <div
                                className={classnames(styles.expandItem, "", {
                                    [styles.expanded]: (index == expandItem ? isExpandFlag : false),
                                })} key={index}
                            >
                                <div className={styles.itemMain}>
                                    {renderContent(obj, index)}
                                </div>
                                {renderExtraContent(store.detailData.detail, index)}
                            </div>
                        )
                    }
                    )}    
                </Panel>
            </div>            
        </>
    );
};

export default inject('detailStore')(observer(Status))

