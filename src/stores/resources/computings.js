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

export default class ComputingStore extends Base {


  @action
  async fetchComputingData({
    cluster,
    workspace,
    namespace,
    more,
    devops,
    silent,
    ...params
  } = {}) {
    this.isLoading = true

    const apiUrl = 'edgetron/resources/kubevirt/';

    const apiArray = [
                      {num : 1, type : 'vms', name : t('RESOURCES_VM'), routeName : 'vms', multitenancy: true, icon : 'ico-type-vm', createField : 'creation_timestamp'},
                      {num : 2, type : 'images', name : t('RESOURCES_VM_IMAGE'), routeName : 'images', multitenancy: false, icon : 'snapshot', createField : 'timestamp'},
                      {num : 3, type : 'volumes', name : t('RESOURCES_VOLUME'), routeName : 'resourcesVolumes', multitenancy: true, icon : 'storage', createField : 'timestamp'},
                      {num : 4, type : 'flavors', name : t('RESOURCES_FLAVOR'), routeName : 'flavors', multitenancy: false, icon : 'apps', createField : 'timestamp'},
                      {num : 5, type : 'keypairs', name : t('RESOURCES_KEYPAIR'), routeName : 'keypairs', multitenancy: true, icon : 'key', createField : 'timestamp'},
                      {num : 6, type : 'networks', name : t('RESOURCES_NETWORK'), routeName : 'networks', multitenancy: true, icon : 'network-duotone', createField : 'timestamp'},
                      {num : 7, type : 'sriov_networks', name : t('RESOURCES_SR_IOV_NETWORK'), routeName : 'sriovs', multitenancy: true, icon : 'ico-type-sriov', createField : ''},
                      {num : 8, type : 'routers', name : t('RESOURCES_VROUTER'), routeName : 'routers', multitenancy: true, icon : 'router', createField : 'timestamp'},
                      {num : 9, type : 'floating_ips', name : t('RESOURCES_FLOATING_IP'), routeName : 'floatingip', multitenancy: false, icon : 'intranet-routers', createField : 'not'},
                      {num : 10, type : 'lbs', name : t('RESOURCES_LOAD_BALANCER'), routeName : 'loadBalancers', multitenancy: true, icon : 'loadbalancer', createField : 'timestamp'},                      
                      {num : 11, type : 'security_groups', name : t('RESOURCES_SECURITY_GROUP'), routeName : 'securityGroups', multitenancy: true, icon : 'shield', createField : 'timestamp'},
                      {num : 12, type : 'host_devices', name : t('RESOURCES_HOST_DEVICE'), routeName : 'hostDevices', multitenancy: false, icon : 'ico-type-hostdevice', createField : 'not'},
                      {num : 13, type : 'mediated_devices', name : t('RESOURCES_MEDIATED_DEVICE'), routeName : 'mediatedDevices', multitenancy: false, icon : 'ico-type-mediatedvgpu', createField : 'not'},
                    ];

    const computingDataArray = [];
   
    const promises = apiArray.map(async (item) => {
      const result = get(await request.get(`${apiUrl}/${item.type}`), item.type, []);
      const resultCount = item.multitenancy ? result.filter(item => item.project == namespace).length : result.length;
      computingDataArray.push({count : resultCount, name : item.name, routeName : item.routeName, icon : item.icon, dataList: result, createField : item.createField});
    })
    
    await Promise.all(promises);

    this.resources = computingDataArray;
    this.isLoading = false
  }

}
