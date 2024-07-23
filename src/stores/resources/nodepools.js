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

  @action
  async fetchNodePoolDetail(params) {
    this.isLoading = true

    const result = await request.get(`${this.getResourceUrl(params)}`)
    const nodepool = {
      ...params,
      ...this.mapper(result),
      kind: 'Nodepool',
    }

    this.nodepool = nodepool._originData.nodepool
    await this.fetchDetailFlavor(params)

    this.isLoading = false
    return nodepool
  }

  @action
  async fetchDetailFlavor(params) {
    this.isLoading = true

    const nodepool = this.nodepool
    const flavorData = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/flavors/${nodepool.flavor}`
    )

    nodepool.flavor_detail = flavorData.flavor
    this.nodepool = nodepool

    this.isLoading = false
    return nodepool
  }

  @action
  async fetchNodePoolNodes(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/capk/clusters/${params.clustername}/nodepools/${
        params.name
      }/nodes`
    )
    const response = { ...params, ...this.mapper(result), kind: 'nodes' }

    this.nodes = response._originData.nodes

    this.isLoading = false
    return this.nodes
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
    const promises = response._originData.nodepools.map(async nodepool => {
      const flavorData = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
          params
        )}/edgetron/resources/kubevirt/flavors/${nodepool.flavor}`
      )
      nodepool.flavor_detail = flavorData.flavor
    })
    await Promise.all(promises)

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
