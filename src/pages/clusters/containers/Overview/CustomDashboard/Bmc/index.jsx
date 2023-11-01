import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'

import * as common from 'utils/resources'
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
    const getNodeData = async () => {
      const data = await bareMetalStore.fetchList()
      console.log('node : ', data)
      setNodeData(data)
    };
    getNodeData();

    const getMetricType = async () => {
      const data = await customStore.fetchMetric({
        expr: `max by(instance, machine) (node_uname_info)`,
      })
      console.log('type : ', data)
      setMetricType(data)
    };
    getMetricType();

    const getMetricData = async () => {
      const data = await customStore.fetchMetric({
        expr: `avg by(instance) (redfish_chassis_power_powersupply_last_power_output_watts)`,
      })
      console.log('data : ', data)
      setMetricData(data)
    };
    getMetricData();

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
      setUseKwh(common.fnAddCommar(total_power))
      setArmKwh(common.fnAddCommar(total_arm_power))
      setX86Kwh(common.fnAddCommar(total_x86_power))

      // CO2 발생량
      setUseCo2((Math.round((total_power * 0.4781) / 0.1) * 0.1).toFixed(1))
      setArmCo2((Math.round((total_arm_power * 0.4781) / 0.1) * 0.1).toFixed(1))
      setX86Co2((Math.round((total_x86_power * 0.4781) / 0.1) * 0.1).toFixed(1))

      // 필요소나무
      setUseTree((Math.round((total_power * 0.1157625) / 0.1) * 0.1).toFixed(1))
      setArmTree((Math.round((total_arm_power * 0.1157625) / 0.1) * 0.1).toFixed(1))
      setX86Tree((Math.round((total_x86_power * 0.1157625) / 0.1) * 0.1).toFixed(1))

      const armPrice = (total_arm_power * 111.16).toFixed(0)
      const x86Price = (total_x86_power * 111.16).toFixed(0)

      setUsePrice(common.fnAddCommar(Number(armPrice) + Number(x86Price)))
      setArmPrice(common.fnAddCommar(armPrice))
      setX86Price(common.fnAddCommar(x86Price))
    }

  }, [nodeData, metricType, metricData])

  const getCo2 = () => {

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
        />
      }

      {/* 탄소 지표 */}
      {bmc.carbonIndicator &&
        <CabonIndicator
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
        />
      }

      {/* CPU 소비 전력량 비교 (1대 평균) */}
      {bmc.cpuPower &&
        <CpuPower
          x={bmc.cpuPower.x}
          y={bmc.cpuPower.y}
          w={bmc.cpuPower.w}
          h={bmc.cpuPower.h}
        />
      }

      {/* 탄소 발자국 - 전력 사용량 */}
      {bmc.carbonPower &&
        <CarbonPower
          x={bmc.carbonPower.x}
          y={bmc.carbonPower.y}
          w={bmc.carbonPower.w}
          h={bmc.carbonPower.h}
        />
      }
      {/* 탄소 발자국 - CO2 발생량 */}
      {bmc.carbonCo2 &&
        <CarbonCo2
          x={bmc.carbonCo2.x}
          y={bmc.carbonCo2.y}
          w={bmc.carbonCo2.w}
          h={bmc.carbonCo2.h}
        />
      }
      {/* 탄소 발자국 - 나무 */}
      {bmc.carbonTree &&
        <CarbonTree
          x={bmc.carbonTree.x}
          y={bmc.carbonTree.y}
          w={bmc.carbonTree.w}
          h={bmc.carbonTree.h}
        />
      }
      {/* 탄소 발자국 - 비용 */}
      {bmc.carbonCost &&
        <CarbonCost
          x={bmc.carbonCost.x}
          y={bmc.carbonCost.y}
          w={bmc.carbonCost.w}
          h={bmc.carbonCost.h}
        />
      }
    </>
  )
}

export default Bmc