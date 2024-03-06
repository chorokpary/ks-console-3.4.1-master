import React, { useEffect, useState } from 'react'
import LbsIpStore from 'stores/resources/loadbalancers';
import { Icon } from '@kube-design/components'
import { Panel, Text } from 'components/Base'
import styles from './index.scss'
import classNames from 'classnames';
import { inject } from 'mobx-react';

const LbPanel = (props) => {

  const store = new LbsIpStore();
  const [lbDetail, setLbDetail] = useState();

  useEffect(() => {
    const fnGetLbDetail = async () => {
      const lbDetail = await store.fetchDetailLbs({ ...props.detailstore.detail, id: props.id });
      setLbDetail(lbDetail.lb)
    };

    fnGetLbDetail();
  }, [])

  const renderContent = (obj) => {
    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
            <div>{obj.network.name}</div>
            <p>{t('RESOURCES_NAME')}</p>
          </div>
          <div className={styles.text}>
            {obj.members?.map((el, idx) =>
              <div key={idx}>{el}</div>
            )}
            <p>{t('RESOURCES_NETWORK')}</p>
          </div>
          <div className={styles.text}>
            <div>{obj.name}</div>
            <p>{t('RESOURCES_LOAD_BALANCER_NAME')}</p>
          </div>
          <div className={styles.text}>
            <div>{obj.virtual_ip}</div>
            <p>{t('RESOURCES_VM_IP')}</p>
          </div>
          <div className={styles.text}>
            <div>{obj.rules?.length}</div>
            <p>{t('RESOURCES_POLICY_COUNT')}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {lbDetail &&
        <Panel title={t("RESOURCES_LOAD_BALANCER")} >
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

export default inject('detailStore')(LbPanel)