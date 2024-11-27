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

import { get, set, uniq, isArray, intersection } from 'lodash';
import { observable, action } from 'mobx';
import { Notify } from '@kube-design/components';

import { LIST_DEFAULT_ORDER } from 'utils/constants';
import Base from '../basemm3'; // mm3 관련 추가 파일
import List from '../base.list';

export default class VolumeStore extends Base {
  records = new List();

  module = 'resourcesvolumes';

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params,
    )}/edgetron/resources/kubevirt/volumes`;
  getListUrl = this.getResourceUrl;
  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.id}`;
  getPaginatedUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/kubevirt/volumes/paged/${params.page}/${params.limit}`

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
      this.getPaginatedUrl({ cluster, workspace, namespace, devops, page, limit }),
      this.getFilterParams(params)
    )

    const data = (get(result, "volumes") || []).map(item => ({
      cluster,
      namespace,
      ...this.mapper(item),
    }))

    const total = (get(result, "total") || 0)

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

    this.list.update({
      data: more ? [...this.list.data, ...this.dataList] : this.dataList,
      total: total,
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
    const url = this.getResourceUrl(params);

    const jsonData = {};
    const volumeData = {};

    volumeData.name = data.name;
    volumeData.capacity = data.capacity;
    volumeData.access_modes = data.access_modes;
    volumeData.storage_class = data.storage_class;
    volumeData.import_source = data.import_source;
    if (data.import_source === 'ImageVolume') {
      volumeData.import_endpoint = data.import_endpoint;
    }
    volumeData.volume_mode = data.volume_mode;
    volumeData.project = data.project;
    volumeData.description = data.description ? data.description : '';

    if (data.import_source === 'UploadImage') {
      volumeData.cpu_arch = data.cpu_arch;
      volumeData.os_type = data.os_type;
      volumeData.os_distro = data.os_distro;
      volumeData.boot_type = data.boot_type;
    }

    jsonData.volume = volumeData;

    // console.log("jsonData : "+ JSON.stringify(jsonData))
    const res = await this.submitting(request.post(url, jsonData));
    return res;
  }

  @action
  async update({ id, ...params }, data) {
    const jsonData = {};
    const volumeData = {};

    volumeData.id = id;
    volumeData.description = data?.description;

    jsonData.volume = volumeData;

    await this.submitting(
      request.put(this.getDetailUrl({ id, ...params }), jsonData),
    );
  }

  @action
  async fetchAvailableList(params)  {
    this.isLoading = true;

    const result = await request.get(
      `${this.getResourceUrl(params)}/available`,
    );
    const availableList = { ...params, ...this.mapper(result), kind: 'Volumes' };

    this.availabeList = availableList;
    this.isLoading = false;
    return availableList;
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true;

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}`,
    );
    const detail = { ...params, ...this.mapper(result), kind: 'Volumes' };

    // Yaml 파일 관련
    await this.fetchYaml(params);

    this.detail = detail;
    this.isLoading = false;
    return detail;
  }

  @action
  async fetchYaml(params) {
    this.isLoading = true;

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}/manifest`,
    );
    const yamlData = { ...params, ...this.mapper(result), kind: 'Volumes' };

    this.yaml = yamlData.manifest;
    this.isLoading = false;
    return yamlData;
  }

  @action
  async batchDelete({ rowKeys, ...params }) {
    if (rowKeys.includes(globals.user.username)) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'));
    } else {
      await this.submitting(
        Promise.all(
          rowKeys.map(id =>
            request.delete(`${this.getDetailUrl({ id, ...params })}`),
          ),
        ),
      );
    }
    this.list.selectedRowKeys = [];
  }

  @action
  delete(user) {
    if (user.name === globals.user.username) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'));
      return;
    }

    return this.submitting(request.delete(`${this.getDetailUrl(user)}`));
  }

  @action
  async actionState({ data, ...params }) {
    const jsonData = {};
    const actionData = {};

    actionData.vm_id = data.vmId;
    if (data.actionType == 'A') {
      actionData.persist = true;
      actionData.action = 'attach';
    } else {
      actionData.action = 'detach';
    }

    actionData.hotplug = data.hotplug;
    actionData.bus = data.bus;

    jsonData.action = actionData;

    await this.submitting(
      request.put(
        `${this.getDetailUrl({ ...params, id: data.id })}/action`,
        jsonData,
      ),
    );
  }

  @action
  async fetchStoregeClass(params) {
    this.isLoading = true;

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params,
      )}/edgetron/resources/kubevirt/storage_classes`,
    );
    const response = { ...params, ...this.mapper(result), kind: 'user_sces' };

    this.isLoading = false;
    return response;
  }
}
