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

import EditYamlModal from 'components/Modals/EditYaml'
import DeleteModal from 'components/Modals/Delete'
import ConfirmModal from 'clusters/containers/Resources/components/Modals/Confirm'
import ConsoleLoglModal from 'clusters/containers/Resources/components/Modals/ConsoleLog'
import VolumeModal from 'clusters/containers/Resources/components/Modals/Vms/VolumePop'
import FloatingIpModal from 'clusters/containers/Resources/components/Modals/Vms/FloatingIpPop'

import CloneModal from 'clusters/containers/Resources/components/Modals/Vms/ClonePop'
import SnapshotModal from 'clusters/containers/Resources/components/Modals/Vms/SnapshotPop'
import RestoreModal from 'clusters/containers/Resources/components/Modals/Vms/RestorePop'

export default {
  'vm.regist': {
    on({ store, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .create(data, { cluster, workspace, namespace, devops })
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('저장 되었습니다.') })
              success && setTimeout(() => { success(); }, 1000)
            })
        },
        title: '가상머신 생성',
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
    on({ store, module, detail, cluster, workspace, namespace, success, devops, ...props }) {
      const modal = Modal.open({
        onOk: data => {
          store
            .update({ ...detail, ...cluster, workspace, namespace, devops, name: data.name }, data)
            .then(() => {
              Modal.close(modal)
              Notify.success({ content: t('수정 되었습니다.') })
              success && success()
            })
        },
        title: '가상머신 수정',
        modal: ModifyModal,
        store,
        module,
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
              Notify.success({ content: t('삭제 되었습니다.') })
              success && success()
            })
        },
        modal: DeleteModal,
        title: t('삭제'),
        desc: t.html('가상머신 이름 입력하여 이 작업의 위험을 이해하고 있는지 확인합니다.', {
          resource: detail.name,
        }),
        resource: detail.name,
        store,
        ...props,
      })
    },
  },
  'vm.remove.batch': {
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
            ? t.html('가상머신 이름 입력하여 이 작업의 위험을 이해하고 있는지 확인합니다.', { resource: usernames })
            : t.html('가상머신 이름 입력하여 이 작업의 위험을 이해하고 있는지 확인합니다.', { resource: usernames }),
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
  'vm.yaml.view': {
    on({ store, detail, success, ...props }) {
      const modal = Modal.open({
        onOk: async data => {
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
        onOk: async data => {
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
            Notify.success({ content: t('변경 되었습니다.') })
            success && success()
          })
        },
        title: !!title ? title : '상태변경',
        desc: !!desc ? desc : '가상머신 상태를 변경하시겠습니까?',
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
      const modal = Modal.open({
        onOk: () => {
          success && success()
        },
        title: '볼륨 관리',
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
  'vm.floatingIpPop': {
    on({ store, success, ...props }) {
      const modal = Modal.open({
        title: '플로팅 IP 설정',
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
            Notify.success({ content: t('해제 되었습니다.') })
            success && success()
          })
        },
        title: '플로팅 IP 해제',
        desc: '해제 하시겠습니까?',
        modal: ConfirmModal,
        store,
        ...props,
      })
    },
  },
  'vm.snapshotPop': {
    on({ store, success, ...props }) {
      const modal = Modal.open({
        title: '스냅샷 생성',
        modal: SnapshotModal,
        store,
        success,
        ...props,
      })
    },
  },  
  'vm.snapshotDelete': {
    on({ store, name, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.snapshotDelete(name).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('삭제 되었습니다.') })
            success && success()
          })
        },
        modal: DeleteModal,
        module: store.module,
        name,
        store,
        ...props,
      })
    },
  },
  'vm.restorePop': {
    on({ store, name, success, ...props }) {
      const modal = Modal.open({
        title: '복원 실행',
        modal: RestoreModal,
        name,
        store,
        success,
        ...props,
      })
    },
  },  
  'vm.restoreDelete': {
    on({ store, name, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.restoreDelete(name).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('삭제 되었습니다.') })
            success && success()
          })
        },
        modal: DeleteModal,
        module: store.module,
        name,
        store,
        ...props,
      })
    },
  },
  'vm.clonePop': {
    on({ store, success, ...props }) {
      const modal = Modal.open({
        title: '클론 생성',
        modal: CloneModal,
        store,
        success,
        ...props,
      })
    },
  },  
  'vm.cloneDelete': {
    on({ store, name, success, ...props }) {
      const modal = Modal.open({
        onOk: () => {
          store.cloneDelete(name).then(() => {
            Modal.close(modal)
            Notify.success({ content: t('삭제 되었습니다.') })
            success && success()
          })
        },
        modal: DeleteModal,
        module: store.module,
        name,
        store,
        ...props,
      })
    },
  },
  

}
