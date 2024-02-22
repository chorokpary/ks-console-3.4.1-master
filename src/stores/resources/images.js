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

import { get, set, uniq, isArray, intersection } from 'lodash'
import { observable, action } from 'mobx'
import { Notify } from '@kube-design/components'
import { LIST_DEFAULT_ORDER } from 'utils/constants'
import ObjectMapper from 'utils/object.mapper'
import cookie from 'utils/cookie'


import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class ImageStore extends Base {

  records = new List()

  module = 'images'

  getResourceUrl = (params = {}) => `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/images`
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
      this.list.isLoading = true;
    }

    if (!params.sortBy && params.ascending === undefined) {
      params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'timestamp';
    }

    if (params.limit === Infinity || params.limit === -1) {
      params.limit = -1;
      params.page = 1;
    }

    params.limit = params.limit || 10;

    const result = await request.get(
      this.getResourceUrl({ cluster, workspace, namespace, devops }),
      this.getFilterParams(params)
    );

    // mm3 api 관련
    const mm3Array = ['vms', 'images', 'flavors', 'networks', 'routers', 'floating_ips', 'lbs', 'security_groups', 'keypairs', 'host_devices', 'pci_devices', 'volumes', 'clusters', 'workspaces', 'licenses', 'distro_types']
    const apiName = mm3Array.includes(this.module) ? this.module : '';

    const data = (get(result, apiName) || []).map(item => ({
      cluster,
      namespace,
      ...this.mapper(item),
    }));

    // 초기 정렬 처리
    data.sort((a, b) => {
      return a.creation_timestamp < b.creation_timestamp
        ? 1
        : a.creation_timestamp > b.creation_timestamp
          ? -1
          : 0;
    });

    // 초기 데이터 처리
    this.dataList = data;

    // 검색 관련 처리
    const exceptionArray = ['page', 'limit', 'sortBy', 'ascending'];
    const searchArray = Object.keys(params)
      .map(key => {
        const value = params[key];
        const searchData = {
          searchKeywordType: key,
          searchKeywordText: value,
        };
        return searchData;
      })
      .filter(row => exceptionArray.includes(row.searchKeywordType) === false);

    if (searchArray.length > 0) {
      searchArray.map(search => {
        const resultList = this.dataList.filter(row => {

          return row[search.searchKeywordType]
            ?.toLowerCase()
            .includes(search.searchKeywordText.toLowerCase());
        });
        this.searchList = resultList;
      });
      this.dataList = this.searchList;
    }

    // 정렬 처리
    const sortType = params.ascending ? 'asc' : 'desc';
    this.dataList.sort((a, b) => {
      const x = a[params.sortBy];
      const y = b[params.sortBy];
      if (sortType == 'desc') {
        return x > y ? -1 : x < y ? 1 : 0;
      }
      if (sortType == 'asc') {
        return x < y ? -1 : x > y ? 1 : 0;
      }
    });

    // mm3 데이터 page 별 Slice 처리
    const perPage = Number(params.limit) || 10;
    const currentPage = Number(params.page) || 1;
    const mm3SliceData = this.dataList.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
    );

    this.list.update({
      data: more ? [...this.list.data, ...mm3SliceData] : mm3SliceData,
      total:
        result.totalItems || result.total_count || this.dataList.length || 0,
      ...params,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });

    // console.log(this.dataList)

    return this.dataList;
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
    // this.afterChange(res, params)
    return res
  }
  @action
  async update({ name, ...params }, data) {
    const jsonData = {};
    jsonData.image = data;

    await this.submitting(
      request.put(this.getDetailUrl({ name, ...params }), jsonData)
    )
  }



  @action
  async fetchDetail(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}`
    )
    const detail = { ...params, ...this.mapper(result), kind: 'Images' }

    // Yaml 파일 관련 
    await this.fetchYaml(params);

    this.detail = detail
    this.isLoading = false
    return detail
  }

  @action
  async fetchYaml(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}/manifest`
    )
    const yamlData = { ...params, ...this.mapper(result), kind: 'Images' }

    this.yaml = yamlData.manifest
    this.isLoading = false
    return yamlData
  }


  // @action
  // async update({ name, ...params }, data) {
  //   await this.submitting(
  //     request.put(this.getDetailUrl({ name, ...params }), data)
  //   )

  //   if (data.password && name === globals.user.username) {
  //     return await request.post('logout')
  //   }

  //   const lang = get(data, 'spec.lang')
  //   if (lang && data.lang !== cookie('lang')) {
  //     window.location.reload()
  //   }
  // }


  // @action
  // async modifyPassword({ name }, data) {
  //   return this.submitting(
  //     request.put(`${this.getDetailUrl({ name })}/password`, data)
  //   )
  // }

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

}
