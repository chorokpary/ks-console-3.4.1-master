
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import NetworkStore from 'stores/resources/networks'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'


import { getIndexRoute } from 'utils/router.config'
import Status from 'clusters/containers/Resources/Networks/Detail/Status'

const PATH_DETAIL = '/clusters/:cluster/networks/:name/:id'


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

  const PATH = `${listUrl}/${props.match.params.name}/${props.match.params.id}`

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
        props.rootStore.triggerAction('networks.remove', {
          type: 'NETWORK_DETAIL',
          detail: toJS(store.detail),
          store: store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl),
          okText: t('RESOURCES_DELETE'),
          cancelText: t('RESOURCES_CANCEL'),
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
        name: t('RESOURCES_NETWORK_TYPE_YOO'),
        value: detail.network.type.toUpperCase(),
      },
      {
        name: t('RESOURCES_SEGMENT_ID'),
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
        name: t('RESOURCES_GATEWAY_IP'),
        value: detail.network.gateway_ip,
      },
      {
        name: t('RESOURCES_DEFAULT_ROUTE'),
        value: detail.network.default_route ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE'),
      },
      {
        name: t('External'),
        value: detail.network.external ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE'),
      },
      {
        name: t('RESOURCES_IP_POOL_INFORMATION'),
        value: detail.network.ip_pool.start + '\n' + detail.network.ip_pool.end,
      },
      {
        name: t('DNS'),
        value: detail.network.dns.map(el => el + '\n'),
      },
      {
        name: t('RESOURCES_HOST_ROUTE'),
        value: detail.network.host_routes.map(obj =>
          'Destination: ' + obj.destination + '\n Nexthop:' + obj.nexthop + '\n'
        ),
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.network.description,
      },
      {
        name: t('RESOURCES_REGIST_DATE'),
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
    // desc: get(store.detail.network, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_NETWORK'),
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
            path: `${PATH_DETAIL}/status`,
            title: t('RESOURCES_STATE'),
            component: Status,
            exact: true,
          },
          getIndexRoute({ path: `${PATH_DETAIL}`, to: `${PATH_DETAIL}/status`, exact: true }),
        ]}
        {...sideProps} />
    </>
  )
}

export default inject('rootStore')(observer(NetworkDetail));

