import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

import BareMetalStore from 'stores/resources/baremetal'
import CustomStore from 'stores/monitoring/custom/monitor'
import { get } from 'lodash'
import { getLocalTime } from 'utils'
import CabonIndicator from './CabonIndicator';
import PowerUsageTop5 from './PowerUsageTop5';
import CpuPower from './CpuPower';
import CarbonPower from './CarbonPower';
import CarbonCo2 from './CarbonCo2';
import CarbonTree from './CarbonTree';
import CarbonCost from './CarbonCost'
import BmcNode from './BmcNode'

const Bmc = ({ bmc }) => {

  const bareMetalStore = new BareMetalStore();
  const customStore = new CustomStore();

  const [loading, setLoading] = useState(false)
  const [nodeData, setNodeData] = useState([])
  const [metricType, setMetricType] = useState([])
  const [metricData, setMetricData] = useState([])

  const [serverTotalCount, setServerTotalCount] = useState(0)
  const [armServerCount, setArmServerCount] = useState(0)
  const [x86ServerCount, setX86ServerCount] = useState(0)

  const [useKwh, setUseKwh] = useState(0)
  const [armKwh, setArmKwh] = useState(0)
  const [x86Kwh, setX86Kwh] = useState(0)

  const [useCo2, setUseCo2] = useState(0)
  const [armCo2, setArmCo2] = useState(0)
  const [x86Co2, setX86Co2] = useState(0)

  const [useTree, setUseTree] = useState(0)
  const [armTree, setArmTree] = useState(0)
  const [x86Tree, setX86Tree] = useState(0)

  const [usePrice, setUsePrice] = useState(0)
  const [armPrice, setArmPrice] = useState(0)
  const [x86Price, setX86Price] = useState(0)

  const [usedArmCnt, setUsedArmCnt] = useState(0)
  const [usedX86Cnt, setUsedX86Cnt] = useState(0)

  useEffect(() => {
    let cleanupTrigger = true;
    const getData = async () => {
      setLoading(true)

      try {
        const data = await bareMetalStore.fetchList()

        const getMetricType = await customStore.fetchMetric({
          expr: `max by(instance, machine) (node_uname_info)`,
        })

        const getMetricData = await customStore.fetchMetric({
          expr: `avg by(instance) (redfish_chassis_power_powersupply_last_power_output_watts)`,
        })
        if (cleanupTrigger) {
          setNodeData(data)
          setMetricType(getMetricType)
          setMetricData(getMetricData)

          setLoading(false)
        }
      } catch (e) {
        setLoading(false)
      }
    };
    getData();
    return () => {
      cleanupTrigger = false
      setLoading(false)
    }

  }, [])

  useEffect(() => {
    if (nodeData.length > 0) {
      let total_x86_count = 0;
      let total_arm_count = 0;

      let total_power = 0;
      let total_x86_power = 0;
      let total_arm_power = 0;

      let used_x86_cnt = 0;
      let used_arm_cnt = 0;
      nodeData.map(obj => {
        const type_data = metricType.find(item => (get(item, 'metric.instance').split(":")[0] === obj.ip))

        const type = get(type_data, 'metric.machine', '')

        if (metricType.length > 0) {
          type.includes('x86') ? total_x86_count += 1 : total_arm_count += 1;
        }

        if (metricData.length > 0) {

          const power_data = metricData.find(item => (get(item, 'metric.instance').split(":")[0] === obj.ip))
          const power = Number(get(power_data, 'value[1]', 0));

          total_power += power;
          if (type.includes('x86')) {
            total_x86_power += power
            used_x86_cnt += 1
          } else {
            total_arm_power += power;
            used_arm_cnt += 1
          }
        }
      })
      setUsedX86Cnt(used_x86_cnt)
      setUsedArmCnt(used_arm_cnt)

      setServerTotalCount(total_arm_count + total_x86_count)
      setArmServerCount(total_arm_count)
      setX86ServerCount(total_x86_count)

      total_power *= 0.001
      total_arm_power *= 0.001
      total_x86_power *= 0.001

      // 전기 사용량
      setUseKwh(total_power)
      setArmKwh(total_arm_power)
      setX86Kwh(total_x86_power)

      // CO2 발생량
      setUseCo2(getCo2(total_power))
      setArmCo2(getCo2(total_arm_power))
      setX86Co2(getCo2(total_x86_power))

      // 필요소나무
      setUseTree(getTree(total_power))
      setArmTree(getTree(total_arm_power))
      setX86Tree(getTree(total_x86_power))

      const armPrice = getCost(total_arm_power)
      const x86Price = getCost(total_x86_power)

      setUsePrice(Number(armPrice) + Number(x86Price))
      setArmPrice(armPrice)
      setX86Price(x86Price)
    }

  }, [nodeData, metricType, metricData])

  const getCo2 = (num) => {
    return (Math.round((num * 0.4781) / 0.1) * 0.1).toFixed(1)
  }

  const getTree = (num) => {
    return (Math.round((num * 0.1157625) / 0.1) * 0.1).toFixed(1)
  }

  const getCost = (num) => {
    return (num * 111.16).toFixed(0)
  }

  return (
    <>
      {/* BMC 노드 현황 */}
      {bmc.bmcNode &&
        <BmcNode
          x={bmc.bmcNode.x}
          y={bmc.bmcNode.y}
          w={bmc.bmcNode.w}
          h={bmc.bmcNode.h}
          nodeData={nodeData}
        />
      }

      {/* 탄소 지표 */}
      {bmc.carbonIndicator &&
        <CabonIndicator
          loading={loading}

          x={bmc.carbonIndicator.x}
          y={bmc.carbonIndicator.y}
          w={bmc.carbonIndicator.w}
          h={bmc.carbonIndicator.h}
          serverTotalCount={serverTotalCount}
          armServerCount={armServerCount}
          x86ServerCount={x86ServerCount}

          useKwh={useKwh}
          armKwh={armKwh}
          x86Kwh={x86Kwh}

          useCo2={useCo2}
          armCo2={armCo2}
          x86Co2={x86Co2}

          useTree={useTree}
          armTree={armTree}
          x86Tree={x86Tree}

          usePrice={usePrice}
          armPrice={armPrice}
          x86Price={x86Price}
        />
      }
      {/* 전력 사용량 TOP 5 */}
      {bmc.powerUsageTop5 &&
        <PowerUsageTop5
          x={bmc.powerUsageTop5.x}
          y={bmc.powerUsageTop5.y}
          w={bmc.powerUsageTop5.w}
          h={bmc.powerUsageTop5.h}
          nodeData={nodeData}
        />
      }

      {/* CPU 소비 전력량 비교 (1대 평균) */}
      {bmc.cpuPower &&
        <CpuPower
          x={bmc.cpuPower.x}
          y={bmc.cpuPower.y}
          w={bmc.cpuPower.w}
          h={bmc.cpuPower.h}
          nodeData={nodeData}
        />
      }

      {/* 탄소 발자국 - 전력 사용량 */}
      {bmc.carbonPower &&
        <CarbonPower
          loading={loading}
          x={bmc.carbonPower.x}
          y={bmc.carbonPower.y}
          w={bmc.carbonPower.w}
          h={bmc.carbonPower.h}
          armUsage={armKwh / usedArmCnt}
          x86Usage={x86Kwh / usedX86Cnt}
        />
      }
      {/* 탄소 발자국 - CO2 발생량 */}
      {bmc.carbonCo2 &&
        <CarbonCo2
          loading={loading}
          x={bmc.carbonCo2.x}
          y={bmc.carbonCo2.y}
          w={bmc.carbonCo2.w}
          h={bmc.carbonCo2.h}
          armCo2={getCo2(armKwh / usedArmCnt)}
          x86Co2={getCo2(x86Kwh / usedX86Cnt)}
        />
      }
      {/* 탄소 발자국 - 나무 */}
      {bmc.carbonTree &&
        <CarbonTree
          loading={loading}
          x={bmc.carbonTree.x}
          y={bmc.carbonTree.y}
          w={bmc.carbonTree.w}
          h={bmc.carbonTree.h}
          armTree={getTree(armKwh / usedArmCnt)}
          x86Tree={getTree(x86Kwh / usedX86Cnt)}
        />
      }
      {/* 탄소 발자국 - 비용 */}
      {bmc.carbonCost &&
        <CarbonCost
          loading={loading}
          x={bmc.carbonCost.x}
          y={bmc.carbonCost.y}
          w={bmc.carbonCost.w}
          h={bmc.carbonCost.h}
          armCost={getCost(armKwh / usedArmCnt)}
          x86Cost={getCost(x86Kwh / usedX86Cnt)}
        />
      }
    </>
  )
}

export default Bmc