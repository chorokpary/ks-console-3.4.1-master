/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
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
import HostDeviceStore from 'stores/resources/hostdevices'
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import routes from './routes';

const store = new HostDeviceStore();

const HostDeviceDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    const listUrl = () => {
        const { cluster } = props.match.params
        return `/clusters/${cluster}/hostDevices`
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
            onClick: () =>
                props.rootStore.triggerAction('hostDevice.edit', {
                    type: 'HOST_DEVICE_DETAIL',
                    detail: toJS(store.detail.host_device),
                    store,
                    success: fetchData,
                }),
        },
        {
            key: 'viewYaml',
            icon: 'eye',
            text: t('VIEW_YAML'),
            action: 'view',
            onClick: () =>
                props.rootStore.triggerAction('hostDevice.yaml.view', {
                    yaml: store.yaml,
                    readOnly: true,
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
                props.rootStore.triggerAction('hostDevice.remove', {
                    type: 'HOSTDEVICE_DETAIL',
                    detail: toJS(store.detail),
                    store: store,
                    cluster: props.match.params.cluster,
                    success: () => routing.push(listUrl()),
                    okText: t('RESOURCES_DELETE'),
                    cancelText: t('RESOURCES_CANCEL'),
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
                name: t('RESOURCES_CLUSTER'),
                value: detail.cluster,
            },
            {
                name: t('RESOURCES_MANUFACTURING_COMPANY_ID'),
                value: detail.host_device.vendor_id,
            },
            {
                name: t('RESOURCES_PRODUCT_ID'),
                value: detail.host_device.product_id,
            },
            {
                name: t('External'),
                value: detail.host_device.is_external ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE'),
            },
            {
                name: t('GPU'),
                value: detail.host_device.is_gpu ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE'),
            },
            {
                name: t('RESOURCES_AVAILABLE_COUNT'),
                value: detail.host_device.allocatable,
            },
            {
                name: t('RESOURCES_DESCRIPTION'),
                value: detail.host_device.description,

            },
        ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const getBanner = () => {
        return <i className="ico-type-hostdevice"></i>
    }

    const sideProps = {
        icon: getBanner(),
        module: store.module,
        name: get(store.detail.host_device, 'name'),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('RESOURCES_HOST_DEVICE'),
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

export default inject('rootStore')(observer(HostDeviceDetail));

