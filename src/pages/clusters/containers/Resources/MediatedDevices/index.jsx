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
import MediatedDeviceStore from 'stores/resources/mediateddevices'
import * as common from 'utils/resources'



@withList({
    store: new MediatedDeviceStore(),
    module: 'mediated_devices',
    authKey: 'mediated_devices',
    name: 'Mediated 디바이스',
})
export default class MediatedDevice extends React.Component {

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
                    trigger('mediatedDevice.remove', {
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
                        trigger('mediatedDevice.regist', {
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
                        trigger('mediatedDevice.remove.batch', {
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
                dataIndex: 'resource_name',
                sorter: true,
                search: true,
                render: name => (
                    <Avatar
                        icon="gpu"
                        iconSize={40}
                        title={name}
                    />
                ),
            },
            {
                title: t('Mediated 디바이스 이름'),
                dataIndex: 'mediated_device_name',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('GPU 여부'),
                dataIndex: 'is_gpu',
                isHideable: true,
                width: 'auto',
                render: isGpu => (
                    isGpu ? '사용' : '미사용'
                )
            },
            {
                title: t('가용  개수'),
                dataIndex: 'allocatable',
                isHideable: true,
                width: 'auto',
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
                    icon="gpu"
                    {...bannerProps}
                    tabs={this.tabs}
                    title={t('Mediated 디바이스')}
                    description={t('Mediated 디바이스의 상태와 사용현황을 관리 할 수 있습니다.')}
                />
                <Table
                    {...tableProps}
                    emptyProps={this.emptyProps}
                    tableActions={this.tableActions}
                    itemActions={this.itemActions}
                    columns={this.getColumns()}
                    columnSearch={this.columnSearch}
                />
            </ListPage>
        )
    }
}


