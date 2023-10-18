import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Card } from 'components/Base'
import { Button, Notify } from '@kube-design/components'

import styles from './index.scss'

import '../../../../Overview/CustomDashboard/custom_icon.css'
import '../../../../Overview/CustomDashboard/custom_style.css'

const Information = (props) => {

  const store = props.detailStore;

  return (
    <>  
        <div>
          <div className={styles.defaultWrapper}>
            <div className="content_box_wrap">
              <div className="tree_wrap">
                <div className="tree_box vm">
                  <div className="title_icon"><i className="ico-type40-vm on"></i></div>
                  <div className="cont_box1">
                    <h5><span>VM</span>Ked-vm</h5>
                    <div className="group">
                      <div className="info"><i className="ico-type24-arm"></i><span>ARM</span></div>
                      <div className="info"><i className="ico-os-ubuntu"></i><span>Ubuntu2023</span></div>
                    </div>
                  </div>
                  <div className="cont_box2">
                    <div className="title_icon none">Flavor</div>
                    <div className="data"><i className="ico-type24-cpu"></i>
                      <div className="info_text">
                        <h6>CPU</h6><span>1 Core</span>
                      </div>
                    </div>
                    <div className="data"><i className="ico-type24-memory"></i>
                      <div className="info_text">
                        <h6>메모리</h6><span>2 Gib</span>
                      </div>
                    </div>
                    <div className="data"><i className="ico-type24-disk"></i>
                      <div className="info_text">
                        <h6>디스크</h6><span>2 Gib</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="tree_box_wrap">
                  <li>
                    <div className="tree_box">
                      <div className="title_icon"><i className="ico-type40-hostdevice"></i></div>
                      <div className="cont_box1">
                        <h5><span className="bg_01">Host 디바이스</span>intel.com/x70</h5>
                        <div className="group"> 
                          <div className="info"><span>x70</span></div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="tree_box">
                      <div className="title_icon"><i className="ico-type40-mediateddevice"></i></div>
                      <div className="cont_box1">
                        <h5><span className="bg_02">Mediated 디바이스</span>intel.com/x70</h5>
                        <div className="group">
                          <div className="info"><span>x70</span></div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="tree_box">
                      <div className="title_icon"><i className="ico-type40-hostgpu"></i></div>
                      <div className="cont_box1">
                        <h5><span className="bg_01">Host 디바이스</span>Nvidia/GeForce GT 640</h5>
                        <div className="group"> 
                          <div className="info"><span>Longhorn</span></div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="tree_box">
                      <div className="title_icon"><i className="ico-type40-mediatedvgpu"></i></div>
                      <div className="cont_box1">
                        <h5><span className="bg_02">Mediated 디바이스</span>Nvidia/GeForce GT 640</h5>
                        <div className="group">
                          <div className="info"><span>Longhorn</span></div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="tree_box">
                      <div className="title_icon"><i className="ico-type40-volume"></i></div>
                      <div className="cont_box1">
                        <h5><span className="bg_03">Volume</span>DataVolume01</h5>
                        <div className="group">
                          <div className="info_2"><span>용량</span><p>50GB</p></div>
                          <div className="info_2"><span>접근모드</span><div className="info_box"><p>ReadWriteOnce</p><p>ReadOnlyMany</p><p>ReadWriteOnce</p></div></div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="tree_box">
                      <div className="title_icon"><i className="ico-type40-networkdevice"></i></div>
                      <div className="cont_box1">
                        <h5><span className="bg_04">NIC</span>eth01</h5>
                        <div className="group">
                          <div className="info_2"><span>IP</span><p>191.168.62.5</p></div>
                        </div>
                      </div>
                    </div>
                  </li>

                </ul>
              </div>

            </div>
          </div>
      </div>         
    </>
  );
};

export default inject('detailStore')(observer(Information))

