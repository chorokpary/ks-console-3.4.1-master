import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import classnames from 'classnames'

import { Icon, Button, Notify } from '@kube-design/components'
import { Link } from 'react-router-dom'
import { Panel, Text, Indicator } from 'components/Base'

import * as common from 'utils/resources'

import VmStore from 'stores/resources/vms'
import DetailGpuVmList from 'pages/clusters/containers/Resources/components/DetailGpuVmList';

import styles from './index.scss'

const Status = (props) => {

  const vmStore = new VmStore()

  const store = props.detailStore;

  const { cluster } = props.match.params

  const [detailFlavor, setDetailFlavor] = useState(null)
  const [detailNetwork, setDetailNetwork] = useState([])

  // 초기 데이터 처리
  useEffect(() => {

    if (!store.detail) return

    const fnGetVmDetail = async () => {
      const vmData = (store.detail.data.nodes).filter(item => item.vmi)

      const sortedList = [...vmData].sort((a, b) => {
       return a.vmi.vm_name < b.vmi.vm_name ? 1 : a.vmi.vm_name > b.vmi.vm_name ? -1 : 0;
      });

      const vmName = sortedList[0]?.vmi?.vm_name;
      
      if(!!vmName){
        // vm detail data
        const vmDetail = await vmStore.fetchDetail({ project: cluster, name: vmName })
        
        fnGetFlavor(vmDetail);
        fnGetNetwork(vmDetail);
      }      
    }

    const fnGetFlavor = async (vmDetail) => {
      setDetailFlavor(vmDetail.vm?.flavor)
    }

    const fnGetNetwork = async (vmDetail) => {
      setDetailNetwork([])

      const networkData = await vmStore.fetchVmListNetwork({ project: cluster })
      const networkNameArray = vmDetail.vm?.networks.map(item => item.name)
      const filterData = (networkData.networks).filter(item => {
        return networkNameArray.includes(item.name)
      })

      if (filterData.length > 0) {
        const promises = filterData.filter(async network => {
          if (network.name !== 'k8s-pod-network') {
            const networkDetail = await request.get(
              `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${cluster}/edgetron/resources/kubevirt/networks/${network.name}?project=${network.project}`
            )
            networkDetail.network.endpoint = 'networks'
            networkDetail.network.unique = 'project_name'
            setDetailNetwork(value => [...value, networkDetail.network])
          }
        })
        await Promise.all(promises)
      }
    }

    fnGetVmDetail();
  }, [])

  return (
    <>
      <div>

        {/* GPU 클러스터 */}
        <Panel title={'GPU 클러스터'}>
          <div className={styles.wrapper}>
            <div className={classnames(styles.itemFlavor)}>
              <div className={styles.icon}>
                <i className="ico-type-mediatedvgpu"></i>
              </div>
              <div className={classnames(styles.title, styles.name)}>
                <div>
                    {store.detail.name}
                </div>
                <p>{t('RESOURCES_GPU_CLUSTER')}</p>
              </div>
              <div className={classnames(styles.title, styles.name)}>
                <div>
                    {store.detail.data.namespace}
                </div>
                <p>{t('RESOURCES_PROJECT')}</p>
              </div>
            </div>
          </div>
        </Panel>

        {/* Flavor */}
        {!!detailFlavor && (
          <Panel title={'Flavor'}>
            <div className={styles.wrapper}>
              <div className={classnames(styles.itemFlavor)}>
                <div className={styles.icon}>
                  <Icon name="apps" size={40} />
                </div>
                <div className={classnames(styles.title, styles.name)}>
                  <div>
                    <Link
                      to={`/clusters/${cluster}/flavors/${detailFlavor.name}`}
                    >
                      {detailFlavor.name}
                    </Link>
                  </div>
                  <p>{t('RESOURCES_NAME')}</p>
                </div>
                <div className={styles.title}>
                  <Text
                    key="CPU"
                    icon="cpu"
                    title={`${detailFlavor.vcpus} Core`}
                    description={t('CPU')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key="Memory"
                    icon="memory"
                    title={`${common.fnSetBytes(detailFlavor.ram)} GiB`}
                    description={t('Memory')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key="Disk"
                    icon="storage"
                    title={`${detailFlavor.root_disk} GiB`}
                    description={t('Disk')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key="GPU"
                    icon="gpu"
                    title={
                      detailFlavor.gpus.length >= 1
                        ? detailFlavor.gpus.length == 1
                          ? detailFlavor.gpus[0].quantity+" " +detailFlavor.gpus[0].name
                          : `${detailFlavor.gpus[0].name} ${t(
                            'RESOURCES_BESIDES'
                          )} ${detailFlavor.gpus.length - 1}${t(
                            'RESOURCES_COUNT'
                          )}`
                        : '-'
                    }
                    description={t('GPU')}
                  />
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* 네트워크 */}
        {detailNetwork.length > 0 && (
          <Panel title={t('RESOURCES_NETWORK')}>
            <div className={styles.wrapper}>
              {detailNetwork.map((obj, index) => (
                <div className={classnames(styles.itemNetwork)} key={index}>
                  <div className={styles.icon}>
                    {!obj.resource_name ? (
                      <Icon name={`network-duotone`} size={40} />
                    ) : (
                      <i className="ico-type40-sriov"></i>
                    )}
                  </div>
                  <div className={classnames(styles.title, styles.name)}>
                    <div>
                      {obj.unique == "id" ? (
                        <Link
                          to={`/clusters/${cluster}/${obj.endpoint}/${obj.name}/${obj.id}`}
                        >
                          {obj.name}
                        </Link>
                      ) : (
                        obj.unique == "name" ? (
                          <Link to={`/clusters/${cluster}/${obj.endpoint}/${obj.name}`}>
                            {obj.name}
                          </Link>
                        ) : (
                          <Link to={`/clusters/${cluster}/projects/${obj.project}/${obj.endpoint}/${obj.name}`}>
                            {obj.name}
                          </Link>
                        )
                      )}
                    </div>
                    <p>{t('RESOURCES_NAME')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.type.toUpperCase()}</div>
                    <p>{t('RESOURCES_TYPE_YOO')}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{obj.cidr}</div>
                    <p>CIDR</p>
                  </div>
                  <div className={styles.title}>
                    <div>{`${obj.gateway_ip === undefined || obj.gateway_ip === ""
                      ? "-"
                      : obj.gateway_ip
                      }`}
                    </div>
                    <p>{t('RESOURCES_GATEWAY')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        <DetailGpuVmList
          type={t('RESOURCES_GPU_CLUSTER')}
          variables="gpuclusters"
          {...props.match.params}
          id={props.match.params.id}        
        />

      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status))

