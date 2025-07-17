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
import withList, { ListPage, withClusterList } from 'components/HOCs/withList';
import Table from 'components/Tables/List';
import ResourceTable from 'clusters/components/ResourceTable';

import { Link } from 'react-router-dom';
import { getLocalTime, showNameAndAlias } from 'utils';
import { ICON_TYPES } from 'utils/constants';

import RouterStore from 'stores/resources/routers';

@withClusterList({
  store: new RouterStore(),
  module: 'routers',
  authKey: 'routers',
  name: t('RESOURCES_VROUTER'),
  rowKey: 'project_name',
})
export default class Routers extends React.Component {
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
          trigger('router.remove', {
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
            trigger('router.regist', {
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
            trigger('router.remove.batch', {
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
    const { cluster } = this.props.match.params;
    return [
      {
        title: t('NAME'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('name'),
        search: true,
        render: (name, record) => {
          return (
            <Avatar
              icon="router"
              iconSize={40}
              to={`/clusters/${cluster}/projects/${record.project}/routers/${name}`}
              title={name}
            />
          );
        },
      },
      {
        title: t('PROJECT'),
        dataIndex: 'project',
        isHideable: true,
        search: true,
        width: 'auto',
        render: project => (
          <Link to={`/clusters/${cluster}/projects/${project}`}>
            {showNameAndAlias(project, 'project')}
          </Link>
        ),
      },
      {
        title: t('RESOURCES_SNAT_OPTION'),
        dataIndex: 'enable_snat',
        isHideable: true,
        search: true,
        width: 'auto',
        render: enable_snat => (
          <p>{enable_snat ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</p>
        ),
      },
      {
        title: t('RESOURCES_VROUTER_IP'),
        dataIndex: 'vrouter_ip',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_INTERNAL_NETWORK'),
        dataIndex: 'internal',
        isHideable: true,
        search: true,
        width: 'auto',
        render: internal => internal.map(item => <p>{item.name}</p>),
      },
      {
        title: t('RESOURCES_EXTERNAL_NETWORK'),
        dataIndex: 'external',
        isHideable: true,
        search: true,
        width: 'auto',
        render: external => {
          return (
            <Link
              to={`/clusters/${cluster}/networks/${external?.name}/${external?.id}`}
            >
              {external?.name}
            </Link>
          );
        },
      },
      {
        title: t('RESOURCES_REGIST_DATE'),
        dataIndex: 'timestamp',
        isHideable: true,
        width: 150,
        sorter: true,
        sortOrder: getSortOrder('timestamp'),
        render: timestamp => (
          <p>{getLocalTime(timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
        ),
      },
    ];
  };

  get emptyProps() {
    return { desc: t('RESOURCES_PLEASE_CREATE_DATA') };
  }

  get columnSearch() {
    return [
      {
        dataIndex: 'name',
        title: t('RESOURCES_NAME'),
        search: true,
      },
      {
        dataIndex: 'enable_snat',
        title: t('RESOURCES_SNAT_OPTION'),
        search: true,
      },
    ];
  }

  render() {
    const { bannerProps, tableProps } = this.props;
    return (
      <ListPage {...this.props}>
        <Banner
          {...bannerProps}
          icon="router"
          tabs={this.tabs}
          title={t('RESOURCES_VROUTER')}
          description={t('RESOURCES_VROUTER_DESC')}
        />
        <ResourceTable
          {...tableProps}
          emptyProps={this.emptyProps}
          className={'table-2-6 table-4-3'}
          itemActions={this.itemActions}
          tableActions={this.tableActions}
          columns={this.getColumns()}
          columnSearch={this.columnSearch}
        />
      </ListPage>
    );
  }
}
