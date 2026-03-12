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

export default class SriovStore extends Base {
  records = new List()

  module = 'sriovs'

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}${this.getOditLogUrl(params)}/edgetron/resources/kubevirt/sriov_networks`
  getListUrl = this.getResourceUrl

  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}`

  getDeleteUrl = (params = {}) =>
    `${this.getListUrl(params)}/${params.name}/${params.project}`

  @action
  async create(data, params = {}) {
    const url = this.getResourceUrl({
      ...params,
      name: data.name,
      namespace: params.namesapce ? params.namespace : data.project,
    })

    if (data.type == 'flat') {
      delete data.segment_id
    }

    const jsonData = {}
    const networkData = {}

    networkData.name = data.name
    networkData.resource_name = data.resource_name
    networkData.description = data.description
    networkData.type = data.type
    networkData.cidr = data.cidr
    networkData.gateway_ip = data.gateway_ip
    networkData.ip_pool = data.ip_pool
    networkData.dns = data.dns
    networkData.project = data.project
    networkData.mtu = data.mtu
    networkData.host_routes = data.host_routes
    networkData.segment_id = data.segment_id

    jsonData.network = networkData

    const res = await this.submitting(request.post(url, jsonData))
    return res
  }

  @action
  async update({ name, ...params }, data) {
    const jsonData = {}
    jsonData.network = data

    await this.submitting(
      request.put(
        this.getDetailUrl({
          name,
          ...params,
          namespace: params.namespace ? params.namespace : data.project,
        }),
        jsonData
      )
    )
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true
    const project = params.project ? params.project : params.namespace
    const result = await request.get(`${this.getDetailUrl(params)}`, {
      project,
    })
    const detail = { ...params, ...this.mapper(result), kind: 'Sriov' }

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
    const yamlData = { ...params, ...this.mapper(result), kind: 'Sriov' }

    this.yaml = yamlData.manifest
    this.isLoading = false
    return yamlData
  }

  @action
  async batchDelete({ rowKeys, ...params }) {
    if (rowKeys.includes(globals.user.username)) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
    } else {
      const rowKeyDict = rowKeys.map(key => {
        if (key.includes('/')) {
          const [project, name] = key.split('/')
          return { project, name }
        }
        const project = params.namespace
        const name = key
        return { project, name }
      })

      await this.submitting(
        Promise.all(
          rowKeyDict.map(rowKey =>
            request.delete(
              `${this.getDeleteUrl({
                name: rowKey.name,
                namespace: rowKey.project,
                project: rowKey.project,
                ...params,
              })}`
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

    return this.submitting(
      request.delete(
        `${this.getDeleteUrl({
          ...user,
          namespace: user.namespace ? user.namespace : user.project,
        })}`
      )
    )
  }

  @action
  async fetchSriovResourceList(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/sriov_resources`
    )
    // console.log("result : "+ JSON.stringify(result))
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'sriov_resources',
    }

    this.isLoading = false
    return response
  }

  @action
  async fetchSriovBondList(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/sriov_resources`
    )
    // console.log("bond : "+ JSON.stringify(result))
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'sriov_resources',
    }

    this.isLoading = false
    return response
  }

  @action
  async fetchSriovVfs({ resourceName, ...params }) {
    this.isLoading = true

    const url = `${this.getResourceUrl(params)}/${resourceName}/number_of_vfs`
    const result = await request.get(url)

    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'sriov_resources',
    }

    this.isLoading = false
    return response
  }
}
