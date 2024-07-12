/* eslint-disable no-else-return */
/* eslint-disable prettier/prettier */
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

import React from 'react';
import {toJS} from 'mobx';
import {Link} from 'react-router-dom';
import {Icon} from '@kube-design/components';
import {Indicator} from 'components/Base';
import Banner from 'components/Cards/Banner';
import withList, {ListPage} from 'components/HOCs/withList';
import Table from 'components/Tables/List';

import {getLocalTime} from 'utils';

import ResourceStore from 'stores/resources/containerresource';
import styles from './index.scss';


@withList({
    store: new ResourceStore(),
    module: 'clusters',
    authKey: 'clusters',
    name: 'KaaS',
})
export default class Resource extends React.Component {
    // auto refresh start  ##################################
    constructor(props) {
        super(props);
        this.refreshTimer = setInterval(() => this.refreshHandler(), 4000);
    }

    componentDidUpdate() {
        if (this.refreshTimer === null && this.isRuning) {
            this.refreshTimer = setInterval(() => this.refreshHandler(), 4000);
        }
    }

    componentWillUnmount() {
        clearInterval(this.refreshTimer);
        this.unsubscribe && this.unsubscribe();
    }

    refreshHandler = () => {
        if (this.isRuning) {
            this.getData({ silent: true });
        } else {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    };

    get isRuning() {
        const { selectedRowKeys } = toJS(this.props.store.list);
        return !(selectedRowKeys.length > 0);
    }

    getData = params => {
        this.props.store.fetchList({
            ...this.props.match.params,
            ...params,
            ...this.props.query, // search param
        });
    };
    // auto refresh end  ##################################

    handleFetch = (params, refresh) => {
        this.routing.query(params, refresh);
    };

    get routing() {
        return this.props.rootStore.routing;
    }

    showAction(record) {
        return globals.user.username !== record.name;
    }

    get itemActions() {
        const { getData, trigger } = this.props;
        return [
            {
                key: 'delete',
                icon: 'trash',
                text: t('REMOVE'),
                action: 'delete',
                show: this.showAction,
                onClick: item =>
                    trigger('containerresource.remove', {
                        detail: item,
                        success: getData,
                        ...this.props.match.params,
                    }),
            },
        ];
    }

    get tableActions() {
        const { trigger, getData, tableProps } = this.props;
        return {
            ...tableProps.tableActions,
            actions: [
                {
                    key: 'regist',
                    type: 'control',
                    text: t('RESOURCES_CREATE'),
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
        };
    }

    getResourcesStatus() {
        const RESOURCES_STATUS = [
            { text: 'Ready', value: 'Ready' },
            { text: 'Not Ready', value: 'Not-ready' },
        ];

        return RESOURCES_STATUS.map(status => ({
            text: status.text,
            value: status.value,
        }));
    }

    getState(state, phase) {
        if (phase !== 'Provisioned' && phase !== 'Running') {
            return 'updating';
        }

        if (state) {
            return 'running';
        } else {
            return 'inactive';
        }
    }

    getColumns = () => {
        const { getSortOrder } = this.props;
        const { cluster } = this.props.match.params;
        return [
            {
                title: t('NAME'),
                dataIndex: 'name',
                sorter: true,
                sortOrder: getSortOrder('name'),
                search: true,
                render: (name, record) => {
                    const { cluster_ready, phase } = record;

                    return (
                        <div className={styles.avatar}>
                            <div className={styles.icon}>
                                <Icon name="kubernetes" size={35} />
                                <Indicator
                                    className={styles.indicator}
                                    type={this.getState(cluster_ready, phase)}
                                    flicker
                                />
                            </div>
                            <div>
                                <Link
                                    className={styles.title}
                                    to={`/clusters/${cluster}/containerResource/${name}`}
                                >
                                    {name}
                                </Link>
                            </div>
                        </div>
                    );
                },
            },
            {
                title: t('RESOURCES_DEPLOY_STEP'),
                dataIndex: 'phase',
                isHideable: true,
                width: 'auto',
                render: phase => (
                    <p className="tall">
                        <span>{phase}</span>
                    </p>
                ),
            },
            {
                title: t('RESOURCES_KUBERNETES_VERSION'),
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
                title: t('NodePools'),
                dataIndex: 'nodepool_num',
                isHideable: true,
                width: 'auto',
            },
            {
                title: t('RESOURCES_STATE'),
                dataIndex: 'cluster_ready',
                isHideable: true,
                filters: this.getResourcesStatus(),
                search: true,
                width: 'auto',
                render: (state) => {
                    return (
                        <div className={styles.iconwrapper}>
                            <i
                                className={
                                    styles[
                                    `ico-status-${state ? 'running' : 'stopping'
                                    }`
                                    ]
                                }
                            />
                            <p>{state ? 'Ready' : 'Not-ready'}</p>
                        </div>
                    );
                },
            },
            {
                title: t('RESOURCES_REGIST_DATE'),
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
        ];
    };

    get emptyProps() {
        return { desc: t('RESOURCES_PLEASE_CREATE_DATA') };
    }

    get columnSearch() {
        return [
            {
                dataIndex: 'name',
                title: t('NAME'),
                search: true,
            },
            {
                dataIndex: 'cluster_ready',
                title: t('RESOURCES_STATE'),
                search: true,
            },
        ];
    }

    render() {
        const { bannerProps, tableProps } = this.props;
        // console.log({ ...this.props })
        return (
            <ListPage {...this.props}>
                <Banner
                    {...bannerProps}
                    icon="kubernetes"
                    tabs={this.tabs}
                    title={t('RESOURCES_KAAS_RESOURCE')}
                    description={t('RESOURCES_KAAS_DESC')}
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
        );
    }
}
