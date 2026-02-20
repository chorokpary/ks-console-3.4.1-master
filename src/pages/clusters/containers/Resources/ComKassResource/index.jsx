import { get, isEmpty, find } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import Banner from 'components/Cards/Banner'
import { Card } from 'components/Base'
import { getChartData, getAreaChartOps, getZeroValues } from 'utils/monitoring'

import VmStore from 'stores/resources/vms'
import ResourceStore from 'stores/resources/containerresource'
import CustomStore from 'stores/monitoring/custom/monitor'

import { Controller as MonitoringController } from 'components/Cards/Monitoring'
import { SimpleArea, MediumArea } from 'components/Charts'

import styles from './index.scss'

const index = (props) => {

  const customStore = new CustomStore();
  const vmStore = new VmStore();
  const kaasStore = new ResourceStore();

  const [cpuDataCom, setCpuDataCom] = useState([]);
  const [memoryDataCom, setMemoryDataCom] = useState([]);
  const [inboundDataCom, setInboundDataCom] = useState({});
  const [outboundDataCom, setOutboundDataCom] = useState({});
  const [diskDataCom, setDiskDataCom] = useState([]);

  const [cpuDataKaas, setCpuDataKaas] = useState([]);
  const [memoryDataKaas, setMemoryDataKaas] = useState([]);
  const [inboundDataKaas, setInboundDataKaas] = useState({});
  const [outboundDataKaas, setOutboundDataKaas] = useState({});
  const [diskDataKass, setDiskDataKass] = useState([]);

  const getMinuteValue = (timeStr = '60s', hasUnit = true) => {
    const unit = timeStr.slice(-1)
    let value = parseFloat(timeStr)

    switch (unit) {
      default:
      case 's':
        break
      case 'm':
        value *= 60
        break
      case 'h':
        value *= 60 * 60
        break
      case 'd':
        value = value * 24 * 60 * 60
        break
    }
    return hasUnit ? `${value}s` : value
  }

  const getTimeRange = ({ step = '600s', times = 20 } = {}) => {
    const interval = parseFloat(step) * times
    const end = Math.floor(Date.now() / 1000)
    const start = Math.floor(end - interval)

    return { start, end }
  }

  const fetchData = async (params) => {

    // vm list
    const vmList = await vmStore.fetchList({ limit: 1000 })

    // kaas list
    const kaasVmList = await kaasStore.fetchMachinesAll({ limit: 1000 })

    let promsql_pod_vm_list = ""
    let vm_list_length = 0;
    vmList.map((obj) => {
      const vmName = get(obj, 'name')
      promsql_pod_vm_list += promsql_pod_vm_list != "" ? ("|" + vmName) : vmName;
      vm_list_length++;
    })
    let promsql_pod_kaas_vm_list = ""
    let kaas_vm_list_length = 0;
    kaasVmList.map((obj) => {
      const kaasVmName = get(obj, 'name')
      promsql_pod_kaas_vm_list += promsql_pod_kaas_vm_list != "" ? ("|" + kaasVmName + '.*') : kaasVmName + '.*';
      kaas_vm_list_length++;
    })

    const paramsData = Object.assign(params, {
      start: params.start,
      end: params.end,
      step: getMinuteValue(params.step),
      times: params.times,
    })

    if (!paramsData.start || !paramsData.end) {
      const timeRange = getTimeRange(paramsData)
      paramsData.start = timeRange.start
      paramsData.end = timeRange.end
    }

    const getVmCpuUsageData = async () => {
      const cpuDataCom = await customStore.fetchMetric({
        expr: `sum(1 - avg by (pod) (rate(node_cpu_seconds_total{service="launcher-node-exporter", mode="idle", pod=~"${promsql_pod_vm_list}"}[5m]))) / ${vm_list_length}`,
        ...paramsData,
      })
      const cpuDataKaas = await customStore.fetchMetric({
        expr: `sum(1 - avg by (pod) (rate(node_cpu_seconds_total{service="launcher-node-exporter", mode="idle", pod=~"${promsql_pod_kaas_vm_list}"}[5m]))) / ${kaas_vm_list_length}`,
        ...paramsData,
      })

      setCpuDataCom(cpuDataCom)
      setCpuDataKaas(cpuDataKaas)
    };

    // vm memory data
    const getVmMemoryUsageData = async () => {
      const memoryDataCom = await customStore.fetchMetric({
        expr: `sum(node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_vm_list}"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_vm_list}"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_vm_list}"}) / ${vm_list_length}`,
        ...paramsData,
      })

      const memoryDataKaas = await customStore.fetchMetric({
        expr: `sum(node_memory_MemTotal_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_kaas_vm_list}"}-node_memory_MemFree_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_kaas_vm_list}"}-node_memory_Cached_bytes{service='launcher-node-exporter',pod!~"virt-launcher-.*",pod=~"${promsql_pod_kaas_vm_list}"}) / ${kaas_vm_list_length}`,
        ...paramsData,
      })

      setMemoryDataCom(memoryDataCom)
      setMemoryDataKaas(memoryDataKaas)
    };

    // vm inbound data
    const getVmInboundData = async () => {
      const inboundDataCom = await customStore.fetchMetric({
        expr: `sum(irate(node_network_receive_bytes_total{service='launcher-node-exporter',device=~"^(net.*|eth.*|direct.*|ib.*)",pod=~"${promsql_pod_vm_list}"}[5m])) / ${vm_list_length}`,
        ...paramsData,
      })

      const inboundDataKaas = await customStore.fetchMetric({
        expr: `sum(irate(node_network_receive_bytes_total{service='launcher-node-exporter',device=~"^(net.*|eth.*|direct.*|ib.*)",pod=~"${promsql_pod_kaas_vm_list}"}[5m])) / ${kaas_vm_list_length}`,
        ...paramsData,
      })
      setInboundDataCom(inboundDataCom[0])
      setInboundDataKaas(inboundDataKaas[0])
    };

    // vm outbound data
    const getVmOutboundData = async () => {
      const outboundDataCom = await customStore.fetchMetric({
        expr: `sum(irate(node_network_transmit_bytes_total{service='launcher-node-exporter',device=~"^(net.*|eth.*|direct.*|ib.*)",pod=~"${promsql_pod_vm_list}"}[5m]))/ ${vm_list_length}`,
        ...paramsData,
      })

      const outboundDataKaas = await customStore.fetchMetric({
        expr: `sum(irate(node_network_transmit_bytes_total{service='launcher-node-exporter',device=~"^(net.*|eth.*|direct.*|ib.*)",pod=~"${promsql_pod_kaas_vm_list}"}[5m]))/ ${kaas_vm_list_length}`,
        ...paramsData,
      })

      setOutboundDataCom(outboundDataCom[0])
      setOutboundDataKaas(outboundDataKaas[0])
    };

    const getVmDiskUsageData = async () => {
      const diskDataCom = await customStore.fetchMetric({
        expr: `sum((100 - (((sum by(pod) (node_filesystem_avail_bytes{pod=~"${promsql_pod_vm_list}"})) / sum by(pod) (node_filesystem_size_bytes{pod=~"${promsql_pod_vm_list}"})) * 100)) / 100) / ${vm_list_length}`,
        ...paramsData,
      })

      const diskDataKass = await customStore.fetchMetric({
        expr: `sum((100 - (((sum by(pod) (node_filesystem_avail_bytes{pod=~"${promsql_pod_kaas_vm_list}"})) / sum by(pod) (node_filesystem_size_bytes{pod=~"${promsql_pod_kaas_vm_list}"})) * 100)) / 100) / ${kaas_vm_list_length}`,
        ...paramsData,
      })

      setDiskDataCom(diskDataCom)
      setDiskDataKass(diskDataKass)
    };

    getVmCpuUsageData();
    getVmMemoryUsageData();
    getVmInboundData();
    getVmOutboundData();
    getVmDiskUsageData();
  }

  const getMonitoringCfgsCom = () => {

    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend: ['CPU_USAGE'],
        data: cpuDataCom,
        graphType: 'm',
        dataType: 'cpu'
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: ['MEMORY_USAGE'],
        data: memoryDataCom,
        graphType: 'm',
        dataType: 'memory'
      },
      {
        type: 'bandwidth',
        title: '',
        unitType: 'bandwidth',
        legend: ['OUT', 'IN'],
        data: [outboundDataCom, inboundDataCom],
        graphType: 's',
        dataType: 'network'
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_DISK_USAGE'),
        unit: '%',
        legend: [t('RESOURCES_DISK_USAGE')],
        data: diskDataCom,
        graphType: 's',
        dataType: 'disk'
      },
    ]
  }

  const getMonitoringCfgsKaas = () => {

    return [
      {
        type: 'utilisation',
        title: 'CPU_USAGE',
        unit: '%',
        legend: ['CPU_USAGE'],
        data: cpuDataKaas,
        graphType: 'm',
        dataType: 'cpu'
      },
      {
        type: 'utilisation',
        title: 'MEMORY_USAGE',
        unit: '%',
        unitType: 'memory',
        legend: ['MEMORY_USAGE'],
        data: memoryDataKaas,
        graphType: 'm',
        dataType: 'memory'
      },
      {
        type: 'bandwidth',
        title: '',
        unitType: 'bandwidth',
        legend: ['OUT', 'IN'],
        data: [outboundDataKaas, inboundDataKaas],
        graphType: 's',
        dataType: 'network'
      },
      {
        type: 'utilisation',
        title: t('RESOURCES_DISK_USAGE'),
        unit: '%',
        legend: [t('RESOURCES_DISK_USAGE')],
        data: diskDataKass,
        graphType: 's',
        dataType: 'disk'
      },
    ]
  }

  const { isLoading, isRefreshing } = customStore
  const configs_com = getMonitoringCfgsCom()
  const configs_kaas = getMonitoringCfgsKaas()

  return (
    <>
      <Banner
        icon="linechart"
        title={t('RESOURCES_COMPUTING_KAAS_RESOURCE')}
        description={t('RESOURCES_COMPUTING_KAAS_RESOURCE_MONITORING_DESC')}
        module="computing-kaas"
      />


      <MonitoringController
        title={t('RESOURCES_COMPUTING_KAAS_RESOURCE')}
        onFetch={fetchData}
        loading={isLoading}
        refreshing={isRefreshing}
      >

        <div className={styles.headtext}>
          {t('RESOURCES_COMPUTING_RESOURCE_USAGE')}
        </div>
        <div className={styles.divwrap}>
          {configs_com.map((item, index) => {
            // const config = getAreaChartOps(item)
            const config = getAreaChartOps({
              ...item,
              data: isEmpty(item.data)
                ? [{ values: getZeroValues() }]
                : item.data,
            })
            if (item.type != "utilisation") return null
            if (item.graphType != "m") return null
            return (
              <div key={config.title} className={`${index % 2 == 1 ? styles.div_right : styles.div_left} ${styles.item}`}>
                <MediumArea width="100%" height={100} {...config} />
              </div>
            )
          })}
        </div>

        <div className={styles.headtext}>
          {t('RESOURCES_KAAS_RESOURCE_USAGE')}
        </div>
        <div className={styles.divwrap}>
          {configs_kaas.map((item, index) => {
            const config = getAreaChartOps({
              ...item,
              data: isEmpty(item.data)
                ? [{ values: getZeroValues() }]
                : item.data,
            })

            if (item.type != "utilisation") return null
            if (item.graphType != "m") return null
            return (
              <div key={config.title} className={`${index % 2 == 1 ? styles.div_right : styles.div_left} ${styles.item}`}>
                <MediumArea width="100%" height={100} {...config} />
              </div>
            )
          })}
        </div>

        <div className={styles.headtext}>
          {t('RESOURCES_COMPUTING_NETWORK_TRAFFIC')}
        </div>
        {(!!!inboundDataCom && !!!outboundDataCom) ?
          <div className={styles.divwrap}>
            <div className={styles.empty}>{t('NO_MONITORING_DATA')}</div>
          </div>
          :
          configs_com.map((item, index) => {
            const config = getAreaChartOps(item)

            if (isEmpty(config.data)) return null
            if (item.type != "bandwidth") return null
            return (
              <div className={styles.divwrap} key={config.title}>
                <SimpleArea width="100%" {...config} />
              </div>
            )
          })
        }


        <div className={styles.headtext}>
          {t('RESOURCES_KAAS_NETWORK_TRAFFIC')}
        </div>
        {(!!!inboundDataKaas && !!!outboundDataKaas) ?
          <div className={styles.divwrap}>
            <div className={styles.empty}>{t('NO_MONITORING_DATA')}</div>
          </div>
          :
          configs_kaas.map((item, index) => {
            const config = getAreaChartOps(item)

            if (isEmpty(config.data)) return null
            if (item.type != "bandwidth") return null
            return (
              <div className={styles.divwrap} key={config.title}>
                <SimpleArea width="100%" {...config} />
              </div>
            )

          })
        }

        <div className={styles.headtext}>
          {t('RESOURCES_COMPUTING_DISK_USAGE')}
        </div>
        {(diskDataCom.length == 0) ?
          <div className={styles.divwrap}>
            <div className={styles.empty}>{t('NO_MONITORING_DATA')}</div>
          </div>
          :
          configs_com.map((item, index) => {
            const config = getAreaChartOps(item)

            if (isEmpty(config.data)) return null
            if (item.type != "utilisation") return null
            if (item.dataType != "disk") return null
            return (
              <div className={styles.divwrap} key={config.title}>
                <SimpleArea width="100%" {...config} />
              </div>
            )
          })
        }

        <div className={styles.headtext}>
          {t('RESOURCES_KAAS_DISK_USAGE')}
        </div>
        {(diskDataKass.length == 0) ?
          <div className={styles.divwrap}>
            <div className={styles.empty}>{t('NO_MONITORING_DATA')}</div>
          </div>
          :
          configs_kaas.map((item, index) => {
            const config = getAreaChartOps(item)

            if (isEmpty(config.data)) return null
            if (item.type != "utilisation") return null
            if (item.dataType != "disk") return null
            return (
              <div className={styles.divwrap} key={config.title}>
                <SimpleArea width="100%" {...config} />
              </div>
            )
          })
        }
      </MonitoringController>
    </>
  );
};

export default inject('rootStore')(observer(index))

