import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Form,
  Input,
  Radio,
  Select,
  Slider,
  TextArea,
  Tabs,
} from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import classnames from 'classnames'

import { Modal } from 'components/Base'
import { PropertiesInput } from 'components/Inputs'
import { PATTERN_USER_NAME } from 'utils/constants'
import VmStore from 'stores/resources/vms'
import ResourceStore from 'stores/resources/containerresource'
import GpuNodeStore from 'stores/resources/gpunodes'
import * as common from 'utils/resources'
import TypeSelect from '../../../TypeSelect'
import styles from './index.scss'

const RegistNodePoolModal = props => {
  const form = useRef()
  const [formData] = useState({})

  const vmStore = new VmStore()
  const resourceStore = new ResourceStore()
  const gpuNodeStore = new GpuNodeStore()

  const [modelView, setModalView] = useState(true)

  const [flavorDataList, setFlavorDataList] = useState([])
  const [flavorOptionList, setFlavorOptionList] = useState([])
  const [imageDataList, setImageDataList] = useState([])
  const [selectImageName, setSelectImageName] = useState('')
  const [imageOptionList, setImageOptionList] = useState([])
  const [storageClassDataList, setStorageClassDataList] = useState([])

  const [acceleratorType, setAcceleratorType] = useState('None')
  const [acceleratorTypeList, setAcceleratorTypeList] = useState(['None'])

  const [kubeVersion, setKubeVersion] = useState('')
  const [nodepoolReplicas, setNodepoolReplicas] = useState(1)

  const [osType] = useState('linux')
  const [osDistro, setOsDistro] = useState('ubuntu-2004')

  const [isAutoScale, setIsAutoScale] = useState(false)
  const [autoScale, setAutoScale] = useState([1, 3])

  // Storage Class 관련 상태 추가
  const [storageClass, setStorageClass] = useState('')
  const [imageStorageClass, setImageStorageClass] = useState('')
  const [storageClassTab, setStorageClassTab] = useState('default') // 'default', 'image', 'manual'

  // NodeSelector 관련 상태 추가
  const [nodeSelector, setNodeSelector] = useState({})
  const [nodeSelectorError, setNodeSelectorError] = useState(false)

  // 네트워크 관련 상태 추가
  const [networkFlag, setNetworkFlag] = useState(1)
  const [networkName, setNetworkName] = useState('')
  const [networkCheckItem, setNetworkCheckItem] = useState('')
  const [sriovCheckItem, setSriovCheckItem] = useState('')
  const [networkList, setNetworkList] = useState([])
  const [sriovNetworkList, setSriovNetworkList] = useState([])

  useEffect(() => {
    const getVmCreateData = async () => {
      const listFlavor = await vmStore.fetchVmListFlavor({
        sortBy: 'root_disk',
        ...props,
      })
      const listImage = await resourceStore.fetchListImage(props)

      const listStoregeClass = await vmStore.fetchVmListStoregeClass({
        ...props,
      })

      // 네트워크 데이터 가져오기
      const listNetwork = await vmStore.fetchVmListNetwork({
        ...props,
      })
      const listSriovNetwork = await vmStore.fetchVmListSriovNetwork({
        ...props,
      })

      setFlavorDataList(listFlavor.flavors)
      setImageDataList(listImage._originData.images)
      setOsDistro(props.detailStore.detail.cluster.os_distro)
      setKubeVersion(props.detailStore.detail.cluster.kube_version)
      setStorageClassDataList(listStoregeClass.user_sces)

      // 네트워크 데이터 설정
      setNetworkList(listNetwork.networks)
      setSriovNetworkList(listSriovNetwork.sriovs)
    }
    const getAcceleratorTypeList = async () => {
      const accelList = await gpuNodeStore.fetchAcceleratorTypeList(props)
      setAcceleratorTypeList(accelList)
    }

    getVmCreateData().then()
    getAcceleratorTypeList().then()
  }, [])

  useEffect(() => {
    if (selectImageName) {
      const selectOs = imageOptionList.find(obj => selectImageName === obj.name)
      setOsDistro(selectOs?.os_distro)
    }
  }, [selectImageName])

  const archOptions = () => {
    const uniqueArchOptions = new Set(
      imageDataList
        .filter(obj => obj.os_distro === osDistro)
        .map(obj => t(obj.arch_type))
    )
    return Array.from(uniqueArchOptions).map(arch => {
      let label
      switch (arch) {
        case 'x86_64':
          label = 'amd64'
          break
        case 'aarch64':
          label = 'arm64'
          break
        default:
          label = arch
      }
      return {
        label: t(label),
        value: t(arch),
        description: `${t(arch)} ${t('RESOURCES_CPU_ARCH')}`,
      }
    })
  }

  const flavorOptions = () => {
    return flavorOptionList.map(obj => {
      const gpuDesc =
        obj.gpus && obj.gpus.length > 0
          ? ` / ${obj.gpus
              .map(g => `${g.name.split('/')[1]}: ${g.quantity}`)
              .join(', ')}`
          : ''

      const deviceDesc =
        obj.devices && obj.devices.length > 0
          ? `\n ${obj.devices.map(d => `${d.name}: ${d.quantity}`).join(', ')}`
          : ''

      const desc = `CPU ${obj.vcpus} Cores / Mem ${common.fnSetBytes(
        obj.ram
      )}GiB / Disk ${obj.root_disk}GiB${gpuDesc}${deviceDesc}`

      return {
        label: t(obj.name),
        description: desc,
        value: t(obj.name),
      }
    })
  }

  const imageOptions = () => {
    return imageOptionList.map(obj => {
      const distroType = obj.os_distro.split('-')[0]
      return {
        label: t(obj.name),
        icon: `ico-os-${distroType}`,
        value: t(obj.name),
        description: obj.description ? t(obj.description) : '-',
        disabled: obj.phase !== 'Succeeded',
      }
    })
  }

  const acceleratorOptions = () => {
    return acceleratorTypeList.map(obj => ({
      label: t(obj),
      description: ' ',
      value: t(obj),
    }))
  }

  const storageClassOptions = () => {
    return storageClassDataList.map(obj => {
      return {
        label: t(obj.name),
        value: t(obj.name),
      }
    })
  }

  const handleOk = () => {
    const onOk = props.onOk
    form.current.validator(() => {
      const { data } = form.current.props
      const scaleRange = {}
      scaleRange.min_replicas = isAutoScale ? autoScale[0] : 0
      scaleRange.max_replicas = isAutoScale ? autoScale[1] : 0
      data.nodepool_replicas = nodepoolReplicas
      data.autoscale = isAutoScale
      data.scale_range = scaleRange
      data.node_selectors = nodeSelector
      data.storage_class = storageClass

      // 네트워크 데이터 추가
      data.network_flag = networkFlag
      if (networkFlag === 1) {
        data.external_network = networkCheckItem
      } else if (networkFlag === 2) {
        data.sriov_network = sriovCheckItem
      }

      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  const fnGetModalFooter = () => {
    return (
      <>
        <Button
          onClick={() => closeModal()}
          className={classnames(styles['btn'], styles['btn-default'])}
        >
          {t('RESOURCES_CANCEL')}
        </Button>
        <Button
          onClick={() => {
            handleOk()
          }}
          className={classnames(styles['btn'], styles['btn-control'])}
          loading={props.nodePoolStore.isSubmitting}
          disabled={props.nodePoolStore.isSubmitting}
        >
          {t('RESOURCES_CREATE')}
        </Button>
      </>
    )
  }

  const handleNodepoolArch = value => {
    // setNodepoolArchSelect(value)
    setSelectImageName('')
    setImageOptionList(
      imageDataList.filter(
        obj =>
          obj.accelerator_type.toLowerCase() ===
            acceleratorType.toLowerCase() &&
          obj.os_distro === osDistro &&
          obj.kube_version === kubeVersion &&
          obj.arch_type === value
      )
    )
  }

  const handleAcceleratorType = value => {
    setAcceleratorType(value)
    setSelectImageName('')
    setImageOptionList(
      imageDataList.filter(
        obj =>
          obj.accelerator_type.toLowerCase() === value.toLowerCase() &&
          obj.os_distro === osDistro &&
          obj.kube_version === kubeVersion
      )
    )
    setFlavorOptionList(
      flavorDataList.filter(flavor => {
        if (value.toLowerCase() === '' || value.toLowerCase() === 'none') {
          return flavor.gpus.length === 0
        }
        return flavor.gpus.some(gpu =>
          gpu.name.toLowerCase().includes(value.toLowerCase())
        )
      })
    )
  }

  // Validation 시작 ==================================================
  const imageValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_IMAGE_TIP') })
    }
    callback()
  }

  // 스크립트 시작 ==================================================
  // cpu count
  const increaseReplicaBtn = e => {
    e.preventDefault()
    if (nodepoolReplicas < 10) {
      setNodepoolReplicas(nodepoolReplicas + 1)
    }
  }
  const decreaseReplicaBtn = e => {
    e.preventDefault()
    if (nodepoolReplicas > 1) {
      setNodepoolReplicas(nodepoolReplicas - 1)
    }
  }

  const handlerAutoScale = e => {
    if (Array.isArray(e)) {
      const scale = [e[0], e[1] < 1 ? 1 : e[1]]
      setAutoScale(scale)
    } else {
      const maxNum = e > 10 ? 10 : e < 1 ? 1 : e
      setAutoScale([1, maxNum])
    }
  }

  // NodeSelector 관련 핸들러 추가
  const handleNodeSelectorChange = value => {
    setNodeSelector(value)
  }

  const handleNodeSelectorError = error => {
    setNodeSelectorError(!!error)
  }

  const onChangeNetwork = el => {
    setNetworkFlag(el)
    setNetworkName('')
    handleSingleCheck('', 'sriov')
    handleSingleCheck('', 'network')
  }

  const handleSingleCheck = (name, type) => {
    setVariables[type](name)
    setNetworkName(name)
  }

  const setVariables = {
    network: setNetworkCheckItem,
    sriov: setSriovCheckItem,
  }

  // 스크립트 끝 ==================================================
  const { TabPanel } = Tabs

  return (
    <>
      <Modal
        icon="templet"
        width={800}
        title={t('RESOURCES_CREATE_NODEPOOL')}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form}>
          {/* Content */}
          <div className={styles.pop_overflow_y}>
            <div className={styles.cont_boxwrap}>
              {/* 기본설정 설정 시작========================================== */}
              <div>
                <Form.Item
                  label={t('NAME')}
                  rules={[
                    { required: true, message: t('NAME_EMPTY_DESC') },
                    {
                      pattern: PATTERN_USER_NAME,
                      message: t('RESOURCES_INVALID_NAME_DESC'),
                    },
                  ]}
                  desc={t('NAME_DESC')}
                >
                  <Input
                    name="name"
                    autoFocus={true}
                    maxLength={63}
                    style={{ maxWidth: 'none' }}
                  />
                </Form.Item>
                <div style={{ padding: 3 }} />
                NodePool
                <span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
                      <Form.Item>
                        <TypeSelect
                          name="accelerator"
                          defaultValue={t('RESOURCES_SELECT')}
                          options={acceleratorOptions()}
                          placeholder={{ label: t('RESOURCES_SELECT') }}
                          onChange={e => handleAcceleratorType(e)}
                          defaultDescription={t(
                            'RESOURCES_SELECT_NODEPOOL_ACCELERATOR_TIP'
                          )}
                        />
                      </Form.Item>
                      <Form.Item>
                        <TypeSelect
                          name="architecture"
                          defaultValue={t('RESOURCES_SELECT')}
                          options={archOptions()}
                          placeholder={{ label: t('RESOURCES_SELECT') }}
                          onChange={e => handleNodepoolArch(e)}
                          defaultDescription={t(
                            'RESOURCES_SELECT_NODEPOOL_ARCH_TIP'
                          )}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item>
                        <TypeSelect
                          name="flavor"
                          defaultValue={t('RESOURCES_SELECT')}
                          options={flavorOptions()}
                          placeholder={{ label: t('RESOURCES_SELECT') }}
                          defaultDescription={t(
                            'RESOURCES_SELECT_NODEPOOL_FLAVOR_TIP'
                          )}
                        />
                      </Form.Item>
                      <Form.Item
                        rules={[{ required: true, validator: imageValidator }]}
                      >
                        <TypeSelect
                          name="kube_image"
                          defaultValue={t('RESOURCES_SELECT')}
                          placeholder={{
                            label: t('RESOURCES_SELECT'),
                          }}
                          options={imageOptions()}
                          onChange={e => {
                            setSelectImageName(e)
                            // 이미지 선택 시 storage_class 업데이트
                            const imageSC = imageOptionList.find(
                              item => item.name === e
                            )?.storage_class
                            if (imageSC) {
                              setImageStorageClass(imageSC)
                            }
                            if (storageClassTab === 'image') {
                              setStorageClass(imageSC)
                            }
                          }}
                          defaultDescription={t('RESOURCES_SELECT_IMAGE_TIP')}
                        />
                      </Form.Item>
                      {selectImageName && (
                        <Form.Item>
                          <div className={styles.wrapperImageView}>
                            {`${osType[0].toUpperCase() +
                              osType.slice(
                                1,
                                osType.length
                              )} > ${selectImageName}`}
                          </div>
                        </Form.Item>
                      )}
                    </Column>
                  </Columns>
                </Form.Group>
                {/* 네트워크 설정 시작========================================== */}
                <div style={{ marginTop: 24, marginBottom: 24 }}>
                  <div className={styles.box_title} style={{ marginBottom: 8 }}>
                    <label>
                      {t('RESOURCES_NETWORK')}
                      <span className="form-item-required">*</span>
                    </label>
                  </div>
                  <Form.Group>
                    <Form.Item>
                      <div>
                        <Select
                          options={[
                            { label: t('RESOURCES_NETWORK'), value: 1 },
                            { label: t('RESOURCES_SR_IOV_NETWORK'), value: 2 },
                          ]}
                          onChange={e => onChangeNetwork(e)}
                          defaultValue={1}
                        />
                      </div>
                    </Form.Item>

                    <Form.Item
                      label={t('RESOURCES_NETWORK')}
                      className={`${networkFlag === 1 ? '' : 'hide'}`}
                    >
                      <div className={styles.wrapper}>
                        <div className={styles.table}>
                          <table>
                            <colgroup>
                              <col width="5%" />
                              <col width="20%" />
                              <col width="15%" />
                              <col width="20%" />
                              <col width="20%" />
                              <col width="20%" />
                            </colgroup>
                            <thead>
                              <tr>
                                <th></th>
                                <th>
                                  <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                                </th>
                                <th>
                                  <strong>
                                    {t('RESOURCES_NETWORK_TYPE_YOO')}
                                  </strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_DEFAULT_PATH')}</strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_CIDR')}</strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_GATEWAY')}</strong>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {!networkList?.filter(el => el.external)
                                .length && (
                                <tr>
                                  <td colSpan="6" className="no-data">
                                    <p>
                                      {t(
                                        'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                      )}
                                    </p>
                                  </td>
                                </tr>
                              )}
                              {networkList
                                ?.filter(el => el.external)
                                .map(data => (
                                  <tr key={data.name}>
                                    <td>
                                      <Radio
                                        name={`select-${data.name}`}
                                        checked={data.name === networkCheckItem}
                                        onChange={() =>
                                          handleSingleCheck(
                                            data.name,
                                            'network'
                                          )
                                        }
                                      />
                                    </td>
                                    <td>{data.name}</td>
                                    <td>{data.type.toUpperCase()}</td>
                                    <td>
                                      {data.default_route
                                        ? t('RESOURCES_USE')
                                        : t('RESOURCES_NOT_USE')}
                                    </td>
                                    <td>{data.cidr}</td>
                                    <td>{data.gateway_ip}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Form.Item>

                    <Form.Item
                      label={t('RESOURCES_SR_IOV_NETWORK')}
                      className={`${networkFlag === 2 ? '' : 'hide'}`}
                    >
                      <div className={styles.wrapper}>
                        <div className={styles.table}>
                          <table>
                            <colgroup>
                              <col width="5%" />
                              <col width="25%" />
                              <col width="20%" />
                              <col width="25%" />
                              <col width="25%" />
                            </colgroup>
                            <thead>
                              <tr>
                                <th></th>
                                <th>
                                  <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                                </th>
                                <th>
                                  <strong>
                                    {t('RESOURCES_NETWORK_TYPE_YOO')}
                                  </strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_CIDR')}</strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_GATEWAY')}</strong>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {!sriovNetworkList?.length && (
                                <tr>
                                  <td colSpan="5" className="no-data">
                                    <p>
                                      {t(
                                        'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                      )}
                                    </p>
                                  </td>
                                </tr>
                              )}
                              {sriovNetworkList?.map(data => (
                                <tr key={data.name}>
                                  <td>
                                    <Radio
                                      name={`select-${data.name}`}
                                      checked={data.name === sriovCheckItem}
                                      onChange={() =>
                                        handleSingleCheck(data.name, 'sriov')
                                      }
                                    />
                                  </td>
                                  <td>{data.name}</td>
                                  <td>{data.type.toUpperCase()}</td>
                                  <td>{data.cidr}</td>
                                  <td>{data.gateway_ip}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Form.Item>
                    <div
                      className={`form-item-error ${
                        !networkName ? '' : 'hide'
                      }`}
                    >
                      {t('RESOURCES_SELECT_NETWORK_TIP')}
                    </div>
                  </Form.Group>
                </div>
                {/* 네트워크 설정 끝========================================== */}
                {t('RESOURCES_STORAGE_CLASS')}
                <span className="form-item-required">*</span>
                <Form.Group>
                  <Form.Item>
                    <Tabs
                      type="button"
                      activeName={storageClassTab}
                      onChange={newTab => {
                        setStorageClassTab(newTab)
                        if (newTab === 'default') {
                          setStorageClass('')
                        }
                        if (newTab === 'image') {
                          setStorageClass(imageStorageClass)
                        }
                      }}
                    >
                      <TabPanel label={t('RESOURCES_DEFAULT')} name="default" />
                      <TabPanel
                        label={t('RESOURCES_IMAGE_CLASS')}
                        name="image"
                      />
                      <TabPanel
                        label={t('RESOURCES_MANUAL_SELECTION')}
                        name="manual"
                      />
                    </Tabs>
                  </Form.Item>
                  {storageClassTab === 'manual' && (
                    <Form.Item>
                      <Select
                        options={storageClassOptions()}
                        onChange={el => setStorageClass(el)}
                        value={
                          storageClass !== ''
                            ? storageClass
                            : t('RESOURCES_SELECT')
                        }
                      />
                    </Form.Item>
                  )}
                  {storageClassTab === 'image' && storageClass !== '' && (
                    <Form.Item>
                      <div className={styles.wrapperImageView}>
                        {storageClass}
                      </div>
                    </Form.Item>
                  )}
                </Form.Group>
                Replicas
                <span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
                      <Form.Group
                        label={t('RESOURCES_AUTO_EXPAND')}
                        onChange={() => setIsAutoScale(!isAutoScale)}
                        checkable
                      >
                        <Form.Item label={t('RESOURCES_SCALING')}>
                          <Slider
                            max={10}
                            min={1}
                            marks={{
                              1: '1',
                              2: '2',
                              3: '3',
                              4: '4',
                              5: '5',
                              6: '6',
                              7: '7',
                              8: '8',
                              9: '9',
                              10: '10',
                            }}
                            step={1}
                            value={autoScale}
                            onChange={e => handlerAutoScale(e)}
                            range
                            withInput
                          />
                        </Form.Item>
                      </Form.Group>
                    </Column>
                    {!isAutoScale && (
                      <Column
                        align={'middle'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Form.Item>
                          <div style={{ marginBottom: '12px' }}>
                            <Button
                              icon="substract"
                              onClick={decreaseReplicaBtn}
                            />
                            &nbsp;&nbsp;
                            <Input
                              name="nodepoolReplicas"
                              value={nodepoolReplicas}
                              style={{ width: '40%', textAlign: 'center' }}
                            />
                            &nbsp;&nbsp;
                            <Button icon="add" onClick={increaseReplicaBtn} />
                          </div>
                        </Form.Item>
                      </Column>
                    )}
                  </Columns>
                </Form.Group>
                {/* NodeSelector 입력 필드 추가 */}
                <Form.Item label={t('ADD_NODE_SELECTOR')}>
                  <div className={styles.box_wrapper}>
                    <div
                      className={`form-item-error ${
                        nodeSelectorError ? '' : 'hide'
                      }`}
                    >
                      {t('ADD_NODE_SELECTOR_TIP')}
                    </div>
                    <div className={styles.box_title}>
                      <PropertiesInput
                        value={nodeSelector}
                        onChange={handleNodeSelectorChange}
                        onError={handleNodeSelectorError}
                        addText={t('ADD')}
                      />
                    </div>
                  </div>
                </Form.Item>
                <Form.Item
                  className={styles.textarea}
                  label={t('RESOURCES_DESCRIPTION')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea name="description" maxLength={256} />
                </Form.Item>
                <div style={{ padding: 25 }} />
              </div>
              {/* 기본설정 설정 끝========================================== */}
            </div>
          </div>

          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  )
}

export default RegistNodePoolModal
