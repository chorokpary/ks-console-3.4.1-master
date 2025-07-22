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

import { Panel, Text } from 'components/Base'
import { Loading, Icon, Tooltip } from '@kube-design/components'
import { getLocalTime } from 'utils'
import VmStore from 'stores/resources/vms'
import StatusCard from './StatusCard'
import styles from './index.scss'

const vmStore = new VmStore()

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
  const [state, setState] = useState()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getVmStatusData()
  }, [])

  const getVmStatusData = async () => {
    const status_response = await vmStore.fetchVmStatus(props.match.params)
    const state_response = await vmStore.fetchVmState(props.match.params)
    setStatus(status_response.status)
    setState(state_response.state)
    setIsLoading(false)
  }

  const renderNodeSchedule = () => {
    return (
      <Panel title={t('SCHEDULING_RESULT')}>
        <div className={styles.wrapper}>
          <div>
            <Text
              className={styles.info}
              icon="nodes"
              title={
                <div>
                  {state.node
                    ? t('SCHEDULED_TO_NODE', { value: state.node })
                    : t('SCHEDULING_NOT_SUCCESSFUL')}
                  <Tooltip content={renderNodeScheduleTip()}>
                    <Icon className="margin-l8" name="question" size={20} />
                  </Tooltip>
                </div>
              }
              description={getLocalTime(state.creation_timestamp).format(
                'YYYY-MM-DD HH:mm:ss'
              )}
              extra={
                <Status status={state.node === '' ? 'warning' : 'success'} />
              }
            />
          </div>
        </div>
      </Panel>
    )
  }

  const renderNodeScheduleTip = () => {
    return (
      <div>
        <div className="tooltip-title">
          {t('RESOURCES_VM_SCHEDULING_METHOD')}
        </div>
        <p className="tooltip-desc">{t('RESOURCES_VM_ASSIGNED_DESC')}</p>
      </div>
    )
  }

  const renderStatus = () => {
    const ready_status = {
      name: 'ready',
      flag: status.ready_status,
      icon: 'success',
    }
    const dv_ready_status = {
      name: 'dv_ready',
      flag: status.dv_ready_status,
      icon: 'storage',
    }
    const migration_status = {
      name: 'migration',
      flag: status.migration_status,
      icon: 'changing-over',
    }
    const agent_status = {
      name: 'agent',
      flag: status.agent_status,
      icon: 'stretch',
    }
    return (
      <Panel title={t('RESOURCES_VM_SCHEDULE_STATUS')}>
        <div className={styles.header}>
          <Text
            className={styles.info}
            icon="templet"
            title={t(`RESOURCES_${state.state.toUpperCase()}`)}
            description={t('CURRENT_STATUS')}
            extra={
              <Status
                status={state.state === 'Running' ? 'success' : 'warning'}
              />
            }
          />
        </div>
        <div className={styles.cardstatus}>
          <StatusCard key="ready" data={ready_status} />
          <StatusCard key="dv_ready" data={dv_ready_status} />
          <StatusCard key="migration" data={migration_status} />
          <StatusCard key="agent" data={agent_status} />
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
        <div>
          {renderNodeSchedule()}
          {renderStatus()}
        </div>
      )}
    </>
  )
}

export default inject('detailStore')(observer(ScheduleInfo))
