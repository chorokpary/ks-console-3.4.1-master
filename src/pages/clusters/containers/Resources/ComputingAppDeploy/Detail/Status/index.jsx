import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { getLocalTime } from 'utils'

import { Button, Notify, Loading, Icon } from '@kube-design/components'
import { Panel, Text, Indicator } from 'components/Base'

import AppDeployStore from 'stores/resources/appdeploy'

import styles from './index.scss'

const Status = (props) => {

  const store = props.detailStore;
  const appDeployStore = new AppDeployStore();

  console.log(props)

  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getHistoryList = async () => {

      const parms = {"cluster": store.detail.cluster,"name": store.detail.name}
      const response = await appDeployStore.fetchHistoryList(parms);

      setHistoryList(response)
      setIsLoading(false);

    };
    getHistoryList();
  }, [])


  const fnExplanation = (ex) => {
    return props.rootStore.triggerAction('computingappdeploy.detail', {
      type: 'APPDEPLOY_DETAIL',
      explanation : ex,
    })
  }


  return (
    <>  
       <div className={styles.defaultWrapper}>

          {historyList?.length == 0 &&
            <div className={styles.wrapper}>
                {isLoading ?
                  <div className={styles.loading}><Loading /></div>
                  : <div className={styles.empty}>{t('RESOURCES_NO_DATA_TASK_LOG')}</div>
                }
              </div>
          }

          {historyList?.length > 0 &&
            <div className={styles.table}>
                <table>
                  <colgroup>
                      <col width="10%"/>
                      <col width="10%"/>
                      <col width="20%"/>
                      <col width="25%"/>
                      <col width="25%"/>
                      <col width="10%"/>
                    </colgroup>
                    <thead>
                      <tr>
                        <th><strong>{t('RESOURCES_TASK_ID')}</strong></th>
                        <th><strong>{t('RESOURCES_VERSION')}</strong></th>
                        <th><strong>{t('RESOURCES_STATE')}</strong></th>
                        <th><strong>{t('RESOURCES_START_TIME')}</strong></th>
                        <th><strong>{t('RESOURCES_END_TIME')}</strong></th>
                        <th><strong>{t('RESOURCES_DESCRIPTION')}</strong></th>
                      </tr>
                    </thead>
                    <tbody>                     
                        {historyList && historyList.map((obj, index) => (
                          <tr key={index}>
                            <td><p className={styles.taskId}>#{obj.id}</p></td>
                            <td><p>{obj.templateVersion}</p></td>
                            <td>
                              <div className={styles.iconwrapper}>   
                                  <Indicator
                                    className={styles.indicator}
                                    type={obj.status === 'success' ? 'running' : obj.status === 'create' ? 'completed' : 'error'}
                                    flicker
                                  /> 
                                  <p className={obj.status === 'success' ? styles.success : obj.status === 'create' ? styles.done : styles.error}>{(obj.status)[0].toUpperCase()+ (obj.status).slice(1, (obj.status).length)}</p>
                               </div>
                            </td>
                            <td><p>{getLocalTime(obj.startTime).format('YYYY-MM-DD HH:mm:ss')}</p></td>
                            <td><p>{getLocalTime(obj.endTime).format('YYYY-MM-DD HH:mm:ss')}</p></td>
                            <td>
                                <Icon name="more" size={30} onClick={() => fnExplanation(obj.explanation)} style={{ cursor: 'pointer' }}/>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                </table>
            </div>      
          }

          </div>                 
    </>
  );
};

export default inject('detailStore', 'rootStore')(observer(Status))


