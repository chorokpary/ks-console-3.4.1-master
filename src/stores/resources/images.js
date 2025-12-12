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

import { action } from 'mobx'
import { Notify } from '@kube-design/components'

import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class ImageStore extends Base {
  records = new List()

  module = 'images'

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}${this.getOditLogUrl(params)}/edgetron/resources/kubevirt/images`

  getListUrl = this.getResourceUrl

  getPostUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/registrysecrets/${
      params.registrysecrets
    }/estk/edgetron/resources/kubevirt/images`

  @action
  async create(data, params = {}) {
    let res = await this.submitting(
      request.post(
        this.getPostUrl({
          ...params,
          registrysecrets: data.image.registrysecrets,
        }),
        data
      )
    )

    // this.afterChange(res, params)
    return res
  }

  @action
  async update({ name, ...params }, data) {
    const jsonData = {}
    jsonData.image = data

    await this.submitting(
      request.put(this.getDetailUrl({ name, ...params }), jsonData)
    )
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}`
    )
    const detail = { ...params, ...this.mapper(result), kind: 'Images' }

    // Yaml 파일 관련
    await this.fetchYaml(params)

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
    const yamlData = { ...params, ...this.mapper(result), kind: 'Images' }

    this.yaml = yamlData.manifest
    this.isLoading = false
    return yamlData
  }

  // @action
  // async update({ name, ...params }, data) {
  //   await this.submitting(
  //     request.put(this.getDetailUrl({ name, ...params }), data)
  //   )

  //   if (data.password && name === globals.user.username) {
  //     return await request.post('logout')
  //   }

  //   const lang = get(data, 'spec.lang')
  //   if (lang && data.lang !== cookie('lang')) {
  //     window.location.reload()
  //   }
  // }

  // @action
  // async modifyPassword({ name }, data) {
  //   return this.submitting(
  //     request.put(`${this.getDetailUrl({ name })}/password`, data)
  //   )
  // }

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
