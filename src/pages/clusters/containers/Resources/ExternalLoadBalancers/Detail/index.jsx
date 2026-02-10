
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import ExternalLoadBalancerStore from 'stores/resources/externalloadbalancers'
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { getLocalTime } from 'utils'
import routes from './routes'

const store = new ExternalLoadBalancerStore();

const ExternalLoadBalancerDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }

    const listUrl = () => {
        const { cluster } = props.match.params
        return `/clusters/${cluster}/externalLoadBalancers`
    }
    const routing = props.rootStore.routing;

    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);
    
    const lbName = props.match.params.name;

    const getOperations = () => [
        {
            key: 'edit',
            icon: 'pen',
            text: t('EDIT'),
            action: 'edit',
            show: showEdit,
            onClick: () =>
                props.rootStore.triggerAction('externalLoadBalancer.edit', {
                    type: 'LB_DETAIL',
                    detail: toJS(store.detailData.detail),
                    store: store,
                    success: fetchData,
                    ...props.match.params
                })
        },
        {
            key: 'delete',
            icon: 'trash',
            text: t('DELETE'),
            action: 'delete',
            type: 'danger',
            show: showEdit,
            onClick: () =>
                props.rootStore.triggerAction('externalLoadBalancer.remove', {
                    type: 'LB_DETAIL',
                    detail: toJS(store.detailData.detail),
                    store: store,
                    cluster: props.match.params.cluster,
                    success: () => {
                        setTimeout(() => {
                            routing.push(listUrl())
                        }, 500)
                    },
                })
        },
    ]

    const getBesidesText = (arr = [], type) => {
        const first = type === 'O' ? arr?.[0]?.name : arr?.[0]
        const sidesText = arr?.length
                            ? arr.length > 1
                                ? `${first} ${t('RESOURCES_BESIDES')} ${arr.length - 1} ${t('RESOURCES_COUNT')}`
                                : first
                            : '-'
                            
        return sidesText
    }

    const getAttrs = () => {
        const detail = toJS(store.detailData.detail)
    
        if (isEmpty(detail)) {
            return
        }

        return [
            {
                name: t('RESOURCES_NAME'),
                value: lbName,
            },
            {
                name: t('PROJECT'),
                value: detail.project,
            },
            {
                name: t('IP'),
                value: detail.ip_address,
            },
            {
                name: t('RESOURCES_LISTENER'),
                value: getBesidesText(detail.listeners, 'O'),
            },
            {
                name: t('RESOURCES_POOL'),
                value: getBesidesText(detail.pools, 'O'),
            },
            {
                name: t('RESOURCES_MEMBER'),
                value: getBesidesText(detail.pools.flatMap(p => p.members ?? []), 'O'),
            },
            {
                name: t('RESOURCES_MONITOR'),
                value: getBesidesText(detail.monitors, 'O'),
            },
            {
                name: t('STATE'),
                value: detail.status.charAt(0).toUpperCase() + detail.status.slice(1)
            },
            {
                name: t('RESOURCES_DESCRIPTION'),
                value: detail.description,
            },
        ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        icon: "loadbalancer",
        module: store.module,
        name: get(store.detailData, 'name'),
        desc: get(store.detailData.lb, 'description', ''),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('RESOURCES_EXTERNAL_LB'),
                url: listUrl,
            },
        ],
    }

    return (
        <>
            <DetailPage
                stores={{ detailStore: store }}
                routes={routes}
                {...sideProps} />
        </>
    )
}

export default inject('rootStore')(observer(ExternalLoadBalancerDetail));

