
import React, { useEffect } from 'react'
import DetailPage from 'projects/containers/Base/Detail'

import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';

import routes from './routes'

import SriovStore from 'stores/resources/sriovs'

const store = new SriovStore();

const SriovDetail = (props) => {

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  }

  const { workspace, cluster, namespace } = props.match.params
  const listUrl = `/${workspace}/clusters/${cluster}/projects/${namespace}/sriovs`

  const routing = props.rootStore.routing;
  const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

  const getOperations = () => {
    const operations = [
      {
        key: 'edit',
        icon: 'pen',
        text: t('EDIT_INFORMATION'),
        action: 'edit',
        show: showEdit,
        onClick: () =>
          props.rootStore.triggerAction('sriov.edit', {
            ...props.match.params,
            type: 'SRIOV_DETAIL',
            detail: toJS(store.detail),
            store,
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
          });
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
            detail: toJS(store.detail.network),
            store,
            cluster: props.match.params.cluster,
            success: () => routing.push(listUrl),
            okText: t('RESOURCES_DELETE'),
            cancelText: t('RESOURCES_CANCEL'),
          }),
      },
    ];
    return operations;
  };

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
        name: t('RESOURCES_DHCP_SERVER_DEPLOY'),
        value: detail.network.dhcp_enabled ? 'On' : 'Off',
      },
      {
        name: t('RESOURCES_IP_POOL_INFORMATION'),
        value: detail.network.ip_pool.start + '\n' + detail.network.ip_pool.end,
      },
      {
        name: t('DNS'),
        value: detail.network.dns?.map(el => el + '\n'),
      },
      {
        name: t('RESOURCES_HOST_ROUTE'),
        value: detail.network.host_routes?.map(obj =>
          'Destination: ' + obj.destination + '\n Nexthop:' + obj.nexthop + '\n'
        ),
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.network.description,
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />;
  }

  const getBanner = () => {
    return <i className="ico-type24-sriov"></i>
  }

  const sideProps = {
    icon: getBanner(),
    module: "networks",
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

export default inject('rootStore')(observer(SriovDetail));

