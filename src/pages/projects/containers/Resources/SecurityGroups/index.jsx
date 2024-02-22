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
import ResourceTable from 'clusters/components/ResourceTable'

import { Link } from 'react-router-dom'
import React from 'react'
import { toJS } from 'mobx'
import { Avatar, Status } from 'components/Base'
import Banner from 'components/Cards/Banner'
import withList, { ListPage, withClusterList } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'

import RoleStore from 'stores/role'
import SecurityGroupStore from 'stores/resources/securityGroups'
import * as common from 'utils/resources'



@withList({
    store: new SecurityGroupStore(),
    module: 'security_groups',
    authKey: 'security_groups',
    name: t('RESOURCES_SECURITY_GROUP'),
    rowKey: 'id'
})
export default class SecurityGroups extends React.Component {

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
                    trigger('securityGroup.remove', {
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
                        trigger('securityGroup.regist', {
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
                        trigger('securityGroup.remove.batch', {
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
        const { workspace, cluster, namespace } = this.props.match.params
        return [
            {
                title: t('NAME'),
                dataIndex: 'name',
                sorter: true,
                search: true,
                render: (name, item) => (
                    <Avatar
                        icon="shield"
                        iconSize={40}
                        to={`/${workspace}/clusters/${cluster}/projects/${namespace}/securityGroups/${name}/${item.id}`}
                        title={name}
                    />
                ),
            },
            {
                title: t('PROJECT'),
                dataIndex: 'project',
                isHideable: true,
                width: 'auto',
                render: project => (
                    <Link to={`/clusters/${cluster}/projects/${project}/overview`}>
                        {project}
                    </Link>
                ),
            },
            {
                title: t('RESOURCES_INBOUND_RULE_COUNT'),
                dataIndex: 'ingress_count',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_OUTBOUND_RULE_COUNT'),
                dataIndex: 'egress_count',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_REGIST_DATE'),
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
        return { desc: t('RESOURCES_NO_DATA') }
    }

    render() {

        const { bannerProps, tableProps } = this.props
        return (
            <ListPage {...this.props}>
                <Banner
                    icon="shield"
                    {...bannerProps}
                    tabs={this.tabs}
                    title={t('RESOURCES_SECURITY_GROUP')}
                    description={t('RESOURCES_SECURITY_GROUP_DESC')}
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


