/* eslint-disable no-extra-boolean-cast */
/* eslint-disable prettier/prettier */
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
import { Link } from 'react-router-dom';
import { toJS } from 'mobx';
import classNames from 'classnames';
import { Icon, Tooltip } from '@kube-design/components';
import { Avatar, Status } from 'components/Base';
import Banner from 'components/Cards/Banner';
import withList, { ListPage, withClusterList } from 'components/HOCs/withList';
import Table from 'components/Tables/List';
import Indicator from 'components/Base/Indicator';

import { getLocalTime, map_accessModes } from 'utils';

import VolumeStore from 'stores/resources/volumes';

import styles from './index.scss';
import ResourceTable from 'clusters/components/ResourceTable';

@withClusterList({
  store: new VolumeStore(),
  module: 'volumes',
  authKey: 'resourcesVolumes',
  name: t('RESOURCES_VOLUME'),
  rowKey: 'id',
})
export default class ResourcesVolumes extends React.Component {
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
          trigger('resourcesvolume.remove', {
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
            trigger('resourcesvolume.regist', {
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
            trigger('resourcesvolume.remove.batch', {
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
        render: (name, item) => (
          <Avatar
            icon="storage"
            iconSize={40}
            to={`/clusters/${cluster}/resourcesvolumes/${name}/${item.id}`}
            title={name}
          />
        ),
      },
      {
        title: t('PROJECT'),
        dataIndex: 'project',
        isHideable: true,
        width: 'auto',
        render: project => (
          <Link to={`/clusters/${cluster}/projects/${project}/overview`}>
            {project}
          </Link>
        ),
      },
      // {
      //   title: t('볼륨 모드'),
      //   dataIndex: 'volumeMode',
      //   isHideable: true,
      //   search: true,
      //   width: 'auto',
      //   render: (volumeMode)  => {
      //     return "Filesystem"
      //   },
      // },
      {
        title: this.renderAccessTitle(),
        dataIndex: 'access_modes',
        search: true,
        width: 'auto',
        render: access_modes => this.mapperAccessMode(access_modes),
      },
      {
        title: t('RESOURCES_INPUT_SOURCE'),
        dataIndex: 'import_source',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_STOREGE_CLASS'),
        dataIndex: 'storage_class',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_CAPACITY'),
        dataIndex: 'capacity',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('MOUNT_STATUS'),
        dataIndex: 'used_by_vmi',
        isHideable: true,
        search: true,
        width: 'auto',
        render: used_by_vmi =>
          !!used_by_vmi ? t('MOUNTED') : t('NOT_MOUNTED'),
      },
      // {
      //   title: t('상태'),
      //   dataIndex: 'phase',
      //   isHideable: true,
      //   search: true,
      //   width: 'auto',
      //   render: (phase, record) => {
      //     const type = !!phase == true ? phase : "Bound"
      //     const flicker = true;

      //       return (
      //         <div className={styles.iconwrapper}>
      //           <Indicator className={styles.indicator} type={type} flicker={flicker} />
      //           <p>{type}</p>
      //         </div>
      //       )
      //   },
      // },
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

  mapperAccessMode = accessModes => {
    const modes = map_accessModes(accessModes);
    return <span>{modes.join(',')}</span>;
  };

  renderAccessTitle = () => {
    const renderModeTip = (
      <div>
        <div>{t('RWO_DESC')}</div>
        <div>{t('ROX_DESC')}</div>
        <div>{t('RWX_DESC')}</div>
      </div>
    );
    return (
      <div className={styles.mode_title}>
        {t('ACCESS_MODE_TCAP')}
        <Tooltip content={renderModeTip}>
          <Icon name="question" size={16} className={styles.question}></Icon>
        </Tooltip>
      </div>
    );
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
    ];
  }

  render() {
    const { bannerProps, tableProps } = this.props;
    // console.log({ ...this.props })

    return (
      <ListPage {...this.props}>
        <Banner
          {...bannerProps}
          icon="storage"
          tabs={this.tabs}
          title={t('RESOURCES_VOLUME')}
          description={t('RESOURCES_VOLUME_DESC')}
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
