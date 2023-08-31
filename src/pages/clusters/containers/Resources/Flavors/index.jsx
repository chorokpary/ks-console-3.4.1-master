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

import RoleStore from 'stores/role'
import FlavorStore from 'stores/resources/flavors'
import * as common from 'utils/resources'

@withList({
    store: new FlavorStore(),
    module: 'flavors',
    authKey: 'flavors',
    name: 'Flavor',
})
export default class Flavors extends React.Component {

    showAction(record) {
        return globals.user.username !== record.name
    }

    get itemActions() {
        const { getData, trigger } = this.props
        return [
            {
                key: 'delete',
                icon: 'trash',
                text: t('REMOVE'),
                action: 'delete',
                show: this.showAction,
                onClick: item =>
                    trigger('flavors.remove', {
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
                        trigger('flavors.regist', {
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
                        trigger('flavors.remove.batch', {
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
                title: t('이름'),
                dataIndex: 'name',
                sorter: true,
                render: name => (
                    <Avatar
                        icon={ICON_TYPES[this.module]}
                        to={`/clusters/${cluster}/flavors/${name}`}
                        title={name}
                    />
                ),
            },
            {
                title: t('CPU'),
                dataIndex: 'vcpus',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('메모리'),
                dataIndex: 'ram',
                isHideable: true,
                width: 'auto',
                render: ram => (
                    <p>
                        {common.fnSetBytes(ram)}
                    </p>
                ),
            },
            {
                title: t('루트 디스크'),
                dataIndex: 'root_disk',
                isHideable: true,
                width: 'auto',
                render: rdisk => (
                    <p>
                        {rdisk} GB
                    </p>
                ),
            },
            {
                title: t('임시 디스크'),
                dataIndex: 'ephemeral_disk',
                isHideable: true,
                width: 'auto',
                render: edisk => (
                    <p>
                        {edisk} GB
                    </p>
                ),
            },
            {
                title: t('GPU'),
                dataIndex: 'gpus',
                isHideable: true,
                width: 'auto',
                render: gpus => (
                    <p>
                        {gpus.length} 개
                    </p>
                ),
            },
            {
                title: t('등록일'),
                dataIndex: 'timestamp',
                isHideable: true,
                sorter: true,
                sortOrder: getSortOrder('descend'),
                width: 150,
                render: date => (
                    <p>
                        {date
                            ? getLocalTime(date).format('YYYY-MM-DD HH:mm:ss')
                            : t('-')}
                    </p>
                ),
            },
        ]
    }

    get emptyProps() {
        return { desc: t('데이터가 없습니다') }
    }

    render() {

        const { bannerProps, tableProps } = this.props
        return (
            <ListPage {...this.props}>
                <Banner
                    {...bannerProps}
                    tabs={this.tabs}
                    title={t('Flavor')}
                    description={t('Flavor의 상태와 사용현황을 관리 할 수 있습니다.')}
                />
                <Table
                    {...tableProps}
                    emptyProps={this.emptyProps}
                    tableActions={this.tableActions}
                    itemActions={this.itemActions}
                    columns={this.getColumns()}
                    searchType="name"
                />
            </ListPage>
        )
    }
}


