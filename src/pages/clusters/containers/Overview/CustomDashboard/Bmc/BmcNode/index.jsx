import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import CustomStore from 'stores/monitoring/custom/monitor'
import { toJS } from 'mobx'
import { get } from 'lodash'
import { getValueByUnit } from 'utils/monitoring'

const BmcNode = ({ x, y, w, h,
  nodeData
}) => {
  const customStore = new CustomStore()
  const [loading, setLoading] = useState(false)
  const [nodeList, setNodeList] = useState([])
  const [metricType, setMetricType] = useState([])
  const [metricCpu, setMetricCpu] = useState([])
  const [metricCore, setMetricCore] = useState([])
  const [metricMemoryTotal, setMetricMemoryTotal] = useState([])
  const [metricMemoryFree, setMetricMemoryFree] = useState([])
  const [metricDiskTotal, setMetricDiskTotal] = useState([])
  const [metricDiskFree, setMetricDiskFree] = useState([])
  const [metricPower, setMetricPower] = useState([])
  const [metricTemperature, setMetricTemperature] = useState([])
  const [metricState, setMetricState] = useState([])
  const [metricStateObj, setMetricStateObj] = useState({ total: 0, on: 0, off: 0, unknown: 0 })

  useEffect(() => {
    setNodeList(nodeData)
  }, [nodeData])

  useEffect(() => {

    const getData = async () => {
      setLoading(true)
      const metric_type = await customStore.fetchMetric({
        expr: `max by(instance, machine) (node_uname_info)`,
      })
      setMetricType(metric_type)

      const metric_cpu = await customStore.fetchMetric({
        expr: `sum by(instance) (rate(node_cpu_seconds_total{mode!="idle"}[5m]))`,
      })
      setMetricCpu(metric_cpu)

      const metric_core = await customStore.fetchMetric({
        expr: `count(node_cpu_seconds_total{mode="idle"}) without (cpu,mode)`,
      })
      setMetricCore(metric_core)

      const metric_memory_total = await customStore.fetchMetric({
        expr: `avg by(instance) (node_memory_MemTotal_bytes)`,
      })
      setMetricMemoryTotal(metric_memory_total)

      const metric_memory_free = await customStore.fetchMetric({
        expr: `avg by (instance) (node_memory_MemFree_bytes)`,
      })
      setMetricMemoryFree(metric_memory_free)

      const metric_disk_total = await customStore.fetchMetric({
        expr: `sum by(instance) (node_filesystem_size_bytes)`,
      })
      setMetricDiskTotal(metric_disk_total)

      const metric_disk_free = await customStore.fetchMetric({
        expr: `sum by(instance) (node_filesystem_avail_bytes)`,
      })
      setMetricDiskFree(metric_disk_free)

      const metric_power = await customStore.fetchMetric({
        expr: `avg by(instance) (redfish_chassis_power_powersupply_last_power_output_watts)`,
      })
      setMetricPower(metric_power)

      const metric_temperature = await customStore.fetchMetric({
        expr: `avg by(instance) (redfish_chassis_temperature_celsius)`,
      })
      setMetricTemperature(metric_temperature)

      const metric_state = await customStore.fetchMetric({
        expr: `max by(instance) (redfish_system_power_state)`,
      })
      setMetricState(metric_state)

      setLoading(false)
    };
    getData();

  }, [])

  const getMetricValue = (metricData, data) => {
    const instance = toJS(data.ip)
    const metrics = metricData.find(item => get(item, 'metric.instance').split(":")[0] === instance)
    const value = get(metrics, 'value[1]', '0');
    return value;
  }

  const getType = (data) => {
    var iconText = "arm"
    const type_data = metricType.find(item => (get(item, 'metric.instance').split(":")[0] === data.ip))
    const type = get(type_data, 'metric.machine', '')
    const x86Array = ['x86_64', 'amd']
    iconText = x86Array.includes(type.toLowerCase()) ? "x86" : "arm"
    return iconText
  }

  const getMemory = (data) => {
    const memory_total_data = getMetricValue(metricMemoryTotal, data)
    const memory_free_data = getMetricValue(metricMemoryFree, data)

    const memory_total = getValueByUnit(memory_total_data, "Gi")
    const memory_free = getValueByUnit(memory_free_data, "Gi")
    const memory_used = (memory_total - memory_free).toFixed(2)

    const memory_percent = isNaN(((memory_used / memory_total) * 100).toFixed(0)) ? 0 : ((memory_used / memory_total) * 100).toFixed(0)

    return <><p>{memory_percent}%</p><span>{memory_used}Gi/{memory_total}Gi</span></>
  }

  const getDisk = (data) => {
    const disk_total_data = getMetricValue(metricDiskTotal, data)
    const disk_free_data = getMetricValue(metricDiskFree, data)

    const disk_total = getValueByUnit(disk_total_data, "GB")
    const disk_free = getValueByUnit(disk_free_data, "GB")
    const disk_used = (disk_total - disk_free).toFixed(2)

    const disk_percent = isNaN(((disk_used / disk_total) * 100).toFixed(0)) ? 0 : ((disk_used / disk_total) * 100).toFixed(0)

    return <><p>{disk_percent}%</p><span>{disk_used}GB/{disk_total}GB</span></>
  }

  const getState = (metricData, data) => {
    const state = getMetricValue(metricData, data)
    const stateText = (state == 1 || state == 3) ? "on" : (state == 2 || state == 4) ? "off" : "unknown"
    return stateText
  }

  const handleList = (nodeType) => {
    var arr = new Array()

    if (nodeType == '') {
      arr = nodeData
    } else {
      nodeData.map(obj => {
        const type_data = metricType.find(item => (get(item, 'metric.instance').split(":")[0] === obj.ip))
        const type = get(type_data, 'metric.machine', '')
        if (nodeType == 'x86') {
          if (type.includes(nodeType)) arr.push(obj)
        } else {
          if (!type.includes('x86')) arr.push(obj)
        }
      })
    }
    setNodeList(arr)
  }

  useEffect(() => {
    if (nodeList.length > 0) {
      var on = 0;
      var off = 0;
      var unknown = 0;
      nodeList.map(obj => {
        const state = getMetricValue(metricState, obj)
        if (state == 1 || state == 3) {
          on++
        } else if (state == 2 || state == 4) {
          off++
        } else {
          unknown++
        }
      })
      setMetricStateObj({ on, off, unknown, total: on + off + unknown })
    }
  }, [nodeList, metricState])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>베어메탈 노드 현황</label>
              <div className="view-result">총 {nodeList.length}건</div>
              <div className="dash_boxtab">
                <label htmlFor="name9" onClick={() => handleList('')}>
                  <input type="radio" name="box-tab2" id="name9" value="name3" defaultChecked />
                  <span>전체</span>
                </label>
                <label htmlFor="name10" onClick={() => handleList('arm')}>
                  <input type="radio" name="box-tab2" id="name10" value="name4" />
                  <span>ARM</span>
                </label>
                <label htmlFor="name11" onClick={() => handleList('x86')}>
                  <input type="radio" name="box-tab2" id="name11" value="name5" />
                  <span>x86</span>
                </label>
              </div>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_status style_node">
                <div className="box type_node">
                  <div className="cont3">
                    <div className="box type_status">
                      <div className="cont_group">
                        <div className="cont1">
                          <div className="number_wrap">
                            <p><span className="em">{metricStateObj.on}</span> / {metricStateObj.total}</p>
                          </div>
                        </div>
                        <div className="cont2">
                          <div className="status_wrap">
                            <div className="value">{metricStateObj.on}</div>
                            <p className="status on"><span>On</span></p>
                          </div>
                          <div className="status_wrap">
                            <div className="value">{metricStateObj.off}</div>
                            <p className="status off"><span>Off</span></p>
                          </div>
                          <div className="status_wrap">
                            <div className="value">{metricStateObj.unknown}</div>
                            <p className="status unknown"><span>Unknown</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="hexagon_wrap">
                        {nodeList.map((obj, idx) => (
                          <div key={idx} className={`hexagon ${getState(metricState, obj)}`}><span>{getType(obj).toUpperCase()}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="cont4">
                    <div className="list_02">
                      <div className="fixed_head_scroll">
                        <div className="box-radius none-shadow">
                          <table className="tbl_list">
                            <caption>네트워크 목록</caption>
                            <colgroup>
                              <col style={{ width: "auto" }} />
                              <col style={{ width: "15%" }} />
                              <col style={{ width: "18%" }} />
                              <col style={{ width: "18%" }} />
                              <col style={{ width: "15%" }} />
                            </colgroup>
                            <thead>
                              <tr>
                                <th><strong>베어메탈 노드</strong></th>
                                <th><strong>CPU</strong></th>
                                <th><strong>메모리</strong></th>
                                <th><strong>디스크</strong></th>
                                <th><strong>파워</strong></th>
                                <th><strong>온도</strong></th>
                              </tr>
                            </thead>
                            <tbody>
                              {nodeList.length > 0 ?
                                nodeList.map((obj, idx) => (
                                  <tr key={idx}>
                                    <td className="tbl_tit">
                                      <i className={`ico-type24-${getType(obj)} ${getState(metricState, obj)}`}></i>
                                      <p>{obj.name}</p>
                                    </td>
                                    <td>
                                      <p>{Math.round(getMetricValue(metricCpu, obj)).toFixed(1)}%</p>
                                      <span>{getMetricValue(metricCore, obj)}core</span>
                                    </td>
                                    <td>
                                      {getMemory(obj)}
                                    </td>
                                    <td>
                                      {getDisk(obj)}
                                    </td>
                                    <td>
                                      <p>{getMetricValue(metricPower, obj)} <span className="unit">Watt</span></p>
                                    </td>
                                    <td>
                                      <p>{getMetricValue(metricTemperature, obj)} <span className="unit">°C</span></p>
                                    </td>
                                  </tr>
                                ))
                                :
                                <tr>
                                  <td colSpan="6">
                                    <div className="grid_text">
                                      <p>데이터가 없습니다.</p>
                                    </div>
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Loading>
          </div>
        </div>
      </div>
    </>
  )
}

export default BmcNode