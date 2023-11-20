import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Form, Input, Notify, Select, TextArea, Button, Loading } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'

const RestoreModal = (props) => {

  const vmStore = new VmStore();
  const vmName = props.store.detail.name;

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  
  const handleOk = () => {

    const success = props.success;

    form.current.validator(async () => {   
      
      const { data } = form.current.props;
      data.snapshotName = vmName;

      console.log("data : "+ JSON.stringify(data))

      vmStore.restoreCreate(data).then(() => {
        Notify.success({ content: t('복원 되었습니다.') })
        success();
        closeModal();
      })

    })
  }

  const closeModal = () => {
    setModalView(false);
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
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('설명')}
            rules={[{ required: true, message: t('복원 사유 등 이력에 기재할 정보를 입력해주세요.') }]}
          >
            <Input
                name="description"
                style={{ maxWidth: 'none' }}
              />  
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default RestoreModal

