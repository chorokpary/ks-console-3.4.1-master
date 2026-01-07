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

export default class HostDeviceStore extends Base {
  records = new List()

  module = 'host_devices'

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}${this.getOditLogUrl(params)}/edgetron/resources/kubevirt/host_devices`

  getListUrl = this.getResourceUrl

  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.id}`

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
      params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'timestamp'
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

    // mm3 api 관련
    const mm3Array = [
      'vms',
      'images',
      'flavors',
      'networks',
      'routers',
      'floating_ips',
      'lbs',
      'security_groups',
      'keypairs',
      'host_devices',
      'pci_devices',
      'volumes',
      'clusters',
      'workspaces',
      'licenses',
      'distro_types',
    ]
    const apiName = mm3Array.includes(this.module) ? this.module : ''

    const data = (get(result, apiName) || []).map(item => ({
      cluster,
      namespace,
      ...this.mapper(item),
    }))

    // ID값으로 이름 셋팅
    const dataArray = []
    const pciData = await this.fetchListPciDevices({ cluster, namespace })
    data.forEach(device => {
      pciData.pci_devices.forEach(pci => {
        if (device.vendor_id === pci.vendor_id) {
          device.vendor_name = pci.vendor_name
        }
        if (device.product_id === pci.device_id) {
          device.product_name = pci.device_name
        }
      })
      dataArray.push(device)
    })

    // 초기 데이터 처리
    this.dataList = dataArray

    // 검색 관련 처리
    const exceptionArray = ['page', 'limit', 'sortBy', 'ascending']
    const searchArray = Object.keys(params)
      .map(key => {
        const value = params[key]
        const searchData = {
          searchKeywordType: key,
          searchKeywordText: value,
        }
        return searchData
      })
      .filter(row => exceptionArray.includes(row.searchKeywordType) === false)

    this.searchList = this.dataList
    if (searchArray.length > 0) {
      searchArray.forEach(search => {
        this.searchList = this.searchList.filter(row => {
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
      this.dataList = this.searchList
    }

    // 정렬 처리
    const sortType = params.ascending ? 'asc' : 'desc'
    this.dataList.sort((a, b) => {
      const x = a[params.sortBy]
      const y = b[params.sortBy]
      if (sortType === 'desc') {
        return x > y ? -1 : x < y ? 1 : 0
      }
      return x < y ? -1 : x > y ? 1 : 0
    })

    // mm3 데이터 page 별 Slice 처리
    const perPage = Number(params.limit) || 10
    const currentPage = Number(params.page) || 1
    const mm3SliceData = this.dataList.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
    )

    this.list.update({
      data: more ? [...this.list.data, ...mm3SliceData] : mm3SliceData,
      total:
        result.totalItems || result.total_count || this.dataList.length || 0,
      ...params,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    })

    return data
  }

  @action
  async create(data, params = {}) {
    const jsonData = {}
    const hostDeviceData = {}
    let res = {}
    const promises = data.hostDevices.map(async hostDevice => {
      hostDeviceData.name = hostDevice.name
      hostDeviceData.vendor_id = hostDevice.vendor_id
      hostDeviceData.product_id = hostDevice.device_id
      hostDeviceData.is_external = hostDevice.is_external
      hostDeviceData.is_gpu = hostDevice.is_gpu
      hostDeviceData.is_net = hostDevice.is_net
      hostDeviceData.description = ''

      jsonData.host_device = hostDeviceData

      res = await this.submitting(
        request.post(this.getListUrl(params), jsonData)
      )
    })
    await Promise.all(promises)

    return res
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}`
    )
    const detail = { ...params, ...this.mapper(result), kind: 'HostDevices' }
    const pciData = await this.fetchListPciDevices({ ...params })

    pciData.pci_devices.forEach(pci => {
      if (detail.host_device.vendor_id === pci.vendor_id) {
        detail.host_device.vendor_name = pci.vendor_name
      }
      if (detail.host_device.product_id === pci.device_id) {
        detail.host_device.product_name = pci.device_name
      }
    })

    // Yaml 파일 관련
    await this.fetchYaml(params)

    this.detail = detail
    this.isLoading = false
    return detail
  }

  @action
  async fetchYaml(params) {
    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}/manifest`
    )
    const yamlData = { ...params, ...this.mapper(result), kind: 'HostDevices' }

    this.yaml = yamlData.manifest
    return yamlData
  }

  @action
  async update({ id, ...params }, data) {
    const jsonData = {}
    jsonData.host_device = data

    await this.submitting(
      request.put(this.getDetailUrl({ id, ...params, name: id }), jsonData)
    )
  }

  @action
  async batchDelete({ rowKeys, ...params }) {
    if (rowKeys.includes(globals.user.username)) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
    } else {
      await this.submitting(
        Promise.all(
          rowKeys.forEach(id => {
            request.delete(`${this.getDetailUrl({ id, ...params, name: id })}`)
          })
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
    return this.submitting(
      request.delete(`${this.getDetailUrl({ ...user, name: user.id })}`)
    )
  }

  // 등록 관련 데이터
  @action
  async fetchListPciDevices(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/pci_devices`
    )
    const response = { ...params, ...this.mapper(result), kind: 'pciDevices' }

    return response
  }
}
