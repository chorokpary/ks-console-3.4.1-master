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

export default class LoadBalancerStore extends Base {
  records = new List()

  networkDataList = []
  floatingIpsList = []

  module = 'lbs'

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}${this.getOditLogUrl(params)}/edgetron/resources/kubevirt/lbs`
  getListUrl = this.getResourceUrl
  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}`
  getDeleteUrl = (params = {}) =>
    `${this.getListUrl(params)}/${params.name}/${params.project}`

  @action
  async create(data, params = {}) {
    return this.submitting(
      request.post(
        this.getListUrl({
          ...params,
          name: data.lb.name,
          namespace: params.namespace || data.lb.project,
        }),
        data
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
    const detail = { ...params, ...this.mapper(result), kind: 'LoadBalancers' }

    await this.fetchYaml(params)
    await this.fetchFloatingList(params)

    this.detail = detail
    this.isLoading = false
    return detail
  }

  @action
  async fetchDetailLbs(params) {
    this.isLoading = true
    const project = params.project ? params.project : params.namespace
    const result = await request.get(`${this.getDetailUrl(params)}`, {
      project,
    })
    const detail = { ...params, ...this.mapper(result), kind: 'LoadBalancers' }

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
  async update(params, data) {
    return this.submitting(
      request.put(
        this.getDetailUrl({
          ...params,
          name: params.name,
          namespace: params.namespace || data.lb.project,
        }),
        data
      )
    )
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
              namespace: params.namespace ? params.namespace : rowKey.project,
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
  async fetchFloatingList(params) {
    this.isLoading = true
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/floating_ips`
    )

    let dataList = result?.floating_ips || []
    this.floatingIpsList = dataList
    this.isLoading = false

    return dataList
  }

  @action
  async fetchNetworkList(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/networks`
    )
    this.networkDataList = result.networks

    this.isLoading = false

    return this.networkDataList
  }

  @action
  async fetchVmList(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/vms`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vms' }

    this.isLoading = false
    return response
  }

  @action
  async routerList(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/routers`
    )
    return result
  }
}
