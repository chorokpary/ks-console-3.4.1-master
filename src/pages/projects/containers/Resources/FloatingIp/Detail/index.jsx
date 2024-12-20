import React, { useEffect, useState } from 'react';
import DetailPage from 'clusters/containers/Base/Detail';
import FloatingIpStore from 'stores/resources/floatingip';
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx';
import { get, isEmpty } from 'lodash';
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { getIndexRoute } from 'utils/router.config';

import DetailVmList from 'pages/projects/containers/Resources/components/DetailVmList';
import LbPanel from './LbPanel';

const store = new FloatingIpStore();

const FloatingIpDetail = props => {
  const [fipConnected, setFipConnected] = useState(false);
  const [detail, setDetail] = useState();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await store.fetchDetail(props.match.params);
    const storeDetail = toJS(store.detail);
    setDetail(storeDetail.floating_ip);

    if (storeDetail.floating_ip?.target_ip) {
      setFipConnected(true);
    } else {
      setFipConnected(false);
    }
  };

  const { workspace, cluster, namespace } = props.match.params;
  const listUrl = `/${workspace}/clusters/${cluster}/projects/${namespace}/floatingip`;
  const routing = props.rootStore.routing;

  const PATH = `${listUrl}/${props.match.params.id}`;

  // const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

  const getOperations = () => {
    return fipConnected
      ? [
          {
            key: 'edit1',
            icon: 'image',
            text: t('RESOURCES_DEALLOCATE_FLOATING_IP'),
            action: 'view',
            onClick: () =>
              props.rootStore.triggerAction('floatingIp.deallocate', {
                ...props.match.params,
                store,
                data: { id: detail.id },
                type: 'LB_POP',
                success: () => handleConnectSuccess(false),
              }),
          },
        ]
      : [
        {
          key: 'delete',
          icon: 'trash',
          text: t('RESOURCES_DELETE'),
          action: 'delete',
          type: 'danger',
          onClick: () =>
            props.rootStore.triggerAction('floatingIp.remove', {
              type: 'FLOATINGIP_DETAIL',
              detail,
              store,
              cluster: props.match.params.cluster,
              success: () => routing.push(listUrl),
              okText: t('RESOURCES_DELETE'),
              cancelText: t('RESOURCES_CANCEL'),
              ...props.match.params,
            }),
        },
          {
            key: 'edit1',
            icon: 'image',
            text: t('RESOURCES_CONNECTION_VM'),
            action: 'view',
            onClick: () =>
              props.rootStore.triggerAction('floatingIp.vmPop', {
                ...props.match.params,
                store,
                type: 'VM_POP',
                success: () => handleConnectSuccess(true),
              }),
          },
          {
            key: 'edit2',
            icon: 'image',
            text: t('RESOURCES_CONNECTION_LB'),
            action: 'view',
            onClick: () =>
              props.rootStore.triggerAction('floatingIp.lbPop', {
                ...props.match.params,
                store,
                type: 'LB_POP',
                success: () => handleConnectSuccess(true),
              }),
          },
        ];
  };

  const handleConnectSuccess = bool => {
    setFipConnected(bool);
    fetchData();
  };

  const getAttrs = () => {
    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: get(store.detail, 'cluster'),
      },
      {
        name: t('RESOURCES_NETWORK_NAME'),
        value: detail?.network_alias,
      },
      {
        name: t('RESOURCES_STATIC_IP'),
        value: detail?.target_ip,
      },
    ];
  };

  if (store.isLoading && !store.detail.name) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    icon: 'intranet-routers',
    module: store.module,
    name: detail?.floating_ip,
    desc: get(store.detail.flavor, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_FLOATING_IP'),
        url: listUrl,
      },
    ],
  };
  const Status = () => {
    const detailFip = get(store.detail, 'floating_ip');
    if (detailFip.instance_type === 'vm') {
      return (
        <DetailVmList
          type={t('RESOURCES_FLOATING_IP')}
          variables="id"
          {...props.match.params}
          id={detailFip.instance_id}
        />
      );
    }
    if (detailFip.instance_type === 'lb') {
      return (
        <LbPanel
          type={t('RESOURCES_FLOATING_IP')}
          variables="id"
          {...props.match.params}
          id={detailFip.instance_id}
        />
      );
    }
    return [];
  };

  return (
    <>
      <DetailPage
        stores={{ detailStore: store }}
        routes={[
          {
            path: `${PATH}/status`,
            title: t('RESOURCES_STATE'),
            component: Status,
            exact: true,
          },
          getIndexRoute({ path: `${PATH}`, to: `${PATH}/status`, exact: true }),
        ]}
        {...sideProps}
      />
    </>
  );
};

export default inject('rootStore')(observer(FloatingIpDetail));
