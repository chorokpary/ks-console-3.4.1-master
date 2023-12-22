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

export default class ResourceStore extends Base {

  records = new List()

  module = 'clusters'

  getResourceUrl = (params = {}) => `edgetron/resources/capk/clusters`
  getListUrl = this.getResourceUrl


  // @action
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

    const result = await request.get(
      this.getResourceUrl({ cluster, workspace, namespace, devops }),
      this.getFilterParams(params)
    )

    // mm3 api 관련 
    const mm3Array = ['vms', 'images', 'flavors', 'networks', 'routers', 'floating_ips', 'lbs', 'security_groups', 'keypairs', 'host_devices', 'pci_devices', 'volumes', 'clusters', 'workspaces', 'licenses', 'distro_types']
    const apiName = mm3Array.includes(this.module) ? this.module : "";

    const data = (get(result, apiName) || []).map(item => ({
      cluster,
      namespace,
      // ...this.mapper(item), // kubesphere Object.maaper 와 중복되어서 주석처리
      ...item
    }))

    // // 초기 데이터 처리 // 위 주석으로 세팅해줄 필요없어짐
    // this.dataList =
    //   data.length > 0 ? data.map((obj) => {
    //     const cluster = obj.cluster
    //     const namespace = obj.namespace
    //     const temData = obj._originData
    //     temData.cluster = cluster
    //     temData.namespace = namespace
    //     return temData
    //   }) : [];
    this.dataList = data


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
          if (typeof row[search.searchKeywordType] === "boolean") {
            return (row[search.searchKeywordType] ? 'Ready' : 'Not-ready').includes(search.searchKeywordText);
          } else {
            return row[search.searchKeywordType]?.toLowerCase().includes(search.searchKeywordText.toLowerCase());
          }
        });
        this.searchList = resultList;
      })
      this.dataList = this.searchList;
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

    return this.dataList
  }

  @action
  async create(data, params = {}) {

    const jsonData = {};
    const reqData = {};
    reqData.external_network = data.external_network;
    reqData.sriov_network = data.sriov_network;
    reqData.elb_network = data.elb_network;
    reqData.elb_type = data.elb_type.toLowerCase();

    reqData.name = data.name;
    reqData.kube_image = data.image;
    reqData.description = data.description;
    reqData.master_flavor = data.masterFlavor;
    reqData.worker_flavor = data.workerFlavor;
    reqData.master_number = data.master_number;
    reqData.worker_number = data.worker_number;
    reqData.worker_autoscale = data.worker_autoscale;
    reqData.worker_scale_range = data.worker_scale_range;
    reqData.cni = data.cni.toLowerCase();
    reqData.csi = data.csi.toLowerCase();
    reqData.ui = "kubesphere";
    reqData.features = data.features;
    reqData.expiration = data.expiration;
    reqData.private_registry = data.private_registry;
    jsonData.cluster = reqData;

    let res = await this.submitting(request.post(this.getListUrl(params), jsonData))

    return res
  }


  @action
  async fetchDetail(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}`
    )
    const detail = { ...params, ...this.mapper(result), kind: 'ContainerResource' }

    // Yaml 파일 관련 
    await this.fetchYaml(params);

    await this.fetchDetailFlavor(params);
    await this.fetchResourceConfig(params);

    this.detail = detail._originData
    this.isLoading = false
    return detail
  }

  @action
  async fetchYaml(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}/manifest`
    )
    const yamlData = { ...params, ...this.mapper(result), kind: 'ContainerResource' }

    this.yaml = yamlData._originData.manifest

    this.isLoading = false
    return yamlData
  }


  @action
  async fetchResourceConfig(params) {
    this.isLoading = true

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}/config`
    )
    const response = { ...params, ...this.mapper(result), kind: 'ContainerResource' }

    this.resourceConfig = response._originData.config
    this.isLoading = false
    return response
  }

  @action
  async update({ name, ...params }, data) {

    let res = await this.submitting(request.put(this.getDetailUrl({ name: data.cluster.name }), data))

    return res
  }


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

  // 등록 관련 데이터 시작 
  @action
  async fetchListImage(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/capk/images`
    )
    const response = { ...params, ...this.mapper(result), kind: 'images' }

    //Image Detail 정보 추가 
    const imageArray = [];
    const promises = (response._originData.images).map(async (image) => {
      const imageDetail = await axios.get("/edgetron/resources/capk/images/" + image.name);
      image.image_detail = imageDetail.data.image;
      imageArray.push(image);
    })
    await Promise.all(promises);

    this.isLoading = false
    return response;
  }

  @action
  async fetchListLoadBalancer(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/kubevirt/lbs`
    )

    const response = { ...params, ...this.mapper(result), kind: 'lbs' }

    const dataArray = [];
    const promises = response._originData.lbs.map(async (lb) => {
      const lbDetail = await axios.get("/edgetron/resources/kubevirt/lbs/" + lb.id);
      lb.rulesCount = lbDetail.data.lb.rules.length;
      dataArray.push(lb);
    })
    await Promise.all(promises);
    response._originData.lbs = dataArray;

    this.isLoading = false
    return response;
  }

  @action
  async fetchDetailFlavor(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/capk/clusters/${params.name}/machines`
    )
    const response = { ...params, ...this.mapper(result), kind: 'machines' }
    const dataArray = [];
    const promises = response._originData.machines.map(async (machine) => {
      const flavorData = await axios.get("/edgetron/resources/kubevirt/flavors/" + machine.flavor);
      machine.flavor_detail = flavorData.data.flavor;
      dataArray.push(machine);
    })
    await Promise.all(promises);
    response._originData.lbs = dataArray;

    this.machines = response._originData.machines

    this.isLoading = false
    return response;
  }
  
  @action
  async fetchMachines(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/capk/clusters/${params.name}/machines`
    )
    const response = { ...params, ...this.mapper(result), kind: 'machines' }

    this.machines = response._originData.machines

    this.isLoading = false
    return response;
  }
}
