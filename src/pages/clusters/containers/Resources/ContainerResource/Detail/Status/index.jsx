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
import ContainerResourceStore from 'stores/resources/containerresource'
import StatusCard from './StatusCard'
import styles from './index.scss'

const containerResourceStore = new ContainerResourceStore()

const Status = ({ status, tip }) => {
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

const ScheduleInfo = props => {
  const [status, setStatus] = useState()
  const [phase, setPhase] = useState()
  const [isLoading, setIsLoading] = useState(true)
  let isMounted = false

  useEffect(() => {
    isMounted = true
    getClusterStatusData()
    return () => {
      isMounted = false
    }
  }, [])

  const getClusterStatusData = async () => {
    const response = await containerResourceStore.fetchDetail(
      props.match.params
    )
    if (isMounted) {
      setStatus(response._originData.cluster.status)
      setPhase(response._originData.cluster.phase)
      setIsLoading(false)
    }
  }
  const renderStatus = () => {
    const ready_status = {
      name: 'ready',
      flag: status.ready,
      icon: 'success',
    }
    const control_plane_ready_status = {
      name: 'control_plane_ready',
      flag: status.control_plane_ready,
      icon: ICON_TYPES['etcd'],
    }
    const infra_ready_status = {
      name: 'infra_ready',
      flag: status.infra_ready,
      icon: ICON_TYPES['nodes'],
    }
    const topology_reconciled_status = {
      name: 'topology_reconciled',
      flag: status.topology_reconciled,
      icon: ICON_TYPES['components'],
    }
    return (
      <Panel title={t('RESOURCES_CLUSTER_SCHEDULE_STATUS')}>
        <div className={styles.header}>
          <Text
            className={styles.info}
            icon="templet"
            title={t(`RESOURCES_${phase.toUpperCase()}`)}
            description={t('CURRENT_STATUS')}
            extra={
              <Status
                status={phase === 'Provisioned' ? 'success' : 'warning'}
              />
            }
          />
        </div>
        <div className={styles.cardstatus}>
          <StatusCard key="ready" data={ready_status} />
          <StatusCard
            key="control_plane_ready"
            data={control_plane_ready_status}
          />
          <StatusCard key="infra_ready" data={infra_ready_status} />
          <StatusCard
            key="topology_reconciled"
            data={topology_reconciled_status}
          />
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

export default inject('detailStore')(observer(ScheduleInfo))
