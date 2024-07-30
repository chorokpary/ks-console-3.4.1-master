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
import React, { useState, useRef, useEffect } from 'react';

import {
  Form,
  Radio,
} from '@kube-design/components';
import { Modal } from 'components/Base';
import styles from './index.scss';

const ModifyModal = ({ title, onOk, store, ...props }) => {

  const [modelView, setModalView] = useState(true);

  const [vgpuConfigList, setVgpuConfigList] = useState([]);

  const [radioConfig, setRadioConfig] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    setModalView(false);
  };

  useEffect(() => {
    const fnGetVgpuConfigList = async () => {
      setVgpuConfigList(store.vgpuConfigList)
      const firstConfig = store.vgpuConfigList?.[0]?.name
      const _ = require('lodash');
      if (!_.isEmpty(firstConfig)) {
        setRadioConfig(firstConfig)
      }
    };
    fnGetVgpuConfigList();
  }, []);

  const handleOk = () => {
    setIsSubmitting(true);
    const _ = require('lodash');
    onOk({ vgpuconfig: { "config_name": radioConfig }, node: get(store.detail.gpunode, 'name') });
  };

  return (
    <>
      <Modal
        icon="pen"
        width={850}
        title={title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        okText={t('RESOURCES_APPLY')}
        cancelText={t('RESOURCES_CANCEL')}
        disableSubmit={vgpuConfigList.length === 0 && true}
        isSubmitting={store.isSubmitting}
      >
        <Form>
          <Form.Item>
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="5%" />
                    <col width="15%" />
                    <col width="13%" />
                    <col width="10%" />
                    <col width="10%" />
	            <col width="12%" />
                    <col width="10%" />
                    <col width="10%" />
                    <col width="15%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th></th>
                      <th>
                        <strong>{t('RESOURCES_GPU_VGPU_CONFIG_NAME')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GPU_MDEV_ID')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GPU_VGPU_CLASS')}</strong>
                      </th>
	              <th>
                        <strong>{t('RESOURCES_GPU_VGPU_RAM')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GPU_VGPU_RESOLUTION')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GPU_VGPU_NUMBER')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GPU_VGPU_CUDA')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GPU_VGPU_MULTIVGPU')}</strong>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!vgpuConfigList?.length && (
                      <tr>
                        <td colSpan="9" className="no-data">
                          <p>{t('RESOURCES_GPU_VGPU_CONFIGS_NOT_FOUND')}</p>
                        </td>
                      </tr>
                    )}
                    {vgpuConfigList?.map(data => (
                      <tr key={data.name}>
                        <td>
                          <Radio
                            name="config"
                            value={data.name}
                            checked={radioConfig === data.name}
                            onChange={e => {
                              setRadioConfig(data.name);
                            }}
                          />
                        </td>
                        <td>{data.name}</td>
                        <td>{data.mdev_id}</td>
                        <td>{data.clazz}</td>
                        <td>{data.ram}</td>
			<td>{data.resolution}</td>
                        <td>{data.max_num}</td>
                        <td>{data.cuda ? t('RESOURCES_SUPPORT') : t('RESOURCES_NOT_SUPPORT')}</td>
                        <td>{data.multivgpu ? t('RESOURCES_SUPPORT') : t('RESOURCES_NOT_SUPPORT')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModifyModal;
