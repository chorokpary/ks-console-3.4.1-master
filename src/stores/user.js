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
import { safeParseJSON } from 'utils'
import { LIST_DEFAULT_ORDER } from 'utils/constants'
import ObjectMapper from 'utils/object.mapper'
import cookie from 'utils/cookie'

import Base from './base'
import List from './base.list'

import moment from 'moment-mini'
import { getLocalTime } from 'utils';

import { getPasswordPolicy } from 'utils/passwordPattern'; 

export default class UsersStore extends Base {
  records = new List()

  ingroup = new List()

  notingroup = new List()

  @observable
  roles = []

  module = 'users'

  @observable showMenu = true

  @action
  handlechangeShowMenu(state) {
    this.showMenu = state
  }

  getPath({ cluster, workspace, namespace, devops } = {}) {
    let path = ''

    if (cluster) {
      path += `/klusters/${cluster}`
    }

    if (namespace) {
      return `${path}/namespaces/${namespace}`
    }

    if (devops) {
      return `${path}/devops/${devops}`
    }

    if (workspace) {
      return `/workspaces/${workspace}`
    }

    return path
  }

  getModule({ cluster, workspace, namespace, devops } = {}) {
    if (namespace || devops) {
      return 'members'
    }

    if (workspace) {
      return 'workspacemembers'
    }

    if (cluster) {
      return 'clustermembers'
    }

    return 'users'
  }

  getResourceUrl = (params = {}) =>
    `kapis/iam.kubesphere.io/v1alpha2${this.getPath(params)}/${this.getModule(
      params
    )}`

  getListUrl = this.getResourceUrl

  getAuthentikResourceUrl = '/api/v3/core/users/'

  @action
  async fetchList({
    cluster,
    workspace,
    namespace,
    more,
    devops,
    ...params
  } = {}) {
    this.list.isLoading = true

    if (!params.sortBy && params.ascending === undefined) {
      params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'createTime'
    }

    if (params.limit === Infinity || params.limit === -1) {
      params.limit = -1
      params.page = 1
    }

    params.limit = params.limit || 10

    const result = await request.get(
      this.getResourceUrl({ cluster, workspace, namespace, devops }),
      this.getFilterParams(params)
    )

    let data = (get(result, 'items') || []).map(item => ({
      cluster,
      namespace,
      ...this.mapper(item),
    }))
    
    if(globals.config.mfaUsed){
      // const resultMfa = await request.get(`/users/auth/mfa/list`)  
      // const mfaList = resultMfa.data.results

      const mfaList = [
                            {
                      "pk":75,
                      "username":"hong",
                      "name":"hong",
                      "is_active":true,
                      "last_login":null,
                      "date_joined":"2026-03-11T05:04:44.157465Z",
                      "is_superuser":false,
                      "groups":[
                      ],
                      "groups_obj":[
                      ],
                      "email":"hong@ntels.com",
                      "avatar":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiIHZpZXdCb3g9IjAgMCA2NCA2NCIgdmVyc2lvbj0iMS4xIj48cmVjdCBmaWxsPSIjOWQzZjhkIiBjeD0iMzIiIGN5PSIzMiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByPSIzMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBzdHlsZT0iY29sb3I6ICNmZmY7IGxpbmUtaGVpZ2h0OiAxOyBmb250LWZhbWlseTogJ1JlZEhhdFRleHQnLCdPdmVycGFzcycsb3ZlcnBhc3MsaGVsdmV0aWNhLGFyaWFsLHNhbnMtc2VyaWY7ICIgZmlsbD0iI2ZmZiIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSI0MDAiIGR5PSIuMWVtIj5ITzwvdGV4dD48L3N2Zz4=",
                      "attributes":{
                      "role":"platform-admin",
                      "description":"test"
                      },
                      "uid":"a68ecf7e4402d1aac4bbe34c8227de3545bbf33f0fc479478fc3be976264b452",
                      "path":"petasus.io",
                      "type":"internal",
                      "uuid":"74dc802b-ce68-45fd-b878-ed990d635f2c",
                      "password_change_date":"2026-03-11T05:04:45.006031Z",
                      "last_updated":"2026-03-11T05:04:45.283449Z"
                      },
                      {
                      "pk":9,
                      "username":"jaeyon",
                      "name":"jaeyon",
                      "is_active":true,
                      "last_login": "2025-12-29T23:56:51.775789Z",
                      "date_joined":"2025-11-12T11:25:19.765435Z",
                      "is_superuser":false,
                      "groups":[
                      ],
                      "groups_obj":[
                      ],
                      "email":"jaeyon@petasus.io",
                      "avatar":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiIHZpZXdCb3g9IjAgMCA2NCA2NCIgdmVyc2lvbj0iMS4xIj48cmVjdCBmaWxsPSIjNDk1NDYxIiBjeD0iMzIiIGN5PSIzMiIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByPSIzMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBzdHlsZT0iY29sb3I6ICNmZmY7IGxpbmUtaGVpZ2h0OiAxOyBmb250LWZhbWlseTogJ1JlZEhhdFRleHQnLCdPdmVycGFzcycsb3ZlcnBhc3MsaGVsdmV0aWNhLGFyaWFsLHNhbnMtc2VyaWY7ICIgZmlsbD0iI2ZmZiIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSI0MDAiIGR5PSIuMWVtIj5KQTwvdGV4dD48L3N2Zz4=",
                      "attributes":{
                      "role":"platform-admin"
                      },
                      "uid":"d88861c2355b1d7ca5594c1308c16515b2f18b1ff8dcf790f3d9616e6ce2f72e",
                      "path":"petasus.io",
                      "type":"internal",
                      "uuid":"647aad39-c1b8-4c50-ab9e-eb3aa38b03c8",
                      "password_change_date":"2025-11-12T11:27:36.941424Z",
                      "last_updated":"2025-11-12T11:27:37.099026Z"
                      },
      ] 

      const filterMfaList = mfaList.filter(user => user.last_login === null)
      .map(user => ({ 
        username: user.username,
        name: user.name,
        email: user.email,
        lastLoginTime: user.last_login,
        globalrole: user.attributes?.role,
        status: "notlogin",
        pk: user.pk
      }));

      const sumUserList = [
        ...data,
        ...filterMfaList.filter(b => !data.some(a => a.name === b.name))
      ].sort((a, b) => {
        if (a.lastLoginTime === null && b.lastLoginTime !== null) return -1
        if (a.lastLoginTime !== null && b.lastLoginTime === null) return 1
        return (a.name || '').localeCompare(b.name || '')
      })

      data = sumUserList
    }
    
    // console.log("data : "+ JSON.stringify(data))

    this.list.update({
      data: more ? [...this.list.data, ...data] : data,
      total: result.totalItems || result.total_count || data.length || 0,
      ...params,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    })

    // console.log(data)

    return data
  }

  @action
  async mfaCreate(data, params = {}) {
    const userData = {
      username: get(data, 'metadata.name', ''),
      name: get(data, 'metadata.name', ''),
      email: get(data, 'spec.email', ''),
      is_active: true,
      groups: [],
      path: data.isMfa ? 'petasus.io' : 'local-petasus.io',
      type: 'internal',
      attributes: {
        role: get(data, 'metadata.annotations["iam.kubesphere.io/globalrole"]'),
        description: get(
          data,
          'metadata.annotations["kubesphere.io/description"]'
        ),
      },
    }

    const mfaParams = {
      userData,
      password: { password: get(data, 'spec.password', '') },
    }

    const result = await this.submitting(
      request.post(`/users/auth/create/mfa`, mfaParams)
    )
    
    return result.success
  }

  @action
  async fetchRules({ name, ...params }) {
    let module = 'globalroles'
    if (params.namespace || params.devops) {
      module = 'roles'
    } else if (params.workspace) {
      module = 'workspaceroles'
    } else if (params.cluster) {
      module = 'clusterroles'
    }

    const resp = await request.get(
      `kapis/iam.kubesphere.io/v1alpha2${this.getPath(params)}/${this.getModule(
        params
      )}/${name}/${module}`,
      {},
      {},
      () => {}
    )

    let rules = {}
    resp &&
      resp.forEach(item => {
        const rule = safeParseJSON(
          get(
            item,
            "metadata.annotations['iam.kubesphere.io/role-template-rules']"
          ),
          {}
        )

        Object.keys(rule).forEach(key => {
          rules[key] = rules[key] || []
          if (isArray(rule[key])) {
            rules[key].push(...rule[key])
          } else {
            rules[key].push(rule[key])
          }
          rules[key] = uniq(rules[key])
        })
      })

    switch (module) {
      case 'globaleroles':
        set(globals.user, `globalRules`, rules)
        break
      case 'clusterroles': {
        const parentActions = globals.app.getActions({ module: 'clusters' })
        set(globals.user, `clusterRules[${params.cluster}]`, {
          ...rules,
          _: intersection(parentActions, ['view', 'manage']),
        })
        break
      }
      case 'workspaceroles': {
        if (params.workspace === globals.config.systemWorkspace) {
          set(globals.user, `workspaceRules[${params.workspace}]`, {
            ...globals.config.systemWorkspaceRules,
          })
          break
        }

        const parentActions = globals.app.getActions({ module: 'workspaces' })
        set(globals.user, `workspaceRules[${params.workspace}]`, {
          ...rules,
          _: intersection(parentActions, ['view', 'manage']),
        })
        break
      }
      case 'roles': {
        const obj = {}
        if (params.workspace) {
          obj.workspace = params.workspace
        } else if (params.cluster) {
          obj.cluster = params.cluster
        }

        if (params.namespace) {
          const parentActions = globals.app.getActions({
            ...obj,
            module: 'projects',
          })

          if (params.workspace === globals.config.systemWorkspace) {
            rules = { ...rules, ...globals.config.systemWorkspaceProjectRules }
          }

          set(
            globals.user,
            `projectRules[${params.cluster}][${params.namespace}]`,
            {
              ...rules,
              _: intersection(parentActions, ['view', 'manage']),
            }
          )
        } else if (params.devops) {
          const parentActions = globals.app.getActions({
            ...obj,
            module: 'devops',
          })

          set(
            globals.user,
            `devopsRules[${params.cluster}][${params.devops}]`,
            {
              ...rules,
              _: intersection(parentActions, ['view', 'manage']),
            }
          )
        }
        break
      }
      default:
    }
  }

  @action
  checkEmail(email) {
    return request.get(
      `${this.getListUrl()}`,
      { email },
      {
        headers: { 'x-check-exist': true },
      }
    )
  }

  @action
  async update({ name, ...params }, data) {
    await this.submitting(
      request.put(this.getDetailUrl({ name, ...params }), data)
    )

    if (data.password && name === globals.user.username) {
      const res = await request.post('logout')
      const url = get(res, 'data.url')
      if (url) {
        window.location.href = url
      }
    }

    const lang = get(data, 'spec.lang')
    if (lang && data.lang !== cookie('lang')) {
      window.location.reload()
    }
  }

  @action
  async jsonPatch({ name }, data) {
    await this.submitting(
      request.patch(`apis/iam.kubesphere.io/v1alpha2/users/${name}`, data, {
        headers: {
          'content-type': 'application/json-patch+json',
        },
      })
    )
  }

  @action
  async modifyPassword({ name }, data) {
    return this.submitting(
      request.put(`${this.getDetailUrl({ name })}/password`, data)
    )
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
  async batchChangeStatus(type) {
    const list = this.list.data.filter(item =>
      this.list.selectedRowKeys.includes(item.name)
    )
    const requestList = []

    list.forEach(item => {
      const formtemplate = {
        apiVersion: 'iam.kubesphere.io/v1alpha2',
        kind: 'User',
        ...get(item, '_originData', {}),
      }

      set(
        formtemplate,
        'status.state',
        type === 'active' ? 'Active' : 'Disabled'
      )

      set(formtemplate, 'metadata.resourceVersion', item.resourceVersion)

      requestList.push(
        request.put(this.getDetailUrl({ ...item }), formtemplate)
      )
    })

    await this.submitting(Promise.all(requestList))
    this.list.selectedRowKeys = []
  }

  @action
  async handlechangeStatus(item) {
    const data = {
      apiVersion: 'iam.kubesphere.io/v1alpha2',
      kind: 'User',
      ...get(item, '_originData', {}),
    }

    set(data, 'status.state', item.status === 'Active' ? 'Disabled' : 'Active')
    set(data, 'metadata.resourceVersion', item.resourceVersion)
    return await this.submitting(
      request.put(this.getDetailUrl({ ...item }), data)
    )
  }

  @action
  async delete(user) {
    if (user.name === globals.user.username) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
      return
    }

    const userList = await this.fetchList()
    const userDatga = userList.find(v => v.username === user.name);

    if (userDatga?.status === 'notlogin') {
      // authentik API 삭제 호출
      await request.delete(`/users/auth/mfa/delete/${user.pk}`)
    }else{      
      return this.submitting(request.delete(`${this.getDetailUrl(user)}`))
    }
  }

  @action
  async getUserDetail(name) {
    const result = await request.get(
      `kapis/iam.kubesphere.io/v1alpha2/users/${name}`,      
    )
    
    return result
  }

  @action
  async fetchLoginRecords({ name, ...params }) {
    this.records.isLoading = true

    if (params.limit === Infinity || params.limit === -1) {
      params.limit = -1
      params.page = 1
    }

    params.limit = params.limit || 10

    const result = await request.get(
      `kapis/iam.kubesphere.io/v1alpha2/users/${name}/loginrecords`,
      params
    )
    const data = result.items.map(ObjectMapper.default)

    this.records.update({
      data,
      total: result.totalItems || 0,
      ...params,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
    })
  }

  @action
  async confirm(data) {
    return await this.submitting(request.post(`login/confirm`, data))
  }

  @action
  async fetchGroupUser({ type, more, ...params } = {}) {
    this[type].isLoading = true
    if (!params.sortBy && params.ascending === undefined) {
      params.sortBy = 'createTime'
    }
    const result = await request.get(this.getResourceUrl(params), params)
    const data = get(result, 'items', []).map(item => ({
      ...this.mapper(item),
    }))

    this[type].update({
      data: more ? [...this[type].data, ...data] : data,
      total: result.totalItems || 0,
      ...params,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this[type].silent ? {} : { selectedRowKeys: [] }),
    })
    return data
  }

   @action
  async getUserPasswordExpireInfo() {

    const policyData = await getPasswordPolicy()
    const userData = await this.getUserDetail(globals.user.username)

    const identifyProvider = userData?.metadata?.labels?.['iam.kubesphere.io/identify-provider']
    const lastPasswordChangeTime = userData?.metadata?.annotations?.['iam.kubesphere.io/last-password-change-time']

    const isPetasusOidcUser = identifyProvider === 'petasus-oidc'

    let result = {}
    if (isPetasusOidcUser && lastPasswordChangeTime) {
        const noticeData = this.checkPasswordPolicy( lastPasswordChangeTime, Number(policyData.period), Number(policyData.notice) )
                
        if (noticeData.isExpired) {
          result.noticeData = noticeData
          result.showNotice = true
        }else if(noticeData.isChangedWithinPeriod){
          result.noticeData = noticeData.isNotice ? noticeData : {}
          result.showNotice = noticeData.isNotice ? true : false
        }
    }else{
      result.noticeData = {}
      result.showNotice = false
    }

    return result
  }

  checkPasswordPolicy  = (lastPasswordChangeTime, period, notice) => {  
        if (!lastPasswordChangeTime || !period || notice == null) {
            return {
                diffDays: 0,
                remainDays: period,
                isNotice: false,
                noticeOverDays: 0,
                isExpired: false,
                expiredDays: 0,
                isChangedWithinPeriod: false,
            }
        }

        const lastChangedAt = getLocalTime(lastPasswordChangeTime)
        const now = moment()

        // 변경 후 경과 일수
        const diffDays = now.startOf('day').diff(lastChangedAt.startOf('day'), 'days')

        // period 안에 변경했는지 여부 (오늘 포함)
        const isChangedWithinPeriod = diffDays <= period

        // 만료까지 남은 일 수 (음수 방지)
        const remainDays = Math.max(period - diffDays, 0)

        // 알림 시작 기준일
        const noticeStartDay = period - notice

        // 알림 여부
        const isNotice = diffDays >= noticeStartDay && diffDays < period
        const noticeOverDays = isNotice ? diffDays - noticeStartDay : 0

        // 만료 여부
        const isExpired = diffDays >= period
        const expiredDays = isExpired ? diffDays - period : 0

        return {
            diffDays,        // 변경 후 경과 일수
            remainDays,      // 만료까지 남은 일 수 (D-day
            isNotice,        // 알림 구간 진입 여부
            noticeOverDays,  // 알림 기준 초과 일수
            isExpired,       // 만료 여부
            expiredDays,     // 만료 후 경과 일수    
            isChangedWithinPeriod,    // period 이내 변경 여부    
        }
    }
}
