
import React, { useEffect, useState } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import FloatingIpStore from 'stores/resources/floatingip'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'
import * as common from 'utils/resources'
import routes from './routes'

const store = new FloatingIpStore();

const FloatingIpDetail = (props) => {

  const [fipConnected, setFipConnected] = useState(false);
  const [detail, setDetail] = useState();

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async () => {
    await store.fetchDetail(props.match.params);
    const detail = toJS(store.detail)
    setDetail(detail.floating_ip)

    if (detail.floating_ip?.target_ip) {
      setFipConnected(true)
    } else {
      setFipConnected(false)
    }
  }

  const { workspace, cluster, namespace } = props.match.params
  const listUrl = `/${workspace}/clusters/${cluster}/projects/${namespace}/floatingip`
  const routing = props.rootStore.routing;

  const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

  const getOperations = () => {
    return (fipConnected ?
      [
        {
          key: 'edit1',
          icon: 'image',
          text: t('RESOURCES_DEALLOCATE_FLOATING_IP'),
          action: 'view',
          onClick: () =>
            props.rootStore.triggerAction('floatingIp.deallocate', {
              store: store,
              data: { id: detail.id },
              type: "LB_POP",
              success: () => handleConnectSuccess(false),
            }),
        }
      ]
      :
      [
        {
          key: 'edit1',
          icon: 'image',
          text: t('RESOURCES_CONNECTION_VM'),
          action: 'view',
          onClick: () =>
            props.rootStore.triggerAction('floatingIp.vmPop', {
              store: store,
              type: "VM_POP",
              success: () => handleConnectSuccess(true),
              ...props
            }),
        },
        {
          key: 'edit2',
          icon: 'image',
          text: t('RESOURCES_CONNECTION_LB'),
          action: 'view',
          onClick: () =>
            props.rootStore.triggerAction('floatingIp.lbPop', {
              store: store,
              type: "LB_POP",
              success: () => handleConnectSuccess(true),
              ...props
            }),
        },
      ]
    )
  }

  const getAttrs = () => {
    const detail = toJS(store.detail)

    if (isEmpty(detail)) {
      return
    }

    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: get(store.detail, 'cluster'),
      },
      {
        name: t('RESOURCES_FLOATING_IP'),
        value: get(store.detail.floating_ip, 'floating_ip'),
      },
      {
        name: t('RESOURCES_STATIC_IP'),
        value: get(store.detail.floating_ip, 'target_ip'),
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    icon: "apps",
    module: store.module,
    name: get(store.detail, 'name'),
    // desc: get(store.detail.flavor, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_FLOATING_IP'),
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

export default inject('rootStore')(observer(FloatingIpDetail));

