
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
          value: detail.cluster,
        },
        {
          name: t('RESOURCES_SIZE'),
          value: detail.cluster,
        },
        {
          name: t('Registry URL'),
          value: detail.cluster,
        },
        {
          name: t('RESOURCES_STATE'),
          value: detail.cluster,
        },
        {
          name: t('RESOURCES_DESCRIPTION'),
          value: detail.cluster,
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

