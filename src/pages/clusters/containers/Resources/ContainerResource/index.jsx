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
import { Indicator } from 'components/Base'
import Banner from 'components/Cards/Banner'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { isEmpty, omit } from 'lodash'
import { Link } from 'react-router-dom'
import { getLocalTime } from 'utils'
import { Icon } from '@kube-design/components'

import styles from './index.scss'

import ResourceStore from 'stores/resources/containerresource'

@withList({
    store: new ResourceStore(),
    module: 'clusters',
    authKey: 'clusters',
    name: 'KaaS',
})
export default class Resource extends React.Component {

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
            const { selectedRowKeys } = toJS(this.props.store.list)
            const runingFlag = selectedRowKeys.length > 0 ? false : true;
            return runingFlag
        }

        getData = params => {
            this.props.store.fetchList({
            ...this.props.match.params,
            ...params,
            })
        }
    //auto refresh end  ##################################
    
    handleFetch = (params, refresh) => {
        this.routing.query(params, refresh)
    }

    get routing() {
        return this.props.rootStore.routing
    }

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
                    trigger('containerresource.remove', {
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
                        trigger('containerresource.regist', {
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
                        trigger('containerresource.remove.batch', {
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

    getResourcesStatus() {
        const RESOURCES_STATUS = [
            { text: 'READY', value: 'Ready' },
            { text: 'NOTREADY', value: 'Not-ready' },
        ]

        return RESOURCES_STATUS.map(status => ({
            text: status.text,
            value: status.value,
        }))
    }

    getState(state) {
        if (state) {
            return "running"
        } else {
            return "inactive"
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
                render: this.renderAvatar,
                render: (name, record) => {

                    const { cluster } = this.props.match.params
                    const { cluster_ready } = record

                    return (
                        <div className={styles.avatar}>
                            <div className={styles.icon}>
                                <Icon name="kubernetes" size={40} />
                                <Indicator
                                    className={styles.indicator}
                                    type={this.getState(cluster_ready)}
                                    flicker
                                />
                            </div>
                            <div>
                                <Link className={styles.title} to={`/clusters/${cluster}/containerResource/${name}`}>{name} </Link>
                            </div>
                        </div>
                    )
                }
            },
            {
                title: t('배포 단계'),
                dataIndex: 'phase',
                isHideable: true,
                width: 'auto',
                render: (phase) => (
                    <p className="tall"><span>{phase}</span></p>
                ),
            },
            {
                title: t('쿠버네티스 버전'),
                dataIndex: 'kube_version',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('Master Node'),
                dataIndex: 'cp_replicas',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('Worker Node'),
                dataIndex: 'md_replicas',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('상태'),
                dataIndex: 'cluster_ready',
                isHideable: true,
                filters: this.getResourcesStatus(),
                search: true,
                width: 'auto',
                render: (state, record) => {
                    return (
                        <div className={styles.iconwrapper}>
                            <i className={styles[`ico-status-${state ? 'running' : 'stopping'}`]} /><p>{state ? 'Ready' : 'Not-ready'}</p>
                        </div>
                    )
                }
            },
            {
                title: t('등록일'),
                dataIndex: 'timestamp',
                isHideable: true,
                width: 150,
                sorter: true,
                sortOrder: getSortOrder('creation_timestamp'),
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
                dataIndex: 'cluster_ready',
                title: t('상태'),
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
                    icon="kubernetes"
                    tabs={this.tabs}
                    title={t('KaaS 리소스')}
                    description={t('KaaS 리소스의 상태와 사용현황을 관리 할 수 있습니다.')}
                />
                <Table
                    {...tableProps}
                    emptyProps={this.emptyProps}
                    className={'table-2-6 table-4-3'}
                    itemActions={this.itemActions}
                    tableActions={this.tableActions}
                    columns={this.getColumns()}
                    columnSearch={this.columnSearch}
                    onFetch={this.handleFetch}
                />
            </ListPage>

        )
    }
}
