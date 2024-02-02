import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Radio, Toggle, Loading } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import MediatedDevicesStore from 'stores/resources/mediateddevices'

const regexName = /^([a-z]+)\/([a-z0-9]+)$/;

const RegistModal = (props) => {

    const mediatedDevicesStore = new MediatedDevicesStore();

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

    const [deviceDataList, setDeviceDataList] = useState([]);
    const [deviceCheckItem, setDeviceCheckItem] = useState('');
    const [isGpu, setIsGpu] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheck, setIsCheck] = useState(false);

    const handleOk = () => {
        const onOk = props.onOk;
        setIsCheck(true)
        form.current.validator(() => {
            if (deviceCheckItem) {
                const { data } = form.current.props;

                data.resource_name = data.name;
                data.mediated_device_name = deviceCheckItem;
                data.is_gpu = isGpu;

                onOk({ mediated_device: data })
            }
        })
    }

    // Validation 시작 ==================================================
    const nameValidator = (rule, value, callback) => {
        if (value == undefined) {
            return callback({ message: t('RESOURCES_NAME_EMPTY_DESC') })
        } else {
            if (!regexName.test(value)) {
                return callback({ message: t('RESOURCES_NAME_CHECK_DESC') })
            }
        }
        callback()
    }

    const closeModal = () => {
        setModalView(false);
    }

    let timer = 0;
    useEffect(() => {

        Promise.all([getDeviceData()]).then((values) => {
            const fetchData = (timeSec) => {
                timer = setTimeout(async () => {
                    if (values[0].length > 0) {
                        setDeviceDataList(values[0])
                        setIsLoading(false)
                    } else {
                        if (timeSec === 1000) {
                            fetchData(2000)
                        } else {
                            setIsLoading(false)
                        }
                    }
                }, timeSec)
            }
            fetchData(1000);
        });

        return () => {
            clearTimeout(timer)
        }

    }, [])

    const getDeviceData = () => {
        return new Promise(async (resolve, reject) => {
            const listDevice = await mediatedDevicesStore.fetchDeviceList();
            resolve(listDevice)
        })
    };

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
                disableSubmit={deviceDataList.length === 0 && true}
            >
                <Form data={formData} ref={form}>

                    <Form.Item
                        label={t('RESOURCES_NAME')}
                        rules={[{ required: true, validator: nameValidator }]}
                        desc={t('RESOURCES_NAME_VALID_DESC') + ' ex) test/001'}
                    >
                        <Input
                            name="name"
                            autoFocus={true}
                            maxLength={63}
                            style={{ maxWidth: 'none' }}
                        />
                    </Form.Item>
                    <div style={{ padding: 10 }} />

                    {t('RESOURCES_MEDIATED_DEVICE')}<span className="form-item-required">*</span>
                    <Form.Item>
                        <div className={styles.wrapper}>
                            <div className={styles.table}>
                                <table>
                                    <colgroup>
                                        <col width="5%" />
                                        <col width="12%" />
                                        <col width="18%" />
                                        <col width="10%" />
                                        <col width="10%" />
                                        <col width="12%" />
                                        <col width="13%" />
                                        <col width="15%" />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th><strong>{t('RESOURCES_DEVICE_ID')}</strong></th>
                                            <th><strong>{t('RESOURCES_DEVICE_NAME')}</strong></th>
                                            <th><strong>{t('RESOURCES_CLASS')}</strong></th>
                                            <th><strong>{t('RESOURCES_MAX_COUNT')}</strong></th>
                                            <th><strong>{t('RESOURCES_RESOLUTION')}</strong></th>
                                            <th><strong>{t('RESOURCES_CUDA_SUPPORT_CHECK')}</strong></th>
                                            <th><strong>{t('RESOURCES_PIXEL_COUNT')}</strong></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? <tr><td colSpan="8" className="no-data" style={{ textAlign: 'center' }}><Loading /></td></tr>
                                            :
                                            deviceDataList?.length < 1 ?
                                                <tr>
                                                    <td colSpan="8" className="no-data">
                                                        <p>{t('RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION')}</p>
                                                    </td>
                                                </tr>
                                                :
                                                deviceDataList?.map((data, key) => (
                                                    <tr key={data.name}>
                                                        <td>
                                                            <Radio name={`select-${data.name}`}
                                                                checked={data.name === deviceCheckItem}
                                                                onChange={(e) => setDeviceCheckItem(data.name)} />
                                                        </td>
                                                        <td>{data.mdev_id}</td>
                                                        <td>{data.name}</td>
                                                        <td>{data.clazz}</td>
                                                        <td>{data.max_num}</td>
                                                        <td>{data.resolution}</td>
                                                        <td>{data.cuda ? t('RESOURCES_SUPPORT') : t('RESOURCES_NOT_SUPPORT')}</td>
                                                        <td>{data.pixels}</td>
                                                    </tr>
                                                ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className={`form-item-error ${!deviceCheckItem && isCheck ? "" : "hide"}`}>{t('RESOURCES_SELECT_DEVICE_TIP')}</div>
                        </div>
                    </Form.Item>
                    <div style={{ padding: 10 }} />

                    {t('RESOURCES_GPU_CHECK')}<span className="form-item-required">*</span>
                    <Form.Item>
                        <Toggle showText onText="on" offText="off" value={isGpu} onChange={(e) => setIsGpu(!isGpu)} />
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
            </Modal >

        </>
    );
};

export default RegistModal

