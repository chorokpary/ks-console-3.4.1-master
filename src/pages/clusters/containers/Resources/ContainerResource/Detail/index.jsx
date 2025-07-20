import React, { useEffect } from 'react'

import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Icon, Loading } from '@kube-design/components'
import { inject, observer } from 'mobx-react'
import DetailPage from 'clusters/containers/Base/Detail'
import { getLocalTime } from 'utils'

import ResourceStore from 'stores/resources/containerresource'
import routes from './routes'

const store = new ResourceStore()

const ResourceDetail = props => {
  useEffect(() => {
    store.fetchData = fetchData()
  }, [])

  const fetchData = async () => {
    await store.fetchDetail(props.match.params)
  }

  const listUrl = () => {
    const { cluster } = props.match.params
    return `/clusters/${cluster}/containerResource`
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
          props.rootStore.triggerAction('containerresource.edit', {
            type: 'RESOURCE_DETAIL',
            detail: toJS(store.detail),
            store,
            success: fetchData,
          })
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
          })
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
          props.rootStore.triggerAction('containerresource.remove', {
            type: 'RESOURCE_DETAIL',
            detail: toJS(store.detail.cluster),
            store,
            cluster: props.match.params.cluster,
            success: () => routing.push(listUrl()),
          }),
      },
    ]
  }

  const getAttrs = () => {
    const detail = toJS(store.detail.cluster)
    if (isEmpty(detail)) {
      return
    }

    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: detail.infra.namespace,
      },
      {
        name: t('PROJECT'),
        value: props.match.params.namespace,
      },
      {
        name: t('PODS_CIDR'),
        value:
          detail.pod_cidrs.length > 0
            ? detail.pod_cidrs &&
              detail.pod_cidrs.map(cidr => {
                return <p key={cidr}>{cidr}</p>
              })
            : '-',
      },
      {
        name: t('SERVICE_CIDR'),
        value:
          detail.service_cidrs.length > 0
            ? detail.service_cidrs &&
              detail.service_cidrs.map(cidr => {
                return <p key={cidr}>{cidr}</p>
              })
            : '-',
      },
      {
        name: t('RESOURCES_KUBERNETES_SERVER_IP'),
        value: detail.cp_endpoint?.host,
      },
      {
        name: t('RESOURCES_KUBERNETES_SERVER_PORT'),
        value: detail.cp_endpoint?.port,
      },
      {
        name: t('RESOURCES_MASTER_IMAGE'),
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
        name: t('RESOURCES_SECURE_BOOT'),
        value:
          detail.secure_boot === true ? t('USER_ACTIVE') : t('USER_DISABLED'),
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
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />
  }

  const getBanner = () => {
    return <Icon name="kubernetes" size={40} />
  }

  const sideProps = {
    icon: getBanner(),
    module: store.module,
    name: get(store.detail.cluster, 'name'),
    // desc: get(store.detail.cluster, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_KAAS_RESOURCE'),
        url: listUrl,
      },
    ],
  }

  return (
    <>
      <DetailPage
        stores={{ detailStore: store }}
        routes={routes}
        {...sideProps}
      />
    </>
  )
}

export default inject('rootStore')(observer(ResourceDetail))
