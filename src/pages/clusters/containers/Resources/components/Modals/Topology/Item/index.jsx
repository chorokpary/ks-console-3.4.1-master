import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import * as common from 'utils/resources'

const TopologyItem = () => {
  
  return (
    <div className="content_box_wrap pop">
      <div className="pop_content" id="box">
        <div className="topology_wrap">
          <div id="box_zoom" className="topology_network_wrap">
            <ul className="topology_network">
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_01"></div><i className="ico-type-network-wh"></i>
                  <div className="name"><em>Internal</em><span>100.100.100.0/24</span></div>
                </div>
                <div className="network_line color_01"><span>kedcontainernetwork</span></div>
              </li>
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_02"></div><i className="ico-type-network-wh"></i>
                  <div className="name"><em className="ex">External</em><span>200.200.200.0/24</span></div>
                </div>
                <div className="network_line color_02"><span>network01</span></div>
              </li>
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_03"></div><i className="ico-type-sriov-wh"></i>
                  <div className="name"><em>Internal</em><span>300.300.300.0/24</span></div>
                </div>
                <div className="network_line color_03"><span>network02</span></div>
              </li>
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_04"></div><i className="ico-type-externalnetwork-wh"></i>
                  <div className="name"><em>Internal</em><span>400.400.400.0/24</span></div>
                </div>
                <div className="network_line color_04"><span>network03</span></div>
              </li>
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_05"></div><i className="ico-type-network-wh"></i>
                  <div className="name"><em>Internal</em><span>100.100.100.0/24</span></div>
                </div>
                <div className="network_line color_05"><span>network04</span></div>
              </li>
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_06"></div><i className="ico-type-network-wh"></i>
                  <div className="name"><em>Internal</em><span>600.600.600.0/24</span></div>
                </div>
                <div className="network_line color_06"><span>network05</span></div>
              </li>
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_07"></div><i className="ico-type-network-wh"></i>
                  <div className="name"><em>Internal</em><span>700.700.700.0/24</span></div>
                </div>
                <div className="network_line color_07"><span>network07</span></div>
              </li>
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_08"></div><i className="ico-type-network-wh"></i>
                  <div className="name"><em>Internal</em><span>800.800.800.0/24</span></div>
                </div>
                <div className="network_line color_08"><span>network08</span></div>
              </li>
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_09"></div><i className="ico-type-network-wh"></i>
                  <div className="name"><em>Internal</em><span>900.900.900.0/24</span></div>
                </div>
                <div className="network_line color_09"><span>network09</span></div>
              </li>
              <li className="network_bar">
                <div className="network_name">
                  <div className="hexagon_circle color_10"></div><i className="ico-type-network-wh"></i>
                  <div className="name"><em>Internal</em><span>1000.1000.1000.0/24</span></div>
                </div>
                <div className="network_line color_10"><span>network10</span></div>
              </li>
            </ul>

            <div className="network_element_wrap">
              <div className="network_element line_01">
                <div className="element left">
                  <div className="line"><span>10.10.10.1</span></div>
                  <div className="line"><span>10.10.10.1</span></div>
                </div>
                <div className="element info">
                  <h4>VM</h4>
                  <p>
                    <i className="ico-type24-vm on"></i>
                    <span>VM_ked_vm_01_abcdefghsfdgsdwefdsdfkl_swfedg<a href="#none" className="btn_go"></a></span>
                    <a href="#none" className="btn_go"></a>
                  </p>
                </div>
                <div className="element right">
                  <div className="line width_01 color_02"><span>20.10.10.1</span></div>
                  <div className="line width_02 color_03"><span>20.10.10.1</span></div>
                  <div className="line width_03 color_04"><span>30.10.10.1</span></div>
                  <div className="line width_04 color_05"><span>50.10.10.1</span></div>
                  <div className="line width_05 color_06"><span>50.20.10.1</span></div>
                  <div className="line width_05 color_06"><span>50.30.10.1</span></div>
                  <div className="line width_05 color_06"><span>50.40.10.1</span></div>
                </div>
              </div>
              <div className="network_element line_01">
                <div className="element left">
                  <div className="line bonding"><span>10.10.10.1</span></div>
                </div>
                <div className="element info">
                  <h4>VM</h4>
                  <p>
                    <i className="ico-type24-vm on"></i>
                    <span>VM_ked_vm_01_abcdefghsfdgsdwefdsdfkl_swfedg<a href="#none" className="btn_go"></a></span>
                  </p>
                  <div>
                    <i className="ico-type24-floatingip"></i>
                    <span>100.10.20.1</span>
                    <a href="#none" className="btn_go"></a>
                  </div>
                </div>
                <div className="element right"></div>
              </div>
              <div className="network_element line_01">
                <div className="element left">
                  <div className="line"><span>10.10.10.1</span></div>
                </div>
                <div className="element info">
                  <h4 className="type2">VRouter</h4>
                  <p>
                    <i className="ico-type24-router on"></i>
                    <span>VM_ked_vm_01_abcdefghsfdgsdwefdsdfkl_swfedg<a href="#none" className="btn_go"></a></span>
                    <a href="#none" className="btn_go"></a>
                  </p>
                </div>
                <div className="element right"></div>
              </div>
              <div className="network_element line_01">
                <div className="element left">
                  <div className="line"><span>10.10.10.1</span></div>
                </div>
                <div className="element info">
                  <h4 className="type3">Load balancer</h4>
                  <p>
                    <i className="ico-type24-loadbalancer on"></i>
                    <span>VM_ked_vm_01_abcdefghsfdgsdwefdsdfkl_swfedg<a href="#none" className="btn_go"></a></span>
                    <a href="#none" className="btn_go"></a>
                  </p>
                </div>
                <div className="element right"></div>
              </div>
              <div className="network_element line_02">
                <div className="element left">
                  <div className="line width_01 color_02"><span>20.10.10.1</span></div>
                  <div className="line width_01 color_02"><span>20.10.10.1</span></div>
                </div>
                <div className="element info">
                  <h4>VM</h4>
                  <p>
                    <i className="ico-type24-vm on"></i>
                    <span>VM_ked_vm_02<a href="#none" className="btn_go"></a></span>
                  </p>
                </div>
                <div className="element right">
                  <div className="line width_02 color_04"><span>20.10.10.1</span></div>
                </div>
              </div>
              <div className="network_element line_03">
                <div className="element left">
                  <div className="line width_01 color_03"><span>20.10.10.1</span></div>
                  <div className="line width_01 color_03"><span>20.10.10.1</span></div>
                </div>
                <div className="element info">
                  <h4>VM</h4>
                  <p>
                    <i className="ico-type24-vm on"></i>
                    <span>VM_ked_vm_03<a href="#none" className="btn_go"></a></span>

                  </p>
                </div>
                <div className="element right">
                  <div className="line width_01 color_04"><span>20.10.10.1</span></div>
                </div>
              </div>
              <div className="network_element line_04">
                <div className="element left">
                  <div className="line width_01 color_04"><span>20.10.10.1</span></div>
                </div>
                <div className="element info">
                  <h4>VM</h4>
                  <p>
                    <i className="ico-type24-vm on"></i>
                    <span>VM_ked_vm_04<a href="#none" className="btn_go"></a></span>
                  </p>
                </div>
                <div className="element right">
                  <div className="line width_01 color_05"><span>20.10.10.1</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul className="element_overview">
        <li>
          <i className="ico-type24-network"><span className="popover above">네트워크</span></i>
          <div className="text-wrapper">7</div>
        </li>
        <li>
          <i className="ico-type24-externalnetwork"><span className="popover above">외부네트워크</span></i>
          <div className="text-wrapper">2</div>
        </li>
        <li>
          <i className="ico-type24-sriov"><span className="popover above">SR-IOV</span></i>
          <div className="text-wrapper">1</div>
        </li>
        <li>
          <i className="ico-type24-vm"><span className="popover above">가상머신</span></i>
          <div className="text-wrapper">5</div>
        </li>
        <li>
          <i className="ico-type24-router"><span className="popover above">라우터</span></i>
          <div className="text-wrapper">2</div>
        </li>
        <li>
          <i className="ico-type24-floatingip"><span className="popover above">플로팅 IP</span></i>
          <div className="text-wrapper">2</div>
        </li>
        <li>
          <i className="ico-type24-loadbalancer"><span className="popover above">로드밸런서</span></i>
          <div className="text-wrapper">2</div>
        </li>
      </ul>
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
    </div>  
  )
}

export default TopologyItem