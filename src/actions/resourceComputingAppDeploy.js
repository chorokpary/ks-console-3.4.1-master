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

import EditYamlModal from 'components/Modals/EditYaml'
import DeleteModal from 'components/Modals/Delete'
import ConfirmModal from 'clusters/containers/Resources/components/Modals/Confirm'

import RegistModal from 'clusters/containers/Resources/components/Modals/ComputingAppDeploy/Regist'
import ModifyModal from 'clusters/containers/Resources/components/Modals/ComputingAppDeploy/Modify'

import UploadModal from 'clusters/containers/Resources/components/Modals/UploadImage'

export default {
  'computingappdeploy.regist': {
    on({ store, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {

          Modal.close(modal)
          Notify.success({ content: t('RESOURCES_SAVE_SUCCESSFUL') })
          success && success()

          // store
          //   .create(data, { cluster, workspace, namespace, devops })
          //   .then(() => {
          //     Modal.close(modal)
          //     Notify.success({ content: t('RESOURCES_SAVE_SUCCESSFUL') })
          //     success && success()
          //   })
        },
        title: t('RESOURCES_CREATE_TEMPLATE'),
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
  'computingappdeploy.edit': {
    on({ store, module, detail, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .update({ ...detail, ...cluster, workspace, namespace, devops, id: data.id}, data)
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
              success && success()
            })
        },
        title: t('RESOURCES_EDIT_TEMPLATE'),
        modal: ModifyModal,
        store,
        detail,
        module,
        ...props,
      })
    },
  },
  'computingappdeploy.remove': {
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
        desc: t.html('RESOURCES_DELETE_APP_DEPLOY_TIP', {
          resource: detail.name,
        }),
        resource: detail.name,
        store,
        ...props,
      })
    },
  },
  'computingappdeploy.remove.batch': {
    on({ store, cluster, workspace, namespace, success, devops, ...props }) {
      const rowKeys = toJS(store.list.selectedRowKeys)
      const names = rowKeys.join(', ')

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
          rowKeys.length === 1
            ? t('RESOURCES_DELETE')
            : t('RESOURCES_DELETE_MULTIPLE'),
        desc:
          rowKeys.length === 1
            ? t.html('RESOURCES_DELETE_APP_DEPLOY_TIP', { resource: names })
            : t.html('RESOURCES_DELETE_APP_DEPLOY_TIP', { resource: names }),
        resource: names,
        store,
        ...props,
      })
    },
  },
  'computingappdeploy.delete': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.delete(detail).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        title: t('RESOURCES_DELETE'),
        desc: t('RESOURCES_DELETE_DESC'),
        modal: DeleteModal,
        module: store.module,
        detail,
        store,
        ...props,
      })
    },
  },
  'computingappdeploy.image.upload': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: async data => {
          Modal.close(modal)
        },
        detail,
        store,
        modal: UploadModal,
        ...props,
      })
    },
  },
  'computingappdeploy.deploy': {
    on({ store, detail, success, data, title, desc, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.deploy({ detail, ...props }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DEPLOYED_SUCCESSFULLY') })
            success && success()
          })
        },
        title: !!title ? title : t('RESOURCES_TASK_DEPLOY'),
        desc: !!desc ? desc : t('RESOURCES_DEPLOY_DESC'),
        modal: ConfirmModal,
        module: store.module,
        detail,
        store,
        ...props,
      })
    },
  },
}
