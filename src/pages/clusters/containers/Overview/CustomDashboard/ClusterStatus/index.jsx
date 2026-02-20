import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import ComponentStore from 'stores/component'
import PodStore from 'stores/pod'
import { joinSelector } from 'utils'
import { get } from 'lodash'

const componentStore = new ComponentStore()
const podStore = new PodStore()

const ClusterStatus = ({ widgetKey, monitorStore, ...props }) => {
  const [componentData, setComponentData] = useState([])
  const [loading, setLoading] = useState(false)

  const componentItemList = document.querySelectorAll('.type_component')
  componentItemList.forEach(comp => {
    comp.addEventListener('mouseover', () => {
      const tooltip = comp.querySelector('.box_pop')
      const compRect = comp.getBoundingClientRect()

      tooltip.style.display = 'block'
      tooltip.style.top = compRect.bottom + 'px'
      tooltip.style.left = compRect.left + 'px'
      tooltip.style.width = compRect.width + 'px'
    })

    comp.addEventListener('mouseout', () => {
      const tooltip = comp.querySelector('.box_pop')
      tooltip.style.display = 'none'
    })
  })

  useEffect(() => {
    let cleanupTrigger = true

    const getK8sStatusData = async () => {
      setLoading(true)
      await componentStore.fetchList({ ...props })
      const { data } = componentStore.list
      const petasusData = data['petasus'].filter(
        arr =>
          arr.name === 'ks-apiserver' || arr.name === 'ks-controller-manager'
      )
      const componentData = data['kubernetes']
      // kubernetes

      if (cleanupTrigger) {
        setComponentData([...componentData, ...petasusData])
        setLoading(false)
      }
    }
    getK8sStatusData()

    return () => {
      cleanupTrigger = false
      setLoading(false)
    }
  }, [])

  return (
    <>
      {/* <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content"> */}
      {/* grid_item */}
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_CLUSTER_COMPONENT_STATE')}</label>
          <div className="right"></div>
        </div>
        <Loading spinning={loading}>
          <div className="grid_info style_status box_nth_wrap">
            {componentData.map((item, idx) => (
              <div className="box type_component" key={idx}>
                <h5>
                  <i className="ico-type-kubernetes-component"></i>
                  {item.name}
                </h5>
                <div className="status_box">
                  <p className="status_active">{item.healthyBackends}</p>
                  <p
                    className={`${
                      item.totalBackends - item.healthyBackends > 0
                        ? 'status_error'
                        : 'status_inactive'
                    }`}
                  >
                    {item.totalBackends - item.healthyBackends}
                  </p>
                  <PodList label={item.label} {...props}></PodList>
                </div>
              </div>
            ))}
          </div>
        </Loading>
        {/*// grid_info style_status */}
      </div>
      {/* // grid_item */}
      {/* </div>
      </div> */}
    </>
  )
}

export default ClusterStatus

const PodList = ({ label, ...props }) => {
  const [podList, setPodList] = useState([])

  useEffect(() => {
    const getPodList = async () => {
      const podList = await podStore.fetchList({
        limit: 1000,
        labelSelector: joinSelector(label),
        ...props,
      })
      setPodList(podList)
    }
    getPodList()
  }, [])

  return (
    <>
      {podList.length > 0 && (
        <div className="box_pop">
          {podList.map((item, idx) => (
            <div key={idx}>
              {idx === 0 && <h6>{item.labels[Object.keys(item.labels)[0]]}</h6>}
              <div className="status_wrap">
                <p
                  className={`status 
                ${
                  item.podStatus.type.toLowerCase() === 'error'
                    ? 'error'
                    : item.podStatus.type.toLowerCase() === 'running'
                    ? 'active'
                    : 'inactive'
                }`}
                >
                  <span>{item.node}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
