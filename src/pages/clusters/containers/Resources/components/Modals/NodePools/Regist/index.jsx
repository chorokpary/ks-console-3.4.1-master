import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Form,
  Input,
  Select,
  Slider,
  TextArea,
  Tabs,
  Checkbox,
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
  const [regStep, setRegStep] = useState(1)

  const [nodePoolName, setNodePoolName] = useState('')
  const [imageName, setImageName] = useState('')
  const [description, setDescription] = useState('')

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
  const [osDistro, setOsDistro] = useState('ubuntu-2404')

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
  const [sriovNetworkList, setSriovNetworkList] = useState([])
  const [physicalNetworkList, setPhysicalNetworkList] = useState([])

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
      const listSriovNetwork = await vmStore.fetchVmListSriovNetwork({
        ...props,
      })
      const listPhysicalNetwork = await vmStore.fetchVmListPhysicalNetwork({
        ...props,
      })

      setFlavorDataList(listFlavor.flavors)
      setImageDataList(listImage._originData.images)
      setOsDistro(props.detailStore.detail.cluster.os_distro)
      setKubeVersion(props.detailStore.detail.cluster.kube_version)
      setStorageClassDataList(listStoregeClass.user_sces)

      // 네트워크 데이터 설정
      setSriovNetworkList(listSriovNetwork.sriovs)
      setPhysicalNetworkList(listPhysicalNetwork.physicalnetworks)
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
      data.sriov_networks = sriovCheckItems
      data.physical_networks = physicalnetworkCheckItems

      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  const stepMoveCheck = step => {
    const { data } = form.current.props
    if (step === 1) {
      if (
        data.name === undefined ||
        !PATTERN_USER_NAME.test(data.name) ||
        data.kube_image === t('RESOURCES_SELECT') ||
        data.flavor === t('RESOURCES_SELECT')
      ) {
        handleOk()
      } else {
        setRegStep(2)
      }
    }
    if (step === 2) {
      setRegStep(3)
    }
    if (step === 3) {
      setNodePoolName(data.name)
      setImageName(data.kube_image)
      setDescription(data.description)

      setRegStep(4)
    }
  }

  const fnGetModalFooter = () => {
    return (
      <>
        {regStep === 1 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(1)
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep === 2 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(regStep - 1)
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(2)
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep === 3 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(regStep - 1)
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(3)
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep === 4 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(3)
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              onClick={() => {
                handleOk()
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
              loading={props.store.isSubmitting}
              disabled={props.store.isSubmitting}
            >
              {t('RESOURCES_CREATE')}
            </Button>
          </>
        )}
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

  // 체크 리스트 시작 ==================================================
  const [sriovCheckItems, setSriovCheckItems] = useState([])
  const [physicalnetworkCheckItems, setPhysicalnetworkCheckItem] = useState([])

  const dataListVariables = {
    physicalnetwork: physicalNetworkList,
  }

  const stateVariables = {
    physicalnetwork: physicalnetworkCheckItems,
  }

  const setVariables = {
    sriov: setSriovCheckItems,
    physicalnetwork: setPhysicalnetworkCheckItem,
  }

  const handleSingleCheck = (checked, name, type) => {
    if (checked) {
      setVariables[type](prev => [...prev, name])
    } else {
      setVariables[type](stateVariables[type].filter(el => el !== name))
    }
  }

  const handleAllCheck = (checked, type) => {
    if (checked) {
      const nameArray = []
      dataListVariables[type].forEach(el => nameArray.push(el.name))
      setVariables[type](nameArray)
    } else {
      setVariables[type]([])
    }
  }

  const handleDelete = (name, type) => {
    setVariables[type](stateVariables[type].filter(el => el !== name))
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

  const handleSriovCheck = (checked, name) => {
    if (checked) {
      setSriovCheckItems(prev => [...prev, name])
    } else {
      setSriovCheckItems(prev => prev.filter(el => el !== name))
    }
  }

  // 스크립트 끝 ==================================================
  const { TabPanel } = Tabs

  return (
    <>
      <Modal
        icon="templet"
        width={840}
        title={t('RESOURCES_CREATE_NODEPOOL')}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form}>
          {/* Header */}
          <div className={styles.tab_process}>
            {/* styles.view_screen  : 이전 링크 관련 class */}
            <div
              className={classnames(
                styles.process_item,
                `${regStep === 1 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${
                    regStep === 1
                      ? styles.current
                      : regStep > 1
                      ? styles.done
                      : styles.todo
                  }`}
                ></div>
              </div>
              <div className={styles.basic}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_DEFAULT_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep === 1
                    ? t('RESOURCES_CURRENT')
                    : regStep > 1
                    ? t('RESOURCES_COMPLETED_SETTINGS')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
            <div
              className={classnames(
                styles.process_item,
                `${regStep === 2 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${
                    regStep === 2
                      ? styles.current
                      : regStep > 2
                      ? styles.done
                      : styles.todo
                  }`}
                ></div>
              </div>
              <div className={styles.network}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_NETWORK_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep === 2
                    ? t('RESOURCES_CURRENT')
                    : regStep > 2
                    ? t('RESOURCES_COMPLETED_SETTINGS')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
            <div
              className={classnames(
                styles.process_item,
                `${regStep === 3 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${
                    regStep === 3
                      ? styles.current
                      : regStep > 3
                      ? styles.done
                      : styles.todo
                  }`}
                ></div>
              </div>
              <div className={styles.detail}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_DETAIL_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep === 3
                    ? t('RESOURCES_CURRENT')
                    : regStep > 3
                    ? t('RESOURCES_COMPLETED_SETTINGS')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
            <div
              className={classnames(
                styles.process_item,
                `${regStep === 4 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep === 4 ? styles.current : styles.todo}`}
                ></div>
              </div>
              <div className={styles.confirm}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_CONFIRMATION')}
                </div>
                <div className={styles.situation}>
                  {regStep === 4
                    ? t('RESOURCES_CURRENT')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className={styles.pop_overflow_y}>
            <div className={styles.cont_boxwrap}>
              {/* 기본설정 설정 시작========================================== */}
              <div className={`${regStep === 1 ? '' : 'hide'}`}>
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
                {t('RESOURCES_STORAGE_CLASS')}
                <span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
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
                          <TabPanel
                            label={t('RESOURCES_DEFAULT')}
                            name="default"
                          />
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
                    </Column>
                    <Column>
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
                    </Column>
                  </Columns>
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
              {/* 네트워크 설정 시작========================================== */}
              <div className={`${regStep === 2 ? '' : 'hide'}`}>
                <div style={{ marginTop: 24, marginBottom: 24 }}>
                  <div className={styles.box_title} style={{ marginBottom: 8 }}>
                    <label>{t('RESOURCES_SR_IOV_NETWORK')}</label>
                  </div>
                  <Form.Group>
                    <Form.Item>
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
                                    <Checkbox
                                      name={`select-${data.name}`}
                                      checked={sriovCheckItems.includes(
                                        data.name
                                      )}
                                      onChange={checked =>
                                        handleSriovCheck(checked, data.name)
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
                  </Form.Group>
                  <Form.Item label={t('RESOURCES_DEDICATED_NETWORK')}>
                    <div className={styles.wrapper}>
                      {stateVariables['physicalnetwork'].length > 0 && (
                        <div
                          className={classnames(
                            styles.table_title,
                            styles.table_title_bg
                          )}
                        >
                          <Button
                            className={styles.table_title_button}
                            onClick={() =>
                              handleAllCheck(false, 'physicalnetwork')
                            }
                          >
                            {t('RESOURCES_ALL_DESELECT')}
                          </Button>{' '}
                          {stateVariables['physicalnetwork'].length}
                          {t('RESOURCES_COUNT')} {t('RESOURCES_SELECT')}
                        </div>
                      )}
                      <div className={styles.table}>
                        <table>
                          <colgroup>
                            <col width="5%" />
                            <col width="25%" />
                            <col width="25%" />
                            <col width="25%" />
                            <col width="20%" />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>
                                <Checkbox
                                  name="select-all-physicalnetwork"
                                  onChange={checked =>
                                    handleAllCheck(checked, 'physicalnetwork')
                                  }
                                  checked={
                                    !!(
                                      dataListVariables['physicalnetwork']
                                        .length > 0 &&
                                      stateVariables['physicalnetwork']
                                        .length ===
                                        dataListVariables['physicalnetwork']
                                          .length
                                    )
                                  }
                                />
                              </th>
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
                            {!physicalNetworkList?.length && (
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
                            {physicalNetworkList?.map(data => (
                              <tr key={data.name}>
                                <td>
                                  <Checkbox
                                    name={`select-${data.name}`}
                                    checked={
                                      !!stateVariables[
                                        'physicalnetwork'
                                      ].includes(data.name)
                                    }
                                    onChange={checked =>
                                      handleSingleCheck(
                                        checked,
                                        data.name,
                                        'physicalnetwork'
                                      )
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
                        <div className={styles.removeCheckWrapper}>
                          {physicalnetworkCheckItems?.map(id => {
                            const name = physicalNetworkList
                              ?.filter(data => data.name === id)
                              .map(item => item.name)[0]
                            return (
                              <span key={id}>
                                <Button
                                  icon="close"
                                  onClick={() =>
                                    handleDelete(id, 'physicalnetwork')
                                  }
                                >
                                  {name}
                                </Button>
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </Form.Item>
                </div>
              </div>
              {/* 네트워크 설정 끝========================================== */}
              {/* 세부 설정 시작 ========================================== */}
              <div className={`${regStep === 3 ? '' : 'hide'}`}>
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
              </div>
              {/* 세부 설정 끝 ========================================== */}
              {/* 입력 정보 확인 시작========================================== */}
              <div className={`${regStep === 4 ? '' : 'hide'}`}>
                <div className={styles.boxwrap}>
                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.basic}></span>
                        <label>{t('RESOURCES_DEFAULT_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(1)
                        }}
                      ></Button>
                    </div>
                    <div className={styles.greybgbox}>
                      <div className={styles.list} style={{ width: '25%' }}>
                        <label>{t('RESOURCES_NAME')}</label>
                        <div className={styles.bold}>{nodePoolName}</div>
                      </div>
                      <div className={styles.list} style={{ width: '35%' }}>
                        <label>{t('RESOURCES_IMAGE')}</label>
                        <div className={styles.multiline}>
                          <div className={styles.bold}>{imageName}</div>
                        </div>
                      </div>
                      <div className={styles.list} style={{ width: '40%' }}>
                        <label>{t('RESOURCES_DESCRIPTION')}</label>
                        <div>{description}</div>
                      </div>
                      {storageClass && (
                        <div className={styles.list} style={{ width: '40%' }}>
                          <label>{t('RESOURCES_STORAGE_CLASS')}</label>
                          <div className={styles.bold}>{storageClass}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.network}></span>
                        <label>{t('RESOURCES_NETWORK_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(2)
                        }}
                      ></Button>
                    </div>
                    <label>{t('RESOURCES_SR_IOV_NETWORK')}</label>
                    {sriovNetworkList
                      .filter(x => sriovCheckItems.includes(x.name))
                      .map((obj, index) => (
                        <div className={styles.greybgbox} key={index}>
                          <div className={styles.list}>
                            <label>
                              {index === 0 ? t('RESOURCES_NAME') : ''}
                            </label>
                            <div>{obj.name}</div>
                          </div>
                          <div className={styles.list}>
                            <label>
                              {index === 0 ? t('RESOURCES_TYPE_YOO') : ''}
                            </label>
                            <div className={styles.multiline}>
                              <div>{obj.type}</div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>
                              {index === 0 ? t('RESOURCES_CIDR') : ''}
                            </label>
                            <div className={styles.multiline}>
                              <div>{obj.cidr}</div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>
                              {index === 0 ? t('RESOURCES_GATEWAY') : ''}
                            </label>
                            <div className={styles.multiline}>
                              <div>{obj.gateway_ip}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <label>{t('RESOURCES_DEDICATED_NETWORK')}</label>
                  {physicalNetworkList
                    .filter(x => physicalnetworkCheckItems.includes(x.name))
                    .map((obj, index) => (
                      <div className={styles.greybgbox} key={index}>
                        <div className={styles.list}>
                          <label>
                            {index === 0 ? t('RESOURCES_NAME') : ''}
                          </label>
                          <div>{obj.name}</div>
                        </div>
                        <div className={styles.list}>
                          <label>
                            {index === 0 ? t('RESOURCES_TYPE_YOO') : ''}
                          </label>
                          <div className={styles.multiline}>
                            {/* <div>{obj.fabric.toUpperCase()}</div> */}
                            <div>{obj.type.toUpperCase()}</div>
                          </div>
                        </div>
                        <div className={styles.list}>
                          <label>
                            {index === 0 ? t('RESOURCES_IP_ASSIGNMENT') : ''}
                          </label>
                          <div className={styles.multiline}>
                            <div>
                              {`${
                                obj.ip === undefined
                                  ? t('RESOURCES_AUTOMATIC')
                                  : obj.ip
                              }`}
                            </div>
                          </div>
                        </div>
                        <div className={styles.list}>
                          <label>
                            {index === 0 ? t('RESOURCES_CIDR') : ''}
                          </label>
                          <div className={styles.multiline}>
                            <div>{obj.cidr}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.detail}></span>
                        <label>{t('RESOURCES_DETAIL_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(3)
                        }}
                      ></Button>
                    </div>
                    <div className={styles.greybgbox}>
                      <div className={styles.list}>
                        {Object.keys(nodeSelector).length > 0 && (
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label style={{ width: '100%' }}>
                              {t('ADD_NODE_SELECTOR')}
                            </label>
                            <div className={styles.multiline}>
                              {Object.entries(nodeSelector).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    {key}: {value}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 입력 정보 확인 끝========================================== */}
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
