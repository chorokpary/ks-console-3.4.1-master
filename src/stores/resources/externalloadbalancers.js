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

import { LIST_DEFAULT_ORDER } from 'utils/constants'
import { get, find } from 'lodash'

import Base from '../basemm3' // mm3 관련 추가 파일
import List from '../base.list'

export default class ExternalLoadBalancerStore extends Base {
  records = new List()

  module = 'exlbs'

  projectNameList = []
  listenersDetail = []
  loadbalancerNameList = []
  loadbalancerIpList = []

  getResourceXlbUrl = (params = {}) =>
    `kapis/externallb.kubesphere.io/v1alpha1${this.getPath(
      params
    )}${this.getOditLogUrl(params)}/xlb/v1`

  getResourceUrl = (params = {}) =>
    `kapis/externallb.kubesphere.io/v1alpha1${this.getPath(
      params
    )}${this.getOditLogUrl(params, 'externalloadbalancer')}/xlb/v1`

  getResourceListUrl = (params = {}) =>
    `kapis/externallb.kubesphere.io/v1alpha1/xlb/v1`

  getListUrl = this.getResourceListUrl
  
  getDetailUrl = (params = {}) => `${this.getListUrl(params)}/${params.name}`
  getDeleteUrl = (params = {}) =>
    `${this.getListUrl(params)}/${params.name}/${params.project}`

  @action
  async fetchList({
    cluster,
    workspace,
    namespace,
    infinite,
    more,
    devops,
    silent,
    ...params
  } = {}) {
    if (!silent) {
      this.list.isLoading = true
    }

    if (!params.sortBy && params.ascending === undefined) {
      params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'createdAt'
    }

    if (infinite) {
      params.limit = -1
    }

    if (params.limit === Infinity || params.limit === -1) {
      params.limit = -1
      params.page = 1
    }

    params.page = params.page || 1
    params.limit = params.limit || 10

    const page = params.page
    const limit = params.limit

    if (namespace) {
      params.project = namespace
    }

    const loadbalancers = await this.fetchLoadbalancers()

    const data = loadbalancers

    // 초기 정렬 처리
    data.sort((a, b) => {
      return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0
    })


    // 초기 데이터 처리
    this.dataList = data
    
    // namespace(project) 있는 경우
    if (namespace) {
      params.project = namespace
    }

    // 검색 관련 처리
    const exceptionArray = ['page', 'limit', 'sortBy', 'ascending']
    const searchArray = Object.keys(params)
      .map(key => {
        let value = params[key]
        let searchData = {
          searchKeywordType: key,
          searchKeywordText: value,
        }
        return searchData
      })
      .filter(row => exceptionArray.includes(row.searchKeywordType) === false)

    if (searchArray.length > 0) {
      searchArray.map(search => {
        let resultList = this.dataList.filter(row => {
          return row[search.searchKeywordType]
            ?.toLowerCase()
            .includes(search.searchKeywordText.toLowerCase())
        })
        this.dataList = resultList
      })
    }

    // 전체 데이터 갯수
    const total = this.dataList.length || 0

    // 정렬 처리
    const sortType = params.ascending ? 'asc' : 'desc'
    this.dataList.sort((a, b) => {
      const x = a[params.sortBy]
      const y = b[params.sortBy]
      if (sortType === 'desc') {
        return x > y ? -1 : x < y ? 1 : 0
      }
      return x < y ? -1 : x > y ? 1 : 0
    })

    // mm3 데이터 page 별 Slice 처리
    const perPage = Number(params.limit) || 10
    const currentPage = Number(params.page) || 1
    const mm3SliceData = this.dataList.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
    )

    this.list.update({
      data: more ? [...this.list.data, ...mm3SliceData] : mm3SliceData,
      total,
      ...params,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    })

    return this.dataList
  }

  @action
  async create(data, params = {}) {
    const rollbackStack = []

    const lb = data.lb

    const projectName = lb.projectName
    const driverId = lb.driverId
    const lbName = lb.name

    try {
      this.isSubmitting = true

      // 1. 프로젝트 생성
      const projectData = { name : projectName, driver_id : driverId, description : lb.description }
      if (driverId === 'haproxy') { delete projectData.description }

      // 프로젝트 리스트 추출
      const projects = await this.fetchExistedList('P')
      const isDuplicated = projects.includes(projectName)

      // 프로젝트 중복 체크해서 최조일때만 생성
      if(!isDuplicated){
        await request.post(`${this.getListUrl()}/projects`, projectData)
        rollbackStack.push(() => this.deleteProject(projectName))
      }      

      // 2. 모니터 생성
      await Promise.all(
        lb.formPoolFields
        .filter(item => item.type) 
        .map(async (item) => {
     
          const monitorName = `${lbName}-${item.poolName}-monitor-${(item.type).toLowerCase()}`
          const monitorData = {
              name: monitorName,
              type: (item.type).toLowerCase(),
              description: item.description,
              settings: {
                interval: item.interval ? Number(item.interval) : 5,
                timeout: item.timeout ? Number(item.timeout) : 16
              }
          }
          if (driverId === 'haproxy') { delete monitorData.description }

          await request.post(`${this.getListUrl()}/projects/${projectName}/monitors`, monitorData)
          rollbackStack.push(() => this.deleteMonitor(projectName, monitorName))
        })
      )

      // 3. 풀 생성
      await Promise.all(
        lb.formPoolFields.map(async (item) => {
          const poolName = `${lbName}-${item.poolName}`
          const poolData = {
            name: poolName,
            load_balancing_method: item.lbmethod,
          }

          if (item.type) {
            poolData.monitor = `${lbName}-${item.poolName}-monitor-${item.type.toLowerCase()}`
          }

          await request.post(`${this.getListUrl()}/projects/${projectName}/pools`, poolData)
          rollbackStack.push(() => this.deletePool(projectName, poolName))
        })
      )

      // 4. 풀 모니터 업데이트
      await Promise.all(
        lb.formPoolFields.map(async (item) => {
          const poolName = `${lbName}-${item.poolName}`
          const poolData = {
            load_balancing_method: item.lbmethod,
          }

          if (item.type) {
            poolData.monitor = `${lbName}-${item.poolName}-monitor-${item.type.toLowerCase()}`
          }

          await request.put(`${this.getListUrl()}/projects/${projectName}/pools/${poolName}`, poolData)
        })
      )
      
      // 5. 풀 멤버 추가
      await Promise.all(
        lb.formPoolFields.map(async (item) => {
          const poolName = `${lbName}-${item.poolName}`

          await Promise.all(
            item.member.map(async (member) => {
              const memberName = member.vmId
              const poolMemberData = {
                name: memberName,
                pool_name: poolName,
                ip_address: member.memberIp,
                port: Number(member.memberPort),
                weight: Number(member.memberWeight)
              }

              await request.post(`${this.getListUrl()}/projects/${projectName}/members`, poolMemberData)
              rollbackStack.push(() => this.deleteMember(projectName, memberName))
            })
          )
        })
      )

      // 6. 리스너 생성 
      // [제약사항] (HAProxy) Listener 생성 후, Load Balancer 리소스 생성 순서로만 동작하며, Listener 이름과 Load Balancer 이름이 동일해야 합니다.
      const listenerNames = []
      await Promise.all(
        lb.formListenerFields.map(async (listener, index) => { 
          const listenerName = index === 0 ? lbName : `${lbName}-${listener.pool}-listener-${listener.protocol.toLowerCase()}`
          const listenerData = {
            name: listenerName,
            protocol: listener.protocol.toLowerCase(),
            port: Number(listener.port),
            pool: `${lbName}-${listener.pool}`
          }
          listenerNames.push(listenerName)
          await request.post(`${this.getListUrl()}/projects/${projectName}/listeners`, listenerData)
          rollbackStack.push(() => this.deleteListener(projectName, listenerName))
        })
      )
        
      // 7. 로드밸런서 생성
      const loadbalancerData = {
        name: lbName,
        driver_id: driverId,
        ip_address: lb.ip,
        listeners: listenerNames
      }
      await request.post(`${this.getListUrl()}/projects/${projectName}/loadbalancers`, loadbalancerData)
      rollbackStack.push(() => this.deleteLoadBalancer(projectName, lbName))

      // 8. 리스너 attach
      // [제약사항] (HAProxy) Listener 생성 후, Load Balancer 리소스 생성 순서로만 동작하며, Listener 이름과 Load Balancer 이름이 동일해야 합니다.
      // await Promise.all(
      //   lb.formListenerFields.map(async (listene, index) => { 
      //     const listenerName = index === 0 ? lbName : `${listener.pool}-listener-${listener.protocol.toLowerCase()}`
      //     await request.post(`${this.getListUrl()}/projects/${projectName}/attachments?lbName=${lbName}&listenerName=${listenerName}`)
      //     rollbackStack.push(() => this.detachListener(projectName, lbName, listenerName))
      //   })
      // )
      
      this.isSubmitting = false
      return { success: true }

    } catch (error) {
      console.error('생성 실패, rollback 시작', error)
      this.isSubmitting = true
      await this.rollback(rollbackStack)
      this.isSubmitting = false
      throw error
    }

  }

  @action
  async fetchDetail(params) {
    this.isLoading = true
    
    const loadbalancers = await this.fetchLoadbalancers()
    const detail = loadbalancers.find(item => item.name === params.name)

    this.listenersDetail = detail.listeners ?? [];
    
    const detailData = { ...params, detail, kind: 'data' }
  
    this.detailData = detailData
    this.isLoading = false
    return detail
  }


  @action
  async update(params, data) {

    const lb = data.lb

    const projectName = lb.projectName
    const driverId = lb.driverId
    const lbName = lb.name

    this.isSubmitting = true

    try {
      // 모니터 수정
      await Promise.all(
        lb.formPoolFields
        .filter(item => item.type) 
        .map(async (item) => {    
          const monitorName = `${item.poolName}-monitor-${(item.type).toLowerCase()}`
          const monitorData = {
              description: item.description,
              settings: {
                interval: item.interval ? Number(item.interval) : 5,
                timeout: item.timeout ? Number(item.timeout) : 16
              }
          }
          if (driverId === 'haproxy') { delete monitorData.description }
          await request.put(`${this.getListUrl()}/projects/${projectName}/monitors/${monitorName}`, monitorData)
        })
      )

      // 풀 수정
      await Promise.all(
        lb.formPoolFields.map(async (item) => {
          const poolName = item.poolName
          const poolData = {
            load_balancing_method: item.lbmethod,
          }

          await request.put(`${this.getListUrl()}/projects/${projectName}/pools/${poolName}`, poolData)
        })
      )

      // 멤버 수정
      await Promise.all(
        lb.formPoolFields.map(async (item) => {
          await Promise.all(
            item.member.map(async (member) => {
              const memberName = member.vmId
              const poolMemberData = {
                ip_address: member.memberIp,
                port: Number(member.memberPort),
                weight: Number(member.memberWeight)
              }
              await request.put(`${this.getListUrl()}/projects/${projectName}/members/${memberName}`, poolMemberData)
            })
          )
        })
      )

      // 리스너 수정
      await Promise.all(
        lb.formListenerFields.map(async (listener) => { 
          const listenerName = listener.listenerName
          const listenerData = {
            port: Number(listener.port),
          }
          await request.put(`${this.getListUrl()}/projects/${projectName}/listeners/${listenerName}`, listenerData)
        })
      )

      // 로드밸런서 수정
      const loadbalancerData = {
          ip_address: lb.ip,
      }
      await request.put(`${this.getListUrl()}/projects/${projectName}/loadbalancers/${lbName}`, loadbalancerData)

      this.isSubmitting = false
      return { success: true }

    } catch (error) {
      console.error('LB update failed:', error)
      return { success: false, error }
    } finally {
      this.isSubmitting = false
    }
  }

  @action
  async delete(data) {

    if (data.name === globals.user.username) {
      Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
      return
    }

    this.isSubmitting = true

    const deleteStack = []
    const projectName = data.project
    const loadbalancerName = data.name
    const listeners = (data.listeners).map(item => item.name)
    const pools = (data.pools).map(item => item.name)
    const monitors = (data.monitors).map(item => item.name)
    const members = data.pools.flatMap(pool => pool?.members?.map(member => member.name) ?? [])

    // 삭제 순서 
    // 리스너 detach > 리스너 삭제 > LoadBalancer 삭제 > 멤버 삭제 > 풀 삭제 > 모니터 삭제 > 프로젝트 삭제 
     
    // 프로젝트 삭제
    //deleteStack.push(() => this.deleteProject(projectName))

    // 모니터  삭제
    await Promise.all(
      monitors.map(monitorName => {
        deleteStack.push(() => this.deleteMonitor(projectName, monitorName))
      })      
    )

    // 풀 삭제
    await Promise.all(
      pools.map(poolName => {
        deleteStack.push(() => this.deletePool(projectName, poolName))
      })      
    )

    // 멤버 삭제
    await Promise.all(
      members.map(memberName => {
        deleteStack.push(() => this.deleteMember(projectName, memberName))
      })      
    )

    // 로드 밸런스 삭제
    deleteStack.push(() => this.deleteLoadBalancer(projectName, loadbalancerName))

    // 리스너 삭제
    await Promise.all(
      listeners.map(listenerName => {
        deleteStack.push(() => this.deleteListener(projectName, listenerName))
      })      
    )

     // 리스너 분리
    await Promise.all(
      listeners.map(listenerName => {
        deleteStack.push(() => this.detachListener(projectName, loadbalancerName, listenerName))
      })      
    )

    await this.rollback(deleteStack)

    // 백엔드 처리 관련 딜레이 적용
    setTimeout(() => {
      this.isSubmitting = false
      return true
    }, 1000)
  }

  @action
  async fetchDrivers() { 
    const result = await request.get(`${this.getResourceListUrl()}/drivers`);
    return result
  }

  @action
  async fetchExistedList(type) {
    // 해당 정보 배열 처리 
    // P : project, L : loadbalancer, M : Member 
    
    if(type == "P"){      
      const projectsData = await request.get(this.getListUrl()+'/projects')
      const projectsList = get(projectsData, 'projects', [])
      const projectsNames = projectsList.map(item => item.name)

      const exclude = ['Common',  'Tenant-A-kaas', 'Tenant-C']
      const projects = projectsNames.filter(
        name => !exclude.includes(name)
      )

      return projects

    }else if(type == "L"){      
      const loadbalancers = await this.fetchLoadbalancers()
      const loadbalancersNames = loadbalancers.map(item => item.name)

      return loadbalancersNames

    }else if(type == "M"){      
      const loadbalancers = await this.fetchLoadbalancers()
      const memberNames = loadbalancers.flatMap(lb =>
          lb.pools?.flatMap(pool =>
            pool.members?.map(member => member.name) ?? []
        ) ?? []
      )      

      return memberNames
    }
  }

  @action
  async fetchVmList(params) {
    this.isLoading = true

    const result = await request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1${this.getPath(
        params
      )}/edgetron/resources/kubevirt/vms`
    )
    const response = { ...params, ...this.mapper(result), kind: 'vms' }

    this.isLoading = false
    return response
  }

  // 프로젝트 전체 로드밸런서 데이터 
  async fetchLoadbalancers () {

      // 프로젝트 리스트 추출
      const projects = await this.fetchExistedList('P')
      this.projectNameList = projects

      // 프로젝트별 로드밸런서 데이타 추출
      const loadbalancers = (
        await Promise.all(
          projects.map(async projectName => {
            try {

              const resultProjects = await request.get(`${this.getListUrl()}/projects/${projectName}/resources`)
              
              return resultProjects.loadbalancers.map(lb => {
                const listeners = resultProjects.listeners.filter(
                  l => l.name === lb.name || l.name.startsWith(lb.name)
                )

                const pools = resultProjects.pools.filter(
                  p => p.name === lb.name || p.name.startsWith(lb.name)
                )

                const members = resultProjects.members.filter(
                  m => m.pool_name === lb.name || m.pool_name.startsWith(lb.name)
                )

                const monitors = resultProjects.monitors.filter(
                  m => m.name === lb.name || m.name.startsWith(lb.name)
                )

                return {
                  ...lb,
                  project: lb.project,
                  driver_id: lb.driver_id,
                  ip_address: lb.ip_address,
                  status: lb.status,
                  description: resultProjects.project.description,

                  listeners,
                  pools,
                  members,
                  monitors,
                }
              })     
            
            } catch (e) {
              return []
            }
          })
        )
      ).flat()

      this.loadbalancerNameList = loadbalancers.map(item => item.name)
      this.loadbalancerIpList = loadbalancers.map(item => item.ip_address)

      return loadbalancers
  }
 
  // 롤백 및 삭제 처리 함수
  async rollback(stack) {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

    while (stack.length) {
      const rollbackFn = stack.pop()
      try {
        await rollbackFn()
        await sleep(500)
      } catch (e) {
        // 롤백 중 오류는 무시
        console.warn('rollback 실패 (무시)', e)
      }
    }
  }

  // 삭제 함수 
  @action
  async detachListener (project, lb, listener) {
     request.delete(
        `${this.getListUrl()}/projects/${project}/attachments?lbName=${lb}&listenerName=${listener}`
     )
  }
  @action
  async deleteListener (project, name) {
     request.delete(
        `${this.getListUrl()}/projects/${project}/listeners/${name}`
     )
  }
  @action
  async deleteLoadBalancer (project, name) {
     request.delete(
        `${this.getListUrl()}/projects/${project}/loadbalancers/${name}`
     )
  }
  @action
  async deleteMember (project, name) {
     request.delete(
        `${this.getListUrl()}/projects/${project}/members/${name}`
     )
  }
  @action
  async deletePool (project, name) {
     request.delete(
        `${this.getListUrl()}/projects/${project}/pools/${name}`
     )
  }
  @action
  async deleteMonitor (project, name) {
     request.delete(
        `${this.getListUrl()}/projects/${project}/monitors/${name}`
     )
  }
  @action
  async deleteProject (project) {
     request.delete(
        `${this.getListUrl()}/projects/${project}`
     )
  }


}
