import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Dropdown,
  Icon,
  Loading,
  Select,
} from '@kube-design/components'
import MessageStore from 'stores/alerting/message'
import { get, set } from 'lodash'
import { useHistory } from 'react-router-dom/cjs/react-router-dom'
import { inject, observer } from 'mobx-react'

const typeOption = [
  {
    value: 'all',
    label: t('RESOURCES_ALL'),
  },
  {
    value: 'node',
    label: t('RESOURCES_NODE'),
  },
  {
    value: 'gpu',
    label: t('GPU'),
  },
  {
    value: 'pod',
    label: t('Pod'),
  },
  {
    value: 'vm',
    label: t('RESOURCES_VM'),
  },
  {
    value: 'kaas',
    label: t('KaaS'),
  },
]
const sortOption = [
  {
    value: 'latest',
    label: t('RESOURCES_SORT_LATEST'),
  },
  {
    value: 'oldest',
    label: t('RESOURCES_SORT_OLDEST'),
  },
]

const Alarm = ({ widgetKey, monitorStore, isVertical, ...props }) => {
  const history = useHistory()
  const store = new MessageStore()

  const [alarmData, setAlarmData] = useState([])
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('all')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('latest')

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [criticalCount, setCriticalCount] = useState(0)
  const [minorCount, setMinorCount] = useState(0)
  const [unknownCount, setUnknownCount] = useState(0)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)
    const alarmData = await store.fetchList({
      sortBy: 'activeAt',
      limit: 50,
    })

    let cluster = globals.currentCluster
    const globalAlarmData = await store.fetchList({
      sortBy: 'activeAt',
      type: 'builtin',
      cluster,
      limit: 49,
    })
    const globalAlarmDataWithType = globalAlarmData.map(item => ({
      ...item,
      state_type: 'builtin',
    }))
    setAlarmData([...alarmData, ...globalAlarmDataWithType])
    setLoading(false)
  }

  useEffect(() => {
    if (alarmData.length > 0) {
      let criticalCount = 0
      let minorCount = 0
      let unknownCount = 0
      alarmData.map(data => {
        if (data.labels.severity == 'critical') {
          criticalCount++
        } else if (data.labels.severity == 'minor') {
          minorCount++
        } else {
          unknownCount++
        }
      })

      setCriticalCount(criticalCount)
      setMinorCount(minorCount)
      setUnknownCount(unknownCount)
    }
  }, [alarmData])

  const getTypeIcon = labels => {
    if ('container' in labels) {
      return 'kaas'
    } else if ('daemonset' in labels) {
      return 'vm'
    } else if ('job' in labels) {
      return 'node'
    } else if ('pod' in labels) {
      return 'pod'
    } else if ('gpu' in labels) {
      return 'gpu'
    } else {
      return 'etc'
    }
  }

  const getType = labels => {
    if ('container' in labels) {
      return 'KaaS'
    } else if ('daemonset' in labels) {
      return 'VM'
    } else if ('job' in labels) {
      return 'Node'
    } else if ('pod' in labels) {
      return 'Pod'
    } else if ('gpu' in labels) {
      return 'GPU'
    } else {
      return 'etc'
    }
  }

  const getStatus = severity => {
    if (severity === 'critical') {
      return { code: 'critical', text: t('RESOURCES_GPUCLUSTER_CRITICAL') }
    } else if (severity === 'error') {
      return { code: 'minor', text: t('RESOURCES_GPUCLUSTER_MINOR') }
    } else if (severity === 'warning') {
      return { code: 'unknown', text: t('RESOURCES_WARNING') }
    } else {
      return { code: 'unknown', text: t('RESOURCES_WARNING') }
    }
  }

  const filteredData = useMemo(() => {
    return alarmData
      .filter(data => {
        const status = getStatus(data.labels.severity).code
        const resourceType = getTypeIcon(data.labels) || 'node'

        const severityMatch = filter === 'all' || status === filter
        const typeMatch = type === 'all' || resourceType === type

        return severityMatch && typeMatch
      })
      .sort((a, b) => {
        const dateA = new Date(a.activeAt).getTime()
        const dateB = new Date(b.activeAt).getTime()
        if (sort === 'latest') return dateB - dateA
        if (sort === 'oldest') return dateA - dateB
        return 0
      })
  }, [alarmData, filter, type, sort])

  // 바깥 클릭 감지
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleRowClick = data => {
    const newRecord = {
      ...data,
      state_type: data.state_type || 'custom',
    }
    props.rootStore.message.setDetailMessage(newRecord)
    history.push(
      `/clusters/${props.cluster}/alerts/${data.annotations.summary}`
    )
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_ALERTING_MESSAGE')}</label>
          {isVertical && (
            <div className="alert_tab bottom" style={{ marginLeft: '830px' }}>
              <label htmlFor="al_name2_1">
                <input
                  type="radio"
                  name="box-tab2"
                  id="al_name2_1"
                  value="al_name2_1"
                  defaultChecked
                  onClick={() => setFilter('all')}
                />
                <span>
                  <span className="gpu_badge_number">
                    {criticalCount + minorCount + unknownCount}
                  </span>
                  <span>{t('RESOURCES_ALL')}</span>
                </span>
              </label>
              <label htmlFor="al_name2_2">
                <input
                  type="radio"
                  name="box-tab2"
                  id="al_name2_2"
                  value="al_name2_2"
                  onClick={() => setFilter('critical')}
                />
                <span>
                  <span className="gpu_badge_number critical">
                    {criticalCount}
                  </span>
                  <span>{t('RESOURCES_GPUCLUSTER_CRITICAL')}</span>
                </span>
              </label>
              <label htmlFor="al_name2_3">
                <input
                  type="radio"
                  name="box-tab2"
                  id="al_name2_3"
                  value="al_name2_3"
                  onClick={() => setFilter('minor')}
                />
                <span>
                  <span className="gpu_badge_number minor">{minorCount}</span>
                  <span>{t('RESOURCES_GPUCLUSTER_MINOR')}</span>
                </span>
              </label>
              <label htmlFor="al_name2_4">
                <input
                  type="radio"
                  name="box-tab2"
                  id="al_name2_4"
                  value="al_name2_4"
                  onClick={() => setFilter('unknown')}
                />
                <span>
                  <span className="gpu_badge_number unknown">
                    {unknownCount}
                  </span>
                  <span>{t('RESOURCES_WARNING')}</span>
                </span>
              </label>
            </div>
          )}
          <div className="right" style={{ width: isVertical ? '10%' : '45%' }}>
            <div
              className="select-list-box"
              style={{ width: '70%', marginTop: '-7px' }}
            >
              <div className="usageTab">
                <Select
                  value={type}
                  onChange={e => setType(e)}
                  options={typeOption}
                />
              </div>
            </div>
            <div className="icon_dropdown_wrap" ref={dropdownRef}>
              <button
                className="icon icon_dropdown_btn"
                onClick={() => setOpen(prev => !prev)}
              >
                <i className="ico-list-filter"></i>
              </button>
              <div className={`icon_dropdown_box ${open && 'open'}`}>
                <ul className="icon_dropdown_list">
                  {sortOption.map(opt => (
                    <li
                      key={opt.value}
                      className={sort === opt.value ? 'selected' : ''}
                      onClick={() => {
                        setSort(opt.value)
                        setOpen(false)
                      }}
                    >
                      <span>{opt.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        {!isVertical && (
          <div className="alert_tab">
            <label htmlFor="al_name1_1">
              <input
                type="radio"
                name="box-tab1"
                id="al_name1_1"
                value="al_name1_1"
                defaultChecked
                onClick={() => setFilter('all')}
              />
              <span>
                <span className="gpu_badge_number">
                  {criticalCount + minorCount + unknownCount}
                </span>
                <span>{t('RESOURCES_ALL')}</span>
              </span>
            </label>
            <label htmlFor="al_name1_2">
              <input
                type="radio"
                name="box-tab1"
                id="al_name1_2"
                value="al_name1_2"
                onClick={() => setFilter('critical')}
              />
              <span>
                <span className="gpu_badge_number critical">
                  {criticalCount}
                </span>
                <span>{t('RESOURCES_GPUCLUSTER_CRITICAL')}</span>
              </span>
            </label>
            <label htmlFor="al_name1_3">
              <input
                type="radio"
                name="box-tab1"
                id="al_name1_3"
                value="al_name1_3"
                onClick={() => setFilter('minor')}
              />
              <span>
                <span className="gpu_badge_number minor">{minorCount}</span>
                <span>{t('RESOURCES_GPUCLUSTER_MINOR')}</span>
              </span>
            </label>
            <label htmlFor="al_name1_4">
              <input
                type="radio"
                name="box-tab1"
                id="al_name1_4"
                value="al_name1_4"
                onClick={() => setFilter('unknown')}
              />
              <span>
                <span className="gpu_badge_number unknown">{unknownCount}</span>
                <span>{t('RESOURCES_WARNING')}</span>
              </span>
            </label>
          </div>
        )}

        <Loading spinning={loading}>
          <div className="grid_info style_list">
            {filteredData.length > 0 ? (
              <ul className={`alert_card_list ${isVertical ? 'bottom' : ''}`}>
                {filteredData.map((data, index) => {
                  const status = getStatus(data.labels.severity)
                  return (
                    <li className="alert_card" key={index}>
                      <div className="alert_content">
                        <div className="alert_header">
                          <span className={`alert_status ${status.code}`}>
                            {status.text}
                          </span>
                          <span
                            className={`alert_resource type_${getTypeIcon(
                              data.labels
                            ) || 'node'}`}
                          >
                            {getType(data.labels) || '노드'}
                          </span>
                        </div>

                        <div className="alert_body">
                          <p
                            className="alert_message"
                            onClick={() => handleRowClick(data)}
                            style={{ cursor: 'pointer' }}
                          >
                            {data.annotations.summary}
                          </p>
                          {data.annotations?.message && (
                            <p className="alert_badge">
                              <span className="alert_errorcode">
                                {data.annotations.message}
                              </span>
                            </p>
                          )}
                        </div>
                        <p className="alert_date">
                          {new Date(data.activeAt).toISOString().split('T')[0]}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="grid_text">
                <span>{t('RESOURCES_NO_DATA')}</span>
              </div>
            )}
          </div>
        </Loading>
      </div>
    </>
  )
}

export default inject('rootStore')(observer(Alarm))
