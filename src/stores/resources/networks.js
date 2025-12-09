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

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}${this.getOditLogUrl(params)}/edgetron/resources/kubevirt/networks`
  getListUrl = this.getResourceUrl
  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}`
  getDeleteUrl = (params = {}) =>
    `${this.getListUrl(params)}/${params.name}/${params.project}`

  getPhysnetUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/kubevirt/physnets`

  getNodeUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/kubevirt/nodes`

  @action
  async create(data, params = {}) {
    if (data.network.type == 'FLAT') {
      delete data.network.segment_id
    } else {
      delete data.network.physnet_name
    }

    let res
    if (params.workspace) {
      res = await this.submitting(
        request.post(
          this.getResourceUrl({ ...params, name: data.network.name }),
          data
        )
      )
    } else {
      res = await this.submitting(request.post(this.getListUrl(params), data))
    }
    // this.afterChange(res, params)
    return res
  }

  @action
  async update(params, data) {
    const jsonData = {}
    jsonData.network = data

    await this.submitting(request.put(this.getDetailUrl(params), jsonData))
  }

  @action
  async fetchPhysnets(params) {
    this.isLoading = true

    const result = await request.get(`${this.getPhysnetUrl(params)}`)
    const physnets = { ...params, ...this.mapper(result), kind: 'Physnets' }
    this.physnets = physnets
    this.isLoading = false
    return physnets
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true
    const project = params.project ? params.project : params.namespace
    const result = await request.get(`${this.getDetailUrl(params)}`, {
      project,
    })
    const detail = { ...params, ...this.mapper(result), kind: 'Networks' }

    // Yaml 파일 관련
    await this.fetchYaml(params)

    this.detail = detail
    this.isLoading = false
    return detail
  }

  @action
  async fetchYaml(params) {
    this.isLoading = true
    const project = params.project ? params.project : params.namespace
    const result = await request.get(`${this.getDetailUrl(params)}/manifest`, {
      project,
    })
    const yamlData = { ...params, ...this.mapper(result), kind: 'Networks' }

    this.yaml = yamlData.manifest
    this.isLoading = false
    return yamlData
  }

  @action
  async fetchNodes(params) {
    this.isLoading = true
    const result = await request.get(`${this.getNodeUrl(params)}`)
    this.isLoading = false
    return result
  }

  @action
  async batchDelete({ rowKeys, ...params }) {
    const rowKeyDict = rowKeys.map(key => {
      if (key.includes('/')) {
        const [project, name] = key.split('/')
        return { project, name }
      } else {
        const project = params.namespace
        const name = key
        return { project, name }
      }
    })

    await this.submitting(
      Promise.all(
        rowKeyDict.map(rowKey =>
          request.delete(
            `${this.getDeleteUrl({
              name: rowKey.name,
              project: rowKey.project,
              ...params,
            })}`
          )
        )
      )
    )
    this.list.selectedRowKeys = []
  }

  @action
  delete(user) {
    if (user.name === globals.user.username) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
      return
    }

    return this.submitting(request.delete(`${this.getDeleteUrl(user)}`))
  }
}
