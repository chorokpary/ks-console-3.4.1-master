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

import React from 'react';
import { toJS } from 'mobx';
import { Avatar, Status } from 'components/Base';
import Banner from 'components/Cards/Banner';
import withList, { ListPage } from 'components/HOCs/withList';
import Table from 'components/Tables/List';

import { Link } from 'react-router-dom';

import FloatingIpStore from 'stores/resources/floatingip';

@withList({
  store: new FloatingIpStore(),
  module: 'floating_ips',
  authKey: 'floatingip',
  name: t('RESOURCES_FLOATING_IP'),
})
export default class FloatingIp extends React.Component {
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
          trigger('floatingIp.remove', {
            detail: item,
            success: getData,
            ...this.props,
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
            trigger('floatingIp.regist', {
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
            trigger('floatingIp.remove.batch', {
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
    const { workspace, cluster, namespace } = this.props.match.params;

    return [
      {
        title: t('RESOURCES_FLOATING_IP'),
        dataIndex: 'floating_ip',
        isHideable: true,
        width: 'auto',
        render: (floating_ip, item) => (
          <Avatar
            icon="intranet-routers"
            iconSize={40}
            to={`/${workspace}/clusters/${cluster}/projects/${namespace}/floatingip/${item.id}`}
            title={floating_ip}
          />
        ),
      },
      {
        title: t('RESOURCES_RESOURCE_TYPE'),
        dataIndex: 'instance_type',
        isHideable: true,
        width: 'auto',
        render: instance_type => 
          !!instance_type ? (
            <span>{t(`RESOURCES_FLOATING_IP_${instance_type.toUpperCase()}`)}</span>
          ) : ""
      },
      {
        title: t('RESOURCES_RESOURCE_NAME'),
        dataIndex: 'instance_name',
        isHideable: true,
        width: 'auto',
        render: (instance_name, item) => {
          return (
            <Link
              to={`/${workspace}/clusters/${cluster}/projects/${item?.project}/vms/${item?.instance_name}/${item?.instance_id}`}
            >
              {instance_name}
            </Link>
          );
        },
      },
      {
        title: t('RESOURCES_NETWORK_NAME'),
        dataIndex: 'network',
        width: 'auto',
        render: (network, item) => {
          return (
            <Link
              to={`/${workspace}/clusters/${cluster}/projects/${item?.project}/networks/${item?.network_alias}/${item?.network}`}
            >
              {network}
            </Link>
          );
        },
      },
      {
        title: t('RESOURCES_STATIC_IP'),
        dataIndex: 'target_ip',
        isHideable: true,
        width: 'auto',
      },
    ];
  };

  get emptyProps() {
    return { desc: t('RESOURCES_NO_DATA') };
  }

  render() {
    const { bannerProps, tableProps } = this.props;
    tableProps.rowKey = 'id';

    return (
      <ListPage {...this.props}>
        <Banner
          icon="intranet-routers"
          {...bannerProps}
          tabs={this.tabs}
          title={t('RESOURCES_FLOATING_IP')}
          description={t('RESOURCES_FLOATING_IP_DESC')}
        />
        <Table
          {...tableProps}
          emptyProps={this.emptyProps}
          tableActions={this.tableActions}
          itemActions={this.itemActions}
          columns={this.getColumns()}
          searchType="network_alias"
        />
      </ListPage>
    );
  }
}