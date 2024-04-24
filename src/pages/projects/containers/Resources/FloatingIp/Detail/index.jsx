
import React, { useEffect, useState } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import FloatingIpStore from 'stores/resources/floatingip'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { getIndexRoute } from 'utils/router.config'

import DetailVmList from 'pages/projects/containers/Resources/components/DetailVmList'
import LbPanel from './LbPanel'

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

  const PATH = `${listUrl}/${props.match.params.id}`

  // const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

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
              ...props.match.params,
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
              ...props.match.params,
              store: store,
              type: "VM_POP",
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
              store: store,
              type: "LB_POP",
              success: () => handleConnectSuccess(true),
            }),
        },
      ]
    )
  }

  const handleConnectSuccess = (bool) => {
    setFipConnected(bool)
    fetchData()
  }


  const getAttrs = () => {
    // const detail = toJS(store.detail)

    // if (isEmpty(detail)) {
    //   return
    // }

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
    ]
  }

  if (store.isLoading && !store.detail.name) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    icon: "intranet-routers",
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
  }

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
        {...sideProps} />
    </>
  )
}

export default inject('rootStore')(observer(FloatingIpDetail));

const Status = (props) => {
  const detail = get(store.detail, 'floating_ip')
  if (detail.instance_type == 'vm') {
    return <DetailVmList type={t('RESOURCES_FLOATING_IP')} variables='id'{...props.match.params} id={detail.instance_id} />

  } else if (detail.instance_type == 'lb') {
    return <LbPanel type={t('RESOURCES_FLOATING_IP')} variables='id' {...props.match.params} id={detail.instance_id} />
  } else {
    return []
  }
}