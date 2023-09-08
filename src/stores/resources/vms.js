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

export default class VmStore extends Base {

  records = new List()

  module = 'vms'

  getResourceUrl = (params = {}) => `edgetron/resources/kubevirt/vms`
  getListUrl = this.getResourceUrl

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
    const mm3Array = ['vms', 'images', 'flavors', 'networks', 'routers', 'floating_ips', 'lbs', 'security_groups', 'keypairs', 'host_devices', 'pci_devices', 'volumes', 'clusters', 'workspaces', 'licenses', 'distro_types']
    const apiName = mm3Array.includes(this.module) ? this.module : "";

    const data = (get(result, apiName) || []).map(item => ({
      cluster,
      namespace,
      ...this.mapper(item),
    }))

    // VMS 일때 Flavor 정보 추가 
    const vmArray = [];
    if (apiName == "vms") {

      const promises = data.map(async (vm) => {
        const flavorDetail = await axios.get("/edgetron/resources/kubevirt/flavors/" + vm.flavor);
        vm.flavor_detail = flavorDetail.data.flavor;
        vmArray.push(vm);
      })
      await Promise.all(promises);

     // 초기 정렬 처리
      vmArray.sort((a, b) => {
        return a.creation_timestamp < b.creation_timestamp ? 1 : a.creation_timestamp > b.creation_timestamp ? -1 : 0;
      });

      // 초기 데이터 처리 
      this.dataList = vmArray;
    } else {
      // 초기 데이터 처리 
      this.dataList = data;
    }

    // FloatingIp List 추출
    await this.fetchFloatingList(params);

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
          return row[search.searchKeywordType]?.toLowerCase().includes(search.searchKeywordText.toLowerCase());
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

    // console.log(data)

    return data
  }


  @action
  async create(data, params = {}) {
    const url = this.getResourceUrl(params);

    console.log(JSON.stringify(data))

    const jsonData = {};
    const resourceData = {};

    resourceData.name = data.name;
    resourceData.image = data.image;
    resourceData.flavor = data.flavor;
    resourceData.keypair = data.keypair;
    
    //resourceData.boot_dv = data.imageType == "I" ? "" : data.bootvolume;

    const securityGroupsArray = [];
    data.securitygroup.map((name) => {
        securityGroupsArray.push(name);
    });
    resourceData.security_groups = securityGroupsArray;
    
    const networksArray = [];
    data.network.map((name) => {
        let networkName = {}
        networkName.network_name = name;
        networksArray.push(networkName);
    });
    resourceData.networks = networksArray;

    // api에서 이름 넣으면 스크립트 오류 발생 함
    // resourceData.username = globals.user.username; // Failed to validate the cloud-init script 오류나서 안보냄
    resourceData.username = "";
    resourceData.user_script = data.userScript == "" ? data.makeScript : data.userScript;
    //resourceData.user_script = "#cloud-config\npassword: rocky\nchpasswd: {expire: False}\nssh_pwauth: True\nssh_svcname: ssh\nssh_deletekeys: True\nssh_genkeytypes: ['rsa', 'ecdsa']"

    const sriovNetworksArray = [];
    data.sriov.map((name) => {
        sriovNetworksArray.push(name);
    });
    resourceData.sriov_networks = sriovNetworksArray;

    const hostDeviceArray = [];
    resourceData.host_devices = hostDeviceArray;

    const gpuDeviceArray = [];
    resourceData.gpus = gpuDeviceArray;

    if (data.node != "N/A" && data.imageType != "B" && hostDeviceArray.length == 0 && gpuDeviceArray.length == 0) {
        resourceData.node = data.node;
    }

    resourceData.description = data.description;
    resourceData.storage_class = "openebs-hostpath"; // 고정값
    // resourceData.storage_class = "longhorn"; // 고정값

    jsonData.vm = resourceData;

    console.log(JSON.stringify(jsonData))

    const res = await request.post(url, jsonData)
    return res
  }

  @action
  async update({ name, ...params }, data) {

    const jsonData = {};
    const keypairData = {};

    keypairData.name = data.name;
    keypairData.description = data?.description;

    jsonData.keypair = keypairData;

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
    const detail = { ...params, ...this.mapper(result), kind: 'vms' }

    // Yaml 파일 관련 
    await this.fetchYaml(params);

    // VmLog 관련 
    await this.fetchVmLog(params);

    this.detail = detail
    this.isLoading = false

    this.metrics = {
      "cpu":{
      "metric":{
      "namespace":"kdh-project10",
      "node":"worker02",
      "owner_kind":"ReplicaSet",
      "owner_name":"kdh-user10-tomcat-796db49788",
      "pod":"kdh-user10-tomcat-796db49788-jpzlp"
      },
      "values":[
      [
      1693800849.029,
      "0.001"
      ],
      [
      1693800854.036,
      "0.001"
      ],
      [
      1693800859.057,
      "0.001"
      ],
      [
      1693800864.042,
      "0.001"
      ],
      [
      1693800869.032,
      "0.001"
      ],
      [
      1693800874.036,
      "0.001"
      ],
      [
      1693800879.048,
      "0.001"
      ],
      [
      1693800884.057,
      "0.001"
      ],
      [
      1693800889.031,
      "0.001"
      ],
      [
      1693800894.045,
      "0.001"
      ],
      [
      1693800899.035,
      "0.001"
      ],
      [
      1693800904.033,
      "0.001"
      ],
      [
      1693800909.029,
      "0.001"
      ],
      [
      1693800914.036,
      "0.001"
      ],
      [
      1693800919.032,
      "0.001"
      ],
      [
      1693800924.038,
      "0.001"
      ],
      [
      1693800929.083,
      "0.001"
      ],
      [
      1693800934.054,
      "0.001"
      ],
      [
      1693800939.036,
      "0.001"
      ],
      [
      1693800944.076,
      "0.001"
      ],
      [
      1693800949.035,
      "0.001"
      ],
      [
      1693800954.037,
      "0.001"
      ],
      [
      1693800959.041,
      "0.001"
      ],
      [
      1693800964.04,
      "0.001"
      ],
      [
      1693800969.046,
      "0.001"
      ],
      [
      1693800974.047,
      "0.001"
      ],
      [
      1693800979.052,
      "0.001"
      ],
      [
      1693800984.034,
      "0.001"
      ],
      [
      1693800989.111,
      "0.001"
      ],
      [
      1693800993.775,
      "0.001"
      ],
      [
      1693800998.776,
      "0.001"
      ]
      ],
      "min_value":"",
      "max_value":"",
      "avg_value":"",
      "sum_value":"",
      "fee":"",
      "resource_unit":"",
      "currency_unit":""
      },
      "memory":{
      "metric":{
      "namespace":"kdh-project10",
      "node":"worker02",
      "owner_kind":"ReplicaSet",
      "owner_name":"kdh-user10-tomcat-796db49788",
      "pod":"kdh-user10-tomcat-796db49788-jpzlp"
      },
      "values":[
      [
      1693800849.029,
      "154734592"
      ],
      [
      1693800854.036,
      "154734592"
      ],
      [
      1693800859.057,
      "154734592"
      ],
      [
      1693800864.042,
      "154734592"
      ],
      [
      1693800869.032,
      "154734592"
      ],
      [
      1693800874.036,
      "154734592"
      ],
      [
      1693800879.048,
      "154734592"
      ],
      [
      1693800884.057,
      "154734592"
      ],
      [
      1693800889.031,
      "154734592"
      ],
      [
      1693800894.045,
      "154734592"
      ],
      [
      1693800899.035,
      "154734592"
      ],
      [
      1693800904.033,
      "154734592"
      ],
      [
      1693800909.029,
      "154734592"
      ],
      [
      1693800914.036,
      "154734592"
      ],
      [
      1693800919.032,
      "154734592"
      ],
      [
      1693800924.038,
      "154734592"
      ],
      [
      1693800929.083,
      "154734592"
      ],
      [
      1693800934.054,
      "154734592"
      ],
      [
      1693800939.036,
      "154734592"
      ],
      [
      1693800944.076,
      "154734592"
      ],
      [
      1693800949.035,
      "154734592"
      ],
      [
      1693800954.037,
      "154734592"
      ],
      [
      1693800959.041,
      "154734592"
      ],
      [
      1693800964.04,
      "154734592"
      ],
      [
      1693800969.046,
      "154734592"
      ],
      [
      1693800974.047,
      "154734592"
      ],
      [
      1693800979.052,
      "154734592"
      ],
      [
      1693800984.034,
      "154734592"
      ],
      [
      1693800989.111,
      "154734592"
      ],
      [
      1693800993.775,
      "154734592"
      ],
      [
      1693800998.776,
      "154734592"
      ]
      ],
      "min_value":"",
      "max_value":"",
      "avg_value":"",
      "sum_value":"",
      "fee":"",
      "resource_unit":"",
      "currency_unit":""
      }
      }

    return detail
  }

  @action
  async fetchYaml(params) {
    this.isLoading = true
    
    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}/manifest`
    )
    const yamlData = { ...params, ...this.mapper(result), kind: 'vms' }
  
    this.yaml = yamlData.manifest
    this.isLoading = false
    return yamlData
  }

  @action
  async fetchVmLog(params) {
    this.isLoading = true
    
    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}/log`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vms' }
  
    this.vmLog = response.log.message
    this.isLoading = false
    return response
  }

  @action
  async fetchVmEventList(params) {
    this.isLoading = true
    
    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}/event`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vms' }
    
    this.isLoading = false
    return response
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

  @action
  async fetchFloatingList(params) {
    this.isLoading = true
    
    const result = await request.get(
      `/edgetron/resources/kubevirt/floating_ips`
    )
    const dataList = { ...params, ...this.mapper(result), kind: 'floating' }

    this.floatingIpList = dataList.floating_ips
    this.isLoading = false
    return dataList
  }

  // 등록 관련 데이터 시작 
  @action
  async fetchVmListFlavor(params) {
    this.isLoading = true
    
    const result = await request.get(
      `/edgetron/resources/kubevirt/flavors`
    )
    const response = { ...params, ...this.mapper(result), kind: 'flavors' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchVmListImage(params) {
    this.isLoading = true
    
    const result = await request.get(
      `/edgetron/resources/kubevirt/images`
    )
    const response = { ...params, ...this.mapper(result), kind: 'images' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchVmListBootVolume(params) {
    this.isLoading = true
    
    const result = await request.get(
      `/edgetron/resources/kubevirt/volumes/available`
    )
    const response = { ...params, ...this.mapper(result), kind: 'volumes' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchVmListNetwork(params) {
    this.isLoading = true
    
    const result = await request.get(
      `/edgetron/resources/kubevirt/networks`
    )
    const response = { ...params, ...this.mapper(result), kind: 'networks' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchVmListSriovNetwork(params) {
    this.isLoading = true
    
    const result = await request.get(
      `/edgetron/resources/kubevirt/sriov_networks`
    )
    const response = { ...params, ...this.mapper(result), kind: 'sriov_networks' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchVmListKeypair(params) {
    this.isLoading = true
    
    const result = await request.get(
      `/edgetron/resources/kubevirt/keypairs`
    )
    const response = { ...params, ...this.mapper(result), kind: 'keypairs' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchVmListNode(params) {
    this.isLoading = true
    
    const result = await request.get(
      `/edgetron/resources/kubevirt/nodes`
    )
    const response = { ...params, ...this.mapper(result), kind: 'nodes' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchVmListSecurityGroup(params) {
    this.isLoading = true
    
    const result = await request.get(
      `/edgetron/resources/kubevirt/security_groups`
    )
    const response = { ...params, ...this.mapper(result), kind: 'security_groups' }

    const securityArray = [];
    const promises = (response.security_groups).map(async (security) => {

      const securityDetail = await axios.get("/edgetron/resources/kubevirt/security_groups/"+security.name);

      securityDetail.data.security_group.egress_count = (securityDetail.data.security_group.rules).filter(el => el.direction == "egress").length;
      securityDetail.data.security_group.ingress_count = (securityDetail.data.security_group.rules).filter(el => el.direction == "ingress").length;

      securityArray.push(securityDetail.data.security_group)
    })

    await Promise.all(promises);

    this.isLoading = false
    return securityArray;
  }

  // 등록 관련 데이터 끝

}
