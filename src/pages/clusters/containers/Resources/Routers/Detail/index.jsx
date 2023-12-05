
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

import * as common from 'utils/resources'
import routes from './routes'

import RouterStore from 'stores/resources/routers'

const store = new RouterStore();

const RouterDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    
    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/routers`

    const routing = props.rootStore.routing;
    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

    const getOperations = () => [
      {
        key: 'edit',
        icon: 'pen',
        text: t('EDIT_INFORMATION'),
        action: 'edit',
        show: showEdit,
        onClick: () =>
            props.rootStore.triggerAction('router.edit', {
            type: 'ROUTER_DETAIL',
            detail: toJS(store.detail),
            store: store,
            success: fetchData,
          }),
      },
      {
        key: 'viewYaml',
        icon: 'eye',
        text: t('VIEW_YAML'),
        action: 'view',
        onClick: () => {
            props.rootStore.triggerAction('router.yaml.view', {
            yaml: store.yaml,
            readOnly: true,
          })
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
            props.rootStore.triggerAction('router.remove', {
            type: 'ROUTER_DETAIL',
            detail: toJS(store.detail),
            store: store,
            cluster: props.match.params.cluster,
            success: () => routing.push(listUrl),
          }),
      },
    ]

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
          name: t('RESOURCES_SNAT_OPTION'),
          value: detail.router.enable_snat ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE'),
        },
        {
          name: t('RESOURCES_VROUTER_IP'),
          value: detail.router.vrouter_ip,
        },
        {
          name: t('RESOURCES_INTERNAL_NETWORK'),
            value: detail.router.internal.length >= 1 ? detail.router.internal.length == 1 ? detail.router.internal[0] : detail.router.internal[0] + ' ' + t('RESOURCES_BESIDES') + ' ' + (detail.router.internal.length - 1) + t('RESOURCES_COUNT') : "-",
        },
        {
          name: t('RESOURCES_EXTERNAL_NETWORK'),
          value: detail.router.external,
        },
        {
          name: t('RESOURCES_DESCRIPTION'),
          value: detail.router.description,
        },
        {
          name: t('RESOURCES_REGIST_DATE'),
          value: getLocalTime(detail.router.timestamp).format('YYYY-MM-DD HH:mm:ss'),
        },
      ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        icon: "router",
        module: store.module,
        name: get(store.detail, 'name'),
        desc: get(store.detail.flavor, 'description', ''),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('RESOURCES_VROUTER'),
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

export default inject('rootStore')(observer(RouterDetail));

