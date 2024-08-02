/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
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

import { ICON_TYPES, NODE_STATUS } from 'utils/constants';
import GpuNodeStore from 'stores/resources/gpunodes';

import withList, { ListPage } from 'components/HOCs/withList';

import { Avatar, Status } from 'components/Base'
import Table from 'components/Tables/List';
import Banner from 'components/Cards/Banner'

import styles from './index.scss'

@withList({
    store: new GpuNodeStore(),
    module: 'gpunodes',
    authKey: 'gpunodes',
    name: 'GpuNode',
})
export default class GpuNodes extends React.Component {
    getStatus() {
        return NODE_STATUS.map(status => ({
            text: t(status.text),
            value: status.value,
        }))
    }

    get itemActions() {
        const { getData, trigger } = this.props;
        return [];
    }

    get tableActions() {
        const { trigger, getData, routing, tableProps } = this.props;
        return {
            ...tableProps.tableActions,
	    selectActions: [
	    ],
        };
    }

    get emptyProps() {
        return { desc: t('RESOURCES_NO_DATA') };
    }

    getColumns = () => {
        const { getSortOrder, getFilteredValue } = this.props;
        const { cluster } = this.props.match.params;

        return [
            {
                title: t('NAME'),
                dataIndex: 'name',
                sorter: true,
		sortOrder: getSortOrder('name'),
                search: true,
                render: (name, record) => (
                    <Avatar
			icon={ICON_TYPES["nodes"]}
                        iconSize={40}
                        title={name}
			to={`/clusters/${cluster}/gpunodes/${name}`}
                        desc={record.node_ip}
                    />
		),
            },
            {
                title: t('STATUS'),
                dataIndex: 'status',
                filters: this.getStatus(),
                filteredValue: getFilteredValue('status'),
                isHideable: true,
                search: true,
                render: (_, record) => {
                    const status = record.status

                    return (
                        <div className={styles.status}>
                            <Status
                                type={status}
                                name={t(`NODE_STATUS_${status.toUpperCase()}`)}
                            />
                        </div>
                    )
                },
            },
            {
                title: t('RESOURCES_GPU_MODEL'),
                dataIndex: 'model',
                isHideable: true,
                search: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_GPU_WORKLOAD_TYPE'),
                dataIndex: 'workload_type',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_GPU_DRIVER_TYPE'),
                dataIndex: 'driver_type',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_GPU_DRIVER_VERSION'),
                dataIndex: 'driver_version',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_GPU_COUNT'),
                dataIndex: 'count',
                isHideable: true,
                width: 'auto',
            },
        ];
    }

    render() {
        const { bannerProps, tableProps } = this.props;

        return (
            <ListPage {...this.props}>
                <Banner
                    icon="nodes"
                    {...bannerProps}
                    title={t('RESOURCES_GPU_NODE')}
                    description={t('RESOURCES_GPU_NODE_DESC')}
                />
                <Table
                    {...tableProps}
                    emptyProps={this.emptyProps}
                    tableActions={this.tableActions}
		    itemActions={this.itemActions}
                    columns={this.getColumns()}
                />
            </ListPage>
        );
    }
}
