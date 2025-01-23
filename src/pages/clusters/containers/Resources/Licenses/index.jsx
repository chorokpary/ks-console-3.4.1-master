/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2025 The KubeSphere Console Authors.
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

import React from 'react';
import { Link } from 'react-router-dom';

import { Avatar, Status } from 'components/Base';
import Banner from 'components/Cards/Banner';
import withList, { ListPage, withClusterList } from 'components/HOCs/withList';
import Table from 'components/Tables/List';
import { getLocalTime } from 'utils';
import { ICON_TYPES } from 'utils/constants';
import LicenseStore from 'stores/resources/licenses';

@withList({
    store: new LicenseStore(),
    module: 'licenses',
    authKey: 'licenses',
    name: t('RESOURCES_LICENSE'),
    rowKey: 'name',
})
export default class Licenses extends React.Component {
    showAction(record) {
        return globals.user.username !== record.name;
    }

    get itemActions() {
        const { store, getData, routing, trigger } = this.props;
        return [
            {
                key: 'setdefault',
                icon: 'check',
                text: t('RESOURCES_SET_DEFAULT_LICENSE'),
                action: 'edit',
                show: this.showAction,
                onClick: item => store.setdefault(item).then(routing.query),
            },
            {
                key: 'delete',
                icon: 'trash',
                text: t('RESOURCES_DELETE'),
                action: 'delete',
                show: this.showAction,
                onClick: item =>
                    trigger('license.remove', {
                        detail: item,
                        success: getData,
                        ...this.props.match.params,
                    }),
            },
        ];
    }

    get tableActions() {
        const { trigger, getData, routing, tableProps } = this.props;
        return {
            ...tableProps.tableActions,
            actions: [
                {
                    key: 'regist',
                    type: 'control',
                    text: t('RESOURCES_IMPORT_LICENSE'),
                    action: 'create',
                    onClick: () =>
                        trigger('license.regist', {
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
                        trigger('license.remove.batch', {
                            success: getData,
                            ...this.props.match.params,
                        }),
                },
            ],
            getCheckboxProps: record => ({
                disabled: !this.showAction(record),
                name: record.name,
            }),
        };
    }

    getColumns = () => {
        const { getSortOrder } = this.props;
        const { cluster } = this.props.match.params;
        return [
            {
                title: t('RESOURCES_NAME'),
                dataIndex: 'name',
                sorter: true,
                sortOrder: getSortOrder('name'),
                search: true,
                render: (name, item) => (
                    <Avatar
                        icon="licenses"
                        iconSize={40}
                        to={`/clusters/${cluster}/licenses/${name}`}
                        title={name}
                    />
                ),
            },
            {
                title: t('RESOURCES_USE_CHECK'),
                dataIndex: 'inuse',
                isHideable: true,
                search: true,
                width: 'auto',
                render: inuse => (
                    inuse === true
                        ? t('RESOURCES_USED')
                        : t('RESOURCES_UNUSED')
                ),
            },
            {
                title: t('RESOURCES_STATE'),
                dataIndex: 'validity',
                isHideable: true,
                search: true,
                width: 'auto',
                render: validity => (
                    validity === true
                        ? t('HEALTHY')
                        : t('ERROR')
                ),
            },
            {
                title: t('RESOURCES_START_DATE'),
                dataIndex: 'start_date',
                isHideable: true,
                search: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_EXPIRATION_DATE'),
                dataIndex: 'end_date',
                isHideable: true,
                search: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_MAX_NODE_NUMBER'),
                dataIndex: 'node_num',
                isHideable: true,
                search: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_MAX_VM_NUMBER'),
                dataIndex: 'vm_num',
                isHideable: true,
                search: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_REGIST_DATE'),
                dataIndex: 'timestamp',
                isHideable: true,
                width: 150,
                sorter: true,
                sortOrder: getSortOrder('timestamp'),
                render: timestamp => (
                    <p>{getLocalTime(timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
                ),
            },
        ];
    };

    get emptyProps() {
        return { desc: t('RESOURCES_PLEASE_CREATE_DATA') };
    }

    get columnSearch() {
        return [
            {
                dataIndex: 'name',
                title: t('RESOURCES_NAME'),
                search: true,
            },
        ];
    }

    render() {
        const { bannerProps, tableProps } = this.props;
        return (
            <ListPage {...this.props}>
                <Banner
                    {...bannerProps}
                    icon="licenses"
                    title={t('RESOURCES_LICENSE')}
                    description={t('RESOURCES_LICENSE_DESC')}
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
        );
    }
}