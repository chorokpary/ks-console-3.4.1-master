import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import axios from "axios";
import { Panel } from 'components/Base'
import { Icon, Button, Notify } from '@kube-design/components'

import styles from './index.scss'

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

const Status = (props) => {

  const store = props.detailStore;
  const [isExpandInternal, setIsExpandInternal] = useState(false)

  const [externalNetwork, setExternalNetwork] = useState(null);
  const [internalNetwork, setInternalNetwork] = useState([]);

  const renderContentNetwork = () => {
    return (
      <>
      {internalNetwork.map((obj, index) => (
        index == 0 &&
        <div className={styles.content} key={index}>
          <div className={styles.text}>
            <div>{obj.name}</div>
            <p>이름</p>
          </div>
          <div className={styles.text}>
            <div>{obj.type}</div>
            <p>유형</p>
          </div>
          <div className={styles.text}>
            <div>{obj.cidr}</div>
            <p>CIDR</p>
          </div>
          <div className={styles.text}>
            <div>{obj.gateway_ip}</div>
            <p>게이트웨이</p>
          </div>          
          <div className={styles.arrow}>
            <Icon name="chevron-down" type={isExpandInternal ? 'light' : ''} size={20} />
          </div>
        </div>
       ))}
       </>
    )
  }

  const renderExtraContentNetwork = () => {
    return (
      <div className={styles.itemExtra}>
        {internalNetwork.map((obj, index) => (
          index > 0 &&
              <div className={styles.containers} key={index}>
              <div className={classnames(styles.item)}>
                <div className={styles.icon}>
                  <Icon name="network" size={40} />         
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
          </div>   
         ))}

      </div>
    )
  }

  const handleExpandExtra = () => {
    setIsExpandInternal(!isExpandInternal)
  }

  useEffect(() => {

      const fnGetExternalNetwork = async () => {
        const externalData = await axios.get(`/edgetron/resources/kubevirt/networks/${store.detail.router.external}`);
        setExternalNetwork(externalData.data.network);
      };

      const fnGetInternalNetwork = async () => {
        setInternalNetwork([]);
        const promises = (store.detail.router?.internal).map(async (name) => {
          const internalData = await axios.get("/edgetron/resources/kubevirt/networks/" + name);
          setInternalNetwork(internalNetwork => [...internalNetwork, internalData.data.network])
        })
        await Promise.all(promises);
      };

      store.detail.router?.external && fnGetExternalNetwork();
      setInternalNetwork([]);
      fnGetInternalNetwork();

  }, [])

  return (
    <>  
      {!!externalNetwork &&
        <Panel title={"외부 네트워크"}>
          <div className={styles.wrapper}>
            <div className={classnames(styles.item)}>
              <div className={styles.icon}>
                <Icon name="network-router" size={40} />         
              </div>
              <div className={classnames(styles.title, styles.name)}>
                <div>{externalNetwork.name}</div>
                <p>이름</p>
              </div>
              <div className={styles.title}>
                <div>{externalNetwork.type}</div>
                <p>유형</p>
              </div>
              <div className={styles.title}>
                <div>{externalNetwork.cidr}</div>
                <p>CIDR</p>
              </div>
              <div className={styles.title}>
                <div>{externalNetwork.gateway_ip}</div>
                <p>게이트웨이</p>
              </div>
            </div>
          </div>  
        </Panel>
      }

      {internalNetwork.length > 0 &&
        <Panel title={"내부 네트워크"}>
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
                {renderContentNetwork()}
              </div>
              {renderExtraContentNetwork()}
            </div>
          </div>
        </Panel>
      }     

      <DetailVmList type='이미지' variables='image' name="ubuntu-2004-image-amd64" />
      
    </>
  );
};

export default inject('detailStore')(observer(Status))

