import { get, set, uniq, isArray, intersection } from 'lodash';
import { observable, action } from 'mobx';
import { Notify } from '@kube-design/components';
import { LIST_DEFAULT_ORDER } from 'utils/constants';
import ObjectMapper from 'utils/object.mapper';

import Base from '../basemm3'; // mm3 관련 추가 파일
import List from '../base.list';

export default class ClusterInspectionStore extends Base {
  records = new List();

  module = 'clusterInspection';

  getResourceUrl = (params = {}) =>
    `apis/kubeeye.kubesphere.io/v1alpha1/clusterinsights/clusterinsight`;

  @action
  async fetchList({
    cluster,
    workspace,
    namespace,
    more,
    devops,
    ...params
  } = {}) {
    this.list.isLoading = true;

    if (!params.sortBy && params.ascending === undefined) {
      params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'timestamp';
    }

    if (params.limit === Infinity || params.limit === -1) {
      params.limit = -1;
      params.page = 1;
    }

    params.limit = params.limit || 10;

    const resultClusterInspection = await request.get(this.getResourceUrl());

    const resultCluster = get(resultClusterInspection, 'status', []);

    const data = resultCluster;

    // 초기 정렬 처리
    // data.sort((a, b) => {
    //   return a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0;
    // });
    // data.sort((a, b) => {
    //   return a.namespace < b.namespace ? 1 : a.namespace > b.namespace ? -1 : 0;
    // });

    // 초기 데이터 처리
    this.list.data = data;

    // 검색 관련 처리
    // const exceptionArray = ['page', 'limit', 'sortBy', 'ascending'];
    /* const searchArray = Object.keys(params)
      .map(key => {
        const value = params[key];
        const searchData = {
          searchKeywordType: key,
          searchKeywordText: value,
        };
        return searchData;
      })
      .filter(row => exceptionArray.includes(row.searchKeywordType) === false);

    if (searchArray.length > 0) {
      searchArray.map(search => {
        const resultList = this.dataList.filter(row => {
          if (search.searchKeywordType === 'project') {
            return (
              row[search.searchKeywordType]?.toLowerCase() ===
              search.searchKeywordText.toLowerCase()
            );
          }
          return row[search.searchKeywordType]
            ?.toLowerCase()
            .includes(search.searchKeywordText.toLowerCase());
        });
        this.dataList = resultList;
      });
    }
	*/

    // 정렬 처리
    /* const sortType = params.ascending ? 'asc' : 'desc';
    this.dataList.sort((a, b) => {
      const x = a[params.sortBy];
      const y = b[params.sortBy];
      if (sortType == 'desc') {
        return x > y ? -1 : x < y ? 1 : 0;
      }
      if (sortType == 'asc') {
        return x < y ? -1 : x > y ? 1 : 0;
      }
    });
	*/

    // mm3 데이터 page 별 Slice 처리
    // const perPage = Number(params.limit) || 10;
    // const currentPage = Number(params.page) || 1;
    // const mm3SliceData = this.dataList.slice(
    //   (currentPage - 1) * perPage,
    //   currentPage * perPage
    // );

    // this.list.update({
    //   data: more ? [...this.list.data, ...mm3SliceData] : mm3SliceData,
    //   total:
    //     result.totalItems || result.total_count || this.dataList.length || 0,
    //   ...params,
    //   limit: Number(params.limit) || 10,
    //   page: Number(params.page) || 1,
    //   isLoading: false,
    //   ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    // });

    return this.list.data;
  }

  //   @action
  //   async fetchDetail(params) {
  //     this.isLoading = true;

  //     const result = await request.get(
  //       `${this.getResourceUrl(params)}/${params.name}`
  //     );
  //     const detail = { ...params, ...this.mapper(result), kind: 'Sriov' };

  //     // Yaml 파일 관련
  //     await this.fetchYaml(params);

  //     this.detail = detail;
  //     this.isLoading = false;
  //     return detail;
  //   }
}
