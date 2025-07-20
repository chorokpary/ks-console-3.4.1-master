import React, { useEffect } from 'react'

import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Icon, Loading } from '@kube-design/components'
import { inject, observer } from 'mobx-react'
import DetailPage from 'clusters/containers/Base/Detail'
import { getLocalTime } from 'utils'

import NodePoolResourceStore from 'stores/resources/nodepools'
import routes from './routes'

const nodepoolStore = new NodePoolResourceStore()

const ResourceDetail = props => {
  useEffect(() => {
    nodepoolStore.fetchData = fetchData()
  }, [])

  const fetchData = async () => {
    await nodepoolStore.fetchNodePoolDetail(props.match.params)
  }

  const listUrl = () => {
    const { cluster, namespace, clustername } = props.match.params
    return `/clusters/${cluster}/projects/${namespace}/containerResource/${clustername}`
  }

  const routing = props.rootStore.routing
  const showEdit = !globals.config.presetClusterRoles.includes(
    props.match.params.name
  )
  const getOperations = () => {
    return [
      {
        key: 'edit',
        icon: 'pen',
        text: t('EDIT_INFORMATION'),
        action: 'edit',
        show: showEdit,
        onClick: () => {
          props.rootStore.triggerAction('nodepool.edit', {
            type: 'RESOURCE_DETAIL',
            detail: toJS(nodepoolStore.nodepool),
            store: nodepoolStore,
            success: () => {
              fetchData()
              window.location.reload()
            },
            ...props.match.params,
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
          props.rootStore.triggerAction('nodepool.remove', {
            type: 'RESOURCE_DETAIL',
            detail: toJS(nodepoolStore.nodepool),
            store: nodepoolStore,
            success: () => routing.push(listUrl()),
            ...props.match.params,
          }),
      },
    ]
  }

  const getAttrs = () => {
    const nodepool = toJS(nodepoolStore.nodepool)
    if (isEmpty(nodepool)) {
      return
    }

    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: props.match.params.clustername,
      },
      {
        name: t('PROJECT'),
        value: props.match.params.namespace,
      },
      {
        name: t('RESOURCES_NODEPOOL_NAME'),
        value: nodepool.name,
      },
      {
        name: t('RESOURCES_IMAGE'),
        value: nodepool.kube_image,
      },
      {
        name: t('RESOURCES_FLAVOR'),
        value: nodepool.flavor,
      },
      {
        name: t('RESOURCES_NODE_COUNT'),
        value: nodepool.nodepool_replicas,
      },
      {
        name: t('RESOURCES_AUTO_SCALING'),
        value: nodepool.autoscale ? 'True' : 'False',
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: nodepool.description ? nodepool.description : '-',
      },
      {
        name: t('RESOURCES_CREATE_DAY'),
        value: getLocalTime(nodepool.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  if (nodepoolStore.isLoading) {
    return <Loading className="ks-page-loading" />
  }

  const getBanner = () => {
    return <Icon name="nodes" size={40} />
  }

  const sideProps = {
    icon: getBanner(),
    module: nodepoolStore.module,
    name: get(nodepoolStore.nodepool, 'name'),
    // desc: get(nodepoolStore.detail.cluster, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('CLUSTER_STATUS'),
        url: listUrl,
      },
    ],
  }

  return (
    <>
      <DetailPage
        stores={{ detailStore: nodepoolStore }}
        routes={routes}
        {...sideProps}
      />
    </>
  )
}

export default inject('rootStore')(observer(ResourceDetail))
