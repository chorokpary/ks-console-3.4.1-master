import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Form, Input, Notify, Select, TextArea, Button, Loading } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'

const CloneModal = (props) => {

  const vmStore = new VmStore();
  const vmId = props.store.detail.id;

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  
  const handleOk = () => {

    const success = props.success;

    form.current.validator(async () => {   
      
      const { data } = form.current.props;
      data.source_vm_id = vmId;

      console.log("data : "+ JSON.stringify(data))

      vmStore.cloneCreate(data).then(() => {
        Notify.success({ content: t('RESOURCES_CREATE_SUCCESSFUL') })
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
            label={t('RESOURCES_NAME')}
            rules={[{ required: true, message: t('RESOURCES_CREATE_CLONE_DATA_VM_NAME_TIP') }]}
          >
            <Input
                name="target_vm_name"
                autoFocus={true}
                style={{ maxWidth: 'none' }}
              />  
          </Form.Item>
          <Form.Item
            label={t('RESOURCES_DESCRIPTION')}
            rules={[{ required: true, message: t('RESOURCES_CLONE_DATA_LOG_INFORMATION_TIP') }]}
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

export default CloneModal

