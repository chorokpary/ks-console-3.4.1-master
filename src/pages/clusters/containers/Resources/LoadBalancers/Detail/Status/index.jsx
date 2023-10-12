import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'
import { Panel } from 'components/Base'
import styles from './index.scss'

import classnames from 'classnames'
import { Icon } from '@kube-design/components'

const Status = (props) => {
    const store = props.detailStore;
    useEffect(() => {

    }, []);

    return (
        <>
            <div>
                {store.detail.lb?.rules.length > 0 &&
                    <Panel title={"정책"}>
                        {store.detail.lb?.rules.map((rule, index) => (
                            <div className={styles.wrapper}>
                                <div className={classnames(styles.item)}>
                                    <div className={styles.icon}>
                                        <Icon name="apps" size={40} />
                                    </div>
                                    <div className={classnames(styles.title, styles.name)}>
                                        <div>{rule.protocol}</div>
                                        <p>프로토콜</p>
                                    </div>
                                    <div className={classnames(styles.title, styles.name)}>
                                        <div>{store.detail.lb?.members}</div>
                                        <p>멤버 IP</p>
                                    </div>
                                    <div className={classnames(styles.title, styles.name)}>
                                        <div>{store.detail.lb?.virtual_ip}</div>
                                        <p>VIP</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Panel>
                }
                {/* 가상 머신 상세 관련 샘플 */}
                <DetailVmList type='Lb' variables='lbs' name={props.match.params.name} />
            </div>
        </>
    );
};

export default inject('detailStore')(observer(Status))

