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

import { get, set, uniq, isArray, intersection } from 'lodash'
import { observable, action } from 'mobx'
import { Notify } from '@kube-design/components'
import { LIST_DEFAULT_ORDER } from 'utils/constants'
import ObjectMapper from 'utils/object.mapper'
import cookie from 'utils/cookie'


import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class SecurityGroupStore extends Base {

    records = new List()

    module = 'security_groups'

    getResourceUrl = (params = {}) => `edgetron/resources/kubevirt/security_groups`
    getListUrl = this.getResourceUrl


    @action
    async create(data, params = {}) {

        let res = await this.submitting(request.post(this.getListUrl(params), data))

        return res
    }


    @action
    async fetchDetail(params) {
        this.isLoading = true

        const result = await request.get(
            `${this.getResourceUrl(params)}/${params.name}`
        )
        const detail = { ...params, ...this.mapper(result), kind: 'SecurityGroups' }

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
            `${this.getResourceUrl(params)}/${params.name}/manifest`
        )
        const yamlData = { ...params, ...this.mapper(result), kind: 'SecurityGroups' }

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
                    rowKeys.map(username =>
                        request.delete(
                            `${this.getDetailUrl({ name: username, ...params })}`
                        )
                    )
                )
            )
        }
        this.list.selectedRowKeys = []
    }

    @action
    delete(user) {
        if (user.name === globals.user.username) {
            Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
            return
        }

        return this.submitting(request.delete(`${this.getDetailUrl(user)}`))
    }

}
