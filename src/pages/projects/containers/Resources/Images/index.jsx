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

import RoleStore from 'stores/role'
import ImageStore from 'stores/resources/images'

@withList({
  store: new ImageStore(),
  module: 'images',
  authKey: 'images',
  name: t('RESOURCES_VM_IMAGE'),
})
export default class Images extends React.Component {

  showAction(record) {
    return globals.user.username !== record.name
  }

  get itemActions() {
    return []
  }

  get tableActions() {
    return {}
  }

  getColumns = () => {
    const { getSortOrder } = this.props
    const { workspace, cluster, namespace } = this.props.match.params
    return [
      {
        title: t('RESOURCES_NAME'),
        dataIndex: 'name',
        sorter: true,
        render: name => (
          <Avatar
            icon="snapshot"
            iconSize={40}
            to={`/${workspace}/clusters/${cluster}/projects/${namespace}/images/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('RESOURCES_CPU_TYPE'),
        dataIndex: 'arch_type',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_BOOT_TYPE'),
        dataIndex: 'boot_type',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_DISTRIBUTION'),
        dataIndex: 'distro_type',
        isHideable: true,
        width: 'auto',
        render: distro_type => {
          const icon = "ico-os-" + distro_type;
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
        title: t('RESOURCES_STEP'),
        dataIndex: 'phase',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_PROGRESS'),
        dataIndex: 'progress',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_REGIST_DATE'),
        dataIndex: 'timestamp',
        isHideable: true,
        sorter: true,
        sortOrder: getSortOrder('descend'),
        width: 150,
        render: date => (
          <p>
            {date
              ? getLocalTime(date).format('YYYY-MM-DD HH:mm:ss')
              : t('-')}
          </p>
        ),
      },
    ]
  }

  get emptyProps() {
    return { desc: t('RESOURCES_NO_DATA') }
  }

  render() {

    const { bannerProps, tableProps } = this.props
    return (
      <ListPage {...this.props}>
        <Banner
          icon="snapshot"
          {...bannerProps}
          tabs={this.tabs}
          title={t('RESOURCES_VM_IMAGE')}
          description={t('RESOURCES_VM_IMAGE_DESC')}
        />
        <Table
          {...tableProps}
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


