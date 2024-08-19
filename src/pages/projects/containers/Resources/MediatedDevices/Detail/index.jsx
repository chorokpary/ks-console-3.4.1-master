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
import MediatedDeviceStore from 'stores/resources/mediateddevices'
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { getLocalTime } from 'utils';
import routes from './routes'

const store = new MediatedDeviceStore();

const MediatedDeviceDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    const listUrl = () => {
        const { workspace, cluster, namespace } = props.match.params;
        return `/${workspace}/clusters/${cluster}/projects/${namespace}/mediateddevices`        
    }
    const getOperations = () => [
        {
            key: 'viewYaml',
            icon: 'eye',
            text: t('VIEW_YAML'),
            action: 'view',
            onClick: () =>
                props.rootStore.triggerAction('mediatedDevice.yaml.view', {
                    yaml: store.yaml,
                    readOnly: true,
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
                name: t('RESOURCES_MEDIATED_DEVICE_NAME'),
                value: detail.mediated_device.mediated_device_name,
            },
            {
                name: t('GPU'),
                value: detail.mediated_device.is_gpu ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE'),
            },
            {
                name: t('RESOURCES_AVAILABLE_COUNT'),
                value: detail.mediated_device.allocatable,
            },
            {
                name: t('RESOURCES_DESCRIPTION'),
                value: detail.mediated_device.description,
            },
	    {
                name: t('RESOURCES_REGIST_DATE'),
                value: getLocalTime(detail.mediated_device.timestamp).format(
                  'YYYY-MM-DD HH:mm:ss'
                ),
            },
        ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const getBanner = () => {
        return <i className="ico-type-mediatedvgpu"></i>
    }

    const sideProps = {
        icon: getBanner(),
        module: store.module,
        name: get(store.detail.mediated_device, 'resource_name'),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('RESOURCES_MEDIATED_DEVICE'),
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

export default inject('rootStore')(observer(MediatedDeviceDetail));