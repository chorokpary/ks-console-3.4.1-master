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

import { get, omit } from 'lodash'
import { action, observable } from 'mobx'
import { LIST_DEFAULT_ORDER } from 'utils/constants'
import { eventBus } from 'utils/EventBus'
import { eventKeys } from 'utils/events'
import ObjectMapper from 'utils/object.mapper'

import Base from './base'
import List from './base.list'

const withTypeSelectParams = (params, type) => {
  if (type === 'system') {
    params.labelSelector = 'kubesphere.io/workspace=system-workspace'
  } else if (type === 'user') {
    params.labelSelector =
      'kubesphere.io/workspace!=system-workspace,!kubesphere.io/devopsproject'
  } else {
    params.labelSelector =
      params.labelSelector ||
      `!kubesphere.io/kubefed-host-namespace,!kubesphere.io/devopsproject`
  }

  return params
}

export default class ProjectStore extends Base {
  @observable
  initializing = true

  limitRanges = new List()

  module = 'namespaces'

  getResourceUrl = ({ workspace, ...params }) => {
    if (workspace) {
      return `kapis/tenant.kubesphere.io/v1alpha2/workspaces/${workspace}${this.getPath(
        params
      )}/namespaces`
    }

    return `kapis/resources.kubesphere.io/v1alpha3${this.getPath(
      params
    )}/namespaces`
  }

  getWatchListUrl = ({ workspace, ...params }) => {
    if (workspace) {
      return `${this.apiVersion}/watch${this.getPath(
        params
      )}/namespaces?labelSelector=kubesphere.io/workspace=${workspace}`
    }
    return `${this.apiVersion}/watch${this.getPath(params)}/namespaces`
  }

  getListUrl = (params = {}) => {
    if (params.workspace) {
      return `kapis/tenant.kubesphere.io/v1alpha2/workspaces/${
        params.workspace
      }${this.getPath(params)}/namespaces`
    }

    return `${this.apiVersion}${this.getPath(params)}/namespaces`
  }

  @action
  async fetchList({
    cluster,
    workspace,
    namespace,
    more,
    type,
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

    const result = await request
      .get(
        this.getResourceUrl({ cluster, workspace, namespace }),
        withTypeSelectParams(params, type)
      )
      .catch(() => {
        return {}
      })

    const data = get(result, 'items', []).map(item => ({
      cluster,
      ...this.mapper(item),
    }))

    this.list.update({
      data: more ? [...this.list.data, ...data] : data,
      total: result.totalItems || result.total_count || data.length || 0,
      ...omit(params, 'labelSelector'),
      cluster: globals.app.isMultiCluster ? cluster : undefined,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    })

    data.forEach(item => {
      eventBus.emit(eventKeys.PROJECT_CHANGE, item)
    })
    return data
  }

  @action
  async fetchDetail({ cluster, workspace, namespace }, reject) {
    this.isLoading = true
    const detail = await request.get(
      this.getDetailUrl({ cluster, workspace, name: namespace }),
      null,
      null,
      reject ||
        (res => {
          if (res.reason === 'NotFound' || res.reason === 'Forbidden') {
            global.navigateTo('/404')
          }
        })
    )

    this.detail = { cluster, ...this.mapper(detail) }
    this.isLoading = false
    return { cluster, ...this.mapper(detail) }
  }

  @action
  async create(data, params = {}) {
    let res
    if (params.workspace) {
      res = await this.submitting(
        request.post(this.getResourceUrl(params), data)
      )
    } else {
      res = this.submitting(request.post(this.getListUrl(params), data))
    }
    this.afterChange(res, params)
    return res
  }

  @action
  async fetchLimitRanges({ cluster, namespace }) {
    this.limitRanges.isLoading = false
    const result = await request.get(
      `api/v1${this.getPath({ cluster, namespace })}/limitranges`
    )
    const data = result.items.map(ObjectMapper.limitranges)

    this.limitRanges.update({
      data,
      total: result.items.length,
      isLoading: false,
    })

    return data
  }

  @action
  async fetchListByUser({
    cluster,
    workspace,
    namespace,
    username,
    type,
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
      `kapis/tenant.kubesphere.io/v1alpha2/workspaces/${workspace}${this.getPath(
        { cluster, namespace }
      )}/workspacemembers/${username}/namespaces`,
      withTypeSelectParams(params, type)
    )
    const data = get(result, 'items', []).map(item => ({
      cluster,
      ...this.mapper(item),
    }))

    this.list.update({
      data,
      total: result.totalItems || 0,
      ...omit(params, 'labelSelector'),
      cluster: globals.app.isMultiCluster ? cluster : undefined,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
    })

    return data
  }

  @action
  async delete(params) {
    const res = await this.submitting(request.delete(this.getDetailUrl(params)))
    if (this.afterDelete) {
      this.afterDelete(res, params)
    }

    // 프로젝트에 포함된 리소스 삭제 
    if(res.message == "success"){
      this.handleProjectResource(params, 1, false)
    }

    return res
  }

  handleProjectResource = async (params, deleteStep, deleteFlag) => {
    
    const resource_lbs = "lbs"
    const resource_vms = "vms"
    const resource_volumes = "volumes"
    const resource_keypairs = "keypairs"
    const resource_floating_ips = "floating_ips"
    const resource_routers = "routers"
    const resource_networks = "networks"
    const resource_security_groups = "security_groups"

    // 리스트 처리
    const data_lbs = await this.getProjectResourceData(params, resource_lbs) //로드밸런서     
    const data_vms = await this.getProjectResourceData(params, resource_vms) //VMS      
    const data_volumes = await this.getProjectResourceData(params, resource_volumes) //볼륨      
    const data_keypairs = await this.getProjectResourceData(params, resource_keypairs) //키페어
    const data_floating_ips = await this.getProjectResourceData(params, resource_floating_ips) //플로팅IP
    const data_routers = await this.getProjectResourceData(params, resource_routers) //가상라우터
    const data_networks = await this.getProjectResourceData(params, resource_networks) //네트워크
    const data_security_groups = await this.getProjectResourceData(params, resource_security_groups) //보안그룹

    // 삭제 처리 순서 : 로드밸런서 > VMS > 볼륨 > 키페어 > 플로팅IP > 가상라우터 > 네트워크 >  보안그룹    
    // 로드밸런서
    if (deleteStep == 1) {      
      if(data_lbs.length > 0){
        console.log("로드밸런서 삭제 안했으면 삭제 처리~")
        !deleteFlag && await data_lbs.map((obj) => {this.delProjectResource(params, resource_lbs, obj.id);})

        console.log("로드밸런서 삭제될때까지 루프.....")
        setTimeout(async () => { await this.handleProjectResource(params, 1, true) }, 1000)
      }else{
        console.log("로드밸런서 삭제 완료!!")
        setTimeout(async () => { await this.handleProjectResource(params, 2, false) }, 1000)
      }     
    }

    // 가상머신
    if (deleteStep == 2) {      
      if(data_vms.length > 0){
        console.log("가상머신 삭제 안했으면 삭제 처리~")
        !deleteFlag && await data_vms.map((obj) => {this.delProjectResource(params, resource_vms, obj.id);})

        console.log("가상머신 삭제될때까지 루프.....")
        setTimeout(async () => { await this.handleProjectResource(params, 2, true) }, 1000)
      }else{
        console.log("가상머신 삭제 완료!!")
        setTimeout(async () => { await this.handleProjectResource(params, 3, false) }, 1000)
      }     
    }

    // 볼륨
    if (deleteStep == 3) {      
      if(data_volumes.length > 0){
        console.log("볼륨 삭제 안했으면 삭제 처리~")
        !deleteFlag && await data_volumes.map((obj) => {this.delProjectResource(params, resource_volumes, obj.id);})

        console.log("볼륨 삭제될때까지 루프.....")
        setTimeout(async () => { await this.handleProjectResource(params, 3, true) }, 1000)
      }else{
        console.log("볼륨 삭제 완료!!")
        setTimeout(async () => { await this.handleProjectResource(params, 4, false) }, 1000)
      }     
    }

    // 키페어
    if (deleteStep == 4) {      
      if(data_keypairs.length > 0){
        console.log("키페어 삭제 안했으면 삭제 처리~")
        !deleteFlag && await data_keypairs.map((obj) => {this.delProjectResource(params, resource_keypairs, obj.id);})

        console.log("키페어 삭제될때까지 루프.....")
        setTimeout(async () => { await this.handleProjectResource(params, 4, true) }, 1000)
      }else{
        console.log("키페어 삭제 완료!!")
        setTimeout(async () => { await this.handleProjectResource(params, 5, false) }, 1000)
      }     
    }

    // 플로팅IP
    if (deleteStep == 5) {      
      if(data_floating_ips.length > 0){
        console.log("플로팅IP 삭제 안했으면 삭제 처리~")
        !deleteFlag && await data_floating_ips.map((obj) => {this.delProjectResource(params, resource_floating_ips, obj.id);})

        console.log("플로팅IP 삭제될때까지 루프.....")
        setTimeout(async () => { await this.handleProjectResource(params, 5, true) }, 1000)
      }else{
        console.log("플로팅IP 삭제 완료!!")
        setTimeout(async () => { await this.handleProjectResource(params, 6, false) }, 1000)
      }     
    }

    // 가상라우터
    if (deleteStep == 6) {      
      if(data_routers.length > 0){
        console.log("가상라우터 삭제 안했으면 삭제 처리~")
        !deleteFlag && await data_routers.map((obj) => {this.delProjectResource(params, resource_routers, obj.id);})

        console.log("가상라우터 삭제될때까지 루프.....")
        setTimeout(async () => { await this.handleProjectResource(params, 6, true) }, 1000)
      }else{
        console.log("가상라우터 삭제 완료!!")
        setTimeout(async () => { await this.handleProjectResource(params, 7, false) }, 1000)
      }     
    }

    // 네트워크
    if (deleteStep == 7) {      
      if(data_networks.length > 0){
        console.log("네트워크 삭제 안했으면 삭제 처리~")
        !deleteFlag && await data_networks.map((obj) => {this.delProjectResource(params, resource_networks, obj.id);})

        console.log("네트워크 삭제될때까지 루프.....")
        setTimeout(async () => { await this.handleProjectResource(params, 7, true) }, 1000)
      }else{
        console.log("네트워크 삭제 완료!!")
        setTimeout(async () => { await this.handleProjectResource(params, 8, false) }, 1000)
      }     
    }

    // 보안그룹
    if (deleteStep == 8) {      
      if(data_security_groups.length > 0){
        console.log("보안그룹 삭제 안했으면 삭제 처리~")
        !deleteFlag && await data_security_groups.map((obj) => {this.delProjectResource(params, resource_security_groups, obj.id);})

        console.log("보안그룹 삭제될때까지 루프.....")
        setTimeout(async () => { await this.handleProjectResource(params, 8, true) }, 1000)
      }else{
        console.log("보안그룹 삭제 완료!!")
        console.log("##전체 삭제 처리 완료!!")
      }     
    }
    
  }

  getPathResource({ cluster, name } = {}) {
    let path = ''
    if (cluster) {path += `/klusters/${cluster}`}
    if (name) { path += `/namespaces/${name}`}
    return path
  }

  getProjectResourceData = async (params, resourceName) => {
    const result = await request.get(`kapis/edgestack.kubesphere.io/v1alpha1${this.getPathResource(params)}/edgetron/resources/kubevirt/${resourceName}`)
    const response = { ...params, ...this.mapper(result), kind: resourceName }
    const dataList = get(response._originData, resourceName, []);

    const projectName = params.name;
    const projectData = dataList.filter(item => item.project == projectName)
    return projectData;
  }

  delProjectResource = async (params, resourceName, id) => {
    const url = `kapis/edgestack.kubesphere.io/v1alpha1${this.getPathResource(params)}/edgetron/resources/kubevirt/${resourceName}/${id}`
    const result = request.delete(url)
  }


  afterChange = (d, { cluster }) => {
    eventBus.emit(eventKeys.PROJECT_CHANGE, { ...this.mapper(d), cluster })
  }

  afterDelete = (d, { cluster }) => {
    eventBus.emit(eventKeys.DELETE_PROJECT, { ...this.mapper(d), cluster })
  }
}
