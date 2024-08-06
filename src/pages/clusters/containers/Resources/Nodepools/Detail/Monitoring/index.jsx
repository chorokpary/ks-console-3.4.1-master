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

import React, { useEffect, useState } from 'react'
import { observer, inject } from 'mobx-react'

import { Columns, Column, Loading } from '@kube-design/components'
import { Card } from 'components/Base'
import { StatusCircle } from 'components/Cards/Monitoring'
import NodePoolStore from 'stores/resources/nodepools'
import ClusterResourceSeparation from './ClusterResourceSeparation'

import styles from './index.scss'

const Monitoring = props => {
  const nodePoolStore = new NodePoolStore()
  const [nodes, setNodes] = useState()
  const [isLoading, setIsLoading] = useState(true)

  let timer = 0
  useEffect(() => {
    fetchData(0)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const fetchData = timerSec => {
    timer = setTimeout(async () => {
      await nodePoolStore.fetchNodePoolNodes(props.match.params)
      setNodes(nodePoolStore.nodes)
      setIsLoading(false)
      fetchData(5000)
    }, timerSec)
  }

  const cluster = () => {
    return props.match.params.cluster
  }

  const componentHealth = () => {
    const result = {}
    const node = {
      total: nodes?.length,
      health:
        nodes?.length > 0 ? nodes?.filter(obj => obj.ready_status).length : 0,
    }
    result.counts = { node }
    result.isLoading = isLoading
    return result
  }

  const renderNodeStatus = () => {
    // eslint-disable-next-line no-shadow
    const { counts, isLoading = false } = componentHealth()
    const { health = 0, total = 0 } = counts.node || {}

    return (
      <Card className={styles.node} title={t('RESOURCES_NODEPOOL_NODE_STATUS')}>
        <Loading spinning={isLoading}>
          <StatusCircle
            theme="light"
            className={styles.nodeStatus}
            name={t('RESOURCES_NODE_STATE')}
            legend={[t('RESOURCES_READY_NODE'), 'ALL_NODES']}
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
          {/* <ClusterResourceStatus cluster={cluster()} kaasName={props.match.params.name} /> */}
          <ClusterResourceSeparation
            cluster={cluster()}
            kaasNodePoolName={`${props.match.params.clustername}-${props.match.params.name}`}
          />
        </Column>
      </Columns>
    </div>
  )
}

export default inject('detailStore')(observer(Monitoring))
