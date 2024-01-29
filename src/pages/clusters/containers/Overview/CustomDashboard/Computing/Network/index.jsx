import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import NetworkPanel from './NetworkPanel'
import RouterPanel from './RouterPanel'
import SriovPanel from './SriovPanel'
import FloatingIpPanel from './FloatingIpPanel'
import SecurityGroupPanel from './SecurityGroupPanel'
import LbPanel from './LbPanel'

const ComputingNetwork = ({
  loading,
  networkList,
  routerList,
  sriovList,
  floatingIpList,
  vmList,
  sgList,
  lbList,
  x, y, w, h
}) => {

  const [lb, setLb] = useState({ used: 0, unused: 0 })
  const [sg, setSg] = useState({ used: 0, unused: 0 })
  const [floatingIp, setFloatingIp] = useState({ used: 0, unused: 0 })
  const [network, setNetwork] = useState({ internal: 0, external: 0 })
  const [router, setRouter] = useState({ internal: 0, external: 0 })
  const [sriov, setSriov] = useState({ internal: 0, external: 0 })

  useEffect(() => {
    if (floatingIpList.length > 0) {
      let used = 0;
      let unused = 0;
      floatingIpList.map(obj => (
        obj.instance_type ? used++ : unused++
      ))
      setFloatingIp({ used, unused })
    }
  }, [floatingIpList])

  useEffect(() => {
    if (networkList.length > 0) {
      let external = 0;
      let internal = 0;
      networkList.map(obj => (
        obj.external ? external++ : internal++
      ))
      setNetwork({ external, internal })
    }
  }, [networkList])

  useEffect(() => {
    if (routerList.length > 0) {
      let external = 0;
      let internal = 0;
      routerList.map(obj => {
        obj.external ? external++ : '';
        obj.internal.length > 0 ? internal++ : '';
      })
      setRouter({ external, internal })
    }
  }, [routerList])

  useEffect(() => {
    if (sriovList.length > 0) {
      let external = 0;
      let internal = sriovList.length;
      setSriov({ external, internal })
    }
  }, [sriovList])

  useEffect(() => {
    if (sgList.length > 0) {
      var hs = new Set()
      vmList.map(obj => {
        obj['security_groups']?.map(el => (
          hs.add(el)
        ))
      })
      setSg({ used: hs.size, unused: sgList.length - hs.size })
    }
  }, [vmList, sgList])

  useEffect(() => {
    if (lbList.length > 0) {
      let unused = 0;
      let used = lbList.length;
      setLb({ used, unused })
    }
  }, [lbList])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_COMPUTING_NETWORK_CURRENT_SITUATION')}</label>
              <div className="right">
                {/* <i className="ico-btn-trash"></i> */}
              </div>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_status box_nth">
                <NetworkPanel network={network} />
                <SriovPanel sriov={sriov} />
                <RouterPanel router={router} />
                <LbPanel lb={lb} />
                <SecurityGroupPanel sg={sg} />
                <FloatingIpPanel floatingIp={floatingIp} />
              </div>
            </Loading>
          </div>
        </div>
      </div>
    </>
  )
}

export default ComputingNetwork