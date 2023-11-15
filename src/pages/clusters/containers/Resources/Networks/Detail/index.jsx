
import React, { useEffect, useState } from 'react'
import { getIndexRoute } from 'utils/router.config'
import DetailPage from 'clusters/containers/Base/Detail'
import NetworkStore from 'stores/resources/networks'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

const store = new NetworkStore();

const NetworkDetail = (props) => {

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  }

  const { cluster } = props.match.params
  const listUrl = `/clusters/${cluster}/networks`

  const { routing } = props.rootStore;

  const PATH = `${listUrl}/${props.match.params.name}`

  const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

  const getOperations = () => [
    {
      key: 'edit',
      icon: 'pen',
      text: t('EDIT_INFORMATION'),
      action: 'edit',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('networks.edit', {
          type: 'NETWORK_DETAIL',
          detail: toJS(store.detail.network),
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
        props.rootStore.triggerAction('networks.yaml.view', {
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
        props.rootStore.triggerAction('networks.delete', {
          type: 'NETWORK_DETAIL',
          detail: toJS(store.detail),
          store: store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl),
          okText: '삭제',
          cancelText: '취소'
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
        name: t('디폴트 라우트'),
        value: detail.network.default_route ? '사용' : '미사용',
      },
      {
        name: t('External'),
        value: detail.network.external ? '사용' : '미사용',
      },
      {
        name: t('IP POOL 정보'),
        value: detail.network.ip_pool.start + '\n' + detail.network.ip_pool.end,
      },
      {
        name: t('DNS'),
        value: detail.network.dns.map(el => el + '\n'),
      },
      {
        name: t('호스트 라우트'),
        value: detail.network.host_routes.map(obj =>
          'Destination: ' + obj.destination + '\n Nexthop:' + obj.nexthop + '\n'
        ),
      },
      {
        name: t('설명'),
        value: detail.network.description,
      },
      {
        name: t('생성일'),
        value: getLocalTime(detail.network.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  if (store.isLoading && !store.detail.name) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    icon: "network-duotone",
    module: store.module,
    name: get(store.detail, 'name'),
    desc: get(store.detail.network, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('네트워크'),
        url: listUrl,
      },
    ],
  }

  return (
    <>
      <DetailPage
        stores={{ detailStore: store }}
        routes={[
          {
            path: `${PATH}/status`,
            title: '상태',
            component: Status,
            exact: true,
          },
          getIndexRoute({ path: `${PATH}`, to: `${PATH}/status`, exact: true }),
        ]}
        {...sideProps} />
    </>
  )
}

export default inject('rootStore')(observer(NetworkDetail));

const Status = ({ match }) => {
  const imageName = match.params.name
  return (
    // <DetailVmList type='이미지' variables='image' name={imageName} />
    null
  )
}