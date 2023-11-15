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
              Notify.success({ content: t('저장 되었습니다.') })
              success && success()
            })
        },
        title: '볼륨 생성',
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
    on({  store, module, detail, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .update({ ...detail, ...cluster, workspace, namespace, devops, name : data.name }, data)
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('수정 되었습니다.') })
              success && success()
            })
        },
        title: '볼륨 수정',
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
              Notify.success({ content: t('삭제 되었습니다.') })
              success && success()
            })
        },
        modal: DeleteModal,
        title: t('삭제'),
        desc: t.html('볼륨 이름 입력하여 이 작업의 위험을 이해하고 있는지 확인합니다.', {
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
      const usernames = rowKeys.join(', ')
      const modal = Modal.open({
        onOk: () => {
          store
            .batchDelete({ rowKeys, cluster, workspace, namespace, devops })
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('삭제 되었습니다.') })
              success && success()
            })
        },
        modal: DeleteModal,
        title:
          usernames.split(', ').length === 1
            ? t('삭제')
            : t('일괄 삭제'),
        desc:
          usernames.split(', ').length === 1
            ? t.html('볼륨 이름 입력하여 이 작업의 위험을 이해하고 있는지 확인합니다.', { resource: usernames })
            : t.html('볼륨 이름 입력하여 이 작업의 위험을 이해하고 있는지 확인합니다.', { resource: usernames }),
        resource: usernames,
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
            Notify.success({ content: t('삭제 되었습니다.') })
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
          Notify.success({ content: t('수정 되었습니다.') })
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
        title: '바인딩',
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
          store.actionState({data, ...props}).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('분리 되었습니다.') })
            success && success()
          })
        },
        title: '볼륨 분리',
        desc: '분리 하시겠습니까?',
        modal: ConfirmModal,
        store,
        ...props,
      })
    },
  },
  
}
