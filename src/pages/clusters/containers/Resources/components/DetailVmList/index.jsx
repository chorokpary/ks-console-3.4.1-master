import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel } from 'components/Base'
import { Icon} from '@kube-design/components'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'

import * as common from 'utils/resources'


const DetailVmList = (props) => {

  // props = {
  //   type : '이미지' // 빈 화면 일때 사용할 이름,
  //   variables : 'image' // vm 데이터 내에서 비교할 파라미터,
  //   name : 'ubuntu' // 예시대로 vm 데이터 내의 image 이름이 ubuntu 인 것,
  // }

  const store = new VmStore();
  const [vmDataList, setVmDataList] = useState([]);

  const [isExpandFlag, setIsExpandFlag] = useState(false)
  
  const renderContentNetwork = (obj) => {
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
          <div className={styles.arrow}>
            <Icon name="chevron-down" type={obj.name != expandItem ? '' : (obj.name == expandItem && isExpandFlag == false) ? '' : 'light'}size={20} />
          </div>
        </div>
       </>
    )
  }

  const renderExtraContentNetwork = (obj) => {

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
                  <div>{obj.flavor_detail.vcpus} Core</div>
                  <p>CPU</p>
                </div>
                <div className={styles.title}>
                  <div>{common.fnSetBytes(obj.flavor_detail.ram)}</div>
                  <p>Memory</p>
                </div>
                <div className={styles.title}>
                  <div>{obj.flavor_detail.root_disk} Gib</div>
                  <p>Disk</p>
                </div>                
                <div className={styles.title}>
                  <div>
                  {
                    obj.gpus.length >= 1 ?  
                    obj.gpus.length == 1 ? obj.gpus[0] : obj.gpus[0] + " 외 " + (obj.gpus.length - 1) + "개" 
                    : "-"
                   }
                  </div>
                  <p>GPU</p>
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

  const [expandItem, setExpandItem] = useState();
  const handleExpand = (name) => {
    setExpandItem(name);
    setIsExpandFlag(!isExpandFlag)
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
                      <Icon name="network-duotone" size={40} type={obj.name != expandItem ? 'dark' : (obj.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
                    </div>
                    {renderContentNetwork(obj)}
                  </div>
                  {renderExtraContentNetwork(obj)}
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

