import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button} from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import LoadBalancerStore from 'stores/resources/loadbalancers'

const ModifyModal = (props) => {

    const loadBalancerStore = new LoadBalancerStore();

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

    const [vmDataList, setVmDataList] = useState([]);

    useEffect(() => {
        
        const getCreateData = async () => {
            const listVm = await loadBalancerStore.fetchVmList();

            setVmDataList(listVm.vms);
        };

        getCreateData();
    }, [])

    const vmOptions = () => {
        const opt = vmDataList.filter((el) => el.networks.map(elN => elN.name).includes(props.store.detail?.lb?.network)).map((obj) => ({
            label: t(obj.name),
            value: t(obj.name),
        }))
        return opt
    }

    const handleOk = () => {
        const onOk = props.onOk;

        form.current.validator(() => {
            const { data } = form.current.props;
            data.members = [...formMemberIpFields].filter(el => el.memberIp).map(obj => obj.memberIp);

            onOk({ lb: data })
        })
    }

    const closeModal = () => {
        setModalView(false);
    }

    const memberIpObj = {
        vmName: '선택'
        , memberIp: ''
    }
    const [formMemberIpFields, setFormMemberIpFields] = useState([memberIpObj]);
    //멤버 IP handler
    const handleMemberIp = {

        handleAddFields: () => {
            const values = [...formMemberIpFields, memberIpObj];
            setFormMemberIpFields(values);
        },

        handleRemoveFields: (i) => {
            const values = [...formMemberIpFields].filter((obj, idx) => idx !== i);
            setFormMemberIpFields(values);
        },

        handleSelectClick: (i, val) => {
            const values = [...formMemberIpFields];

            const opt = vmDataList.filter((el) => el.name === val).map((obj) => {
                return obj.networks.filter((el) => el.name === props.store.detail?.lb?.network).map((network) => ({
                    value: network.ip
                }))
            })

            values[i].memberIp = opt[0][0].value;

            values[i].vmName = val;
            setFormMemberIpFields(values);
        },

        handleIpSelectClick: (i, val) => {
            const values = [...formMemberIpFields];
            values[i].memberIp = val;

            setFormMemberIpFields(values);
        },

    }//end 멤버 IP


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
                    >
                        <Input
                            name="name"
                            autoFocus={true}
                            maxLength={63}
                            style={{ maxWidth: 'none' }}
                            defaultValue={props.store.detail.lb.name}
                            disabled
                        />
                    </Form.Item>
                    <div style={{ padding: 10 }} />

                    {t('멤버 IP')}<span className="form-item-required">*</span>
                    <Form.Item>
                        <div className={styles.wrapper}>
                            <div className={styles.table}>
                                <table>
                                    <colgroup>
                                        <col width="20%" />
                                        <col width="20%" />
                                        <col width="10%" />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th><strong>가상 머신 이름</strong></th>
                                            <th><strong>가상 머신 IP</strong></th>
                                            <th><strong></strong></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formMemberIpFields.map((v, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <Select value={v.vmName} options={vmOptions()} onChange={(e) => handleMemberIp.handleSelectClick(i, e)} />
                                                </td>
                                                <td>
                                                    <Input type="text " value={v.memberIp} disabled />
                                                </td>
                                                <td>
                                                    <Button
                                                        type="flat"
                                                        icon="trash"
                                                        onClick={() => handleMemberIp.handleRemoveFields(i)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="text-right">
                                <Button
                                    className={styles.add}
                                    onClick={handleMemberIp.handleAddFields}
                                >
                                    추가
                                </Button>
                            </div>
                        </div>
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
                            defaultValue={props.store.detail.lb.description}
                            style={{ maxWidth: 'none' }}
                        />
                    </Form.Item>

                </Form>
            </Modal >

        </>
    );
};

export default ModifyModal

