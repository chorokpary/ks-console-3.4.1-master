import React from 'react'
import { observer, inject } from 'mobx-react'
import DetailVmList from 'pages/projects/containers/Resources/components/DetailVmList'
import { Panel } from 'components/Base'
import styles from './index.scss'

import classnames from 'classnames'
import { Icon } from '@kube-design/components'

const Status = (props) => {
    const store = props.detailStore;
    const rules = store.detail.lb?.rules || [];

    return (
        <div>
            <Panel title={t('RESOURCES_POLICY')}>
                {rules.length > 0
                    ? rules.map((rule, index) => (
                        <div className={styles.wrapper} key={index}>
                            <div className={classnames(styles.item)}>
                                <div className={styles.icon}>
                                    <Icon name="shield" size={40} />
                                </div>
                                <div className={classnames(styles.title, styles.name)}>
                                    <div>{(rule.protocol || '').toUpperCase()}</div>
                                    <p>{t('RESOURCES_PROTOCOL')}</p>
                                </div>
                                <div className={classnames(styles.title, styles.name)}>
                                    <div>{rule.port || '-'}</div>
                                    <p>ExternalPort</p>
                                </div>
                                <div className={classnames(styles.title, styles.name)}>
                                    <div>{rule.target_port || '-'}</div>
                                    <p>TargetPort</p>
                                </div>
                            </div>
                        </div>
                    ))
                    : <div className={styles.wrapper}>
                        <div>{t('RESOURCES_NO_POLICY')}</div>
                    </div>
                }
            </Panel>

            <DetailVmList
                type={t('RESOURCES_LOAD_BALANCER')}
                variables="lbs"
                name={props.match.params.name}
                project={props.match.params.namespace}
            />
        </div>
    );
};

export default inject('detailStore')(observer(Status))
