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

export default class ResourceStore extends Base {
  records = new List()

  module = 'clusters'

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/capk/clusters/${params.clustername}/nodepools/${
      params.name
    }`

  getListUrl = this.getResourceUrl

  // @action

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
    reqData.master_flavor = data.masterFlavor
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
    jsonData.cluster = reqData

    return await this.submitting(
      request.post(this.getListUrl(params), jsonData)
    )
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true
    const result = await request.get(`${this.getResourceUrl(params)}`)
    const detail = {
      ...params,
      ...this.mapper(result),
      kind: 'Nodepools',
    }

    await this.fetchDetailFlavor(params)

    this.detail = detail._originData
    this.isLoading = false
    return detail
  }

  @action
  async update({ name, ...params }, data) {
    return await this.submitting(
      request.put(this.getDetailUrl({ name: data.cluster.name }), data)
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
      )}/edgetron/resources/capk/clusters/${params.clustername}/nodepools/${
        params.name
      }`
    )
    const response = { ...params, ...this.mapper(result), kind: 'nodepool' }
    const dataArray = []
    const nodepool = response._originData.nodepool
    const flavorData = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/flavors/${nodepool.flavor}`
    )
    nodepool.flavor_detail = flavorData.flavor
    dataArray.push(nodepool)
    response._originData.lbs = dataArray

    this.nodepool = response._originData.nodepool

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

  @action
  async fetchListNodePools(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/capk/clusters/${params.name}/nodepools`
    )
    const response = { ...params, ...this.mapper(result), kind: 'nodepools' }
    const dataArray = []
    const promises = response._originData.nodepools.map(async nodepool => {
      const flavorData = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
          params
        )}/edgetron/resources/kubevirt/flavors/${nodepool.flavor}`
      )
      nodepool.flavor_detail = flavorData.flavor
      dataArray.push(nodepool)
    })
    await Promise.all(promises)
    response._originData.lbs = dataArray

    this.nodepools = response._originData.nodepools

    this.isLoading = false
    return this.nodepools
  }

  @action
  async createNodePool(data, params = {}) {
    const jsonData = {}
    const reqData = {}

    reqData.name = data.name
    reqData.kube_image = data.kube_image
    reqData.description = data.description
    reqData.flavor = data.flavor
    reqData.nodepool_replicas = data.nodepool_replicas
    reqData.autoscale = data.autoscale
    reqData.scale_range = data.scale_range
    jsonData.nodepool = reqData

    return await request.post(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/capk/clusters/${params.name}/nodepools`,
      jsonData
    )
  }

  @action
  async updateNodePool(data, params = {}) {
    const jsonData = {}
    const reqData = {}
    reqData.name = data.name
    reqData.description = data.description
    reqData.replicas = data.replicas
    reqData.autoscale = data.autoscale
    reqData.scale_range = data.scale_range
    jsonData.nodepool = reqData

    return await request.put(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/capk/clusters/${params.clustername}/nodepools/${
        params.name
      }`,
      jsonData
    )
  }

  @action
  async deleteNodePool(params = {}) {
    console.log(params)
    return await request.delete(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/capk/clusters/${params.clustername}/nodepools/${
        params.name
      }`
    )
  }
}
