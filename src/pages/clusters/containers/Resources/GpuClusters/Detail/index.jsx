
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

import GpuClustersStore from 'stores/resources/gpuclusters'

const store = new GpuClustersStore();

const GpuClustersDetail = (props) => {

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  }

  const { cluster } = props.match.params
  const listUrl = `/clusters/${cluster}/gpuclusters`

  const routing = props.rootStore.routing;
  const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

  const getOperations = () => [
    // {
    //   key: 'edit',
    //   icon: 'pen',
    //   text: t('EDIT_INFORMATION'),
    //   action: 'edit',
    //   show: showEdit,
    //   onClick: () =>
    //     props.rootStore.triggerAction('gpuclusters.edit', {
    //       type: 'KEYPAIR_DETAIL',
    //       detail: toJS(store.detail),
    //       store: store,
    //       success: fetchData,
    //       ...props.match.params
    //     }),
    // },
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
    // {
    //   key: 'delete',
    //   icon: 'trash',
    //   text: t('DELETE'),
    //   action: 'delete',
    //   type: 'danger',
    //   show: showEdit,
    //   onClick: () =>
    //     props.rootStore.triggerAction('gpuclusters.remove', {
    //       type: 'GPUCLUSTERS_DETAIL',
    //       detail: toJS(store.detail),
    //       store: store,
    //       cluster: props.match.params.cluster,
    //       success: () => routing.push(listUrl),
    //     }),
    // },
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
        value: (detail.data.nodes).filter(item => item.vmi).length + "/" + (detail.data.nodes).length,
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />;
  }

  const getBanner = () => {
    return <i className="ico-type-mediatedvgpu"></i>
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
        {...sideProps} />
    </>
  )
}

export default inject('rootStore')(observer(GpuClustersDetail));

