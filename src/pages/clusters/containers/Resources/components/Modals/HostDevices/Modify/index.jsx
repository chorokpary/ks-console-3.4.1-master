import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, TextArea } from '@kube-design/components'
import {
    RadioButton,
    RadioGroup,
  } from '@kube-design/components/lib/components/Radio';
import { Modal } from 'components/Base'
import styles from './index.scss'

const ModifyModal = (props) => {
    const detail = props.detail;
    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});
    const [isGpu, setIsGpu] = useState(detail.is_gpu);

    const isGpuOptions = [
        { label: t('RESOURCES_NOT_USE'), value: false },
        { label: t('RESOURCES_USE'), value: true },
      ];

    const handleOk = () => {
        const onOk = props.onOk;

        form.current.validator(() => {
            const { data } = form.current.props;
            const { id } = detail;
            data.id = id;
            onOk({ ...data });
        })
    }

    const closeModal = () => {
        setModalView(false);
    }

    return (
        <>
            <Modal
                icon="pen"
                width={500}
                title={props.title}
                onOk={handleOk}
                onCancel={closeModal}
                cancelText={t('RESOURCES_CANCEL')}
                visible={modelView}
            >
                <Form data={formData} ref={form}>

                    <Form.Item
                        label={t('RESOURCES_NAME')}
                        rules={[{ required: true, message: t('RESOURCES_NAME_EMPTY_DESC') }]}
                    >
                        <Input
                            name="name"
                            autoFocus={true}
                            maxLength={63}
                            style={{ maxWidth: 'none' }}
                            defaultValue={props.store.detail.host_device.name}
                            disabled
                        />
                    </Form.Item>

                    <Form.Item
                        label="GPU"
                        rules={[{ required: true }]}
                    >
                        <RadioGroup
                            name="is_gpu"
                            wrapClassName="radio"
                            defaultValue={isGpu}
                            onChange={value => setIsGpu(value)}
                        >
                            {isGpuOptions.map(option => (
                                <RadioButton key={option.value} value={option.value}>
                                    {option.label}
                                </RadioButton>
                            ))}
                        </RadioGroup>
                    </Form.Item>

                    <Form.Item
                        className={styles.textarea}
                        label={t('RESOURCES_DESCRIPTION')}
                        desc={t('DESCRIPTION_DESC')}
                    >
                        <TextArea
                            name="description"
                            maxLength={256}
                            rows="2"
                            defaultValue={props.store.detail.host_device.description}
                            style={{ maxWidth: 'none' }}
                        />
                    </Form.Item>

                </Form>
            </Modal >

        </>
    );
};

export default ModifyModal

