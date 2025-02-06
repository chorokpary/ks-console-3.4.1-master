/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import { toJS } from 'mobx'
import { Notify } from '@kube-design/components'
import { Modal } from 'components/Base'

import RegistModal from 'clusters/containers/Resources/components/Modals/ContainerResource/Regist'
import ModifyModal from 'clusters/containers/Resources/components/Modals/ContainerResource/Modify'

import EditYamlModal from 'components/Modals/EditYaml'
import DeleteModal from 'components/Modals/Delete'
import ConsoleConfiglModal from 'clusters/containers/Resources/components/Modals/ConsoleConfig'

export default {
  'containerresource.regist': {
    on({ store, cluster, success, startRefresh, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store.create(data, { cluster }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_SAVE_SUCCESSFUL') })
            success && success()
            startRefresh()
          })
        },
        startRefresh: () => {
          startRefresh()
        },
        title: t('RESOURCES_CREATE_KAAS_RESOURCE'),
        modal: RegistModal,
        store,
        cluster,
        ...props,
      })
    },
  },
  'containerresource.edit': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store.update(data).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
            success && success()
          })
        },
        title: t('RESOURCES_EDIT_KAAS_RESOURCE'),
        modal: ModifyModal,
        store,
        ...props,
      })
    },
  },
  'containerresource.remove': {
    on({ store, detail, cluster, namespace, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.delete({ ...detail, cluster, namespace }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        modal: DeleteModal,
        title: t('RESOURCES_DELETE'),
        desc: t.html('RESOURCES_DELETE_KAAS_RESOURCE_TIP', {
          resource: detail.name,
        }),
        resource: detail.name,
        store,
        ...props,
      })
    },
  },
  'containerresource.remove.batch': {
    on({ store, cluster, namespace, success, ...props }) {
      const rowKeys = toJS(store.list.selectedRowKeys)
      const name = rowKeys.join(', ')
      const modal = Modal.open({
        onOk: () => {
          store.batchDelete({ rowKeys, cluster, namespace }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        modal: DeleteModal,
        title:
          name.split(', ').length === 1
            ? t('RESOURCES_DELETE')
            : t('RESOURCES_DELETE_MULTIPLE'),
        desc:
          name.split(', ').length === 1
            ? t.html('RESOURCES_DELETE_KAAS_RESOURCE_TIP', {
                resource: name,
              })
            : t.html('RESOURCES_DELETE_KAAS_RESOURCE_TIP', {
                resource: name,
              }),
        resource: name,
        store,
        ...props,
      })
    },
  },
  'containerresource.remove.clusterbatch': {
    on({ store, cluster, success, ...props }) {
      const rowKeys = toJS(store.list.selectedRowKeys)
      const names = rowKeys.join(', ')
      const modal = Modal.open({
        onOk: () => {
          store
            .clusterBatchDelete({
              rowKeys,
              cluster,
            })
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
              success && success()
            })
        },
        modal: DeleteModal,
        title:
          names.split(', ').length === 1
            ? t('RESOURCES_DELETE')
            : t('RESOURCES_DELETE_MULTIPLE'),
        desc:
          names.split(', ').length === 1
            ? t.html('RESOURCES_DELETE_KAAS_RESOURCE_TIP', {
                resource: names,
              })
            : t.html('RESOURCES_DELETE_KAAS_RESOURCE_TIP', {
                resource: names,
              }),
        resource: names,
        store,
        ...props,
      })
    },
  },
  'containerresource.delete': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.delete(detail).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        modal: DeleteModal,
        module: store.module,
        detail,
        store,
        ...props,
      })
    },
  },
  'containerresource.yaml.view': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          Modal.close(modal)
          success && success()
        },
        detail,
        store,
        modal: EditYamlModal,
        ...props,
      })
    },
  },
  'containerresource.config.view': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          Modal.close(modal)
          success && success()
        },
        detail,
        store,
        modal: ConsoleConfiglModal,
        ...props,
      })
    },
  },
}
