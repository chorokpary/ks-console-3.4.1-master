/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2025 The KubeSphere Console Authors.
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

import { action } from 'mobx';
import { Notify } from '@kube-design/components';

import Base from '../basemm3';
import List from '../base.list';

export default class LicenseStore extends Base {
  records = new List();

  module = 'licenses';

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/licenses`;

  getListUrl = this.getResourceUrl;

  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}`;

  @action
  async create(data, params = {}) {

    const getResourceUrlTmp = (params = {}) =>
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/licenses`;

    const url = getResourceUrlTmp(params);

    const jsonData = {};
    const licenseData = {};

    licenseData.name = data.name;
    licenseData.payload = data.payload;
    licenseData.inuse = data.inuse;
    licenseData.description = data.description;

    jsonData.license = licenseData;

    const res = await this.submitting(request.post(url, jsonData));
    return res;
  }

  @action
  async update({ name, ...params }, data) {
    const jsonData = {};
    const licenseData = {};

    licenseData.name = data.name;
    licenseData.description = data?.description;

    jsonData.license = licenseData;

    await this.submitting(
      request.put(this.getDetailUrl({ name, ...params }), jsonData)
    );
  }

  @action
  async setDefault({ name, ...params }, data) {
    const jsonData = {};
    const licenseData = {};

    licenseData.name = data.name;

    jsonData.license = licenseData;

    await this.submitting(
      request.put(this.getDetailUrl({ name, ...params }), jsonData)
    );
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true;

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.name}`
    );
    const detail = { ...params, ...this.mapper(result), kind: 'Licenses' };

    this.detail = detail;
    this.isLoading = false;
    return detail;
  }

  @action
  async batchDelete({ rowKeys, ...params }) {
    if (rowKeys.includes(globals.user.username)) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'));
    } else {
      await this.submitting(
        Promise.all(
          rowKeys.map(name =>
            request.delete(`${this.getDetailUrl({ name, ...params })}`)
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
}