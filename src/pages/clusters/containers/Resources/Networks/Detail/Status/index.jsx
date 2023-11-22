import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'
import classnames from 'classnames'

import { Panel, Text } from 'components/Base'
import { Icon, Loading } from '@kube-design/components'
import styles from './index.scss'

import RouterStore from 'stores/resources/routers'
import LoadBalancerStore from 'stores/resources/loadbalancers'

const Status = (props) => {
    // console.log("props : "+ JSON.stringify(props))
    const store = props.detailStore;

    const routerStore = new RouterStore();
    const loadBalancerStore = new LoadBalancerStore();

    const [routerList, setRouterList] = useState([]);
    const [loadbalancerList, setLoadBalancerList] = useState([]);

    const [isLoadingRouter, setIsLoadingRouter] = useState(true);
    const [isLoadingLoadBalancer, setIsLoadingLoadBalancer] = useState(true);

    useEffect(() => {

        const networkName = props.match.params.name;

        console.log("props.route : "+ JSON.stringify(props.route))

        const fnGetRouterData = async () => {

            const routerList = await routerStore.fetchList();
            const routerExternalList =  await routerList.filter(item => item.external == networkName );
            const routerInternalList =  await routerList.filter(item => (item.internal).includes(networkName));

            const routerTernalList = routerExternalList.length > 0 ? routerExternalList : routerInternalList;

            setRouterList(routerTernalList);
            setIsLoadingRouter(false);
        }

        
        const fnGetLoadBalancerData = async () => {
            const loadBalancerList = await loadBalancerStore.fetchList();
            const loadBalancerFilterList =  loadBalancerList.filter(item => item.network == networkName ) ;
            
            setLoadBalancerList(loadBalancerFilterList);
            setIsLoadingLoadBalancer(false)
        }

       fnGetRouterData();
       fnGetLoadBalancerData();

    },[]);

    return (
        <>
            <div>                

                {/* 가상 머신 상세 관련 샘플 */}
                <DetailVmList type='네트워크' variables='networks' name={props.match.params.name} />

                {/* 라우터 */}
                <div>
                    {routerList.length == 0 &&
                        <Panel title={"라우터"}>
                            <div className={styles.wrapper}>
                                {isLoadingRouter ? <div className={styles.loading}><Loading /></div>
                                :
                                <div className={styles.empty}>네트워크를 사용하는 라우터가 없습니다.</div>
                                 }                                
                            </div>
                        </Panel>
                    }
                    {routerList.length > 0 &&
                        < Panel title={"라우터"}>
                            {routerList.map((obj, index) => (
                                <div className={styles.wrapper} key={index}>
                                    <div className={classnames(styles.item)}>
                                        <div className={styles.icon}>
                                            <Icon name="router" size={40} />
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{obj.name}</div>
                                            <p>이름</p>
                                        </div>
                                        <div className={styles.title}>
                                            <div>{obj.enable_snat ? "사용" : "미사용"}</div>
                                            <p>SNAT 옵션</p>
                                        </div>
                                        <div className={styles.title}>
                                            <div>{obj.external}</div>
                                            <p>외부 네트워크</p>
                                        </div>
                                        <div className={styles.title}>
                                            <div>{(obj.internal).length > 0 ?  store.detail.name + ` 외 ${(obj.internal).length-1}개`: "-"}</div>
                                            <p>내부 네트워크</p>
                                        </div>
                                        <div className={styles.title}>
                                            <div>{obj.vrouter_ip}</div>
                                            <p>가상 라우터 IP</p>
                                        </div>
                                       
                                    </div>
                                </div>
                            ))}
                        </Panel>
                    }
                </div>

                {/* 로드밸런서 */}
                <div>
                    {loadbalancerList.length == 0 &&
                        <Panel title={"로드밸런서"}>
                            <div className={styles.wrapper}>
                                {isLoadingLoadBalancer ? <div className={styles.loading}><Loading /></div>
                                :
                                <div className={styles.empty}>네트워크를 사용하는 로드밸런서가 없습니다.</div>
                                 }  
                            </div>
                        </Panel>
                    }
                    {loadbalancerList.length > 0 &&
                        < Panel title={"로드밸런서"}>
                            {loadbalancerList.map((obj, index) => (
                                <div className={styles.wrapper} key={index}>
                                    <div className={classnames(styles.item)}>
                                        <div className={styles.icon}>
                                            <Icon name="router" size={40} />
                                        </div>
                                        <div className={classnames(styles.title, styles.name)}>
                                            <div>{obj.name}</div>
                                            <p>이름</p>
                                        </div>
                                        <div className={styles.title}>
                                            <div>{(obj.members).length > 0 ? (obj.members).map(item => <p>{item}</p>) : "-"}</div>
                                            <p>멤버 IP</p>
                                        </div>
                                        <div className={styles.title}>
                                            <div>{obj.virtual_ip}</div>
                                            <p>가상 IP</p>
                                        </div>
                                        <div className={styles.title}>
                                            <div>{obj.rules_count}</div>
                                            <p>정책 갯수</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Panel>
                    }
              
                </div>

            </div>
        </>
    );
};

export default inject('detailStore')(observer(Status))

