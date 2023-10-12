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
import Empty from 'components/Tables/Base/Empty'

import { Button, Notify } from '@kube-design/components'
import { cloneDeep, get, isEmpty, omit } from 'lodash'
import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'

import BareMetalStore from 'stores/resources/baremetal'

import '../../Overview/CustomDashboard/custom_icon.css'
import '../../Overview/CustomDashboard/custom_style.css'

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
          text: t('등록'),
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
      ],
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
        title: t('Finger Print'),
        dataIndex: 'finger_print',
        isHideable: true,
        width: 'auto',
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
      },
      {
        dataIndex: 'finger_print',
        title: t('FINGER PRINT'),
        search: true,
      }
    ]
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

          <div className="gridbox_wrap">
              <div className="grid_item">
                <div className="grid_title">
                    <label>탄소 지표 (2023.10)</label>
                    {/* <!--<i className="ico-btn-trash"></i>--> */}
                  </div>
                <div className="grid_info style_list">
                  {/* <!-- // select_wrap --> */}
                  <ul className="list_02">
                    <li className="li_type_02">
                      <div className="lft">
                        <i className="ico-type-bmcnode"></i>
                      </div>
                      <div className="rgt">
                      <div className="value">24<span>대</span></div>
                      <dl><dt>ARM</dt><dd>12</dd></dl>
                      <dl><dt>x86</dt><dd>12</dd></dl>
                      </div>
                    </li>
                    <li className="li_type_02">
                      <div className="lft">
                        <i className="ico-type-power"></i>
                      </div>
                      <div className="rgt">
                      <div className="value">1,200.0<span>kWh</span></div>
                      <dl><dt>ARM</dt><dd>700</dd></dl>
                      <dl><dt>x86</dt><dd>500</dd></dl>
                      </div>
                    </li>
                    <li className="li_type_02">
                      <div className="lft">
                        <i className="ico-type-co2"></i>
                      </div>
                      <div className="rgt">
                      <div className="value">5,000.0<span>KG</span></div>
                      <dl><dt>ARM</dt><dd>3,000</dd></dl>
                      <dl><dt>x86</dt><dd>2,000</dd></dl>
                      </div>
                    </li>
                    <li className="li_type_02">
                      <div className="lft">
                        <i className="ico-type-tree"></i>
                      </div>
                      <div className="rgt">
                      <div className="value">5<span>그루</span></div>
                      <dl><dt>ARM</dt><dd>3</dd></dl>
                      <dl><dt>x86</dt><dd>2</dd></dl>
                      </div>
                    </li>
                    <li className="li_type_02">
                      <div className="lft">
                        <i className="ico-type-money"></i>
                      </div>
                      <div className="rgt">
                      <div className="value">5,000,000<span>원</span></div>
                      <dl><dt>ARM</dt><dd>3,000,000</dd></dl>
                      <dl><dt>x86</dt><dd>2,000,000</dd></dl>
                      </div>
                    </li>
                  </ul>

                </div>
              </div>
          </div>

          <div className="gridbox_wrap">
            <div className="grid_item">
              <div className="grid_title">
                <label>CPU 소비 전력량 비교 (1대 평균)</label>
                <div className="right">
                  <div className="boxtab">
                      <label htmlFor="cpupower_name1">
                        <input type="radio" name="cpupower" id="cpupower_name1" value="name3" defaultChecked/>
                        <span>최근 1시간</span>
                      </label>
                      <label htmlFor="cpupower_name2">
                        <input type="radio" name="cpupower" id="cpupower_name2" value="name4" />
                        <span>최근 1일</span>
                      </label>
                      <label htmlFor="cpupower_name3">
                        <input type="radio" name="cpupower" id="cpupower_name3" value="name5" />
                        <span>최근 1주일</span>
                      </label>
                      <label htmlFor="cpupower_name4">
                        <input type="radio" name="cpupower" id="cpupower_name4" value="name6" />
                        <span>최근 1달</span>
                      </label>
                  </div>
                  {/* <!--<i className="ico-btn-trash"></i>--> */}
                </div>
              </div>
              <div className="grid_info style_chart_2">
                <div className="box type_chart">
                  <div className="cont1">
                    <div className="chart_tab no-tab">
                      <div className="chart_group">
                        <div className="title">
                          <i className="ico-type24-arm"></i>
                          <h5>ARM</h5>
                        </div>
                        <div className="data">
                          <div className="number_wrap data-r">
                            <p><i className="ico-type24-powericon"></i> <span className="em">141</span> <span className="unit">W</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="graph_wrap">
                        <div className="graph_bar">
                          <div className="bar animate-bar" style={{width: "30%"}}></div>
                        </div>
                      </div>
                    </div>
                    <div className="chart_tab no-tab">
                      <div className="chart_group">
                        <div className="title">
                          <i className="ico-type24-x86"></i>
                          <h5>x86</h5>
                        </div>
                        <div className="data">
                          <div className="number_wrap data-r">
                            <p><i className="ico-type24-powericon"></i> <span className="em">160</span> <span className="unit">W</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="graph_wrap">
                        <div className="graph_bar">
                          <div className="bar second animate-bar" style={{width: "40%"}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="cont2">
                    <div className="chart_04"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
