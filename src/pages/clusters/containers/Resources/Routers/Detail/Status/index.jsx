import { get, groupBy } from 'lodash';
import React, { useState, useEffect } from 'react';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { Icon, Button, Notify } from '@kube-design/components';

import { Link } from 'react-router-dom';

import { Panel } from 'components/Base';
import styles from './index.scss';

const Status = props => {
  const store = props.detailStore;
  const cluster = props.match.params.cluster;

  const [externalNetwork, setExternalNetwork] = useState(null);
  const [internalNetwork, setInternalNetwork] = useState([]);

  useEffect(() => {
    const fnGetExternalNetwork = async () => {
      const externalData = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.match.params.cluster}/edgetron/resources/kubevirt/networks/${store.detail.router.external.id}`
      );
      setExternalNetwork(externalData?.network);
    };

    const fnGetInternalNetwork = async () => {
      setInternalNetwork([]);
      const promises = (store.detail.router?.internal).map(async item => {
        const internalData = await request.get(
          `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.match.params.cluster}/edgetron/resources/kubevirt/networks/${item.id}`
        );
        setInternalNetwork(internalNetwork => [
          ...internalNetwork,
          internalData?.network,
        ]);
      });
      await Promise.all(promises);
    };

    store.detail.router?.external && fnGetExternalNetwork();
    setInternalNetwork([]);
    store.detail.router?.internal && fnGetInternalNetwork();
  }, []);

  return (
    <>
      {!!externalNetwork && (
        <Panel title={t('RESOURCES_EXTERNAL_NETWORK')}>
          <div className={styles.wrapper}>
            <div className={styles.itemMainRemoveCursor}>
              <div className={styles.icon}>
                <i
                  className="ico-type-externalnetwork"
                  style={{ width: '40px', height: '40px' }}
                ></i>
              </div>
              <div className={styles.content}>
                <div className={styles.text}>
                  <div>
                    <Link
                      to={`/clusters/${cluster}/networks/${externalNetwork.name}/${externalNetwork.id}`}
                    >
                      {externalNetwork.name}
                    </Link>
                  </div>
                  <p>{t('RESOURCES_NAME')}</p>
                </div>
                <div className={styles.text}>
                  <div>{externalNetwork.type}</div>
                  <p>{t('RESOURCES_TYPE_YOO')}</p>
                </div>
                <div className={styles.text}>
                  <div>{externalNetwork.cidr}</div>
                  <p>{t('RESOURCES_CIDR')}</p>
                </div>
                <div className={styles.text}>
                  <div>{externalNetwork.gateway_ip}</div>
                  <p>{t('RESOURCES_GATEWAY')}</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {internalNetwork.length > 0 && (
        <Panel title={t('RESOURCES_INTERNAL_NETWORK')}>
          <div className={styles.wrapper}>
            {internalNetwork.map((obj, index) => (
              <div className={classnames(styles.expandItem)}>
                <div className={styles.itemMainRemoveCursor}>
                  <div className={styles.icon}>
                    <Icon name="network-duotone" size={40} type={'dark'} />
                  </div>
                  <div className={styles.content} key={index}>
                    <div className={styles.text}>
                      {/* <div>{obj.name}</div> */}
                      <div>
                        <Link
                          to={`/clusters/${cluster}/networks/${obj.name}/${obj.id}`}
                        >
                          {obj.name}
                        </Link>
                      </div>
                      <p>{t('RESOURCES_NAME')}</p>
                    </div>
                    <div className={styles.text}>
                      <div>{obj.type}</div>
                      <p>{t('RESOURCES_TYPE_YOO')}</p>
                    </div>
                    <div className={styles.text}>
                      <div>{obj.cidr}</div>
                      <p>{t('RESOURCES_CIDR')}</p>
                    </div>
                    <div className={styles.text}>
                      <div>{obj.gateway_ip}</div>
                      <p>{t('RESOURCES_GATEWAY')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
};

export default inject('detailStore')(observer(Status));
