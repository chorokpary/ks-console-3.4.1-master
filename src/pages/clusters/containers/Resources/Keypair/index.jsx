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

import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'

import KeypairStore from 'stores/resources/keypair'

@withList({
  store: new KeypairStore(),
  module: 'keypairs',
  authKey: 'keypairs',
  name: '키페어',
})
export default class Keypairs extends React.Component {
 

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
          trigger('keypair.remove', {
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
            trigger('keypair.regist', {
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
            trigger('keypair.remove.batch', {
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
            icon={ICON_TYPES[this.module]}
            to={`/clusters/${cluster}/keypair/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('Finger Print'),
        dataIndex: 'finger_print',
        isHideable: true,
        search: true,
        width: 'auto',
      },
      {
        title: t('등록일'),
        dataIndex: 'timestamp',
        isHideable: true,
        width: 150,
        sorter: true,
        sortOrder: getSortOrder('timestamp'),
        render: login_time => (
          <p>
            {login_time
              ? getLocalTime(login_time).format('YYYY-MM-DD HH:mm:ss')
              : t('NOT_LOGIN_YET')}
          </p>
        ),
      },
    ]
  }

  get emptyProps() {
    return { desc: t('INVITE_CLUSTER_MEMBER_DESC') }
  }

  get columnSearch() {
    return [
      {
        dataIndex: 'name',
        title: t('이름'),
        search: true,
      },
      {
        dataIndex: 'finger_print',
        title: t('FINGER PRINT'),
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
        tabs={this.tabs}
        description={t('키페어의 상태와 사용현황을 관리 할 수 있습니다.')}
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
