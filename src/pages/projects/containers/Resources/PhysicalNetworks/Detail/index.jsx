/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2025 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */
import React, { useEffect } from 'react';
import DetailPage from 'clusters/containers/Base/Detail';
import PhysicalNetworkStore from 'stores/resources/physicalnetworks';
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx';
import { get, isEmpty } from 'lodash';
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base';
import { getLocalTime } from 'utils';

import { getIndexRoute } from 'utils/router.config';
import Status from 'projects/containers/Resources/PhysicalNetworks/Detail/Status';

const PATH_DETAIL = '/:workspace/clusters/:cluster/projects/:namespace/physicalnetworks/:name'

const store = new PhysicalNetworkStore();

const PhysicalNetworkDetail = props => {
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  };

  const { workspace, cluster, namespace } = props.match.params
  const listUrl = `/${workspace}/clusters/${cluster}/projects/${namespace}/physicalnetworks`

  const { routing } = props.rootStore;

  const PATH = `${listUrl}/${props.match.params.name}/${props.match.params.id}`;

  const showEdit = !globals.config.presetClusterRoles.includes(
    props.match.params.name
  );

  const getOperations = () => [
    {
      key: 'edit',
      icon: 'pen',
      text: t('EDIT_INFORMATION'),
      action: 'edit',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('physicalnetworks.edit', {
          type: 'NETWORK_DETAIL',
          detail: toJS(store.detail.physicalnetwork),
          store,
          success: fetchData,
        }),
    },
    {
      key: 'viewYaml',
      icon: 'eye',
      text: t('VIEW_YAML'),
      action: 'view',
      onClick: () =>
        props.rootStore.triggerAction('physicalnetworks.yaml.view', {
          yaml: store.yaml,
          readOnly: true,
        }),
    },
    {
      key: 'delete',
      icon: 'trash',
      text: t('DELETE'),
      action: 'delete',
      type: 'danger',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('physicalnetworks.remove', {
          type: 'NETWORK_DETAIL',
          detail: toJS(store.detail.physicalnetwork),
          store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl),
          okText: t('RESOURCES_DELETE'),
          cancelText: t('RESOURCES_CANCEL'),
        }),
    },
  ];

  const getAttrs = () => {
    const detail = toJS(store.detail);

    if (isEmpty(detail)) {
      return;
    }

    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: detail.cluster,
      },
      {
        name: t('RESOURCES_RESOURCE_NAME'),
        value: detail.physicalnetwork.resource_name,
      },
      {
        name: t('RESOURCES_FABRIC'),
        value: detail.physicalnetwork.fabric.toUpperCase(),
      },
      {
        name: t('RESOURCES_NETWORK_TYPE_YOO'),
        value: detail.physicalnetwork.type.toUpperCase(),
      },
      {
        name: t('RESOURCES_SEGMENT_ID'),
        value: detail.physicalnetwork.segment_id,
      },
      {
        name: t('RESOURCES_MTU'),
        value: detail.physicalnetwork.mtu,
      },
      {
        name: t('RESOURCES_CIDR'),
        value: detail.physicalnetwork.cidr,
      },
      {
        name: t('RESOURCES_GATEWAY_IP'),
        value: detail.physicalnetwork.gateway_ip,
      },
      {
        name: t('RESOURCES_DEFAULT_ROUTE'),
        value: detail.physicalnetwork.default_route
          ? t('RESOURCES_USE')
          : t('RESOURCES_NOT_USE'),
      },
      {
        name: t('RESOURCES_IP_POOL_INFORMATION'),
        value: `${detail.physicalnetwork.ip_pool.start}\n${detail.physicalnetwork.ip_pool.end}`,
      },
      {
        name: t('RESOURCES_INTERFACE'),
        value: detail.physicalnetwork.interface,
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.physicalnetwork.description,
      },
      {
        name: t('RESOURCES_REGIST_DATE'),
        value: getLocalTime(detail.physicalnetwork.timestamp).format(
          'YYYY-MM-DD HH:mm:ss'
        ),
      },
    ];
  };

  if (store.isLoading && !store.detail.name) {
    return <Loading className="ks-page-loading" />;
  }

  const getBanner = () => {
    return <i className="ico-type24-sriov"></i>
  }

  const sideProps = {
    icon: getBanner(),
    module: store.module,
    name: get(store.detail, 'name'),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_PHYSICAL_NETWORK'),
        url: listUrl,
      },
    ],
  };

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
          getIndexRoute({
            path: `${PATH_DETAIL}`,
            to: `${PATH_DETAIL}/status`,
            exact: true,
          }),
        ]}
        {...sideProps}
      />
    </>
  );
};

export default inject('rootStore')(observer(PhysicalNetworkDetail));
