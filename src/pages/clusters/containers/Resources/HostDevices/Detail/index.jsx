
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import SecurityGroupStore from 'stores/resources/securityGroups'
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'
import routes from './routes'

const store = new SecurityGroupStore();

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
                name: t('클러스터'),
                value: detail.cluster,
            },
            {
                name: t('제조사 ID'),
                value: detail.security_group.description,
            },
            {
                name: t('제조사'),
                value: detail.security_group.description,
            },
            {
                name: t('제품 ID'),
                value: detail.security_group.description,
            },
            {
                name: t('External'),
                value: detail.security_group.description,
            },
            {
                name: t('GPU'),
                value: detail.security_group.description,
            },
            {
                name: t('설명'),
                value: detail.security_group.description,

            },
            {
                name: t('생성일'),
                value: getLocalTime(detail.security_group.timestamp).format('YYYY-MM-DD HH:mm:ss'),
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
                label: t('호스트 디바이스'),
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

