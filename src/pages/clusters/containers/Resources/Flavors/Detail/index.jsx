import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx';
import { get, isEmpty } from 'lodash';
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import FlavorStore from 'stores/resources/flavors';
import DetailPage from 'clusters/containers/Base/Detail';
import { Card } from 'components/Base';
import { getLocalTime } from 'utils';
import * as common from 'utils/resources';
import routes from './routes';

const store = new FlavorStore();

const FlavorDetail = props => {
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  };
  const listUrl = () => {
    const { cluster } = props.match.params;
    return `/clusters/${cluster}/flavors`;
  };
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
        props.rootStore.triggerAction('flavor.edit', {
          type: 'FLAVOR_DETAIL',
          detail: toJS(store.detail),
          store: store,
          success: fetchData,
          ...props,
        }),
    },
    {
      key: 'viewYaml',
      icon: 'eye',
      text: t('VIEW_YAML'),
      action: 'view',
      onClick: () =>
        props.rootStore.triggerAction('flavor.yaml.view', {
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
        props.rootStore.triggerAction('flavor.remove', {
          type: 'FLAVOR_DETAIL',
          detail: toJS(store.detail),
          store: store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl()),
        }),
    },
  ];

  const getAttrs = () => {
    const detail = toJS(store.detail);

    if (isEmpty(detail)) {
      return;
    }

    console.log("detail.flavor : "+ JSON.stringify(detail.flavor))

    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: detail.cluster,
      },
      {
        name: t('CPU'),
        value: detail.flavor.vcpus,
      },
      {
        name: t('RESOURCES_MEMORY'),
        value: `${common.fnSetBytes(detail.flavor.ram)} GiB`,
      },
      {
        name: t('RESOURCES_ROOT_DISK'),
        value: `${detail.flavor.root_disk} GiB`,
      },
      {
        name: t('RESOURCES_TEMPORARY_DISK'),
        value: `${detail.flavor.ephemeral_disk} GiB`,
      },
      {
        name: t('GPU'),
        value:
          detail.flavor.gpus.length < 1
            ? '-'
            : detail.flavor.gpus.map(gpu => `${gpu.quantity} ${gpu.name}\r\n`),
      },
      {
        name: t('Host Device'),
        value:
          detail.flavor.devices.length < 1
            ? '-'
            : detail.flavor.devices.map(device => `${device.name}\r\n`),
      },
      {
        name: 'Extra Spec',
        value:
          detail.flavor.extra_specs.length < 1
            ? '-'
            : detail.flavor.extra_specs.map(spec => `${spec.key}\r\n`),
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.flavor.description ? detail.flavor.description : '-',
      },
      {
        name: t('RESOURCES_CREATE_DAY'),
        value: getLocalTime(detail.flavor.timestamp).format(
          'YYYY-MM-DD HH:mm:ss'
        ),
      },
    ];
  };

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    icon: 'apps',
    module: store.module,
    name: get(store.detail, 'name'),
    // desc: get(store.detail.flavor, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('Flavors'),
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

export default inject('rootStore')(observer(FlavorDetail));
