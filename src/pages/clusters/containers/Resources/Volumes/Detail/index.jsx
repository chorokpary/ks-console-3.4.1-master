
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

import VolumeStore from 'stores/resources/volumes'

const store = new VolumeStore();

const VolumeDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    
    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/resourcesvolumes`

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
            props.rootStore.triggerAction('resourcesvolume.edit', {
            type: 'VOLUME_DETAIL',
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
            props.rootStore.triggerAction('resourcesvolume.yaml.view', {
            yaml: store.yaml,
            readOnly: true,
          })
        },
      },
      {
        key: 'volume',
        icon: 'storage',
        text: t('바인딩'),
        action: 'view',
        onClick: () => {
            props.rootStore.triggerAction('resourcesvolume.bindingPop', {
            type: 'VOLUME_DETAIL',
            store: store,
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
            props.rootStore.triggerAction('resourcesvolume.delete', {
            type: 'VOLUME_DETAIL',
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
          name: t('클러스터'),
          value: detail.cluster,
        },
        {
          name: t('스토리지 클래스'),
          value: detail.volume.storage_class,
        },
        {
          name: t('접근 모드'),
          value: detail.volume.access_modes.length > 0 ? 
                detail.volume.access_modes && (detail.volume.access_modes).map((volume) => (
                  <p key={volume}>{volume}</p>
                ))
              : "-",
        },
        {
          name: t('용량'),
          value: detail.volume.capacity,
        },
        {
          name: t('입력 소스'),
          value: detail.volume.import_source,
        },
        {
          name: t('볼륨 모드'),
          value: detail.volume.volume_mode,
        },
        {
          name: t('설명'),
          value: detail.volume.description,
        },
        {
          name: t('생성일'),
          value: getLocalTime(detail.volume.timestamp).format('YYYY-MM-DD HH:mm:ss'),
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
                label: t('볼륨'),
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

export default inject('rootStore')(observer(VolumeDetail));

