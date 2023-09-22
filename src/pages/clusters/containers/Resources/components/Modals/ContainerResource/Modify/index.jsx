import { toJS } from 'mobx'
import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Checkbox } from '@kube-design/components'
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
      onOk({ cluster : data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }


  return (
    <>
      <Modal
        icon="pen"
        width={900}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      >
        <Form data={formData} ref={form}>

          <Form.Item
            label={t('이름')}
          >
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
            label={t('설명')}
            desc={t('DESCRIPTION_DESC')}
          >
            <TextArea
              name="description"
              maxLength={256}
              rows="1"
              defaultValue={props.store.detail.cluster.description}
            />
          </Form.Item>

        </Form>
      </Modal>

    </>
  );
};

export default ModifyModal

