
import React, { useEffect, useState } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import ImageStore from 'stores/resources/images'
import { getIndexRoute } from 'utils/router.config'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

const store = new ImageStore();

const ImageDetail = (props) => {

  const [refreshTimer, setRefreshTimer] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      fetchData();
      setRefreshTimer(refreshTimer + 1);
    }, 4000);
  }, [refreshTimer])

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  }

  const { cluster } = props.match.params
  const listUrl = `/clusters/${cluster}/images`

  const { routing } = props.rootStore;

  const PATH = `${listUrl}/${props.match.params.name}`

  const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

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
          store: store,
          success: fetchData,
        })
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
        })
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
          store: store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl),
          okText: '삭제',
          cancelText: '취소'
        })
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
        name: t('RESOURCES_REAL_TIME'),
        value: detail.image.is_realtime ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE'),
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
        name: t('RESOURCES_CREATE_DAY'),
        value: getLocalTime(detail.image.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  if (store.isLoading && !store.detail.name) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    icon: "snapshot",
    module: store.module,
    name: get(store.detail, 'name'),
    desc: get(store.detail.image, 'description', ''),
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
            name: props.match.params.name
          },
          getIndexRoute({ path: `${PATH}`, to: `${PATH}/status`, exact: true }),
        ]}
        {...sideProps} />
    </>
  )
}

export default inject('rootStore')(observer(ImageDetail));

const Status = ({ route }) => {
  const imageName = route.name

  return (
    <DetailVmList type={t('RESOURCES_VM_IMAGE')} variables='image' name={imageName} />
  )
}