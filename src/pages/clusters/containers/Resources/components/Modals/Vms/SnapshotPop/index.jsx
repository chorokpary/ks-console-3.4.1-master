import { get } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import { observer, inject } from 'mobx-react';

import {
  Form,
  Input,
  Notify,
  Select,
  TextArea,
  Button,
  Loading,
} from '@kube-design/components';
import { Modal } from 'components/Base';
import VmStore from 'stores/resources/vms';
import styles from './index.scss';

const SnapshotModal = props => {
  const vmStore = new VmStore();
  const vmName = props.store.detail.name;
  const vmId = props.store.detail.id;

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = () => {
    const success = props.success;
    const params = {
      cluster: props.cluster,
      namespace: props.namespace,
    };

    form.current.validator(async () => {
      const { data } = form.current.props;
      data.vmName = vmName;
      data.vmId = vmId;

      vmStore.snapshotCreate(data, params).then(() => {
        Notify.success({ content: t('RESOURCES_CREATE_SUCCESSFUL') });
        success();
        closeModal();
      });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

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
            label={t('RESOURCES_DESCRIPTION')}
            rules={[
              {
                required: true,
                message: t('RESOURCES_SNAPSHOT_LOG_INFORMATION_EMPTY_DESC'),
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
      </Modal>
    </>
  );
};

export default SnapshotModal;
