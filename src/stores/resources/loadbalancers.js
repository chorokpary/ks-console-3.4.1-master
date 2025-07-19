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

import { observable, action } from 'mobx'
import { Notify } from '@kube-design/components'

import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class LoadBalancerStore extends Base {

    records = new List()

    networkDataList = [];
    floatingIpsList = [];

    module = 'lbs'

    getResourceUrl = (params = {}) => `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/lbs`
    getListUrl = this.getResourceUrl
    getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}`
    getDeleteUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}/${params.project}`

    @action
    async create(data, params = {}) {

        let res = await this.submitting(request.post(this.getListUrl(params), data))
        if (res.message === "OK") {
            const jsonData = {};
            const promises = data.lb.lb_rule.map(async (obj) => {
                const ruleData = {};
                ruleData.lb_name = res.name;
                ruleData.project = res.project;
                ruleData.protocol = obj.protocol.toLowerCase();
                if (obj.portRangeMax.indexOf("-") != -1) {
                    ruleData.port_range_min = obj.portRangeMax.split("-")[0];
                    ruleData.port_range_max = obj.portRangeMax.split("-")[1];
                } else {
                    ruleData.port_range_min = obj.portRangeMax;
                    ruleData.port_range_max = obj.portRangeMax;
                }

                if (obj.protocol === 'ICMP') {
                    delete ruleData.port_range_min;
                    delete ruleData.port_range_max;
                }

                jsonData.lb_rule = ruleData;

                await this.submitting(request.post(`kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/lb_rules`, jsonData));
            })
            await Promise.all(promises);

        }

        return res
    }


    @action
    async fetchDetail(params) {
        this.isLoading = true
        const project = params.project ? params.project : params.namespace
        const result = await request.get(`${this.getDetailUrl(params)}`, {
            project,
        })
        const detail = { ...params, ...this.mapper(result), kind: 'LoadBalancers' }

        await this.fetchYaml(params);
        await this.fetchFloatingList(params);

        this.detail = detail
        this.isLoading = false
        return detail
    }

    @action
    async fetchDetailLbs(params) {
        this.isLoading = true
        const project = params.project ? params.project : params.namespace
        const result = await request.get(`${this.getDetailUrl(params)}`, {
            project,
        })
        const detail = { ...params, ...this.mapper(result), kind: 'LoadBalancers' }

        this.detail = detail
        this.isLoading = false
        return detail
    }

    @action
    async fetchYaml(params) {
        this.isLoading = true
        const project = params.project ? params.project : params.namespace
        const result = await request.get(`${this.getDetailUrl(params)}/manifest`, {
            project,
        })
        const yamlData = { ...params, ...this.mapper(result), kind: 'Networks' }

        this.yaml = yamlData.manifest
        this.isLoading = false
        return yamlData
    }


    @action
    async update(params, data) {
        let res = await this.submitting(request.put(this.getDetailUrl({ ...params, name: params.name }), data))
        if (res.message === "OK") {
            const jsonData = {};
            if (data.lb.setAll) {
                // 기존 rule 전체 삭제
                await this.deleteLbRules({ ...params }, data.lb.originRule, data.lb.project)
                const [port_range_min, port_range_max] = data.lb.lb_rule[0].portRangeMax.split("-")
                jsonData.lb_rule = {
                    port_range_min,
                    port_range_max,
                    lb_name: data.lb.name,
                    project: data.lb.project,
                    protocol: 'all'
                }
                // all 추가
                await this.submitting(request.post(`kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/lb_rules`, jsonData));
            } else {
                let delOriginRule = data.lb.originRule
                const promises = data.lb.lb_rule.map(async (obj) => {

                    if (!obj.originRuleId) {
                        const ruleData = {};
                        ruleData.lb_name = params.name;
                        ruleData.project = data.lb.project;
                        ruleData.protocol = obj.protocol.toLowerCase();
                        if (obj.portRangeMax.indexOf("-") != -1) {
                            const [port_range_min, port_range_max] = obj.portRangeMax.split("-")
                            ruleData.port_range_min = port_range_min
                            ruleData.port_range_max = port_range_max
                        } else {
                            ruleData.port_range_min = obj.portRangeMax;
                            ruleData.port_range_max = obj.portRangeMax;
                        }

                        jsonData.lb_rule = ruleData;

                        await this.submitting(request.post(`kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/lb_rules`, jsonData));
                    } else {
                        // 기존 rule 중 삭제건
                        let idx = delOriginRule.indexOf(obj.originRuleId)
                        if (idx > -1) delOriginRule.splice(idx, 1)
                    }
                })
                await Promise.all(promises);

                if (delOriginRule.length > 0) {
                    // 기존 rule 중 삭제건 처리
                    await this.deleteLbRules({ ...params }, delOriginRule, data.lb.project)
                }
            }
        }

        return res
    }

    @action
    async deleteLbRules({ ...params }, rules, project) {
        const promises = rules.map(async (id) => {
            await this.submitting(request.delete(`kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/lb_rules/${id}/${project}`));
        })
        await Promise.all(promises);
    }


    @action
    async batchDelete({ rowKeys, ...params }) {
        const rowKeyDict = rowKeys.map(key => {
            if (key.includes('/')) {
                const [project, name] = key.split('/')
                return { project, name }
            } else {
                const project = params.namespace
                const name = key
                return { project, name }
            }
        })

        await this.submitting(
            Promise.all(
                rowKeyDict.map(rowKey =>
                    request.delete(
                        `${this.getDeleteUrl({ name: rowKey.name, project: rowKey.project, ...params })}`
                    )
                )
            )
        )
        this.list.selectedRowKeys = []
    }

    @action
    delete(user) {
        if (user.name === globals.user.username) {
            Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
            return
        }

        return this.submitting(request.delete(`${this.getDeleteUrl(user)}`))
    }

    @action
    async fetchFloatingList(params) {
        this.isLoading = true
        const result = await request.get(
            `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/floating_ips`
        )

        let dataList = result?.floating_ips || [];
        this.floatingIpsList = dataList
        this.isLoading = false

        return dataList
    }

    @action
    async fetchNetworkList(params) {
        this.isLoading = true

        const result = await request.get(
            `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/networks`
        )
        this.networkDataList = result.networks;

        this.isLoading = false

        return this.networkDataList
    }

    @action
    async fetchVmList(params) {
        this.isLoading = true

        const result = await request.get(
            `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/vms`
        )
        const response = { ...params, ...this.mapper(result), kind: 'vms' }

        this.isLoading = false
        return response;
    }

    @action
    async routerList(params) {
        const result = await request.get(
            `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(params)}/edgetron/resources/kubevirt/routers`
        )
        return result
    }
}
