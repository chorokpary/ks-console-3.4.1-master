import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, CheckboxGroup, Checkbox, Slider, Radio, Column, Columns, Tooltip } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import HostDeviceStore from 'stores/resources/hostdevices'

import axios from "axios";

const RegistModal = (props) => {
    const hostDeviceStore = new HostDeviceStore();

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

    const [pciDeviceDataList, setPciDeviceDataList] = useState([]);

    useEffect(() => {
        const getCreateData = async () => {
            const listPciDevice = await hostDeviceStore.fetchListPciDevices();
            setPciDeviceDataList(listPciDevice.pci_devices);
        };
        getCreateData();
    }, [])

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
                    
                    

                </Form>
            </Modal >

        </>
    );
};

export default RegistModal

