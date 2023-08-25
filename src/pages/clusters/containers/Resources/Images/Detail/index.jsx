
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'
import ImageStore from 'stores/resources/images'
import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

const store = new ImageStore();

const ImageDetail = (props) => {

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  }
  const listUrl = () => {
    const { cluster } = props.match.params
    return `/clusters/${cluster}/images`
  }
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
        props.rootStore.triggerAction('resource.baseinfo.edit', {
          type: 'IMAGE_DETAIL',
          detail: toJS(store.detail),
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
        props.rootStore.triggerAction('images.delete', {
          type: 'IMAGE_DETAIL',
          detail: toJS(store.detail),
          store: store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl),
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
        name: t('클러스터'),
        value: detail.cluster,
      },
      {
        name: t('CPU 타입'),
        value: detail.image.arch_type,
      },
      {
        name: t('부트 타입'),
        value: detail.image.boot_type,
      },
      {
        name: t('리얼타임'),
        value: detail.is_realtime ? '사용' : '미사용',
      },
      {
        name: t('단계'),
        value: detail.image.phase,
      },
      {
        name: t('진행률'),
        value: detail.image.progress,
      },
      {
        name: t('공개여부'),
        value: detail.image.description,
      },
      {
        name: t('소스'),
        value: detail.image.source,
      },
      {
        name: t('설명'),
        value: detail.image.description,
      },
      {
        name: t('생성일'),
        value: getLocalTime(detail.image.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  if (store.isLoading && !store.detail.name) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    module: store.module,
    name: get(store.detail, 'name'),
    desc: get(store.detail.image, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('Images'),
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
            path: '',
            title: '상태',
            component: Test,
            exact: true,
          }
        ]}
        {...sideProps} />
    </>
  )
}

export default inject('rootStore')(observer(ImageDetail));

const Test = () => {
  return (
    <div>
      <Card >
        <div>
          <div className="detail-box">
            <i className="ico ico-empty-vm"></i>
            <div className="etc-msg">
              이미지를 사용하는 가상머신이 없습니다.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}