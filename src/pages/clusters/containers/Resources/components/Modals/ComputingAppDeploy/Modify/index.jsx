import { get } from 'lodash'
import React, { useState, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, Loading } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

const ModifyModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      data.id = props.store.detail.id;
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  return (
    <>
      <Modal
        icon="pen"
        width={700}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      >
        <Form data={formData} ref={form}>

          <Form.Item
            label={t('RESOURCES_NAME')}
          >
            <Input
              name="name"
              autoFocus={true}
              maxLength={63}
              defaultValue={props.store.detail.keypair.name}
              disabled

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
              rows="1"
              defaultValue={props.store.detail.keypair.description}
            />
          </Form.Item>

        </Form>
      </Modal>

    </>
  );
};

export default ModifyModal

