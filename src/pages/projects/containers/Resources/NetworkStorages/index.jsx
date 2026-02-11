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
import React from 'react';
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { getLocalTime } from 'utils';

import { Avatar, Status } from 'components/Base';
import Banner from 'components/Cards/Banner';
import NetworkStorageStore from 'stores/resources/networkstorages';

@withList({
  store: new NetworkStorageStore(),
  module: 'storageconfigs',
  authKey: 'storageconfigs',
  name: t('RESOURCES_NETWORK_STORAGE'),
})
export default class NetworkStorages extends React.Component {
  handleTabChange = value => {
    const { cluster } = this.props.match.params;
    this.props.routing.push(`/clusters/${cluster}/${value}`);
  };

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
          trigger('networkstorages.remove', {
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
            trigger('networkstorages.regist', {
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
            trigger('networkstorages.remove.batch', {
              rowKey: 'uid',
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
        render: (name, record) => (
          <Avatar
            icon="storage"
            iconSize={40}
            to={`/${workspace}/clusters/${cluster}/projects/${namespace}/networkstorages/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('RESOURCES_FILESYSTEM'),
        dataIndex: 'filesystem',
        isHideable: true,
        width: 'auto',
        render: filesystem => (
          <p className="tall">
            <span>{filesystem.toUpperCase()}</span>
          </p>
        ),
      },
      {
        title: t('RESOURCES_PROTOCOL'),
        dataIndex: 'protocol',
        isHideable: true,
        width: 'auto',
        render: protocol => (
          <p className="tall">
            <span>{protocol.toUpperCase()}</span>
          </p>
        ),
      },
      {
        title: t('RESOURCES_TRANSPORT'),
        dataIndex: 'transport',
        isHideable: true,
        width: 'auto',
        render: transport => (
          <p className="tall">
            <span>{transport.toUpperCase()}</span>
          </p>
        ),
      },
      {
        title: t('RESOURCES_FABRIC'),
        dataIndex: 'fabric',
        isHideable: true,
        width: 'auto',
        render: transport => (
          <p className="tall">
            <span>{transport.toUpperCase()}</span>
          </p>
        ),
      },
      {
        title: t('RESOURCES_MOUNT_POINT'),
        dataIndex: 'mount_point',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_MAX_CONNECTION'),
        dataIndex: 'max_connection',
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

  render() {
    const { bannerProps, tableProps } = this.props;

    return (
      <ListPage {...this.props}>
        <Banner
          {...bannerProps}
          icon="storage"
          tabs={this.tabs}
          title={t('RESOURCES_NETWORK_STORAGE')}
          description={t('RESOURCES_NETWORK_STORAGE_DESC')}
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
    );
  }
}