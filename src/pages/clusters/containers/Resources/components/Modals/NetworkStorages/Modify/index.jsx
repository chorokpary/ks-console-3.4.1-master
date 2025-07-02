import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Modal, TypeSelect, List, Panel } from 'components/Base';
import { ProjectSelect } from 'components/Inputs';
import {
  PATTERN_USER_NAME,
  PATTERN_FILE_PATH
} from 'utils/constants';
import { Form, Input, Select, Button, Tooltip, TextArea } from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';

import styles from './index.scss';

const ModifyModal = props => {
  const form = useRef();
  const [formData, setFormData] = useState({});
  const [modelView, setModalView] = useState(true);
  const [disableFilesystem, setDisableFilesystem] = useState(false);

  useEffect(() => {
    const storage = props.store.detail.network_storage
    if (storage.protocol === "lustre" || storage.protocol === "gpfs") {
      setDisableFilesystem(true)
    } else {
      setDisableFilesystem(false)
    }
  }, [])

  const filesystemOptions = [
    { label: 'NFS', value: 'nfs' },
    { label: 'EXT4', value: 'ext4' },
    { label: 'XFS', value: 'xfs' },
  ]

  const protocolOptions = [
    { label: 'LUSTRE', value: 'lustre' },
    { label: 'GPFS', value: 'gpfs' },
    { label: 'NFS', value: 'nfs' },
  ]

  const transportOptions = [
    { label: 'TCP', value: 'tcp' },
    { label: 'RDMA', value: 'rdma' },
  ]

  const maxConnectionOptions = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
  ]

  const configProtocol = protocol => {
    if (protocol === "lustre" || protocol === "gpfs") {
      setDisableFilesystem(true)
    } else {
      setDisableFilesystem(false)
    }
  }

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      data.project = props.store.detail.network_storage.project

      if (data.protocol === "lustre" || data.protocol === "gpfs") {
        data.filesystem = data.protocol
      }

      onOk({ storage: data });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

  return (
    <>
      <Modal
        icon="pen"
        width={800}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        isSubmitting={props.store.isSubmitting}
      >
        <Form data={formData} ref={form}>
          <Columns>
            <Column>
              <Form.Item
                label={t('RESOURCES_NAME')}
                rules={[
                  { required: true, message: t('NAME_EMPTY_DESC') },
                  {
                    pattern: PATTERN_USER_NAME,
                    message: t('RESOURCES_INVALID_NAME_DESC'),
                  },
                ]}
                desc={t('NAME_DESC')}
              >
                <Input
                  name="name"
                  autoFocus={true}
                  maxLength={63}
                  defaultValue={props.store.detail.network_storage.name}
                  disabled
                />
              </Form.Item>
            </Column>
            {!props.namespace && (
              <Column>
                <Form.Item
                  label={t('PROJECT')}
                  desc={t('SELECT_PROJECT_DESC')}
                  rules={[
                    { required: true, message: t('PROJECT_NOT_SELECT_DESC') },
                  ]}
                >
                  <ProjectSelect
                    name="namespace"
                    defaultValue={props.store.detail.network_storage.project}
                    cluster={props.cluster}
                    disabled
                  />
                </Form.Item>
              </Column>
            )}
          </Columns>

          <Form.Item label={t('RESOURCES_NETWORK_STORAGE_COMMON')}>
            <Form.Group>
              <Form.Item>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_PROTOCOL')}
                      rules={[
                        {
                          required: true,
                          message: t('RESOURCES_SELECT_PROTOCOL_TIP'),
                        },
                      ]}
                    >
                      <Select
                        name="protocol"
                        placeholder={t('RESOURCES_SELECT')}
                        options={protocolOptions}
                        defaultValue={props.store.detail.network_storage.protocol}
                        onChange={e => {
                          configProtocol(e)
                        }}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_FILESYSTEM')}
                      rules={[
                        {
                          required: true,
                          message: t('RESOURCES_SELECT_FILESYSTEM_TIP'),
                        },
                      ]}
                    >
                      <Select
                        name="filesystem"
                        placeholder={t('RESOURCES_SELECT')}
                        options={filesystemOptions}
                        disabled={disableFilesystem}
                        defaultValue={'nfs'}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_TRANSPORT')}
                      rules={[
                        {
                          required: true,
                          message: t('RESOURCES_SELECT_TRANSPORT_TIP'),
                        },
                      ]}
                    >
                      <Select
                        name="transport"
                        placeholder={t('RESOURCES_SELECT')}
                        options={transportOptions}
                        defaultValue={props.store.detail.network_storage.transport}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
              </Form.Item>
            </Form.Group>
          </Form.Item>
          <Form.Item label={t('RESOURCES_NETWORK_STORAGE_MOUNT')}>
            <Form.Group>
              <Form.Item>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_MOUNT_POINT')}
                      rules={[
                        {
                          required: true,

                        },
                        {
                          pattern: PATTERN_FILE_PATH,
                          message: t('RESOURCES_INVALID_MOUNT_POINT_DESC'),
                        },
                      ]}
                    >
                      <Input
                        name="mount_point"
                        defaultValue={props.store.detail.network_storage.mount_point}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_ENDPOINT')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input
                        name="endpoint"
                        defaultValue={props.store.detail.network_storage.endpoint}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
              </Form.Item>
              <Form.Item>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_MAX_CONNECTION')}
                      rules={[
                        {
                          required: true,
                          message: t('RESOURCES_MAX_CONNECTION_TIP'),
                        },
                      ]}
                    >
                      <Select
                        name="max_connection"
                        placeholder={t('RESOURCES_SELECT')}
                        options={maxConnectionOptions}
                        defaultValue={props.store.detail.network_storage.max_connection}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_MOUNT_OPTIONS')}
                      rules={[
                        {
                          required: true,
                          message: t('RESOURCES_MOUNT_OPTIONS_TIP'),
                        },
                      ]}
                    >
                      <Input
                        name="mount_options"
                        defaultValue={props.store.detail.network_storage.mount_options}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
              </Form.Item>
            </Form.Group>
          </Form.Item>
          <Form.Item
            className={styles.textarea}
            label={t('RESOURCES_DESCRIPTION')}
            desc={t('DESCRIPTION_DESC')}
          >
            <TextArea
              name="description"
              maxLength={256}
              defaultValue={props.store.detail.network_storage.description}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModifyModal;
