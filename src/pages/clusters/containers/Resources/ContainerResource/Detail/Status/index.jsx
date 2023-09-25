import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import classnames from 'classnames'

import ReplicaCard from 'clusters/components/Cards/Replica'
import { Panel, Text } from 'components/Base'
import { Icon, Button, Notify } from '@kube-design/components'

import styles from './index.scss'

const Status = (props) => {
    const store = props.detailStore;
    const detailFlavor = props.detailStore.machines;

    const state = [
        { nums: store.detail?.cluster?.cp?.replicas, unavailableNums: store.detail?.cluster?.cp?.unavailable_replicas },
        { nums: store.detail?.cluster?.md?.replicas, unavailableNums: store.detail?.cluster?.md?.unavailable_replicas }
    ]
    
    const names = ['Master 개수', 'Worker 개수']
    const text = { title : 'Worker 개수 조정', content : 'Worker 개수를 변경하시겠습니까?' }

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

    const enableScaleReplica =() => {
        return (
            enabledActions().includes('edit') 
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
                    {!!detailFlavor && detailFlavor.filter((obj) => { return obj.name.indexOf(store.detail?.cluster?.cp?.name) > -1 }).map((detail, index) => (
                        <div className={classnames(styles.itemNetwork)} key={index}>
                            <div className={styles.icon}>
                                <Icon name="nodes" size={40} />
                            </div>
                            <div className={styles.title}>
                                <div>{detail.phase}</div>
                                <p>Phase</p>
                            </div>
                            <div className={styles.title}>
                                <div>{detail.flavor}</div>
                                <p>Flavor</p>
                            </div>
                            <div className={styles.title}>
                                <div>{detail?.ready_status ? 'Ready' : 'Not-ready'}</div>
                                <p>상태</p>
                            </div>
                            <div className={styles.title}>
                                {detail?.networks?.length > 0 ?
                                    (<div>
                                        {(detail.networks).map((obj) => (
                                            <div key={obj.name}>{obj.ip}({obj.name})</div>
                                        ))}
                                    </div>)
                                    :
                                    <div>-</div>
                                }
                                <p>IP(네트워크)</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>

            <Panel title={"Worker Node"}>
                <div className={styles.wrapper}>
                    {!!detailFlavor && detailFlavor.filter((obj) => { return obj.name.indexOf(store.detail?.cluster?.cp?.name) == -1 }).map((detail, index) => (
                        <div className={classnames(styles.itemNetwork)} key={index}>
                            <div className={styles.icon}>
                                <Icon name="nodes" size={40} />
                            </div>
                            <div className={styles.title}>
                                <div>{detail.phase}</div>
                                <p>Phase</p>
                            </div>
                            <div className={styles.title}>
                                <div>{detail.flavor}</div>
                                <p>Flavor</p>
                            </div>
                            <div className={styles.title}>
                                <div>{detail?.ready_status ? 'Ready' : 'Not-ready'}</div>
                                <p>상태</p>
                            </div>
                            <div className={styles.title}>
                                {detail?.networks?.length > 0 ?
                                    (<div>
                                        {(detail.networks).map((obj) => (
                                            <div key={obj.name}>{obj.ip}({obj.name})</div>
                                        ))}
                                    </div>)
                                    :
                                    <div>-</div>
                                }
                                <p>IP(네트워크)</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>
        </>
    );
};

export default inject('detailStore')(observer(Status))

