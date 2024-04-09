
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

import ImageBuildStore from 'stores/resources/imagebuild';

const store = new ImageBuildStore();

const ImageBuildDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    
    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/imagebuild`

    const routing = props.rootStore.routing;
    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

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
            store: store,
            cluster: props.match.params.cluster,
            success: () => routing.push(listUrl),
          }),
      },
    ]

    const getAttrs = () => {
      const detail = toJS(store.detail)
      const uploadInfo = get(detail, ['upload-info-list', 'upload-info'])
      const podStatus = get(detail, 'pod-status', '')

      const stepRunningArray = ['ServerConfiguring', 'FileUploading', 'ImageBuild&Pushing', 'ServerDeleting', 'ServerReady', 'FileUploadCompleted']
      const stepFailedArray = ['ServerConfigureFail', 'FileUploadFail', 'ImagePushFailed']

      const podStatusText = stepFailedArray.includes(podStatus.replace(/\s/gi, "")) ? t('RESOURCES_FAIL') 
      : stepRunningArray.includes(podStatus.replace(/\s/gi, "")) ? t('RESOURCES_RUNNING') : t('RESOURCES_SUCCESS')


      let fileStatus = "-";
      let fileName = "-";
      let fileSize = 0;
      let fileConvertSize = "-";

      if(!!uploadInfo) {         
         const MetaData = uploadInfo[0]['upload-file-info']['file-info']['MetaData'];
         fileName = get(MetaData, 'filename', '-').split(".")[0]

         fileStatus = uploadInfo[0]['upload-file-info']['Status'];
         fileSize = uploadInfo[0]['upload-file-info']['file-info']['Size'];
         fileConvertSize = fileSize ? common.fnFormatBytes(fileSize.toString()) : "-";

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
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        icon: "image",
        module: store.module,
        name: get(store.detail.tags, 'image-name'),
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
                {...sideProps} />
        </>
    )
}

export default inject('rootStore')(observer(ImageBuildDetail));

