import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Form, Toggle, Notify, Select } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'

const SnapshotModal = (props) => {

  const vmStore = new VmStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = () => {

    const success = props.success;

    form.current.validator(async () => {     

      const systemId = await getSystemId(targetIp);

      const data = {}
      data.instanceIp = props.detail.ip;
      data.targetIp = targetIp,
      data.reseType = props.detail.state,
      data.systemId = systemId
      
      console.log("data : "+ JSON.stringify(data))

      // bareMetalStore.update(data, {name: data.id, ...data }).then(() => {
      //   Notify.success({ content: t('정상적으로 연결 되었습니다.') })
      //   success();
      //   closeModal();
      // })

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
            label={t('Target IP')}
            rules={[{ required: true, message: t('스냅샷 실헹 이력에 기재할 정보를 입력해주세요.') }]}
          >
            <Input
                name="name"
                autoFocus={true}
                maxLength={63}
                style={{ maxWidth: 'none' }}
              />  

          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default SnapshotModal

