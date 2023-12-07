
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

  const id = props.match.params.id;
  const used_by_vmi = store.detail.volume?.used_by_vmi

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
      text: used_by_vmi == undefined ? t('RESOURCES_BINDING') : t('RESOURCES_ISOLATE'),
      action: 'view',
      onClick: () => {
        if (used_by_vmi == undefined) {
          props.rootStore.triggerAction('resourcesvolume.bindingPop', {
            type: 'VOLUME_DETAIL',
            store: store,
            success: fetchData,
          })
        } else {
          props.rootStore.triggerAction('resourcesvolume.detach', {
            data: { id, vmId: used_by_vmi, actionType: "D" },
            store: store,
            success: fetchData,
          })
        }
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
        props.rootStore.triggerAction('resourcesvolume.remove', {
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
        name: t('RESOURCES_CLUSTER'),
        value: detail.cluster,
      },
      {
        name: t('RESOURCES_STOREGE_CLASS'),
        value: detail.volume.storage_class,
      },
      {
        name: t('RESOURCES_ACCESS_MODE'),
        value: detail.volume.access_modes.length > 0 ?
          detail.volume.access_modes && (detail.volume.access_modes).map((volume) => (
            <p key={volume}>{volume}</p>
          ))
          : "-",
      },
      {
        name: t('RESOURCES_CAPACITY'),
        value: detail.volume.capacity,
      },
      {
        name: t('RESOURCES_INPUT_SOURCE'),
        value: detail.volume.import_source,
      },
      {
        name: t('RESOURCES_VOLUME_MODE'),
        value: detail.volume.volume_mode,
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.volume.description,
      },
      {
        name: t('RESOURCES_CREATE_DAY'),
        value: getLocalTime(detail.volume.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />;
  }

  const sideProps = {
    icon: "storage",
    module: store.module,
    name: get(store.detail, 'name'),
    desc: get(store.detail.flavor, 'description', ''),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_VOLUME'),
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

