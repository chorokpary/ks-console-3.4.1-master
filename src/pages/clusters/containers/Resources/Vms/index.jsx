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
import withList, { ListPage, withClusterList } from 'components/HOCs/withList'
import Table from 'components/Tables/List'
import ResourceTable from 'clusters/components/ResourceTable'

import { cloneDeep, get, isEmpty, omit, find } from 'lodash'
import { Link } from 'react-router-dom'
import { getLocalTime, showNameAndAlias } from 'utils'
import { ICON_TYPES } from 'utils/constants'
import { Dropdown, Menu, Button, Notify, Icon } from '@kube-design/components'

import styles from './index.scss'

import VmStore from 'stores/resources/vms'

@withClusterList({
  store: new VmStore(),
  module: 'vms',
  authKey: 'vms',
  name: t('RESOURCES_VM'),
  rowKey: 'id'
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
    const { page, limit } = toJS(this.props.store.list);
    const project = this.props.clusterStore.project || ''
    if (this.isRuning) {
      this.getData({ silent: true, page, limit, project })
    } else {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  get isRuning() {
    const { selectedRowKeys } = toJS(this.props.store.list)
    const runingFlag = selectedRowKeys.length > 0 ? false : true;
    return runingFlag
  }

  getData = params => {
    this.props.store.fetchList({
      ...this.props.match.params,
      ...params,
      ...this.props.query // search param
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
        text: t('RESOURCES_DELETE'),
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
          text: t('RESOURCES_CREATE'),
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
          text: t('RESOURCES_DELETE'),
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

  getState(state) {
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
    } else {
      return "error"
    }
  }

  getItemDesc(state) {
    if (state === 'Stopped') {
      return t('RESOURCES_STOP')
    } else if (state === 'Provisioning') {
      return t('RESOURCES_CREATING')
    } else if (state === 'Starting') {
      return t('RESOURCES_STARTING')
    } else if (state === 'Running') {
      return t('RESOURCES_RUNNING')
    } else if (state === 'Paused') {
      return t('RESOURCES_PAUSED')
    } else if (state === 'Migrating') {
      return t('RESOURCES_MIGRATING')
    } else if (state === 'Stopping') {
      return t('RESOURCES_STOPPING')
    } else if (state === 'Terminating') {
      return t('RESOURCES_TERMINATING')
    } else if (state === 'Unknown') {
      return t('RESOURCES_UNKNOWN')
    } else {
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
                <Link className={styles.title} to={`/clusters/${cluster}/vms/${name}/${record.id}`}>{name} </Link>
                <div className={styles.desc}>{this.getItemDesc(state)}</div>
              </div>
            </div>
          )
        },
      },
      {
        title: t('PROJECT'),
        dataIndex: 'project',
        isHideable: true,
        search: true,
        width: 'auto',
        render: project => (
          <Link to={`/clusters/${cluster}/projects/${project}`}>
            {showNameAndAlias(project, 'project')}
          </Link>
        ),
      },
      {
        title: t('RESOURCES_IMAGE'),
        dataIndex: 'image',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (image, record) => {
          const icon = "ico-os-" + record.image_object?.distro_type;
          return (
            <Link to={`/clusters/${cluster}/images/${image}`}>
              <i
                style={{
                  backgroundImage: `url('/assets/resources/images/icons/${icon}.svg')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  width: '40px',
                  height: '40px'
                }}></i>
            </Link>
          )
        },
      },
      {
        title: t('RESOURCES_CPU_TYPE'),
        dataIndex: 'cpuType',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (cpuType, record) => {
          const arch_type = <p>{record.image_object?.arch_type}</p>
          return arch_type
        },
      },
      {
        title: t('RESOURCES_STATIC_IP'),
        dataIndex: 'networks',
        isHideable: true,
        search: true,
        width: 'auto',
        render: networks => {
          let networkIpList = ""          
          const networksList = this.props.store.networksList;

          if (!!networks) {
            networkIpList = networks.map((el) => {
              if (el.name != "k8s-pod-network") {
                const networkName = get(find(networksList, {'id' : el.name}),"name");
                return <Link to={`/clusters/${cluster}/networks/${networkName}/${el.name}`}><p key={el.name}>{el.ip}</p></Link>
              }
            });
          } else {
            networkIpList = <p>-</p>
          }

          return networkIpList
        }
      },
      {
        title: t('RESOURCES_FLOATING_IP'),
        dataIndex: 'floating',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (floating, record) => {

          const floatingList = this.props.store.floatingIpList;
          const floatingIp = floatingList && floatingList?.filter((row) => row.instance_id == record.id).map((el) => <p key={el.id}>{el.floating_ip}</p>);

          return floatingIp == "" ? "-" : floatingIp
        },
      },
      {
        title: t('RESOURCES_NODE'),
        dataIndex: 'node',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (node) => {
          const nodeLink = node == "N/A" ? node : <Link to={`/clusters/${cluster}/nodes/${node}`}>{node}</Link>; 
          return (
            nodeLink
          )
        },
      },
      {
        title: t('RESOURCES_SECURITY_GROUP'),
        dataIndex: 'security_group_objects',
        isHideable: true,
        search: true,
        width: 'auto',
        render: security_group_objects => {
          let securityGroupText = ""
          if (!!security_group_objects) {
            securityGroupText = security_group_objects.length > 1 ? security_group_objects[0].name + " 외 " + (security_group_objects.length - 1) + "개" : security_group_objects.length == 1 ? security_group_objects[0].name : "-"
          } else {
            securityGroupText = ""
          }

          return securityGroupText
        },
      },
      {
        title: t('RESOURCES_STATE'),
        dataIndex: 'state',
        filters: this.getVmsStatus(),
        isHideable: true,
        search: true,
        width: 'auto',
        render: (state, record) => {
          const stateArray = ['Stopped', 'Running', 'Paused']

          if (stateArray.includes(state)) {
            return (
              <div>
                <Dropdown content={<Menu>
                  {this.fnGetActionColumn(state, record.id)}
                </Menu>}>
                  <div className={styles.iconwrapper}>
                    <i className={styles[`ico-status-${state.toLowerCase()}`]} /><p>{state}</p>
                  </div>
                </Dropdown>
              </div>
            )
          } else {
            return (
              <div className={styles.iconwrapper}>
                <i className={styles[`ico-status-${state.toLowerCase()}`]} /><p>{state}</p>
              </div>
            )
          }
        },
      },
      {
        title: t('RESOURCES_REGIST_DATE'),
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

  handleVmAction = (action, state, vmId) => {

    if ("Stopped" == state && "pause" == action) {
      Notify.warning(t('RESOURCES_STOPED_PAUSE_DESC'))
      return;
    }
    if ("Stopped" == state && "restart" == action) {
      Notify.warning(t('RESOURCES_STOPED_RESTART_DESC'))
      return;
    }

    const { getData, trigger } = this.props

    const data = {};
    data.vmId = vmId;
    data.state = state;
    data.actionType = action;

    trigger('vm.actionState', {
      data: data,
      success: getData,
      ...this.props.match.params,
    },)
  }

  fnGetActionColumn = (state, vmId) => {
    let elements = "";
    elements =
      <>
        {/* Stopped */}
        {state == "Stopped" &&
          <Menu.MenuItem key="option-1" onClick={() => this.handleVmAction("start", state, vmId)}>
            <i className={styles['ico-quick-start']}></i><span>{t('RESOURCES_START')}</span>
          </Menu.MenuItem>
        }
        {/* Running */}
        {state == "Running" &&
          <>
            <Menu.MenuItem key="option-1" onClick={() => this.handleVmAction("stop", state, vmId)}>
              <i className={styles['ico-quick-stop']}></i><span>{t('RESOURCES_STOP')}</span>
            </Menu.MenuItem>
            <Menu.MenuItem key="option-2" onClick={() => this.handleVmAction("pause", state, vmId)}>
              <i className={styles['ico-quick-pause']}></i><span>{t('RESOURCES_PAUSED_JOONGI')}</span>
            </Menu.MenuItem>
            <Menu.MenuItem key="option-3" onClick={() => this.handleVmAction("restart", state, vmId)}>
              <i className={styles['ico-quick-restart']}></i><span>{t('RESOURCES_RESTART')}</span>
            </Menu.MenuItem>
          </>
        }
        {/* Paused */}
        {state == "Paused" &&
          <>
            <Menu.MenuItem key="option-1" onClick={() => this.handleVmAction("stop", state, vmId)}>
              <i className={styles['ico-quick-stop']}></i><span>{t('RESOURCES_STOP')}</span>
            </Menu.MenuItem>
            <Menu.MenuItem key="option-2" onClick={() => this.handleVmAction("unpause", state, vmId)}>
              <i className={styles['ico-quick-unpause']}></i><span>{t('RESOURCES_UNPAUSE')}</span>
            </Menu.MenuItem>
            <Menu.MenuItem key="option-3" onClick={() => this.handleVmAction("restart", state, vmId)}>
              <i className={styles['ico-quick-restart']}></i><span>{t('RESOURCES_RESTART')}</span>
            </Menu.MenuItem>
          </>
        }
      </>

    return elements;
  }


  get emptyProps() {
    return { desc: t('RESOURCES_PLEASE_CREATE_DATA') }
  }

  get columnSearch() {
    return [
      {
        dataIndex: 'name',
        title: t('RESOURCES_NAME'),
        search: true,
      },
      {
        dataIndex: 'state',
        title: t('RESOURCES_STATE'),
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

  getBanner = () => {
    return <i className="ico-type-vm"></i>
  }

  fnMoveDetail = (route, name) => {
    const detailUrl = `clusters/default/${route}/${name}`
    routing.push(listUrl)
  }

  render() {
    const { bannerProps, tableProps } = this.props
    //console.log({ ...this.props })

    return (
      <ListPage {...this.props}>
        <Banner
          {...bannerProps}
          // icon="templet"
          icon={this.getBanner}
          tabs={this.tabs}
          title={t('RESOURCES_VM')}
          description={t('RESOURCES_VM_DESC')}
        />
        <ResourceTable
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
