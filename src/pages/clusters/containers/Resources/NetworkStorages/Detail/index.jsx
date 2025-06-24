import React, { useEffect } from 'react';
import DetailPage from 'clusters/containers/Base/Detail';
import NetworkStorageStore from 'stores/resources/networkstorages';
import { toJS } from 'mobx';
import { get, isEmpty } from 'lodash';
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base';
import { getLocalTime } from 'utils';

import { getIndexRoute } from 'utils/router.config';
import Status from 'clusters/containers/Resources/NetworkStorages/Detail/Status';

const PATH_DETAIL = '/clusters/:cluster/networkstorages/:name';

const store = new NetworkStorageStore();

const NetworkStorageDetail = props => {
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  };

  const { cluster } = props.match.params;
  const listUrl = `/clusters/${cluster}/networkstorages`;

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
        props.rootStore.triggerAction('networkstorages.edit', {
          type: 'NETWORK_DETAIL',
          detail: toJS(store.detail.storage_config),
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
        props.rootStore.triggerAction('networkstorages.yaml.view', {
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
        props.rootStore.triggerAction('networkstorages.remove', {
          type: 'NETWORK_DETAIL',
          detail: toJS(store.detail),
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
        name: t('RESOURCES_FILESYSTEM'),
        value: detail.storage_config.filesystem.toUpperCase(),
      },
      {
        name: t('RESOURCES_PROTOCOL'),
        value: detail.storage_config.protocol.toUpperCase(),
      },
      {
        name: t('RESOURCES_TRANSPORT'),
        value: detail.storage_config.transport.toUpperCase(),
      },
      {
        name: t('RESOURCES_MAX_CONNECTION'),
        value: detail.storage_config.max_connection,
      },
      {
        name: t('RESOURCES_ENDPOINT'),
        value: detail.storage_config.endpoint,
      },
      {
        name: t('RESOURCES_MOUNT_POINT'),
        value: detail.storage_config.mount_point,
      },
      {
        name: t('RESOURCES_MOUNT_OPTIONS'),
        value: detail.storage_config.gateway_ip,
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.storage_config.description,
      },
      {
        name: t('RESOURCES_REGIST_DATE'),
        value: getLocalTime(detail.storage_config.timestamp).format(
          'YYYY-MM-DD HH:mm:ss'
        ),
      },
    ];
  };

  if (store.isLoading && !store.detail.name) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    icon: 'storage',
    module: store.module,
    name: get(store.detail, 'name'),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_NETWORK_STORAGE'),
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

export default inject('rootStore')(observer(NetworkStorageDetail));