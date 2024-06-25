/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import { get } from 'lodash';
import React, { useState, useRef, useEffect } from 'react'

import { Form } from '@kube-design/components'
import { Modal } from 'components/Base'

import TypeSelect from '../../../TypeSelect'

import styles from './index.scss'

const ConfigGpuWorkloadType = ({ title, onOk, store, ...props }) => {

  const workloadTypeData = store.detail.gpunode.workload_type;

  const form = useRef();
  const [formData, setFormData] = useState({});
  const [modelView, setModalView] = useState(true);
  const [workloadType, setWorkloadType] = useState(workloadTypeData);

  const handleOk = () => {
    onOk({ node: get(store.detail.gpunode, 'name'), workload_type: { 'type': workloadType} })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const workloadOptions = [
    { label: t('RESOURCES_GPU_WORKLOAD_CONTAINER'), value: 'container' , description: t('RESOURCES_GPU_WORKLOAD_CONTAINER_DESC')},
    { label: t('RESOURCES_GPU_WORKLOAD_VM_PASSTHROUGH'), value: 'vm-passthrough', description: t('RESOURCES_GPU_WORKLOAD_VM_PASSTHROUGH_DESC')}
  ];

  return (
    <>
      <Modal
        icon="pen"
        width={600}
        height={400}
        title={title}
        bodyClassName={styles.body}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        isSubmitting={store.isSubmitting}
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('RESOURCES_GPU_WORKLOAD_TYPE')}
            rules={[{ required: true }]}
          >
            <TypeSelect
              name="workload_type"
              defaultValue={workloadType}
              options={workloadOptions}
              onChange={(e) => setWorkloadType(e)}
              placeholder={{
                label: t('RESOURCES_SELECT')
              }}
              defaultDescription={t('RESOURCES_GPU_SELECT_WORKLOAD_TYPE_TIP')}
            />
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default ConfigGpuWorkloadType
