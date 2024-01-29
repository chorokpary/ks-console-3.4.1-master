import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import ComponentStore from 'stores/component'
import PodStore from 'stores/pod'
import { joinSelector } from 'utils'
import { get } from 'lodash'

const componentStore = new ComponentStore()
const podStore = new PodStore()

const ClusterStatus = ({ x, y, w, h }) => {

  const [componentData, setComponentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const componentItemList = document.querySelectorAll('.type_component');
  componentItemList.forEach((comp) => {
    comp.addEventListener('mouseover', () => {
      const tooltip = comp.querySelector('.box_pop');
      const compRect = comp.getBoundingClientRect();

      tooltip.style.display = 'block';
      tooltip.style.top = compRect.bottom + 'px';
      tooltip.style.left = compRect.left + 'px';
      tooltip.style.width = compRect.width + 'px';
    });

    comp.addEventListener('mouseout', () => {
      const tooltip = comp.querySelector('.box_pop');
      tooltip.style.display = 'none';
    });
  }
  );

  useEffect(() => {

    let cleanupTrigger = true;

    const getK8sStatusData = async () => {
      setLoading(true)
      await componentStore.fetchList({ cluster: 'default' })
      const { data } = componentStore.list;
      const componentData = data['kubernetes']
      // kubesphere
      // kubernetes

      if (cleanupTrigger) {
        setComponentData(componentData)
        setLoading(false)
      }
    };
    getK8sStatusData();



    return () => {
      cleanupTrigger = false
      setLoading(false)
    }

  }, [])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_CLUSTER_COMPONENT_STATE')}</label>
              <div className="right">
              </div>
            </div>
            <Loading spinning={loading}>
              <div className="grid_info style_status box_nth_wrap">
                {componentData.map((item, idx) => (
                  <div className="box type_component" key={idx}>
                    <h5><i className="ico-type-kubernetes-component"></i>{item.name}</h5>
                    <div className="status_box">
                      <p className="status_active">{item.healthyBackends}</p>
                      <p className={`${item.totalBackends - item.healthyBackends > 0 ? 'status_error' : 'status_inactive'}`}>
                        {item.totalBackends - item.healthyBackends}
                      </p>
                      <PodList label={item.label}></PodList>
                    </div>
                  </div>
                ))}
              </div>
            </Loading>
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