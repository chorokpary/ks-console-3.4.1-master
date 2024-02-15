
import React, { useEffect, useState } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import ClusterFaultStore from 'stores/resources/clusterFault'
import { get, isEmpty } from 'lodash'
import { observer, inject } from 'mobx-react';
import routes from './routes'

const store = new ClusterFaultStore();

const ClusterFaultSetting = (props) => {

    const [activeCr, setActiveCr] = useState('')
    const [activeCrDate, setActiveCrDate] = useState('')

    useEffect(() => {
        // fetchData();
    }, [])

    const { cluster } = props.match.params

    const fetchData = async () => {
        let res = await store.activeCrList()
        let name = get(res?.[0], 'metadata.name')
        let date = get(res?.[0], 'metadata.creationTimestamp')
        setActiveCr(name)
        setActiveCrDate(date)
    }

    const listUrl = () => {
        return `/clusters/${cluster}/clusterfault`
    }

    const getAttrs = () => {
        return [
            {
                name: t('RESOURCES_CLUSTER'),
                value: cluster,
            },
            // {
            //     name: t('사용 대상'),
            //     value: activeCr
            // },
            // {
            //     name: t('RESOURCES_REGIST_DATE'),
            //     value: getLocalTime(activeCrDate).format('YYYY-MM-DD HH:mm:ss'),
            // },
        ]
    }

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

