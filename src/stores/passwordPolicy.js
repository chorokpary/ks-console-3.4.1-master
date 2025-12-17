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

  @action
  async createPasswordPolicy() {

    const configMapParams = {
      namespace: 'default',
      name: 'password-policy-config',
    }

    const data = {
          "apiVersion":"v1",
          "kind":"ConfigMap",
          "metadata":{
            "namespace":"default",
            "labels":{
            },
            "name":"password-policy-config",
            "annotations":{
                "kubesphere.io/creator":"admin"
            }
          },
          "spec":{
            "template":{
              "metadata":{
                "labels":{
                },
                "annotations":{
                  "kubesphere.io/creator":"admin"
                }
              }
            }
          },
          "data":{
            "policy":"{\n \"minLength\": \"8\",\n \"maxLength\": \"64\",\n \"uppercaseCount\": \"1\",\n \"lowercaseCount\": 1,\n \"minNum\": 1,\n \"special\": \"1\",\n \"symbol\": \"(!@#$%^&*(-_=+\\\\|[{}];:', <.>/?)\",\n \"period\": 10,\n \"notice\": 7,\n \"errorMessage\": \"비밀번호에는 숫자 1개 이상, 소문자 1개 이상, 대문자 1개 이상, 특수 문자 1개 이상((!@#$%^&*(-_=+\\\\|[{}];:', <.>/?))이(가) 포함되어야 합니다. 길이는 8자에서 64자 사이여야 합니다.\"\n}"
            }
          }

    const result = await request.post(this.getListUrl(configMapParams),  data)
    return result
  }

  @action
  async update(data) {

    const configMapParams = {
      namespace: 'default',
      name: 'password-policy-config',
    }

    // 원본 데이터 가져오기
    const resultConfigMap = await request.get(
      this.getDetailUrl(configMapParams)
    )

    // config.yaml 추출
    const dataObject = get(resultConfigMap, ['data'])

    // 기존 데이터 삭제
    delete dataObject['policy']

    // 변경 데이터 추가
    dataObject['policy'] = JSON.stringify(data, null, 2)

    try {
      const res = await this.submitting(
        request.put(this.getDetailUrl(configMapParams), resultConfigMap)
      )
      return res
    } catch (err) {
      return { success: false }
    }
  }

  @action
  async getPasswordPolicy() {

    const configMapList = await request.get(`/api/v1/namespaces/default/configmaps`)
    const exists = configMapList.items.some(
      item => item?.metadata?.name === 'password-policy-config'
    )

    if (!exists) {
      const createResult = await this.createPasswordPolicy()
      const yamlString = get(createResult, ['data', 'policy'])
      return yaml.load(yamlString)
    }

    const configMapParams = {
      namespace: 'default',
      name: 'password-policy-config',
    }

    const resultConfigMap = await request.get(
      this.getDetailUrl(configMapParams),
    )

    const yamlString = get(resultConfigMap, ['data', 'policy'])
    return yaml.load(yamlString)   
  }

}
