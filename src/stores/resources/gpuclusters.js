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
import ObjectMapper from 'utils/object.mapper';
import cookie from 'utils/cookie';

import Base from '../basemm3'; // mm3 관련 추가 파일
import List from '../base.list';

export default class GpuClustersStore extends Base {
  records = new List();

  module = 'gpuclusters';

  // getResourceUrl = (params = {}) =>
  //   `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
  //     params
  //   )}/gpu-cluster/clusters`;

  getResourceUrl = (params = {}) => `/gpu-cluster/clusters`
  getResourceDetailUrl = (params = {}) => `/gpu-cluster/cluster`

  getListUrl = this.getResourceUrl;
  
  getDeleteUrl = (params = {}) => `${this.getResourceDetailUrl(params)}/${params.id}`;

  @action
  async fetchList({
    cluster,
    workspace,
    namespace,
    infinite,
    more,
    devops,
    silent,
    ...params
  } = {}) {
    if (!silent) {
      this.list.isLoading = true
    }

    if (!params.sortBy && params.ascending === undefined) {
      params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'created_at'
    }

    if (infinite) {
      params.limit = -1
    }

    if (params.limit === Infinity || params.limit === -1) {
      params.limit = -1
      params.page = 1
    }

    params.page = params.page || 1
    params.limit = params.limit || 10

    const page = params.page
    const limit = params.limit

    if (namespace) {
      params.project = namespace
    }
 
    const result = await request.get(
      this.getListUrl({ cluster, workspace, namespace, devops, page, limit }),
      this.getFilterParams(params)
    )

    const data = (get(result, 'data') || []).map(item => ({
      cluster,
      namespace,
      ...this.mapper(item),
    }))

    const total = data.length || 0

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

  }

  @action
  async update({ name, ...params }, data) {

  }

  @action
  async fetchDetail(params) {
    this.isLoading = true;

    const result = await request.get(
      `${this.getResourceDetailUrl(params)}/${params.name}`
    );
    const detail = { ...params, ...this.mapper(result), kind: 'data' };

    this.detail = detail;
    this.isLoading = false;
    return detail;
  }

  @action
  async fetchYaml(params) {
    this.isLoading = true;

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}/manifest`
    );
    const yamlData = { ...params, ...this.mapper(result), kind: 'gpucluster' };

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
            request.delete(`${this.getDetailUrl({ id, ...params })}`)
          )
        )
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
}
