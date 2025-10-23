import React, { useEffect } from 'react'
import { Panel } from 'components/Base'

import { Loading } from '@kube-design/components'

const PALE_BLUE_COLOR = '#EEF2FF'

const ResourcesNoData = () => {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginLeft: 8 }}>{t('RESOURCES_NO_DATA')}</span>
        </div>
      </td>
    </tr>
  )
}

const Index = props => {
  const {
    selected,
    setSelected,
    styles,
    gpuNodesData,
    setMonitoringType,
    renderHeader,
    isSearchLoading,
    setIsSearchLoading,
  } = props

  const isEmpty = !isSearchLoading && gpuNodesData.length === 0

  useEffect(() => {
    setMonitoringType('nodes')

    return () => {
      setSelected(null)
      setIsSearchLoading(true)
    }
  }, [])

  return (
    <Panel>
      {renderHeader()}
      <div style={{ height: '630px' }}>
        <div className={styles.content}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('RESOURCES_NODE')}</th>
              </tr>
            </thead>
            <tbody className={styles.vm_list}>
              {isSearchLoading && <Loading className="ks-page-loading" />}
              {isEmpty && <ResourcesNoData />}
              {!isSearchLoading &&
                gpuNodesData.map((obj, index) => (
                  <tr key={`${obj.name}-${index}`}>
                    <td
                      style={{
                        backgroundColor:
                          selected?.node_ip === obj.node_ip
                            ? PALE_BLUE_COLOR
                            : '',
                      }}
                      onClick={() => {
                        setSelected(obj)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <i className="ico-type-clusternode"></i>
                        <span style={{ marginLeft: 8 }}>
                          {obj.node || 'unknown'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  )
}

export default Index
