import React, { useEffect, useState } from 'react'
import { Loading, Select } from '@kube-design/components'
import MessageStore from 'stores/alerting/message'
import { get } from 'lodash'

const typeOption = [
  {
    value: 'all',
    label: t('전체'),
  },
  {
    value: 'node',
    label: t('노드'),
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
    label: t('가상머신'),
  },
  {
    value: 'kaas',
    label: t('KaaS'),
  },
]

const Alarm = ({ widgetKey, monitorStore, isVertical, ...props }) => {
  const store = new MessageStore()
  const [alarmData, setAlarmData] = useState([])
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('all')

  const [filter, setFilter] = useState('all')
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
      limit: 30,
    })
    setAlarmData(alarmData)
    setLoading(false)
    setAlarmData(asd.items)
  }

  const asd = {
    items: [
      {
        activeAt: '2025-09-19T06:11:08.064866888Z',
        annotations: {
          message: 'XID error vm:vm01, gpu:2, error_code: 43',
          summary: 'test alert 입니다',
        },
        labels: {
          alertname: 'xid name alert1',
          alerttype: 'metric',
          gpu: '2',
          rule_group: 'xid-test',
          rule_id: '9aa038b9-c119-437a-8bf0-208aaf3213b8',
          rule_level: 'cluster',
          rule_type: 'custom',
          severity: 'critical',
          vm: 'vm01',
        },
        state: 'firing',
        value: '4.3e+01',
      },
    ],
    totalItems: 1,
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
      return { code: 'critical', text: '심각' }
    } else if (severity === 'error') {
      return { code: 'minor', text: '경고' }
    } else if (severity === 'warning') {
      return { code: 'unknown', text: '주의' }
    } else {
      return { code: 'unknown', text: '주의' }
    }
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>알림</label>
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
                {/* gpu badge number는 99 이상일때 99로만 표현 */}
                <span>
                  <span className="gpu_badge_number">
                    {criticalCount + minorCount + unknownCount > 99
                      ? '99'
                      : criticalCount + minorCount + unknownCount}
                  </span>
                  <span>전체</span>
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
                    {criticalCount > 99 ? '99' : criticalCount}
                  </span>
                  <span>심각</span>
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
                  <span className="gpu_badge_number minor">
                    {minorCount > 99 ? '99' : minorCount}
                  </span>
                  <span>경고</span>
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
                    {unknownCount > 99 ? '99' : unknownCount}
                  </span>
                  <span>주의</span>
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
            <button className="icon">
              <i className="ico-list-filter"></i>
            </button>
            {/* filter 버튼 클릭시 : dropdown 최신 순 / 오래된 순*/}
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
              {/* gpu badge number는 99 이상일때 99로만 표현 */}
              <span>
                <span className="gpu_badge_number">
                  {criticalCount + minorCount + unknownCount > 99
                    ? '99'
                    : criticalCount + minorCount + unknownCount}
                </span>
                <span>전체</span>
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
                  {criticalCount > 99 ? '99' : criticalCount}
                </span>
                <span>심각</span>
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
                <span className="gpu_badge_number minor">
                  {minorCount > 99 ? '99' : minorCount}
                </span>
                <span>경고</span>
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
                <span className="gpu_badge_number unknown">
                  {unknownCount > 99 ? '99' : unknownCount}
                </span>
                <span>주의</span>
              </span>
            </label>
          </div>
        )}

        <Loading spinning={loading}>
          <div className="grid_info style_list">
            {alarmData.length > 0 ? (
              <ul className={`alert_card_list ${isVertical ? 'bottom' : ''}`}>
                {alarmData
                  .filter(data => {
                    const status = getStatus(data.labels.severity)
                    if (filter === 'all') return true
                    return status.code === filter
                  })
                  .map((data, index) => {
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
                            <p className="alert_message">
                              {data.annotations.summary}
                              {/* Thanos Rule {{$labels.instance}} in
                                    {{$labels.namespace}} is failing to queue */}
                            </p>
                            {data.labels.gpu && (
                              <p className="alert_badge">
                                <span className="alert_errorcode">
                                  Error Code: {Number(data.value)}
                                </span>
                              </p>
                            )}
                          </div>
                          <p className="alert_date">
                            {
                              new Date(data.activeAt)
                                .toISOString()
                                .split('T')[0]
                            }
                          </p>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            ) : (
              <div className="grid_text">
                <span>데이터가 없습니다.</span>
              </div>
            )}
          </div>
        </Loading>
      </div>
    </>
  )
}

export default Alarm
