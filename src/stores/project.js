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
    this.isSubmitting = true
    const response = await this.handleProjectResource(params, 1, false)

    if(response.message == "success"){
        const res = await this.submitting(request.delete(this.getDetailUrl(params)))

        if (this.afterDelete) {
          this.afterDelete(res, params)
        }
        this.isSubmitting = false
        return res    
    }   
  }

  handleProjectResource = async (params, deleteStep, deleteFlag) => {
    return new Promise(async (resolve) => {

      const resource_lbs = "lbs";
      const resource_vms = "vms";
      const resource_volumes = "volumes";
      const resource_keypairs = "keypairs";
      const resource_floating_ips = "floating_ips";
      const resource_routers = "routers";
      const resource_networks = "networks";
      const resource_security_groups = "security_groups";
  
      const resources = [
        { name: resource_lbs, step: 1 },
        { name: resource_vms, step: 2 },
        { name: resource_volumes, step: 3 },
        { name: resource_keypairs, step: 4 },
        { name: resource_floating_ips, step: 5 },
        { name: resource_routers, step: 6 },
        { name: resource_networks, step: 7 },
        { name: resource_security_groups, step: 8 },
      ];
  
      const data = {
        [resource_lbs]: await this.getProjectResourceData(params, resource_lbs),
        [resource_vms]: await this.getProjectResourceData(params, resource_vms),
        [resource_volumes]: await this.getProjectResourceData(params, resource_volumes),
        [resource_keypairs]: await this.getProjectResourceData(params, resource_keypairs),
        [resource_floating_ips]: await this.getProjectResourceData(params, resource_floating_ips),
        [resource_routers]: await this.getProjectResourceData(params, resource_routers),
        [resource_networks]: await this.getProjectResourceData(params, resource_networks),
        [resource_security_groups]: await this.getProjectResourceData(params, resource_security_groups),
      };
  
      const processResource = async (step) => {
        const resource = resources.find((r) => r.step === step);
  
        if (!resource) {
          console.log("##전체 삭제 처리 완료!!");
          resolve({ message: "success" });
          return;
        }
  
        const currentData = data[resource.name];
        if (currentData.length > 0) {
          console.log(`${resource.name} 삭제 안했으면 삭제 처리~`);
          if (!deleteFlag) {
            await Promise.all(
              currentData.map((obj) => this.delProjectResource(params, resource.name, obj.id))
            );
          }
  
          console.log(`${resource.name} 삭제 루프 끝났으면 다음 단계.....`);
          setTimeout(() => processResource(step + 1), 1000);

        } else {
          console.log(`${resource.name} 삭제 완료!!`);
          setTimeout(() => processResource(step + 1), 1000);
        }
      };
  
      await processResource(deleteStep);
    });
  };

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
