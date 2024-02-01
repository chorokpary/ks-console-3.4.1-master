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
import ResourceTable from 'clusters/components/ResourceTable'

import React from 'react'
import { toJS } from 'mobx'
import { Avatar, Status } from 'components/Base'
import Banner from 'components/Cards/Banner'
import withList, { ListPage, withClusterList } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'

import KeypairStore from 'stores/resources/keypairs'

@withList({
  store: new KeypairStore(),
  module: 'keypairs',
  authKey: 'keypairs',
  name: t('RESOURCES_KEYPAIR'),
  rowKey: 'id'
})
export default class ImageBuild extends React.Component {


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
          trigger('computingappmanage.remove', {
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
            trigger('computingappmanage.regist', {
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
            trigger('computingappmanage.remove.batch', {
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
        title: t('RESOURCES_NAME'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('name'),
        search: true,
        render: (name, item) => (
          <Avatar
            icon="application"
            iconSize={40}
            to={`/clusters/${cluster}/computingappmanage/${name}/${item.id}`}
            title={name}
          />
        ),
      },
      {
        title: t('RESOURCES_CPU_TYPE'),
        dataIndex: 'project',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_TAG'),
        dataIndex: 'project',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_OS_INFORMATION'),
        dataIndex: 'project',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_FILE_NAME'),
        dataIndex: 'project',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_SIZE'),
        dataIndex: 'project',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_STATE'),
        dataIndex: 'project',
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
        dataIndex: 'finger_print',
        title: t('FINGER PRINT'),
        search: true,
      }
    ]
  }


  render() {

    const { bannerProps, tableProps } = this.props
    return (
      <ListPage {...this.props}>
        <Banner
          {...bannerProps}
          icon="application"
          title={t('애플리케이션 배포 관리')}
          description={t('애플리케이션의 배포를 관리 할 수 있습니다')}
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
