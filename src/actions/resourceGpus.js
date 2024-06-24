/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
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

import { Modal } from 'components/Base'
import { Notify } from '@kube-design/components'

import ApplyMigModal from 'clusters/containers/Resources/components/Modals/GpuNodes/ApplyMig'
import ConfigWorkloadModal from 'clusters/containers/Resources/components/Modals/GpuNodes/ConfigWorkload'

export default {
    'gpu.applyMig': {
        on({ store, cluster, success, ...props }) {
            const modal = Modal.open({
                onOk: data => {
		    store.applyMigConfig(data, { cluster })
		    .then(() => {
		      Modal.close(modal)
                      Notify.success({ content: t('RESOURCES_APPLY_SUCCESS_DESC') })
                      success && success()
		    })
                },
                title: t('RESOURCES_GPU_MIG_CONFIG'),
                modal: ApplyMigModal,
                store,
                ...props,
            })
        },
    },
    'gpu.configWorkload': {
        on({ store, cluster, success, ...props }) {
            const modal = Modal.open({
                onOk: data => {
                    store.configWorkloadType(data, { cluster })
                    .then(() => {
                      Modal.close(modal)
                      Notify.success({ content: t('RESOURCES_CONFIG_SUCCESS_DESC') })
                      success && success()
                    })
                },
                title: t('RESOURCES_GPU_WORKLOAD_CONFIG'),
                modal: ConfigWorkloadModal,
                store,
                ...props,
            })
        },
    },
}
