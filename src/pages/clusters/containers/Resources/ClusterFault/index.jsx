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
import { Avatar } from 'components/Base'
import withList, { ListPage, withClusterList } from 'components/HOCs/withList'
import Table from 'components/Tables/List'
import ResourceTable from 'clusters/components/ResourceTable'
import classnames from 'classnames'
import styles from './index.scss'

import { Icon } from '@kube-design/components'

import ClusterFaultStore from 'stores/resources/clusterFault'
import { namespace } from 'd3-selection'

@withClusterList({
  store: new ClusterFaultStore(),
  module: 'clusterFault',
  authKey: 'clusterFault',
  name: t('RESOURCES_CLUSTER_FAULT_TITLE'),
})
export default class ClusterFault extends React.Component {

  showAction(record) {
    return globals.user.username !== record.name
  }

  get tableActions() {
    const { trigger, getData, routing, tableProps } = this.props
    return {
      ...tableProps.tableActions,
      selectActions: [],
    }
  }

  getColumns = () => {
    const { trigger, ...props } = this.props
    return [
      {
        title: t('RESOURCES_CLUSTER_FAULT_NAME'),
        dataIndex: 'spec.name',
        isHideable: true,
        search: true,
        sorter: true,
        width: 200,
        render: (name, item) => {
          const [namespace, ...rest] = name.split('/');
          return rest.join('/');
        },
      },
      {
        title: t('RESOURCES_CLUSTER_FAULT_NAMESPACE'),
        dataIndex: 'spec',
        sorter: true,
        width: 170,
        render: (spec, item) => {
          const [namespace, ...rest] = spec.name.split('/');
          return namespace;
        },
      },
      {
        title: t('RESOURCES_CLUSTER_FAULT_KIND'),
        dataIndex: 'spec.kind',
        isHideable: true,
        sorter: true,
        width: 170,
      },
      {
        title: t('RESOURCES_CLUSTER_FAULT_PROVIDER'),
        dataIndex: 'metadata.labels["k8sgpts.k8sgpt.ai/name"]',
        isHideable: true,
        width: 130,
      },
      {
        title: t('RESOURCES_CLUSTER_FAULT_ERROR'),
        dataIndex: 'spec.error[0].text',
        isHideable: true,
      },
      {
        title: t('RESOURCES_CLUSTER_FAULT_SOLUTION'),
        dataIndex: 'solution',
        width: 60,
        render: (solution, item) => (
          <div className={styles.iconRight} onClick={() => trigger('clusterfault.detail', {
            detail: item,
            ...this.props.match.params,
          })}>
            <i className="ico-type24-solution"></i>
          </div>
        ),
      },
    ]
  }

  get emptyProps() {
    return { desc: t('RESOURCES_NO_DATA') }
  }

  render() {

    const { bannerProps, tableProps, rootStore } = this.props
    const { cluster } = this.props.match.params;
    return (
      <ListPage {...this.props}>
        <div className={classnames(styles.wrapper)}>
          <div className={styles.titleWrapper}>
            <div className={styles.icon}>
              <Icon name={'cluster'} size={48} />
            </div>
            <div className={styles.title}>
              <div className="h3">{t('RESOURCES_CLUSTER_FAULT_TITLE')}</div>
              <p className="text-second">
                {t('RESOURCES_CLUSTER_FAULT_DETAIL')}
              </p>
            </div>
            <div className={styles.divRight}>
              <div className={styles.iconRight} onClick={() => rootStore.routing.push(`/clusters/${cluster}/clusterfault/setting`)}>
                <Icon name={'hammer'} size={36} />
              </div>
              <p>{t('RESOURCES_CLUSTER_FAULT_SET')}</p>
            </div>
          </div>
        </div>
        <ResourceTable
          {...tableProps}
          emptyProps={this.emptyProps}
          tableActions={this.tableActions}
          itemActions={[]}
          columns={this.getColumns()}
        />
      </ListPage>
    )
  }
}


