
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import LoadBalancerStore from 'stores/resources/loadbalancers'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'
import routes from './routes'
import FloatingIpStore from 'stores/resources/floatingip';

const store = new LoadBalancerStore();
const floatingstore = new FloatingIpStore()

const LoadBalancerDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    const listUrl = () => {
        const { cluster } = props.match.params
        return `/clusters/${cluster}/loadBalancers`
    }
    const routing = props.rootStore.routing;

    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);
    const lbName = props.match.params.name;
    const floatingData = toJS(store.floatingIpList)
    const floatingId = floatingData?.filter((row) => row.instance_name == lbName).map((el) => el.id)[0]
    const floatingIp = floatingData?.filter((row) => row.instance_name == lbName).map((el) => el.floating_ip)[0]

    const getOperations = () => [
        {
            key: 'edit',
            icon: 'pen',
            text: t('EDIT_INFORMATION'),
            action: 'edit',
            show: showEdit,
            onClick: () =>
                props.rootStore.triggerAction('loadBalancer.edit', {
                    type: 'LB_DETAIL',
                    detail: toJS(store.detail),
                    store: store,
                    success: fetchData,
                })
        },
        {
            key: 'floatingIp',
            icon: 'intranet-routers',
            text: floatingIp == undefined ? 'FIP 할당' : "FIP 해제",
            action: 'view',
            onClick: () => {
                if (floatingIp == undefined) {
                    props.rootStore.triggerAction('loadBalancer.floatingIpPop', {
                        type: 'LB_DETAIL',
                        store: store,
                        success: fetchData,
                    })
                } else {
                    props.rootStore.triggerAction('loadBalancer.floatingIpPop.deallocate', {
                        data: { id: floatingId },
                        store: floatingstore,
                        success: fetchData,
                    })
                }
            },
        },
        {
            key: 'viewYaml',
            icon: 'eye',
            text: t('VIEW_YAML'),
            action: 'view',
            onClick: () =>
                props.rootStore.triggerAction('loadBalancer.yaml.view', {
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
                props.rootStore.triggerAction('loadBalancer.delete', {
                    type: 'LB_DETAIL',
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
                name: t('네트워크 이름'),
                value: detail.lb.network,
            },
            {
                name: t('멤버 IP'),
                value: detail.lb.members.length > 1 ? detail.lb.members[0] + ' 외 ' + (detail.lb.members.length - 1) + '개' : detail.lb.members[0],
            },
            {
                name: t('VIP'),
                value: detail.lb.virtual_ip,
            },
            {
                name: t('정책'),
                //value: detail.lb.rules.length < 1 ? '-' : detail.lb.rules.map((rule) => (rule.protocol) + '\r\n')
                value: detail.lb.rules.length > 1 ? detail.lb.rules[0]?.protocol + ' 외 ' + (detail.lb.rules.length - 1) + '개' : detail.lb.rules[0]?.protocol,
            },
            {
                name: t('설명'),
                value: detail.lb.description,
            },
            {
                name: t('생성일'),
                value: getLocalTime(detail.lb.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            },
        ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        module: store.module,
        name: get(store.detail, 'name'),
        desc: get(store.detail.lb, 'description', ''),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('로드 밸런서'),
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

export default inject('rootStore')(observer(LoadBalancerDetail));

