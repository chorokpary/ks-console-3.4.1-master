import React, { useEffect, useState } from 'react'
import LbsIpStore from 'stores/resources/lbs';
import { Icon } from '@kube-design/components'
import { Panel, Text } from 'components/Base'
import styles from './index.scss'
import classNames from 'classnames';

const LbPanel = (props) => {

  const store = new LbsIpStore();
  const [lbDetail, setLbDetail] = useState();

  useEffect(() => {
    const fnGetLbDetail = async () => {
      const lbDetail = await store.fetchDetail(props.name);
      setLbDetail(lbDetail.lb)
    };

    fnGetLbDetail();
  }, [])

  const renderContent = (obj) => {
    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
            <div>{obj.network}</div>
            <p>이름</p>
          </div>
          <div className={styles.text}>
            {obj.members?.map((el, idx) =>
              <div key={idx}>{el}</div>
            )}
            <p>네트워크</p>
          </div>
          <div className={styles.text}>
            <div>{obj.name}</div>
            <p>로드밸런서 이름</p>
          </div>
          <div className={styles.text}>
            <div>{obj.virtual_ip}</div>
            <p>가상머신 IP</p>
          </div>
          <div className={styles.text}>
            <div>{obj.rules?.length}</div>
            <p>정책수</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {lbDetail &&
        <Panel title={"로드 밸런서"} >
          <div className={styles.wrapper}>
            <div
              className={classNames(styles.expandItem, "", {
                [styles.expanded]: false,
              })}
            >
              <div className={styles.itemMain} >
                <div className={styles.icon}>
                  <Icon name="loadbalancer" size={40} />
                </div>
                {renderContent(lbDetail)}
              </div>
            </div>
          </div>
        </Panel>
      }
    </>
  )
}

export default LbPanel