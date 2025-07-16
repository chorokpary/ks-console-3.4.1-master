import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import SecurityGroupStore from 'stores/resources/securityGroups'
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components'
import { observer, inject } from 'mobx-react'
import { getLocalTime } from 'utils'
import routes from './routes'

const store = new SecurityGroupStore()

const SecurityGroupDetail = props => {
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    store.fetchDetail(props.match.params)
  }
  const listUrl = () => {
    const { cluster } = props.match.params
    return `/clusters/${cluster}/securityGroups`
  }
  const routing = props.rootStore.routing

  const showEdit = !globals.config.presetClusterRoles.includes(
    props.match.params.name
  )

  const getDefaultSCOperations = () => [
    {
      key: 'viewYaml',
      icon: 'eye',
      text: t('VIEW_YAML'),
      action: 'view',
      onClick: () =>
        props.rootStore.triggerAction('securityGroup.yaml.view', {
          yaml: store.yaml,
          readOnly: true,
        }),
    },
  ]

  const getOperations = () => [
    {
      key: 'edit',
      icon: 'pen',
      text: t('EDIT_INFORMATION'),
      action: 'edit',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('securityGroup.edit', {
          type: 'SECURITYGROUP_DETAIL',
          detail: toJS(store.detail),
          store,
          success: fetchData,
          ...props.match.params,
        }),
    },
    {
      key: 'viewYaml',
      icon: 'eye',
      text: t('VIEW_YAML'),
      action: 'view',
      onClick: () =>
        props.rootStore.triggerAction('securityGroup.yaml.view', {
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
        props.rootStore.triggerAction('securityGroup.remove', {
          type: 'SECURITYGROUP_DETAIL',
          detail: toJS(store.detail),
          store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl()),
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
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.security_group.description,
      },
      {
        name: t('RESOURCES_REGIST_DATE'),
        value: getLocalTime(detail.security_group.timestamp).format(
          'YYYY-MM-DD HH:mm:ss'
        ),
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />
  }

  const sideProps = {
    icon: 'shield',
    module: store.module,
    name: get(store.detail, 'name'),
    operations:
      get(store.detail, 'id') === 'c5071a6b-d606-4fde-86c1-6bcc3160bb28' ||
      get(store.detail, 'id') === 'eb99fdd0-560f-4f85-b3a4-3780a22f3a00'
        ? getDefaultSCOperations()
        : getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_SECURITY_GROUP'),
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

export default inject('rootStore')(observer(SecurityGroupDetail))
