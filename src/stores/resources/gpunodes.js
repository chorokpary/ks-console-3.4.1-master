/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
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

import Base from '../basemm3';
import List from '../base.list';

export default class GpuNodeStore extends Base {
  records = new List();

  module = 'gpunodes';

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/kubevirt/gpunodes`;

  getListUrl = this.getResourceUrl;

  @action
  async fetchDetail(params) {
    this.isLoading = true;

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}`
    );
    const detail = { ...params, ...this.mapper(result), kind: 'GpuNodes' };

    this.detail = detail;

    // fetch GPU devices
    await this.fetchGpuDeviceList(params);

    this.isLoading = false;
    return detail;
  }

  @action
  async fetchGpuDeviceList(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/gpu/devices/${params.name}`
    );
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'devices',
    };
    this.gpuDeviceList = response.devices;
    return response;
  }

  @action
  async fetchMigConfigs(params) {
    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/gpu/mig_configs/${params.name}`
    );
    const response = {
      ...params,
      ...this.mapper(result),
      kind: 'mig_configs',
    };
    this.migConfigList = response.mig_configs;
    return response;
  }
}
