import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { getLocalTime } from 'utils'
import { Card } from 'components/Base'
import { Button, Notify } from '@kube-design/components'

import VmStore from 'stores/resources/vms'

import styles from './index.scss'

const Event = (props) => {

  const store = props.detailStore;
  const vmStore = new VmStore();

  const [eventList, setEventList] = useState([]);

  useEffect(() => {
    const getVmEventList = async () => {

      const parms = {"cluster": store.detail.cluster,"name": store.detail.name}
      const response = await vmStore.fetchVmEventList(parms);
      setEventList(response.events)

    };
    getVmEventList();
  }, [])

  return (
    <>  
        <div>
          <div className={styles.defaultWrapper}>
            <div className={styles.table}>
                <table>
                  <colgroup>
                      <col width="10%"/>
                      <col width="15%"/>
                      <col width="15%"/>
                      <col width="20%"/>
                      <col width="20%"/>
                      <col width="20%"/>
                    </colgroup>
                    <thead>
                      <tr>
                        <th><strong>VM</strong></th>
                        <th><strong>사유</strong></th>
                        <th><strong>타입</strong></th>
                        <th><strong>시작 시간</strong></th>
                        <th><strong>종료 시간</strong></th>
                        <th><strong>메시지</strong></th>
                      </tr>
                    </thead>
                    <tbody>
                      {!eventList?.length &&
                          <tr>
                            <td colSpan="6" className={styles.empty}>
                              <p>데이터가 없습니다.</p>
                            </td>
                          </tr>
                        }
                        {eventList && eventList.map((obj, index) => (
                          <tr key={index}>
                            <td><p className="underline">{store.detail.name}</p></td>
                            <td><p>{obj.reason}</p></td>
                            <td><p>{obj.type}</p></td>
                            <td><p>{getLocalTime(obj.first_timestamp).format('YYYY-MM-DD HH:mm:ss')}</p></td>
                            <td><p>{getLocalTime(obj.last_timestamp).format('YYYY-MM-DD HH:mm:ss')}</p></td>
                            <td><p>{obj.message}</p></td>
                          </tr>
                        ))}
                    </tbody>
                </table>
            </div>                
          </div>
      </div>         
    </>
  );
};

export default inject('detailStore')(observer(Event))

