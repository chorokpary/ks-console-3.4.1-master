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

  module = 'keypairs';

  getResourceUrl = (params = {}) =>
    `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
      params
    )}/edgetron/resources/kubevirt/keypairs`;

  getListUrl = this.getResourceUrl;

  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.id}`;

  @action
  async create(data, params = {}) {

    const getResourceUrlTmp = (params = {}) =>
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/keypairs`;

    //const url = this.getResourceUrl(params);
    const url = getResourceUrlTmp(params);

    const jsonData = {};
    const keypairData = {};

    keypairData.name = data.name;
    keypairData.public_key = data.publicKey;
    keypairData.project = data.project;
    keypairData.description = data?.description;

    jsonData.keypair = keypairData;

    const res = await this.submitting(request.post(url, jsonData));
    return res;
  }

  @action
  async update({ name, ...params }, data) {
    const jsonData = {};
    const keypairData = {};

    keypairData.id = data.id;
    keypairData.description = data?.description;

    jsonData.keypair = keypairData;

    await this.submitting(
      request.put(this.getDetailUrl({ name, ...params }), jsonData)
    );
  }

  @action
  async fetchDetail(params) {
    this.isLoading = true;

    const result = await request.get(
      `${this.getResourceUrl(params)}/${params.id}`
    );
    const detail = { ...params, ...this.mapper(result), kind: 'Keypairs' };

    // Yaml 파일 관련
    await this.fetchYaml(params);

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
    const yamlData = { ...params, ...this.mapper(result), kind: 'Keypairs' };

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
}
