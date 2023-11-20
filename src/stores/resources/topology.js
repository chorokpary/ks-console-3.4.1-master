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

export default class TopologyStore extends Base {

  module = 'topology'

  @action
  async fetchData(params) {
    this.isLoading = true

    this.vmList = get(await this.fetchVmList(params), "vms", []);
    this.networkList = get(await this.fetchListNetwork(params), "networks", []);
    this.sriovList = get(await this.fetchListSriovNetwork(params), "networks", []);
    this.routerList = get(await this.fetchListRouter(params), "routers", []);
    this.floatingList = get(await this.fetchListFloating(params), "floating_ips", []);
    this.loadbalancerList = get(await this.fetchListLoadBalancer(params), "lbs", []);
    
    this.isLoading = false    
  }


  @action
  async fetchVmList(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/kubevirt/vms`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vms' }

    this.isLoading = false
    return response;
  }


  @action
  async fetchListNetwork(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/kubevirt/networks`
    )
    const response = { ...params, ...this.mapper(result), kind: 'networks' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchListSriovNetwork(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/kubevirt/sriov_networks`
    )
    
    const response = { ...params, ...this.mapper(result), kind: 'sriov_networks' }

    this.isLoading = false
    return response;
  }


  @action
  async fetchListRouter(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/kubevirt/routers`
    )
    const response = { ...params, ...this.mapper(result), kind: 'routers' }

    this.isLoading = false
    return response;
  }

  @action
  async fetchListFloating(params) {
    this.isLoading = true

    const result = await request.get(
      `/edgetron/resources/kubevirt/floating_ips`
    )
    const response = { ...params, ...this.mapper(result), kind: 'floating_ips' }

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

    this.isLoading = false
    return response;
  }
}
