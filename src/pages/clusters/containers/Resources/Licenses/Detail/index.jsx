import React, { useEffect, useReducer, useState } from 'react'
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Card } from 'components/Base'
import { Loading, Button, Notify } from '@kube-design/components'
import { observer, inject } from 'mobx-react'
import { getIndexRoute } from 'utils/router.config'
import LicenseStore from 'stores/resources/licenses'
import DetailPage from 'clusters/containers/Base/Detail'
import { getLocalTime } from 'utils'
import routes from './routes'

const store = new LicenseStore()

const LicenseDetail = props => {

    const [detail, setDetail] = useState()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const detailInfo = await store.fetchDetail(props.match.params)
        setDetail(detailInfo)
    }

    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/licenses`
    const { routing } = props.rootStore
    const PATH = `${listUrl}/${props.match.params.name}`
    const showEdit = !globals.config.presetClusterRoles.includes(
        props.match.params.name
    )

    const getOperations = () => [
        {
            key: 'delete',
            icon: 'trash',
            text: t('DELETE'),
            action: 'delete',
            type: 'danger',
            show: showEdit,
            onClick: () =>
                props.rootStore.triggerAction('license.remove', {
                    type: 'LICENSE_DETAIL',
                    detail: toJS(store.detail),
                    store,
                    cluster: props.match.params.cluster,
                    success: () => routing.push(listUrl),
                    okText: t('RESOURCES_DELETE'),
                    cancelText: t('RESOURCES_CANCEL'),
                }),
        },
    ]

    const getAttrs = () => {
        // const detail = toJS(store.detail);

        if (isEmpty(detail)) {
            return
        }

        return [
            {
                name: t('RESOURCES_CLUSTER'),
                value: detail.cluster,
            },
            {
                name: t('RESOURCES_USE_CHECK'),
                value: detail.license.inuse
                    ? t('RESOURCES_USED')
                    : t('RESOURCES_UNUSED'),
            },
            {
                name: t('RESOURCES_START_DATE'),
                value: detail.license.start_date,
            },
            {
                name: t('RESOURCES_EXPIRATION_DATE'),
                value: detail.license.end_date,
            },
            {
                name: t('RESOURCES_ISSUED_DATE'),
                value: detail.license.issued_date,
            },
            {
                name: t('RESOURCES_MAX_NODE_NUMBER'),
                value: detail.license.node_num,
            },
            {
                name: t('RESOURCES_MAX_VM_NUMBER'),
                value: detail.license.vm_num,
            },
            {
                name: t('RESOURCES_DESCRIPTION'),
                value: detail.license.description,
            },
            {
                name: t('RESOURCES_CREATE_DAY'),
                value: getLocalTime(detail.license.timestamp).format(
                    'YYYY-MM-DD HH:mm:ss'
                ),
            },
        ]
    }

    if (store.isLoading && !store.detail.name) {
        return <Loading className="ks-page-loading" />
    }

    const sideProps = {
        icon: 'licenses',
        module: store.module,
        name: detail?.license.name,
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('RESOURCES_LICENSE'),
                url: listUrl,
            },
        ],
    }

    return (
        <>
            <DetailPage
                stores={{ detailStore: store }}
                routes={routes}
                {...sideProps}
            />
        </>
    )
}

export default inject('rootStore')(observer(LicenseDetail))