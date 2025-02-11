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
import { Avatar } from 'components/Base'
import Banner from 'components/Cards/Banner'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { getLocalTime } from 'utils'

import ContainerImagesStore from 'stores/resources/containerimages'

@withList({
  store: new ContainerImagesStore(),
  module: 'containerimages',
  authKey: 'containerimages',
  name: t('RESOURCES_KAAS_IMAGE'),
})
export default class Images extends React.Component {
  // auto refresh start  ##################################
  constructor(props) {
    super(props)
    this.refreshTimer = setInterval(() => this.refreshHandler(), 4000)
    this.isRefresh = false
  }

  componentDidUpdate() {
    if (this.refreshTimer === null && this.isRunning) {
      this.refreshTimer = setInterval(() => this.refreshHandler(), 4000)
    }
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer)
    this.unsubscribe && this.unsubscribe()
  }

  refreshHandler = () => {
    const { page, limit } = toJS(this.props.store.list)
    if (this.isRunning && !this.isRefresh) {
      this.getData({ silent: true, page, limit })
    }
  }

  get isRunning() {
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

  startRefresh = () => {
    this.isRefresh = false
  }

  // auto refresh end  ##################################

  showAction(record) {
    return globals.user.username !== record.name
  }

  get itemActions() {
    return []
  }

  get tableActions() {
    return []
  }

  get columnSearch() {
    return [
      {
        dataIndex: 'name',
        title: t('RESOURCES_NAME'),
        search: true,
      },
      {
        dataIndex: 'arch_type',
        title: t('RESOURCES_CPU_TYPE'),
        search: true,
      },
    ]
  }

  getCpuType() {
    const CPU_TYPE = [
      { text: 'x86_64', value: 'x86_64' },
      { text: 'aarch64', value: 'aarch64' },
    ]

    return CPU_TYPE.map(status => ({
      text: status.text,
      value: status.value,
    }))
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
            to={`/${workspace}/clusters/${cluster}/projects/${namespace}/containerimages/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('RESOURCES_CPU_TYPE'),
        dataIndex: 'arch_type',
        filters: this.getCpuType(),
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_DISTRIBUTION'),
        dataIndex: 'image',
        isHideable: true,
        width: 'auto',
        render: (image, record) => {
          const distro = record.os_distro.split('-')[0]
          const icon = `ico-os-${distro}`
          return (
            <i
              style={{
                backgroundImage: `url('/assets/resources/images/icons/${icon}.svg')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '40px',
                height: '40px',
              }}
            ></i>
          )
        },
      },
      {
        title: t('RESOURCES_STEP'),
        dataIndex: 'phase',
        isHideable: true,
        width: 'auto',
        render: phase => (
          <p className="tall">
            <span>{t(`RESOURCES_IMAGE_${phase.toUpperCase()}`)}</span>
          </p>
        ),
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
            {date ? getLocalTime(date).format('YYYY-MM-DD HH:mm:ss') : t('-')}
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
          title={t('RESOURCES_KAAS_IMAGE')}
          description={t('RESOURCES_KAAS_IMAGE_DESC')}
        />
        <Table
          {...tableProps}
          // data={asd}
          emptyProps={this.emptyProps}
          tableActions={this.tableActions}
          itemActions={this.itemActions}
          columns={this.getColumns()}
          columnSearch={this.columnSearch}
        />
      </ListPage>
    )
  }
}
