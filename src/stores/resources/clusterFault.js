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
import { safeBtoa, safeAtob } from 'utils/base64'

import Base from '../basemm3'

export default class ClusterFaultStore extends Base {

    module = 'clusterFault'

    getResourceUrl = (params = {}) => `apis/core.k8sgpt.ai/v1alpha1/namespaces/local-ai`
    getDetailUrl = (params = {}) => `${this.getResourceUrl(params)}/${params.id}`

    /**
     * cr solution 정보
     * @returns 
     */
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

        this.searchList = this.dataList;
        if (searchArray.length > 0) {
            searchArray.map((search) => {
                let resultList = this.searchList.filter((row) => {
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

    /**
     * 생성된 CR list
     * @returns 
     */
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
            `${this.getResourceUrl()}/list-k8sgpts`
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

        this.searchList = this.dataList;
        if (searchArray.length > 0) {
            searchArray.map((search) => {
                let resultList = this.searchList.filter((row) => {
                    return get(row, search.searchKeywordType)?.toLowerCase().includes(search.searchKeywordText?.toLowerCase());
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

        return this.dataList
    }

    /**
     * 활성화된 CR 정보
     * @returns 
     */
    @action
    async activeCrDetail() {
        const result = await request.get(
            `${this.getResourceUrl()}/k8sgpts\?labelSelector=list-k8sgpt/enabled`
        )
        const detail = get(result, 'items[0].metadata.name') || ''

        return detail
    }

    /**
     * k8sgpts 전체 CR 정보
     * @returns 
     */
    @action
    async activeCrList() {
        const result = await request.get(`${this.getResourceUrl()}/k8sgpts`);

        return get(result, 'items')
    }


    /**
     * CR 활성화
     * @returns 
     */
    @action
    async activateCr(data) {
        // 기존 CR 존재할경우 비활성화
        if (data.activeCr) {
            await this.deactivateCr(data.activeCr);
        }

        let params;
        let operator = get(data, 'spec.ai.backend');
        if (operator === 'localai') {
            params = {
                "apiVersion": "core.k8sgpt.ai/v1alpha1",
                "kind": "K8sGPT",
                "metadata": {
                    "name": `${get(data, 'metadata.name')}`,
                    "namespace": "local-ai",
                    "labels": {
                        "list-k8sgpt/enabled": ""
                    }
                },
                "spec": {
                    "ai": {
                        "backend": "localai",
                        "baseUrl": `${get(data, 'spec.ai.baseUrl')}`,
                        "model": `${get(data, 'spec.ai.model')}`,
                        "enabled": true
                    },
                    "repository": "ghcr.io/k8sgpt-ai/k8sgpt",
                    "version": "v0.3.26"
                }
            }
        } else if (operator === 'openai') {
            params = {
                "apiVersion": "core.k8sgpt.ai/v1alpha1",
                "kind": "K8sGPT",
                "metadata": {
                    "name": `${get(data, 'metadata.name')}`,
                    "namespace": "local-ai",
                    "labels": {
                        "list-k8sgpt/enabled": ""
                    }
                },
                "spec": {
                    "ai": {
                        "backend": "openai",
                        "secret": {
                            "name": `${get(data, 'metadata.name')}-secret`,
                            "key": "openai-api-key"
                        },
                        "model": `${get(data, 'spec.ai.model')}`,
                        "enabled": true
                    },
                    "repository": "ghcr.io/k8sgpt-ai/k8sgpt",
                    "version": "v0.3.26"
                }
            }
        }
        let res = await this.submitting(
            request.post(`${this.getResourceUrl()}/k8sgpts`, params)
        )
        return res
    }

    /**
     * CR 비활성화
     * @returns 
     */
    @action
    async deactivateCr(name) {
        await this.deactivateCrCheck(name)
        await this.submitting(
            request.delete(`${this.getResourceUrl()}/k8sgpts/${name}`)
        )
    }

    /**
     * CR 비활성화 check
     * @returns 
     */
    @action
    async deactivateCrCheck(name) {
        let params = {
            "metadata": {
                "labels": {
                    "list-k8sgpt/enabled": null
                }
            }
        }

        await this.submitting(
            request.patch(`${this.getResourceUrl()}/k8sgpts/${name}`, params, {
                headers: {
                    'content-type': 'application/merge-patch+json',
                },
            })
        )
    }


    /**
     * local ai 생성
     * @returns 
     */
    @action
    async createLocalAi(data, params = {}) {
        params = {
            "apiVersion": "core.k8sgpt.ai/v1alpha1",
            "kind": "List-K8sGPT",
            "metadata": {
                "name": `${data.name}`,
                "namespace": "local-ai"
            },
            "spec": {
                "ai": {
                    "backend": "localai",
                    "baseUrl": `${data.baseurl}`,
                    "model": `${data.model}`
                },
                "repository": "ghcr.io/k8sgpt-ai/k8sgpt",
                "version": "v0.3.26"
            }
        }
        let res = await this.submitting(
            request.post(`${this.getResourceUrl()}/k8sgpts`, params)
        )
        return res
    }

    /**
     * open ai 생성
     * @returns 
     */
    @action
    async createOpenAi(data, params = {}) {
        let secretRes = await this.createOpenAiSecretKey(data)

        await this.applySecret(data, secretRes)
    }

    /**
     * secret key 적용
     * @returns 
     */
    @action
    async applySecret(data, secretRes) {
        try {
            const owner_ref = {
                apiVersion: get(secretRes, 'apiVersion'),
                kind: get(secretRes, 'kind'),
                name: get(secretRes, 'metadata.name'),
                uid: get(secretRes, 'metadata.uid'),
            }
            const cr_secret_key = data.secret

            let params = {
                "apiVersion": "v1",
                "kind": "Secret",
                "metadata": {
                    "name": `${data.name}-secret`,
                    "namespace": "local-ai",
                    "ownerReferences": [owner_ref]
                },
                "data": {
                    "openai-api-key": safeBtoa(cr_secret_key) // base64 encode
                },
                "type": "Opaque"
            }

            let res = await this.submitting(
                request.post(`api/v1/namespaces/local-ai/secrets`, params)
            )
            return res;
        } catch (e) {
            // secret key 적용 시, 에러 발생할 경우 createOpenAiSecretKey rollback
            await this.deleteCr({ name: data.name })
            throw Error(e)
        }
    }

    /**
     * open ai 생성 및 secret key 추출
     * @returns 
     */
    @action
    async createOpenAiSecretKey(data) {
        let params = {
            "apiVersion": "core.k8sgpt.ai/v1alpha1",
            "kind": "List-K8sGPT",
            "metadata": {
                "name": `${data.name}`,
                "namespace": "local-ai",
                "labels": {
                    "kubesphere-list": ""
                }
            },
            "spec": {
                "ai": {
                    "backend": "openai",
                    "secret": {
                        "name": `${data.name}-secret`,
                        "key": "openai-api-key"
                    },
                    "model": `${data.model}`
                },
                "repository": "ghcr.io/k8sgpt-ai/k8sgpt",
                "version": "v0.3.26"
            }
        }
        let res = await this.submitting(
            request.post(`${this.getResourceUrl()}/list-k8sgpts`, params)
        )
        return res;
    }

    /**
     * CR 삭제
     * @returns 
     */
    @action
    async deleteCr({ name, activeCr }) {

        // 활성화된 CR 비활성화
        if (activeCr && name === activeCr) {
            await this.deactivateCr(name)
        }

        // 목록에서 삭제
        await this.submitting(
            request.delete(`${this.getResourceUrl()}/list-k8sgpts/${name}`)
        )
    }

    /**
     * CR 수정
     * @returns 
     */
    @action
    async modifyCr(data) {
        if (data.originOperator === 'localai') {
            this.modifyLocalAi(data)
        } else if (data.originOperator === 'openai') {
            this.modifyOpenAi(data)
        }
    }

    /**
     * CR 수정 > localai to any
     * @returns 
     */
    @action
    async modifyLocalAi(data) {
        if (data.operator === 'localai') { // localai > localai
            let params = {
                "spec": {
                    "ai": {
                        "baseUrl": data.baseurl,
                        "model": data.model
                    }
                }
            }
            await this.submitting(
                request.patch(`${this.getResourceUrl()}/list-k8sgpts/${data.name}`, params, {
                    headers: {
                        'content-type': 'application/merge-patch+json',
                    },
                })
            )
        } else if (data.operator === 'openai') { // localai > openai
            let params = {
                "spec": {
                    "ai": {
                        "backend": data.operator,
                        "baseUrl": null,
                        "model": data.model,
                        "secret": {
                            "name": `${data.name}-secret`,
                            "key": "openai-api-key"
                        }
                    }
                }
            }
            let secretRes = await this.submitting(
                request.patch(`${this.getResourceUrl()}/list-k8sgpts/${data.name}`, params, {
                    headers: {
                        'content-type': 'application/merge-patch+json',
                    },
                })
            )

            await this.applySecret(data, secretRes)
        }
    }

    /**
     * CR 수정 > openai to any
     * @returns 
     */
    @action
    async modifyOpenAi(data) {
        if (data.operator === 'localai') { // openai > localai
            let params = {
                "spec": {
                    "ai": {
                        "backend": data.operator,
                        "baseUrl": data.baseurl,
                        "model": data.model,
                        "secret": null
                    }
                }

            }
            await this.submitting(
                request.patch(`${this.getResourceUrl()}/list-k8sgpts/${data.name}`, params, {
                    headers: {
                        'content-type': 'application/merge-patch+json',
                    },
                })
            )
            // secret 삭제
            await this.submitting(
                request.delete(`api/v1/namespaces/local-ai/secrets/${data.name}-secret`)
            )

        } else if (data.operator === 'openai') { // openai > openai
            let params = {
                "spec": {
                    "ai": {
                        "model": data.model,
                    }
                }
            }
            // model 수정
            await this.submitting(
                request.patch(`${this.getResourceUrl()}/list-k8sgpts/${data.name}`, params, {
                    headers: {
                        'content-type': 'application/merge-patch+json',
                    },
                })
            )

            // secret 수정
            let secret = {
                "data": {
                    "openai-api-key": safeBtoa(data.secret) // base64 encode
                }
            }
            await this.submitting(
                request.patch(`api/v1/namespaces/local-ai/secrets/${data.name}-secret`, secret, {
                    headers: {
                        'content-type': 'application/merge-patch+json',
                    },
                })
            )
        }
    }

    /**
     * secret key 조회
     * @returns 
     */
    @action
    async getSecretKey(name) {
        let res = await this.submitting(
            request.get(`api/v1/namespaces/local-ai/secrets/${name}-secret`)
        )
        let secretkey = get(res, 'data.openai-api-key');
        return safeAtob(secretkey)
    }
}
