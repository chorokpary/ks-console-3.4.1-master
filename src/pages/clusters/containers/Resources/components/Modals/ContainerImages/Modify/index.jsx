import React, { useEffect, useRef, useState } from 'react'
import { Modal } from 'components/Base'
import { Form, Input, Select, TextArea } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import ClusterDistroTypeStore from 'stores/resources/clusterdistrotype'
import GpuNodeStore from 'stores/resources/gpunodes'
import styles from './index.scss'

import TypeSelect from '../../../TypeSelect'
import CardSelect from '../../../CardSelect'

const regexVersion = /^v(\d+\.\d+\.\d+)$/

const ResourceImageModal = props => {
  const { title, store, onOk } = props
  const form = useRef()
  const [formData] = useState({})
  const clusterDistroTypeStore = new ClusterDistroTypeStore()
  const gpuNodeStore = new GpuNodeStore()

  const [modelView, setModalView] = useState(true)

  const [osType, setOsType] = useState('linux')
  const [distroTypeData, setDistroTypeData] = useState([])
  const [distroTypeList, setDistroTypeList] = useState([])
  const [distroType, setDistroType] = useState(store.detail.image.os_distro)
  const [acceleratorTypeList, setAcceleratorTypeList] = useState(['None'])
  const [acceleratorType, setAcceleratorType] = useState(
    store.detail.image.accelerator_type
  )

  useEffect(() => {
    const getDistroTypeList = async () => {
      const dist = await clusterDistroTypeStore.fetchList()
      setDistroTypeData(dist)
      setDistroTypeList(dist.filter(obj => obj.name !== 'windows'))
    }

    const getAcceleratorTypeList = async () => {
      const accelList = await gpuNodeStore.fetchAcceleratorTypeList(props)
      setAcceleratorTypeList(accelList)
    }
    getDistroTypeList()
    getAcceleratorTypeList()
  }, [])

  const archTypeOptions = [
    { label: 'x86_64', value: 'x86_64' },
    { label: 'aarch64', value: 'aarch64' },
  ]

  const bootTypeOptions = [
    { label: 'legacy', value: 'legacy' },
    { label: 'uefi', value: 'uefi' },
  ]

  const osTypeOptions = [
    { label: 'Linux', value: 'linux', icon: 'ico-linux' },
    // { label: 'etc', value: '', icon: 'ico-plus', }
  ]

  const distroTypeOptions = () => {
    const opt = distroTypeList.map(obj => ({
      label: t(obj.name),
      description: t(obj.vendor),
      icon: `ico-os-${obj.name.split('-')[0]}`,
      value: t(obj.name),
    }))
    return opt
  }

  const accelTypeOptions = () => {
    return acceleratorTypeList.map(obj => ({
      label: t(obj),
      value: t(obj),
    }))
  }

  const handleOk = () => {
    form.current.validator(() => {
      const { data } = form.current.props
      data.os_distro = distroType
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  const handleOsType = value => {
    setOsType(value)
    if (value === 'windows') {
      setDistroType('windows')
      setDistroTypeList(distroTypeData.filter(obj => obj.name === 'windows'))
    } else {
      setDistroType('ubuntu-2004')
      setDistroTypeList(distroTypeData.filter(obj => obj.name !== 'windows'))
    }
  }

  const versionValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_VERSION_EMPTY_DESC') })
    }
    if (!regexVersion.test(value)) {
      return callback({ message: t('RESOURCES_VERSION_CHECK_DESC') })
    }
    callback()
  }

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={title}
        onOk={handleOk}
        okText={t('RESOURCES_EDIT')}
        onCancel={closeModal}
        cancelText={t('RESOURCES_CANCEL')}
        visible={modelView}
        isSubmitting={store.isSubmitting}
      >
        <Form data={formData} ref={form}>
          <Form.Item label={t('RESOURCES_NAME')}>
            <Input
              name="name"
              maxLength={253}
              defaultValue={store.detail.image.name}
              style={{ maxWidth: 'none' }}
              readOnly
            />
          </Form.Item>

          <Form.Item label={t('RESOURCES_IMAGE_TEMPLATE')}>
            <Form.Group>
              <Form.Item>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_IMAGE')}
                      rules={[{ required: true }]}
                    >
                      <CardSelect
                        className={styles.customUl}
                        onChange={e => handleOsType(e)}
                        name="os_type"
                        options={osTypeOptions}
                        defaultValue={osType}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_DISTRIBUTION')}
                      rules={[{ required: true }]}
                    >
                      <TypeSelect
                        onChange={e => setDistroType(e)}
                        defaultValue={distroType}
                        options={distroTypeOptions()}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Input
                        defaultValue={`${osType[0].toUpperCase() +
                          osType.slice(1, osType.length)} > ${distroType}`}
                        readOnly
                        style={{ maxWidth: 'none' }}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
              </Form.Item>

              <Form.Item>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_CPU_TYPE')}
                      rules={[{ required: true }]}
                    >
                      <Select
                        name="arch_type"
                        defaultValue={store.detail.image.arch_type}
                        options={archTypeOptions}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_BOOT_TYPE')}
                      rules={[{ required: true }]}
                    >
                      <Select
                        name="boot_type"
                        defaultValue={store.detail.image.boot_type}
                        options={bootTypeOptions}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
              </Form.Item>
              <Columns>
                <Column>
                  <Form.Item
                    label={t('RESOURCES_KUBERNETES_VERSION')}
                    rules={[{ required: true, validator: versionValidator }]}
                  >
                    <Input
                      name="kube_version"
                      maxLength={253}
                      style={{ maxWidth: 'none' }}
                      defaultValue={store.detail.image.kube_version}
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    label={t('RESOURCES_ACCELERATOR_TYPE')}
                    rules={[{ required: false }]}
                  >
                    <Select
                      name="accelerator_type"
                      defaultValue={acceleratorType}
                      options={accelTypeOptions()}
                      onChange={e => setAcceleratorType(e)}
                    />
                  </Form.Item>
                </Column>
              </Columns>
            </Form.Group>
          </Form.Item>

          <Form.Item
            label={t('RESOURCES_DESCRIPTION')}
            rules={[
              {
                required: true,
                message: t('RESOURCES_DESCRIPTION_EMPTY_DESC'),
              },
            ]}
            desc={t('DESCRIPTION_DESC')}
          >
            <TextArea
              defaultValue={store.detail.image.description}
              style={{ maxWidth: 'none' }}
              name="description"
              maxLength={256}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ResourceImageModal
