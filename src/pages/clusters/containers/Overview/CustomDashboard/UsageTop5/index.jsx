import React, { useEffect, useState } from 'react'
import { Loading, Select } from '@kube-design/components'
import NodeStore from 'stores/rank/node'
import { get } from 'lodash'
import VmStore from 'stores/resources/vms'
import ResourceStore from 'stores/resources/containerresource'
import PodStore from 'stores/dashboard/rank/pod'
import CustomStore from 'stores/monitoring/custom/monitor'
import { getSuitableValue } from 'utils/monitoring'

const typeOption = [
  {
    value: 'node',
    label: t('RESOURCES_NODE'),
  },
  {
    value: 'pod',
    label: t('POD_PL'),
  },
  {
    value: 'vm',
    label: t('RESOURCES_VM'),
  },
  {
    value: 'kaas',
    label: 'KaaS',
  },
]
const sortOptionNode = [
  {
    value: 'node_cpu_utilisation',
    label: t(`SORT_BY_NODE_CPU_UTILISATION`),
  },
  {
    value: 'node_memory_utilisation',
    label: t(`SORT_BY_NODE_MEMORY_UTILISATION`),
  },
  {
    value: 'node_disk_size_utilisation',
    label: t(`SORT_BY_NODE_DISK_SIZE_UTILISATION`),
  },
]
const sortOptionPod = [
  {
    value: 'pod_cpu_usage',
    label: t(`SORT_BY_WORKSPACE_CPU_USAGE`),
  },
  {
    value: 'pod_memory_usage',
    label: t(`SORT_BY_WORKSPACE_MEMORY_USAGE`),
  },
]
const sortOptionVm = [
  {
    value: 'vm_cpu_usage',
    label: t(`SORT_BY_WORKSPACE_CPU_USAGE`),
  },
  {
    value: 'vm_memory_usage',
    label: t(`SORT_BY_WORKSPACE_MEMORY_USAGE`),
  },
]
const sortOptionKaas = [
  {
    value: 'kaas_cpu_usage',
    label: t(`SORT_BY_WORKSPACE_CPU_USAGE`),
  },
  {
    value: 'kaas_memory_usage',
    label: t(`SORT_BY_WORKSPACE_MEMORY_USAGE`),
  },
]

const storeParams = {
  limit: 5,
  page: 1,
  sort_type: 'desc',
}

const UsageTop5 = ({ widgetKey, monitorStore, ...props }) => {
  const nodeStore = new NodeStore({ ...storeParams })
  const podStore = new PodStore({ ...storeParams })
  const customStore = new CustomStore()
  const vmStore = new VmStore()
  const kaasStore = new ResourceStore()

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  const [vmList, setVmList] = useState()
  const [kaasVmList, setKaaSVmList] = useState()
  const [sortOption, setSortOption] = useState(sortOptionNode)
  const [sortMetric, setSortMetric] = useState(sortOption[0].value)
  const [unitType, setUnitType] = useState({ unit: 'cpu', value: 'CPU 사용량' })
  const [typeMetric, setTypeMetric] = useState(typeOption[0].value)

  const getNodeData = async (params = {}) => {
    setLoading(true)
    const nodeList = await nodeStore.fetchAll({ ...params, ...props })

    setList(nodeList)
    setLoading(false)
  }

  const getPodData = async (params = {}) => {
    setLoading(true)
    const podList = await podStore.fetchAll({ ...params, ...props })
    setList(podList)
    setLoading(false)
  }

  const handleDataList = data => {
    let filteredData = []

    data.map(obj => {
      let name = obj.metric.pod
      let usage = obj.values[0][1]
      filteredData.push({ name, usage })
    })
    filteredData.sort(function(a, b) {
      return b.usage - a.usage
    })
    setList(filteredData.splice(0, 5))
  }

  useEffect(() => {
    let cleanupTrigger = true
    const getDataList = async () => {

      // VM list
      const vmList = await vmStore.vmList({ limit: -1, ...props })
      let vmNames = ''
      vmList.map(obj => (vmNames = vmNames + obj.name + '|'))

      // KaaS VM list
      const kaasVmList = await kaasStore.fetchMachinesAll({ limit: -1, ...props })
      let kaasVmNames = ''
      kaasVmList.map(obj => (kaasVmNames = kaasVmNames + obj.name + '|'))

      if (cleanupTrigger) {
        setVmList(vmNames)
        setKaaSVmList(kaasVmNames)
        getNodeData()
      }
    }
    getDataList()

    return () => {
      cleanupTrigger = false
    }
  }, [])

  const getCpuData = async type => {
    let filtered = ""
    if (type == 'vm') filtered = `pod=~"${vmList}"`
    if (type == 'kaas') filtered = `pod=~"${kaasVmList}"`

    var currentTime = Math.floor(Date.now() / 1000)
    const cpuData = await customStore.fetchMetric({
      expr: `(100 - (avg by (pod) (irate(node_cpu_seconds_total{service="launcher-node-exporter",mode="idle",${filtered}}[5m])) * 100)) / 100`,
      start: currentTime,
      end: currentTime,
      cluster: props.cluster,
    })
    handleDataList(cpuData)
  }

  const getMemoryData = async type => {
    let filtered = ""
    if (type == 'vm') filtered = `pod=~"${vmList}"`
    if (type == 'kaas') filtered = `pod=~"${kaasVmList}"`

    var currentTime = Math.floor(Date.now() / 1000)
    const memoryData = await customStore.fetchMetric({
      expr: `node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",${filtered}}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",${filtered}}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",${filtered}}`,
      start: currentTime,
      end: currentTime,
      cluster: props.cluster,
    })
    handleDataList(memoryData)
  }

  const handleSortOption = e => {
    setSortMetric(e)
    if (e.includes('node')) {
      getNodeData({ sort_metric: e })
    } else if (e.includes('pod')) {
      getPodData({ sort_metric: e })
    } else if (e.includes('vm')) {
      if (e.includes('cpu')) {
        getCpuData('vm')
      } else if (e.includes('memory')) {
        getMemoryData('vm')
      }
    } else if (e.includes('kaas')) {
      if (e.includes('cpu')) {
        getCpuData('kaas')
      } else if (e.includes('memory')) {
        getMemoryData('kaas')
      }
    }
  }

  const handleTypeOption = e => {
    setTypeMetric(e)
    if (e == 'node') {
      setSortOption(sortOptionNode)
      handleSortOption(sortOptionNode[0].value)
    } else if (e == 'pod') {
      setSortOption(sortOptionPod)
      handleSortOption(sortOptionPod[0].value)
    } else if (e == 'vm') {
      setSortOption(sortOptionVm)
      handleSortOption(sortOptionVm[0].value)
    } else if (e == 'kaas') {
      setSortOption(sortOptionKaas)
      handleSortOption(sortOptionKaas[0].value)
    }
  }

  useEffect(() => {
    if (sortMetric.includes('cpu')) {
      setUnitType({ unit: 'cpu', value: t('RESOURCES_CPU_USAGE') })
    } else if (sortMetric.includes('memory')) {
      setUnitType({ unit: 'memory', value: t('RESOURCES_MEMORY_USAGE') })
    } else if (sortMetric.includes('disk')) {
      setUnitType({ unit: 'disk', value: t('RESOURCES_DISK_USAGE') })
    }
  }, [sortMetric])

  return (
    <>
      {/* <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content"> */}
      {/* grid_item */}
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_RESOURCE_USAGE_TOP')}</label>
        </div>
        <div className="grid_info style_list">
          <div className="select_wrap">
            <div className="d-flex align-start w-100">
              <div className="content-box" style={{ width: '60%' }}>
                <div className="select-list-box">
                  <div className="usageTab">
                    <Select
                      value={sortMetric}
                      onChange={e => handleSortOption(e)}
                      options={sortOption}
                    />
                  </div>
                </div>
              </div>
              <div className="content-box" style={{ width: '38%' }}>
                <div className="select-list-box">
                  <div className="usageTab">
                    <Select
                      value={typeMetric}
                      onChange={e => handleTypeOption(e)}
                      options={typeOption}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {list.length > 0 ? (
            <>
              {typeMetric == 'node' && (
                <Loading spinning={loading}>
                  <ul className="list_01">
                    {list.map((obj, idx) => (
                      <li className="li_type_01" key={idx}>
                        <div className="lft">
                          <i className="ico-type24-clusternode"></i>
                          <h6 className="list_title">
                            {obj.node}
                            <span>{get(obj, 'host_ip', '-')}</span>
                          </h6>
                        </div>
                        <div className="info">
                          <h6>
                            {Math.round(
                              (Number(get(obj, sortMetric)) || 0) * 100
                            )}
                            %<span>{unitType.value}</span>
                          </h6>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Loading>
              )}
              {typeMetric == 'pod' && (
                <Loading spinning={loading}>
                  <ul className="list_01">
                    {list.map((obj, idx) => (
                      <li className="li_type_01" key={idx}>
                        <div className="lft">
                          <i className="ico-type24-pod"></i>
                          <h6 className="list_title">{obj.pod}</h6>
                        </div>
                        <div className="info">
                          <h6>
                            {getSuitableValue(
                              Number(get(obj, sortMetric)) || 0,
                              unitType.unit
                            )}
                            <span>{unitType.value}</span>
                          </h6>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Loading>
              )}
              {(typeMetric == 'vm' || typeMetric == 'kaas') && (
                <Loading spinning={loading}>
                  <ul className="list_01">
                    {list.map((obj, idx) => (
                      <li className="li_type_01" key={idx}>
                        <div className="lft">
                          <i
                            className={`ico-type24-${
                              typeMetric == 'vm' ? 'vm' : 'container'
                            }`}
                          ></i>
                          <h6 className="list_title">{obj.name}</h6>
                        </div>
                        <div className="info">
                          <h6>
                            {unitType.unit == 'cpu'
                              ? ((Number(obj.usage) * 100).toFixed(2) || 0) +
                                '%'
                              : getSuitableValue(
                                  Number(obj.usage) || 0,
                                  unitType.unit
                                )}
                            <span>{unitType.value}</span>
                          </h6>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Loading>
              )}
            </>
          ) : (
            <div className="grid_text">
              <span>{t('RESOURCES_NO_DATA')}</span>
            </div>
          )}
        </div>
      </div>
      {/* </div>
      </div> */}
    </>
  )
}

export default UsageTop5
