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

import { get, isEmpty } from 'lodash'
import { Notify } from '@kube-design/components'
import { Modal } from 'components/Base'
import DeleteModal from 'components/Modals/Delete'
import DetailModal from 'clusters/containers/Resources/components/Modals/ClusterFault/Detail'
import RegistModal from 'clusters/containers/Resources/components/Modals/ClusterFault/Regist'
import ConfirmModal from 'clusters/containers/Resources/components/Modals/Confirm'
import FORM_TEMPLATES from 'utils/form.templates'

export default {
    'clusterfault.detail': {
        on({ store, cluster, workspace, namespace, ...props }) {
            const modal = Modal.open({
                title: t('RESOURCES_CLUSTER_FAULT_SOLUTION_DETAIL'),
                modal: DetailModal,
                store,
                cluster,
                workspace,
                namespace,
                ...props,
            })
        },
    },
    'clusterfault.regist': {
        on({ store, cluster, workspace, namespace, success, ...props }) {
            const modal = Modal.open({
                title: t('RESOURCES_CLUSTER_FAULT_TITLE') + ' ' + t('RESOURCES_CLUSTER_FAULT_SET'),
                onOk: data => {
                    data.operator === 'openai' ?
                        store
                            .createOpenAi(data)
                            .then((res) => {
                                Modal.close(modal)
                                Notify.success({ content: t('CREATE_SUCCESSFUL') })
                                success && success()
                            })
                        :
                        store.createLocalAi(data).then(() => {
                            Modal.close(modal)
                            Notify.success({ content: t('CREATE_SUCCESSFUL') })
                            success && success()
                        })
                },
                modal: RegistModal,
                store,
                cluster,
                workspace,
                namespace,
                ...props,
            })
        },
    },
    'clusterfault.delete': {
        on({ store, cluster, workspace, namespace, success, activeCr, name, ...props }) {
            const modal = Modal.open({
                onOk: () => {
                    store.deleteCr({ name, activeCr }).then(() => {
                        Modal.close(modal)
                        Notify.success({ content: t('RESOURCES_DELETE_SUCCESSFUL') })
                        success && success()
                    })
                },
                title: t('Operator 삭제'),
                desc: t.html('RESOURCES_DELETE_CR_TIP', { resource: name }),
                resource: name,
                modal: DeleteModal,
                store,
                cluster,
                workspace,
                namespace,
                ...props,
            })
        },
    },
    'clusterfault.activateCr': {
        on({ store, cluster, workspace, namespace, activeCr, item, success, name, ...props }) {
            const modal = Modal.open({
                onOk: () => {
                    store.activateCr({ ...item, activeCr }).then(() => {
                        Modal.close(modal)
                        Notify.success({ content: t('Operator 사용 대상이 설정되었습니다.') })
                        success && success()
                    })
                },
                title: t('사용 대상 설정'),
                desc: t.html('RESOURCES_ACTIVATE_CR', { resource: name }),
                modal: ConfirmModal,
                store,
                cluster,
                workspace,
                namespace,
                ...props,
            })
        },
    },
}
