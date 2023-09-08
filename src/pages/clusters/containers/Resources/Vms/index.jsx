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
import { ICON_TYPES } from 'utils/constants'

import VmStore from 'stores/resources/vms'

@withList({
  store: new VmStore(),
  module: 'vms',
  authKey: 'vms',
  name: '가상머신',
})
export default class Vms extends React.Component {

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
        render: name => (
          <Avatar
            icon="templet"
            iconSize={40}
            to={`/clusters/${cluster}/vms/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('이미지'),
        dataIndex: 'image',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('Flavor'),
        dataIndex: 'flavor',
        isHideable: true,
        search: true,
        width: 'auto',
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
            networkIpList = <p></p>
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
          return floatingIp
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
        isHideable: true,
        search: true,
        width: 'auto',
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
        dataIndex: 'flavor',
        title: t('Flavor'),
        search: true,
      }
    ]
  }


  render() {
    const { bannerProps, tableProps } = this.props
    // console.log({ ...this.props })
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
      />
    </ListPage>
     
    )
  }
}
