/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
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

import Base from '../basemm3'
import List from '../base.list'

export default class GpuNodeStore extends Base {
  records = new List()

  module = 'gpunodes'

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/kubevirt/gpunodes`

  getGpuNodeUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/kubevirt/gpu/node`

  getListUrl = this.getResourceUrl

  @action
  async fetchDetail(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}`
    )
    const detail = { ...params, ...this.mapper(result), kind: 'GpuNodes' }

    this.detail = detail

    // fetch GPU devices
    await this.fetchGpuDeviceList(params)

    // fetch MIG configs
    await this.fetchMigConfigs({ ...params, model: detail.gpunode.model })

    // fetch vGPU configs
    await this.fetchVgpuConfigs({ ...params, model: detail.gpunode.name })

    this.isLoading = false
    return detail
  }

  @action
  async fetchGpuDeviceList(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/gpu/devices/${params.name}`
    )
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'devices',
    }
    this.gpuDeviceList = response.devices
    return response
  }

  @action
  async fetchAcceleratorTypeList(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/accelerators`
    )
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'accelerator_types',
    }
    this.accelerator_types = response.accelerator_types

    return this.accelerator_types
  }

  @action
  async fetchMigConfigs(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/gpu/mig_configs/${params.model}`
    )
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'mig_configs',
    }
    this.migConfigList = response.mig_configs
    return response
  }

  @action
  async applyMigConfig(data, params) {
    const url = `${this.getGpuNodeUrl(params)}/mig/${data.node}`
    await this.submitting(request.put(url, data))
  }

  @action
  async fetchVgpuConfigs(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/gpu/vgpu_configs/${params.model}`
    )
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'vgpu_configs',
    }
    this.vgpuConfigList = response.vgpu_configs
    return response
  }

  @action
  async applyVgpuConfig(data, params) {
    const url = `${this.getGpuNodeUrl(params)}/vgpu/${data.node}`
    await this.submitting(request.put(url, data))
  }

  @action
  async configWorkloadType(data, params) {
    const url = `${this.getGpuNodeUrl(params)}/workload/${data.node}`
    await this.submitting(request.put(url, data))
  }
}
