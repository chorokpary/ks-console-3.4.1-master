import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components'
import { observer, inject } from 'mobx-react'

import * as common from 'utils/resources'
import ImageBuildStore from 'stores/resources/imagebuild'
import routes from './routes'

const store = new ImageBuildStore()

const ImageBuildDetail = props => {
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    // store.fetchDetail(props.match.params)
    store.fetchDetail({ ...props.match.params, cluster: '' })
  }

  const { cluster } = props.match.params
  const listUrl = `/clusters/${cluster}/imagebuild`

  const routing = props.rootStore.routing
  const showEdit = !globals.config.presetClusterRoles.includes(
    props.match.params.name
  )

  const getOperations = () => [
    {
      key: 'delete',
      icon: 'trash',
      text: t('DELETE'),
      action: 'delete',
      type: 'danger',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('imagebuild.remove', {
          type: 'IMAGE_BUILD_DETAIL',
          detail: toJS(store.detail),
          store,
          cluster: props.match.params.cluster,
          success: () => routing.push(listUrl),
        }),
    },
  ]

  const getAttrs = () => {
    const detail = toJS(store.detail)
    const uploadInfo = get(detail, ['upload-info-list', 'upload-info'])
    const podStatus = get(detail, 'pod-status', '')

    // Status (Kor)	  Status (Eng)	          Description
    // 서버 준비 중	    Server Configuring	  업로드 위한 서버 준비 중
    // 서버 준비 완료	  Server Ready	        업로드 위한 서버 준비 완료(파일 업로드 대기 중)
    // 파일 업로드 중	  File Uploading	      파일 업로드 중
    // 이미지 빌드 중	  Image Build	          이미지 빌드 및 이미지 저장소에 push 중
    // 이미지 빌드 완료	Image Build Succeed	  이미비 빌드 후 저장소로 push 완료
    // 실패	           Fail                 	과정 실패

    const stepRunningArray = ['ServerReady', 'FileUploading', 'ImageBuild']
    const stepSucceedArray = ['ImageBuildSucceed']
    const stepFailedArray = ['Fail']

    const podStatusText = stepFailedArray.includes(
      podStatus.replace(/\s/gi, '')
    )
      ? t('RESOURCES_FAIL')
      : stepRunningArray.includes(podStatus.replace(/\s/gi, ''))
      ? t('RESOURCES_RUNNING')
      : stepSucceedArray.includes(podStatus.replace(/\s/gi, ''))
      ? t('RESOURCES_COMPLETE')
      : t('RESOURCES_PREPARING')

    let fileName = '-'
    let fileSize = 0
    let fileConvertSize = '-'

    if (uploadInfo) {
      const MetaData =
        uploadInfo[0]['upload-file-info']['file-info']['MetaData']
      fileName = get(MetaData, 'filename', '-').split('.')[0]

      fileSize = uploadInfo[0]['upload-file-info']['file-info']['Size']
      fileConvertSize = fileSize
        ? common.fnFormatBytes(fileSize.toString())
        : '-'
    }

    if (isEmpty(detail)) {
      return
    }

    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: cluster,
      },
      {
        name: t('RESOURCES_CPU_TYPE'),
        value: detail.tags.cpuType,
      },
      {
        name: t('RESOURCES_TAG'),
        value: detail.tags.tag,
      },
      {
        name: t('RESOURCES_OS_INFORMATION'),
        value: detail.tags.os,
      },
      {
        name: t('RESOURCES_FILE_NAME'),
        value: fileName,
      },
      {
        name: t('RESOURCES_SIZE'),
        value: fileConvertSize,
      },
      {
        name: t('Registry URL'),
        value: detail.tags.registUrl,
      },
      {
        name: t('RESOURCES_STATE'),
        value: podStatusText,
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.tags.description,
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />
  }

  const sideProps = {
    icon: 'image',
    module: store.module,
    name: get(store.detail.tags, 'image-name') || '',
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_VM_IMAGE_BUILD'),
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

export default inject('rootStore')(observer(ImageBuildDetail))
