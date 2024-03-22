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
import * as common from 'utils/resources';

import ImageBuildStore from 'stores/resources/imagebuild';


@withList({
  store: new ImageBuildStore(),
  module: 'imagebuild',
  authKey: 'imagebuild',
  name: t('RESOURCES_VM_IMAGE_BUILD'),
  rowKey: 'name',
})
export default class ImageBuild extends React.Component {

    // auto refresh start  ##################################
    constructor(props) {
      super(props);
      this.refreshTimer = setInterval(() => this.refreshHandler(), 4000);
    }
  
    componentDidUpdate() {
      if (this.refreshTimer === null && this.isRuning) {
        this.refreshTimer = setInterval(() => this.refreshHandler(), 4000);
      }
    }
  
    componentWillUnmount() {
      clearInterval(this.refreshTimer);
      this.unsubscribe && this.unsubscribe();
    }
  
    refreshHandler = () => {
      const { page, limit } = toJS(this.props.store.list);
      if (this.isRuning) {
        this.getData({ silent: true, page, limit });
      } else {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    };
  
    get isRuning() {
      const { selectedRowKeys } = toJS(this.props.store.list);
      const runingFlag = !(selectedRowKeys.length > 0);
      return runingFlag;
    }
  
    getData = params => {
      this.props.store.fetchList({
        ...this.props.match.params,
        ...params,
        ...this.props.query, // search param
      });
    };
    // auto refresh end  ##################################

  showAction(record) {
    return globals.user.username !== record.name;
  }

  showActionUpload(item) {
    const uploadInfo = get(item, ['upload-info-list', 'upload-info'], [])
    const popStatus = get(item, 'pod-status')

    if(popStatus == 'PodDeleting'){
      return false;
    }

    let showFlag = true;
    if(!!uploadInfo){        
      const status = uploadInfo[0]['upload-file-info']['Status'];
      const statusText = !!status ? status : "-";
      showFlag = !(statusText.toLowerCase()).includes('completed');
    }

    return showFlag;
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
      {
        key: 'upload',
        icon: 'upload',
        text: t('RESOURCES_IMAGE_FILE_UPLOAD'),
        action: 'edit',
        show: item => this.showActionUpload(item),
        onClick: item =>
          trigger('imagebuild.image.upload', {
              detail: item,
              success: getData,
              ...this.props.match.params,
          }
        ),               
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
        dataIndex: 'imagename',
        sorter: true,
        sortOrder: getSortOrder('imagename'),
        search: true,
        render: (imagename, record) => {
          const name = record.name;

           return (
            <Avatar
            icon="image"
            iconSize={40}
            to={`/clusters/${cluster}/imagebuild/${imagename}/${name}`}
            title={imagename}
           />
           )
        },
      },
      {
        title: t('RESOURCES_CPU_TYPE'),
        dataIndex: 'cputype',
        isHideable: true,
        width: 'auto',
        render: (cputype, record) => {
          const cpuType = get(record, ['tags','cpuType'], '-')
          return cpuType;
        },
      },
      {
        title: t('RESOURCES_TAG'),
        dataIndex: 'tag',
        isHideable: true,
        width: 'auto',
        render: (tag, record) => {
          const tagName = get(record, ['tags','tag'], '-')
          return tagName;
        },
      },
      {
        title: t('RESOURCES_OS_INFORMATION'),
        dataIndex: 'os',
        isHideable: true,
        width: 'auto',
        render: (os, record) => {
          const osInfo = get(record, ['tags','os'], '-')
          return osInfo;
        },
      },
      {
        title: t('RESOURCES_FILE_NAME'),
        dataIndex: 'filename',
        isHideable: true,
        width: 'auto',
        render: (filename, record) => {
          const uploadInfo = get(record, ['upload-info-list', 'upload-info'])

          if(!!uploadInfo) {
            const MetaData = uploadInfo[0]['upload-file-info']['file-info']['MetaData'];
            const fileName = get(MetaData, 'filename', '-').split(".")[0]

            return fileName
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
            const fileSize = uploadInfo[0]['upload-file-info']['file-info']['Size'];
            const fileSizeText = fileSize ? common.fnFormatBytes(fileSize.toString()) : "-";

            return fileSizeText
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
          let popStatus = get(record, 'pod-status')
          // if(!!uploadInfo) {
          //   const status = uploadInfo[0]['upload-file-info']['Status'];
          //   const statusText = !!status ? status : "-";

          //   return statusText
          // }
          return popStatus;
        },
      },
      {
        title: t('RESOURCES_REGIST_DATE'),
        dataIndex: 'create-time',
        isHideable: true,
        width: 150,
        sorter: true,
        sortOrder: getSortOrder('create-time'),
        render: (timestamp, record) => (
          <p>{getLocalTime(record['create-time']).format('YYYY-MM-DD HH:mm:ss')}</p>
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
        dataIndex: 'imagename',
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
          title={t('RESOURCES_VM_IMAGE_BUILD')}
          description={t('RESOURCES_IMAGE_BUILD_DESC')}
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
