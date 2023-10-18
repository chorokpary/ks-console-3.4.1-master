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
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'
import Empty from 'components/Tables/Base/Empty'

import { Button, Notify } from '@kube-design/components'
import { cloneDeep, get, isEmpty, omit } from 'lodash'
import { getLocalTime } from 'utils'

import BareMetalStore from 'stores/resources/baremetal'

import '../../Overview/CustomDashboard/custom_icon.css'
import '../../Overview/CustomDashboard/custom_style.css'

import Carbon from './Carbon'
import CpuUsage from './CpuUsage';

@withList({
  store: new BareMetalStore(),
  module: 'baremetal',
  authKey: 'baremetal',
  name: '베어메탈',
})
export default class BareMetalDashboard extends React.Component {
  
   //auto refresh start  ##################################
  constructor(props) {
    super(props)
    this.refreshTimer = setInterval(() => this.refreshHandler(), 4000)
  }
 
  componentDidUpdate() {
    if (this.refreshTimer === null && this.isRuning) {
      this.refreshTimer = setInterval(() => this.refreshHandler(), 4000)
    }
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer)
    this.unsubscribe && this.unsubscribe()
  }

  refreshHandler = () => {
    if (this.isRuning) {
      this.getData({ silent: true })
    } else {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  get isRuning() {
    const { data } = toJS(this.props.store.list)
    const runingData = data.filter(
      item => item.status !== 'failed' && item.status !== 'successful'
    )
    return !isEmpty(runingData)
  }
  
  getData = params => {
    this.props.store.fetchList({
      ...this.props.match.params,
      ...params,
    })
  }
  //auto refresh end  ##################################

  showAction(record) {
    return globals.user.username !== record.name
  }

  get itemActions() {
    const { getData, trigger } = this.props
    return [
      {
        key: 'action1',
        icon: 'pen',
        text: t('Force-Off'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'action2',
        icon: 'pen',
        text: t('Force-Restart'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'action3',
        icon: 'pen',
        text: t('Graceful-Shutdown'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
      {
        key: 'action4',
        icon: 'pen',
        text: t('Turn On'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('baremetal.action', {
            detail: item,
            success: getData,
            ...this.props.match.params,
          }),
      },
      // {
      //   key: 'delete',
      //   icon: 'trash',
      //   text: t('삭제'),
      //   action: 'delete',
      //   show: this.showAction,
      //   onClick: item =>
      //     trigger('keypair.remove', {
      //       detail: item,
      //       success: getData,
      //       ...this.props.match.params,
      //     }),
      // },
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
          text: t('등록'),
          action: 'create',
          onClick: () =>
            trigger('baremetal.regist', {
            ...this.props.match.params,
            type: this.name,
            success: getData,
          }),
        },
      ],
      selectActions: [
      ],
    }
  }

  getColumns = () => {
    const { getSortOrder } = this.props
    const { cluster } = this.props.match.params
    return [
      {
        title: t('노드명'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('name'),
        render: name => (
          <Avatar
            icon="key"
            iconSize={40}
            to={`/clusters/${cluster}/baremetalmonitoring/${name}`}
            title={name}
          />
        ),
      },
      {
        title: t('서버 모델명'),
        dataIndex: 'finger_print',
        isHideable: true,
        width: 'auto',
      },
      // {
      //   title: t('상태'),
      //   dataIndex: 'state',
      //   isHideable: true,
      //   width: 'auto',
      // },
      // {
      //   title: t('코어 수'),
      //   dataIndex: 'state',
      //   isHideable: true,
      //   width: 'auto',
      // },
      // {
      //   title: t('Max, Clock Rate(GHz)'),
      //   dataIndex: 'state',
      //   isHideable: true,
      //   width: 'auto',
      // },
      // {
      //   title: t('CPU'),
      //   dataIndex: 'state',
      //   isHideable: true,
      //   width: 'auto',
      // },
      // {
      //   title: t('메모리'),
      //   dataIndex: 'state',
      //   isHideable: true,
      //   width: 'auto',
      // },
      // {
      //   title: t('디스크'),
      //   dataIndex: 'state',
      //   isHideable: true,
      //   width: 'auto',
      // },
      // {
      //   title: t('파워(kW)'),
      //   dataIndex: 'state',
      //   isHideable: true,
      //   width: 'auto',
      // },
      // {
      //   title: t('온도'),
      //   dataIndex: 'state',
      //   isHideable: true,
      //   width: 'auto',
      // },
      // {
      //   title: t('탄소 배출량(Kg)'),
      //   dataIndex: 'state',
      //   isHideable: true,
      //   width: 'auto',
      // },

   
    ]
  }

  get emptyProps() {
    return { desc: t('Please create a data.') }
  }


  handleCreate = () => {
    const { trigger, module } = this.props

    trigger('keypair.regist', {
      module,
      trigger,
      success: this.getData,
    })
  }

  renderContent() {
    const {
      data = [],
      filters,
      isLoading,
      total,
      page,
      limit,
      selectedRowKeys,
    } = toJS(this.props.store.list)

    const isEmptyList = isLoading === false && total === 0
    const omitFilters = omit(filters, ['limit', 'page'])
    const showCreate = this.handleCreate;

    if (isEmptyList && Object.keys(omitFilters).length <= 0) {
      return (
        <Empty
          name="BareMetal"
          desc="Please create a data"
          action={
            showCreate ? (
              <Button onClick={showCreate} type="control">
                {t('CREATE')}
              </Button>
            ) : null
          }
        />
      )
    }

    const pagination = { total, page, limit }

    const { tableProps } = this.props
    return (
      <Table
        {...tableProps}
        rowKey="name"
        data={data}
        selectedRowKeys={toJS(selectedRowKeys)}
        columns={this.getColumns()}
        filters={omitFilters}
        pagination={pagination}
        isLoading={isLoading}     
        onCreate={showCreate}
        tableActions={this.tableActions}
        itemActions={this.itemActions}
        hideSearch
        hideRefresh
      />
    )
  }

  render() {
    
    const { bannerProps } = this.props
    // console.log({ ...this.props })
    return (
      
      <ListPage {...this.props}>

        <div className="content_box_wrap">

          {/* CPU 소비 전력량 비교 */}
          <Carbon />

          {/* CPU 소비 전력량 비교 */}
          <CpuUsage />

          <div className="value_box_wrap">
            <div className="value_box">
              <div className="div_value">
                <div className="txt_group">
                    <div className="text_title">전체</div>
                  </div>
                <div className="number_wrap">24</div>
              </div>
              <div className="div_value">
                <div className="txt_group">
                  <div className="status_point"></div>
                  <div className="text_title">On</div>
                </div>
                <div className="number_wrap">19</div>
              </div>
              <div className="div_value">
                <div className="txt_group">
                  <div className="status_point_off"></div>
                  <div className="text_title">Off</div>
                </div>
                <div className="number_wrap">1</div>
              </div>
              <div className="div_value">
                <div className="txt_group">
                  <div className="status_point_error"></div>
                  <div className="text_title">Error</div>
                </div>
                <div className="number_wrap">1</div>
              </div>
            </div>
          </div>
          
        </div>

          {/* 리스트  */}
          {this.renderContent()}

    </ListPage>
     
    )
  }
}
