import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import ConfigMapStore from 'stores/configmap'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'
import cleanupTrigger from '../cleanupTrigger'
import { get, set } from 'lodash'

const SystemPod = ({ widgetKey, monitorStore, ...props }) => {
  const podStore = new PodStore()
  const configMapStore = new ConfigMapStore()

  const pods = new PodModel()
  const [data, setData] = useState(pods)
  const [namespaceArr, setNamespaceArr] = useState([])
  const defaultNamespaceArr = [
    'edgestack',
    'cmp',
    'harbor',
    'kubesphere-system',
    'kubesphere-monitoring-system',
    'kubesphere-logging-system',
    'kubesphere-controls-system',
    'kubesphere-audit-system',
    'kubevirt',
    'ingress-nginx',
    'weave',
  ]
  const defaultConfigName = 'system-pod-config'

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getConfigMapStore()
  }, [])

  useEffect(() => {
    if (namespaceArr.length > 0) {
      getPodList()
    }
  }, [namespaceArr])

  const getPodList = async () => {
    const podData = await podStore.fetchList({ limit: 1000, ...props })
    const podList = podData.filter(item =>
      namespaceArr.includes(item.namespace)
    )

    const data = fnSetPods(podList, pods)
    setData(data)

    setLoading(false)
  }

  const getConfigMapStore = async () => {
    setLoading(true)
    const configMapData = await configMapStore.fetchList({
      namespace: 'default',
      name: defaultConfigName,
    })

    if (configMapData.length > 0) {
      const namespace = get(configMapData[0], 'data.namespace', 'default')

      const namespaceArr = JSON.parse(namespace)
      setNamespaceArr(namespaceArr)
    } else {
      setNamespaceArr(defaultNamespaceArr)
      configMapStore.create(
        {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: {
            namespace: 'default',
            name: defaultConfigName,
          },
          data: {
            namespace: JSON.stringify(defaultNamespaceArr),
          },
        },
        {
          cluster: props.cluster,
          namespace: 'default',
        }
      )
    }
  }

  return (
    <>
      <div className="grid_item">
        <div className="grid_title" style={{ cursor: 'default' }}>
          <label>{t('RESOURCES_SYSTEM_POD_PL')}</label>
        </div>
        <Loading spinning={loading}>
          <div className="grid_info style_status">
            <div className="box type_status">
              <div className="cont_group">
                <div className="cont1">
                  <div className="number_wrap">
                    <i className="ico-type-pod"></i>
                    <p>
                      <span className="em">{data.running}</span> / {data.total}
                    </p>
                  </div>
                </div>
                <div className="cont2">
                  <div className="status_wrap">
                    <div className="value">{data.waiting}</div>
                    <p className="status waiting">
                      <span>{t('RESOURCES_WAITING')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{data.running}</div>
                    <p className="status running">
                      <span>{t('RESOURCES_RUNNING')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{data.completed}</div>
                    <p className="status completed">
                      <span>{t('RESOURCES_COMPLETED')}</span>
                    </p>
                  </div>
                  <div className="status_wrap">
                    <div className="value">{data.error}</div>
                    <p className="status error">
                      <span>{t('RESOURCES_ERROR')}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Loading>
      </div>
    </>
  )
}

export default SystemPod
