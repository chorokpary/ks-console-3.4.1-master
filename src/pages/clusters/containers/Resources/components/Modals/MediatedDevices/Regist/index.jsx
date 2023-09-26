import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, CheckboxGroup, Checkbox, Slider, Radio, Column, Columns, Tooltip } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import axios from "axios";

const RegistModal = (props) => {

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
                cancelText={'취소'}
                visible={modelView}
            >
                <Form data={formData} ref={form}>

                    <Form.Item
                        label={t('이름')}
                        rules={[{ required: true, message: t('이름을 입력해 주세요.') }]}
                        desc={t('NAME_DESC')}
                    >
                        <Input
                            name="name"
                            autoFocus={true}
                            maxLength={63}
                            style={{ maxWidth: 'none' }}
                        />
                    </Form.Item>

                    
                    <Form.Item
                        className={styles.textarea}
                        label={t('설명')}
                        desc={t('DESCRIPTION_DESC')}
                    >
                        <TextArea
                            name="description"
                            maxLength={256}
                            rows="1"
                            defaultValue=""
                            style={{ maxWidth: 'none' }}
                        />
                    </Form.Item>

                </Form>
            </Modal >

        </>
    );
};

export default RegistModal

