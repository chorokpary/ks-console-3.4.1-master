import React, { useEffect } from 'react';

import { useParams } from 'react-router-dom';
import { toJS } from 'mobx';
import { get, isEmpty } from 'lodash';
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import DetailPage from 'clusters/containers/Base/Detail';
import { Card } from 'components/Base';
import { getLocalTime } from 'utils';

import * as common from 'utils/resources';
import routes from './routes';

import KeypairStore from 'stores/resources/keypairs';

const store = new KeypairStore();

const KeypairDetail = props => {
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  };

  const { workspace, cluster, namespace } = props.match.params;
  const listUrl = `/${workspace}/clusters/${cluster}/projects/${namespace}/keypairs`;

  const routing = props.rootStore.routing;
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
        props.rootStore.triggerAction('keypair.edit', {
          type: 'KEYPAIR_DETAIL',
          detail: toJS(store.detail),
          store: store,
          success: fetchData,
          ...props.match.params,
        }),
    },
    {
      key: 'viewYaml',
      icon: 'eye',
      text: t('VIEW_YAML'),
      action: 'view',
      onClick: () => {
        props.rootStore.triggerAction('keypair.yaml.view', {
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
        props.rootStore.triggerAction('keypair.remove', {
          type: 'KEYPAIR_DETAIL',
          detail: toJS(store.detail),
          store: store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl),
          ...props.match.params,
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
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.keypair.description,
      },
    ];
  };

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    icon: 'key',
    module: store.module,
    name: get(store.detail, 'name'),
    desc: get(store.detail.flavor, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_KEYPAIR'),
        url: listUrl,
      },
    ],
  };

  return (
    <>
      <DetailPage
        stores={{ detailStore: store }}
        routes={routes}
        {...sideProps}
      />
    </>
  );
};

export default inject('rootStore')(observer(KeypairDetail));
