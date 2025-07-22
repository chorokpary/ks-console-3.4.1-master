import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { Icon, Loading } from '@kube-design/components';
import { Link } from 'react-router-dom';

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList';
import { Panel, Text } from 'components/Base';
import styles from './index.scss';
import RouterStore from 'stores/resources/routers';
import LoadBalancerStore from 'stores/resources/loadbalancers';

const Status = props => {
  const store = props.detailStore;
  const namespace = props.match.params.namespace;
  const cluster = props.detailStore?.detail.cluster;

  const routerStore = new RouterStore();
  const loadBalancerStore = new LoadBalancerStore();

  const [routerList, setRouterList] = useState([]);
  const [loadbalancerList, setLoadBalancerList] = useState([]);

  const [isLoadingRouter, setIsLoadingRouter] = useState(true);
  const [isLoadingLoadBalancer, setIsLoadingLoadBalancer] = useState(true);

  useEffect(() => {
    const networkName = props.match.params.name;

    const fnGetRouterData = async () => {
      const routerList = await routerStore.fetchList(props.match.params);
      const routerExternalList = await routerList.filter(
        item => item.external?.name === networkName,
      );
      const routerInternalList = await routerList.filter(item =>
        _.find(item['internal'], { name: networkName }),
      );

      const routerTernalList =
        routerExternalList.length > 0 ? routerExternalList : routerInternalList;

      setRouterList(routerTernalList);
      setIsLoadingRouter(false);
    };

    const fnGetLoadBalancerData = async () => {
      const loadBalancerList = await loadBalancerStore.fetchList(props.match.params);
      const loadBalancerFilterList = loadBalancerList.filter(
        item => item.network.name == networkName,
      );

      setLoadBalancerList(loadBalancerFilterList);
      setIsLoadingLoadBalancer(false);
    };

    fnGetRouterData();
    fnGetLoadBalancerData();
  }, []);

  return (
    <>
      <div>
        {/* 가상 머신 상세 관련 샘플 */}
        <DetailVmList
          type={t('RESOURCES_NETWORK')}
          match="network"
          name={props.match.params.name}
          project={namespace}
        />

        {/* 라우터 */}
        <div>
          {routerList.length == 0 && (
            <Panel title={t('RESOURCES_ROUTER')}>
              <div className={styles.wrapper}>
                {isLoadingRouter ? (
                  <div className={styles.loading}>
                    <Loading />
                  </div>
                ) : (
                  <div className={styles.empty}>
                    {t('RESOURCES_NO_ROUTER_USE_NETWORK')}
                  </div>
                )}
              </div>
            </Panel>
          )}
          {routerList.length > 0 && (
            <Panel title={t('RESOURCES_ROUTER')}>
              {routerList.map((obj, index) => (
                <div className={styles.wrapper} key={index}>
                  <div className={classnames(styles.item)}>
                    <div className={styles.icon}>
                      <Icon name="router" size={40} />
                    </div>
                    <div className={classnames(styles.title, styles.name)}>
                      <div>
                        <Link
                          to={`/clusters/${cluster}/projects/${namespace}/routers/${obj.name}`}
                        >
                          {obj.name}
                        </Link>
                      </div>
                      <p>{t('NAME')}</p>
                    </div>
                    <div className={styles.title}>
                      <div>
                        {obj.enable_snat
                          ? t('RESOURCES_USE')
                          : t('RESOURCES_NOT_USE')}
                      </div>
                      <p>{t('RESOURCES_SNAT_OPTION')}</p>
                    </div>
                    <div className={styles.title}>
                      <div>{obj.external?.name}</div>
                      <p>{t('RESOURCES_EXTERNAL_NETWORK')}</p>
                    </div>
                    <div className={styles.title}>
                      <div>
                        {obj.internal.length > 0
                          ? store.detail.name +
                          ` ${t('RESOURCES_BESIDES')} ${obj.internal.length -
                          1}${t('RESOURCES_COUNT')}`
                          : '-'}
                      </div>
                      <p>{t('RESOURCES_INTERNAL_NETWORK')}</p>
                    </div>
                    <div className={styles.title}>
                      <div>{obj.vrouter_ip}</div>
                      <p>{t('RESOURCES_VROUTER_IP')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Panel>
          )}
        </div>

        {/* 로드밸런서 */}
        <div>
          {loadbalancerList.length == 0 && (
            <Panel title={t('RESOURCES_LOAD_BALANCER')}>
              <div className={styles.wrapper}>
                {isLoadingLoadBalancer ? (
                  <div className={styles.loading}>
                    <Loading />
                  </div>
                ) : (
                  <div className={styles.empty}>
                    {t('RESOURCES_NO_LOAD_BALANCER_NETWORK')}
                  </div>
                )}
              </div>
            </Panel>
          )}
          {loadbalancerList.length > 0 && (
            <Panel title={t('RESOURCES_LOAD_BALANCER')}>
              {loadbalancerList.map((obj, index) => (
                <div className={styles.wrapper} key={index}>
                  <div className={classnames(styles.item)}>
                    <div className={styles.icon}>
                      <Icon name="loadbalancer" size={40} />
                    </div>
                    <div className={classnames(styles.title, styles.name)}>
                      <div>
                        <Link
                          to={`/clusters/${cluster}/loadBalancers/${obj.name}/${obj.id}`}
                        >
                          {obj.name}
                        </Link>
                      </div>
                      <p>{t('NAME')}</p>
                    </div>
                    <div className={styles.title}>
                      <div>
                        {obj.members.length > 0
                          ? obj.members.map(item => <p>{item}</p>)
                          : '-'}
                      </div>
                      <p>{t('RESOURCES_MEMBER_IP')}</p>
                    </div>
                    <div className={styles.title}>
                      <div>{obj.virtual_ip}</div>
                      <p>{t('RESOURCES_VIRTUAL_IP')}</p>
                    </div>
                    <div className={styles.title}>
                      <div>{obj.rule_count}</div>
                      <p>{t('RESOURCES_POLICY_COUNT')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Panel>
          )}
        </div>
      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status));
