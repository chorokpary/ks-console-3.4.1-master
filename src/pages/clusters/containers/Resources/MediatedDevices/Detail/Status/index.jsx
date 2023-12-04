import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'
import classnames from 'classnames'

import { Panel, Text } from 'components/Base'
import { Icon } from '@kube-design/components'
import styles from './index.scss'

const Status = (props) => {
    const store = props.detailStore;
    useEffect(() => {

    }, []);

    return (
        <>
            <div>
                {/* 보안그룹 */}
                <div>
                    {store.detail.security_group?.rules.filter((rule) => rule.direction === "ingress").length > 0 &&
                        < Panel title={t('RESOURCES_INBOUND')}>
                            {store.detail.security_group?.rules.filter((rule) => rule.direction === "ingress").map((rule, index) => (
                                <div className={styles.wrapper}>
                                    <div className={classnames(styles.item)}>
                                        <div className={styles.icon}>
                                            <Icon name="apps" size={40} />
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{rule.ethernet_type ? rule.protocol : 'ALL'}</div>
                                            <p>{t('RESOURCES_PROTOCOL')}</p>
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{rule.port_range_min !== rule.port_range_max ? (rule.port_range_min ? rule.port_range_min : 0) + `-` : ''}{rule.ethernet_type ? rule.port_range_max : "0-65535"}</div>
                                            <p>{t('RESOURCES_PORT_RANGE')}</p>
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{rule.ethernet_type ?? 'ALL'}</div>
                                            <p>{t('RESOURCES_ETHERNET')}</p>
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{rule.remote_ip_prefix}</div>
                                            <p>{t('RESOURCES_REMOTE_IP_RANGE')}</p>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </Panel>
                    }
                    {store.detail.security_group?.rules.filter((rule) => rule.direction === "egress").length > 0 &&
                        <Panel title={t('RESOURCES_OUTBOUND')}>
                            {store.detail.security_group?.rules.filter((rule) => rule.direction === "egress").map((rule, index) => (
                                <div className={styles.wrapper}>
                                    <div className={classnames(styles.item)}>
                                        <div className={styles.icon}>
                                            <Icon name="apps" size={40} />
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{rule.ethernet_type ? rule.protocol : 'ALL'}</div>
                                            <p>{t('RESOURCES_PROTOCOL')}</p>
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{rule.port_range_min !== rule.port_range_max ? (rule.port_range_min ? rule.port_range_min : 0) + `-` : ''}{rule.ethernet_type ? rule.port_range_max : "0-65535"}</div>
                                            <p>{t('RESOURCES_PORT_RANGE')}</p>
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{rule.ethernet_type ?? 'ALL'}</div>
                                            <p>{t('RESOURCES_ETHERNET')}</p>
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{rule.remote_ip_prefix}</div>
                                            <p>{t('RESOURCES_REMOTE_IP_RANGE')}</p>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </Panel>
                    }
                </div>
                {/* 가상 머신 상세 관련 샘플 */}
                <DetailVmList type={t('RESOURCES_SECURITY_GROUP')} variables='security_groups' name={props.match.params.name} />
            </div>
        </>
    );
};

export default inject('detailStore')(observer(Status))

