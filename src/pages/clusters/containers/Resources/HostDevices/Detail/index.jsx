
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import HostDeviceStore from 'stores/resources/hostdevices'
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'
import routes from './routes'

const store = new HostDeviceStore();

const HostDeviceDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        const { cluster } = props.match.params
        const pathname = props.location.pathname
        const param = {};
        param.cluster = cluster;
        param.name = pathname.replace(`/clusters/${cluster}/hostDevices/`, '');
        store.fetchDetail(param);
    }
    const listUrl = () => {
        const { cluster } = props.match.params
        return `/clusters/${cluster}/hostDevices`
    }
    const routing = props.rootStore.routing;

    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

    const getOperations = () => [
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
                props.rootStore.triggerAction('hostDevice.delete', {
                    type: 'HOSTDEVICE_DETAIL',
                    detail: toJS(store.detail),
                    store: store,
                    cluster: props.match.params.cluster,
                    success: () => routing.push(listUrl()),
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
                name: t('RESOURCES_MANUFACTURING_COMPANY'),
                value: detail.host_device.description,
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
                name: t('RESOURCES_DESCRIPTION'),
                value: detail.host_device.description,

            },
        ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        module: store.module,
        name: get(store.detail, 'name'),
        desc: get(store.detail.security_group, 'description', ''),
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

