
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import ClusterFaultStore from 'stores/resources/clusterFault'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'
import routes from './routes'

const store = new ClusterFaultStore();

const ClusterFaultSetting = (props) => {
    useEffect(() => {
        fetchData();
    }, [])
    const { cluster } = props.match.params

    const fetchData = () => {
        store.fetchCrList(props.match.params);
    }
    const listUrl = () => {
        return `/clusters/${cluster}/clusterfault`
    }

    const getAttrs = () => {
        // const detail = toJS(store.detail)

        // if (isEmpty(detail)) {
        //     return
        // }

        return [
            {
                name: t('RESOURCES_CLUSTER'),
                value: cluster,
            },
            {
                name: t('범위'),
                value: ''
            },
            {
                name: t('RESOURCES_REGIST_DATE'),
                // value: getLocalTime(detail.lb.timestamp).format('YYYY-MM-DD HH:mm:ss'),
                value: ''
            },
        ]
    }

    // if (store.isLoading) {
    //     return <Loading className="ks-page-loading" />;
    // }

    const sideProps = {
        icon: "cluster",
        // module: store.module,
        module: 'clusterFault',
        name: t('RESOURCES_CLUSTER_FAULT_TITLE') + ' ' + t('RESOURCES_CLUSTER_FAULT_SET'),
        desc: t('RESOURCES_CLUSTER_FAULT_DESC'),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('RESOURCES_CLUSTER_FAULT_TITLE'),
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

export default inject('rootStore')(observer(ClusterFaultSetting));

