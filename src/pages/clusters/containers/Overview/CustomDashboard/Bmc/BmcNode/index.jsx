import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import CustomStore from 'stores/monitoring/custom/monitor'
import { toJS } from 'mobx'
import { get } from 'lodash'
import { getValueByUnit } from 'utils/monitoring'

const BmcNode = ({ x, y, w, h,
  nodeData, cluster
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

    let cleanupTrigger = true;
    const getData = async () => {
      setLoading(true)
      const metric_type = await customStore.fetchMetric({
        expr: `group by(instance, machine) (node_uname_info)`,
        cluster
      })

      const metric_cpu = await customStore.fetchMetric({
        expr: `sum by(instance) (rate(node_cpu_seconds_total{mode!="idle"}[5m]))`,
        cluster
      })

      const metric_core = await customStore.fetchMetric({
        expr: `count(node_cpu_seconds_total{mode="idle"}) without (cpu,mode)`,
        cluster
      })

      const metric_memory_total = await customStore.fetchMetric({
        expr: `avg by(instance) (node_memory_MemTotal_bytes)`,
        cluster
      })

      const metric_memory_free = await customStore.fetchMetric({
        expr: `avg by (instance) (node_memory_MemFree_bytes)`,
        cluster
      })

      const metric_disk_total = await customStore.fetchMetric({
        expr: `sum by(instance) (node_filesystem_size_bytes)`,
        cluster
      })

      const metric_disk_free = await customStore.fetchMetric({
        expr: `sum by(instance) (node_filesystem_avail_bytes)`,
        cluster
      })

      const metric_power = await customStore.fetchMetric({
        expr: `avg by(target) (redfish_chassis_power_powersupply_last_power_output_watts)`,
        cluster
      })

      const metric_temperature = await customStore.fetchMetric({
        expr: `avg by(target) (redfish_chassis_temperature_celsius)`,
        cluster
      })

      const metric_state = await customStore.fetchMetric({
        expr: `group by(target) (redfish_system_power_state)`,
        cluster
      })

      if (cleanupTrigger) {
        setMetricType(metric_type)
        setMetricCpu(metric_cpu)
        setMetricCore(metric_core)
        setMetricMemoryTotal(metric_memory_total)
        setMetricMemoryFree(metric_memory_free)

        setMetricDiskTotal(metric_disk_total)
        setMetricDiskFree(metric_disk_free)
        setMetricPower(metric_power)
        setMetricTemperature(metric_temperature)
        setMetricState(metric_state)

        setLoading(false)
      }
    };
    getData();
    return () => {
      cleanupTrigger = false
      setLoading(false)
    }


  }, [])

  const getMetricValue = (metricData, data, type) => {
    const instance = toJS(data.system_type == "C" ? data.name : data.nodeExporter.ip)
    const target = data.openBMC?.address;

    const metrics = type == "redfish" ? metricData.find(item => get(item, 'metric.target') === target)
      : data.system_type == "C"
        ? metricData.find(item => get(item, 'metric.instance') === instance)
        : metricData.find(item => get(item, 'metric.instance', ':').split(":")[0] === instance);
    const value = get(metrics, 'value[1]', '0');
    return value;
  }

  const getType = (data) => {
    var iconText = "clusternode"
    const instance = toJS(data.system_type == "C" ? data.name : data.nodeExporter.ip)
    const type_data = metricType.find(item => (get(item, 'metric.instance').split(":")[0] === instance))
    const type = get(type_data, 'metric.machine', '')
    const x86Array = ['x86_64', 'amd']
    const armArray = ['arm', 'aarch64']
    if (x86Array.includes(type.toLowerCase())) iconText = "x86";
    if (armArray.includes(type.toLowerCase())) iconText = "arm";
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
    const state = getMetricValue(metricData, data, 'redfish')
    const stateText = (state == 1 || state == 3) ? "on" : (state == 2 || state == 4) ? "off" : "unknown"
    return stateText
  }

  const handleList = (nodeType) => {
    var arr = new Array()

    if (nodeType == '') {
      arr = nodeData
    } else {
      nodeData.map(obj => {
        const instance = toJS(obj.system_type == "C" ? obj.name : obj.nodeExporter.ip)
        const type_data = metricType.find(item => (get(item, 'metric.instance').split(":")[0] === instance))
        const type = get(type_data, 'metric.machine', '')
        if (nodeType == 'x86') {
          if (['x86_64', 'amd'].includes(type)) arr.push(obj)
        } else {
          if (['arm', 'aarch64'].includes(type)) arr.push(obj)
        }
      })
    }
    setNodeList(arr)
  }

  useEffect(() => {
    var on = 0;
    var off = 0;
    var unknown = 0;
    nodeList.map(obj => {
      const state = getMetricValue(metricState, obj, 'redfish')
      if (state == 1 || state == 3) {
        on++
      } else if (state == 2 || state == 4) {
        off++
      } else {
        unknown++
      }
    })
    setMetricStateObj({ on, off, unknown, total: on + off + unknown })
  }, [nodeList, metricState])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_BAREMETAL_NODE_CURRENT_SITUATION')}</label>
              <div className="view-result">{t('RESOURCES_TOTAL')} {nodeList.length}{t('RESOURCES_COUNT_GUN')}</div>
              <div className="dash_boxtab">
                <label htmlFor="name9" onClick={() => handleList('')}>
                  <input type="radio" name="box-tab2" id="name9" value="name3" defaultChecked />
                  <span>{t('RESOURCES_ALL')}</span>
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
                          <div key={idx} className={`hexagon ${getState(metricState, obj)}`}><span>{getType(obj).toUpperCase() === 'CLUSTERNODE' ? 'etc' : getType(obj).toUpperCase()}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="cont4">
                    <div className="list_02">
                      <div className="fixed_head_scroll">
                        <div className="box-radius none-shadow">
                          <table className="tbl_list">
                            <caption>{t('RESOURCES_LIST_NETWORK')}</caption>
                            <colgroup>
                              <col style={{ width: "auto" }} />
                              <col style={{ width: "15%" }} />
                              <col style={{ width: "18%" }} />
                              <col style={{ width: "18%" }} />
                              <col style={{ width: "15%" }} />
                            </colgroup>
                            <thead>
                              <tr>
                                <th><strong>{t('RESOURCES_BAREMETAL_NODE')}</strong></th>
                                <th><strong>CPU</strong></th>
                                <th><strong>{t('RESOURCES_MEMORY')}</strong></th>
                                <th><strong>{t('RESOURCES_DISK')}</strong></th>
                                <th><strong>{t('RESOURCES_POWER')}</strong></th>
                                <th><strong>{t('RESOURCES_TEMPERRATURE')}</strong></th>
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
                                      <p>{getMetricValue(metricPower, obj, 'redfish')} <span className="unit">Watt</span></p>
                                    </td>
                                    <td>
                                      <p>{Math.round(Number(getMetricValue(metricTemperature, obj, 'redfish')))} <span className="unit">°C</span></p>
                                    </td>
                                  </tr>
                                ))
                                :
                                <tr>
                                  <td colSpan="6">
                                    <div className="grid_text">
                                      <p>{t('RESOURCES_NO_DATA')}</p>
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