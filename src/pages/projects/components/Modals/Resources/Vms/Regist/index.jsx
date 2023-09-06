import { get } from 'lodash'
import React, { useState, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, Loading } from '@kube-design/components'
import { Modal } from 'components/Base'
import Confirm from 'components/Forms/Base/Confirm'
import styles from './index.scss'

const RegistModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = () => {
    const onOk  = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const handleSubFormSave = () => {
    setModalView(false);
  }

  const handleSubFormCancel = () => {
    setModalView(false);
  }

 
  return (
    <>  
        <Modal
          icon="cluster"
          width={1000}
          title={props.title}
          onOk={handleOk}
          onCancel={closeModal}
          visible={modelView}
          hideFooter
        >
          <Form data={formData} ref={form}>
            <Form.Item
                label={t('이름')}
                rules={[{ required: true, message: t('이름를 입력해 주세요.') }]}
                desc={t('NAME_DESC')}
              >
              <Input
                name="name"
                autoFocus={true}
                maxLength={63}

              />   
            </Form.Item>
          </Form>

        </Modal>

    </>
  );
};

export default RegistModal

