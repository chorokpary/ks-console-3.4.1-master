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
    gpuVmsData,
    setMonitoringType,
    renderHeader,
    isSearchLoading,
    setIsSearchLoading,
  } = props

  const isEmpty = !isSearchLoading && gpuVmsData.length === 0

  useEffect(() => {
    setMonitoringType('vms')

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
                <th>{t('RESOURCES_VM')}</th>
              </tr>
            </thead>
            <tbody className={styles.vm_list}>
              {isSearchLoading && <Loading className="ks-page-loading" />}
              {isEmpty && <ResourcesNoData />}
              {!isSearchLoading &&
                gpuVmsData.map((obj, index) => (
                  <tr key={`${obj.name}-${index}`}>
                    <td
                      style={{
                        backgroundColor:
                          selected?.id === obj.id ? PALE_BLUE_COLOR : '',
                      }}
                      onClick={() => {
                        setSelected(obj)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <i className="ico-type-vm"></i>
                        <span style={{ marginLeft: 8 }}>
                          {obj.name || 'unknown'}
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
