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

import { observable, action } from 'mobx'
import { Notify } from '@kube-design/components'

import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class NetworkStore extends Base {

    records = new List()

    module = 'networks'

    getResourceUrl = (params = {}) => `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/networks`
    getListUrl = this.getResourceUrl
    getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.id}`

    @action
    async create(data, params = {}) {
        if (data.network.type == "FLAT") {
            delete data.network.segment_id
        }

        let res
        if (params.workspace) {
            res = await this.submitting(
                request.post(this.getResourceUrl(params), data)
            )
        } else {
            res = await this.submitting(request.post(this.getListUrl(params), data))
        }
        // this.afterChange(res, params)
        return res
    }
    @action
    async update({ id, ...params }, data) {
        const jsonData = {};
        jsonData.network = data;
        
        await this.submitting(
            request.put(this.getDetailUrl({ id, ...params }), jsonData)
        )
    }



    @action
    async fetchDetail(params) {
        this.isLoading = true

        const result = await request.get(
            `${this.getResourceUrl(params)}/${params.id}`
        )
        const detail = { ...params, ...this.mapper(result), kind: 'Networks' }

        // Yaml 파일 관련 
        await this.fetchYaml(params);

        this.detail = detail
        this.isLoading = false
        return detail
    }

    @action
    async fetchYaml(params) {
        this.isLoading = true

        const result = await request.get(
            `${this.getResourceUrl(params)}/${params.id}/manifest`
        )
        const yamlData = { ...params, ...this.mapper(result), kind: 'Networks' }

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
        // id로 삭제해야해서 치환
        user.name = user.id;
        if (user.name === globals.user.username) {
            Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
            return
        }

        return this.submitting(request.delete(`${this.getDetailUrl(user)}`))
    }

}
