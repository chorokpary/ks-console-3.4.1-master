import React, { useState, useEffect } from 'react';
import { get, groupBy } from 'lodash';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { Button, Notify, Icon, Loading } from '@kube-design/components';
import DetailVmList from 'pages/projects/containers/Resources/components/DetailVmList'

import { Panel, Text } from 'components/Base';
import styles from './index.scss';

import RouterStore from 'stores/resources/routers';
import LoadBalancerStore from 'stores/resources/loadbalancers';

const Status = props => {
  const store = props.detailStore;
  const { workspace, cluster, namespace } = props.match.params
  const routerStore = new RouterStore();
  const loadBalancerStore = new LoadBalancerStore();

  const [routerList, setRouterList] = useState([]);
  const [loadbalancerList, setLoadBalancerList] = useState([]);

  const [isLoadingRouter, setIsLoadingRouter] = useState(true);
  const [isLoadingLoadBalancer, setIsLoadingLoadBalancer] = useState(true);

  useEffect(() => {
    const sriovNetworkId = props.match.params.id;

    const fnGetRouterData = async () => {
      const routers = await routerStore.fetchList(props.match.params);

      const routerExternalList = await routers.filter(item => {
        return item.external?.id === sriovNetworkId;
      });

      const routerInternalList = await routers.filter(item =>
        _.find(item['internal'], { id: sriovNetworkId })
      );

      const routerTernalList =
        routerExternalList.length > 0 ? routerExternalList : routerInternalList;

      setRouterList(routerTernalList);
      setIsLoadingRouter(false);
    };

    const fnGetLoadBalancerData = async () => {
      const loadBalancerList = await loadBalancerStore.fetchList(props.match.params);
      const loadBalancerFilterList = loadBalancerList.filter(item => {
        return item.network == sriovNetworkId;
      });

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
          match="sriov_network"
          name={props.match.params.name}
          project={namespace}
          cluster={cluster}
          workspace={workspace}
        />
      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status));
