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

export default class SecurityGroupStore extends Base {

    records = new List()

    module = 'security_groups'

    getResourceUrl = (params = {}) => `edgetron/resources/kubevirt/security_groups`
    getListUrl = this.getResourceUrl
    getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.id}`

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

        // security_group rull count 정보 추가
        const dataArray = [];

        const promises = data.map(async (security_group) => {
            const securityDetail = await axios.get("/edgetron/resources/kubevirt/security_groups/" + security_group.id);
            security_group.egress_count = (securityDetail.data.security_group.rules).filter(el => el.direction == "egress").length;
            security_group.ingress_count = (securityDetail.data.security_group.rules).filter(el => el.direction == "ingress").length;
            dataArray.push(security_group);
        })
        await Promise.all(promises);

        // 초기 데이터 처리 
        this.dataList = dataArray;

        if (namespace) {
            params.project = namespace;
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

        return data
    }


    @action
    async create(data, params = {}) {

        let res = await this.submitting(request.post(this.getListUrl(params), data))
        if (res.message === "OK") {

            const jsonData = {};
            const promises = data.security_group.security_group_rules.map(async  (obj) => {
                const data = {};
                data.security_group_id = res.id;
                data.direction = obj.direction.toLowerCase();
                data.remote_ip_prefix = obj.remoteIpPrefix.toLowerCase();
                data.protocol = obj.protocol.toLowerCase();
                if (obj.portRangeMax.indexOf("-") != -1) {
                    data.port_range_min = obj.portRangeMax.split("-")[0];
                    data.port_range_max = obj.portRangeMax.split("-")[1];
                } else {
                    data.port_range_min = obj.portRangeMax;
                    data.port_range_max = obj.portRangeMax;
                }
                data.ethernet_type = obj.ethernetType === "ALL" ? "all" : obj.ethernetType;

                jsonData.security_group_rule = data;

                await this.submitting(request.post("/edgetron/resources/kubevirt/security_group_rules", jsonData));
            })
            await Promise.all(promises);

        }
        return res
    }


    @action
    async fetchDetail(params) {
        this.isLoading = true

        const result = await request.get(
            `${this.getResourceUrl(params)}/${params.id}`
        )
        const detail = { ...params, ...this.mapper(result), kind: 'SecurityGroups' }

        // Yaml 파일 관련 
        await this.fetchYaml(params);

        this.detail = detail
        this.isLoading = false
        return detail
    }

    @action
    async fetchYaml(params) {
        this.isLoading = true

        const result = await request.get(
            `${this.getResourceUrl(params)}/${params.id}/manifest`
        )
        const yamlData = { ...params, ...this.mapper(result), kind: 'SecurityGroups' }

        this.yaml = yamlData.manifest
        this.isLoading = false
        return yamlData
    }


    @action
    async batchDelete({ rowKeys, ...params }) {
        if (rowKeys.includes(globals.user.username)) {
            Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
        } else {
            await this.submitting(
                Promise.all(
                    rowKeys.map(async (id) => {
                        const securityDetail = await axios.get("/edgetron/resources/kubevirt/security_groups/" + id);
                        securityDetail.data.security_group.rules.map((rule) => {
                            request.delete("/edgetron/resources/kubevirt/security_group_rules/" + rule.id);
                        })

                        await request.delete(
                            `${this.getDetailUrl({ id, ...params })}`
                        )
                    })
                )
            )
        }
        this.list.selectedRowKeys = []
    }

    @action
    async delete(user) {
        if (user.name === globals.user.username) {
            Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
            return
        }

        const securityDetail = await axios.get("/edgetron/resources/kubevirt/security_groups/" + user.name);
        Promise.all(
            securityDetail.data.security_group.rules.map((rule) => {
                request.delete("/edgetron/resources/kubevirt/security_group_rules/" + rule.id);
            })
        )

        return await this.submitting(request.delete(`${this.getDetailUrl(user)}`))
    }

}
