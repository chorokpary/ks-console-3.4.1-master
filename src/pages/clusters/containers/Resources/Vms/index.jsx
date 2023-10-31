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

import React from 'react'
import { toJS } from 'mobx'
import { Avatar, Status, Indicator } from 'components/Base'
import Banner from 'components/Cards/Banner'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { cloneDeep, get, isEmpty, omit } from 'lodash'
import { Link } from 'react-router-dom'
import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'
import { Dropdown, Menu, Button, Notify, Icon } from '@kube-design/components'

import styles from './index.scss'

import VmStore from 'stores/resources/vms'

@withList({
  store: new VmStore(),
  module: 'vms',
  authKey: 'vms',
  name: '가상머신',
})
export default class Vms extends React.Component {

   //auto refresh start  ##################################
   constructor(props) {
    super(props)
    this.refreshTimer = setInterval(() => this.refreshHandler(), 4000)
  }
 
  componentDidUpdate() {
    if (this.refreshTimer === null && this.isRuning) {
      this.refreshTimer = setInterval(() => this.refreshHandler(), 4000)
    }
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer)
    this.unsubscribe && this.unsubscribe()
  }

  refreshHandler = () => {
    if (this.isRuning) {
      this.getData({ silent: true })
    } else {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  get isRuning() {
    const { data } = toJS(this.props.store.list)
    const runingData = data.filter(
      item => item.status !== 'failed' && item.status !== 'successful'
    )
    return !isEmpty(runingData)
  }

  getData = params => {
    this.props.store.fetchList({
      ...this.props.match.params,
      ...params,
    })
  }
  //auto refresh end  ##################################



  showAction(record) {
    return globals.user.username !== record.name
  }

  get itemActions() {
    const { getData, trigger } = this.props
    return [
      {
        key: 'delete',
        icon: 'trash',
        text: t('삭제'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('vm.remove', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
    ]
  }

  get tableActions() {
    const { trigger, getData, routing, tableProps } = this.props
    return {
      ...tableProps.tableActions,
      actions: [
        {
          key: 'regist',
          type: 'control',
          text: t('생성'),
          action: 'create',
          onClick: () =>
            trigger('vm.regist', {
            ...this.props.match.params,
            type: this.name,
            success: getData,
          }),
        },
      ],
      selectActions: [
        {
          key: 'delete',
          type: 'danger',
          text: t('REMOVE'),
          action: 'delete',
          onClick: () =>
            trigger('vm.remove.batch', {
              success: getData,
              ...this.props.match.params,
            }),
        },
      ],
      getCheckboxProps: record => ({
        disabled: !this.showAction(record),
        name: record.name,
      }),
    }
  }

  getState (state) {
    if (state === 'Provisioning'
      || state === 'Starting'
      || state === 'Stopping'
      || state === 'Terminating'
      || state === 'Migrating') {
      return "waiting"
    } else if (state === 'Running') {
      return "running"
    } else if (state === 'Stopped' || state === 'Paused') {
      return "stopped"
    } else if (state === 'Unknown') {
      return "error"
    }else{
      return "error"
    }
  }

  getItemDesc (state) {
    if (state === 'Stopped'){
      return "중지"
    }else if (state === 'Provisioning') {
      return "생성 중"
    }else if (state === 'Starting') {
      return "시작 중"
    }else if (state === 'Running') {
      return "실행 중"
    }else if (state === 'Paused') {
      return "일시 정지"
    }else if (state === 'Migrating') {
      return "이관 중"  
    }else if (state === 'Stopping') {
      return "정지 중"
    }else if (state === 'Terminating') {
      return "삭제 중"
    }else if (state === 'Unknown') {
      return "알수없음"
    }else{
      return "-"
    }
  }

  getVmsStatus() {
    const VMS_STATUS = [
      { text: 'STOPPED', value: 'Stopped' },
      { text: 'PROVISIONING', value: 'Provisioning' },
      { text: 'STARTING', value: 'Starting' },
      { text: 'RUNNING', value: 'Running' },
      { text: 'PAUSED', value: 'Paused' },
      { text: 'MIGRATING', value: 'Migrating' },
      { text: 'STOPPING', value: 'Stopping' },
      { text: 'TERMINATING', value: 'Terminating' },
      { text: 'UNKNOWN', value: 'Unknown' },
    ]

    return VMS_STATUS.map(status => ({
      // text: t(status.text),
      text: status.text,
      value: status.value,
    }))
  }
   
  getColumns = () => {
    const { getSortOrder } = this.props
    const { cluster } = this.props.match.params
    return [
      {
        title: t('NAME'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('name'),
        search: true,
        render: this.renderAvatar,
        render: (name, record) => {

          const { cluster } = this.props.match.params
          const { state } = record

          return (
            <div className={styles.avatar}>
              <div className={styles.icon}>
                <i className="ico-type-vm"></i>
                <Indicator
                  className={styles.indicator}
                  type={this.getState(state)}
                  flicker
                />
              </div>
              <div>    
                <Link className={styles.title} to={`/clusters/${cluster}/vms/${name}`}>{name} </Link>            
                <div className={styles.desc}>{this.getItemDesc(state)}</div> 
              </div>
            </div>
          )
        },
      },
      {
        title: t('이미지'),
        dataIndex: 'image',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (image, record)  => {
          const icon = "ico-os-"+record.image_detail?.distro_type;
          return (
            <i
            style={{
              backgroundImage: `url('/assets/resources/images/icons/${icon}.svg')`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              width: '40px',
              height: '40px'
            }}></i>
          )
        },
      },
      {
        title: t('CPU 타입'),
        dataIndex: 'cpuType',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (cpuType, record)  => {
          const arch_type = <p>{record.image_detail?.arch_type}</p>
          return arch_type
        },
      },
      {
        title: t('고정 IP'),
        dataIndex: 'networks',
        isHideable: true,
        search: true,
        width: 'auto',
        render: networks => {
          let networkIpList = ""

          if (!!networks) {
            networkIpList = networks.map((el) => {
              if (el.name != "k8s-pod-network") {
                return <p key={el.name}>{el.ip}</p>
              }
            });
          } else {
            networkIpList = <p>-</p>
          }
      
          return networkIpList
        }
      },
      {
        title: t('플로팅 IP'),
        dataIndex: 'floating',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (floating, record)  => {
          const floatingList = this.props.store.floatingIpList;
          const floatingIp = floatingList && floatingList?.filter((row) => row.instance_name == record.name).map((el) => <p key={el.id}>{el.floating_ip}</p>);

          return floatingIp == "" ? "-" : floatingIp
        },
      },
      {
        title: t('노드'),
        dataIndex: 'node',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('보안그룹'),
        dataIndex: 'security_groups',
        isHideable: true,
        search: true,
        width: 'auto',
        render: security => {
          let securityGroupText = ""
          if (!!security) {
            securityGroupText = security.length > 1 ? security[0] + " 외 " + (security.length - 1) + "개" : security[0]
          } else {
            securityGroupText = ""
          }
          
          return securityGroupText
        },
      },
      {
        title: t('상태'),
        dataIndex: 'state',
        filters: this.getVmsStatus(),
        isHideable: true,
        search: true,
        width: 'auto',
        render: (state, record) => {
          const stateArray = ['Stopped','Running','Paused']

          if(stateArray.includes(state)){
            return (
              <div>
                <Dropdown content={<Menu>
                  {this.fnGetActionColumn(state, record.name)}
                  </Menu>}>
                  <div className={styles.iconwrapper}>
                    <i className={styles[`ico-status-${state.toLowerCase()}`]}/><p>{state}</p>
                  </div>   
                </Dropdown>
              </div>  
            )       
          }else{
            return (
              <div className={styles.iconwrapper}>
                <i className={styles[`ico-status-${state.toLowerCase()}`]}/><p>{state}</p>
              </div>  
            )
          } 
        },      
      },
      {
        title: t('등록일'),
        dataIndex: 'creation_timestamp',
        isHideable: true,
        width: 150,
        sorter: true,
        sortOrder: getSortOrder('creation_timestamp'),
        render: creation_timestamp => (
          <p>
            {getLocalTime(creation_timestamp).format('YYYY-MM-DD HH:mm:ss')}
          </p>
        ),
      },
    ]
  }

  handleVmAction = (action, state, vmName) => {

    if ("Stopped" == state && "pause" == action) {
      Notify.warning('Stopped 상태에서 Pause 할 수 없습니다.')
      return;
    }
    if ("Stopped" == state && "restart" == action) {
      Notify.warning('Stopped 상태에서 Restart 할 수 없습니다.')
      return;
    }

    const { getData, trigger } = this.props

    const data = {};
    data.vmName = vmName;
    data.state = state;
    data.actionType = action;

    trigger('vm.actionState', {
      data: data,
      success: getData,
      ...this.props.match.params,
    },)
  }

  fnGetActionColumn = (state, vmName) => {
    let elements = "";
    elements =
      <>
        {/* Stopped */}
        {state == "Stopped" &&
           <Menu.MenuItem key="option-1" onClick={() => this.handleVmAction("start", state, vmName)}>
            <i className={styles['ico-quick-start']}></i><span>시작</span>
          </Menu.MenuItem>
        }
        {/* Running */}
        {state == "Running" &&
            <>
              <Menu.MenuItem key="option-1" onClick={() => this.handleVmAction("stop", state, vmName)}>
                <i className={styles['ico-quick-stop']}></i><span>중지</span>
              </Menu.MenuItem>
              <Menu.MenuItem key="option-2" onClick={() => this.handleVmAction("pause", state, vmName)}>
                <i className={styles['ico-quick-pause']}></i><span>일시중지</span>
              </Menu.MenuItem>
              <Menu.MenuItem key="option-3" onClick={() => this.handleVmAction("restart", state, vmName)}>
                <i className={styles['ico-quick-restart']}></i><span>재시작</span>
              </Menu.MenuItem>
            </>   
        }
        {/* Paused */}
        {state == "Paused" &&
            <>
            <Menu.MenuItem key="option-1" onClick={() => this.handleVmAction("stop", state, vmName)}>
              <i className={styles['ico-quick-stop']}></i><span>중지</span>
            </Menu.MenuItem>
            <Menu.MenuItem key="option-2" onClick={() => this.handleVmAction("unpause", state, vmName)}>
              <i className={styles['ico-quick-unpause']}></i><span>일시중지 해제</span>
            </Menu.MenuItem>
            <Menu.MenuItem key="option-3" onClick={() => this.handleVmAction("restart", state, vmName)}>
              <i className={styles['ico-quick-restart']}></i><span>재시작</span>
            </Menu.MenuItem>
          </>   
        }
      </>

    return elements;
  }


  get emptyProps() {
    return { desc: t('Please create a data.') }
  }

  get columnSearch() {
    return [
      {
        dataIndex: 'name',
        title: t('이름'),
        search: true,
      },
      {
        dataIndex: 'state',
        title: t('상태'),
        search: true,
      }
    ]
  }

  handleFetch = (params, refresh) => {
    this.routing.query(params, refresh)
  }

  get routing() {
    return this.props.rootStore.routing
  }

  render() {
    const { bannerProps, tableProps } = this.props
    //console.log({ ...this.props })
    
    return (
      <ListPage {...this.props}>
      <Banner
        {...bannerProps}
        icon="templet"
        tabs={this.tabs}
        title={t('가상머신')}
        description={t('가상머신의 상태와 사용현황을 관리 할 수 있습니다.')}
      />
      <Table
        {...tableProps}
        emptyProps={this.emptyProps}
        className={'table-2-6 table-4-3'}
        itemActions={this.itemActions}
        tableActions={this.tableActions}
        columns={this.getColumns()}
        columnSearch={this.columnSearch}
        onFetch={this.handleFetch}
      />
    </ListPage>
     
    )
  }
}
