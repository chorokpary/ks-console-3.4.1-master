import { get, groupBy } from 'lodash';
import React, { useState, useEffect } from 'react';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';

import { Panel } from 'components/Base';
import { Icon, Button, Notify } from '@kube-design/components';

import styles from './index.scss';

const Status = props => {
  const store = props.detailStore;

  const [externalNetwork, setExternalNetwork] = useState(null);
  const [internalNetwork, setInternalNetwork] = useState([]);

  const { cluster, namespace } = props.match.params;

  const getPath = ({ cluster, namespace } = {}) => {
    let path = '';
    if (cluster) {
      path += `klusters/${cluster}`;
    }
    if (namespace) {
      path += `/namespaces/${namespace}`;
    }
    return path;
  };

  useEffect(() => {
    const fnGetExternalNetwork = async () => {
      const path = getPath({ cluster, namespace });
      const externalData = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1/${path}/edgetron/resources/kubevirt/networks/${store.detail.router.external.id}`
      );
      setExternalNetwork(externalData?.network);
    };

    const fnGetInternalNetwork = async () => {
      const path = getPath({ cluster, namespace });
      setInternalNetwork([]);
      const promises = (store.detail.router?.internal).map(async item => {
        const internalData = await request.get(
          `kapis/edgestack.kubesphere.io/v1alpha1/${path}/edgetron/resources/kubevirt/networks/${item.id}`
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
                {/* <Icon name="network-router" size={40} /> */}
                <i class="ico-type-externalnetwork"></i>
              </div>
              <div className={styles.content}>
                <div className={styles.text}>
                  <div>{externalNetwork.name}</div>
                  <p>{t('RESOURCES_NAME')}</p>
                </div>
                <div className={styles.text}>
                  <div>{externalNetwork.type}</div>
                  <p>{t('RESOURCES_TYPE_YOO')}</p>
                </div>
                <div className={styles.text}>
                  <div>{externalNetwork.cidr}</div>
                  <p>CIDR</p>
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
                      <div>{obj.name}</div>
                      <p>{t('RESOURCES_NAME')}</p>
                    </div>
                    <div className={styles.text}>
                      <div>{obj.type}</div>
                      <p>{t('RESOURCES_TYPE_YOO')}</p>
                    </div>
                    <div className={styles.text}>
                      <div>{obj.cidr}</div>
                      <p>CIDR</p>
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
