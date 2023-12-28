
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import FloatingIpStore from 'stores/resources/floatingip'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'
import routes from './routes'

const store = new FloatingIpStore();

const FloatingIpDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    const listUrl = () => {
        const { workspace, cluster, namespace } = props.match.params
        return `/${workspace}/clusters/${cluster}/projects/${namespace}/floatingip`
    }
    const routing = props.rootStore.routing;

    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

    const getOperations = () => []

    const getAttrs = () => {
        const detail = toJS(store.detail)

        if (isEmpty(detail)) {
            return
        }

        console.log(store.detail)
        return [
            {
                name: t('RESOURCES_CLUSTER'),
                value: get(store.detail, 'cluster'),
            },
            {
                name: t('RESOURCES_FLOATING_IP'),
                value: get(store.detail.floating_ip, 'floating_ip'),
            },
            {
                name: t('RESOURCES_STATIC_IP'),
                value: get(store.detail.floating_ip, 'target_ip'),
            },
        ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        icon: "apps",
        module: store.module,
        name: get(store.detail, 'name'),
        // desc: get(store.detail.flavor, 'description', ''),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('RESOURCES_FLOATING_IP'),
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

export default inject('rootStore')(observer(FloatingIpDetail));

