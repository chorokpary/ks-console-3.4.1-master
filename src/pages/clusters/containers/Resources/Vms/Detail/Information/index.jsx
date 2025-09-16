import { get } from 'lodash'
import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'

import * as common from 'utils/resources'

import styles from './index.scss'

const Information = props => {
  const store = props.detailStore

  const [detailFlavor, setDetailFlavor] = useState(null)
  const [detailVolume, setDetailVolume] = useState([])
  const [detailNetwork, setDetailNetwork] = useState([])
  const [detailImage, setDetailImage] = useState({})

  const [hostDevicesList, setHostDevicesList] = useState([])
  const [mediatedDevicesList, setmMediatedDevicesList] = useState([])

  useEffect(() => {
    const fnGetFlavor = async () => {
      setDetailFlavor(store.detail.vm?.flavor)
    }

    const fnGetVolume = async () => {
      const volumeData = store.volumeList?.filter(
        el => el.used_by_vmi === store.detail.vm?.name
      )
      setDetailVolume(volumeData)
    }

    if (store.detail.vm?.networks.length > 0) {
      const networkData = (store.detail.vm?.networks).filter(
        el => el.name !== 'k8s-pod-network'
      )
      setDetailNetwork(networkData)
    }

    const fnGetHostDevices = async () => {
      const response = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.match.params.cluster}/edgetron/resources/kubevirt/host_devices`
      )
      setHostDevicesList(response.host_devices)
    }

    const fnGetMediatedDevices = async () => {
      const response = await request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.match.params.cluster}/edgetron/resources/kubevirt/mediated_devices`
      )
      setmMediatedDevicesList(response.mediated_devices)
    }

    const fnGetImage = async () => {
      setDetailImage(store.detail.vm?.image)
    }

    store.detail.vm?.flavor && fnGetFlavor()
    store.detail.vm?.image && fnGetImage()
    fnGetVolume()
    fnGetHostDevices()
    fnGetMediatedDevices()
  }, [])

  const fnGetHostDeviceIsGpu = name => {
    const data = hostDevicesList.filter(el => el.name === name)[0]
    return get(data, 'is_gpu')
  }

  const fnGetMediatedDeviceIsGpu = name => {
    const data = mediatedDevicesList.filter(el => el.resource_name === name)[0]
    return get(data, 'is_gpu')
  }

  const getState = state => {
    if (
      state === 'Provisioning' ||
      state === 'Starting' ||
      state === 'Booting' ||
      state === 'Stopping' ||
      state === 'Terminating' ||
      state === 'Migrating'
    ) {
      return 'warning'
    }
    if (state === 'Running') {
      return 'on'
    }
    if (state === 'Stopped' || state === 'Paused') {
      return 'off'
    }
    if (state === 'Unknown') {
      return 'error'
    }
    return 'error'
  }

  return (
    <>
      <div>
        <div className={styles.defaultWrapper}>
          <div className="content_box_wrap">
            <div className="tree_wrap">
              <div className="tree_box vm">
                <div className="title_icon">
                  <i
                    className={`ico-type40-vm ${getState(
                      store.detail.vm?.state
                    )}`}
                  ></i>
                </div>
                <div className="cont_box1">
                  <h5>
                    <span>VM</span>
                    {store.detail.vm?.name}
                  </h5>
                  <div className="group">
                    <div className="info">
                      <i
                        className={
                          store.detail.vm?.cpu_arch?.includes('x86')
                            ? 'ico-type24-x86'
                            : 'ico-type24-arm'
                        }
                      ></i>
                      <span>
                        {store.detail.vm?.cpu_arch?.includes('x86')
                          ? 'X86'
                          : 'ARM'}
                      </span>
                    </div>
                    {store.detail.vm?.image?.name && (
                      <div className="info">
                        <i className={`ico-os-${detailImage?.distro_type}`}></i>
                        <span>{store.detail.vm?.image?.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="cont_box2">
                  <div className="title_icon none">Flavor</div>
                  <div className="data">
                    <i className="ico-type24-cpu"></i>
                    <div className="info_text">
                      <h6>CPU</h6>
                      <span>{store.detail.vm?.flavor?.vcpus} Core</span>
                    </div>
                  </div>
                  <div className="data">
                    <i className="ico-type24-memory"></i>
                    <div className="info_text">
                      <h6>{t('RESOURCES_MEMORY')}</h6>
                      <span>
                        {common.fnSetBytes(store.detail.vm?.flavor?.ram)} GiB
                      </span>
                    </div>
                  </div>
                  <div className="data">
                    <i className="ico-type24-disk"></i>
                    <div className="info_text">
                      <h6>{t('RESOURCES_DISK')}</h6>
                      <span>{store.detail.vm?.flavor?.root_disk} GiB</span>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="tree_box_wrap">
                {// 호스트 디바이스
                detailFlavor?.gpus.length > 0 &&
                  detailFlavor?.gpus.map(device => {
                    const is_gpu = fnGetHostDeviceIsGpu(device.name)
                    return (
                      <>
                        {Array.from({ length: device.quantity }, () => (
                          <li>
                            <div className="tree_box">
                              <div className="title_icon">
                                <i
                                  className={
                                    is_gpu
                                      ? 'ico-type40-hostgpu'
                                      : 'ico-type40-hostdevice'
                                  }
                                ></i>
                              </div>
                              <div className="cont_box1">
                                <h5>
                                  <span className="bg_01">
                                    {is_gpu
                                      ? t('RESOURCES_GPU_DEVICE')
                                      : t('RESOURCES_HOST_DEVICE')}
                                  </span>
                                  {device.name}
                                </h5>
                                <div className="group">
                                  <div className="info">
                                    <span>{device.name.split('/')[1]}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </>
                    )
                  })}

                {// Mediated 디바이스
                detailFlavor?.devices.length > 0 &&
                  detailFlavor?.devices.map(device => {
                    const is_gpu = fnGetMediatedDeviceIsGpu(device.name)
                    return (
                      <>
                        {Array.from({ length: device.quantity }, () => (
                          <li>
                            <div className="tree_box">
                              <div className="title_icon">
                                <i
                                  className={
                                    is_gpu
                                      ? 'ico-type40-mediatedvgpu'
                                      : 'ico-type40-hostdevice'
                                  }
                                ></i>
                              </div>
                              <div className="cont_box1">
                                <h5>
                                  <span className="bg_01">
                                    {is_gpu
                                      ? t('RESOURCES_GPU_DEVICE')
                                      : t('RESOURCES_HOST_DEVICE')}
                                  </span>
                                  {device.name}
                                </h5>
                                <div className="group">
                                  <div className="info">
                                    <span>{device.name.split('/')[1]}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </>
                    )
                  })}

                {// 볼륨
                detailVolume.length > 0 &&
                  detailVolume.map(volume => {
                    return (
                      <li key={volume.name}>
                        <div className="tree_box">
                          <div className="title_icon">
                            <i className="ico-type40-volume"></i>
                          </div>
                          <div className="cont_box1">
                            <h5>
                              <span className="bg_03">
                                {t('RESOURCES_VOLUME')}
                              </span>
                              {volume.name}
                            </h5>
                            <div className="group">
                              <div className="info_2">
                                <span>{t('RESOURCES_CAPACITY')}</span>
                                <p>{volume.capacity}</p>
                              </div>
                              <div className="info_2">
                                <span>{t('RESOURCES_ACCESS_MODE')}</span>
                                <div className="info_box">
                                  {volume.access_modes.map(mode => (
                                    <p key={mode}>{mode}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}

                {// 네트워크
                detailNetwork.length > 0 &&
                  detailNetwork.map(network => {
                    return (
                      <li key={network.name}>
                        <div className="tree_box">
                          <div className="title_icon">
                            <i className="ico-type40-networkdevice"></i>
                          </div>
                          <div className="cont_box1">
                            <h5>
                              <span className="bg_04">NIC</span>
                              {network.interface}
                            </h5>
                            <div className="group">
                              <div className="info_2">
                                <span>IP</span>
                                <p>{network.ip}</p>
                              </div>
                              <div className="info_2">
                                <span>MAC</span>
                                <p>{network.mac}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default inject('detailStore')(observer(Information))
