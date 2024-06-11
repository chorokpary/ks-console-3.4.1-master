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

  const [migConfigList, setMigConfigList] = useState([]);

  const [radioConfig, setRadioConfig] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    setModalView(false);
  };

  useEffect(() => {
    const fnGetMigConfigList = async () => {
        setMigConfigList(store.migConfigList)
    };
    fnGetMigConfigList();
  }, []);

  const handleOk = () => {
    setIsSubmitting(true);
    const _ = require('lodash');
    onOk({ migConfig: radioConfig });
  };

  return (
    <>
      <Modal
        icon="pen"
        width={700}
        title={title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        okText={t('RESOURCES_CREATE')}
        cancelText={t('RESOURCES_CANCEL')}
        disableSubmit={migConfigList.length === 0 && true}
        isSubmitting={store.isSubmitting}
      >
        <Form>
          <Form.Item>
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="5%" />
                    <col width="30%" />
                    <col width="15%" />
                    <col width="20%" />
                    <col width="30%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th></th>
                      <th>
                        <strong>{t('RESOURCES_GPU_MIG_CONFIG')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GPU_DEVICES')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GPU_MIG_USE_FLAG')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GPU_MIG_DEVICES')}</strong>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
	            {!migConfigList?.length && (
                      <tr>
                        <td colSpan="5" className="no-data">
                          <p>{t('RESOURCES_GPU_MIG_CONFIGS_NOT_FOUND')}</p>
                        </td>
                      </tr>
                    )}
	            {migConfigList?.map(data => (
                      <tr key={data.name}>
		        <td rowSpan={data.mig_config_instances.length}>
                          <Radio
                            name="config"
                            value={data.name}
                            onChange={e => {
                              setRadioConfig(data.name);
                            }}
                          />
                        </td>
			<td rowSpan={data.mig_config_instances.length}>{data.name}</td>
			{data.mig_config_instances.map(inst => (
                            <><td>{inst.devices}</td>
			    <td>{inst.mig_enabled ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</td>
		            <td>{inst.mig_profiles.map(p => (
                                    <div>{p.name}:{p.number}</div>
                            ))}</td></>
                        ))}
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
