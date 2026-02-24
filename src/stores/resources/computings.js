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

    const kubevirtApiUrl = `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath({ cluster, namespace })}/edgetron/resources/kubevirt`;
    const capkApiUrl = `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath({ cluster, namespace })}/edgetron/resources/capk`

    const apiArray = [
      { num: 1, category: 'kubevirt', type: 'vms', root: 'vms', name: t('RESOURCES_VM'), routeName: 'vms', multitenancy: true, icon: 'ico-type-vm', createField: 'creation_timestamp' },
      { num: 2, category: 'capk', type: 'clusters', root: 'clusters', name: t('RESOURCES_KAAS_RESOURCE'), routeName: 'containerResource', multitenancy: true, icon: 'kubernetes', createField: 'timestamp' },
      { num: 3, category: 'kubevirt', type: 'images', root: 'images', name: t('RESOURCES_VM_IMAGE'), routeName: 'images', multitenancy: false, icon: 'snapshot', createField: 'timestamp' },
      { num: 4, category: 'capk',type: 'images', root: 'images', name: t('RESOURCES_KAAS_IMAGE'), routeName: 'containerImages', multitenancy: false, icon: 'snapshot', createField: 'timestamp' },
      { num: 5, category: 'kubevirt', type: 'volumes', root: 'volumes', name: t('RESOURCES_VOLUME'), routeName: 'resourcesVolumes', multitenancy: true, icon: 'storage', createField: 'timestamp' },
      { num: 6, category: 'kubevirt', type: 'network_storages', root: 'network_storages', name: t('RESOURCES_NETWORK_STORAGE'), routeName: 'networkstorages', multitenancy: true, icon: 'storage', createField: 'timestamp' },
      { num: 7, category: 'kubevirt', type: 'flavors', root: 'flavors', name: t('RESOURCES_FLAVOR'), routeName: 'flavors', multitenancy: false, icon: 'apps', createField: 'timestamp' },
      { num: 8, category: 'kubevirt', type: 'keypairs', root: 'keypairs', name: t('RESOURCES_KEYPAIR'), routeName: 'keypairs', multitenancy: true, icon: 'key', createField: 'timestamp' },
      { num: 9, category: 'kubevirt', type: 'networks', root: 'networks', name: t('RESOURCES_NETWORK'), routeName: 'networks', multitenancy: true, icon: 'network-duotone', createField: 'timestamp' },
      { num: 10, category: 'kubevirt', type: 'sriov_networks', root: 'sriovs', name: t('RESOURCES_SR_IOV_NETWORK'), routeName: 'sriovs', multitenancy: true, icon: 'ico-type-sriov', createField: 'timestamp' },
      { num: 11, category: 'kubevirt', type: 'physical_networks', root: 'physicalnetworks', name: t('RESOURCES_DEDICATED_NETWORK'), routeName: 'physicalnetworks', multitenancy: true, icon: 'ico-type-sriov', createField: 'timestamp' },
      { num: 12, category: 'kubevirt', type: 'routers', root: 'routers', name: t('RESOURCES_VROUTER'), routeName: 'routers', multitenancy: true, icon: 'router', createField: 'timestamp' },
      { num: 13, category: 'kubevirt', type: 'floating_ips', root: 'floating_ips', name: t('RESOURCES_FLOATING_IP'), routeName: 'floatingip', multitenancy: true, icon: 'intranet-routers', createField: 'not' },
      { num: 14, category: 'kubevirt', type: 'lbs', root: 'lbs', name: t('RESOURCES_LOAD_BALANCER'), routeName: 'loadBalancers', multitenancy: true, icon: 'loadbalancer', createField: 'timestamp' },
      { num: 15, category: 'kubevirt', type: 'security_groups', root: 'security_groups', name: t('RESOURCES_SECURITY_GROUP'), routeName: 'securityGroups', multitenancy: true, icon: 'shield', createField: 'timestamp' },
      { num: 16, category: 'kubevirt', type: 'host_devices', root: 'host_devices', name: t('RESOURCES_HOST_DEVICE'), routeName: 'hostdevices', multitenancy: false, icon: 'ico-type-hostdevice', createField: 'timestamp' },
      { num: 17, category: 'kubevirt', type: 'mediated_devices', root: 'mediated_devices', name: t('RESOURCES_MEDIATED_DEVICE'), routeName: 'mediateddevices', multitenancy: false, icon: 'ico-type-mediatedvgpu', createField: 'timestamp' },
    ];

    const computingDataArray = [];

    const promises = apiArray.map(async (item) => {
      const pagedModule = ['vms', 'volumes']

      let result = [];
      let resultCount = 0;

      if(pagedModule.includes(item.type)){
        result = get(await request.get(`${kubevirtApiUrl}/${item.type}?project=${namespace}&limit=-1`), item.root, []);
        resultCount = result.length;
      }else{
        if (item.category == "kubevirt") {
          result = get(await request.get(`${kubevirtApiUrl}/${item.type}`), item.root, []);
        } else {
          result = get(await request.get(`${capkApiUrl}/${item.type}`), item.root, []);
        }
        resultCount = item.multitenancy ? result.filter(item => item.project == namespace).length : result.length;
      }

      computingDataArray.push({ num: item.num, count: resultCount, name: item.name, routeName: item.routeName, icon: item.icon, dataList: result, createField: item.createField, multitenancy: item.multitenancy });
    })

    await Promise.all(promises);

    await computingDataArray.sort((a, b) => {
      var x = a["num"];
      var y = b["num"];
      return x < y ? -1 : x > y ? 1 : 0;
    });

    this.resources = computingDataArray;
    this.isLoading = false
  }
}
