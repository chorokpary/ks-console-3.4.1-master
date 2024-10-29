import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'

import { getLocalTime } from 'utils'
import { Loading } from '@kube-design/components'
import { Panel } from 'components/Base'

import VmStore from 'stores/resources/vms'

import styles from './index.scss'

const PowerLog = props => {
  const vmStore = new VmStore()

  const [eventList, setEventList] = useState([])
  const [totalRunningTime, setTotalRunningTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getVmPhaseEventList = async () => {
      const response = await vmStore.fetchVmPhaseEventList(props.match.params)
      setEventList(response.events)
      setIsLoading(false)
    }
    const getVmTotalRunningTIme = async () => {
      const metering = await vmStore.fetchVmMetering(props.match.params)
      setTotalRunningTime(metering.running_time)
      setIsLoading(false)
    }
    getVmPhaseEventList()
    getVmTotalRunningTIme()
  }, [])

  const minuteParser = runningTime => {
    const parseTime = minutes => {
      const days = Math.floor(minutes / (60 * 24))
      const hours = Math.floor((minutes % (60 * 24)) / 60)
      const remainingMinutes = minutes % 60

      return { days, hours, minutes: remainingMinutes }
    }

    const { days, hours, minutes } = parseTime(runningTime)

    return (
      <div>
        <p>
          {days} {t('RESOURCES_DAY')} {hours} {t('RESOURCES_HOUR')} {minutes}{' '}
          {t('RESOURCES_MINUTE')}
        </p>
      </div>
    )
  }

  return (
    <>
      <Panel title={t('RESOURCES_TOTAL_OPERATION_TIME')}>
        <div>{minuteParser(totalRunningTime)}</div>
      </Panel>
      <Panel title={t('RESOURCES_POWER_LOG')}>
        {eventList?.length === 0 && (
          <div className={styles.wrapper}>
            {isLoading ? (
              <div className={styles.loading}>
                <Loading />
              </div>
            ) : (
              <div className={styles.empty}>
                {t('RESOURCES_NO_DATA_EVENT_LOG')}
              </div>
            )}
          </div>
        )}

        {eventList?.length > 0 && (
          <div className={styles.table}>
            <table>
              <colgroup>
                <col width="20%" />
                <col width="20%" />
                <col width="60%" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <strong>{t('RESOURCES_STATE')}</strong>
                  </th>
                  <th>
                    <strong>{t('RESOURCES_MESSAGE')}</strong>
                  </th>
                  <th>
                    <strong>{t('RESOURCES_EVENT_TIME')}</strong>
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventList &&
                  eventList.map((obj, index) => (
                    <tr key={index}>
                      <td>
                        <p>{t(`RESOURCES_${obj.status}`.toUpperCase())}</p>
                      </td>
                      <td>
                        <p>{obj.message}</p>
                      </td>
                      <td>
                        <p>
                          {getLocalTime(obj.timestamp).format(
                            'YYYY-MM-DD HH:mm:ss'
                          )}
                        </p>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}

export default inject('detailStore')(observer(PowerLog))
