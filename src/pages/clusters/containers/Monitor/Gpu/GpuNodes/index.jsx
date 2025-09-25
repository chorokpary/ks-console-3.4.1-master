import React, { useEffect } from 'react'
import { Panel } from 'components/Base'

const PALE_BLUE_COLOR = '#EEF2FF'

const Index = props => {
  const {
    selected,
    setSelected,
    styles,
    gpuNodesData,
    setMonitoringType,
    renderHeader,
  } = props

  useEffect(() => {
    setMonitoringType('nodes')

    return () => {
      setSelected(null)
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
              {gpuNodesData.map((obj, index) => (
                <tr key={`${obj.name}-${index}`}>
                  <td
                    style={{
                      backgroundColor:
                        selected?.name === obj.name ? PALE_BLUE_COLOR : '',
                    }}
                    onClick={() => {
                      setSelected(obj)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <i className="ico-type-clusternode"></i>
                      <span style={{ marginLeft: 8 }}>{obj.node}</span>
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
