import { get, groupBy, isEmpty } from 'lodash'
import React, {useState, useEffect} from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel, Text } from 'components/Base'
import { Icon} from '@kube-design/components'
import { TinyArea } from 'components/Charts'

import styles from './index.scss'

import VmStore from 'stores/resources/vms'

import * as common from 'utils/resources'
import { getAreaChartOps } from 'utils/monitoring'


const DetailVmList = (props) => {

  // props = {
  //   type : '이미지' // 빈 화면 일때 사용할 이름,
  //   variables : 'image' // vm 데이터 내에서 비교할 파라미터,
  //   name : 'ubuntu' // 예시대로 vm 데이터 내의 image 이름이 ubuntu 인 것,
  // }

  const store = new VmStore();
  const [vmDataList, setVmDataList] = useState([]);

  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState();
  
  const renderContent = (obj) => {
    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
              <div>{obj.name}</div>
              <p>이름</p>
          </div>
          <div className={styles.text}>
              <div>{obj.state}</div>
              <p>상태</p>
          </div>
          <div className={styles.text}>
              <div>{obj.node != "N/A" ? obj.name : "-"}</div>
              <p>노드</p>
          </div>
          {renderMonitorings()}  
          <div className={styles.arrow}>
            <Icon name="chevron-down" type={obj.name != expandItem ? '' : (obj.name == expandItem && isExpandFlag == false) ? '' : 'light'}size={20} />
          </div>
        </div>
       </>
    )
  }

  const renderExtraContent = (obj) => {

    const networkList = obj.networks.filter((network) => network.name != "k8s-pod-network");
    return (
      <div className={styles.itemExtra}>
          <div className={styles.containers} >
              <div className={classnames(styles.item)}>
                <div className={styles.icon}>
                  <Icon name="apps" size={40} />         
                </div>
                <div className={classnames(styles.title, styles.name)}>
                  <div>{obj.flavor_detail.name}</div>
                  <p>Flavor</p>
                </div>
                <div className={styles.title}>
                  <div>
                   {
                    networkList.length >= 1 ?  
                    networkList.length == 1 ? networkList[0].name : networkList[0].name + " 외 " + (networkList.length - 1) + "개" 
                    : "-"
                   }
                  </div>
                  <p>네트워크</p>
                </div>     
                <div className={styles.title}>
                      <Text
                        key='CPU'
                        icon='cpu'
                        title={obj.flavor_detail.vcpus +" Core"}
                        description={t('CPU')}
                      />
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='Memory'
                        icon='memory'
                        title={common.fnSetBytes(obj.flavor_detail.ram)}
                        description={t('Memory')}
                      />
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='Disk'
                        icon='storage'
                        title={obj.flavor_detail.root_disk +" Gib"}
                        description={t('Disk')}
                      />
                    </div>
                    <div className={styles.title}>
                      <Text
                        key='GPU'
                        icon='gpu'
                        title={obj.flavor_detail.gpus.length >= 1 ?  
                          obj.flavor_detail.gpus.length == 1 ? obj.flavor_detail.gpus[0] : obj.flavor_detail.gpus[0] + " 외 " + (obj.flavor_detail.gpus.length - 1) + "개" 
                          : "-"}
                        description={t('GPU')}
                      />
                    </div>
              </div>          
          </div>        
        </div>
    )
  }


  useEffect(() => {
    const fnGetExternalNetwork = async () => {
      const vmList = await store.fetchList();
      setVmDataList(vmList?.filter((row) => row[props.variables] === props.name))
    };

    fnGetExternalNetwork();
  }, [])

  
  const handleExpand = (name) => {
    setExpandItem(name);
    setIsExpandFlag(!isExpandFlag)
  }

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
    const metrics = {}

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

      {vmDataList.length > 0 && 
       
          <Panel title={"가상 머신"} >
            { vmDataList.map((obj, index) => {
              return (
                <div className={styles.wrapper} key={index}>
                <div
                  className={classnames(styles.expandItem, "", {
                    [styles.expanded]: (obj.name == expandItem ? isExpandFlag : false),
                  })}
                >
                  <div className={styles.itemMain} onClick={() => handleExpand(obj.name)}>
                    <div className={styles.icon}>
                      <Icon name="templet" size={40} type={obj.name != expandItem ? 'dark' : (obj.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
                    </div>
                    {renderContent(obj)}
                  </div>
                  {renderExtraContent(obj)}
                </div>
              </div>
              )
            }
            )}
          </Panel>       
      }
      
      {vmDataList.length == 0 &&
        <Panel title={"가상 머신"}>
          <div className={styles.wrapper}>
              <div>{props.type}를 사용하는 가상머신이 없습니다.</div>
          </div>
      </Panel> 
      }

    </>
  );
};

export default DetailVmList

