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

import RegistModal from 'projects/components/Modals/Resources/FloatingIp/Regist'
import ModifyModal from 'projects/components/Modals/Resources/Images/Modify'

export default {
    'floatingIp.regist': {
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
                title: '플로팅 IP 생성',
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
    'floatingIp.edit': {
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
                title: '플로팅 IP 수정',
                modal: ModifyModal,
                store,
                detail,
                module,
                ...props,
            })
        },
    },
    'floatingIp.remove': {
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
            console.log(detail)
            console.log(store)
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
                title: '플로팅 IP 삭제',
                desc: '삭제하시겠습니까?',
                module: store.module,
                detail,
                store,
                ...props,
            })
        },
    },
    'floatingIp.remove.batch': {
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
                        ? t('플로팅 IP 삭제')
                        : t('플로팅 IP 일괄 삭제'),
                desc:
                    usernames.split(', ').length === 1
                        ? t.html('선택한 플로팅 IP를 삭제하시겠습니까?.', { resource: usernames })
                        : t.html('선택한 플로팅 IP를 일괄 삭제하시겠습니까?', { resource: usernames }),
                module: usernames,
                store,
                ...props,
            })
        },
    },
    'floatingIp.delete': {
        on({ store, detail, success, ...props }) {
            const modal = Modal.open({
                onOk: () => {
                    store.delete(detail).then(() => {
                        Modal.close(modal)
                        Notify.success({ content: t('삭제 되었습니다.') })
                        success && success()
                    })
                },
                title: '플로팅 IP 삭제',
                desc: '삭제하시겠습니까?',
                modal: DeleteModal,
                module: store.module,
                detail,
                store,
                ...props,
            })
        },
    },
    'floatingIp.yaml.view': {
        on({ store, detail, success, ...props }) {
            const modal = Modal.open({
                onOk: async data => {
                    Notify.success({ content: t('수정 되었습니다') })
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
