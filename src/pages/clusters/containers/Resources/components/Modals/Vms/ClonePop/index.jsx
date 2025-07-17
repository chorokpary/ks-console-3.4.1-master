import React, { useState, useRef } from 'react'

import { Form, Input, Notify, Button } from '@kube-design/components'
import { Modal } from 'components/Base'
import VmStore from 'stores/resources/vms'
import { PATTERN_USER_NAME } from 'utils/constants'
import styles from './index.scss'

const CloneModal = props => {
  const vmStore = new VmStore()
  const vmName = props.store.detail.name

  const form = useRef()
  const [modelView, setModalView] = useState(true)
  const [formData] = useState({})

  const [buttonDisabled, setButtonDisabled] = useState(false)

  const defaultCloneName = `${props.data.vmName}-clone`

  const handleOk = () => {
    const success = props.success

    const params = {
      cluster: props.cluster,
      namespace: props.store.detail.vm.project,
    }

    form.current.validator(async () => {
      const { data } = form.current.props
      data.source_vm_id = vmName

      setButtonDisabled(true)
      vmStore
        .cloneCreate(data, params)
        .then(() => {
          Notify.success({ content: t('RESOURCES_CREATE_SUCCESSFUL') })
          success()
          setButtonDisabled(false)
          closeModal()
        })
        .catch(() => {
          setButtonDisabled(false)
        })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  return (
    <>
      <Modal
        icon="pen"
        width={600}
        title={props.title}
        bodyClassName={styles.modalBody}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        hideFooter
      >
        <div className={styles.body}>
          <Form data={formData} ref={form}>
            <Form.Item
              label={t('RESOURCES_NAME')}
              rules={[
                {
                  required: true,
                  message: t('RESOURCES_CREATE_CLONE_DATA_VM_NAME_TIP'),
                },
                {
                  pattern: PATTERN_USER_NAME,
                  message: t('RESOURCES_INVALID_NAME_DESC'),
                },
              ]}
              desc={t('NAME_DESC')}
            >
              <Input
                name="target_vm_name"
                autoFocus={true}
                maxLength={63}
                style={{ maxWidth: 'none' }}
                defaultValue={defaultCloneName}
              />
            </Form.Item>
            <Form.Item
              label={t('RESOURCES_DESCRIPTION')}
              rules={[
                {
                  required: true,
                  message: t('RESOURCES_CLONE_DATA_LOG_INFORMATION_TIP'),
                },
              ]}
              desc={t('DESCRIPTION_DESC')}
            >
              <Input
                name="description"
                maxLength={256}
                style={{ maxWidth: 'none' }}
              />
            </Form.Item>
          </Form>
        </div>
        <div className={styles.footer}>
          <Button
            onClick={() => closeModal()}
            data-test="modal-cancel"
            disabled={buttonDisabled}
          >
            {t('CANCEL')}
          </Button>
          <Button
            type="control"
            onClick={() => handleOk()}
            data-test="modal-ok"
            loading={buttonDisabled}
            disabled={buttonDisabled}
          >
            {t('OK')}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default CloneModal
