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
                    <Panel title={t('RESOURCES_POLICY')}>
                        {store.detail.lb?.rules.map((rule, index) => (
                            <div className={styles.wrapper} key={index}>
                                <div className={classnames(styles.item)}>
                                    <div className={styles.icon}>
                                        <Icon name="shield" size={40} />
                                    </div>
                                    <div className={classnames(styles.title, styles.name)}>
                                        <div>{rule.protocol}</div>
                                        <p>{t('RESOURCES_PROTOCOL')}</p>
                                    </div>
                                    <div className={classnames(styles.title, styles.name)}>
                                        <div>{store.detail.lb?.members.filter((el, idx) => idx < 2).map((obj, idx) =>
                                            <div key={obj}>{obj}{store.detail.lb?.members.length > 2 && idx == 1 ? '...' : ''}</div>)}
                                        </div>
                                        <p>{t('RESOURCES_MEMBER_IP')}</p>
                                    </div>
                                    <div className={classnames(styles.title, styles.name)}>
                                        <div>{store.detail.lb?.virtual_ip}</div>
                                        <p>VIP</p>
                                    </div>
                                    <div className={classnames(styles.title, styles.name)}>
                                        <div>{rule.port_range_min !== rule.port_range_max ? (rule.port_range_min ? rule.port_range_min : 0) + `-` : ''}{rule.protocol === 'all' ? "0-65535" : rule.port_range_max}</div>
                                        <p>{t('RESOURCES_PORT_RANGE')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Panel>
                }
                {store.detail.lb?.rules.length == 0 &&
                    <Panel title={t('RESOURCES_POLICY')}>
                        <div className={styles.wrapper}>
                            <div>{t('RESOURCES_NO_POLICY')}</div>
                        </div>
                    </Panel>
                }
                {/* 가상 머신 상세 관련 샘플 */}
                {/*<DetailVmList type='Lb' variables='lbs' name={props.match.params.name} />*/}
            </div>
        </>
    );
};

export default inject('detailStore')(observer(Status))

