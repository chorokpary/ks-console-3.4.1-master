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
import { get, find } from 'lodash';
import ResourceTable from 'clusters/components/ResourceTable';
import { Avatar, Status } from 'components/Base';
import Banner from 'components/Cards/Banner';
import withList, { ListPage, withClusterList } from 'components/HOCs/withList';
import Table from 'components/Tables/List';

import { getLocalTime } from 'utils';
import { ICON_TYPES } from 'utils/constants';

import ImageBuildStore from 'stores/resources/imagebuild';


@withList({
  store: new ImageBuildStore(),
  module: 'imagebuild',
  authKey: 'imagebuild',
  name: t('이미지 빌드'),
})
export default class ImageBuild extends React.Component {
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
          trigger('imagebuild.remove', {
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
            trigger('imagebuild.regist', {
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
            trigger('imagebuild.remove.batch', {
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
        sortOrder: getSortOrder('name'),
        search: true,
        render: (name, record) => (
          <Avatar
            icon="image"
            iconSize={40}
            to={`/clusters/${cluster}/imagebuild/${name}/${record.name}`}
            title={name}
          />
        ),
      },
      {
        title: t('RESOURCES_TAG'),
        dataIndex: 'name',
        isHideable: true,
        width: 'auto',
      },

      {
        title: t('RESOURCES_FILE_NAME'),
        dataIndex: 'filename',
        isHideable: true,
        width: 'auto',
        render: (filename, record) => {
          const uploadInfo = get(record, ['upload-info-list', 'upload-info'])

          if(!!uploadInfo) {
            const name = uploadInfo[0]['upload-file-info']['file-info']['ID'];
            return name
          }
          return '-'
        },
      },
      {
        title: t('RESOURCES_SIZE'),
        dataIndex: 'size',
        isHideable: true,
        width: 'auto',
        render: (size, record) => {
          const uploadInfo = get(record, ['upload-info-list', 'upload-info'])

          if(!!uploadInfo) {
            const fileSize = uploadInfo[0]['file-size'];
            return fileSize
          }
          return '-'
        },
      },
      {
        title: t('RESOURCES_STATE'),
        dataIndex: 'status',
        isHideable: true,
        width: 'auto',
        render: (status, record) => {
          const uploadInfo = get(record, ['upload-info-list', 'upload-info'])

          if(!!uploadInfo) {
            const status = uploadInfo[0]['upload-file-info']['Status'];
            return status
          }
          return '-'
        },
      },

      // {
      //   title: t('RESOURCES_REGIST_DATE'),
      //   dataIndex: 'timestamp',
      //   isHideable: true,
      //   width: 150,
      //   sorter: true,
      //   sortOrder: getSortOrder('timestamp'),
      //   render: timestamp => (
      //     <p>{getLocalTime(timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
      //   ),
      // },
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
    ];
  }

  render() {
    const { bannerProps, tableProps } = this.props;
    return (
      <ListPage {...this.props}>
        <Banner
          {...bannerProps}
          icon="image"
          title={t('이미지 빌드')}
          description={t('이미지 빌드 상세 설명')}
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
    );
  }
}
