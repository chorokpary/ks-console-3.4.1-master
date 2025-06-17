/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
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
import Banner from 'components/Cards/Banner';
import withList, { ListPage } from 'components/HOCs/withList';
import Table from 'components/Tables/List';
import { Link } from 'react-router-dom'
import { getLocalTime } from 'utils';

import HostDeviceStore from 'stores/resources/hostdevices';

import styles from './index.scss';

@withList({
  store: new HostDeviceStore(),
  module: 'host_devices',
  authKey: 'hostDevices',
  name: t('RESOURCES_HOST_DEVICE'),
  rowKey: 'id',
})
export default class HostDevices extends React.Component {
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
          trigger('hostDevice.remove', {
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
            trigger('hostDevice.regist', {
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
            trigger('hostDevice.remove.batch', {
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
        title: t('RESOURCES_NAME'),
        dataIndex: 'name',
        sorter: true,
        search: true,
        render: (id, item) => {
          const { cluster } = this.props.match.params;

          return (
            <div className={styles.avatar}>
              <div className={styles.icon}>
                <i className="ico-type-hostdevice"></i>
              </div>
              <div>
                <div>
                  <Link
                    className={styles.title}
                    to={`/clusters/${cluster}/hostdevices/${item.id}`}
                  >
                    {item.name}
                  </Link>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: t('RESOURCES_MANUFACTURING_COMPANY_NAME'),
        dataIndex: 'vendor_name',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_PRODUCT_NAME'),
        dataIndex: 'product_name',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_GPU_CHECK'),
        dataIndex: 'is_gpu',
        isHideable: true,
        width: 'auto',
        render: isGpu => (isGpu ? t('YES') : t('NO')),
      },
      {
        title: t('RESOURCES_NET_CHECK'),
        dataIndex: 'is_net',
        isHideable: true,
        width: 'auto',
        render: isNet => (isNet ? t('YES') : t('NO')),
      },
      {
        title: t('RESOURCES_AVAILABLE_COUNT'),
        dataIndex: 'allocatable',
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

  getBanner = () => {
    return (
      <i
        className="ico-type-hostdevice"
        style={{ width: '48px', height: '48px' }}
      ></i>
    );
  };

  render() {
    const { bannerProps, tableProps } = this.props;
    return (
      <ListPage {...this.props}>
        <Banner
          icon={this.getBanner}
          {...bannerProps}
          tabs={this.tabs}
          title={t('RESOURCES_HOST_DEVICE')}
          description={t('RESOURCES_HOST_DEVICE_DESC')}
        />
        <Table
          {...tableProps}
          emptyProps={this.emptyProps}
          tableActions={this.tableActions}
          itemActions={this.itemActions}
          columns={this.getColumns()}
          columnSearch={this.columnSearch}
        />
      </ListPage>
    );
  }
}
