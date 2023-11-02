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
import { observer, inject } from 'mobx-react'

import { Columns, Column, Loading, Icon } from '@kube-design/components'
import { Card } from 'components/Base'
import { StatusCircle } from 'components/Cards/Monitoring'
import { default as ClusterResourceStatus } from './ClusterResource'

import styles from './index.scss'

const index = (props) => {

    const store = props.detailStore;

    const cluster = () => {
        return props.match.params.cluster
    }

    const componentHealth = () => {
        const result = {};
        const machines = store.machines
        const node = {total : machines?.length, health: machines?.filter(obj => obj.ready_status).length}
        result.counts = {node: node}
        result.isLoading = machines?.isLoading
        return result
    }

    const renderNodeStatus = () => {
        const { counts, isLoading = false } = componentHealth()
        const { health = 0, total = 0 } = counts.node || {}

        return (
            <Card className={styles.node} title={t('CLUSTER_NODE_STATUS')}>
                <Loading spinning={isLoading}>
                    <StatusCircle
                        theme="light"
                        className={styles.nodeStatus}
                        name={t('노드 상태')}
                        legend={['준비된 노드', 'ALL_NODES']}
                        used={health}
                        total={total}
                    />
                </Loading>
            </Card>
        )
    }

    return (
        <div>
            <Columns className="is-1_1">
                <Column className="is-5">{renderNodeStatus()}</Column>
            </Columns>
            <Columns>
                <Column className="is-12">
                    <ClusterResourceStatus cluster={cluster()} kaasName={props.match.params.name} />
                </Column>
            </Columns>
        </div>
    )
}

export default inject('detailStore')(observer(index))
