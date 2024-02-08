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
import { LIST_DEFAULT_ORDER } from 'utils/constants'

import Base from '../basemm3'

export default class ClusterFaultStore extends Base {

    module = 'clusterFault'

    getResourceUrl = (params = {}) => `apis/core.k8sgpt.ai/v1alpha1/namespaces/k8sgpt-operator-system`
    getDetailUrl = (params = {}) => `${this.getResourceUrl(params)}/${params.id}`

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

        const result = await request.get(
            `${this.getResourceUrl()}/results`
        )

        params.limit = params.limit || 10

        const data = (get(result, 'items') || []).map(item => ({
            ...this.mapper(item),
        }))

        // 초기 데이터 처리 
        this.dataList = data;

        // namespace(project) 있는 경우 
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
                    if (search.searchKeywordType === 'project') {
                        let [projectName, _] = get(row, 'spec.name').split('/')
                        return projectName?.toLowerCase().includes(search.searchKeywordText.toLowerCase());
                    }
                    return get(row, search.searchKeywordType)?.toLowerCase().includes(search.searchKeywordText.toLowerCase());
                });
                this.searchList = resultList;
            })
            this.dataList = this.searchList;
        }

        //정렬 처리
        const sortType = !!params.ascending ? "asc" : "desc";
        this.dataList.sort((a, b) => {
            var x = get(a, params.sortBy);
            var y = get(b, params.sortBy);
            if (sortType == "desc") {
                return x > y ? -1 : x < y ? 1 : 0;
            } else if (sortType == "asc") {
                return x < y ? -1 : x > y ? 1 : 0;
            }
        });

        // mm3 데이터 page 별 Slice 처리 
        const perPage = Number(params.limit) || 10;
        const currentPage = Number(params.page) || 1;
        const sliceData = this.dataList.slice((currentPage - 1) * perPage, (currentPage) * perPage);

        this.list.update({
            data: more ? [...this.list.data, ...sliceData] : sliceData,
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
    async fetchCrList({
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

        const result = await request.get(
            // `${this.getResourceUrl()}/list-k8sgpts`
            `${this.getResourceUrl()}/k8sgpts`
        )

        params.limit = params.limit || 10

        const data = (get(result, 'items') || []).map(item => ({
            ...this.mapper(item),
        }))

        // 초기 데이터 처리 
        this.dataList = data;

        // namespace(project) 있는 경우 
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
                    if (search.searchKeywordType === 'project') {
                        let [projectName, _] = get(row, 'spec.name').split('/')
                        return projectName?.toLowerCase().includes(search.searchKeywordText.toLowerCase());
                    }
                    return get(row, search.searchKeywordType)?.toLowerCase().includes(search.searchKeywordText.toLowerCase());
                });
                this.searchList = resultList;
            })
            this.dataList = this.searchList;
        }

        //정렬 처리
        const sortType = !!params.ascending ? "asc" : "desc";
        this.dataList.sort((a, b) => {
            var x = get(a, params.sortBy);
            var y = get(b, params.sortBy);
            if (sortType == "desc") {
                return x > y ? -1 : x < y ? 1 : 0;
            } else if (sortType == "asc") {
                return x < y ? -1 : x > y ? 1 : 0;
            }
        });

        // mm3 데이터 page 별 Slice 처리 
        const perPage = Number(params.limit) || 10;
        const currentPage = Number(params.page) || 1;
        const sliceData = this.dataList.slice((currentPage - 1) * perPage, (currentPage) * perPage);

        this.list.update({
            data: more ? [...this.list.data, ...sliceData] : sliceData,
            total: result.totalItems || result.total_count || this.dataList.length || 0,
            ...params,
            limit: Number(params.limit) || 10,
            page: Number(params.page) || 1,
            isLoading: false,
            ...(this.list.silent ? {} : { selectedRowKeys: [] }),
        })
        console.log(this.list)

        return this.dataList
    }
}
