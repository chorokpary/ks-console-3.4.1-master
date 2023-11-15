import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel, Text } from 'components/Base'
import { Icon} from '@kube-design/components'
import styles from './index.scss'

import * as common from 'utils/resources'

const DetailSecurityGroupList = (props) => {

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
              <div>{obj.description}</div>
              <p>설명</p>
          </div>
          <div className={styles.text}>
              <div>{obj.ingress_count}</div>
              <p>인바운드 규칙</p>
          </div>
          <div className={styles.text}>
              <div>{obj.egress_count}</div>
              <p>아웃바운드 규칙</p>
          </div>
          <div className={styles.arrow}>
            <Icon name="chevron-down" type={obj.name != expandItem ? '' : (obj.name == expandItem && isExpandFlag == false) ? '' : 'light'}size={20} />
          </div>
        </div>
       </>
    )
  }

  const renderExtraContent = (obj) => {
    return (
      <div className={styles.itemExtra}>
          <div className={styles.containers} >
            <Panel title={"인바운드"} className={styles.panelWrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                      <col width="25%"/>
                      <col width="25%"/>
                      <col width="25%"/>
                      <col width="25%"/>
                    </colgroup>
                    <thead>
                      <tr>
                      <th>프로토콜</th>
                      <th>포트범위</th>
                      <th>이더넷유형</th>
                      <th>원격IP범위</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(obj.rules).filter(el => el.direction == "ingress").map((obj, index) => (
                        <tr key={obj.id}>
                          <td>{obj.protocol}</td>                          
                          <td>{obj.port_range_min !== obj.port_range_max ? (obj.port_range_min ? obj.port_range_min : 0) + `-` : ''}{obj.ethernet_type ? obj.port_range_max : "0-65535"}</td>
                          <td>{obj.ethernet_type}</td>
                          <td>{obj.remote_ip_prefix}</td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              </div>
            </Panel>   
            <Panel title={"아웃바인드"} className={styles.panelWrapper}>
              <div className={styles.table}>
                  <table>
                    <colgroup>
                        <col width="25%"/>
                        <col width="25%"/>
                        <col width="25%"/>
                        <col width="25%"/>
                      </colgroup>
                      <thead>
                        <tr>
                        <th>프로토콜</th>
                        <th>포트범위</th>
                        <th>이더넷유형</th>
                        <th>원격IP범위</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(obj.rules).filter(el => el.direction == "egress").map((obj, index) => (
                          <tr key={obj.id}>
                            <td>{obj.protocol}</td>
                            <td>{obj.port_range_min !== obj.port_range_max ? (obj.port_range_min ? obj.port_range_min : 0) + `-` : ''}{obj.ethernet_type ? obj.port_range_max : "0-65535"}</td>
                            <td>{obj.ethernet_type}</td>
                            <td>{obj.remote_ip_prefix}</td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                </div>
            </Panel>      
          </div>        
        </div>
    )
  }

  const handleExpand = (name) => {
    setExpandItem(name);
    setIsExpandFlag(!isExpandFlag)
  }

  return (
    <>  
          <Panel title={"보안 그룹"} >
            { (props.securityGroupData).map((obj, index) => {
              return (
                <div className={styles.wrapper} key={index}>
                <div
                  className={classnames(styles.expandItem, "", {
                    [styles.expanded]: (obj.name == expandItem ? isExpandFlag : false),
                  })}
                >
                  <div className={styles.itemMain} onClick={() => handleExpand(obj.name)}>
                    <div className={styles.icon}>
                      <Icon name="shield" size={40} type={obj.name != expandItem ? 'dark' : (obj.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
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
    </>
  );
};

export default DetailSecurityGroupList

