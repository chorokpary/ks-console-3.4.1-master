import React, { useEffect, useReducer, useState } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { isEmpty } from 'lodash'
import { Loading } from '@kube-design/components'
import { observer, inject } from 'mobx-react'
import { getLocalTime } from 'utils'

import ContainerImageStore from 'stores/resources/containerimages'
import routes from './routes'

const store = new ContainerImageStore()

const ContainerImageDetail = props => {
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
    const detail = await store.fetchDetail(props.match.params)
    setDetail(detail)
  }

  const { workspace, cluster, namespace } = props.match.params
  const listUrl = `/${workspace}/clusters/${cluster}/projects/${namespace}/containerimages`

  const getOperations = () => [
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
  ]

  const getAttrs = () => {
    // const detail = toJS(store.detail)

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
        name: t('RESOURCES_KUBERNETES_VERSION'),
        value: detail.image.kube_version,
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
        name: t('RESOURCES_REGIST_DATE'),
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
        {...sideProps}
      />
    </>
  )
}

export default inject('rootStore')(observer(ContainerImageDetail))
