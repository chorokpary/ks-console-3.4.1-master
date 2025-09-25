import React, { useEffect } from 'react'
import { Panel } from 'components/Base'

const PALE_BLUE_COLOR = '#EEF2FF'
const Index = props => {
  const { selected, setSelected, styles, gpuVmsData, setMonitoringType, renderHeader } = props

  useEffect(() => {
    setMonitoringType('vms')

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
                <th>{t('RESOURCES_VM')}</th>
              </tr>
            </thead>
            <tbody className={styles.vm_list}>
              {gpuVmsData.map((obj, index) => (
                <tr key={`${obj.name}-${index}`}>
                  <td
                    style={{
                      backgroundColor: selected?.name === obj.name ? PALE_BLUE_COLOR : '',
                    }}
                    onClick={() => {
                      setSelected(obj)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <i className="ico-type-vm"></i>
                      <span style={{ marginLeft: 8 }}>{obj.name}</span>
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
