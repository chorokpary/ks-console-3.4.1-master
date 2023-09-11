
import React, { useEffect, useState } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'
import LbPanel from './LbPanel'
import FloatingIpStore from 'stores/resources/floatingip';

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

  const { cluster } = props.match.params
  const listUrl = `/clusters/${cluster}/floatingip`

  const { routing } = props.rootStore;

  const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

  const getOperations = () => {
    return (fipConnected ?
      [
        {
          key: 'edit1',
          icon: 'image',
          text: t('플로팅 IP 해제'),
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
          key: 'delete',
          icon: 'trash',
          text: t('삭제'),
          action: 'delete',
          type: 'danger',
          show: showEdit,
          onClick: () =>
            props.rootStore.triggerAction('floatingIp.delete', {
              type: 'FLOATINGIP_DETAIL',
              detail: detail,
              store: store,
              cluster: props.match.params.cluster,
              success: () => routing.push(listUrl),
              okText: '삭제',
              cancelText: '취소',
              ...props
            })
        },
        {
          key: 'edit1',
          icon: 'image',
          text: t('VM 연결'),
          action: 'view',
          onClick: () =>
            props.rootStore.triggerAction('floatingIp.vmPop', {
              store: store,
              type: "VM_POP",
              success: () => handleConnectSuccess(true),
            }),
        },
        {
          key: 'edit2',
          icon: 'image',
          text: t('LB 연결'),
          action: 'view',
          onClick: () =>
            props.rootStore.triggerAction('floatingIp.lbPop', {
              store: store,
              type: "LB_POP",
              success: () => handleConnectSuccess(true),
            }),
        },
      ]
    )
  }
  // const getOperations = () => [
  //     {
  //         key: 'edit',
  //         icon: 'pen',
  //         text: t('EDIT_INFORMATION'),
  //         action: 'edit',
  //         show: false,
  //         onClick: () =>
  //             props.rootStore.triggerAction('floatingIp.edit', {
  //                 type: 'FLOATINGIP_DETAIL',
  //                 detail: toJS(store.detail.floating_ip),
  //                 store: store,
  //                 success: fetchData,
  //             })
  //     },
  //     {
  //         key: 'edit1',
  //         icon: 'image',
  //         text: t('VM 연결'),
  //         action: 'view',
  //         onClick: () =>
  //             props.rootStore.triggerAction('floatingIp.vmPop', {
  //                 store: store,
  //                 type: "LB_POP",
  //                 success: fetchData,
  //             }),
  //     },
  //     {
  //         key: 'edit2',
  //         icon: 'image',
  //         text: t('LB 연결'),
  //         action: 'view',
  //         onClick: () =>
  //             props.rootStore.triggerAction('floatingIp.lbPop', {
  //                 store: store,
  //                 type: "LB_POP",
  //                 success: fetchData,
  //             }),
  //     },
  //     {
  //         key: 'delete',
  //         icon: 'trash',
  //         text: t('삭제'),
  //         action: 'delete',
  //         type: 'danger',
  //         show: showEdit,
  //         onClick: () =>
  //             props.rootStore.triggerAction('floatingIp.delete', {
  //                 type: 'FLOATINGIP_DETAIL',
  //                 detail: toJS(store.detail),
  //                 store: store,
  //                 cluster: props.match.params.cluster,
  //                 success: () => routing.push(listUrl),
  //                 okText: '삭제',
  //                 cancelText: '취소',
  //                 ...props
  //             })
  //     },
  // ]

  const handleConnectSuccess = (bool) => {
    setFipConnected(bool)
    fetchData()
  }

  const getAttrs = () => {
    // const detail = toJS(store.detail)

    // if (isEmpty(detail)) {
    //     return
    // }
    return [
      {
        name: t('클러스터'),
        value: get(store.detail, 'cluster'),
      },
      {
        name: t('플로팅 IP'),
        value: detail?.floating_ip,
      },
      {
        name: t('고정 IP'),
        value: detail?.target_ip,
      },
    ]
  }

  if (store.isLoading && !store.detail.name) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    module: store.module,
    name: detail?.network,
    // desc: get(store.detail.network, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('플로팅 IP'),
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
            path: '',
            title: '상태',
            component: Status,
            exact: true,
          }
        ]}
        {...sideProps} />
    </>
  )
}

export default inject('rootStore')(observer(FloatingIpDetail));

const Status = (props) => {
  const detail = get(store.detail, 'floating_ip')
  if (detail.instance_type == 'vm') {
    return <DetailVmList type='플로팅 IP' variables='name' name={detail.instance_name} />

  } else if (detail.instance_type == 'lb') {
    return <LbPanel type='플로팅 IP' variables='name' name={detail.instance_name} />
  } else {
    return []
  }
}