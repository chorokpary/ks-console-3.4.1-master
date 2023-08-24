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
import { Avatar, Status } from 'components/Base'
import Banner from 'components/Cards/Banner'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { getLocalTime } from 'utils'

import UserStore from 'stores/user'
import RoleStore from 'stores/role'

@withList({
  store: new UserStore(),
  module: 'images',
  authKey: 'members',
  name: '이미지',
})
export default class Members extends React.Component {
  roleStore = new RoleStore('clusterroles')

  get canViewRoles() {
    const { cluster } = this.props.match.params
    return globals.app.hasPermission({
      cluster,
      module: 'roles',
      action: 'view',
    })
  }

  componentDidMount() {
    this.canViewRoles &&
      this.roleStore.fetchList({ ...this.props.match.params, limit: -1 })
  }

  get tips() {
    return [
      {
        title: t('HOW_TO_INVITE_MEMBER_Q'),
        description: t('HOW_TO_INVITE_MEMBER_A'),
      },
    ]
  }

  showAction(record) {
    return globals.user.username !== record.name
  }

  get itemActions() {
    const { getData, trigger } = this.props
    return [
      {
        key: 'modify',
        icon: 'pen',
        text: t('CHANGE_ROLE'),
        action: 'edit',
        show: this.showAction,
        onClick: item =>
          trigger('member.edit', {
            detail: item,
            ...this.props.match.params,
            roles: toJS(this.roleStore.list.data),
            role: item.clusterrole,
            success: getData,
          }),
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('REMOVE'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('member.remove', {
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
          key: 'invite',
          type: 'control',
          text: t('INVITE'),
          action: 'create',
          onClick: () =>
            trigger('member.invite', {
              ...this.props.match.params,
              roles: toJS(this.roleStore.list.data),
              roleModule: this.roleStore.module,
              title: t('INVITE_MEMBER'),
              desc: t('INVITE_CLUSTER_MEMBER_DESC'),
              searchPlaceholder: t('INVITE_MEMBER_SEARCH_PLACEHOLDER'),
              success: routing.query,
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
            trigger('member.remove.batch', {
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

  getColumns = () => [
    {
      title: t('name'),
      dataIndex: 'name',
      sorter: true,
      // render: (name, record) => (
      //   <Avatar
      //     avatar={record.avatar_url || '/assets/default-user.svg'}
      //     title={name}
      //     desc={record.email || '-'}
      //     noLink
      //   />
      // ),
    },
    {
      title: t('arch_type'),
      dataIndex: 'arch_type',
      isHideable: true,
      width: '19%',
      // render: status => (
      //   <Status type={status} name={t(`USER_${status.toUpperCase()}`)} />
      // ),
    },
    {
      title: t('os_type'),
      dataIndex: 'os_type',
      isHideable: true,
      width: '19%',
    },
    {
      title: t('timestamp'),
      dataIndex: 'timestamp',
      isHideable: true,
      width: 150,
      render: login_time => (
        <p>
          {login_time
            ? getLocalTime(login_time).format('YYYY-MM-DD HH:mm:ss')
            : t('NOT_LOGIN_YET')}
        </p>
      ),
    },
  ]

  get emptyProps() {
    return { desc: t('INVITE_CLUSTER_MEMBER_DESC') }
  }

  render() {
    const asd = [
      {
        cluster: 'default',
        namespace: undefined,
        arch_type: 'x86_64',
        name: 'almalinux-8-image-amd64',
        os_type: 'linux',
        timestamp: '2023-08-16T02:38:41Z',
      },
      {
        cluster: 'default',
        namespace: undefined,
        arch_type: 'x86_64',
        name: 'almalinux-9-image-amd64',
        os_type: 'linux',
        timestamp: '2023-08-16T02:38:41Z',
      },
      {
        cluster: 'default',
        namespace: undefined,
        arch_type: 'x86_64',
        name: 'centos-7-image-amd64',
        os_type: 'linux',
        timestamp: '2023-08-16T02:38:41Z',
      },
    ]

    const { bannerProps, tableProps } = this.props
    console.log({ ...tableProps })
    return (
      <ListPage {...this.props}>
        <Banner
          {...bannerProps}
          tabs={this.tabs}
          description={t('이미지 리스트')}
        />
        <Table
          {...tableProps}
          // data={asd}
          emptyProps={this.emptyProps}
          tableActions={this.tableActions}
          itemActions={this.itemActions}
          columns={this.getColumns()}
          searchType="name"
        />
      </ListPage>
    )
  }
}
