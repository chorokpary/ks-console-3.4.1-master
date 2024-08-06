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

import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'

import { ICON_TYPES } from 'utils/constants'
import { Panel, Text } from 'components/Base'
import { Loading, Icon, Tooltip } from '@kube-design/components'
import NodePoolStore from 'stores/resources/nodepools'
import StatusCard from './StatusCard'
import styles from './index.scss'

const nodePoolStore = new NodePoolStore()

const Condition = ({ status, tip }) => {
  const icon = (
    <Icon
      className={styles.status}
      name={status === 'success' ? 'success' : 'error'}
      color={{
        primary: '#fff',
        secondary: status === 'success' ? '#55bc8a' : '#ca2621',
      }}
    />
  )

  if (tip) {
    return <Tooltip content={tip}>{icon}</Tooltip>
  }

  return icon
}

const Status = props => {
  const [status, setStatus] = useState()
  const [phase, setPhase] = useState()
  const [isLoading, setIsLoading] = useState(true)
  let isMounted = false

  useEffect(() => {
    isMounted = true
    getNodePoolStatusData()
    return () => {
      isMounted = false
    }
  }, [])

  const getNodePoolStatusData = async () => {
    const response = await nodePoolStore.fetchNodePoolDetail(props.match.params)
    if (isMounted) {
      setStatus(response._originData.nodepool.status)
      setPhase(response._originData.nodepool.phase)
      setIsLoading(false)
    }
  }
  const renderStatus = () => {
    const ready_status = {
      name: 'ready',
      flag: status.ready,
      icon: 'success',
    }
    const available_status = {
      name: 'available',
      flag: status.available,
      icon: 'start',
    }
    const machine_set_ready_status = {
      name: 'machine_set_ready',
      flag: status.machine_set_ready,
      icon: ICON_TYPES['pods'],
    }
    return (
      <Panel title={t('RESOURCES_NODEPOOL_SCHEDULE_STATUS')}>
        <div className={styles.header}>
          <Text
            className={styles.info}
            icon="templet"
            title={t(`RESOURCES_${phase.toUpperCase()}`)}
            description={t('CURRENT_STATUS')}
            extra={
              <Condition status={phase === 'Running' ? 'success' : 'warning'} />
            }
          />
        </div>
        <div className={styles.cardstatus}>
          <StatusCard key="ready" data={ready_status} />
          <StatusCard key="available" data={available_status} />
          <StatusCard key="machine_set_ready" data={machine_set_ready_status} />
        </div>
      </Panel>
    )
  }

  return (
    <>
      {isLoading ? (
        <div className={styles.loading}>
          <Loading />
        </div>
      ) : (
        <div>{renderStatus()}</div>
      )}
    </>
  )
}

export default inject('detailStore')(observer(Status))
