import React, { useRef, useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import * as common from 'utils/resources'

import { isEmpty, omit, get, find } from 'lodash'

import TopologyStore from 'stores/resources/topology'

import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

const TopologyItem = (props) => {

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
      await store.fetchData()

      setVmList(store.vmList)
      setNetworkList(store.networkList)
      setSriovList(store.sriovList)
      setRouterList(store.routerList)
      setFloatingList(store.floatingList)
      setLoadBalancerList(store.loadbalancerList)

      const internalNetworkList = store.networkList?.filter((row) => row.external == false);
      const externalNetworkList = store.networkList?.filter((row) => row.external == true);

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

      setNetworkUnionList(unionArray);
     
  }, [networkList, sriovList])

  useEffect(() => {

    const getNetworkElementsData = async () => {
      Promise.all(          
        networkUnionList.map(async (obj) => {

          // sriov 와 network 구분해서 처리 해야 함
          const elementVmList = vmList.filter(item => _.find(item.networks, {'name':obj.name}))
          obj.elementVmList = elementVmList;

          const elementRouterList = obj.external ? routerList.filter(item => item.external == obj.name) : routerList.filter(item => (item.internal).includes(obj.name));
          obj.elementRouterList = elementRouterList;

          const elementLoadBalancerList = loadbalancerList.filter(item => item.network == obj.name)
          obj.elementLoadBalancerList = elementLoadBalancerList;
        })
      )
      setNetworkElementsList(networkUnionList);      
    }

    getNetworkElementsData();
  }, [networkUnionList, vmList, routerList, loadbalancerList])

  // useEffect(() => {

  //   var dragScroll = false;
  //   var x, y, pre_x, pre_y;
  //   var zoomLevel = 1;
  //   var zoomStep = 0.1;
  //   var box = document.getElementById('box');
  //   var box_zoom = document.getElementById('box_zoom');
  //   var result = document.getElementById('result');
  //   var zoomInButton = document.getElementById('zoomIn');
  //   var zoomOutButton = document.getElementById('zoomOut');
  //   var resetZoomButton = document.getElementById('resetZoom');
  //   var initialScrollLeft = 0;
  //   var initialScrollTop = 0;
  //   var initialBoxZoomPosition = { left: 0, top: 0 };

  //   box_zoom.style.border ="1px solid red"
   
  //   function updateZoomDisplay() {
  //     result.innerHTML = (zoomLevel * 100).toFixed(0) + '%';
  //   }
   
  //   function zoomIn() {
  //     if(zoomLevel.toFixed(1) >= 2){ 
  //       return false;
  //     };
  //     updateZoom(1);
  //   }
   
  //   function zoomOut() {
  //      if(zoomLevel.toFixed(1) <= 0.1){ 
  //       return false;
  //     };
  //     updateZoom(-1);
  //   }
   
  //   function updateZoom(direction) {      
  //     initialScrollLeft = box.scrollLeft;
  //     initialScrollTop = box.scrollTop;
  //     zoomLevel += direction * zoomStep;      
  //     box_zoom.style.transform = 'scale(' + zoomLevel + ')';
  //     box.scrollLeft = initialScrollLeft;
  //     box.scrollTop = initialScrollTop;


  //       // box_zoom.style.left = '100px';
  //       // box_zoom.style.top =  '100px';

   
  //     // box_zoom.style.left = (direction === 1)
  //     //   ? parseInt(box_zoom.style.left || 0) + 550 + 'px'
  //     //   : parseInt(box_zoom.style.left || 0) - 0 + 'px';
  //     // box_zoom.style.top = (direction === 1)
  //     //   ? parseInt(box_zoom.style.top || 0) + 50 + 'px'
  //     //   : parseInt(box_zoom.style.top || 0) + 0 + 'px';
   
  //     // if (zoomLevel <= 0.6) {
  //     //   box_zoom.style.left = parseInt(box_zoom.style.left || 0) - 100 + 'px';
  //     //   box_zoom.style.top = parseInt(box_zoom.style.top || 0) - 50 + 'px';
  //     // }
   
  //     updateZoomDisplay();
  //   }
   
  //   function resetZoom() {
  //     console.log("initialBoxZoomPosition : "+ initialBoxZoomPosition.left)
  //     console.log("initialBoxZoomPosition : "+ initialBoxZoomPosition.top)
  //     zoomLevel = 1;
  //     box_zoom.style.transform = 'scale(1)';
  //     box.scrollLeft = initialScrollLeft;
  //     box.scrollTop = initialScrollTop;
  //     box_zoom.style.left = initialBoxZoomPosition.left + 'px';
  //     box_zoom.style.top = initialBoxZoomPosition.top + 'px';
  //     updateZoomDisplay();
  //   }
   
  //   zoomInButton.addEventListener('click', zoomIn);
  //   zoomOutButton.addEventListener('click', zoomOut);
  //   resetZoomButton.addEventListener('click', resetZoom);
   
  //   box.addEventListener('mousedown', function (e) {
  //     dragScroll = true;
  //     x = box.scrollLeft;
  //     y = box.scrollTop;
  //     pre_x = e.screenX;
  //     pre_y = e.screenY;
  //     box.style.cursor = "move";
  //   });
   
  //   box.addEventListener('mousemove', function (e) {
  //     if (dragScroll) {
  //       box.scrollLeft = x - e.screenX + pre_x;
  //       box.scrollTop = y - e.screenY + pre_y;
  //       e.preventDefault();
  //     }
  //   });
   
  //   function endDragScroll() {
  //     dragScroll = false;
  //     box.style.cursor = "default";
  //   }
   
  //   box.addEventListener('mouseup', endDragScroll);
  //   document.body.addEventListener('mouseup', endDragScroll);
   
  //   initialBoxZoomPosition.left = parseInt(box_zoom.style.left || 0);
  //   initialBoxZoomPosition.top = parseInt(box_zoom.style.top || 0);
   
  //   updateZoomDisplay();

  // },[])

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

  const renderZoon = () => {
    return (
      <div className="zoomin_icon">
        <button id="zoomIn" className="btn_zoom_icon">
          <i className="ico-plus"></i>
        </button>
        <button id="zoomOut" className="btn_zoom_icon">
          <i className="ico-minus"></i>
        </button>
        <button id="resetZoom" className="btn_zoom_icon">
          <i className="ico-reset"></i>
        </button>
        <div id="result"></div>
      </div>
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
      const ternalType = ternalCheck ? "EXternal" :"Internal";

      const networkIcon = networkType == "S" ? "sriov" : ternalCheck ? "externalnetwork" : "network";

      return (
        <li className="network_bar">
          <div className="network_name">
            <div className={`hexagon_circle color_${colorNum}`}></div><i className={`ico-type-${networkIcon}-wh`}></i>
            <div className="name"><em>{ternalType}</em><span>{cidr}</span></div>
            {/* <div className="name"><em>{ternalType}</em><span>{barNum}</span></div> */}
          </div>
          <div className={`network_line color_${colorNum}`}><span>{obj.name}</span></div>
        </li>
      )
    })

    return networkBaritems;

   }

   const vmDuplicationElements = (name) => {

    const vmArray = [];
    const duplicationArray = [];

    Promise.all(    
      networkElementsList.map((obj) => {    

        const num = obj.num;
        const barNum = num < 10 ? "0"+num : num;
        const colorNum = (num % 10) < 1 ? "10" : "0"+(num % 10);
        const networkType = obj.network_type;

          obj.elementVmList.length > 0 && obj.elementVmList.map((vm) => {

            const vmNetworkIp = (vm.networks).filter(network => network.name == obj.name).map(item => item.ip)

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

   const routerDuplicationElements = (name) => {

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

   const loadbalancerDuplicationElements = (name) => {

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
            
            const vmNetworkIp = (vm.networks).filter(network => network.name == obj.name).map(item => item.ip);
            const vmNetworkName = (vm.networks).filter(network => network.name == obj.name).map(item => item.name);
            
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
                      <span>{vm.name}<a href={`/clusters/default/vms/${vm.name}`} className="btn_go" onClick={() => closeModal()}></a></span>
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
                    <span>{router.name}<a href={`/clusters/default/routers/${router.name}`} className="btn_go" onClick={() => closeModal()}></a></span>
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
                    <span>{load.name}<a href={`/clusters/default/loadBalancers/${load.name}`} className="btn_go" onClick={() => closeModal()}></a></span>
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
      
      {/* Zoon In/Out */}
      {/* {renderZoon()} */}

    </div>  
  )
}

export default TopologyItem