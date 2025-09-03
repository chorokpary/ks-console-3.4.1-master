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

import ConfirmModal from 'clusters/containers/Resources/components/Modals/Confirm'
import ClusterModal from 'clusters/containers/Resources/components/Modals/GpuClusters/Cluster'
import RegistModal from 'clusters/containers/Resources/components/Modals/GpuClusters/Regist'
import ModifyModal from 'clusters/containers/Resources/components/Modals/GpuClusters/Modify'

import EditYamlModal from 'components/Modals/EditYaml'
import DeleteModal from 'components/Modals/Delete'

export default {
  'gpuclusters.cluster.regist': {
    on({
      store,
      rootStore,
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
            .createCluster(data, { cluster, workspace, namespace, devops })
            .then((res) => {
              if(res.success){
                success && success()
                data.createSuccess?.(success)
              }else{
                data.createFail()
              }         
            })
        },
        title: t('RESOURCES_CREATE_GPU_CLUSTER'),
        modal: ClusterModal,
        store,
        rootStore,
        cluster,
        workspace,
        namespace,
        devops,
        ...props,
      })
    },
  },
  'gpuclusters.regist': {
    on({ store, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .create(data, { cluster, workspace, namespace, devops })
            .then(() => {
              Modal.close(modal)
              Notify.success({
                content: t('RESOURCES_CREATE_REQUEST_SUCCESSFUL'),
              })
              success && success()
            })
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
  'gpuclusters.edit': {
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
              {
                ...detail,
                cluster,
                workspace,
                namespace,
                devops,
                name: data.name,
              },
              data
            )
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
              success && success()
            })
        },
        title: t('RESOURCES_EDIT_GPU_CLUSTER'),
        modal: ModifyModal,
        store,
        cluster,
        workspace,
        namespace,
        module,
        ...props,
      })
    },
  },

  'gpuclusters.vmedit': {
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
        onOk: retypeList => {
          store.batchDelete({ ...props, namespace, ...retypeList }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        title: t('VM 편집'),
        modal: ModifyModal,
        store,
        cluster,
        workspace,
        namespace,
        module,
        ...props,
      })
    },
  },
  'gpuclusters.remove': {
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
          store.delete({ ...props, namespace, ...retypeList }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        modal: DeleteModal,
        title: t('RESOURCES_DELETE'),
        desc: t.html('RESOURCES_DELETE_GPU_CLUSTER_TIP', {
          resource: detail.name,
        }),
        resource: detail.name,
        store,
        ...props,
      })
    },
  },
  'gpuclusters.actionState': {
    on({
      store,
      detail,
      cluster,
      workspace,
      namespace,
      success,
      devops,
      actionType,
      ...props
    }) {
      const modal = Modal.open({
        onOk: () => {
          store.actionState({ ...detail, namespace, actionType }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_CHANGED_SUCCESSFULLY') })
            success && success()
          })
        },
        modal: ConfirmModal,
        title: t(`RESOURCES_VM_ALL_${actionType.toUpperCase()}`),
        desc: t.html('RESOURCES_CHANGE_VM_STATE', {
          resource: detail.name,
        }),
        resource: detail.name,
        store,
        ...props,
      })
    },
  },
  'gpuclusters.vmAllDelete': {
    on({
      store,
      cluster,
      workspace,
      namespace,
      success,
      devops,
      name,
      vmList,
      ...props
    }) {
      const modal = Modal.open({
        onOk: () => {
          store.vmAllDelete({ namespace, vmList }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        modal: DeleteModal,
        title: t('RESOURCES_VM_ALL_DELETE'),
        desc: t.html('RESOURCES_DELETE_GPU_ALL_VM_TIP', {
          resource: name,
        }),
        resource: name,
        store,
        ...props,
      })
    },
  },
  'gpuclusters.yaml.view': {
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
}
