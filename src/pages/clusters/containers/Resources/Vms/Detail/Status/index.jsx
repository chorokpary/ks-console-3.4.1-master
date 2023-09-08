import { get, groupBy, isEmpty } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import axios from "axios";
import { Panel, Text } from 'components/Base'
import { Icon, Button, Notify } from '@kube-design/components'
import { TinyArea } from 'components/Charts'

import styles from './index.scss'

import * as common from 'utils/resources'
import { getAreaChartOps } from 'utils/monitoring'

import DetailSecurityGroupList from 'pages/clusters/containers/Resources/components/DetailSecurityGroupList'

const Status = (props) => {

  const store = props.detailStore;
  // console.log("store : "+ JSON.stringify(store))

  const [detailFlavor, setDetailFlavor] = useState(null);
  const [detailNetwork, setDetailNetwork] = useState([]);
  const [detailSecurityGroup, setDetailSecurityGroup] = useState([]);
  const [detailVolume, setDetailVolume] = useState([]);

  useEffect(() => {

      const fnGetFlavor = async () => {
        const response = await axios.get(`/edgetron/resources/kubevirt/flavors/${store.detail.vm?.flavor?.name}`);
        setDetailFlavor(response.data.flavor);
      };

      const fnGetNetwork = async () => {
        setDetailNetwork([]);
        const promises = (store.detail.vm.networks).map(async (network) => {
          if (network.name != "k8s-pod-network") {
            const networkDetail = await axios.get("/edgetron/resources/kubevirt/networks/" + network.name);
            setDetailNetwork(detailNetwork => [...detailNetwork, networkDetail.data.network])
          }
        })
        await Promise.all(promises);
      };

      const fnGetSecurityGroup = async () => {
        setDetailSecurityGroup([]);
        const promises = (store.detail.vm.security_groups).map(async (name) => {
          const securityDetail = await axios.get("/edgetron/resources/kubevirt/security_groups/" + name);
          securityDetail.data.security_group.egress_count = (securityDetail.data.security_group.rules).filter(el => el.direction == "egress").length;
          securityDetail.data.security_group.ingress_count = (securityDetail.data.security_group.rules).filter(el => el.direction == "ingress").length;
          setDetailSecurityGroup(detailSecurityGroup => [...detailSecurityGroup, securityDetail.data.security_group])
        })
        await Promise.all(promises);
      };

      const fnGetVolume = async () => {
        // const response = await axios.get(`/edgetron/resources/kubevirt/volumes`);
        // const volumeData = (response.volumes).filter(el => el.used_by_vmi == name);
        const volumeData = [];
        setDetailVolume(volumeData);
      };

      store.detail.vm?.flavor && fnGetFlavor();
      store.detail.vm?.networks && fnGetNetwork();
      store.detail.vm?.security_groups && fnGetSecurityGroup();
      fnGetVolume();
    
  }, []);


  const getMonitoringCfgs = metrics => [
    {
      type: 'cpu',
      title: 'CPU',
      unitType: 'cpu',
      legend: ['USED'],
      data: [metrics.cpu],
      bgColor: 'transparent',
    },
    {
      type: 'memory',
      title: 'MEMORY',
      unitType: 'memory',
      legend: ['USED'],
      data: [metrics.memory],
      bgColor: 'transparent',
    },
  ]

  const renderMonitorings = () => {
    // const { metrics = {}, isExpand, loading } = props

    const isExpand = false;
    const loading = false;
    const metrics = store.metrics ? store.metrics : {}; //테스트 data store 에 있음.

    if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>

    if (isEmpty(metrics.cpu) && isEmpty(metrics.memory))
      return <div className={styles.monitors}>{t('NO_MONITORING_DATA')}</div>

    const configs = getMonitoringCfgs(metrics)
  
    return (
      <div className={styles.monitors}>
        <div className={styles.charts}>
          {configs.map(item => {
            const config = getAreaChartOps(item)

            return (
              <div key={item.type}>
                <TinyArea
                  key={item.type}
                  width="100%"
                  height={40}
                  {...config}
                  darkMode={isExpand}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>  
        <div>
          
          {/* 가상 머신 */}
            <Panel title={"가상머신"}>
            <div className={styles.wrapper}>
              <div className={styles.itemMain} >
                <div className={styles.icon}>
                  <Icon name="templet" size={40} />
                </div>
                <div className={styles.content}>
                  <div className={styles.text}>
                    <div>{store.detail.vm?.name}</div>
                    <p>이름</p>
                  </div>
                  <div className={styles.text}>
                    <div>{store.detail.vm?.state}</div>
                    <p>상태</p>
                  </div>
                  <div className={styles.text}>
                  <div>{store.detail.vm?.node}</div>
                    <p>Node</p>
                  </div>
                  {renderMonitorings()}   
                </div>               
              </div>         
            </div>    
            </Panel>

          {/* Flavor */}
          {!!detailFlavor &&
            <Panel title={"Flavor"}>
              <div className={styles.wrapper}>
                  <div className={classnames(styles.item)}>
                    <div className={styles.icon}>
                      <Icon name="apps" size={40} />
                    </div>
                    <div className={classnames(styles.title, styles.name)}>
                      <div>{detailFlavor.name}</div>
                      <p>이름</p>
                    </div>
                    <div className={styles.title}>
                      <div>
                        {
                          detailFlavor.devices.length >= 1 ?  
                          detailFlavor.devices.length == 1 ? detailFlavor.devices[0] : detailFlavor.devices[0] + " 외 " + (detailFlavor.devices.length - 1) + "개" 
                          : "-"
                        }
                      </div>
                      <p>호스트 디바이스</p>
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='CPU'
                        icon='cpu'
                        title={detailFlavor.vcpus +" Core"}
                        description={t('CPU')}
                      />
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='Memory'
                        icon='memory'
                        title={common.fnSetBytes(detailFlavor.ram)}
                        description={t('Memory')}
                      />
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='Disk'
                        icon='storage'
                        title={detailFlavor.root_disk +" Gib"}
                        description={t('Disk')}
                      />
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='GPU'
                        icon='gpu'
                        title={detailFlavor.gpus.length >= 1 ?  
                          detailFlavor.gpus.length == 1 ? detailFlavor.gpus[0] : detailFlavor.gpus[0] + " 외 " + (detailFlavor.gpus.length - 1) + "개" 
                          : "-"}
                        description={t('GPU')}
                      />
                    </div>
                  </div>                
              </div>
            </Panel>
          }

          {/* 보안그룹 */}
          {
            store.detail.vm?.security_groups.length > 0 && <DetailSecurityGroupList securityGroupData={detailSecurityGroup} />            
          }          

          {/* 네트워크 */}
          {detailNetwork.length > 0 &&
            <Panel title={"네트워크"}>
              <div className={styles.wrapper}>
                {detailNetwork.map((obj, index) => (
                  <div className={classnames(styles.item)} key={index}>
                    <div className={styles.icon}>
                      <Icon name="network-duotone" size={40} />
                    </div>
                    <div className={classnames(styles.title, styles.name)}>
                      <div>{obj.name}</div>
                      <p>이름</p>
                    </div>
                    <div className={styles.title}>
                      <div>{obj.type}</div>
                      <p>유형</p>
                    </div>
                    <div className={styles.title}>
                      <div>{obj.cidr}</div>
                      <p>CIDR</p>
                    </div>
                    <div className={styles.title}>
                      <div>{obj.gateway_ip}</div>
                      <p>게이트웨이</p>
                    </div>                   
                  </div>                
                ))}
              </div>
            </Panel>
          }

           {/* 볼륨 */}
           {detailVolume.length > 0 &&
            <Panel title={"볼륨"}>
              <div className={styles.wrapper}>
                {detailVolume.map((obj, index) => (
                  <div className={classnames(styles.item)} key={index}>
                    <div className={styles.icon}>
                      <Icon name="network-duotone" size={40} />
                    </div>
                    <div className={classnames(styles.title, styles.name)}>
                      <div>{obj.name}</div>
                      <p>이름</p>
                    </div>
                    <div className={styles.title}>
                      <div>
                        {(obj.access_modes).map((mode) => (<p key={mode}>{mode}</p>))}
                      </div>
                      <p>접근모드</p>
                    </div>
                    <div className={styles.title}>
                      <div>{obj.capacity}GB</div>
                      <p>용량</p>
                    </div>
                    <div className={styles.title}>
                      <div>{obj.phase}</div>
                      <p>상태</p>
                    </div>                   
                  </div>                
                ))}
              </div>
            </Panel>
          }

      </div>         
    </>
  );
};

export default inject('detailStore')(observer(Status))

