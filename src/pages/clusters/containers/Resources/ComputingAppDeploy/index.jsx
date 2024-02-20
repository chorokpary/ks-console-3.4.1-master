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
import ResourceTable from 'clusters/components/ResourceTable';
import { Avatar, Status, Indicator} from 'components/Base';
import Banner from 'components/Cards/Banner';
import withList, { ListPage, withClusterList } from 'components/HOCs/withList';
import Table from 'components/Tables/List';
import { Dropdown, Menu, Notify } from '@kube-design/components';

import { getLocalTime } from 'utils';
import { ICON_TYPES } from 'utils/constants';
import * as common from 'utils/resources';

import styles from './index.scss';

import AppDeployStore from 'stores/resources/appdeploy';

@withList({
  store: new AppDeployStore(),
  module: 'appdeploy',
  authKey: 'appdeploy',
  name: t('RESOURCES_KEYPAIR'),
})
export default class ImageBuild extends React.Component {
  showAction(record) {
    return globals.user.username !== record.name;
  }

  get itemActions() {
    const { getData, trigger } = this.props;
    return [
      {
        key: 'deploy',
        icon: 'blue-green-deployment',
        text: t('RESOURCES_DEPLOY'),
        action: 'edit',
        show: this.showAction,
        onClick: item =>
          trigger('computingappdeploy.deploy', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('RESOURCES_DELETE'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('computingappdeploy.remove', {
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
            trigger('computingappdeploy.regist', {
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
            trigger('computingappdeploy.remove.batch', {
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
        render: (name, item) => (
          <Avatar
            icon="application"
            iconSize={40}
            to={`/clusters/${cluster}/computingappdeploy/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('RESOURCES_VERSION'),
        dataIndex: 'version',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_STATE'),
        dataIndex: 'status',
        isHideable: true,
        width: 'auto',
        render: (status) => {

          return (
          <div className={styles.iconwrapper}>   
              {status != "-" &&
                <Indicator
                  className={styles.indicator}
                  type={status === 'success' ? 'running' : 'error'}
                  flicker
                /> 
              }
              <p className={status === 'success' ? styles.success : status != "-" ? styles.error : ''}>{(status)[0].toUpperCase()+ (status).slice(1, (status).length)}</p>
          </div>
          )
        }
      },
      {
        title: t('Last Task'),
        dataIndex: 'lastTask',
        isHideable: true,
        width: 'auto',
        render: (lastTask) => {
          return <p>{lastTask}</p>
        }
      },
      {
        title: t('Playbook'),
        dataIndex: 'playbookName',
        isHideable: true,
        width: 'auto',
      },
      {
        title: t('RESOURCES_VM'),
        dataIndex: 'vm',
        isHideable: true,
        width: 'auto',
        render: (vm, record) => {

          let vmGroupText = '';
          if (vm) {
            vmGroupText =
              vm.length > 1
                ? `${vm[0].name} 외 ${vm.length - 1}개`
                : vm.length === 1
                ? vm[0].name
                : '-';
          } else {
            vmGroupText = '';
          }

          if(vm.length > 1){
            return (
              <div>
                <Dropdown
                  content={
                    <Menu>
                      {vm.map(item => {
                         return <Menu.MenuItem key={item.name}>
                         <span>{item.name}</span>
                         </Menu.MenuItem>
                      })}                      
                    </Menu>
                  }
                >
                  <div className={styles.iconwrapper}>
                    <p>{vmGroupText}</p>
                  </div>
                </Dropdown>
              </div>
            );
           }

          return (
            <div className={styles.iconwrapper}>
              <p>{vmGroupText}</p>
            </div>
          );
        }
      },
      {
        title: t('RESOURCES_SIZE'),
        dataIndex: 'playbookSize',
        isHideable: true,
        width: 'auto',
        render: playbookSize => (
          <p>{common.fnFormatBytes(playbookSize.toString())}</p>
        ),
      },

      {
        title: t('RESOURCES_REGIST_DATE'),
        dataIndex: 'registrationDate',
        isHideable: true,
        width: 150,
        sorter: true,
        sortOrder: getSortOrder('registrationDate'),
        render: registrationDate => (
          <p>{getLocalTime(registrationDate).format('YYYY-MM-DD HH:mm:ss')}</p>
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
        dataIndex: 'finger_print',
        title: t('FINGER PRINT'),
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
          icon="application"
          title={t('RESOURCES_APP_DEPLOY_MANAGE')}
          description={t('RESOURCES_APP_DEPLOY_MANAGE_DESC')}
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
