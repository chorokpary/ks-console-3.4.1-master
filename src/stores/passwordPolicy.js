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

import yaml from 'js-yaml'
import Base from './base'
import List from './base.list'

export default class PasswordPolicyStore extends Base {
  records = new List()

  module = 'passwordpolicy'

  moduel_configMap = 'configmaps'

  getListUrl = (params = {}) =>
    `api/v1/${this.getPath(params)}/${this.moduel_configMap}`

  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}`

  getPasswordApiUrl = () =>
    `/kapis/config.kubesphere.io/v1alpha2/namespaces/default/policy/password-policy-config`

  @action
  async createPasswordPolicy() {
    const data = {
      data: {
        policy: `{\n \"minLength\": \"8\",\n \"maxLength\": \"64\",\n \"uppercaseCount\": \"1\",\n \"lowercaseCount\": 1,\n \"minNum\": 1,\n \"special\": \"1\",\n \"symbol\": \"(!@#$%^&*(-_=+\\\\|[{}];:', <.>/?)\",\n \"period\": 10,\n \"notice\": 7,\n \"errorMessage\": \"${t(
          'PASSWORD_DESC'
        )}\"\n}`,
      },
    }

    const result = await request.put(this.getPasswordApiUrl(), data)
    return result
  }

  @action
  async update(data) {
    const dataObject = {}
    dataObject['data'] = {}

    // 변경 데이터 추가
    dataObject['data']['policy'] = JSON.stringify(data, null, 2)

    try {
      const res = await this.submitting(
        request.put(this.getPasswordApiUrl(), dataObject)
      )

      return res
    } catch (err) {
      return { success: false }
    }
  }

  @action
  async getPasswordPolicy() {
    const passwordPolicyData = await request.get(this.getPasswordApiUrl())
    const policyString = get(passwordPolicyData, ['data', 'policy'])

    if (!passwordPolicyData) {
      const createResult = await this.createPasswordPolicy()
      const createPolicyString = get(createResult, ['data', 'policy'])
      return yaml.load(createPolicyString)
    }

    return yaml.load(policyString)
  }
}
