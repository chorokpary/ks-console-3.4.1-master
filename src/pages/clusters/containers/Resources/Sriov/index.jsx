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

import React from 'react'
import { toJS } from 'mobx'
import { Avatar, Status } from 'components/Base'
import Banner from 'components/Cards/Banner'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'
import classNames from 'classnames'
import Indicator from 'components/Base/Indicator'


import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'

import SriovStore from 'stores/resources/sriovs'

@withList({
  store: new SriovStore(),
  module: 'sriovs',
  authKey: 'sriovs',
  name: 'SR-IOV',
})
export default class ResourcesVolumes extends React.Component {
 

  showAction(record) {
    return globals.user.username !== record.name
  }

  get itemActions() {
    const { getData, trigger } = this.props
    return [
      {
        key: 'delete',
        icon: 'trash',
        text: t('삭제'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('sriov.remove', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
    ]
  }

  get tableActions() {
    const { trigger, getData, routing, tableProps } = this.props
    return {
      ...tableProps.tableActions,
      actions: [
        {
          key: 'regist',
          type: 'control',
          text: t('생성'),
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
          text: t('REMOVE'),
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
    }
  }


  getColumns = () => {
    const { getSortOrder } = this.props
    const { cluster } = this.props.match.params
    return [
      {
        title: t('NAME'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('name'),
        search: true,
        render: name => (
          <Avatar
            icon="storage"
            iconSize={40}
            to={`/clusters/${cluster}/sriovs/${name}`}
            title={name}
          />
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
        title: t('접근 모드'),
        dataIndex: 'access_modes',
        isHideable: true,
        search: true,
        width: 'auto',
        render: access_modes => {
          let accessModesList = ""

          if (!!access_modes) {
            accessModesList = access_modes.map((mode) => {
                return <p key={mode}>{mode}</p>
            });
          } else {
            accessModesList = <p>-</p>
          }
      
          return accessModesList
        }
      },
      {
        title: t('입력 소스'),
        dataIndex: 'import_source',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('스토리지 클래스'),
        dataIndex: 'storage_class',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('용량'),
        dataIndex: 'capacity',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('상태'),
        dataIndex: 'phase',
        isHideable: true,
        search: true,
        width: 'auto',
        render: (phase) => {          
          const type = phase.toLowerCase();
          const flicker = true;

            return (
              <div className={styles.iconwrapper}>
                <Indicator className={styles.indicator} type={type} flicker={flicker} />
                <p>{phase}</p>
              </div>  
            )          
        },      
      },
      {
        title: t('등록일'),
        dataIndex: 'timestamp',
        isHideable: true,
        width: 150,
        sorter: true,
        sortOrder: getSortOrder('timestamp'),
        render: timestamp => (
          <p>
            {getLocalTime(timestamp).format('YYYY-MM-DD HH:mm:ss')}
          </p>
        ),
      },
    ]
  }

  get emptyProps() {
    return { desc: t('Please create a data.') }
  }

  get columnSearch() {
    return [
      {
        dataIndex: 'name',
        title: t('이름'),
        search: true,
      }
    ]
  }


  render() {
    
    const { bannerProps, tableProps } = this.props
    // console.log({ ...this.props })

    return (
      <ListPage {...this.props}>
      <Banner
        {...bannerProps}
        icon="storage"
        tabs={this.tabs}
        title={t('SR-IOV')}
        description={t('SR-IOV의 상태와 사용현황을 관리 할 수 있습니다.')}
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
     
    )
  }
}
