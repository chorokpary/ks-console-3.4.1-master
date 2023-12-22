import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, CheckboxGroup, Checkbox, Slider, Radio, Column, Columns, Tooltip } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import axios from "axios";

const ModifyModal = (props) => {

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

    const handleOk = () => {
        const onOk = props.onOk;

        form.current.validator(() => {
            const { data } = form.current.props;
            onOk({ flavor: data })
        })
    }

    const closeModal = () => {
        setModalView(false);
    }

    return (
        <>
            <Modal
                icon="pen"
                width={1000}
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
                            defaultValue={props.store.detail.flavor.name}
                            disabled
                        />
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
                            defaultValue={props.store.detail.flavor.description}
                            style={{ maxWidth: 'none' }}
                        />
                    </Form.Item>

                </Form>
            </Modal >

        </>
    );
};

export default ModifyModal

