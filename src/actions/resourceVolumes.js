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

import RegistModal from 'clusters/containers/Resources/components/Modals/Volumes/Regist'
import ModifyModal from 'clusters/containers/Resources/components/Modals/Volumes/Modify'
import BindingModal from 'clusters/containers/Resources/components/Modals/Volumes/Binding'

import EditYamlModal from 'components/Modals/EditYaml'
import DeleteModal from 'components/Modals/Delete'
import ConfirmModal from 'clusters/containers/Resources/components/Modals/Confirm'

export default {
  'resourcesvolume.regist': {
    on({ store, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .create(data, { cluster, workspace, namespace, devops })
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_CREATE_SUCCESSFUL') })
              success && success()
            })
        },
        title: t('RESOURCES_CREATE_VOLUME'),
        modal: RegistModal,
        store,
        cluster,
        workspace,
        namespace,
        devops,
        ...props,
      })
    },
  },
  'resourcesvolume.edit': {
    on({ store, module, detail, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .update({ ...detail, cluster, workspace, namespace, devops, name: data.name }, data)
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
              success && success()
            })
        },
        title: t('RESOURCES_EDIT_VOLUME'),
        modal: ModifyModal,
        store,
        module,
        ...props,
      })
    },
  },
  'resourcesvolume.remove': {
    on({
      store,
      detail,
      cluster,
      workspace,
      namespace,
      success,
      devops,
      ...props
    }) {
      const modal = Modal.open({
        onOk: () => {
          store
            .delete({ ...detail, cluster, workspace, namespace, devops })
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
              success && success()
            })
        },
        modal: DeleteModal,
        title: t('RESOURCES_DELETE'),
        desc: t.html('RESOURCES_DELETE_VOLUME_TIP', {
          resource: detail.name,
        }),
        resource: detail.name,
        store,
        ...props,
      })
    },
  },
  'resourcesvolume.remove.batch': {
    on({ store, cluster, workspace, namespace, success, devops, ...props }) {
      const rowKeys = toJS(store.list.selectedRowKeys)
      let arr = new Array
      store.dataList.map(obj => {
        if (rowKeys.includes(obj.id)) {
          arr.push(obj.name)
        }
      })
      const names = arr.join(', ')
      const modal = Modal.open({
        onOk: () => {
          store
            .batchDelete({ rowKeys, cluster, workspace, namespace, devops })
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
              success && success()
            })
        },
        modal: DeleteModal,
        title:
          names.length === 1
            ? t('RESOURCES_DELETE')
            : t('RESOURCES_DELETE_MULTIPLE'),
        desc:
          names.length === 1
            ? t.html('RESOURCES_DELETE_VOLUME_TIP', { resource: names })
            : t.html('RESOURCES_DELETE_VOLUME_TIP', { resource: names }),
        resource: names,
        store,
        ...props,
      })
    },
  },
  'resourcesvolume.delete': {
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
  'resourcesvolume.yaml.view': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: async data => {
          Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
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
  'resourcesvolume.bindingPop': {
    on({ store, success, ...props }) {
      const modal = Modal.open({
        title: t('RESOURCES_BINDING'),
        modal: BindingModal,
        store,
        success,
        ...props,
      })
    },
  },
  'resourcesvolume.detach': {
    on({ store, detail, success, data, title, desc, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.actionState({ data, ...props }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_ISOLATE_SUCCESSFUL') })
            success && success()
          })
        },
        title: t('RESOURCES_VOLUME_ISOLATION'),
        desc: t('RESOURCES_ISOLATE_TIP'),
        modal: ConfirmModal,
        store,
        ...props,
      })
    },
  },

}
