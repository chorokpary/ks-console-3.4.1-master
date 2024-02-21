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
import { Icon } from '@kube-design/components';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { Avatar, Status } from 'components/Base';
import Tabs from 'components/Cards/Banner/Tabs';
import withList, { ListPage } from 'components/HOCs/withList';
import Table from 'components/Tables/List';
import Indicator from 'components/Base/Indicator';

import { getLocalTime } from 'utils';
import { ICON_TYPES } from 'utils/constants';

import SriovStore from 'stores/resources/sriovs';
import styles from './index.scss';

@withList({
  store: new SriovStore(),
  module: 'sriovs',
  authKey: 'sriovs',
  name: t('SR-IOV'),
})
export default class ResourcesVolumes extends React.Component {
  handleTabChange = value => {
    const { cluster } = this.props.match.params;
    this.props.routing.push(`/clusters/${cluster}/${value}`);
  };

  showAction(record) {
    return globals.user.username !== record.name;
  }

  getFilterType() {
    const NETWORK_TYPE = [
      { text: 'VLAN', value: 'vlan' },
      { text: 'FLAT', value: 'flat' },
    ];

    return NETWORK_TYPE.map(status => ({
      text: status.text,
      value: status.value,
    }));
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
          trigger('sriov.remove', {
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
            <div className={styles.avatar}>
              <div className={styles.icon}>
                <i className="ico-type-sriov"></i>
              </div>
              <div>
                <Link
                  className={styles.title}
                  to={`/clusters/${cluster}/sriovs/${name}`}
                >
                  {name}
                </Link>
              </div>
            </div>
          );
        },
      },
      {
        title: t('RESOURCES_NETWORK_TYPE'),
        dataIndex: 'type',
        filters: this.getFilterType(),
        isHideable: true,
        search: true,
        width: 'auto',
        render: type => <p>{type.toUpperCase()}</p>,
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
          <p>{getLocalTime(timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
        ),
      },
    ];
  };

  get emptyProps() {
    return { desc: t('RESOURCES_PLEASE_CREATE_DATA.') };
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
      },
    ];
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
      ],
    };
  }

  modalTopology = () => {
    const { getData, trigger } = this.props;
    trigger('networks.topology', {
      success: getData,
      ...this.props.match.params,
    });
  };

  render() {
    const { bannerProps, tableProps } = this.props;
    // console.log({ ...this.props })

    return (
      <ListPage {...this.props}>
        <div className={classnames(styles.wrapper)}>
          <div className={styles.titleWrapper}>
            <div className={styles.icon}>
              <Icon name={'network-duotone'} size={48} />
            </div>
            <div className={styles.title}>
              <div className="h3">{t('RESOURCES_NETWORK')}</div>
              <p className="text-second">{t('RESOURCES_NETWORK_DESC')}</p>
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
