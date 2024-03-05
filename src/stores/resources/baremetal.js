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
import axios from "axios";

import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class BareMetalStore extends Base {

  records = new List()

  module = 'baremetal'

  @observable
  list = {
    data: [],
    page: 1,
    limit: 10,
    total: 0,
    order: '',
    reverse: false,
    filters: {},
    isLoading: true,
  }

  // getResourceUrlCluster = (params = {}) => `cmp-apiserver/node/v1alpha2/clusters`
  // getResourceUrlBareMetal = (params = {}) => `cmp-apiserver/node/v1alpha2/baremetals`
  // getResourceUrlReset = (params = {}) => `cmp-apiserver/redfish/v1alpha2/reset`

  getResourceUrlCluster = (params = {}) => `kapis/cmp.kubesphere.io/v1alpha1/baremetal-monitor/v1alpha1/clusters`
  getResourceUrlBareMetal = (params = {}) => `kapis/cmp.kubesphere.io/v1alpha1/baremetal-monitor/v1alpha1/baremetals`
  getResourceUrlReset = (params = {}) => `kapis/cmp.kubesphere.io/v1alpha1/baremetal-monitor/v1alpha1/redfish/reset`

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
    // console.log("silent : "+ silent)
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


    const resultBareMatalData = await request.get(
      this.getResourceUrlBareMetal()
    )

    const resultClusterData = await request.get(
      this.getResourceUrlCluster()
    )

    const resultCluster = get(resultClusterData, 'clusters', [])
    const resultBareMatal = get(resultBareMatalData, 'baremetals', [])

    await resultCluster.map(item => (
      item.system_type = "C"
    ))

    await resultBareMatal.map(item => (
      item.system_type = "B"
    ))

    const result = [...resultCluster, ...resultBareMatal]
    const data = result;

    // 초기 정렬 처리
    data.sort((a, b) => {
      return a.name < b.name ? 1 : a.name > b.name ? -1 : 0;
    });

    // 초기 데이터 처리 
    this.dataList = data;

    // 검색 관련 처리 
    const exceptionArray = ['page', 'limit', 'sortBy', 'ascending'];
    const searchArray = Object.keys(params).map((key) => {
      let value = params[key];
      let searchData = {
        "searchKeywordType": key,
        "searchKeywordText": value
      }
      return searchData
    }).filter((row) => exceptionArray.includes(row.searchKeywordType) === false)

    if (searchArray.length > 0) {
      searchArray.map((search) => {
        let resultList = this.dataList.filter((row) => {
          if (search.searchKeywordType === 'project') {
            return row[search.searchKeywordType]?.toLowerCase() === search.searchKeywordText.toLowerCase();
          }
          return row[search.searchKeywordType]?.toLowerCase().includes(search.searchKeywordText.toLowerCase());
        });
        this.dataList = resultList;
      })
    }

    //정렬 처리
    const sortType = !!params.ascending ? "asc" : "desc";
    this.dataList.sort((a, b) => {
      var x = a[params.sortBy];
      var y = b[params.sortBy];
      if (sortType == "desc") {
        return x > y ? -1 : x < y ? 1 : 0;
      } else if (sortType == "asc") {
        return x < y ? -1 : x > y ? 1 : 0;
      }
    });

    // mm3 데이터 page 별 Slice 처리 
    const perPage = Number(params.limit) || 10;
    const currentPage = Number(params.page) || 1;
    const mm3SliceData = this.dataList.slice((currentPage - 1) * perPage, (currentPage) * perPage);

    this.list.update({
      data: more ? [...this.list.data, ...mm3SliceData] : mm3SliceData,
      total: result.totalItems || result.total_count || this.dataList.length || 0,
      ...params,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    })

    //console.log(this.dataList)

    return this.dataList
  }

  @action
  async create(data, params = {}) {

    const url = data.systemType == "C" ? this.getResourceUrlCluster(params) : this.getResourceUrlBareMetal(params);

    const jsonData = {};
    const nodeData = {};
    const bmcData = {};

    nodeData.ip = data.nodeIp;
    nodeData.scrapeInterval = !!data.nodeInterval ? data.nodeInterval + "s" : "";
    nodeData.port = Number(data.nodePort);

    bmcData.address = data.bmcIp;
    bmcData.scrapeInterval = !!data.bmcInterval ? data.bmcInterval + "s" : "";
    bmcData.username = data.bmcId;
    bmcData.password = data.bmcPassword;

    jsonData.name = data.systemType == "C" ? data.cluserName : data.name;
    data.systemType == "C" ? "" : jsonData.nodeExporter = nodeData;
    jsonData.openBMC = bmcData;

    const res = await request.post(url, jsonData)
    return res
  }

  @action
  async update({ name, ...params }, data) {

    const url = data.systemType == "C" ? this.getResourceUrlCluster(params) : this.getResourceUrlBareMetal(params);

    const jsonData = {};
    const nodeData = {};
    const bmcData = {};

    nodeData.ip = data.nodeIp;
    nodeData.scrapeInterval = data.nodeInterval + "s";
    nodeData.port = Number(data.nodePort);

    bmcData.address = data.bmcIp;
    bmcData.scrapeInterval = data.bmcInterval + "s";
    bmcData.username = data.bmcId;
    bmcData.password = data.bmcPassword;

    jsonData.name = data.name;
    data.systemType == "C" ? "" : jsonData.nodeExporter = nodeData;
    jsonData.openBMC = bmcData;

    console.log("jsonData : " + JSON.stringify(jsonData))

    const res = await request.put(url, jsonData)
    return res
  }


  @action
  async fetchDetail(params) {
    this.isLoading = true

    const url = params.systemType == "C" ? this.getResourceUrlCluster(params) : this.getResourceUrlBareMetal(params);

    const result = await request.get(url)
    const detail = { ...params, ...this.mapper(result), kind: 'Baremetal' }

    this.detail = detail
    this.isLoading = false
    return detail
  }

  @action
  async batchDelete({ rowKeys, ...params }) {
    if (rowKeys.includes(globals.user.username)) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
    } else {

      const url = params.systemType == "C" ? this.getResourceUrlCluster(params) : this.getResourceUrlBareMetal(params);

      await this.submitting(
        Promise.all(
          rowKeys.map(username =>
            request.delete(
              `${url}/${username})}`
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

    const systemType = !!user.systemType ? user.systemType : user.system_type;
    const url = systemType == "C" ? this.getResourceUrlCluster(user) : this.getResourceUrlBareMetal(user);

    return this.submitting(request.delete(`${url}/${user.name}`))
  }

  @action
  async actionState(data) {

    const url = this.getResourceUrlReset();

    const jsonData = {};
    jsonData.address = "https://" + data.address,
      jsonData.id = data.id,
      jsonData.password = data.password,
      jsonData.resetType = data.resetType,
      jsonData.systemId = data.systemId

    console.log("jsonData : " + JSON.stringify(jsonData))

    const res = await request.post(url, jsonData)
    console.log("res : " + JSON.stringify(res))
    return res
  }
}
