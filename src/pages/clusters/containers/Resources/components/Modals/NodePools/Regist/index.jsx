import React, { useEffect, useRef, useState } from 'react'
import { Button, Form, Input, Slider, TextArea } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import classnames from 'classnames'

import { Modal } from 'components/Base'
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

  const [acceleratorType, setAcceleratorType] = useState('None')
  const [acceleratorTypeList, setAcceleratorTypeList] = useState(['None'])

  const [kubeVersion, setKubeVersion] = useState('')
  const [nodepoolReplicas, setNodepoolReplicas] = useState(1)

  const [osType] = useState('linux')
  const [osDistro, setOsDistro] = useState('ubuntu-2004')

  const [isAutoScale, setIsAutoScale] = useState(false)
  const [autoScale, setAutoScale] = useState([1, 3])

  useEffect(() => {
    const getVmCreateData = async () => {
      const listFlavor = await vmStore.fetchVmListFlavor({
        sortBy: 'root_disk',
        ...props,
      })
      const listImage = await resourceStore.fetchListImage(props)

      setFlavorDataList(listFlavor.flavors)
      setImageDataList(listImage._originData.images)
      setOsDistro(props.detailStore.detail.cluster.os_distro)
      setKubeVersion(props.detailStore.detail.cluster.kube_version)
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
          loading={props.isSubmitting}
          disabled={props.isSubmitting}
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

  // 스크립트 끝 ==================================================
  return (
    <>
      <Modal
        icon="templet"
        width={960}
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
                <div style={{ padding: 10 }} />
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
                          onChange={e => setSelectImageName(e)}
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
                <div style={{ padding: 10 }} />
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
