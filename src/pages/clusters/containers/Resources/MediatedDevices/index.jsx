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
import Banner from 'components/Cards/Banner'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import MediatedDeviceStore from 'stores/resources/mediateddevices'

import styles from './index.scss'


@withList({
    store: new MediatedDeviceStore(),
    module: 'mediated_devices',
    authKey: 'mediated_devices',
    name: t('RESOURCES_MEDIATED_DEVICE'),
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
                text: t('RESOURCES_DELETE'),
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
                    text: t('RESOURCES_CREATE'),
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
                    text: t('RESOURCES_DELETE'),
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
                title: t('RESOURCES_NAME'),
                dataIndex: 'resource_name',
                sorter: true,
                search: true,
                render: name => {
                    const { cluster } = this.props.match.params

                    return (
                        <div className={styles.avatar} >
                            <div className={styles.icon}>
                                <i className="ico-type-mediatedvgpu"></i>
                            </div>
                            <div>
                                <div className={styles.title}>{name}</div>
                            </div>
                        </div>
                    )
                },
            },
            {
                title: t('RESOURCES_MEDIATED_DEVICE_NAME'),
                dataIndex: 'mediated_device_name',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_GPU_CHECK'),
                dataIndex: 'is_gpu',
                isHideable: true,
                width: 'auto',
                render: isGpu => (
                    isGpu ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')
                )
            },
            {
                title: t('RESOURCES_AVAILABLE_COUNT'),
                dataIndex: 'allocatable',
                isHideable: true,
                width: 'auto',
            },
        ]
    }

    get emptyProps() {
        return { desc: t('RESOURCES_NO_DATA') }
    }

    getBanner = () => {
        return <i className="ico-type-mediatedvgpu"></i>
    }

    render() {

        const { bannerProps, tableProps } = this.props
        return (
            <ListPage {...this.props}>
                <Banner
                    icon={this.getBanner}
                    {...bannerProps}
                    tabs={this.tabs}
                    title={t('RESOURCES_MEDIATED_DEVICE')}
                    description={t('RESOURCES_MEDIATED_DEVICE_DESC')}
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


