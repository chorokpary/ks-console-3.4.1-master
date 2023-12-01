/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { getLocalTime } from 'utils'

import routes from './routes'
import ResourceStore from 'stores/resources/containerresource'

const store = new ResourceStore();

const ResourceDetail = (props) => {

    useEffect(() => {
        fetchData();
        store.fetchData = fetchData;
    }, [])

    const fetchData = async () => {
        await store.fetchDetail(props.match.params);
    }

    const listUrl = () => {
        const { cluster } = props.match.params
        return `/clusters/${cluster}/containerResource`
    }

    const routing = props.rootStore.routing;
    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

    const getOperations = () => [
        {
            key: 'edit',
            icon: 'pen',
            text: t('EDIT_INFORMATION'),
            action: 'edit',
            show: showEdit,
            onClick: () => {
                props.rootStore.triggerAction('containerresource.edit', {
                    type: 'RESOURCE_DETAIL',
                    detail: toJS(store.detail),
                    store: store,
                    success: fetchData,
                })
            },
        },
        {
            key: 'viewYaml',
            icon: 'eye',
            text: t('VIEW_YAML'),
            action: 'view',
            onClick: () => {
                props.rootStore.triggerAction('containerresource.yaml.view', {
                    yaml: store.yaml,
                    store: store,
                    readOnly: true,
                })
            },
        },
        {
            key: 'viewConfig',
            icon: 'eye',
            text: t('kubeconfig'),
            action: 'view',
            onClick: () => {
                props.rootStore.triggerAction('containerresource.config.view', {
                    resourceConfig: window.atob(store.resourceConfig),
                    store: store,
                    readOnly: true,
                })
            },
        },
        {
            key: 'delete',
            icon: 'trash',
            text: t('DELETE'),
            action: 'delete',
            type: 'danger',
            show: showEdit,
            onClick: () =>
                props.rootStore.triggerAction('containerresource.remove', {
                    type: 'RESOURCE_DETAIL',
                    detail: toJS(store.detail.cluster),
                    store: store,
                    cluster: props.match.params.cluster,
                    success: () => routing.push(listUrl()),
                }),
        },
    ]

    const getAttrs = () => {
        const detail = toJS(store.detail.cluster)
        const detailFlavor = store.machines
        if (isEmpty(detail)) {
            return
        }

        return [
            {
                name: t('클러스터'),
                value: detail.infra.namespace,
            },
            {
                name: t('Pod CIDRS'),
                value: detail.pod_cidrs.length > 0 ?
                    detail.pod_cidrs && (detail.pod_cidrs).map((cidr) => {
                        return <p key={cidr}>{cidr}</p>
                    })
                    : "-",
            },
            {
                name: t('Service CIDRS'),
                value: detail.service_cidrs.length > 0 ?
                    detail.service_cidrs && (detail.service_cidrs).map((cidr) => {
                        return <p key={cidr}>{cidr}</p>
                    })
                    : "-",
            },
            {
                name: t('쿠버네티스 서버 IP'),
                value: detail.cp_endpoint?.host,
            },
            {
                name: t('Port'),
                value: detail.cp_endpoint?.port,
            },
            {
                name: t('이미지'),
                value: detail.kube_image,
            },
            {
                name: t('버전'),
                value: detail.kube_version,
            },
            {
                name: t('CNI'),
                value: detail.cni,
            },
            {
                name: t('CSI'),
                value: detail.csi,
            },
            //{
            //    name: t('EKG Stack'),
            //    value: detail.ui,
            //},
            {
                name: t('ELB'),
                value: detail.elb ? detail.elb : '-',
            },
            {
                name: t('Master Flavor'),
                value: detailFlavor.length > 0 && detailFlavor.filter((obj) => obj.name.includes(detail.cp?.name)).map((machine, i) => { return <p key={i}>{machine?.flavor}</p> })
            },
            {
                name: t('Worker Flavor'),
                value: detailFlavor.length > 0 && detailFlavor.filter((obj, idx) => !obj.name.includes(detail.cp?.name) && idx === 1).map((machine, i) => { return <p key={i}>{machine?.flavor}</p> })
            },
            //{
            //    name: t('Scalling'),
            //    value: "-",
            //},
            {
                name: t('네트워크'),
                value: detail.network_name,
            },
            {
                name: t('설명'),
                value: detail.description ? detail.description : '-',
            },
            {
                name: t('생성시간'),
                value: getLocalTime(detail.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            },
        ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        module: store.module,
        name: get(store.detail.cluster, 'name'),
        desc: get(store.detail.cluster, 'description', ''),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('KaaS 리소스'),
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

export default inject('rootStore')(observer(ResourceDetail));