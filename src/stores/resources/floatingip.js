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

export default class FloatingIpStore extends Base {
  records = new List()

  module = 'floating_ips'

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}${this.getOditLogUrl(params)}/edgetron/resources/kubevirt/floating_ips`
  getListUrl = this.getResourceUrl
  getDeleteUrl = (params = {}) =>
    `${this.getListUrl(params)}/${params.id}/${params.project}`

  @action
  async create(data, params = {}) {
    // console.log('floating ip create data', data)
    let res
    if (params.workspace) {
      res = await this.submitting(
        request.post(
          this.getResourceUrl({
            ...params,
            name: params.id,
            namespace: params.namespace
              ? params.namespace
              : data.floating_ip.project,
          }),
          data
        )
      )
    } else {
      res = this.submitting(request.post(this.getListUrl(params), data))
    }
    // this.afterChange(res, params)
    return res
  }

  @action
  async update({ ...params }) {
    const jsonData = {}
    jsonData.floating_ip = params

    await this.submitting(
      request.put(
        this.getDetailUrl({
          ...params,
          name: params.id,
          namespace: params.namespace ? params.namespace : params.project,
        }),
        jsonData
      )
    )
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}`
    )
    const detail = { ...params, ...this.mapper(result), kind: 'FloatingIp' }

    this.detail = detail
    this.isLoading = false
    return detail
  }

  @action
  async batchDelete({ projecyKeys, ...params }) {
    const rowKeyDict = projecyKeys.map(key => {
      if (key.includes('/')) {
        const [project, id] = key.split('/')
        return { project, id }
      } else {
        const project = params.namespace
        const id = key
        return { project, id }
      }
    })

    await this.submitting(
      Promise.all(
        rowKeyDict.map(rowKey =>
          request.delete(
            `${this.getDeleteUrl({
              id: rowKey.id,
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
    // 기본적으로 name == 삭제되는 파라미터 인데
    // floating ip 는 id로 삭제해야해서 치환
    user.name = user.id
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
  async networkList(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/networks`
    )
    return result
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
  @action
  async lbList(params = {}) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/lbs`
    )
    return result
  }
  @action
  async vmList(params = {}) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/vms`
    )
    let dataList = result?.vms || []
    return dataList
  }
  @action
  async fipList(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/floating_ips`
    )
    return result
  }
  @action
  async allAvailableIps(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/networks/available_ips`
    )
    return result
  }
}
