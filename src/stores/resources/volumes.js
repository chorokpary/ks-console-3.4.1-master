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

export default class VolumeStore extends Base {

  records = new List()

  module = 'volumes'

  getResourceUrl = (params = {}) => `edgetron/resources/kubevirt/volumes`
  getListUrl = this.getResourceUrl

  @action
  async create(data, params = {}) {
    const url = this.getResourceUrl(params);

    const jsonData = {};

    const res = await request.post(url, jsonData)
    return res
  }

  @action
  async update({ name, ...params }, data) {

    const jsonData = {};

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
    const detail = { ...params, ...this.mapper(result), kind: 'Volumes' }

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
    const yamlData = { ...params, ...this.mapper(result), kind: 'Keypairs' }
  
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

  @action
  async actionState({data, ...params}) {

    const jsonData = {};
    const actionData = {};

    const vmName = data.vmName;
    const volumeName = data.volumeName;

    if(data.actionType == "A"){
        actionData.vm_name = vmName;
        actionData.persist = true;
        actionData.action = "attach";
    }else{
        actionData.vm_name = vmName;
        actionData.action = "detach";
    }

    jsonData.action = actionData;
    
    // console.log("volumeName : "+ volumeName)
    // console.log("jsonData : "+ JSON.stringify(jsonData))

    await this.submitting(
      request.put(`${this.getDetailUrl({ name: data.volumeName, ...params })}/action`, jsonData)
    )
  }

}
