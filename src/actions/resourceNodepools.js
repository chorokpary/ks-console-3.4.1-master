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

import { Notify } from '@kube-design/components'
import { Modal } from 'components/Base'

import ModifyModal from 'clusters/containers/Resources/components/Modals/NodePools/Modify'
import DeleteModal from 'components/Modals/Delete'

export default {
  'nodepool.edit': {
    on({ store, detail, success, ...params }) {
      const nodepool = detail.nodepool
      const modal = Modal.open({
        onEdit: data => {
          store.updateNodePool(data, params).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_EDIT_SUCCESSFUL') })
            success && success()
          })
        },
        title: t('RESOURCES_EDIT_KAAS_RESOURCE'),
        modal: ModifyModal,
        nodepool,
        ...params,
      })
    },
  },
  'nodepool.remove': {
    on({ store, detail, success, ...params }) {
      const modal = Modal.open({
        onOk: () => {
          store.deleteNodePool(params).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
            success && success()
          })
        },
        modal: DeleteModal,
        module: store.module,
        title: t('RESOURCES_DELETE'),
        desc: t.html('RESOURCES_DELETE_KAAS_RESOURCE_TIP', {
          resource: detail.nodepool.name,
        }),
        resource: detail.nodepool.name,
        ...params,
      })
    },
  },
}
