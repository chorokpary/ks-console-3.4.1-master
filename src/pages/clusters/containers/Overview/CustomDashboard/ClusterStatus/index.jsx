import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import ComponentStore from 'stores/component'
import PodStore from 'stores/pod'
import { joinSelector } from 'utils'
import { get } from 'lodash'

const componentStore = new ComponentStore()
const podStore = new PodStore()

const ClusterStatus = () => {

  const [componentData, setComponentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [asd, setasd] = useState();
  const [podList, setPodList] = useState([]);

  useEffect(() => {

    const getK8sStatusData = async () => {
      setLoading(true)
      await componentStore.fetchList({ cluster: 'default' })
      const { data } = componentStore.list;
      const componentData = data['kubernetes']
      // kubesphere
      // kubernetes
      setComponentData(componentData)
      setLoading(false)
    };
    getK8sStatusData();

  }, [])

  return (
    <>
      <div className="grid-stack-item" gs-x="4" gs-y="36" gs-w="5" gs-h="5">
        <div className="grid-stack-item-content pop_over">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>클러스터 컴포넌트 상태</label>
              <div className="right">
              </div>
            </div>
            <div className="grid_info style_status box_nth_wrap">
              {componentData.map((item, idx) => (
                <div className="box type_component" key={idx}>
                  {/* <Loading spinning={loading}> */}
                  <h5><i className="ico-type-kubernetes-component"></i>{item.name}</h5>
                  <div className="status_box">
                    <p className="status_active">{item.healthyBackends}</p>
                    <p className={`${item.totalBackends - item.healthyBackends > 0 ? 'status_error' : 'status_inactive'}`}>
                      {item.totalBackends - item.healthyBackends}
                    </p>
                    <PodList label={item.label}></PodList>
                  </div>
                  {/* </Loading> */}
                </div>
              ))}
            </div>
            {/*// grid_info style_status */}

          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default ClusterStatus

const PodList = ({ label }) => {

  const [podList, setPodList] = useState([])

  useEffect(() => {
    const getPodList = async () => {
      const podList = await podStore.fetchList({ limit: 1000, labelSelector: joinSelector(label) })
      setPodList(podList)
    };
    getPodList();
  }, [])

  return (
    <>
      {podList.length > 0 &&
        <>
          <div className="box_pop">
            <h6>Kubeproxy</h6>
            {podList.map((item, idx) => (
              <div className="status_wrap" key={idx}>
                <p className={`status 
                ${item.podStatus.type.toLowerCase() === 'error' ? 'error' :
                    item.podStatus.type.toLowerCase() === 'running' ? 'active' : 'inactive'}`
                }>
                  <span>{item.node}</span>
                </p>
              </div>
            ))}
          </div>
        </>
      }
    </>
  )
}