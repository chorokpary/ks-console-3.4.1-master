/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2025 The KubeSphere Console Authors.
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

import { observable, action } from 'mobx'
import { Notify } from '@kube-design/components'

import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class NetworkStorageStore extends Base {
    records = new List()
        
    module = 'storage_configs'

    getResourceUrl = (params = {}) => `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/storage_configs`
    getListUrl = this.getResourceUrl
    getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}/${params.project}`

    @action
    async create(data, params = {}) {
        let res
        res = await this.submitting(request.post(this.getResourceUrl(params), data))
        return res
    }

    @action
    async update({ name, ...params }, data) {
        const jsonData = {};
        jsonData.config = data;
        
        await this.submitting(request.put(this.getResourceUrl(params), jsonData))
    }

    @action
    async fetchDetail(params) {
        this.isLoading = true

        console.log(params)

        const result = await request.get(
            `${this.getResourceUrl(params)}/${params.name}/${params.namespace}/info`
        )

        const detail = { ...params, ...this.mapper(result), kind: 'NetworkStorage' }

        await this.fetchYaml(params);

        this.detail = detail
        this.isLoading = false
        return detail
    }

    @action
    async fetchYaml(params) {
        this.isLoading = true

        const result = await request.get(
            `${this.getResourceUrl(params)}/${params.name}/${params.namespace}/manifest`
        )
        const yamlData = { ...params, ...this.mapper(result), kind: 'NetworkStorageManifest' }

        this.yaml = yamlData.manifest
        this.isLoading = false
        return yamlData
    }

    @action
    async batchDelete({ rowKeys, ...params }) {
        if (rowKeys.includes(globals.user.username)) {
            Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
        } else {
            await this.submitting(
                Promise.all(
                    rowKeys.map(id =>
                        request.delete(
                            `${this.getDetailUrl({ id, ...params })}`
                        )
                    )
                )
            )
        }
        this.list.selectedRowKeys = []
    }

    @action
    delete(user) {
        user.name = user.id;
        if (user.name === globals.user.username) {
            Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
            return
        }

        return this.submitting(request.delete(`${this.getDetailUrl(user)}`))
    }
}