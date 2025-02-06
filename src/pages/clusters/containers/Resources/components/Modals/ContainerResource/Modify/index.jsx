import React, { useState, useRef } from 'react'

import { Form, Input, TextArea } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

const ModifyModal = props => {
  const form = useRef()
  const [modelView, setModalView] = useState(true)

  const handleOk = () => {
    const onOk = props.onOk

    form.current.validator(() => {
      const { data } = form.current.props
      data.project = props.store.detail.cluster.cp.namespace
        ? props.store.detail.cluster.cp.namespace
        : 'default'
      onOk({
        cluster_obj: data,
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
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        isSubmitting={props.store.isSubmitting}
      >
        <Form data={{}} ref={form}>
          <Form.Item label={t('NAME')}>
            <Input
              name="name"
              autoFocus={true}
              maxLength={63}
              defaultValue={props.store.detail.cluster.name}
              disabled
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

          <Form.Item
            className={styles.textarea}
            label={t('RESOURCES_DESCRIPTION')}
            desc={t('DESCRIPTION_DESC')}
          >
            <TextArea
              name="description"
              maxLength={256}
              defaultValue={props.store.detail.cluster.description}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ModifyModal
