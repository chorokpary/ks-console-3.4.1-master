
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

import * as common from 'utils/resources'
import routes from './routes'

import SriovStore from 'stores/resources/sriovs'

const store = new SriovStore();

const KeypairDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    
    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/sriovs`

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
            props.rootStore.triggerAction('sriov.edit', {
            type: 'SRIOV_DETAIL',
            detail: toJS(store.detail),
            store: store,
            success: fetchData,
          }),
      },
      {
        key: 'viewYaml',
        icon: 'eye',
        text: t('VIEW_YAML'),
        action: 'view',
        onClick: () => {
            props.rootStore.triggerAction('sriov.yaml.view', {
            yaml: store.yaml,
            readOnly: true,
          })
        },
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('DELETE'),
        action: 'delete',
        type: 'danger',
        show: showEdit,
        onClick: () =>
            props.rootStore.triggerAction('sriov.remove', {
            type: 'SRIOV_DETAIL',
            detail: toJS(store.detail),
            store: store,
            cluster: props.match.params.cluster,
            success: () => routing.push(listUrl),
          }),
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
          name: t('네트워크 유형'),
          value: detail.network.type,
        },
        {
          name: t('세그먼트 ID'),
          value: detail.network.segment_id,
        },
        {
          name: t('MTU'),
          value: detail.network.mtu,
        },
        {
          name: t('CIDR'),
          value: detail.network.cidr,
        },
        {
          name: t('게이트웨이 IP'),
          value: detail.network.gateway_ip,
        },
        {
          name: t('IP POOL 정보'),
          value: detail.network.ip_pool.start + '\n' + detail.network.ip_pool.end,
        },
        {
          name: t('DNS'),
          value: detail.network.dns?.map(el => el + '\n'),
        },
        {
          name: t('호스트 라우트'),
          value: detail.network.host_routes?.map(obj =>
            'Destination: ' + obj.destination + '\n Nexthop:' + obj.nexthop + '\n'
          ),
        },
        {
          name: t('설명'),
          value: detail.network.description,
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
                label: t('SR-IOV'),
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

export default inject('rootStore')(observer(KeypairDetail));

