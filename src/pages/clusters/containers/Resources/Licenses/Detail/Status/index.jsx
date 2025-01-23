import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Panel, Card, Text } from 'components/Base'
import { Loading, Button, Icon, Notify } from '@kube-design/components'
import StatusCard from './StatusCard'

import styles from './index.scss'

const Status = ({ status, tip }) => {
    const icon = (
        <Icon
            className={styles.status}
            name={status === 'success' ? 'success' : 'error'}
            color={{
                primary: '#fff',
                secondary: status === 'success' ? '#55bc8a' : '#ca2621',
            }}
        />
    )

    if (tip) {
        return <Tooltip content={tip}>{icon}</Tooltip>
    }

    return icon
}

const StatusPage = (props) => {

    const store = props.detailStore;

    const [showSecret, setShowSecret] = useState(false);
    const [encodeKey, setEncodeKey] = useState();
    const [originData, setOriginData] = useState();
    const [validity, setValidity] = useState(false);
    const [validityDetail, setValidityDetail] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setOriginData(get(store.detail.license, 'payload', ''));
        setEncodeKey(createEncode64(get(store.detail.license, 'payload', '')));
        setValidity(get(store.detail.license, 'validity', false));
        setValidityDetail(get(store.detail.license, 'validity_detail', ''));
        setIsLoading(false);
    }, [])

    const createEncode64 = (key) => {
        let forge = require('node-forge');
        const encoded = forge.util.encode64(key);
        return encoded;
    }

    const convert = () => {
        return showSecret ? originData : encodeKey
    }

    const textClipboard = () => {
        const keyText = showSecret ? originData : encodeKey;

        if (window.isSecureContext && navigator.clipboard) {
            navigator.clipboard.writeText(keyText).then(e => Notify.success(t('RESOURCES_COPY_SUCCESSFUL')));
        } else {
            unsecuredCopyToClipboard(keyText);
            Notify.success(t('RESOURCES_COPY_SUCCESSFUL'))
        }
    }

    // navigator.clipboard.writeText 가 https 환경에서만 작동하여
    // https 환경이 아닐경우 우회 복사 처리
    // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
    const unsecuredCopyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy')
        } catch (err) {
            console.error('Unable to copy to clipboard', err)
        }
        document.body.removeChild(textArea)
    };

    const renderOperations = () => {
        return (
            <div>
                <Button
                    type="flat"
                    icon={showSecret ? 'eye' : 'eye-closed'}
                    onClick={() => { setShowSecret(!showSecret) }}
                />
                <Button onClick={() => textClipboard()}>{t('RESOURCES_COPY')}</Button>
            </div>
        )
    }

    const renderStatus = () => {
        const fingerprint_status = { name: "fingerprint", flag: validityDetail.fingerprint, icon: "certification" }
        const period_status = { name: "period", flag: validityDetail.period, icon: "timed-task" }
        const node_num_status = { name: "node_num", flag: validityDetail.node_num, icon: "nodes" }
        const vm_num_status = { name: "vm_num", flag: validityDetail.vm_num, icon: "vmware" }
        return (
            <Panel title={t('RESOURCES_LICENSE_STATUS')}>
                <div className={styles.header}>
                    {validity === true ?
                        <Text
                            className={styles.info}
                            icon="success"
                            title={t(`HEALTHY`)}
                            description={t('CURRENT_STATUS')}
                            extra={
                                <Status status={validity ? 'success' : 'warning'} />
                            }
                        />
                        : <Text
                            className={styles.info}
                            icon="success"
                            title={t(`ERROR`)}
                            description={t('CURRENT_STATUS')}
                            extra={
                                <Status status={validity ? 'success' : 'warning'} />
                            }
                        />
                    }
                </div>
                <div className={styles.cardstatus}>
                    <StatusCard key="fingerprint" data={fingerprint_status} />
                    <StatusCard key="period" data={period_status} />
                    <StatusCard key="node_num" data={node_num_status} />
                    <StatusCard key="vm_num" data={vm_num_status} />
                </div>
            </Panel>
        )
    };

    return (
        <>
            {isLoading ?
                <div className={styles.loading}><Loading /></div>
                : <div>{renderStatus()}</div>
            }
            <div>
                <Card operations={renderOperations()}>
                    <div className={styles.defaultWrapper}>
                        <ul>
                            <li>
                                <span>
                                    <pre>{convert()}</pre>
                                </span>
                            </li>
                        </ul>
                    </div>
                </Card>
            </div>
        </>
    )

}

export default inject('detailStore')(observer(StatusPage))