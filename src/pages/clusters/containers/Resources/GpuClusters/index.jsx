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
import { Link } from 'react-router-dom'
import { toJS } from 'mobx'

import ResourceTable from 'clusters/components/ResourceTable'
import { Avatar, Status } from 'components/Base'
import Banner from 'components/Cards/Banner'
import withList, { ListPage, withClusterList } from 'components/HOCs/withList'
import Table from 'components/Tables/List'
import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'
import { Indicator } from 'components/Base'

import GpuClustersStore from 'stores/resources/gpuclusters'

import styles from './index.scss'
import { namespace } from 'd3-selection'

@withClusterList({
  store: new GpuClustersStore(),
  module: 'gpuclusters',
  authKey: 'gpuclusters',
  name: t('RESOURCES_GPU_CLUSTER'),
})
export default class gpuclusters extends React.Component {
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
          trigger('gpuclusters.remove', {
            detail: item,
            namespace: item.namespace,
            success: () => {
              setTimeout(() => {
                getData()
              }, 200)
            },
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
            trigger('gpuclusters.cluster.regist', {
              ...this.props.match.params,
              type: this.name,
              rootStore: this.props.rootStore,
              success: getData,
            }),
        },
      ],
      selectActions: [
        // {
        //   key: 'delete',
        //   type: 'danger',
        //   text: t('RESOURCES_DELETE'),
        //   action: 'delete',
        //   onClick: () =>
        //     trigger('gpuclusters.remove.batch', {
        //       success: getData,
        //       ...this.props.match.params,
        //     }),
        // },
      ],
      // getCheckboxProps: record => ({
      //   disabled: !this.showAction(record),
      //   name: record.name,
      // }),
    }
  }

  getStateType() {
    const STATE_TYPE = [
      { text: 'Normal', value: 'normal' },
      { text: 'Abnormal', value: 'abnormal' },
    ]

    return STATE_TYPE.map(status => ({
      text: status.text,
      value: status.value,
    }))
  }

  getColumns = () => {
    const { getSortOrder } = this.props
    const { cluster } = this.props.match.params
    return [
      {
        title: t('RESOURCES_NAME'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('namespace'),
        search: true,
        render: (name, record) => (
          <div className={styles.avatar}>
            <div className={styles.icon}>
              <i className="ico-type-gpucluster"></i>
            </div>
            <div>
              <div>
                <Link
                  className={styles.title}
                  to={`/clusters/${cluster}/gpuclusters/${name}`}
                >
                  {name}
                </Link>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: t('PROJECT'),
        dataIndex: 'cluster',
        isHideable: true,
        width: 'auto',
        render: (namespace, record) => (
          <Link
            to={`/clusters/${namespace}/projects/${record.namespace}/overview`}
          >
            {record.namespace}
          </Link>
        ),
      },
      {
        title: t('RESOURCES_GPU_CLUSTER_VM_COUNT'),
        dataIndex: 'instances',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (instances, record) => (
          <p>
            {record.instances && record.instances.length > 0
              ? `${record.isRunning}/${record.instances.length}`
              : '-'}
          </p>
        ),
      },
      {
        title: t('RESOURCES_STATE'),
        dataIndex: 'state',
        filters: this.getStateType(),
        isHideable: true,
        search: true,
        width: 'auto',
        render: state => {
          return (
            <div className={styles.iconwrapper}>
              <Indicator
                className={styles.indicator}
                type={state == 'normal' ? 'running' : 'error'}
                flicker
              />
              <p>{state == 'normal' ? 'Normal' : 'Abnormal'}</p>
            </div>
          )
        },
      },
      {
        title: t('RESOURCES_REGIST_DATE'),
        dataIndex: 'created_at',
        isHideable: true,
        width: 150,
        sorter: true,
        sortOrder: getSortOrder('timestamp'),
        render: created_at => (
          <p>{getLocalTime(created_at).format('YYYY-MM-DD HH:mm:ss')}</p>
        ),
      },
    ]
  }

  get emptyProps() {
    return { desc: t('RESOURCES_PLEASE_CREATE_DATA') }
  }

  get columnSearch() {
    return [
      {
        dataIndex: 'description',
        title: t('RESOURCES_NAME'),
        search: true,
      },
      {
        dataIndex: 'state',
        title: t('RESOURCES_STATE'),
        search: true,
      },
    ]
  }

  getBanner = () => {
    return <i className="ico-type40-gpucluster"></i>
  }

  render() {
    const { bannerProps, tableProps } = this.props
    return (
      <ListPage {...this.props}>
        <Banner
          {...bannerProps}
          icon={this.getBanner}
          title={t('RESOURCES_GPU_CLUSTER')}
          description={t('RESOURCES_GPU_CLUSTER_DESC')}
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
