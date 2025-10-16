import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'
import NodeStore from 'stores/node'
import GpuNodeStore from 'stores/resources/gpunodes'
import { get } from 'lodash'
import { getNodeStatus } from 'utils/node'

const Node = ({ widgetKey, monitorStore, ...props }) => {
  const nodeStore = new NodeStore()
  const gpuNodeStore = new GpuNodeStore()

  const [data, setData] = useState({
    gpuRunning: 0,
    gpuTotal: 0,
    cpuRunning: 0,
    cpuTotal: 0,
    warning: 0,
    unschedulable: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)

    const nodeData = await nodeStore.fetchList({
      limit: 1000,
      ...props,
    })
    const gpuNodeData = await gpuNodeStore.fetchList({
      limit: 1000,
      ...props,
    })
    const gpuNameArr = gpuNodeData.map(item => item.name)
    let result = { ...data }
    nodeData.map(item => {
      const status = getNodeStatus(item)

      if (gpuNameArr.includes(item.name)) {
        switch (status) {
          case 'Running':
            result.gpuRunning++
            break
          case 'Warning':
            result.warning++
            break
          case 'Unschedulable':
            result.unschedulable++
            break
          default:
            break
        }
        result.gpuTotal++
      } else {
        switch (status) {
          case 'Running':
            result.cpuRunning++
            break
          case 'Warning':
            result.warning++
            break
          case 'Unschedulable':
            result.unschedulable++
            break
          default:
            break
        }
        result.cpuTotal++
      }
    })

    setData(result)
    setLoading(false)
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>노드</label>
        </div>
        <Loading spinning={loading}>
          <div className="grid_info style_status">
            <div className="box type_status">
              <div className="cont_group clusternode">
                <div className="cont1">
                  <div className="number_wrap">
                    <i className="ico-type24-clusternode-gpu">
                      <span>GPU 노드</span>
                    </i>
                    <p>
                      <span className="em">{data.gpuRunning}</span>/{' '}
                      {data.gpuTotal}
                    </p>
                  </div>
                  <div className="number_wrap">
                    <i className="ico-type24-clusternode">
                      <span>CPU 노드</span>
                    </i>
                    <p>
                      <span className="em">{data.cpuRunning}</span>/{' '}
                      {data.cpuTotal}
                    </p>
                  </div>
                </div>
                <div className="cont3">
                  <div className="status_wrap">
                    <div className="value">
                      {data.gpuRunning + data.cpuRunning}
                    </div>
                    <p className="status running">
                      <span>실행중</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{data.warning}</div>
                    <p className="status warning">
                      <span>주의</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{data.unschedulable}</div>
                    <p className="status unschedulable">
                      <span>스케줄링 불가</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{data.gpuTotal + data.cpuTotal}</div>
                    <p className="status total">
                      <span>전체</span>
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

export default Node
