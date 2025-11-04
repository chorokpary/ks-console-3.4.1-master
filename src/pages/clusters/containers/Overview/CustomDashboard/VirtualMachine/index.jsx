import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import VmStore from 'stores/resources/vms'
import VmModel from 'stores/dashboard/vms'
import cleanupTrigger from '../cleanupTrigger'

const VirtualMachine = ({ widgetKey, monitorStore, ...props }) => {
  const vmStore = new VmStore()

  const fetchData = async () => {
    return await vmStore.fetchList({ limit: 1000, ...props })
  }
  const [list, error, loading] = cleanupTrigger(fetchData, [])

  const [data, setData] = useState({})

  useEffect(() => {
    if (list.length > 0) {
      let waitingCount = 0
      let runningCount = 0
      let stoppedCount = 0
      let errorCount = 0
      let vmCount = 0
      let gpuCount = 0
      let vmRunningCount = 0
      let gpuRunningCount = 0

      list.map(item => {
        const state = getState(item.state)
        const isGpu = item.gpus.length > 0

        // 기본 카운트
        if (isGpu) {
          gpuCount++
        } else {
          vmCount++
        }

        // 상태별 카운트
        switch (state) {
          case 'running':
            runningCount++
            isGpu ? gpuRunningCount++ : vmRunningCount++
            break
          case 'waiting':
            waitingCount++
            break
          case 'stopped':
            stoppedCount++
            break
          default:
            errorCount++
        }
      })
      setData({
        total: gpuCount + vmCount,
        running: runningCount,
        waiting: waitingCount,
        stopped: stoppedCount,
        error: errorCount,
        vmTotal: vmCount,
        vmRunning: vmRunningCount,
        gpuTotal: gpuCount,
        gpuRunning: gpuRunningCount,
      })
    }
  }, [list])

  const getState = state => {
    if (
      state === 'Provisioning' ||
      state === 'Starting' ||
      state === 'Stopping' ||
      state === 'Terminating' ||
      state === 'Migrating' ||
      state === 'WaitingForVolumeBinding'
    ) {
      return 'waiting'
    }
    if (state === 'Running') {
      return 'running'
    }
    if (state === 'Stopped' || state === 'Paused') {
      return 'stopped'
    }

    return 'error'
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_VM')}</label>
        </div>
        <Loading spinning={loading}>
          <div className="grid_info style_status">
            <div className="box type_status">
              <div className="cont_group clusternode">
                <div className="cont1">
                  <div className="number_wrap">
                    <i className="ico-type24-vm-gpu">
                      <span>GPU {t('RESOURCES_VM_SHORT')}</span>
                    </i>
                    <p>
                      <span className="em">{data.gpuRunning || 0}</span>/{' '}
                      {data.gpuTotal || 0}
                    </p>
                  </div>
                  <div className="number_wrap">
                    <i className="ico-type24-vm">
                      <span>CPU {t('RESOURCES_VM_SHORT')}</span>
                    </i>
                    <p>
                      <span className="em">{data.vmRunning || 0}</span>/{' '}
                      {data.vmTotal || 0}
                    </p>
                  </div>
                </div>
                <div className="cont2">
                  <div className="status_wrap">
                    <div className="value">{data.waiting || 0}</div>
                    <p className="status waiting">
                      <span>{t('RESOURCES_PROGRESSING')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{data.running || 0}</div>
                    <p className="status running">
                      <span>{t('RESOURCES_RUNNING')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{data.stopped || 0}</div>
                    <p className="status warning">
                      <span>{t('RESOURCES_STOPPED')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{data.error || 0}</div>
                    <p className="status error">
                      <span>{t('RESOURCES_ERROR')}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Loading>
      </div>
    </>
  )
}

export default VirtualMachine
