import React, { useRef, useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import * as common from 'utils/resources'

import { isEmpty, omit, get, find, some } from 'lodash'

import TopologyStore from 'stores/resources/topology'

import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

const TopologyItem = (props) => {

  const workspace = props.workspace;
  const cluster = props.cluster;
  const namespace = props.namespace;

  const store = new TopologyStore();

  const [vmList, setVmList] = useState([]);
  const [networkList, setNetworkList] = useState([]);
  const [sriovList, setSriovList] = useState([]);
  const [routerList, setRouterList] = useState([]);
  const [floatingList, setFloatingList] = useState([]);
  const [loadbalancerList, setLoadBalancerList] = useState([]);

  const [internalList, setInternalList] = useState([]);
  const [externalList, setExternalList] = useState([]);

  const [networkUnionList, setNetworkUnionList] = useState([]);
  const [networkElementsList, setNetworkElementsList] = useState([]);

  const closeModal = () => {
    props.closeModal();
  }

  useEffect(() => {
    var wrapHeight = document.querySelector('.network_element_wrap').offsetHeight;
    wrapHeight += 100;
    document.querySelector('.topology_network').style.height =  wrapHeight + 'px'
  })

  useEffect(() => {
    const getData = async () => {
      await store.fetchData({ workspace : workspace, cluster : cluster, namespace : namespace})

      setVmList((store.vmList).filter(item => item.project == namespace))
      setNetworkList((store.networkList).filter(item => item.project == namespace))
      setSriovList(store.sriovList)
      setRouterList((store.routerList).filter(item => item.project == namespace))
      setFloatingList((store.floatingList).filter(item => item.project == namespace))
      setLoadBalancerList((store.loadbalancerList).filter(item => item.project == namespace))

      const internalNetworkList = store.networkList?.filter((row) => (row.external == false && row.project == namespace));
      const externalNetworkList = store.networkList?.filter((row) => (row.external == true && row.project == namespace));

      setInternalList(internalNetworkList)
      setExternalList(externalNetworkList)
    }
    getData();
  }, [])

  useEffect(() => {
      const unionArray = [...networkList, ...sriovList];   

      unionArray.map((obj, index) => {
        const networkCheck = get(obj, "resource_name", "");
        const networkType = networkCheck == "" ? "N" : "S";
        obj.num = (index+1);
        obj.network_type = networkType;
      })
      // console.log("unionArray : "+ JSON.stringify(unionArray))
      setNetworkUnionList(unionArray);
     
  }, [networkList, sriovList])

  useEffect(() => {

    const getNetworkElementsData = async () => {
      Promise.all(          
        networkUnionList.map(async (obj) => {

          // sriov 와 network 구분해서 처리 해야 함
          const elementVmList = vmList.filter(item => obj.network_type == "N" ?_.find(item.networks, {'name':obj.id}) : _.find(item.networks, {'name':obj.name}))
          obj.elementVmList = elementVmList;

          const elementRouterList = obj.external ? routerList.filter(item => item.external?.name == obj.name) : routerList.filter(item => some(item.internal, { id : obj.id}));
          obj.elementRouterList = elementRouterList;

          const elementLoadBalancerList = loadbalancerList.filter(item => item.network?.id == obj.id)
          obj.elementLoadBalancerList = elementLoadBalancerList;
        })
      )
      setNetworkElementsList(networkUnionList);      
    }

    getNetworkElementsData();
  }, [networkUnionList, vmList, routerList, loadbalancerList])

  const getState = (state) => {
    if (state === 'Provisioning'
      || state === 'Starting'
      || state === 'Stopping'
      || state === 'Terminating'
      || state === 'Migrating') {
      return "unknown"
    } else if (state === 'Running') {
      return "on"
    } else if (state === 'Stopped' || state === 'Paused') {
      return "off"
    } else if (state === 'Unknown') {
      return "error"
    }else{
      return "error"
    }
  }

  const renderLeftMenu = () =>{
    return (
      <ul className="element_overview">
        <li>
          <i className="ico-type24-network"><span className="popover above">네트워크</span></i>
          <div className="text-wrapper">{internalList.length}</div>
        </li>
        <li>
          <i className="ico-type24-externalnetwork"><span className="popover above">외부네트워크</span></i>
          <div className="text-wrapper">{externalList.length}</div>
        </li>
        <li>
          <i className="ico-type24-sriov"><span className="popover above">SR-IOV</span></i>
          <div className="text-wrapper">{sriovList.length}</div>
        </li>
        <li>
          <i className="ico-type24-vm"><span className="popover above">가상머신</span></i>
          <div className="text-wrapper">{vmList.length}</div>
        </li>
        <li>
          <i className="ico-type24-router"><span className="popover above">라우터</span></i>
          <div className="text-wrapper">{routerList.length}</div>
        </li>
        <li>
          <i className="ico-type24-floatingip"><span className="popover above">플로팅 IP</span></i>
          <div className="text-wrapper">{floatingList.length}</div>
        </li>
        <li>
          <i className="ico-type24-loadbalancer"><span className="popover above">로드밸런서</span></i>
          <div className="text-wrapper">{loadbalancerList.length}</div>
        </li>
      </ul>
    )
  }

   const renderNetworkBarList = () => {

    const networkBaritems = networkUnionList.map((obj) => {

      const num = obj.num;
      const barNum = num < 10 ? "0"+num : num;
      const colorNum = (num % 10) < 1 ? "10" : "0"+(num % 10);

      const cidr = get(obj, "cidr", "-")
      const networkCheck = get(obj, "resource_name", "")
      const networkType = networkCheck == "" ? "N" : "S"

      const ternalCheck = get(obj, "external", false)
      const ternalType = networkType == "S" ? "" : ternalCheck ? "EXternal" : "Internal"; 
      const networkIcon = networkType == "S" ? "sriov" : ternalCheck ? "externalnetwork" : "network";

      return (
        <li className="network_bar">
          <div className="network_name">
            <div className={`hexagon_circle color_${colorNum}`}></div><i className={`ico-type-${networkIcon}-wh`}></i>
            <div className="name"><em>{ternalType}</em><span>{cidr}</span></div>
          </div>
          <div className={`network_line color_${colorNum}`}><span>{obj.name}</span></div>
        </li>
      )
    })

    if(networkBaritems.length < 5){
      const addElement = <li className='network_bar'></li> 
      const loopNum = 6 - networkBaritems.length;
      for(var i=0;i<loopNum;i++){
        networkBaritems.push(addElement)
      }      
    }
    
    return networkBaritems;

   }

   const vmDuplicationElements = () => {

    const vmArray = [];
    const duplicationArray = [];

    Promise.all(    
      networkElementsList.map((obj) => {    

        const num = obj.num;
        const barNum = num < 10 ? "0"+num : num;
        const colorNum = (num % 10) < 1 ? "10" : "0"+(num % 10);
        const networkType = obj.network_type;

          obj.elementVmList.length > 0 && obj.elementVmList.map((vm) => {

            const vmNetworkIp = (vm.networks).filter(network => network.name == obj.id).map(item => item.ip)

            if(vmArray.includes(vm.name)){          
              const duplicationJson = {
                vm_name : vm.name,
                num : num,                
                bar_num : barNum,
                color_num : colorNum,
                ip : vmNetworkIp,
                network_type : networkType
              }
              duplicationArray.push(duplicationJson)
            }else{
              vmArray.push(vm.name)
            }

          })
      })
    )

    return duplicationArray;

   }

   const routerDuplicationElements = () => {

    const routerArray = [];
    const duplicationArray = [];

    Promise.all(    
      networkElementsList.map((obj) => {    

        const num = obj.num;
        const barNum = num < 10 ? "0"+num : num;
        const colorNum = (num % 10) < 1 ? "10" : "0"+(num % 10);

          obj.elementRouterList.length > 0 && obj.elementRouterList.map((router) => {

            const vrouterIp = router.vrouter_ip;

            if(routerArray.includes(router.name)){          
              const duplicationJson = {
                router_name : router.name,
                num : num,                
                bar_num : barNum,
                color_num : colorNum,
                ip : vrouterIp
              }
              duplicationArray.push(duplicationJson)
            }else{
              routerArray.push(router.name)
            }

          })
      })
    )

    return duplicationArray;

   }

   const loadbalancerDuplicationElements = () => {

    const loadbalancerArray = [];
    const duplicationArray = [];

    Promise.all(    
      networkElementsList.map((obj) => {    

        const num = obj.num;
        const barNum = num < 10 ? "0"+num : num;
        const colorNum = (num % 10) < 1 ? "10" : "0"+(num % 10);

          obj.elementLoadBalancerList.length > 0 && obj.elementLoadBalancerList.map((loadbalancer) => {

            const virtual_ip = loadbalancer.virtual_ip;

            if(loadbalancerArray.includes(loadbalancer.name)){          
              const duplicationJson = {
                loadbalancer_name : loadbalancer.name,
                num : num,                
                bar_num : barNum,
                color_num : colorNum,
                ip : virtual_ip
              }
              duplicationArray.push(duplicationJson)
            }else{
              loadbalancerArray.push(loadbalancer.name)
            }

          })
      })
    )

    return duplicationArray;

   }

  
   const renderVmElements = () => {

    const duplicationVmList = vmDuplicationElements();

    const vmArray = [];
    const duplicationVmArray = [];

    const networkElementitems = networkElementsList.map((obj) => {

      const num = obj.num;
      const barNum = num < 10 ? "0"+num : num;
      const colorNum = (num % 10) < 1 ? "10" : "0"+(num % 10);

        return (

          // VM 연결
          obj.elementVmList.length > 0 && obj.elementVmList.map((vm) => {  

            const vmNetworkIp = (vm.networks).filter(network => network.name == obj.id).map(item => item.ip);
            const vmNetworkName = (vm.networks).filter(network => network.name == obj.id).map(item => item.name);
            
            const sriovCheck = (sriovList).map(item => item.name).includes(vmNetworkName.toString());
            const bondingLeft = !sriovCheck ? "" : "bonding";

            const rightElementsArray = duplicationVmList.filter(item => item.vm_name == vm.name);        

            if(!vmArray.includes(vm.name)){

              vmArray.push(vm.name);
              const floatingData = floatingList.filter(floating => floating.instance_name == vm.name)

              return (
                <div className={`network_element leftBar`}>
                  <div className="element left leftMargin" style={{"--marginleft": (num == 1 ? 0 : 370*(num-1))+"px"}}>
                    <div className={`line ${bondingLeft} color_${colorNum}`}><span>{vmNetworkIp}</span></div>
                  </div>
                  <div className="element info">
                    <h4>VM</h4>
                    <p>
                      <i className={`ico-type24-vm ${getState(vm.state)}`}></i>
                      <span>{vm.name}<a href={`/${workspace}/clusters/${cluster}/projects/${namespace}/vms/${vm.name}/${vm.id}`} className="btn_go" onClick={() => closeModal()}></a></span>
                    </p>
                    {floatingData.length > 0 &&
                      <div>
                        <i className="ico-type24-floatingip"></i>
                        <span>{get(floatingData[0], "floating_ip")}</span>
                      </div>
                   }
                  </div>
                  <div className="element right">
                    {                      
                      rightElementsArray.map((obj) => {
                        const rightWidth = (370*(Number(obj.num)-Number(num)-1)+100);
                        const bondingRight = obj.network_type == "N" ? "" : "bonding_r"
                        return (
                          <div className={`line rightWidth ${bondingRight} color_${obj.color_num}`} style={{"--rightwidth": (obj.num == 1 ? "100px" : rightWidth+"px")}}><span>{obj.ip[0]}</span></div>
                        )
                      })
                    }
                  </div>
                </div>
              )
            }else{
              duplicationVmArray.push(vm.name) ;
            }

          })         
        )       
    })

    return networkElementitems;
   
  }

  const renderRouterElements = () => {

    const duplicationRouterList = routerDuplicationElements();
    // console.log("duplicationRouterList : "+ JSON.stringify(duplicationRouterList))

    const roterArray = [];
    const duplicationRoterArray = [];

    const networkElementitems = networkElementsList.map((obj) => {

      const num = obj.num;
      const barNum = num < 10 ? "0"+num : num;
      const colorNum = (num % 10) < 1 ? "10" : "0"+(num % 10);

        return (

          //Router 연결
          obj.elementRouterList.length > 0 && obj.elementRouterList.map((router) => {  

            const vrouterIp = router.vrouter_ip;
            const rightElementsArray = duplicationRouterList.filter(item => item.router_name == router.name);
                
            if(!roterArray.includes(router.name)){

              roterArray.push(router.name)             

              return (
                <div className={`network_element leftBar`}>
                <div className="element left leftMargin" style={{"--marginleft": (num == 1 ? 0 : 370*(num-1))+"px"}}>
                  <div className={`line color_${colorNum}`}><span>{vrouterIp}</span></div>
                </div>
                <div className="element info">
                  <h4 className="type2">VRouter</h4>
                  <p>
                    <i className="ico-type24-router on"></i>
                    <span>{router.name}<a href={`/${workspace}/clusters/${cluster}/projects/${namespace}/routers/${router.name}/${router.id}`} className="btn_go" onClick={() => closeModal()}></a></span>
                  </p>
                </div>
                <div className="element right">
                    {
                      rightElementsArray.map((obj) => {
                        const rightWidth = (370*(Number(obj.num)-Number(num)-1)+100);
                        return (
                          <div className={`line rightWidth color_${obj.color_num}`} style={{"--rightwidth": (obj.num == 1 ? "100px" : rightWidth+"px")}}><span>{obj.ip}</span></div>
                        )
                      })
                    }
                </div>
              </div>
              )
            }else{
              duplicationRoterArray.push(router.name) ;
            }

          })

        )       
    })

    return networkElementitems;
   }


   const renderLoadbalancerElements = () => {
    
    const duplicationLoadbalancerList = loadbalancerDuplicationElements();

    const loadbalancerArray = [];
    const duplicationLoadbalancerArray = [];

    const networkElementitems = networkElementsList.map((obj) => {

      const num = obj.num;
      const barNum = num < 10 ? "0"+num : num;
      const colorNum = (num % 10) < 1 ? "10" : "0"+(num % 10);

        return (

          //Router 연결
          obj.elementLoadBalancerList.length > 0 && obj.elementLoadBalancerList.map((load) => {  

            const virtualIp = load.virtual_ip;
            const rightElementsArray = duplicationLoadbalancerList.filter(item => item.loadbalancer_name == load.name);
                
            if(!loadbalancerArray.includes(load.name)){

              loadbalancerArray.push(load.name)             

              return (
                <div className={`network_element leftBar`}>
                <div className="element left leftMargin" style={{"--marginleft": (num == 1 ? 0 : 370*(num-1))+"px"}}>
                  <div className={`line color_${colorNum}`}><span>{virtualIp}</span></div>
                </div>
                <div className="element info">
                  <h4 className="type2">Load balancer</h4>
                  <p>
                    <i className="ico-type24-router on"></i>
                    <span>{load.name}<a href={`/${workspace}/clusters/${cluster}/projects/${namespace}/loadBalancers/${load.name}/${load.id}`} className="btn_go" onClick={() => closeModal()}></a></span>
                  </p>
                </div>
                <div className="element right">
                    {
                      rightElementsArray.map((obj) => {
                        const rightWidth = (370*(Number(obj.num)-Number(num)-1)+100);
                        return (
                          <div className={`line rightWidth color_${obj.color_num}`} style={{"--rightwidth": (obj.num == 1 ? "100px" : rightWidth+"px")}}><span>{obj.ip}</span></div>
                        )
                      })
                    }
                </div>
              </div>
              )
            }else{
              duplicationLoadbalancerArray.push(load.name) ;
            }

          })

        )       
    })

    return networkElementitems;
   }



   const Controls = ({ zoomIn, zoomOut, resetTransform }) => (
    <>
      <div className="zoomin_icon">
          <button id="zoomIn" className="btn_zoom_icon" onClick={() => zoomIn()}>
            <i className="ico-plus"></i>
          </button>
          <button id="zoomOut" className="btn_zoom_icon" onClick={() => zoomOut()}>
            <i className="ico-minus"></i>
          </button>
          <button id="resetZoom" className="btn_zoom_icon" onClick={() => resetTransform()}>
            <i className="ico-reset"></i>
          </button>
          <div id="result"></div>
        </div>
    </>
  );


  return (


    <div className="content_box_wrap pop">
      <div className="pop_content" id="box">
        <div className="topology_wrap">

            <TransformWrapper
              initialScale={1}
              initialPositionX={10}
              initialPositionY={10}
              minScale={0.5}
              maxScale={10}
            >
              {(utils) => (
                <React.Fragment>
                  <Controls {...utils} />
                  <TransformComponent
                  onTransformChange={(transform) => console.log('Transform changed:', transform)}
                  >
                    <div id="box_zoom" className="topology_network_wrap">
                      {/* 네트워크 List 시작*/}
                      <ul className="topology_network">
                        {renderNetworkBarList()}
                      </ul>
                      {/* 네트워크 List 끝*/}

                      {/* 네트워크 연결 요소 시작*/}
                      <div className="network_element_wrap">  
                        {renderVmElements()}
                        {renderRouterElements()}
                        {renderLoadbalancerElements()}
                      </div>
                      {/* 네트워크 연결 요소 끝*/} 
                    </div>                     
                  </TransformComponent>
                </React.Fragment>
              )}
            </TransformWrapper>

        </div>
      </div>

      {/* left menu */}
      {renderLeftMenu()}
      
    </div>  
  )
}

export default TopologyItem