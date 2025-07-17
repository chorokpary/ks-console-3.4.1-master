import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'

import { getLocalTime } from 'utils'
import { Loading } from '@kube-design/components'
import { Panel } from 'components/Base'

import VmStore from 'stores/resources/vms'

import styles from './index.scss'

const Event = props => {
  const store = props.detailStore
  const vmStore = new VmStore()

  const [eventList, setEventList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getVmEventList = async () => {
      const response = await vmStore.fetchVmEventList(props.match.params)
      setEventList(response.events)
      setIsLoading(false)
    }
    getVmEventList()
  }, [])

  return (
    <>
      {eventList?.length === 0 && (
        <Panel>
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
        </Panel>
      )}

      {eventList?.length > 0 && (
        <Panel title={t('RESOURCES_EVENT')}>
          <div className={styles.table}>
            <table>
              <colgroup>
                <col width="10%" />
                <col width="15%" />
                <col width="15%" />
                <col width="20%" />
                <col width="20%" />
                <col width="20%" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <strong>VM</strong>
                  </th>
                  <th>
                    <strong>{t('RESOURCES_REASON')}</strong>
                  </th>
                  <th>
                    <strong>{t('RESOURCES_TYPE')}</strong>
                  </th>
                  <th>
                    <strong>{t('RESOURCES_START_TIME')}</strong>
                  </th>
                  <th>
                    <strong>{t('RESOURCES_END_TIME')}</strong>
                  </th>
                  <th>
                    <strong>{t('RESOURCES_MESSAGE')}</strong>
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventList &&
                  eventList.map((obj, index) => (
                    <tr key={index}>
                      <td>
                        <p className="underline">{store.detail.name}</p>
                      </td>
                      <td>
                        <p>{obj.reason}</p>
                      </td>
                      <td>
                        <p>{obj.type}</p>
                      </td>
                      <td>
                        <p>
                          {getLocalTime(obj.first_timestamp).format(
                            'YYYY-MM-DD HH:mm:ss'
                          )}
                        </p>
                      </td>
                      <td>
                        <p>
                          {getLocalTime(obj.last_timestamp).format(
                            'YYYY-MM-DD HH:mm:ss'
                          )}
                        </p>
                      </td>
                      <td>
                        <p>{obj.message}</p>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </>
  )
}

export default inject('detailStore')(observer(Event))
