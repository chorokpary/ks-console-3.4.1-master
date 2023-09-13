
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import FlavorStore from 'stores/resources/flavors'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'
import routes from './routes'

const store = new FlavorStore();

const FlavorDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    const listUrl = () => {
        const { cluster } = props.match.params
        return `/clusters/${cluster}/flavors`
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
                props.rootStore.triggerAction('flavor.edit', {
                    type: 'FLAVOR_DETAIL',
                    detail: toJS(store.detail),
                    store: store,
                    success: fetchData,
                })
        },
        {
            key: 'viewYaml',
            icon: 'eye',
            text: t('VIEW_YAML'),
            action: 'view',
            onClick: () =>
                props.rootStore.triggerAction('flavor.yaml.view', {
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
                props.rootStore.triggerAction('flavor.delete', {
                    type: 'FLAVOR_DETAIL',
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
                name: t('클러스터'),
                value: detail.cluster,
            },
            {
                name: t('CPU'),
                value: detail.flavor.vcpus,
            },
            {
                name: t('몌모리'),
                value: common.fnSetBytes(detail.flavor.ram),
            },
            {
                name: t('루트 디스크'),
                value: detail.flavor.root_disk + ' GiB',
            },
            {
                name: t('임시 디스크'),
                value: detail.flavor.ephemeral_disk + ' GiB',
            },
            {
                name: t('GPU'),
                value: detail.flavor.gpus.length < 1 ? '-' : detail.flavor.gpus.map((gpu) => (gpu.name) + '\r\n')
            },
            {
                name: t('Host Device'),
                value: detail.flavor.devices.length < 1 ? '-' : detail.flavor.devices.map((device) => (device.name) + '\r\n')
            },
            {
                name: t('설명'),
                value: detail.flavor.description,
            },
            {
                name: t('생성일'),
                value: getLocalTime(detail.flavor.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            },
        ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        module: store.module,
        name: get(store.detail, 'name'),
        desc: get(store.detail.flavor, 'description', ''),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('Flavors'),
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

export default inject('rootStore')(observer(FlavorDetail));

