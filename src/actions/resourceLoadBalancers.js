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

import RegistModal from 'pages/clusters/containers/Resources/components/Modals/LoadBalancers/Regist'
import ModifyModal from 'pages/clusters/containers/Resources/components/Modals/LoadBalancers/Modify'
import ConfirmModal from 'clusters/containers/Resources/components/Modals/Confirm'

import EditYamlModal from 'components/Modals/EditYaml'
import DeleteModal from 'components/Modals/Delete'
import FloatingIpModal from 'clusters/containers/Resources/components/Modals/LoadBalancers/FloatingIpPop'

export default {
  'loadBalancer.regist': {
    on({ store, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .create(data, { cluster, workspace, namespace, devops })
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_SAVE_SUCCESSFUL') })
              success && success()
            })
        },
        title: t('RESOURCES_CREATE_LOAD_BALANCER'),
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
  'loadBalancer.edit': {
    on({ store, module, detail, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .update({ ...detail, ...cluster, workspace, namespace, devops, name: data.name }, data)
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
              success && success()
            })
        },
        title: t('RESOURCES_EDIT_LOAD_BALANCER'),
        modal: ModifyModal,
        store,
        module,
        cluster,
        namespace,
        ...props,
      })
    },
  },
  'loadBalancer.remove': {
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
        desc: t.html('RESOURCES_DELETE_LOAD_BALANCER_TIP', {
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
  'loadBalancer.remove.batch': {
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
          rowKeys.length === 1
            ? t('RESOURCES_DELETE')
            : t('RESOURCES_DELETE_MULTIPLE'),
        desc:
          rowKeys.length === 1
            ? t.html('RESOURCES_DELETE_LOAD_BALANCER_TIP', { resource: names })
            : t.html('RESOURCES_DELETE_LOAD_BALANCER_TIP', { resource: names }),
        resource: names,
        cluster,
        namespace,
        store,
        ...props,
      })
    },
  },
  'loadBalancer.delete': {
    on({ store, detail, success, cluster, namespace, ...props }) {
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
        cluster,
        namespace,
        store,
        ...props,
      })
    },
  },
  'loadBalancer.yaml.view': {
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
  'loadBalancer.floatingIpPop': {
    on({ store, success, cluster, namespace, ...props }) {
      const modal = Modal.open({
        title: t('RESOURCES_FLOATING_IP_SETTINGS'),
        modal: FloatingIpModal,
        store,
        success,
        cluster,
        namespace,
        ...props,
      })
    },
  },
  'loadBalancer.floatingIpPop.deallocate': {
    on({ store, detail, success, data, title, desc, cluster, namespace, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.update(data, cluster, namespace, { name: data.id }).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_RELEASE_SUCCESSFULLY') })
            success && success()
          })
        },
        title: t('RESOURCES_DEALLOCATE_FLOATING_IP'),
        desc: t('RESOURCES_RELEAGE_DESC'),
        modal: ConfirmModal,
        cluster,
        namespace,
        store,
        ...props,
      })
    },
  },

}
