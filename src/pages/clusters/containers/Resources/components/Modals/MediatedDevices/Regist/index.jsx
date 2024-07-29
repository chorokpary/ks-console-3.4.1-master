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
import React, { useState, useEffect, useRef } from 'react';

import {
    Form,
    Select,
    TextArea,
    Radio,
} from '@kube-design/components';
import { Modal } from 'components/Base';

import MediatedDevicesStore from 'stores/resources/mediateddevices';
import GpuNodeStore from 'stores/resources/gpunodes';

import styles from './index.scss';

const RegistModal = props => {
    const mediatedDevicesStore = new MediatedDevicesStore();
    const gpuNodeStore = new GpuNodeStore();

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});
    const [nodeDataList, setNodeDataList] = useState([]);
    const [vgpuDataList, setVgpuDataList] = useState([]);
    const [radioConfig, setRadioConfig] = useState('');

    const getData = async () => {
        const listNode = await mediatedDevicesStore.fetchNodeList({ ...props });
        setNodeDataList(listNode.filter(obj => obj.node_role !== 'master'));
    };

    useEffect(() => {
        getData();
    }, []);

    const nodeOptions = () => {
        const opt = nodeDataList.map(obj => ({
            label: t(obj.name),
            value: t(obj.name),
        }));
        return opt;
    };

    const handleNode = value => {
        getVgpuConfigList(value);
    };

    const getVgpuConfigList = async value => {
        const response = await gpuNodeStore.fetchVgpuConfigs({
            node: value,
            ...props,
        });
	const configs = response.vgpu_configs;

        const opt = configs.map(obj => ({
            name: obj.name,
            mdev_id: obj.mdev_id,
            model_name: obj.model_name,
            resource_name: obj.resource_name,
            clazz: obj.clazz,
            max_num: obj.max_num,
            resolution: obj.resolution,
            cuda: obj.cuda,
            multivgpu: obj.multivgpu,
        }));

        setVgpuDataList(opt);
    }

    const handleOk = () => {
        const onOk = props.onOk;

	form.current.validator(() => {
            const { data } = form.current.props;

            const filtered = vgpuDataList.filter((config) => config.name === radioConfig);
            filtered.map(item => {
	        data.resource_name = item.resource_name;
                data.mediated_device_name = item.model_name;
                data.is_gpu = true;
	        onOk({ mediated_device: data });
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
                width={800}
                title={props.title}
                onOk={handleOk}
                onCancel={closeModal}
                visible={modelView}
                disableSubmit={radioConfig === ""}
                isSubmitting={props.store.isSubmitting}
            >
                <Form data={formData} ref={form}>
                    <Form.Item
                        label={t('RESOURCES_NODE')}
                        rules={[
                            {
                                required: true,
                                message: t('RESOURCES_SELECT_NODE_TIP'),
                            },
                        ]}
                    >
                        <Select
                            name="node"
                            placeholder={t('RESOURCES_SELECT')}
                            options={nodeOptions()}
                            onChange={e => {
                                handleNode(e);
                            }}
                        />
                    </Form.Item>
                    <Form.Item label={t('')}>
                        <div className={styles.wrapper}>
                            <div className={styles.table}>
                                <table>
                                    <colgroup>
                                        <col width="5%" />
                                        <col width="20%" />
                                        <col width="15%" />
                                        <col width="10%" />
                                        <col width="15%" />
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
                                        {!vgpuDataList?.length && (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="no-data"
                                                    style={{
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <p>
                                                        {t(
                                                            'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                                        )}
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                        {vgpuDataList?.map(data => (
                                            <tr key={data.name}>
                                                <td>
                                                    <Radio
                                                        name="name"
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

                    <Form.Item
                        className={styles.textarea}
                        label={t('RESOURCES_DESCRIPTION')}
                        desc={t('DESCRIPTION_DESC')}
                    >
                        <TextArea
                            name="description"
                            maxLength={256}
                            rows="1"
                            style={{ maxWidth: 'none' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default RegistModal;
