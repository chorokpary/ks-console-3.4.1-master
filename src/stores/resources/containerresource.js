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
import { action } from 'mobx'
import { Notify } from '@kube-design/components'

import { LIST_DEFAULT_ORDER } from 'utils/constants'
import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class ResourceStore extends Base {
  records = new List()

  module = 'clusters'

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/capk/clusters`

  getListUrl = this.getResourceUrl

  getPaginatedUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/capk/clusters/paged/${params.page}/${params.limit}`

  @action
  async fetchList({
    cluster,
    workspace,
    namespace,
    more,
    devops,
    silent,
    ...params
  } = {}) {
    if (!silent) {
      this.list.isLoading = true
    }

    if (!params.sortBy && params.ascending === undefined) {
      params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'timestamp'
    }

    if (params.limit === Infinity || params.limit === -1) {
      params.limit = -1
      params.page = 1
    }

    params.page = params.page || 1
    params.limit = params.limit || 10

    const page = params.page
    const limit = params.limit

    const result = await request.get(
      this.getPaginatedUrl({
        cluster,
        workspace,
        namespace,
        devops,
        page,
        limit,
      }),
      this.getFilterParams(params)
    )

    this.dataList = (get(result, 'clusters') || []).map(item => ({
      cluster,
      namespace,
      ...item,
    }))

    const total = get(result, 'total') || 0

    // 검색 관련 처리
    const exceptionArray = ['page', 'limit', 'sortBy', 'ascending']
    const searchArray = Object.keys(params)
      .map(key => {
        const value = params[key]
        return {
          searchKeywordType: key,
          searchKeywordText: value,
        }
      })
      .filter(row => exceptionArray.includes(row.searchKeywordType) === false)

    if (searchArray.length > 0) {
      // eslint-disable-next-line array-callback-return
      searchArray.map(search => {
        this.dataList = this.dataList.filter(row => {
          if (typeof row[search.searchKeywordType] === 'boolean') {
            return (row[search.searchKeywordType]
              ? 'Ready'
              : 'Not-ready'
            ).includes(search.searchKeywordText)
          }
          if (search.searchKeywordType === 'project') {
            return (
              row[search.searchKeywordType]?.toLowerCase() ===
              search.searchKeywordText.toLowerCase()
            )
          }
          return row[search.searchKeywordType]
            ?.toLowerCase()
            .includes(search.searchKeywordText.toLowerCase())
        })
      })
    }

    // 정렬 처리
    const sortType = params.ascending ? 'asc' : 'desc'
    // eslint-disable-next-line array-callback-return
    this.dataList.sort((a, b) => {
      const x = a[params.sortBy]
      const y = b[params.sortBy]
      if (sortType === 'desc') {
        return x > y ? -1 : x < y ? 1 : 0
      }
      if (sortType === 'asc') {
        return x < y ? -1 : x > y ? 1 : 0
      }
    })

    this.list.update({
      data: more ? [...this.list.data, ...this.dataList] : this.dataList,
      total,
      ...params,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    })

    return this.dataList
  }

  @action
  async create(data, params = {}) {
    const jsonData = {}
    const reqData = {}
    reqData.external_network = data.external_network
    reqData.sriov_network = data.sriov_network
    reqData.elb_network = data.elb_network
    reqData.elb_type = data.elb_type.toLowerCase()

    reqData.name = data.name
    reqData.kube_image = data.image
    reqData.description = data.description
    reqData.master_number = data.master_number
    reqData.worker_number = data.worker_number
    reqData.worker_autoscale = data.worker_autoscale
    reqData.worker_scale_range = data.worker_scale_range
    if (data.cni) reqData.cni = data.cni.toLowerCase()
    reqData.csi = data.csi.toLowerCase()
    reqData.ui = 'kubesphere'
    reqData.features = data.features
    reqData.expiration = data.expiration
    reqData.private_registry = data.private_registry
    reqData.secure_boot = data.secure_boot
    jsonData.cluster = reqData

    return await this.submitting(
      request.post(this.getListUrl(params), jsonData)
    )
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true
    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}`
    )
    const detail = {
      ...params,
      ...this.mapper(result),
      kind: 'ContainerResource',
    }

    // Yaml 파일 관련
    await this.fetchYaml(params)

    await this.fetchDetailFlavor(params)
    await this.fetchResourceConfig(params)

    this.detail = detail._originData
    this.isLoading = false
    return detail
  }

  @action
  async fetchYaml(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}/manifest`
    )
    const yamlData = {
      ...params,
      ...this.mapper(result),
      kind: 'ContainerResource',
    }

    this.yaml = yamlData._originData.manifest

    this.isLoading = false
    return yamlData
  }

  @action
  async fetchResourceConfig(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}/config`
    )
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'ContainerResource',
    }

    this.resourceConfig = response._originData.config
    this.isLoading = false
    return response
  }

  @action
  // eslint-disable-next-line no-unused-vars
  async update({ name, ...params }, data) {
    return await this.submitting(
      request.put(this.getDetailUrl({ name: data.cluster_obj.name }), data)
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
  delete(user) {
    if (user.name === globals.user.username) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
      return
    }

    return this.submitting(request.delete(`${this.getDetailUrl(user)}`))
  }

  // 등록 관련 데이터 시작
  @action
  async fetchListImage(params) {
    this.isLoading = true
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/capk/images`
    )
    const response = { ...params, ...this.mapper(result), kind: 'images' }

    this.isLoading = false
    return response
  }

  @action
  async fetchListLoadBalancer(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/lbs`
    )

    const response = { ...params, ...this.mapper(result), kind: 'lbs' }

    const dataArray = []
    const promises = response._originData.lbs.map(async lb => {
      const lbDetail = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
          params
        )}/edgetron/resources/kubevirt/lbs/${lb.id}`
      )
      lb.rulesCount = lbDetail.lb.rules.length
      dataArray.push(lb)
    })
    await Promise.all(promises)
    response._originData.lbs = dataArray

    this.isLoading = false
    return response
  }

  @action
  async fetchDetailFlavor(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/capk/clusters/${params.name}/machines`
    )
    const response = { ...params, ...this.mapper(result), kind: 'machines' }
    const dataArray = []
    const promises = response._originData.machines.map(async machine => {
      const flavorData = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
          params
        )}/edgetron/resources/kubevirt/flavors/${machine.flavor}`
      )
      machine.flavor_detail = flavorData.flavor
      dataArray.push(machine)
    })
    await Promise.all(promises)
    response._originData.lbs = dataArray

    this.machines = response._originData.machines

    this.isLoading = false
    return response
  }

  @action
  async fetchMachines(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/capk/clusters/${params.name}/machines`
    )
    const response = { ...params, ...this.mapper(result), kind: 'machines' }

    this.machines = response._originData.machines

    this.isLoading = false
    return response
  }

  @action
  async fetchMachinesAll(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/capk/machines`
    )
    const response = { ...params, ...this.mapper(result), kind: 'machines' }

    this.machines = response._originData.machines

    this.isLoading = false
    return this.machines
  }
}
