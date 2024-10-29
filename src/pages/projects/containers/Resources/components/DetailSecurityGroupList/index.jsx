import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel, Text } from 'components/Base'
import { Icon } from '@kube-design/components'
import styles from './index.scss'
import { Link } from 'react-router-dom'

import * as common from 'utils/resources'

const DetailSecurityGroupList = (props) => {

  const [isExpandFlag, setIsExpandFlag] = useState(false)
  const [expandItem, setExpandItem] = useState();

  const { workspace, cluster, namespace } = props.params;

  const renderContent = (obj) => {
    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
            <div><Link to={`/${workspace}/clusters/${cluster}/projects/${namespace}/securityGroups/${obj.name}/${obj.id}`}>{obj.name}</Link></div>
            <p>{t('RESOURCES_NAME')}</p>
          </div>
          <div className={styles.text}>
            <div>{`${obj.description === undefined || obj.description === ""
              ? "-"
              : obj.description
              }`}
            </div>
            <p>{t('RESOURCES_DESCRIPTION')}</p>
          </div>
          <div className={styles.text}>
            <div>{obj.ingress_count}</div>
            <p>{t('RESOURCES_INBOUND_RULE')}</p>
          </div>
          <div className={styles.text}>
            <div>{obj.egress_count}</div>
            <p>{t('RESOURCES_OUTBOUND_RULE')}</p>
          </div>
          {(obj.ingress_count == 0 && obj.egress_count == 0) ? <div className={styles.text} style={{ width: '5%' }} /> :
            <div className={styles.arrow} onClick={() => handleExpand(obj.name)}>
              <Icon name="chevron-down" type={obj.name != expandItem ? '' : (obj.name == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
            </div>
          }
        </div>
      </>
    )
  }

  const renderExtraContent = (obj) => {
    return (
      <div className={styles.itemExtra}>
        <div className={styles.containers} >
          {obj.rules.filter(el => el.direction == "ingress").length > 0 &&
            <Panel title={t('RESOURCES_INBOUND')} className={styles.panelWrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="25%" />
                    <col width="25%" />
                    <col width="25%" />
                    <col width="25%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>{t('RESOURCES_PROTOCOL')}</th>
                      <th>{t('RESOURCES_PORT_RANGE')}</th>
                      <th>{t('RESOURCES_ETHERNET_TYPE')}</th>
                      <th>{t('RESOURCES_REMOTE_IP_RANGE')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(obj.rules).filter(el => el.direction == "ingress").map((obj, index) => (
                      <tr key={obj.id}>
                        <td>{obj.ethernet_type ? obj.protocol : 'ALL'}</td>
                        <td>{obj.port_range_min !== obj.port_range_max ? (obj.port_range_min ? obj.port_range_min : 0) + `-` : ''}{obj.ethernet_type ? obj.port_range_max : "0-65535"}</td>
                        <td>{obj.ethernet_type ?? 'ALL'}</td>
                        <td>{obj.remote_ip_prefix ? obj.remote_ip_prefix : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          }
          {obj.rules.filter(el => el.direction == "egress").length > 0 &&
            <Panel title={t('RESOURCES_OUTBOUND')} className={styles.panelWrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="25%" />
                    <col width="25%" />
                    <col width="25%" />
                    <col width="25%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>{t('RESOURCES_PROTOCOL')}</th>
                      <th>{t('RESOURCES_PORT_RANGE')}</th>
                      <th>{t('RESOURCES_ETHERNET_TYPE')}</th>
                      <th>{t('RESOURCES_REMOTE_IP_RANGE')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(obj.rules).filter(el => el.direction == "egress").map((obj, index) => (
                      <tr key={obj.id}>
                        <td>{obj.ethernet_type ? obj.protocol : 'ALL'}</td>
                        <td>{obj.port_range_min !== obj.port_range_max ? (obj.port_range_min ? obj.port_range_min : 0) + `-` : ''}{obj.ethernet_type ? obj.port_range_max : "0-65535"}</td>
                        <td>{obj.ethernet_type ?? 'ALL'}</td>
                        <td>{obj.remote_ip_prefix ? obj.remote_ip_prefix : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          }
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
      <Panel title={t('RESOURCES_SECURITY_GROUP')} >
        <div className={styles.wrapper}>
          {(props.securityGroupData).map((obj, index) => {
            return (
              <div
                className={classnames(styles.expandItem, "", {
                  [styles.expanded]: (obj.name == expandItem ? isExpandFlag : false),
                })} key={index}
              >
                <div className={styles.itemMain}>
                  <div className={styles.icon}>
                    <Icon name="shield" size={40} type={obj.name != expandItem ? 'dark' : (obj.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
                  </div>
                  {renderContent(obj)}
                </div>
                {obj.rules.length > 0 && renderExtraContent(obj)}
              </div>
            )
          }
          )}
        </div>
      </Panel>
    </>
  );
};

export default DetailSecurityGroupList

