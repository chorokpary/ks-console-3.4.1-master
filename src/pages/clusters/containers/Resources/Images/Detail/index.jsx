import React, { useEffect, useReducer, useState } from 'react'
import { toJS } from 'mobx'
import { isEmpty } from 'lodash'
import { Loading } from '@kube-design/components'
import { observer, inject } from 'mobx-react'
import { getIndexRoute } from 'utils/router.config'
import ImageStore from 'stores/resources/images'
import DetailPage from 'clusters/containers/Base/Detail'
import { getLocalTime } from 'utils'

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

const store = new ImageStore()

const ImageDetail = props => {
  const [activationTrigger, setActivationTrigger] = useReducer(
    activationTrigger => !activationTrigger,
    false
  )
  const [detail, setDetail] = useState()

  useEffect(() => {
    fetchData()
  }, [])

  let timer = 0
  const activeCrListTimer = () => {
    timer = setTimeout(() => {
      fetchData()
      setActivationTrigger()
    }, 4000)
  }

  useEffect(() => {
    activeCrListTimer()
    return () => {
      clearTimeout(timer)
    }
  }, [activationTrigger])

  const fetchData = async () => {
    const detailInfo = await store.fetchDetail(props.match.params)
    setDetail(detailInfo)
  }

  const { cluster } = props.match.params
  const listUrl = `/clusters/${cluster}/images`

  const { routing } = props.rootStore

  const PATH = `${listUrl}/${props.match.params.name}`

  const showEdit = !globals.config.presetClusterRoles.includes(
    props.match.params.name
  )

  const getOperations = () => [
    {
      key: 'edit',
      icon: 'pen',
      text: t('EDIT_INFORMATION'),
      action: 'edit',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('images.edit', {
          type: 'IMAGE_DETAIL',
          detail: toJS(store.detail.image),
          store,
          success: fetchData,
        }),
    },
    {
      key: 'viewYaml',
      icon: 'eye',
      text: t('VIEW_YAML'),
      action: 'view',
      onClick: () =>
        props.rootStore.triggerAction('images.yaml.view', {
          yaml: store.yaml,
          readOnly: true,
        }),
    },
    {
      key: 'delete',
      icon: 'trash',
      text: t('DELETE'),
      action: 'delete',
      type: 'danger',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('images.remove', {
          type: 'IMAGE_DETAIL',
          detail: toJS(store.detail),
          store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl),
          okText: t('RESOURCES_DELETE'),
          cancelText: t('RESOURCES_CANCEL'),
        }),
    },
  ]

  const getAttrs = () => {
    // const detail = toJS(store.detail);

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
        value: t(`RESOURCES_BOOT_TYPE_${detail.image.boot_type.toUpperCase()}`),
      },
      {
        name: t('RESOURCES_ACCELERATOR_TYPE'),
        value: detail.image.accelerator_type,
      },
      {
        name: t('RESOURCES_PRE_INSTALLED_APP'),
        value: detail.image.pre_installed_app,
      },
      {
        name: t('RESOURCES_REAL_TIME'),
        value: detail.image.is_realtime
          ? t('RESOURCES_USE')
          : t('RESOURCES_NOT_USE'),
      },
      {
        name: t('RESOURCES_STEP'),
        value: t(`RESOURCES_IMAGE_${detail.image.phase.toUpperCase()}`),
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
        name: t('RESOURCES_CREATE_DAY'),
        value: getLocalTime(detail.image.timestamp).format(
          'YYYY-MM-DD HH:mm:ss'
        ),
      },
    ]
  }

  if (store.isLoading && !store.detail.name) {
    return <Loading className="ks-page-loading" />
  }

  const sideProps = {
    icon: 'snapshot',
    module: store.module,
    name: detail?.image.name,
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_VM_IMAGE'),
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
            name: props.match.params.name,
            namespace : props.match.params.namespace,
          },
          getIndexRoute({ path: `${PATH}`, to: `${PATH}/status`, exact: true }),
        ]}
        {...sideProps}
      />
    </>
  )
}

export default inject('rootStore')(observer(ImageDetail))

const Status = ({ route }) => {
  const imageName = route.name
  const namespace = route.namespace

  return (
    <DetailVmList
      type={t('RESOURCES_VM_IMAGE')}
      match="image"
      name={imageName}
      project={namespace}
    />
  )
}
