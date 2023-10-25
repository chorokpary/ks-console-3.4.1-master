import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import classnames from 'classnames'

import { isEmpty } from 'lodash'
import { Indicator } from 'components/Base'
import ReplicaCard from 'clusters/components/Cards/Replica'
import { Panel, Text } from 'components/Base'
import { Icon, Button, Notify } from '@kube-design/components'
import { TinyArea } from 'components/Charts'

import { getLocalTime } from 'utils'
import * as common from 'utils/resources'

import styles from './index.scss'

const Status = (props) => {
    const store = props.detailStore;
    const machines = props.detailStore.machines;

    const state = [
        { nums: store.detail?.cluster?.cp?.replicas, unavailableNums: store.detail?.cluster?.cp?.replicas },
        { nums: store.detail?.cluster?.md?.replicas, unavailableNums: store.detail?.cluster?.md?.replicas }
    ]

    const names = ['Master 개수', 'Worker 개수']
    const text = { title: 'Worker 개수 조정', content: 'Worker 개수를 변경하시겠습니까?' }

    const enabledActions = () => {
        return globals.app.getActions({
            module: module(),
            ...props.match.params,
            project: props.match.params.namespace,
        })
    }

    const module = () => {
        return store.module
    }

    const handleScale = () => {
        const { cluster, namespace, name } = store.detail
        store.scale = { cluster, namespace, name }
    }

    const enableScaleReplica = () => {
        return (
            enabledActions().includes('edit')
        )
    }

    //node script----------------------------------
    const [isExpandFlag, setIsExpandFlag] = useState(false)
    const [expandItem, setExpandItem] = useState();

    const getState = (state) => {
        if (state) {
            return "running"
        } else {
            return "inactive"
        }
    }

    const renderExtraContent = (obj) => {

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
                            <Text
                                key='CPU'
                                icon='cpu'
                                title={obj.flavor_detail.vcpus + " Core"}
                                description={t('CPU')}
                            />
                        </div>
                        <div className={styles.title}>
                            <Text
                                key='Memory'
                                icon='memory'
                                title={common.fnSetBytes(obj.flavor_detail.ram) + " Gib"}
                                description={t('Memory')}
                            />
                        </div>
                        <div className={styles.title}>
                            <Text
                                key='Disk'
                                icon='storage'
                                title={obj.flavor_detail.root_disk + " Gib"}
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

    const handleExpand = (name) => {
        setExpandItem(name);
        setIsExpandFlag(!isExpandFlag)
    }

    //monitoring script----------------------------------------------
    const getMonitoringCfgs = metrics => [
        {
            type: 'cpu',
            title: 'CPU',
            unitType: 'cpu',
            legend: ['USED'],
            data: [metrics.cpu],
            bgColor: 'transparent',
        },
        {
            type: 'memory',
            title: 'MEMORY',
            unitType: 'memory',
            legend: ['USED'],
            data: [metrics.memory],
            bgColor: 'transparent',
        },
    ]

    const renderMonitorings = () => {
        // const { metrics = {}, isExpand, loading } = props

        const isExpand = false;
        const loading = false;
        const metrics = {}

        if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>

        if (isEmpty(metrics.cpu) && isEmpty(metrics.memory))
            return <div className={styles.monitors}>{t('NO_MONITORING_DATA')}</div>

        const configs = getMonitoringCfgs(metrics)

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

    return (
        <>
            <ReplicaCard
                module={module()}
                detail={{ ...store.detail, state }}
                names={names}
                text={text}
                onScale={handleScale()}
                onFetchData={store.fetchData}
                enableScale={enableScaleReplica()}
            />

            <Panel title={"Master Node"}>
                <div className={styles.wrapper}>
                    {!!machines && machines.filter((obj) => { return obj.name.indexOf(store.detail?.cluster?.cp?.name) > -1 }).map((detail, index) => (
                        <div
                            className={classnames(styles.expandItem, "", {
                                [styles.expanded]: (detail.name == expandItem ? isExpandFlag : false),
                            })} key={index}
                        >
                            <div className={styles.itemMain} onClick={() => handleExpand(detail.name)}>

                                <div className={styles.icon}>
                                    <Icon name="nodes" size={40} type={detail.name != expandItem ? 'dark' : (detail.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
                                    <Indicator
                                        className={styles.indicator}
                                        type={getState(detail?.ready_status)}
                                        flicker
                                    />
                                </div>
                                <div className={styles.content}>
                                    <div className={styles.text} style={{ width: '25%' }}>
                                        <div>{detail.name}</div>
                                        <p>{getLocalTime(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
                                    </div>
                                    <div className={styles.text} style={{ width: '15%' }}>
                                        <div>{detail.phase}</div>
                                        <p>{detail?.ready_status ? 'Ready' : 'Not-ready'}</p>
                                    </div>
                                    <div className={styles.text}>
                                        {detail?.networks?.filter((network) => network.name != "k8s-pod-network").length > 0 ?
                                            (<div>
                                                {(detail.networks).filter((network) => network.name != "k8s-pod-network").map((obj) => (
                                                    <div key={obj.name}>{obj.ip}({obj.name})</div>
                                                ))}
                                            </div>)
                                            :
                                            <div>-</div>
                                        }
                                        <p>IP(네트워크)</p>
                                    </div>
                                    {renderMonitorings()}
                                    <div className={styles.arrow}>
                                        <Icon name="chevron-down" type={detail.name != expandItem ? '' : (detail.name == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
                                    </div>
                                </div>

                            </div>
                            {renderExtraContent(detail)}
                        </div>
                    ))}
                </div>
            </Panel>

            <Panel title={"Worker Node"}>
                <div className={styles.wrapper}>
                    {!!machines && machines.filter((obj) => { return obj.name.indexOf(store.detail?.cluster?.cp?.name) == -1 }).map((detail, index) => (
                        <div
                            className={classnames(styles.expandItem, "", {
                                [styles.expanded]: (detail.name == expandItem ? isExpandFlag : false),
                            })} key={index}
                        >
                            <div className={styles.itemMain} onClick={() => handleExpand(detail.name)}>

                                <div className={styles.icon}>
                                    <Icon name="nodes" size={40} type={detail.name != expandItem ? 'dark' : (detail.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
                                    <Indicator
                                        className={styles.indicator}
                                        type={getState(detail?.ready_status)}
                                        flicker
                                    />
                                </div>
                                <div className={styles.content}>
                                    <div className={styles.text} style={{ width: '25%' }}>
                                        <div>{detail.name}</div>
                                        <p>{getLocalTime(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
                                    </div>
                                    <div className={styles.text} style={{ width: '15%' }}>
                                        <div>{detail.phase}</div>
                                        <p>{detail?.ready_status ? 'Ready' : 'Not-ready'}</p>
                                    </div>
                                    <div className={styles.text}>
                                        {detail?.networks?.filter((network) => network.name != "k8s-pod-network").length > 0 ?
                                            (<div>
                                                {(detail.networks).filter((network) => network.name != "k8s-pod-network").map((obj) => (
                                                    <div key={obj.name}>{obj.ip}({obj.name})</div>
                                                ))}
                                            </div>)
                                            :
                                            <div>-</div>
                                        }
                                        <p>IP(네트워크)</p>
                                    </div>
                                    {renderMonitorings()}
                                    <div className={styles.arrow}>
                                        <Icon name="chevron-down" type={detail.name != expandItem ? '' : (detail.name == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
                                    </div>
                                </div>

                            </div>
                            {renderExtraContent(detail)}
                        </div>
                    ))}
                </div>
            </Panel>
        </>
    );
};

export default inject('detailStore')(observer(Status))

