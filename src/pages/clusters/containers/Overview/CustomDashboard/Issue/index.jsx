import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import MessageStore from 'stores/alerting/message'
import { getLocalTime } from 'utils'
import cleanupTrigger from '../cleanupTrigger'

const Issue = ({ x, y, w, h }) => {
  const store = new MessageStore()

  const fetchData = async () => {
    return await store.fetchList({
      sortBy: 'activeAt',
      type: 'builtin',
      cluster: 'default'
    })
  }
  const [list, error, loading] = cleanupTrigger(fetchData, [])

  const getType = (labels) => {
    if ('container' in labels) {
      return 'container'
    } else if ('daemonset' in labels) {
      return 'daemonset'
    } else if ('job' in labels) {
      return 'job'
    } else if ('pod' in labels) {
      return 'pod'
    }
  }

  const getTypeIcon = (labels) => {
    if ('container' in labels) {
      return 'container'
    } else if ('daemonset' in labels) {
      return 'vm'
    } else if ('job' in labels) {
      return 'node'
    } else if ('pod' in labels) {
      return 'pod'
    }
  }

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_ISSUE')}</label>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_list">
                {/* // select_wrap */}
                {list.length > 0 ?
                  <ul className="list_01">
                    {list.map((obj, idx) => (
                      <li className="li_type_01" key={idx}>
                        <div className="lft">
                          <i className={`ico-info-${obj.labels.severity == 'warning' ? 'warning' : 'warning-2'}`}></i>
                          <h6 className="list_title">
                            {obj.annotations.summary}
                            <span>{getLocalTime(obj.activeAt).format('YYYY-MM-DD')}</span>
                          </h6>
                        </div>
                        <div className="type">
                          <span className={`type_${getTypeIcon(obj.labels)}`}>{getType(obj.labels)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  :
                  <div className="grid_text">
                    <span>{t('RESOURCES_NO_DATA')}</span>
                  </div>
                }
              </div>
            </Loading>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default Issue