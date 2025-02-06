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

import RegistModal from 'clusters/containers/Resources/components/Modals/Vms/Regist'
import ModifyModal from 'clusters/containers/Resources/components/Modals/Vms/Modify'
import ModifySecurityGroupModal from 'clusters/containers/Resources/components/Modals/Vms/ModifySecurityGroup'
import ModifyFlavorModal from 'clusters/containers/Resources/components/Modals/Vms/ModifyFlavor'

import EditYamlModal from 'components/Modals/EditYaml'
import DeleteModal from 'components/Modals/Delete'
import AlertModal from 'clusters/containers/Resources/components/Modals/Alert'
import ConfirmModal from 'clusters/containers/Resources/components/Modals/Confirm'
import ConsoleLoglModal from 'clusters/containers/Resources/components/Modals/ConsoleLog'
import VolumeModal from 'clusters/containers/Resources/components/Modals/Vms/VolumePop'
import FloatingIpModal from 'clusters/containers/Resources/components/Modals/Vms/FloatingIpPop'

import CloneModal from 'clusters/containers/Resources/components/Modals/Vms/ClonePop'
import SnapshotModal from 'clusters/containers/Resources/components/Modals/Vms/SnapshotPop'
import RestoreModal from 'clusters/containers/Resources/components/Modals/Vms/RestorePop'

export default {
  'vm.regist': {
    on({
      store,
      cluster,
      workspace,
      namespace,
      success,
      startRefresh,
      devops,
      ...props
    }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .create(data, { cluster, workspace, namespace, devops })
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_CREATE_SUCCESSFUL') })
              success &&
                setTimeout(() => {
                  success()
                }, 1000)
              startRefresh()
            })
        },
        startRefresh: () => {
          startRefresh()
        },
        title: t('RESOURCES_CREATE_VM'),
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
  'vm.edit': {
    on({
      store,
      module,
      detail,
      cluster,
      workspace,
      namespace,
      success,
      devops,
      ...props
    }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .update(
              { ...detail, cluster, workspace, namespace, devops, id: data.id },
              data
            )
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
              success && success()
            })
        },
        title: t('RESOURCES_EDIT_VM'),
        modal: ModifyModal,
        store,
        module,
        cluster,
        namespace,
        ...props,
      })
    },
  },
  'vm.edit.securitygroup': {
    on({
      store,
      module,
      detail,
      cluster,
      workspace,
      namespace,
      success,
      devops,
      ...props
    }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .updateSecurity(
              { ...detail, cluster, workspace, namespace, devops, id: data.id },
              data
            )
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
              success && success()
            })
        },
        title: t('RESOURCES_VM_SECURITYGROUP_EDIT'),
        modal: ModifySecurityGroupModal,
        store,
        module,
        cluster,
        namespace,
        ...props,
      })
    },
  },
  'vm.edit.flavor': {
    on({
      store,
      module,
      detail,
      cluster,
      workspace,
      namespace,
      success,
      devops,
      ...props
    }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .updateFlavor(
              { ...detail, cluster, workspace, namespace, devops, id: data.id },
              data
            )
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
              success && success()
            })
        },
        title: t('RESOURCES_VM_FLAVOR_EDIT'),
        modal: ModifyFlavorModal,
        store,
        module,
        cluster,
        namespace,
        ...props,
      })
    },
  },
  'vm.remove': {
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
        desc: t.html('RESOURCES_DELETE_VM_TIP', {
          resource: detail.name,
        }),
        resource: detail.name,
        store,
        cluster,
        namespace,
        ...props,
      })
    },
  },
  'vm.remove.batch': {
    on({ store, cluster, workspace, namespace, success, devops, ...props }) {
      const rowKeys = toJS(store.list.selectedRowKeys)
      const arr = []
      store.dataList.forEach(obj => {
        if (rowKeys.includes(obj.id)) {
          arr.push(obj.name)
        }
      })
      const usernames = arr.join(', ')
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
          usernames.split(', ').length === 1
            ? t('RESOURCES_DELETE')
            : t('RESOURCES_DELETE_MULTIPLE'),
        desc:
          usernames.split(', ').length === 1
            ? t.html('RESOURCES_DELETE_VM_TIP', { resource: usernames })
            : t.html('RESOURCES_DELETE_VM_TIP', { resource: usernames }),
        resource: usernames,
        store,
        ...props,
      })
    },
  },
  'vm.delete': {
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
  'vm.yaml.view': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: async () => {
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
  'vm.log.view': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: async () => {
          Modal.close(modal)
          success && success()
        },
        detail,
        store,
        modal: ConsoleLoglModal,
        ...props,
      })
    },
  },
  'vm.actionState': {
    on({ store, detail, success, data, title, desc, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.actionState({ data, ...props }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_CHANGED_SUCCESSFULLY') })
            success && success()
          })
        },
        title: title || t('RESOURCES_CHANGE_STATE'),
        desc: desc || t('RESOURCES_CHANGE_VM_STATE'),
        modal: ConfirmModal,
        module: store.module,
        detail,
        store,
        ...props,
      })
    },
  },
  'vm.volumePop': {
    on({ store, success, ...props }) {
      Modal.open({
        onOk: () => {
          success && success()
        },
        title: t('RESOURCES_VOLUME_MANAGEMENT'),
        modal: VolumeModal,
        store,
        ...props,
      })
    },
  },
  'vm.volumePop.detach': {
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
  'vm.floatingIpPop': {
    on({ store, success, ...props }) {
      Modal.open({
        title: t('RESOURCES_FLOATING_IP_SETTINGS'),
        modal: FloatingIpModal,
        store,
        success,
        ...props,
      })
    },
  },
  'vm.floatingIpPop.deallocate': {
    on({ store, detail, success, data, title, desc, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.update(data, { name: data.id }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_RELEASE_SUCCESSFULLY') })
            success && success()
          })
        },
        title: t('RESOURCES_DEALLOCATE_FLOATING_IP'),
        desc: t('RESOURCES_RELEAGE_DESC'),
        modal: ConfirmModal,
        store,
        ...props,
      })
    },
  },
  // 'vm.snapshotPop': {
  //   on({ store, success, data, ...props }) {
  //     const modal = Modal.open({
  //       onOk: () => {
  //         store.snapshotCreate({ data, ...props }).then(() => {
  //           Modal.close(modal)
  //           Notify.success({ content: t('RESOURCES_CREATE_SUCCESSFUL') })
  //           success && success()
  //         })
  //       },
  //       title: t('RESOURCES_CREATE_SNAPSHOT'),
  //       desc: t('RESOURCES_CREATE_SNAPSHOT_TIP'),
  //       modal: ConfirmModal,
  //       store,
  //       success,
  //       ...props,
  //     })
  //   },
  // },
  'vm.snapshotPop': {
    on({ store, success, ...props }) {
      Modal.open({
        title: t('RESOURCES_CREATE_SNAPSHOT'),
        modal: SnapshotModal,
        store,
        success,
        ...props,
      })
    },
  },
  'vm.snapshotDelete': {
    on({ store, id, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.snapshotDelete({ id, ...props }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        modal: DeleteModal,
        module: store.module,
        id,
        store,
        ...props,
      })
    },
  },
  'vm.restorePop': {
    on({ store, name, success, ...props }) {
      Modal.open({
        title: t('RESOURCES_RUNNING_RESTORE'),
        modal: RestoreModal,
        name,
        store,
        success,
        ...props,
      })
    },
  },
  'vm.restoreDelete': {
    on({ store, id, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.restoreDelete({ id, ...props }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        modal: DeleteModal,
        module: store.module,
        id,
        store,
        ...props,
      })
    },
  },
  'vm.clonePop': {
    on({ store, success, ...props }) {
      Modal.open({
        title: t('RESOURCES_CREATE_CLONE'),
        modal: CloneModal,
        store,
        success,
        ...props,
      })
    },
  },
  'vm.cloneDelete': {
    on({ store, id, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.cloneDelete({ id, ...props }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        modal: DeleteModal,
        module: store.module,
        id,
        store,
        ...props,
      })
    },
  },
  'vm.alertPop': {
    on({ store, detail, success, data, title, desc, ...props }) {
      Modal.open({
        title: title || t('RESOURCES_ALERTING_MESSAGE'),
        desc: desc || t('RESOURCES_ALERTING_MESSAGE_DESCRIPTION'),
        modal: AlertModal,
        module: store.module,
        detail,
        store,
        ...props,
      })
    },
  },
}
