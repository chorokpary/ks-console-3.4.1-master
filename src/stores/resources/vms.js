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

export default class VmStore extends Base {
  records = new List()

  module = 'vms'

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/kubevirt/vms`

  getListUrl = this.getResourceUrl

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
      'containerimages',
      'resourcesvolumes',
    ]
    const apiName = mm3Array.includes(this.module) ? this.module : ''

    const data = (get(result, apiName) || []).map(item => ({
      cluster,
      namespace,
      ...this.mapper(item),
    }))

    // 초기 정렬 처리
    data.sort((a, b) => {
      return a.creation_timestamp < b.creation_timestamp
        ? 1
        : a.creation_timestamp > b.creation_timestamp
        ? -1
        : 0
    })

    // 초기 데이터 처리
    this.dataList = data

    // FloatingIp List 추출
    await this.fetchFloatingList({ cluster, namespace })

    // Network List 추출
    await this.fetchVmListNetwork({ cluster, namespace })

    // namespace(project) 있는 경우
    if (namespace) {
      params.project = namespace
    }

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

    this.searchList = this.dataList
    if (searchArray.length > 0) {
      searchArray.forEach(search => {
        this.searchList = this.searchList.filter(row => {
          if (
            search.searchKeywordType === 'project' &&
            search.searchKeywordText !== ''
          ) {
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

    // console.log(this.dataList)

    return this.dataList
  }

  @action
  async create(data, params = {}) {
    const url = this.getResourceUrl(params)

    const jsonData = {}
    const resourceData = {}

    resourceData.project = data.project
    resourceData.name = data.name
    resourceData.image = data.imageType === 'I' ? data.image : ''
    resourceData.flavor = data.flavor
    resourceData.keypair = data.keypair
    // resourceData.pre_installed_app = data.preInstalledApp

    // 값 전달 시 invalid_boot_volume 오류 발생
    resourceData.boot_dv = data.imageType === 'I' ? '' : data.bootvolume

    resourceData.bus_type = data.busType

    const securityGroupsArray = []
    data.securitygroup.forEach(name => {
      securityGroupsArray.push(name)
    })
    resourceData.security_groups = securityGroupsArray

    const networksArray = []
    data.network.forEach(name => {
      const networkObj = {}
      networkObj.network_name = name
      const fixedIpObj = data.ips.find(obj => obj.network_name === name)
      if (fixedIpObj !== undefined) {
        networksArray.push(fixedIpObj)
      } else {
        networksArray.push(networkObj)
      }
    })
    resourceData.networks = networksArray

    // api에서 이름 넣으면 스크립트 오류 발생 함
    // resourceData.username = globals.user.username; // Failed to validate the cloud-init script 오류나서 안보냄
    resourceData.username = ''
    resourceData.user_script = data.makeScript
    // data.userScript === '' || data.userScript === undefined
    //   ? data.makeScript
    //   : data.userScript

    const sriovNetworksArray = []
    data.sriov.forEach(name => {
      const sriovNetworkObj = {}
      sriovNetworkObj.network_name = name
      const fixedIpObj = data.sriovIps.find(obj => obj.network_name === name)
      if (fixedIpObj !== undefined) {
        sriovNetworksArray.push(fixedIpObj)
      } else {
        sriovNetworksArray.push(sriovNetworkObj)
      }
    })
    resourceData.sriov_networks = sriovNetworksArray

    const hostDeviceArray = []
    resourceData.host_devices = hostDeviceArray

    const gpuDeviceArray = []
    resourceData.gpus = gpuDeviceArray

    if (
      data.node !== 'N/A' &&
      data.imageType !== 'B' &&
      hostDeviceArray.length === 0 &&
      gpuDeviceArray.length === 0
    ) {
      resourceData.node = data.node
    }

    resourceData.description = data.description
    resourceData.storage_class = data.storageClass

    // if (data.preInstalledApp === 'Jupyter') {
    //   resourceData.jupyter_port = data.scriptJupyterPort
    //   resourceData.jupyter_token = data.scriptJupyterToken
    // }

    jsonData.vm = resourceData

    return await this.submitting(request.post(url, jsonData))
  }

  @action
  async update({ id, ...params }, data) {
    const jsonData = {}
    const vmData = {}

    vmData.id = id
    vmData.description = data.description ? data.description : ''

    jsonData.vm = vmData

    // id로 수정해야해서 치환
    params.name = id
    await this.submitting(
      request.put(this.getDetailUrl({ id, ...params }), jsonData)
    )
  }

  @action
  async updateSecurity({ id, ...params }, data) {
    const scurityGroups = data.scurityGroups

    const jsonDataSecurity = {}
    const vmDataSecurity = {}

    vmDataSecurity.id = id
    vmDataSecurity.security_groups = scurityGroups

    jsonDataSecurity.vm = vmDataSecurity

    await this.submitting(
      request.put(
        `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
          params
        )}/edgetron/resources/kubevirt/vms/${id}/security_groups`,
        jsonDataSecurity
      )
    )
  }

  @action
  async updateFlavor({ id, ...params }, data) {
    const jsonData = {}
    const flavorData = {}

    flavorData.id = id
    flavorData.flavor = data.flavor

    jsonData.vm = flavorData

    await this.submitting(
      request.put(
        `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
          params
        )}/edgetron/resources/kubevirt/vms/${id}/flavor`,
        jsonData
      )
    )
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true

    const url = `${this.getResourceUrl(params)}/${params.id}/info`

    const result = await request.get(url)
    const detail = { ...params, ...this.mapper(result), kind: 'vms' }

    // Yaml 파일 관련
    await this.fetchYaml(params)

    // FloatingIp 관련
    await this.fetchVmListFloating(params)

    // Volume 관련
    await this.fetchVolumeList(params)

    // SecurityGroup 관련
    await this.fetchVmListSecurityGroup({
      ...params,
      namespace: detail.vm.project,
    })

    // Network
    await this.fetchVmListNetwork(params)

    // SRIOV Network
    await this.fetchVmListSriovNetwork(params)

    this.detail = detail
    this.isLoading = false

    return detail
  }

  @action
  async fetchVmsDetail(params) {
    const url = `${this.getResourceUrl(params)}/${params.id}/info`

    const result = await request.get(url)
    const detail = { ...params, ...this.mapper(result), kind: 'vms' }
    this.vmsDetail = detail
    return detail
  }

  @action
  async fetchVmStatus(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}/status`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vms' }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmState(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}/state`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vms' }

    this.isLoading = false
    return response
  }

  @action
  async fetchYaml(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}/manifest`
    )
    const yamlData = { ...params, ...this.mapper(result), kind: 'vms' }

    this.yaml = yamlData.manifest
    this.isLoading = false
    return yamlData
  }

  @action
  async fetchVmLog(params) {
    this.isLoading = true

    try {
      const result = await request.get(
        `${this.getResourceUrl(params)}/${params.id}/log`
      )
      const response = { ...params, ...this.mapper(result), kind: 'vms' }

      this.isLoading = false
      return response.log.message
    } catch (e) {
      return []
    }
  }

  @action
  async fetchVmEventList(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}/event`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vms' }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmPhaseEventList(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}/phase_event`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vme' }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmMetering(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}/metering`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vme' }

    this.isLoading = false
    return response.metering
  }

  @action
  async batchDelete({ rowKeys, ...params }) {
    if (rowKeys.includes(globals.user.username)) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
    } else {
      await this.submitting(
        Promise.all(
          rowKeys.map(id =>
            request.delete(`${this.getResourceUrl(params)}/${id}`)
          )
        )
      )
    }
    this.list.selectedRowKeys = []
  }

  @action
  delete(user) {
    // id로 삭제해야해서 치환
    user.name = user.id
    if (user.name === globals.user.username) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
      return
    }

    return this.submitting(request.delete(`${this.getDetailUrl(user)}`))
  }

  @action
  async actionState({ data, ...params }) {
    const jsonData = {}
    const id = data.vmId
    jsonData.action = data.actionType

    await this.submitting(
      request.put(
        `${this.getDetailUrl({ name: id, ...params })}/action`,
        jsonData
      )
    )
  }

  @action
  async fetchFloatingList(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/floating_ips`
    )
    const dataList = { ...params, ...this.mapper(result), kind: 'floating' }

    this.floatingIpList = dataList.floating_ips
    this.isLoading = false
    return dataList
  }

  @action
  async fetchVolumeList(params) {
    this.isLoading = true

    try {
      const result = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
          params
        )}/edgetron/resources/kubevirt/volumes/vm/${params.id}`
      )
      const dataList = { ...params, ...this.mapper(result), kind: 'volumes' }

      this.volumeList = dataList.volumes
      this.isLoading = false
      return dataList
    } catch (e) {
      this.volumeList = []
      return []
    }
  }

  // 등록 관련 데이터 시작
  @action
  async fetchVmListFlavor(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/flavors`
    )
    const response = { ...params, ...this.mapper(result), kind: 'flavors' }

    const sortType = params?.ascending ? 'desc' : 'asc'
    if (params?.sortBy) {
      response.flavors.sort((a, b) => {
        const x = a[params.sortBy]
        const y = b[params.sortBy]
        if (sortType === 'desc') {
          return x > y ? -1 : x < y ? 1 : 0
        }
        return x < y ? -1 : x > y ? 1 : 0
      })
    }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmListImage(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/images`
    )
    const response = { ...params, ...this.mapper(result), kind: 'images' }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmListBootVolume(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/boot_volumes/available`
    )
    const response = { ...params, ...this.mapper(result), kind: 'volumes' }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmListNetwork(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/vm_networks`
    )
    const response = { ...params, ...this.mapper(result), kind: 'networks' }

    if (params?.namespace) {
      response.networks = response.networks.filter(
        item => item.project === params.namespace
      )
    }

    this.networksList = response.networks
    this.isLoading = false
    return response
  }

  @action
  async fetchAllAvailableIps(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/networks/available_ips`
    )
    const response = { ...params, ...this.mapper(result), kind: 'all_ips' }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmListSriovNetwork(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/sriov_networks`
    )
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'sriov_networks',
    }

    if (params?.namespace) {
      response.sriovs = response.sriovs?.filter(
        item => item.project === params.namespace
      )
    }
    this.sriov_networks = response.sriovs
    this.isLoading = false
    return response
  }

  @action
  async fetchAllAvailableSriovIps(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/sriov_networks/available_ips`
    )
    const response = { ...params, ...this.mapper(result), kind: 'all_ips' }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmListKeypair(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/keypairs`
    )
    const response = { ...params, ...this.mapper(result), kind: 'keypairs' }

    if (params.namespace) {
      response.keypairs = response.keypairs.filter(
        item => item.project === params.namespace
      )
    }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmListNode(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/nodes`
    )
    const response = { ...params, ...this.mapper(result), kind: 'nodes' }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmListRouter(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/routers`
    )
    const response = { ...params, ...this.mapper(result), kind: 'routers' }

    this.isLoading = false
    return response
  }

  @action
  async fetchVmListFloating(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/floating_ips`
    )
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'floating_ips',
    }

    this.floatingList = response.floating_ips
    this.isLoading = false
    return response
  }

  @action
  async fetchVmListSecurityGroup(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/security_groups`
    )
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'security_groups',
    }

    const securityArray = []
    const promises = response.security_groups.map(async security => {
      const securityDetail = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
          params
        )}/edgetron/resources/kubevirt/security_groups/${security.id}`
      )

      securityDetail.security_group.egress_count = securityDetail.security_group.rules.filter(
        el => el.direction === 'egress'
      ).length
      securityDetail.security_group.ingress_count = securityDetail.security_group.rules.filter(
        el => el.direction === 'ingress'
      ).length

      securityArray.push(securityDetail.security_group)
    })

    await Promise.all(promises)

    let namespaceDataList = []
    if (params.namespace) {
      namespaceDataList = securityArray.filter(
        item => item.project === params.namespace
      )
    }

    const dataList = params.namespace ? namespaceDataList : securityArray

    this.securigyGroupList = dataList
    this.isLoading = false
    return dataList
  }

  @action
  async fetchVmListStoregeClass(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/storage_classes/user`
    )
    const response = { ...params, ...this.mapper(result), kind: 'user_sces' }

    this.isLoading = false
    return response
  }

  // 등록 관련 데이터 끝

  @action
  async vmList(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/vms`
    )
    if (params) {
      result.vms.sort((a, b) => {
        const x = a[params.sortBy]
        const y = b[params.sortBy]
        if (params.sortType === 'asc') {
          return x < y ? -1 : x > y ? 1 : 0
        }
        return x > y ? -1 : x < y ? 1 : 0
      })
    }
    return result.vms
  }

  // @action
  // async snapshotCreate(data) {
  //   const url = `${this.getResourceUrl({ cluster: data.cluster, namespace: data.namespace })}/snapshots`;

  //   const jsonData = {};
  //   jsonData.snapshot = {
  //     vm_id: data.id
  //   }

  //   const res = await request.post(url, jsonData);
  //   return res;
  // }

  @action
  async snapshotCreate(data, params = {}) {
    const url = `${this.getResourceUrl({
      cluster: params.cluster,
      namespace: params.namespace,
    })}/snapshots`

    const jsonData = {}
    const snapshotData = {}

    snapshotData.vm_id = data.vmId
    snapshotData.description = data.description

    jsonData.snapshot = snapshotData

    return await request.post(url, jsonData)
  }

  @action
  async snapshotList(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/vms/snapshots/${params.id}`
    )
    result.snapshots.sort((a, b) => {
      const x = a['timestamp']
      const y = b['timestamp']
      return x > y ? -1 : x < y ? 1 : 0
    })

    return result.snapshots
  }

  @action
  snapshotDelete({ id, ...props }) {
    // let cluster = globals.currentCluster
    const url = `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      props
    )}/edgetron/resources/kubevirt/vms/snapshots/${id}`
    return this.submitting(request.delete(url))
  }

  @action
  async restoreCreate(data, params = {}) {
    const url = `${this.getResourceUrl(params)}/restores`

    const jsonData = {}
    const restoreData = {}

    restoreData.snapshot_id = data.snapshotId
    restoreData.description = data.description

    jsonData.restore = restoreData

    return await request.post(url, jsonData)
  }

  @action
  async restoreList(params) {
    // let cluster = globals.currentCluster

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/vms/restores/${params.id}`
    )
    result.restores.sort((a, b) => {
      const x = a['timestamp']
      const y = b['timestamp']
      return x > y ? -1 : x < y ? 1 : 0
    })

    return result.restores
  }

  @action
  restoreDelete({ id, ...props }) {
    // let cluster = globals.currentCluster

    const url = `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      props
    )}/edgetron/resources/kubevirt/vms/restores/${id}`
    return this.submitting(request.delete(url))
  }

  @action
  async cloneCreate(data, params = {}) {
    const url = `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/kubevirt/vms/clones`

    const jsonData = {}
    const cloneData = {}

    cloneData.source_vm_id = data.source_vm_id
    cloneData.target_vm_id = data.target_vm_name
    cloneData.description = data.description

    jsonData.clone = cloneData

    return await request.post(url, jsonData)
  }

  @action
  async cloneList(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/vms/clones`
    )

    result.clones.sort((a, b) => {
      const x = a['timestamp']
      const y = b['timestamp']
      return x > y ? -1 : x < y ? 1 : 0
    })

    return result.clones.filter(item => item.source_vm_id === params.id)
  }

  @action
  cloneDelete({ id, ...props }) {
    // let cluster = globals.currentCluster
    const url = `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      props
    )}/edgetron/resources/kubevirt/vms/clones/${id}`
    return this.submitting(request.delete(url))
  }
}
