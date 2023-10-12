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
    const mm3Array = ['vms', 'images', 'flavors', 'networks', 'routers', 'floating_ips', 'lbs', 'security_groups', 'keypairs', 'host_devices', 'pci_devices', 'volumes', 'clusters', 'workspaces', 'licenses', 'distro_types', 'containerimages', 'resourcesvolumes']
    const apiName = mm3Array.includes(this.module) ? this.module : "";

    const data = (get(result, apiName) || []).map(item => ({
      cluster,
      namespace,
      ...this.mapper(item),
    }))

    // VMS 일때 Flavor, Image 정보 추가 
    const vmArray = [];
    if (apiName == "vms") {

      const promises = data.map(async (vm) => {

        const flavorDetail = await axios.get("/edgetron/resources/kubevirt/flavors/" + vm.flavor);
        vm.flavor_detail = flavorDetail.data.flavor;

        const imageDetail = await axios.get("/edgetron/resources/kubevirt/images/" + vm.image);
        vm.image_detail = imageDetail.data.image;

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

    // console.log(this.dataList)

    return this.dataList
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

    const scurityGroups = data.scurityGroups;

    const jsonData = {};
    const vmData = {};

    vmData.name = name;
    vmData.description = !!data.description ? data.description : "";

    jsonData.vm = vmData;

    console.log("jsonData : " + JSON.stringify(jsonData))

    // API 에서 수정이 안됨
    await this.submitting(
      request.put(this.getDetailUrl({ name, ...params }), jsonData)
    )

    const jsonDataSecurity = {};
    const vmDataSecurity = {};

    vmDataSecurity.name = name;
    vmDataSecurity.security_groups = scurityGroups;

    jsonDataSecurity.vm = vmDataSecurity;

    console.log("jsonDataSecurity : " + JSON.stringify(jsonDataSecurity))

    await this.submitting(
      request.put("/edgetron/resources/kubevirt/vms/" + name + "/security_groups", jsonDataSecurity)
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

    // FloatingIp 관련
    await this.fetchVmListFloating(params);

    this.detail = detail
    this.isLoading = false

    this.metrics = {
      "node_disk_write_throughput": {
        "metric_name": "node_disk_write_throughput",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:data_volume_throughput_bytes_written:sum",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "104379.73333333334"
                ],
                [
                  1696394074,
                  "172305.06666666665"
                ],
                [
                  1696394134,
                  "120763.73333333334"
                ],
                [
                  1696394194,
                  "91067.73333333334"
                ],
                [
                  1696394254,
                  "97826.13333333333"
                ],
                [
                  1696394314,
                  "99464.53333333333"
                ],
                [
                  1696394374,
                  "176742.4"
                ],
                [
                  1696394434,
                  "133734.40000000002"
                ],
                [
                  1696394494,
                  "91886.93333333333"
                ],
                [
                  1696394554,
                  "106837.33333333333"
                ],
                [
                  1696394614,
                  "104243.2"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_load5": {
        "metric_name": "node_load5",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:load5:ratio",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0.01625"
                ],
                [
                  1696394074,
                  "0.015625"
                ],
                [
                  1696394134,
                  "0.014375"
                ],
                [
                  1696394194,
                  "0.01375"
                ],
                [
                  1696394254,
                  "0.013125"
                ],
                [
                  1696394314,
                  "0.01125"
                ],
                [
                  1696394374,
                  "0.010625"
                ],
                [
                  1696394434,
                  "0.01625"
                ],
                [
                  1696394494,
                  "0.014375"
                ],
                [
                  1696394554,
                  "0.021875"
                ],
                [
                  1696394614,
                  "0.031875"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_device_size_utilisation": {
        "metric_name": "node_device_size_utilisation",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "device": "/dev/mapper/ubuntu--vg-ubuntu--lv",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0.3635282714024395"
                ],
                [
                  1696394074,
                  "0.36353425624299585"
                ],
                [
                  1696394134,
                  "0.36353937485662957"
                ],
                [
                  1696394194,
                  "0.3635444934702633"
                ],
                [
                  1696394254,
                  "0.3635496514578481"
                ],
                [
                  1696394314,
                  "0.36355480944543284"
                ],
                [
                  1696394374,
                  "0.36355996743301766"
                ],
                [
                  1696394434,
                  "0.3635650466727003"
                ],
                [
                  1696394494,
                  "0.363570125912383"
                ],
                [
                  1696394554,
                  "0.3634744865853342"
                ],
                [
                  1696394614,
                  "0.36347960519896805"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            },
            {
              "metric": {
                "device": "/dev/vda2",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0.1679273614942044"
                ],
                [
                  1696394074,
                  "0.1679273614942044"
                ],
                [
                  1696394134,
                  "0.1679273614942044"
                ],
                [
                  1696394194,
                  "0.1679273614942044"
                ],
                [
                  1696394254,
                  "0.1679273614942044"
                ],
                [
                  1696394314,
                  "0.1679273614942044"
                ],
                [
                  1696394374,
                  "0.1679273614942044"
                ],
                [
                  1696394434,
                  "0.1679273614942044"
                ],
                [
                  1696394494,
                  "0.1679273614942044"
                ],
                [
                  1696394554,
                  "0.1679273614942044"
                ],
                [
                  1696394614,
                  "0.1679273614942044"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_disk_read_iops": {
        "metric_name": "node_disk_read_iops",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:data_volume_iops_reads:sum",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0"
                ],
                [
                  1696394074,
                  "0.6333333333333333"
                ],
                [
                  1696394134,
                  "0"
                ],
                [
                  1696394194,
                  "0"
                ],
                [
                  1696394254,
                  "0"
                ],
                [
                  1696394314,
                  "0"
                ],
                [
                  1696394374,
                  "0.5"
                ],
                [
                  1696394434,
                  "0"
                ],
                [
                  1696394494,
                  "0"
                ],
                [
                  1696394554,
                  "0"
                ],
                [
                  1696394614,
                  "0"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_disk_inode_utilisation": {
        "metric_name": "node_disk_inode_utilisation",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:disk_inode_utilization:ratio",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0.06780567735728649"
                ],
                [
                  1696394074,
                  "0.06780582843440597"
                ],
                [
                  1696394134,
                  "0.06780582843440597"
                ],
                [
                  1696394194,
                  "0.06780582843440597"
                ],
                [
                  1696394254,
                  "0.06780582843440597"
                ],
                [
                  1696394314,
                  "0.06780582843440597"
                ],
                [
                  1696394374,
                  "0.06780597951152534"
                ],
                [
                  1696394434,
                  "0.06780597951152534"
                ],
                [
                  1696394494,
                  "0.06780597951152534"
                ],
                [
                  1696394554,
                  "0.06780597951152534"
                ],
                [
                  1696394614,
                  "0.06780597951152534"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_disk_read_throughput": {
        "metric_name": "node_disk_read_throughput",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:data_volume_throughput_bytes_read:sum",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0"
                ],
                [
                  1696394074,
                  "15291.733333333334"
                ],
                [
                  1696394134,
                  "0"
                ],
                [
                  1696394194,
                  "0"
                ],
                [
                  1696394254,
                  "0"
                ],
                [
                  1696394314,
                  "0"
                ],
                [
                  1696394374,
                  "16930.133333333335"
                ],
                [
                  1696394434,
                  "0"
                ],
                [
                  1696394494,
                  "0"
                ],
                [
                  1696394554,
                  "0"
                ],
                [
                  1696394614,
                  "0"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_disk_inode_total": {
        "metric_name": "node_disk_inode_total",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:node_inodes_total:",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "6619136"
                ],
                [
                  1696394074,
                  "6619136"
                ],
                [
                  1696394134,
                  "6619136"
                ],
                [
                  1696394194,
                  "6619136"
                ],
                [
                  1696394254,
                  "6619136"
                ],
                [
                  1696394314,
                  "6619136"
                ],
                [
                  1696394374,
                  "6619136"
                ],
                [
                  1696394434,
                  "6619136"
                ],
                [
                  1696394494,
                  "6619136"
                ],
                [
                  1696394554,
                  "6619136"
                ],
                [
                  1696394614,
                  "6619136"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_disk_write_iops": {
        "metric_name": "node_disk_write_iops",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:data_volume_iops_writes:sum",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "15.216666666666667"
                ],
                [
                  1696394074,
                  "29.116666666666667"
                ],
                [
                  1696394134,
                  "18.46666666666667"
                ],
                [
                  1696394194,
                  "12.366666666666667"
                ],
                [
                  1696394254,
                  "14.15"
                ],
                [
                  1696394314,
                  "13.916666666666668"
                ],
                [
                  1696394374,
                  "29.6"
                ],
                [
                  1696394434,
                  "21.15"
                ],
                [
                  1696394494,
                  "13.100000000000001"
                ],
                [
                  1696394554,
                  "14.183333333333334"
                ],
                [
                  1696394614,
                  "15.133333333333333"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_load1": {
        "metric_name": "node_load1",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:load1:ratio",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0.006875"
                ],
                [
                  1696394074,
                  "0.010625"
                ],
                [
                  1696394134,
                  "0.00875"
                ],
                [
                  1696394194,
                  "0.01"
                ],
                [
                  1696394254,
                  "0.008125"
                ],
                [
                  1696394314,
                  "0.005"
                ],
                [
                  1696394374,
                  "0.006875"
                ],
                [
                  1696394434,
                  "0.021875"
                ],
                [
                  1696394494,
                  "0.011875"
                ],
                [
                  1696394554,
                  "0.040625"
                ],
                [
                  1696394614,
                  "0.0625"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_memory_utilisation": {
        "metric_name": "node_memory_utilisation",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:node_memory_utilisation:",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0.33787382752776285"
                ],
                [
                  1696394074,
                  "0.3382347665549358"
                ],
                [
                  1696394134,
                  "0.33867941219895814"
                ],
                [
                  1696394194,
                  "0.3405404811788234"
                ],
                [
                  1696394254,
                  "0.33898959036226906"
                ],
                [
                  1696394314,
                  "0.3401858872596333"
                ],
                [
                  1696394374,
                  "0.3401663638504556"
                ],
                [
                  1696394434,
                  "0.3391377242294049"
                ],
                [
                  1696394494,
                  "0.34005361616245433"
                ],
                [
                  1696394554,
                  "0.341503473336514"
                ],
                [
                  1696394614,
                  "0.33917042593977764"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_disk_size_utilisation": {
        "metric_name": "node_disk_size_utilisation",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:disk_space_utilization:ratio",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0.359765620776316"
                ],
                [
                  1696394074,
                  "0.359771490490291"
                ],
                [
                  1696394134,
                  "0.3597765106404013"
                ],
                [
                  1696394194,
                  "0.35978153079051145"
                ],
                [
                  1696394254,
                  "0.3597865895571609"
                ],
                [
                  1696394314,
                  "0.3597916483238105"
                ],
                [
                  1696394374,
                  "0.35979670709045997"
                ],
                [
                  1696394434,
                  "0.35980168862403095"
                ],
                [
                  1696394494,
                  "0.3598066701576018"
                ],
                [
                  1696394554,
                  "0.35971287058361945"
                ],
                [
                  1696394614,
                  "0.35971789073372973"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_load15": {
        "metric_name": "node_load15",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:load15:ratio",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0.02"
                ],
                [
                  1696394074,
                  "0.02"
                ],
                [
                  1696394134,
                  "0.019375"
                ],
                [
                  1696394194,
                  "0.018125"
                ],
                [
                  1696394254,
                  "0.0175"
                ],
                [
                  1696394314,
                  "0.016875"
                ],
                [
                  1696394374,
                  "0.01625"
                ],
                [
                  1696394434,
                  "0.0175"
                ],
                [
                  1696394494,
                  "0.016875"
                ],
                [
                  1696394554,
                  "0.01875"
                ],
                [
                  1696394614,
                  "0.0225"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_net_bytes_transmitted": {
        "metric_name": "node_net_bytes_transmitted",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:node_net_bytes_transmitted:sum_irate",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "253522.25"
                ],
                [
                  1696394074,
                  "248501.94999999998"
                ],
                [
                  1696394134,
                  "245231.76666666666"
                ],
                [
                  1696394194,
                  "243754.8"
                ],
                [
                  1696394254,
                  "244704.66666666666"
                ],
                [
                  1696394314,
                  "256082.65000000002"
                ],
                [
                  1696394374,
                  "245878.55"
                ],
                [
                  1696394434,
                  "246124.88333333333"
                ],
                [
                  1696394494,
                  "243770.7166666667"
                ],
                [
                  1696394554,
                  "244200.59999999998"
                ],
                [
                  1696394614,
                  "244701.14999999997"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_cpu_utilisation": {
        "metric_name": "node_cpu_utilisation",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:node_cpu_utilisation:avg1m",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "0.02236458333327391"
                ],
                [
                  1696394074,
                  "0.02997916666666545"
                ],
                [
                  1696394134,
                  "0.02000000000007276"
                ],
                [
                  1696394194,
                  "0.02086458333327149"
                ],
                [
                  1696394254,
                  "0.019760416666667877"
                ],
                [
                  1696394314,
                  "0.020343750000059422"
                ],
                [
                  1696394374,
                  "0.021354166666636348"
                ],
                [
                  1696394434,
                  "0.019510416666707896"
                ],
                [
                  1696394494,
                  "0.020041666666656965"
                ],
                [
                  1696394554,
                  "0.02143749999992603"
                ],
                [
                  1696394614,
                  "0.019885416666814607"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_disk_inode_usage": {
        "metric_name": "node_disk_inode_usage",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "448815"
                ],
                [
                  1696394074,
                  "448816"
                ],
                [
                  1696394134,
                  "448816"
                ],
                [
                  1696394194,
                  "448816"
                ],
                [
                  1696394254,
                  "448816"
                ],
                [
                  1696394314,
                  "448816"
                ],
                [
                  1696394374,
                  "448817"
                ],
                [
                  1696394434,
                  "448817"
                ],
                [
                  1696394494,
                  "448817"
                ],
                [
                  1696394554,
                  "448817"
                ],
                [
                  1696394614,
                  "448817"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
      },
      "node_net_bytes_received": {
        "metric_name": "node_net_bytes_received",
        "data": {
          "resultType": "matrix",
          "result": [
            {
              "metric": {
                "__name__": "node:node_net_bytes_received:sum_irate",
                "host_ip": "192.168.16.88",
                "node": "worker02"
              },
              "values": [
                [
                  1696394014,
                  "236248.9833333333"
                ],
                [
                  1696394074,
                  "237016.56666666665"
                ],
                [
                  1696394134,
                  "233855.3"
                ],
                [
                  1696394194,
                  "230542.90000000002"
                ],
                [
                  1696394254,
                  "233588.76666666666"
                ],
                [
                  1696394314,
                  "239926.56666666668"
                ],
                [
                  1696394374,
                  "234154.0166666667"
                ],
                [
                  1696394434,
                  "234944.68333333335"
                ],
                [
                  1696394494,
                  "231958.3"
                ],
                [
                  1696394554,
                  "232633.90000000002"
                ],
                [
                  1696394614,
                  "233587.43333333332"
                ]
              ],
              "min_value": "",
              "max_value": "",
              "avg_value": "",
              "sum_value": "",
              "fee": "",
              "resource_unit": "",
              "currency_unit": ""
            }
          ]
        }
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
  async actionState({ data, ...params }) {

    const jsonData = {};
    const name = data.vmName;
    jsonData.action = data.actionType;

    await this.submitting(
      request.put(`${this.getDetailUrl({ name: name, ...params })}/action`, jsonData)
    )
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
  async fetchVmListRouter(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/kubevirt/routers`
    )
    const response = { ...params, ...this.mapper(result), kind: 'routers' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchVmListFloating(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/kubevirt/floating_ips`
    )
    const response = { ...params, ...this.mapper(result), kind: 'floating_ips' }

    this.floatingList = response.floating_ips
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

      const securityDetail = await axios.get("/edgetron/resources/kubevirt/security_groups/" + security.name);

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
