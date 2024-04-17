import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import CustomStore from 'stores/monitoring/custom/monitor'
import { toJS } from 'mobx'
import { get } from 'lodash'
import { getValueByUnit } from 'utils/monitoring'

const PowerUsageTop5 = ({ x, y, w, h,
  nodeData, cluster
}) => {
  const customStore = new CustomStore()

  const [loading, setLoading] = useState(false)
  const [nodeList, setNodeList] = useState([])
  const [metricType, setMetricType] = useState([])
  const [metricPower, setMetricPower] = useState([])

  {/* 1대 평균 기준 200kwh  */ }
  const [maxUsage, setMaxUsage] = useState(200)

  useEffect(() => {
    if (nodeData.length > 0) {
      getData()
    }
  }, [nodeData])


  useEffect(() => {
    if (nodeData.length > 0) {
      handleList('')
    }
  }, [metricPower])

  // useEffect(() => {

  //   let cleanupTrigger = true;
  const getData = async () => {

    let promql_node_list = ""
    nodeData.map((obj) => {
      const nodeName = get(obj, 'name')
      promql_node_list += promql_node_list != "" ? ("|" + nodeName) : nodeName;
    })

    setLoading(true)
    const metric_type = await customStore.fetchMetric({
      expr: `group by(instance, machine) (node_uname_info{nodename=~"${promql_node_list}"})`,
      cluster
    })

    const metric_power = await customStore.fetchMetric({
      expr: `avg by(target) (redfish_chassis_power_powersupply_last_power_output_watts)`,
      cluster
    })

    // if (cleanupTrigger) {
    setMetricType(metric_type)
    setMetricPower(metric_power)
    setLoading(false)
    //   }
    // };
    // getData();
    // return () => {
    //   cleanupTrigger = false
    //   setLoading(false)
  }
  // }, [])

  const getMetricValue = (data) => {
    const instance = toJS(data.system_type == "C" ? data.name : data.nodeExporter.ip)
    const metrics = metricType.find(item => get(item, 'metric.instance').split(":")[0] === instance)
    const value = get(metrics, 'value[1]', '0');
    return value;
  }

  const getType = (data) => {
    var iconText = "arm"
    const instance = toJS(data.system_type == "C" ? data.name : data.nodeExporter.ip)
    const type_data = metricType.find(item => (get(item, 'metric.instance').split(":")[0] === instance))
    const type = get(type_data, 'metric.machine', '')
    if (type.includes('x86')) iconText = 'x86'
    return iconText
  }

  const handleList = (nodeType) => {
    var arr = nodeData

    if (nodeType == '') {
      arr.map(obj => obj.power = getMetricValue(obj))
    } else {
      arr = new Array()
      nodeData.map(obj => {
        obj.power = getMetricValue(obj)
        const type = getType(obj)
        if (type == nodeType) arr.push(obj)
      })
    }
    arr.sort((a, b) => Number(b.power) - Number(a.power))
    arr.splice(5, arr.length)

    setNodeList(arr)
  }

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_POWER_USAGE_TOP_FIVE')}</label>
              <div className="dash_boxtab">
                <label htmlFor="name13" onClick={() => handleList('')}>
                  <input type="radio" name="box-tab5" id="name13" value="name3" defaultChecked />
                  <span>{t('RESOURCES_ALL')}</span>
                </label>
                <label htmlFor="name14" onClick={() => handleList('arm')}>
                  <input type="radio" name="box-tab5" id="name14" value="name4" />
                  <span>ARM</span>
                </label>
                <label htmlFor="name15" onClick={() => handleList('x86')}>
                  <input type="radio" name="box-tab5" id="name15" value="name5" />
                  <span>x86</span>
                </label>
              </div>
            </div>
            <div className="grid_info style_list">
              {nodeList.length > 0 ?
                <Loading spinning={loading}>
                  <ul className="list_01">
                    {nodeList.map((obj, idx) => (
                      <li className="li_type_01" key={idx}>
                        <div className="lft">
                          <i className={`ico-type24-${getType(obj)}`}></i>
                          <h6 className="list_title">
                            {obj.name}
                            <span>{obj.ip}</span>
                          </h6>
                        </div>
                        <div className="info2">
                          <h6>{Number(obj.power) * 0.1} kWh
                            <span>{((Number(obj.power) * 0.1) / maxUsage * 100).toFixed(2)}%</span>
                          </h6>
                          <div className="graph_wrap">
                            <div className="graph_bar">
                              <div className="bar animate-bar" style={{ width: (Number(obj.power) * 0.001) / maxUsage * 100 + "%" }}></div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Loading>
                :
                <div className="grid_text">
                  <span>{t('RESOURCES_NO_DATA')}</span>
                </div>
              }
            </div>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default PowerUsageTop5