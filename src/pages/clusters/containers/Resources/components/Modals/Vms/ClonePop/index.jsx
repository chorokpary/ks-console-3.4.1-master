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

  const [buttonDisabled, setButtonDisabled] = useState(false);

  const defaultCloneName = props.data.vmName + "-clone"

  const handleOk = () => {

    const success = props.success;

    form.current.validator(async () => {   
      
      const { data } = form.current.props;
      data.source_vm_id = vmId;

      console.log("data : "+ JSON.stringify(data))
      
      setButtonDisabled(true);

      vmStore.cloneCreate(data).then(() => {
        Notify.success({ content: t('RESOURCES_CREATE_SUCCESSFUL') })
        success();
        setButtonDisabled(false);
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
              rules={[{ required: true, message: t('RESOURCES_CREATE_CLONE_DATA_VM_NAME_TIP') }]}
            >
              <Input
                  name="target_vm_name"
                  autoFocus={true}
                  style={{ maxWidth: 'none' }}
                  defaultValue={defaultCloneName}
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
            disabled={buttonDisabled}
          >
            {t('OK')}
          </Button>
        </div>        

      </Modal>

    </>
  );
};

export default CloneModal

