
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

import ContainerImageStore from 'stores/resources/containerimages'

const store = new ContainerImageStore();

const ContainerImageDetail = (props) => {

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  }

  const { cluster } = props.match.params
  const listUrl = `/clusters/${cluster}/containerimages`

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
        props.rootStore.triggerAction('containerimage.edit', {
          type: 'KEYPAIR_DETAIL',
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
        props.rootStore.triggerAction('containerimage.yaml.view', {
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
        props.rootStore.triggerAction('containerimage.remove', {
          type: 'KEYPAIR_DETAIL',
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
        name: t('RESOURCES_CPU_TYPE'),
        value: detail.image.arch_type,
      },
      {
        name: t('RESOURCES_BOOT_TYPE'),
        value: detail.image.boot_type,
      },
      {
        name: t('RESOURCES_KUBERNETES_VERSION'),
        value: detail.image.kube_version,
      },
      {
        name: t('RESOURCES_STEP'),
        value: detail.image.phase,
      },
      {
        name: t('RESOURCES_PROGRESS'),
        value: detail.image.progress,
      },
      {
        name: t('RESOURCES_SOURCE'),
        value: detail.image.source,
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.image.description,
      },
      {
        name: t('RESOURCES_REGIST_DATE'),
        value: getLocalTime(detail.image.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    module: store.module,
    name: get(store.detail, 'name'),
    desc: get(store.detail.flavor, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_KAAS_IMAGE'),
        url: listUrl,
      },
    ],
  }

  return (
    <>
      <DetailPage
        stores={{ detailStore: store }}
        routes={routes}
        icon={'snapshot'}
        {...sideProps} />
    </>
  )
}

export default inject('rootStore')(observer(ContainerImageDetail));

