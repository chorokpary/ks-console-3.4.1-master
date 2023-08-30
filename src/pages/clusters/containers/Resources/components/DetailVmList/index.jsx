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

  const [isExpandInternal, setIsExpandInternal] = useState(false)
  
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
            <Icon name="chevron-down" type={isExpandInternal ? 'light' : ''} size={20} />
          </div>
        </div>
       </>
    )
  }

  const renderExtraContentNetwork = (obj) => {
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
                   {obj.networks.length == 0 && "-"}
                   {obj.networks.length > 1 ? obj.networks[0] + " 외 " + (obj.networks.length - 1) + "개" : obj.networks[0] }
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
                   {obj.gpus.length == 0 && "-"}
                   {obj.gpus.length > 1 ? obj.gpus[0] + " 외 " + (obj.gpus.length - 1) + "개" : obj.gpus[0] }
                  </div>
                  <p>GPU</p>
                </div>
              </div>          
          </div>        
        </div>
    )
  }

  const handleExpandExtra = () => {
    setIsExpandInternal(!isExpandInternal)
  }

  useEffect(() => {
    const fnGetExternalNetwork = async () => {
      const vmList = await store.fetchList();
      setVmDataList(vmList);
    };

    fnGetExternalNetwork();
  }, [])

  return (
    <>  
      {vmDataList.length > 0 ?
        vmDataList.map((obj, index) => (
          <Panel title={"가상 머신"} key={index}>
            <div className={styles.wrapper}>
              <div
                className={classnames(styles.expandItem, "", {
                  [styles.expanded]: isExpandInternal,
                })}
              >
                <div className={styles.itemMain} onClick={() => handleExpandExtra()}>
                  <div className={styles.icon}>
                    <Icon name="network-duotone" size={40} type={isExpandInternal ? 'light' : 'dark'} />
                  </div>
                  {renderContentNetwork(obj)}
                </div>
                {renderExtraContentNetwork(obj)}
              </div>
            </div>
          </Panel> 
        ))
        : 
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

