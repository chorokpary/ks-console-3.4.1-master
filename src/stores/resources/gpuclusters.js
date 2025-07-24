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

  getVmResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
  )}/edgetron/resources/kubevirt/vms`

  getResourceUrl = (params = {}) => `kapis/gpucluster.kubesphere.io/v1alpha1/gpu-cluster/clusters`
  getResourceDetailUrl = (params = {}) => `kapis/gpucluster.kubesphere.io/v1alpha1/gpu-cluster/cluster`

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

    // 초기 정렬 처리
    data.sort((a, b) => {
      return a.creation_timestamp < b.creation_timestamp
        ? 1
        : a.creation_timestamp > b.creation_timestamp
          ? -1
          : 0
    })

    // 상태 추가
    const updatedData = await Promise.all(    
      data.map(async (item) => {      
        const state = Number(item.assigned_vm_count) == Number(item.total_node_count) ? "normal" : "abnormal";
        return {
          ...item,
          state,
        };
      })
    );
    
    // 초기 데이터 처리
    this.dataList = updatedData

    // namespace(project) 있는 경우
    if (namespace) {
      params.project = namespace
    }

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
          if (search.searchKeywordType === 'state') {
            return row[search.searchKeywordType]?.toLowerCase() === search.searchKeywordText.toLowerCase();
          }
          return row[search.searchKeywordType]?.toLowerCase().includes(search.searchKeywordText.toLowerCase());
        });
        this.dataList = resultList;
      })
    }

    // 전체 데이터 갯수
    const total = this.dataList.length || 0

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
    const url = this.getVmResourceUrl(params)

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

    resourceData.secure_boot = data.secureBoot

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

    const physicalnetworksArray = []
    if (data.physicalnetwork && Array.isArray(data.physicalnetwork)) {
      data.physicalnetwork.forEach(name => {
        const physicalnetworkObj = {}
        physicalnetworkObj.network_name = name
        const fixedIpObj = data.physicalnetworkIps.find(
          obj => obj.network_name === name
        )
        if (fixedIpObj !== undefined) {
          physicalnetworksArray.push(fixedIpObj)
        } else {
          physicalnetworksArray.push(physicalnetworkObj)
        }
      })
    }    
    resourceData.physical_networks = physicalnetworksArray

    const hostDeviceArray = []
    resourceData.host_devices = hostDeviceArray

    const gpuDeviceArray = []
    resourceData.gpus = gpuDeviceArray

    resourceData.node = ""
    resourceData.description = data.description
    resourceData.storage_class = data.storageClass
    // resourceData.network_storage = data.networkStorage
    resourceData.network_storage = ""

    jsonData.vm = resourceData

    const promises = [];

    let firstNum = 1;
    let lastNum = 1;

    if(data.vm_count == 1){
      firstNum = parseInt((data.gpuVmName).slice(-3), 10);
      lastNum = firstNum;
    }else{
      firstNum = parseInt((data.firstGpuVmName).slice(-3), 10);
      lastNum = parseInt((data.lastGpuVmName).slice(-3), 10);
    }

    // 가상머신 갯수만큼 생성...
    for (let i = firstNum; i <= lastNum; i++) {
      const suffix = String(i).padStart(3, "0");
      const updatedNameJsonData = {
        vm: {
          ...jsonData.vm,
          name: `${data.gpu_cluster}-${suffix}`,
        },
      }
      console.log("updatedNameJsonData : "+ JSON.stringify(updatedNameJsonData))
      request.post(url, updatedNameJsonData);
    }

    return await this.submitting(new Promise(resolve => setTimeout(resolve, 3000)));
  }

  @action
  async update({ name, ...params }, data) {

  }

  @action
  async fetchDetail(params) {
    this.isLoading = true;

    const page = 1
    const limit = 10000

    const resultList = await request.get(
      this.getListUrl({ page, limit }),
    )
    const namespace = (resultList.data).filter(item => item.description === params.name).map(item => item.namespace)

    const result = await request.get(
      `${this.getResourceDetailUrl(params)}/${namespace}`
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

  @action
  async fetchVmsDetail({ cluster, workspace, namespace, ...params } = {}) {
    this.isLoading = true

    params.page = params.page || 1
    params.limit = params.limit || 10

    const name = params.name;

    const perPage = Number(params.limit) || 10;
    const currentPage = Number(params.page) || 1;
 
    delete params['resource']
    delete params['id']
    delete params['name']

    const result = await request.get(
      `${this.getResourceDetailUrl(params)}/${name}`
    )

    // 실제 할당된 가상머신 데이터
    const vmData = (result.data.nodes).filter(item => item.vmi)

    // 데이터 검색
    let searchData = [];
    if (params.searchName !== '' && params.searchName !== undefined) {
         searchData = vmData.filter((row) => {
          return get(row.vmi, params.searchType)?.toLowerCase().includes(params.searchName?.toLowerCase());
      });      
    }

    delete params['searchType']
    delete params['searchName']    

    const dataList = searchData.length == 0 ? vmData : searchData;

    // 정렬 처리
    const sortedList = [...dataList].sort((a, b) => {
      return a.vmi.vm_name < b.vmi.vm_name ? 1 : a.vmi.vm_name > b.vmi.vm_name ? -1 : 0;
    });

    // 데이터 page 별 Slice 처리 
    const currentData = sortedList.slice((currentPage - 1) * perPage, (currentPage) * perPage);

    const resultData = {}
    resultData.vmList = currentData;
    resultData.total = dataList.length;

    this.isLoading = false
    return resultData
  }
  
}
