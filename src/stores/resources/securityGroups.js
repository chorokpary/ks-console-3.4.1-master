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

import { get } from 'lodash'
import { observable, action } from 'mobx'
import { Notify } from '@kube-design/components'
import { LIST_DEFAULT_ORDER } from 'utils/constants'

import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class SecurityGroupStore extends Base {

  records = new List()

  module = 'security_groups'

  getResourceUrl = (params = {}) => `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/security_groups`
  getListUrl = this.getResourceUrl
  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}`
  getDeleteUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}/${params.project}`

  @action
  async create(data, params = {}) {

    let res = await this.submitting(request.post(this.getListUrl(params), data))
    if (res.message === "OK") {

      const jsonData = {};
      const promises = data.security_group.security_group_rules.map(async (obj) => {
        const data = {};
        data.security_group_id = res.id;
        data.direction = obj.direction.toLowerCase();
        data.remote_ip_prefix = obj.remoteIpPrefix.toLowerCase();
        data.protocol = obj.protocol.toLowerCase();
        data.port_range_min = obj.portRangeMin === null ? obj.portRangeMax : obj.portRangeMin
        data.port_range_max = obj.portRangeMax;

        data.ethernet_type = obj.ethernetType === "ALL" ? "all" : obj.ethernetType;

        jsonData.security_group_rule = data;

        await this.submitting(request.post(`kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/security_group_rules`, jsonData));
      })
      await Promise.all(promises);

    }
    return res
  }


  @action
  async fetchDetail(params) {
    this.isLoading = true
    const project = params.project ? params.project : params.namespace
    const result = await request.get(`${this.getDetailUrl(params)}`, {
      project,
    })
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
    const project = params.project ? params.project : params.namespace
    const result = await request.get(`${this.getDetailUrl(params)}/manifest`, {
      project,
    })
    const yamlData = { ...params, ...this.mapper(result), kind: 'SecurityGroups' }

    this.yaml = yamlData.manifest
    this.isLoading = false
    return yamlData
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
            `${this.getDeleteUrl({ name: rowKey.name, project: rowKey.project, ...params })}`
          )
        )
      )
    )
    this.list.selectedRowKeys = []
  }

  @action
  async delete(user) {
    if (user.name === globals.user.username) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
      return
    }

    return await this.submitting(request.delete(`${this.getDeleteUrl(user)}`))
  }

  @action
  async update({ ...params }, data) {

    let delOriginRule = data.security_group.originRules;
    const rules = data.security_group.rules;

    const jsonData = {};
    const promises = rules.map(async (obj) => {
      if (!obj.originRuleId) {
        const jData = {};
        jData.security_group_id = data.security_group.security_group_id;
        jData.direction = obj.direction.toLowerCase();
        jData.remote_ip_prefix = obj.remoteIpPrefix.toLowerCase();
        jData.protocol = obj.protocol.toLowerCase();
        jData.port_range_min = obj.portRangeMin === null ? obj.portRangeMax : obj.portRangeMin
        jData.port_range_max = obj.portRangeMax;
        jData.ethernet_type = obj.ethernetType === "ALL" ? "all" : obj.ethernetType;
        jsonData.security_group_rule = jData;

        await this.submitting(request.post(`kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/security_group_rules`, jsonData));
      } else {
        // 기존 rule 중 삭제건
        let idx = delOriginRule.indexOf(obj.originRuleId)
        if (idx > -1) delOriginRule.splice(idx, 1)
      }
    })
    await Promise.all(promises);

    if (delOriginRule.length > 0) {
      // 기존 rule 중 삭제건 처리
      await this.deleteSgRules({ ...params }, delOriginRule)
    }
  }


  @action
  async deleteSgRules({ ...params }, rules) {
    const promises = rules.map(async (id) => {
      await this.submitting(request.delete(`kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/security_group_rules/${id}`));
    })
    await Promise.all(promises);
  }

}
