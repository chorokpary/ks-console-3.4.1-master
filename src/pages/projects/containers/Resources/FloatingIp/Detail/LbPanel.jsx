import React, { useEffect, useState } from 'react';
import LbsIpStore from 'stores/resources/loadbalancers';
import { Icon } from '@kube-design/components';
import { Panel, Text } from 'components/Base';
import { Link } from 'react-router-dom'
import classNames from 'classnames';
import { inject } from 'mobx-react';
import styles from './index.scss';

const LbPanel = props => {
  const store = new LbsIpStore();
  const [lbDetail, setLbDetail] = useState();
  
  useEffect(() => {
    const fnGetLbDetail = async () => {
      const lbDetail = await store.fetchDetailLbs({
        ...props.detailStore.detail,
        name: props.name,
      });
      setLbDetail(lbDetail.lb);
    };

    fnGetLbDetail();
  }, []);

  const renderContent = obj => {
    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
            <div>
              <Link to={`/${props.workspace}/clusters/${props.cluster}/projects/${props.project}/loadBalancers/${obj.name}`}>
                {obj.name}
              </Link>
            </div>
            <p>{t('RESOURCES_NAME')}</p>
          </div>
          <div className={styles.text}>
            {obj.members?.length > 1 ? (
              <div>{`${obj.members?.[0]} 외 ${obj.members?.length -
                1} 건`}</div>
            ) : (
              <div>{obj.members?.[0]}</div>
            )}
            <p>{t('RESOURCES_NETWORK')}</p>
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
    );
  };

  return (
    <>
      {lbDetail && (
        <Panel title={t('RESOURCES_LOAD_BALANCER')}>
          <div className={styles.wrapper}>
            <div
              className={classNames(styles.expandItem, '', {
                [styles.expanded]: false,
              })}
            >
              <div className={styles.itemMain}>
                <div className={styles.icon}>
                  <Icon name="loadbalancer" size={40} />
                </div>
                {renderContent(lbDetail)}
              </div>
            </div>
          </div>
        </Panel>
      )}
    </>
  );
};

export default inject('detailStore')(LbPanel);