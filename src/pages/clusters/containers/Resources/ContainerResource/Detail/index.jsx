import React, { useEffect } from 'react';

import { toJS } from 'mobx';
import { get, isEmpty } from 'lodash';
import { Loading, Icon } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import DetailPage from 'clusters/containers/Base/Detail';
import { getLocalTime } from 'utils';

import routes from './routes';
import ResourceStore from 'stores/resources/containerresource';

const store = new ResourceStore();

const ResourceDetail = props => {
  useEffect(() => {
    fetchData();
    store.fetchData = fetchData;
  }, []);

  const fetchData = async () => {
    await store.fetchDetail(props.match.params);
  };

  const listUrl = () => {
    const { cluster } = props.match.params;
    return `/clusters/${cluster}/containerResource`;
  };

  const routing = props.rootStore.routing;
  const showEdit = !globals.config.presetClusterRoles.includes(
    props.match.params.name
  );
  const kaasResourceName = props.match.params.name;

  const getOperations = kaasName => {
    const operations = [
      {
        key: 'edit',
        icon: 'pen',
        text: t('EDIT_INFORMATION'),
        action: 'edit',
        show: showEdit,
        onClick: () => {
          props.rootStore.triggerAction('containerresource.edit', {
            type: 'RESOURCE_DETAIL',
            detail: toJS(store.detail),
            store,
            success: fetchData,
          });
        },
      },
      {
        key: 'viewYaml',
        icon: 'eye',
        text: t('VIEW_YAML'),
        action: 'view',
        onClick: () => {
          props.rootStore.triggerAction('containerresource.yaml.view', {
            yaml: store.yaml,
            store,
            readOnly: true,
          });
        },
      },
      {
        key: 'viewConfig',
        icon: 'eye',
        text: t('kubeconfig'),
        action: 'view',
        onClick: () => {
          props.rootStore.triggerAction('containerresource.config.view', {
            resourceConfig: window.atob(store.resourceConfig),
            store,
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
          props.rootStore.triggerAction('containerresource.remove', {
            type: 'RESOURCE_DETAIL',
            detail: toJS(store.detail.cluster),
            store,
            cluster: props.match.params.cluster,
            success: () => routing.push(listUrl()),
          }),
      },
    ];

    return operations;
  };

  const getAttrs = () => {
    const detail = toJS(store.detail.cluster);
    const detailFlavor = store.machines;
    if (isEmpty(detail)) {
      return;
    }

    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: detail.infra.namespace,
      },
      {
        name: t('Pod CIDRS'),
        value:
          detail.pod_cidrs.length > 0
            ? detail.pod_cidrs &&
              detail.pod_cidrs.map(cidr => {
                return <p key={cidr}>{cidr}</p>;
              })
            : '-',
      },
      {
        name: t('Service CIDRS'),
        value:
          detail.service_cidrs.length > 0
            ? detail.service_cidrs &&
              detail.service_cidrs.map(cidr => {
                return <p key={cidr}>{cidr}</p>;
              })
            : '-',
      },
      {
        name: t('RESOURCES_KUBERNETES_SERVER_IP'),
        value: detail.cp_endpoint?.host,
      },
      {
        name: t('Port'),
        value: detail.cp_endpoint?.port,
      },
      {
        name: t('RESOURCES_IMAGE'),
        value: detail.kube_image,
      },
      {
        name: t('RESOURCES_VERSION'),
        value: detail.kube_version,
      },
      {
        name: t('CNI'),
        value: detail.cni,
      },
      {
        name: t('CSI'),
        value: detail.csi,
      },
      // {
      //    name: t('EKG Stack'),
      //    value: detail.ui,
      // },
      {
        name: t('ELB'),
        value: detail.elb ? detail.elb : '-',
      },
      {
        name: t('Master Flavor'),
        value:
          detailFlavor.length > 0 &&
          detailFlavor
            .filter(obj => obj.name.includes(detail.cp?.name))
            .map((machine, i) => {
              return <p key={i}>{machine?.flavor}</p>;
            }),
      },
      {
        name: t('Worker Flavor'),
        value:
          detailFlavor.length > 0 &&
          detailFlavor
            .filter(
              (obj, idx) => !obj.name.includes(detail.cp?.name) && idx === 1
            )
            .map((machine, i) => {
              return <p key={i}>{machine?.flavor}</p>;
            }),
      },
      // {
      //    name: t('Scalling'),
      //    value: "-",
      // },
      {
        name: t('RESOURCES_NETWORK'),
        value: detail.network.name,
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.description ? detail.description : '-',
      },
      {
        name: t('RESOURCES_CREATE_DAY'),
        value: getLocalTime(detail.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      },
    ];
  };

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />;
  }

  const getBanner = () => {
    return <Icon name="kubernetes" size={40} />;
  };

  const sideProps = {
    icon: getBanner(),
    module: store.module,
    name: get(store.detail.cluster, 'name'),
    desc: get(store.detail.cluster, 'description', ''),
    operations: getOperations(kaasResourceName),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_KAAS_RESOURCE'),
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

export default inject('rootStore')(observer(ResourceDetail));
