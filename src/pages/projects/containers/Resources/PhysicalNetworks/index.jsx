/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2025 The KubeSphere Console Authors.
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

import { Link } from 'react-router-dom';
import React from 'react';
import { Avatar, Status } from 'components/Base';
import Tabs from 'components/Cards/Banner/Tabs';
import { getDocsUrl } from 'utils'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { getLocalTime } from 'utils';
import { Icon } from '@kube-design/components';
import classnames from 'classnames';

import PhysicalNetworkStore from 'stores/resources/physicalnetworks';

import styles from './index.scss';

@withList({
  store: new PhysicalNetworkStore(),
  module: 'physicalnetworks',
  authKey: 'physicalnetworks',
  name: t('RESOURCES_PHYSICAL_NETWORK'),
})
export default class PhysicalNetworks extends React.Component {
  handleTabChange = value => {
    const { cluster, workspace, namespace } = this.props.match.params
    this.props.routing.push(`/${workspace}/clusters/${cluster}/projects/${namespace}/${value}`)
  }

  showAction(record) {
    return globals.user.username !== record.name;
  }

  get itemActions() {
    const { getData, trigger } = this.props;
    return [
      {
        key: 'delete',
        icon: 'trash',
        text: t('RESOURCES_DELETE'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('physicalnetworks.remove', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
    ];
  }

  get tableActions() {
    const { trigger, getData, routing, tableProps } = this.props;

    return {
      ...tableProps.tableActions,
      actions: [
        {
          key: 'regist',
          type: 'control',
          text: t('RESOURCES_CREATE'),
          action: 'create',
          onClick: () =>
            trigger('physicalnetworks.regist', {
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
            trigger('physicalnetworks.remove.batch', {
              success: getData,
              ...this.props.match.params,
            }),
        },
      ],
      getCheckboxProps: record => ({
        disabled: !this.showAction(record),
        name: record.name,
      }),
    };
  }

  getColumns = () => {
    const { getSortOrder } = this.props;
    const { workspace, cluster, namespace } = this.props.match.params
    return [
      {
        title: t('NAME'),
        dataIndex: 'name',
        sorter: true,
        render: (name) => (
          <div className={styles.avatar}>
            <div className={styles.icon}>
              <i className="ico-type-sriov"></i>
            </div>
            <div>
              <Link
                className={styles.title}
                to={`/${workspace}/clusters/${cluster}/projects/${namespace}/physicalnetworks/${name}`}
              >
                {name}
              </Link>
            </div>
          </div>
        ),
      },
      {
        title: t('RESOURCES_FABRIC'),
        dataIndex: 'fabric',
        isHideable: true,
        width: 'auto',
        render: fabric => (
          <p className="tall">
            <span>{fabric.toUpperCase()}</span>
          </p>
        ),
      },
      {
        title: t('RESOURCES_NETWORK_TYPE'),
        dataIndex: 'type',
        isHideable: true,
        width: 'auto',
        render: type => (
          <p className="tall">
            <span>{type.toUpperCase()}</span>
          </p>
        ),
      },
      {
        title: t('RESOURCES_MTU'),
        dataIndex: 'mtu',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_CIDR'),
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
    ];
  };

  get emptyProps() {
    return { desc: t('RESOURCES_NO_DATA') };
  }

  get tabs() {
    return {
      value: this.props.module,
      onChange: this.handleTabChange,
      options: [
        {
          value: 'networks',
          label: t('RESOURCES_NETWORK_TAB1'),
        },
        {
          value: 'sriovs',
          label: t('RESOURCES_NETWORK_TAB2'),
        },
        {
          value: 'physicalnetworks',
          label: t('RESOURCES_NETWORK_TAB3'),
        },
      ],
    };
  }

  modalTopology = () => {
    const { getData, trigger } = this.props;
    trigger('networks.topology.project', {
      success: getData,
      ...this.props.match.params,
    })
  };

  render() {
    const { bannerProps, tableProps } = this.props;
    const docUrl = getDocsUrl('networks')
    return (
      <ListPage {...this.props}>
        <div className={classnames(styles.wrapper)}>
          <div className={styles.titleWrapper}>
            <div className={styles.icon}>
              <Icon name={'network-duotone'} size={48} />
            </div>
            <div className={styles.title}>
              <div className="h3">{t('RESOURCES_NETWORK')}</div>
              <p className="text-second">
                {t('RESOURCES_NETWORK_DESC')}
              </p>
            </div>
            <div className={styles.divRight}>
              <div
                className={styles.iconRight}
                onClick={() => this.modalTopology()}
              >
                <Icon name={'topology'} size={36} />
              </div>
              <p>{t('RESOURCES_TOPOLOGY')}</p>
            </div>
          </div>
          <Tabs tabs={this.tabs} />
        </div>

        <Table
          {...tableProps}
          emptyProps={this.emptyProps}
          tableActions={this.tableActions}
          itemActions={this.itemActions}
          columns={this.getColumns()}
          searchType="name"
        />
      </ListPage>
    );
  }
}
