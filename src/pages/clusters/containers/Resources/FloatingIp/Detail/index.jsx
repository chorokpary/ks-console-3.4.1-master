
import React, { useEffect, useState } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'
import FloatingIpStore from 'stores/resources/floatingip';

const store = new FloatingIpStore();

const FloatingIpDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/floatingip`

    const { routing } = props.rootStore;

    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

    const getOperations = () => [
        {
            key: 'edit',
            icon: 'pen',
            text: t('EDIT_INFORMATION'),
            action: 'edit',
            show: showEdit,
            onClick: () =>
                props.rootStore.triggerAction('floatingIp.edit', {
                    type: 'FLOATINGIP_DETAIL',
                    detail: toJS(store.detail.floating_ip),
                    store: store,
                    success: fetchData,
                })
        },
        {
            key: 'edit1',
            icon: 'image',
            text: t('VM 연결'),
            action: 'view',
            onClick: () =>
                console.log('asd')
        },
        {
            key: 'edit2',
            icon: 'image',
            text: t('LB 연결'),
            action: 'view',
            onClick: () =>
                console.log('asd')
        },
        {
            key: 'delete',
            icon: 'trash',
            text: t('삭제'),
            action: 'delete',
            type: 'danger',
            show: showEdit,
            onClick: () =>
                props.rootStore.triggerAction('floatingIp.delete', {
                    type: 'FLOATINGIP_DETAIL',
                    detail: toJS(store.detail),
                    store: store,
                    cluster: props.match.params.cluster,
                    success: () => routing.push(listUrl),
                    okText: '삭제',
                    cancelText: '취소',
                    ...props
                })
        },
    ]

    const getAttrs = () => {
        const detail = toJS(store.detail)

        if (isEmpty(detail)) {
            return
        }

        return [
            {
                name: t('클러스터'),
                value: detail.cluster,
            },
            {
                name: t('플로팅 IP'),
                value: detail.floating_ip.floating_ip,
            },
            {
                name: t('고정 IP'),
                value: detail.floating_ip.target_ip,
            },
        ]
    }

    if (store.isLoading && !store.detail.name) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        module: store.module,
        name: get(store.detail, 'name'),
        desc: get(store.detail.network, 'description', ''),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('플로팅 IP'),
                url: listUrl,
            },
        ],
    }

    return (
        <>
            <DetailPage
                stores={{ detailStore: store }}
                routes={[
                    {
                        path: '',
                        title: '상태',
                        component: Status,
                        exact: true,
                    }
                ]}
                {...sideProps} />
        </>
    )
}

export default inject('rootStore')(observer(FloatingIpDetail));

const Status = ({ match }) => {
    const imageName = match.params.name
    return (
        // <DetailVmList type='이미지' variables='image' name={imageName} />
        null
    )
}