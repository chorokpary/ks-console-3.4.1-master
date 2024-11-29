/* eslint-disable no-undef */
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
import { find, get } from 'lodash'
import { Link } from 'react-router-dom'
import { Dropdown, Menu, Notify } from '@kube-design/components'
import { Indicator } from 'components/Base'
import Banner from 'components/Cards/Banner'
import { ListPage, withClusterList } from 'components/HOCs/withList'
import ResourceTable from 'clusters/components/ResourceTable'

import { getLocalTime, showNameAndAlias } from 'utils'

import VmStore from 'stores/resources/vms'
import styles from './index.scss'

@withClusterList({
  store: new VmStore(),
  module: 'vms',
  authKey: 'vms',
  name: t('RESOURCES_VM'),
  rowKey: 'id',
})
export default class Vms extends React.Component {
  // auto refresh start  ##################################
  constructor(props) {
    super(props)
    this.refreshTimer = setInterval(() => this.refreshHandler(), 4000)
    this.isRefresh = false;
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
    const { page, limit } = toJS(this.props.store.list)
    const project = this.props.clusterStore.project || ''

    if (this.isRuning && !this.isRefresh) {
      this.getData({ silent: true, page, limit, project })
    } 
  }

  get isRuning() {
    const { selectedRowKeys } = toJS(this.props.store.list)
    return !(selectedRowKeys.length > 0)
  }

  getData = params => {
    this.props.store.fetchList({
      ...this.props.match.params,
      ...params,
      ...this.props.query, // search param
    })
  }

  stopRefresh = () => {
    this.isRefresh = true;
  }

  startRefresh = () => {
    this.isRefresh = false;
  }

  // auto refresh end  ##################################

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
    const { trigger, getData, tableProps } = this.props

    return {
      ...tableProps.tableActions,
      actions: [
        {
          key: 'regist',
          type: 'control',
          text: t('RESOURCES_CREATE'),
          action: 'create',
          onClick: () => {
            trigger('vm.regist', {
              ...this.props.match.params,
              type: this.name,
              success: getData,
              startRefresh: this.startRefresh
            })
            this.stopRefresh();
          },            
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
    if (
      state === 'Provisioning' ||
      state === 'Starting' ||
      state === 'Stopping' ||
      state === 'Terminating' ||
      state === 'Migrating'
    ) {
      return 'waiting'
    }
    if (state === 'Running') {
      return 'running'
    }
    if (state === 'Stopped' || state === 'Paused') {
      return 'stopped'
    }
    if (state === 'Unknown') {
      return 'error'
    }
    return 'error'
  }

  getItemDesc(state) {
    return t(`RESOURCES_${state.toUpperCase()}`)
  }

  getVmsStatus() {
    const VMS_STATUS = [
      { text: t('RESOURCES_STOPPED'), value: 'Stopped' },
      { text: t('RESOURCES_PROVISIONING'), value: 'Provisioning' },
      { text: t('RESOURCES_STARTING'), value: 'Starting' },
      { text: t('RESOURCES_RUNNING'), value: 'Running' },
      { text: t('RESOURCES_PAUSED'), value: 'Paused' },
      { text: t('RESOURCES_MIGRATING'), value: 'Migrating' },
      { text: t('RESOURCES_STOPPING'), value: 'Stopping' },
      { text: t('RESOURCES_TERMINATING'), value: 'Terminating' },
      { text: t('RESOURCES_UNKNOWN'), value: 'Unknown' },
      { text: t('RESOURCES_CRASHLOOPBACKOFF'), value: 'CrashLoopBackOff' },
      { text: t('RESOURCES_ERRORUNSCHEDULABLE'), value: 'ErrorUnschedulable' },
      { text: t('RESOURCES_ERRIMAGEPULL'), value: 'ErrImagePull' },
      { text: t('RESOURCES_IMAGEPULLBACKOFF'), value: 'ImagePullBackOff' },
      { text: t('RESOURCES_ERRORPVCNOTFOUND'), value: 'ErrorPvcNotFound' },
      { text: t('RESOURCES_DATAVOLUMEERROR'), value: 'DataVolumeError' },
      {
        text: t('RESOURCES_WAITINGFORVOLUMEBINDING'),
        value: 'WaitingForVolumeBinding',
      },
    ]

    return VMS_STATUS.map(status => ({
      // text: t(status.text),
      text: status.text,
      value: status.value,
    }))
  }

  getVmsCpuType() {
    const VMS_CPU_TYPE = [
      { text: 'x86_64', value: 'x86_64' },
      { text: 'aarch64', value: 'aarch64' },
    ]

    return VMS_CPU_TYPE.map(status => ({
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
          //   const { cluster } = this.props.match.params
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
                <Link
                  className={styles.title}
                  to={`/clusters/${cluster}/vms/${name}/${record.id}`}
                >
                  {name}{' '}
                </Link>
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
          const icon = `ico-os-${record.image_object?.distro_type}`
          return image ? (
            <Link to={`/clusters/${cluster}/images/${image}`}>
              <i
                style={{
                  backgroundImage: `url('/assets/resources/images/icons/${icon}.svg')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  width: '40px',
                  height: '40px',
                }}
              ></i>
            </Link>
          ) : (
            <p className={styles.textCenter}>N/A</p>
          )
        },
      },
      {
        title: t('RESOURCES_CPU_TYPE'),
        dataIndex: 'cpu_arch',
        filters: this.getVmsCpuType(),
        isHideable: true,
        search: true,
        width: 'auto',
        render: cpu_arch => {
          return <p>{cpu_arch}</p>
        },
      },
      {
        title: t('RESOURCES_STATIC_IP'),
        dataIndex: 'networks',
        isHideable: true,
        search: true,
        width: 'auto',
        render: networks => {
          let networkIpList
          const networksList = this.props.store.networksList

          if (networks) {
            networkIpList = networks.map(el => {
              if (el.name !== 'k8s-pod-network') {
                get(find(networksList, { id: el.name }), 'name')
                return <p key={el.name}>{el.ip}</p>
              }
            })
          } else {
            networkIpList = <p>-</p>
          }

          return networkIpList
        },
      },
      {
        title: t('RESOURCES_FLOATING_IP'),
        dataIndex: 'floating',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (floating, record) => {
          const floatingList = this.props.store.floatingIpList
          const floatingIp =
            floatingList &&
            floatingList
              ?.filter(row => row.instance_id === record.id)
              .map(el => <p key={el.id}>{el.floating_ip}</p>)

          return floatingIp === '' ? '-' : floatingIp
        },
      },
      {
        title: t('RESOURCES_NODE'),
        dataIndex: 'node',
        isHideable: true,
        search: true,
        width: 'auto',
        render: node => {
          return node === 'N/A' ? (
            node
          ) : (
            <Link to={`/clusters/${cluster}/nodes/${node}`}>{node}</Link>
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
          let securityGroupText = ''
          if (security_group_objects) {
            securityGroupText =
              security_group_objects.length > 1
                ? `${security_group_objects[0].name} ${t(
                    'RESOURCES_BESIDES'
                  )} ${security_group_objects.length - 1} ${t(
                    'RESOURCES_COUNT'
                  )}`
                : security_group_objects.length === 1
                ? security_group_objects[0].name
                : '-'
          } else {
            securityGroupText = ''
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
                <Dropdown
                  content={
                    <Menu>{this.fnGetActionColumn(state, record.id)}</Menu>
                  }
                >
                  <div className={styles.iconwrapper}>
                    <i
                      className={styles[`ico-status-${state.toLowerCase()}`]}
                    />
                    <p>
                      {/* {state === 'Stopped' && t('RESOURCES_STOP')}
                      {state === 'Provisioning' && t('RESOURCES_PROVISIONING')}
                      {state === 'Starting' && t('RESOURCES_STARTING')}
                      {state === 'Running' && t('RESOURCES_RUNNING')}
                      {state === 'Paused' && t('RESOURCES_PAUSED')}
                      {state === 'Migrating' && t('RESOURCES_MIGRATING')}
                      {state === 'Stopping' && t('RESOURCES_STOPPING')}
                      {state === 'Terminating' && t('RESOURCES_TERMINATING')}
                      {state === 'Unknown' && t('RESOURCES_UNKNOWN')} */}
                      {t(`RESOURCES_${state.toUpperCase()}`)}
                    </p>
                  </div>
                </Dropdown>
              </div>
            )
          }
          return (
            <div className={styles.iconwrapper}>
              <i className={styles[`ico-status-${state.toLowerCase()}`]} />
              <p>
                {/* {state} */}
                {t(`RESOURCES_${state.toUpperCase()}`)}
              </p>
            </div>
          )
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
    if (state === 'Stopped' && action === 'pause') {
      Notify.warning(t('RESOURCES_STOPED_PAUSE_DESC'))
      return
    }
    if (state === 'Stopped' && action === 'restart') {
      Notify.warning(t('RESOURCES_STOPED_RESTART_DESC'))
      return
    }

    const { getData, trigger } = this.props

    const data = {}
    data.vmId = vmId
    data.state = state
    data.actionType = action

    trigger('vm.actionState', {
      data,
      success: getData,
      ...this.props.match.params,
    })
  }

  fnGetActionColumn = (state, vmId) => {
    return (
      <>
        {/* Stopped */}
        {state === 'Stopped' && (
          <Menu.MenuItem
            key="option-1"
            onClick={() => this.handleVmAction('start', state, vmId)}
          >
            <i className={styles['ico-quick-start']}></i>
            <span>{t('RESOURCES_START')}</span>
          </Menu.MenuItem>
        )}
        {/* Running */}
        {state === 'Running' && (
          <>
            <Menu.MenuItem
              key="option-1"
              onClick={() => this.handleVmAction('stop', state, vmId)}
            >
              <i className={styles['ico-quick-stop']}></i>
              <span>{t('RESOURCES_STOP')}</span>
            </Menu.MenuItem>
            <Menu.MenuItem
              key="option-2"
              onClick={() => this.handleVmAction('pause', state, vmId)}
            >
              <i className={styles['ico-quick-pause']}></i>
              <span>{t('RESOURCES_PAUSED_JOONGI')}</span>
            </Menu.MenuItem>
            <Menu.MenuItem
              key="option-3"
              onClick={() => this.handleVmAction('restart', state, vmId)}
            >
              <i className={styles['ico-quick-restart']}></i>
              <span>{t('RESOURCES_RESTART')}</span>
            </Menu.MenuItem>
          </>
        )}
        {/* Paused */}
        {state === 'Paused' && (
          <>
            <Menu.MenuItem
              key="option-1"
              onClick={() => this.handleVmAction('stop', state, vmId)}
            >
              <i className={styles['ico-quick-stop']}></i>
              <span>{t('RESOURCES_STOP')}</span>
            </Menu.MenuItem>
            <Menu.MenuItem
              key="option-2"
              onClick={() => this.handleVmAction('unpause', state, vmId)}
            >
              <i className={styles['ico-quick-unpause']}></i>
              <span>{t('RESOURCES_UNPAUSE')}</span>
            </Menu.MenuItem>
            <Menu.MenuItem
              key="option-3"
              onClick={() => this.handleVmAction('restart', state, vmId)}
            >
              <i className={styles['ico-quick-restart']}></i>
              <span>{t('RESOURCES_RESTART')}</span>
            </Menu.MenuItem>
          </>
        )}
      </>
    )
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
      },
      {
        dataIndex: 'cpu_arch',
        title: t('RESOURCES_CPU_TYPE'),
        search: true,
      },
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

  render() {
    const { bannerProps, tableProps } = this.props
    // console.log({ ...this.props })

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
