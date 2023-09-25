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
import { Dropdown, Menu, Button, Notify } from '@kube-design/components'

import styles from './index.scss'

import ResourceStore from 'stores/resources/containerresource'

@withList({
    store: new ResourceStore(),
    module: 'clusters',
    authKey: 'clusters',
    name: '쿠버네티스',
})
export default class Resource extends React.Component {

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
                        icon="templet"
                        iconSize={40}
                        to={`/clusters/${cluster}/containerResource/${name}`}
                        title={name}
                    />
                ),
            },
            {
                title: t('배포 단계'),
                dataIndex: 'phase',
                isHideable: true,
                width: 'auto',
                render: (phase) => (
                    <p className="tall"><i className={`ico ico-status-${phase?.toLowerCase().replace("ed", "ing")}`}></i><span>{phase}</span></p>
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
                width: 'auto',
                render: (state, record) => {
                    const stateArray = ['Stopped', 'Running', 'Paused']
                    return (
                        <div className={styles.iconwrapper}>
                            <i className={styles[`ico-status-${state ? 'Running' : ''}`]} /><p>{state ? 'Ready' : 'Not-ready'}</p>
                        </div>
                    )
                }
            },
            {
                title: t('등록일'),
                dataIndex: 'creation_timestamp',
                isHideable: true,
                width: 150,
                sorter: true,
                sortOrder: getSortOrder('creation_timestamp'),
                render: creation_timestamp => (
                    <p>
                        {getLocalTime(creation_timestamp).format('YYYY-MM-DD HH:mm:ss')}
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
        ]
    }


    render() {
        const { bannerProps, tableProps } = this.props
        // console.log({ ...this.props })
        return (
            <ListPage {...this.props}>
                <Banner
                    {...bannerProps}
                    icon="templet"
                    tabs={this.tabs}
                    title={t('KaaS 리소스')}
                    description={t('쿠버네티스의 상태와 사용현황을 관리 할 수 있습니다.')}
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
