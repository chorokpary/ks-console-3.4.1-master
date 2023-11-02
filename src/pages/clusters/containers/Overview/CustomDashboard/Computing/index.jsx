import React, { useEffect, useState } from 'react'
import Network from './Network'
import Template from './Template'
import NetworkStore from 'stores/resources/networks'
import RouterStore from 'stores/resources/routers'
import SriovStore from 'stores/resources/sriovs'
import FloatingIpStore from 'stores/resources/floatingip'
import VmStore from 'stores/resources/vms'
import SecurityGroupStore from 'stores/resources/securityGroups'
import LoadBalancerStore from 'stores/resources/loadbalancers'
import ImageStore from 'stores/resources/images'
import FlavorStore from 'stores/resources/flavors'
import HostDeviceStore from 'stores/resources/hostdevices'
import MediatedDeviceStore from 'stores/resources/mediateddevices'
import KeypairStore from 'stores/resources/keypairs'
import KaasStore from 'stores/resources/containerresource'
import KaasImageStore from 'stores/resources/containerimages'

const Computing = ({ computing }) => {
  const vmStore = new VmStore();
  const securityGroupStore = new SecurityGroupStore();
  const loadBalancerStore = new LoadBalancerStore();
  const networkStore = new NetworkStore();
  const routerStore = new RouterStore();
  const sriovStore = new SriovStore();
  const floatingIpStore = new FloatingIpStore();

  const [loading, setLoading] = useState(false)

  const [vmList, setVmList] = useState([])
  const [sgList, setSgList] = useState([])
  const [lbList, setLbList] = useState([])
  const [networkList, setNetworkList] = useState([])
  const [routerList, setRouterList] = useState([])
  const [sriovList, setSriovList] = useState([])
  const [floatingIpList, setFloatingIpList] = useState([])


  const imageStore = new ImageStore();
  const flavorStore = new FlavorStore();
  const hostDeviceStore = new HostDeviceStore();
  const mediatedDeviceStore = new MediatedDeviceStore();
  const keypairStore = new KeypairStore();
  const kaasStore = new KaasStore();
  const kaasImageStore = new KaasImageStore();

  const [imageList, setImageList] = useState([])
  const [flavorList, setFlavorList] = useState([])
  const [flavorDetailList, setFlavorDetailList] = useState([])
  const [hdList, setHdList] = useState([])
  const [mdList, setMdList] = useState([])
  const [keypairList, setKeypairList] = useState([])
  const [kaasList, setKaasList] = useState([])
  const [kaasIamgeList, setKaasImageList] = useState([])


  useEffect(() => {
    // ---------------------------- network ------------------------------
    const getData = async () => {
      setLoading(true)

      const vmlist = await vmStore.fetchList({ limit: 1000 })
      setVmList(vmlist)

      const networklist = await networkStore.fetchList({ limit: 1000 })
      setNetworkList(networklist)

      const routerlist = await routerStore.fetchList({ limit: 1000 })
      setRouterList(routerlist)

      const sriovlist = await sriovStore.fetchList({ limit: 1000 })
      setSriovList(sriovlist)

      const fiplist = await floatingIpStore.fetchList({ limit: 1000 })
      setFloatingIpList(fiplist)

      const sglist = await securityGroupStore.fetchList({ limit: 1000 })
      setSgList(sglist)

      const lblist = await loadBalancerStore.fetchList({ limit: 1000 })
      setLbList(lblist)


      // ---------------------------- template ------------------------------
      const imagelist = await imageStore.fetchList({ limit: 1000 })
      setImageList(imagelist)

      const flavorlist = await flavorStore.fetchList({ limit: 1000 })
      setFlavorList(flavorlist)

      const hdlist = await hostDeviceStore.fetchList({ limit: 1000 })
      setHdList(hdlist)

      const mdlist = await mediatedDeviceStore.fetchList({ limit: 1000 })
      setMdList(mdlist)

      const keypairlist = await keypairStore.fetchList({ limit: 1000 })
      setKeypairList(keypairlist)

      const kaaslist = await kaasStore.fetchList({ limit: 1000 })
      setKaasList(kaaslist)

      const kaasimagelist = await kaasImageStore.fetchList({ limit: 1000 })
      setKaasImageList(kaasimagelist)

      setLoading(false)
    };
    getData();

  }, [])

  useEffect(() => {
    if (flavorList.length > 0) {
      flavorList.map(async obj => {
        const detail = await flavorStore.fetchDetail({ name: obj.name })
        setFlavorDetailList(list => [...list, detail])
      })
    }
  }, [flavorList])


  return (
    <>
      {computing.computingNetwork &&
        <Network
          loading={loading}
          networkList={networkList}
          routerList={routerList}
          sriovList={sriovList}
          floatingIpList={floatingIpList}
          vmList={vmList}
          sgList={sgList}
          lbList={lbList}
          x={computing.computingNetwork.x}
          y={computing.computingNetwork.y}
          w={computing.computingNetwork.w}
          h={computing.computingNetwork.h}
        />
      }
      {computing.computingTemplate &&
        <Template
          loading={loading}
          vmList={vmList}
          imageList={imageList}
          flavorList={flavorList}
          flavorDetailList={flavorDetailList}
          hdList={hdList}
          mdList={mdList}
          keypairList={keypairList}
          kaasList={kaasList}
          kaasIamgeList={kaasIamgeList}
          x={computing.computingTemplate.x}
          y={computing.computingTemplate.y}
          w={computing.computingTemplate.w}
          h={computing.computingTemplate.h}
        />
      }
    </>
  )
}

export default Computing