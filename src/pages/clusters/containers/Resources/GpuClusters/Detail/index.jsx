import React, { useEffect, useState } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { useParams } from 'react-router-dom'
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components'
import { observer, inject } from 'mobx-react'
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

import * as common from 'utils/resources'
import routes from './routes'

import VmStore from 'stores/resources/vms'
import GpuClustersStore from 'stores/resources/gpuclusters'

const vmStore = new VmStore()
const store = new GpuClustersStore()

const GpuClustersDetail = props => {

  const [ networkCidr, setNetworkCidr ] = useState('')

  useEffect(() => {
    fetchData()
    getNetworkList()
  }, [])

  const fetchData = () => {
    store.fetchDetail(props.match.params)
  }

  const getNetworkList = async () => {
    const listNetwork = await vmStore.fetchVmListNetwork(props.match.params)
    const networks = listNetwork.networks
    const cidr = networks.filter(item => item.name === store.detail.data?.spec?.sonaNetwork)[0].cidr

    setNetworkCidr(cidr)
  }  

  const { cluster } = props.match.params
  const listUrl = `/clusters/${cluster}/gpuclusters`

  const routing = props.rootStore.routing
  const showEdit = !globals.config.presetClusterRoles.includes(
    props.match.params.name
  )

  const getOperations = () => [
    {
      key: 'edit',
      icon: 'pen',
      text: t('RESOURCES_VM_EDIT'),
      action: 'edit',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('gpuclusters.vmedit', {
          detail: toJS(store.detail),
          store: store,
          namespace: store.detail.data.namespace,
          success: fetchData,
          ...props.match.params,
        }),
    },
    // {
    //   key: 'viewYaml',
    //   icon: 'eye',
    //   text: t('VIEW_YAML'),
    //   action: 'view',
    //   onClick: () => {
    //     props.rootStore.triggerAction('gpuclusters.yaml.view', {
    //       yaml: store.yaml,
    //       readOnly: true,
    //     })
    //   },
    // },
    {
      key: 'delete',
      icon: 'trash',
      text: t('DELETE'),
      action: 'delete',
      type: 'danger',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('gpuclusters.remove', {
          type: 'GPUCLUSTERS_DETAIL',
          detail: { ...toJS(store.detail.data), cluster },
          namespace: store.detail.data.namespace,
          store: store,
          success: () => {
            setTimeout(() => {
              routing.push(listUrl)
            }, 200)
          },
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
        name: t('RESOURCES_GPU_CLUSTER'),
        value: detail.name,
      },
      {
        name: t('RESOURCES_PROJECT'),
        value: detail.data.namespace,
      },
      {
        name: t('RESOURCES_GPU_CLUSTER_VM_COUNT'),
        // value: (detail.data.nodes).filter(item => item.vmi).length + "/" + (detail.data.nodes).length,
        value: detail.data?.instances ? detail.data.instances.length : '-',
      },
      {
        name: t('RESOURCES_GPU_CLUSTER_FABRICKEY'),
        value: detail.data?.spec?.fabricKey,
      },
      {
        name: t('RESOURCES_GPU_CLUSTER_FABRICTYPE'),
        value: detail.data?.spec?.fabricType,
      },
      {
        name: t('RESOURCES_GPU_CLUSTER_SONANETWORK'),
        value: detail.data?.spec?.sonaNetwork,
      },
      {
        name: t('RESOURCES_CIDR'),
        value: networkCidr,
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />
  }

  const getBanner = () => {
    return <i className="ico-type-gpucluster"></i>
  }

  const sideProps = {
    icon: getBanner(),
    module: store.module,
    name: get(store.detail, 'name'),
    desc: get(store.detail, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_GPU_CLUSTER'),
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

export default inject('rootStore')(observer(GpuClustersDetail))
