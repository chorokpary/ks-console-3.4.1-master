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
import classNames from 'classnames'
import Indicator from 'components/Base/Indicator'


import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'

import SriovStore from 'stores/resources/sriovs'

@withList({
  store: new SriovStore(),
  module: 'sriovs',
  authKey: 'sriovs',
  name: 'SR-IOV',
})
export default class ResourcesVolumes extends React.Component {
 

  showAction(record) {
    return globals.user.username !== record.name
  }

  getFilterType() {
    const NETWORK_TYPE = [
      { text: 'VLAN', value: 'vlan' },
      { text: 'FLAT', value: 'flat' },
    ]

    return NETWORK_TYPE.map(status => ({
      text: status.text,
      value: status.value,
    }))
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
          trigger('sriov.remove', {
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
            trigger('sriov.regist', {
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
            trigger('sriov.remove.batch', {
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
            icon="storage"
            iconSize={40}
            to={`/clusters/${cluster}/sriovs/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('RESOURCES_NETWORK_TYPE:'),
        dataIndex: 'type',
        filters: this.getFilterType(),
        isHideable: true,
        search: true,
        width: 'auto',
        render: type => (
          <p>{type.toUpperCase()}</p>
        ),
      },
      {
        title: t('CIDR'),
        dataIndex: 'cidr',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_GATEWAY_IP'),
        dataIndex: 'gateway_ip',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_SEGMENT_ID'),
        dataIndex: 'segment_id',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_REGIST_DATE'),
        dataIndex: 'timestamp',
        isHideable: true,
        width: 150,
        sorter: true,
        sortOrder: getSortOrder('timestamp'),
        render: timestamp => (
          <p>
            {getLocalTime(timestamp).format('YYYY-MM-DD HH:mm:ss')}
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
        title: t('RESOURCES_NAME'),
        search: true,
      },
      {
        dataIndex: 'cidr',
        title: t('CIDR'),
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
        icon="storage"
        tabs={this.tabs}
        title={t('SR-IOV')}
        description={t('RESOURCES_SR_IOV_DESC')}
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
