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

import RegistModal from 'clusters/containers/Resources/components/Modals/FloatingIp/Regist'
import LbPop from 'clusters/containers/Resources/components/Modals/FloatingIp/LbPop'
import VmPop from 'clusters/containers/Resources/components/Modals/FloatingIp/VmPop'


export default {
    'floatingIp.regist': {
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
                title: t('RESOURCES_CREATE_FLOATING_IP'),
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
    'floatingIp.vmPop': {
        on({ store, cluster, workspace, namespace, success, devops, ...props }) {
            const modal = Modal.open({
                onOk: data => {
                    store
                        .update(data, { cluster, workspace, namespace, devops, name: data.id, ...data })
                        .then(() => {
                            Modal.close(modal)
                            Notify.success({ content: t('RESOURCES_CONNECT_SUCCESS_DESC') })
                            success && success()
                        })
                },
                title: t('RESOURCES_CONNECTION_VM'),
                modal: VmPop,
                store,
                cluster,
                workspace,
                namespace,
                devops,
                ...props,
            })
        },
    },
    'floatingIp.lbPop': {
        on({ store, cluster, workspace, namespace, success, devops, ...props }) {
            const modal = Modal.open({
                onOk: data => {
                    store
                        .update(data, { cluster, workspace, namespace, devops, name: data.id, ...data })
                        .then(() => {
                            Modal.close(modal)
                            Notify.success({ content: t('RESOURCES_CONNECT_SUCCESS_DESC') })
                            success && success()
                        })
                },
                title: t('RESOURCES_CONNECTION_LB'),
                modal: LbPop,
                store,
                cluster,
                workspace,
                namespace,
                devops,
                ...props,
            })
        },
    },
    'floatingIp.deallocate': {
        on({
            store,
            cluster,
            workspace,
            namespace,
            success,
            devops,
            data,
            ...props
        }) {
            const modal = Modal.open({
                onOk: () => {
                    store
                        .update({ cluster, workspace, namespace, devops, id: data.id })
                        .then(() => {
                            Modal.close(modal)
                            Notify.success({ content: t('RESOURCES_RELEASE_SUCCESSFULLY') })
                            success && success()
                        })
                },
                modal: ConfirmModal,
                title: t('RESOURCES_DEALLOCATE_FLOATING_IP'),
                desc: t('RESOURCES_RELEAGE_DESC'),
                module: store.module,
                store,
                cluster,
                namespace,
                ...props,
            })
        },
    },
    // 'floatingIp.edit': {
    //     on({ store, module, detail, cluster, workspace, namespace, success, devops, ...props }) {
    //         const modal = Modal.open({
    //             onOk: data => {
    //                 store
    //                     .update({ ...detail, ...cluster, workspace, namespace, devops, name: data.name }, data)
    //                     .then(() => {
    //                         Modal.close(modal)
    //                         Notify.success({ content: t('수정 되었습니다.') })
    //                         success && success()
    //                     })
    //             },
    //             title: '플로팅 IP 수정',
    //             modal: ModifyModal,
    //             store,
    //             detail,
    //             module,
    //             ...props,
    //         })
    //     },
    // },
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
                desc: t.html('RESOURCES_DELETE_FLOATING_IP_TIP', {
                    resource: detail.floating_ip,
                }),
                resource: detail.floating_ip,
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
            let arr = new Array
            store.dataList.map(obj => {
                if (rowKeys.includes(obj.id)) {
                    arr.push(obj.floating_ip)
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
                        ? t.html('RESOURCES_DELETE_FLOATING_IP_TIP', { resource: names })
                        : t.html('RESOURCES_DELETE_FLOATING_IP_TIP', { resource: names }),
                module: names,
                resource: names,
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
                        Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
                        success && success()
                    })
                },
                title: t('RESOURCES_DELETE_FLOATING_IP'),
                desc: t('RESOURCES_DELETE_DESC'),
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
