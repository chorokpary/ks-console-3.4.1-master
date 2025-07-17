import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components'
import { observer, inject } from 'mobx-react'
import { getLocalTime } from 'utils'

import VolumeStore from 'stores/resources/volumes'
import routes from './routes'

const store = new VolumeStore()

const VolumeDetail = props => {
  const volumnName = props.match.params.name

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    store.fetchDetail(props.match.params)
  }

  const { workspace, cluster, namespace } = props.match.params
  const listUrl = `/${workspace}/clusters/${cluster}/projects/${namespace}/resourcesvolumes`

  const routing = props.rootStore.routing
  const showEdit = !globals.config.presetClusterRoles.includes(
    props.match.params.name
  )

  const used_by_vmi = store.detail.volume?.used_by_vmi

  const getOperations = volumeName => {
    const operations = [
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
        onClick: () => {
          props.rootStore.triggerAction('resourcesvolume.yaml.view', {
            yaml: store.yaml,
            readOnly: true,
          })
        },
      },
    ]

    if (
      !volumeName.includes('boot-dv') &&
      !volumeName.includes('boot-volume') &&
      !volumeName.includes('bootdisk')
    ) {
      operations.push(
        {
          key: 'volume',
          icon: 'storage',
          text: !used_by_vmi ? t('RESOURCES_BINDING') : t('RESOURCES_ISOLATE'),
          action: 'view',
          onClick: () => {
            if (!used_by_vmi) {
              props.rootStore.triggerAction('resourcesvolume.bindingPop', {
                type: 'VOLUME_DETAIL',
                store,
                success: fetchData,
                ...props.match.params,
              })
            } else {
              props.rootStore.triggerAction('resourcesvolume.detach', {
                data: {
                  name: volumeName,
                  vmName: used_by_vmi,
                  actionType: 'D',
                },
                store,
                success: fetchData,
                ...props.match.params,
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
              store,
              success: () => routing.push(listUrl),
              ...props.match.params,
            }),
        }
      )
    }

    return operations
  }

  const getAttrs = () => {
    const detail = toJS(store.detail)

    if (isEmpty(detail)) {
      return
    }

    if (!detail.volume.boot_type) {
      detail.volume.boot_type = 'uefi'
    }

    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: detail.cluster,
      },
      {
        name: t('RESOURCES_STORAGE_CLASS'),
        value: detail.volume.storage_class,
      },
      {
        name: t('RESOURCES_ACCESS_MODE'),
        value:
          detail.volume.access_modes.length > 0
            ? detail.volume.access_modes &&
              detail.volume.access_modes.map(volume => (
                <p key={volume}>{volume}</p>
              ))
            : '-',
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
        name: t('RESOURCES_VOLUME_TYPE'),
        value:
          detail.volume.boot_volume === true
            ? t('RESOURCES_BOOT_VOLUME')
            : t('RESOURCES_NORMAL_VOLUME'),
      },
      {
        name: t('RESOURCES_CPU_TYPE'),
        value: detail.volume.cpu_arch,
      },
      {
        name: t('RESOURCES_OS_TYPE'),
        value: detail.volume.os_type,
      },
      {
        name: t('RESOURCES_OS_DISTRO'),
        value: detail.volume.os_distro,
      },
      {
        name: t('RESOURCES_BOOT_TYPE'),
        value: t(
          `RESOURCES_BOOT_TYPE_${detail.volume.boot_type.toUpperCase()}`
        ),
      },
      {
        name: t('RESOURCES_PHASE'),
        value: t(`RESOURCES_IMAGE_${detail.volume.phase.toUpperCase()}`),
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.volume.description,
      },
      {
        name: t('RESOURCES_CREATE_DAY'),
        value: getLocalTime(detail.volume.timestamp).format(
          'YYYY-MM-DD HH:mm:ss'
        ),
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />
  }

  const sideProps = {
    icon: 'storage',
    module: store.module,
    name: get(store.detail, 'name'),
    desc: get(store.detail.flavor, 'description', ''),
    operations: getOperations(volumnName),
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
        authKey="resourcesVolumes"
        {...sideProps}
      />
    </>
  )
}

export default inject('rootStore')(observer(VolumeDetail))
