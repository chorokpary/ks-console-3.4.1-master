import React, { useEffect, useRef, useState } from 'react'
import { Form, Notify, Radio, Select } from '@kube-design/components'

import { Modal } from 'components/Base'
import VmStore from 'stores/resources/vms'
import VolumeStore from 'stores/resources/volumes'
import styles from './index.scss'

const BindingModal = props => {
  const form = useRef()
  const [modelView, setModalView] = useState(true)
  const [formData] = useState({})

  const vmStore = new VmStore()
  const volumeStore = new VolumeStore()

  const [vmList, setVmList] = useState([])
  const [vmName, setVmName] = useState()
  const [radioHotplug, setRadioHotplug] = useState('T')
  const [bus, setBus] = useState()

  const handleOk = () => {
    const success = props.success

    form.current.validator(() => {
      const data = {}

      data.vmName = vmName
      data.hotplug = radioHotplug === 'T'
      data.actionType = 'A'
      data.name = props.store.detail.name
      data.bus = bus

      volumeStore.actionState({ data, ...props }).then(() => {
        Notify.success({ content: t('RESOURCES_CONNECT_SUCCESS_DESC') })
        success()
        closeModal()
      })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  useEffect(() => {
    const getVmCreateData = async () => {
      const vmListData = await vmStore.fetchList({
        cluster: props.cluster,
        namespace: props.project ? props.project : props.namespace,
      })

      const volumeData = await volumeStore.fetchList({
        cluster: props.cluster,
        namespace: props.project ? props.project : props.namespace,
      })

      const findVolumeData = volumeData?.find(was => {
        return was.name === props.name
      })

      const vol_node = props.store.detail.volume.selected_node

      const filterVm = vmListData?.filter(vm => {
        if (vol_node) {
          return vm.project === findVolumeData.project && vm.node === vol_node
        }
        return vm.project === findVolumeData.project
      })

      setVmList(filterVm)
    }

    getVmCreateData()
  }, [])

  const handleSelect = name => {
    setVmName(name)
  }

  const vmOptions = () => {
    return vmList.map(obj => {
      return {
        label: obj.name,
        value: t(obj.name),
      }
    })
  }

  const busTypeOptions = [
    { label: 'VirtIO', value: 'virtio' },
    { label: 'SATA', value: 'sata' },
    { label: 'SCSi', value: 'scsi' },
  ]

  // Validation 시작 ==================================================
  const vmValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_VM_TIP') })
    }
    callback()
  }

  const busTypeValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_BUS_TIP') })
    }
    callback()
  }

  // Validation 끝 ==================================================

  return (
    <>
      <Modal
        icon="pen"
        width={600}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('RESOURCES_VM_NAME')}
            rules={[{ required: true, validator: vmValidator }]}
          >
            <Select
              name="vmSelect"
              defaultValue={t('RESOURCES_SELECT')}
              options={vmOptions()}
              onChange={value => handleSelect(value)}
            />
          </Form.Item>

          <Form.Item label={t('RESOURCES_HOTPLUG_FLAG')}>
            <div className={styles.wrapper}>
              <Radio
                name="snatType"
                value="T"
                checked={radioHotplug === 'T'}
                onChange={() => {
                  setRadioHotplug('T')
                }}
              >
                {t('RESOURCES_USE')}
              </Radio>
              <Radio
                name="snatType"
                value="F"
                checked={radioHotplug === 'F'}
                onChange={() => {
                  setRadioHotplug('F')
                }}
              >
                {t('RESOURCES_NOT_USE')}
              </Radio>
            </div>
          </Form.Item>
          <Form.Item
            label={t('RESOURCES_BUS_TYPE')}
            rules={[{ required: true, validator: busTypeValidator }]}
          >
            <Select
              name="bus"
              placeholder={t('RESOURCES_SELECT')}
              options={busTypeOptions}
              defaultValue="virtio"
              onChange={e => setBus(e)}
              disabled={radioHotplug === 'T'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default BindingModal
