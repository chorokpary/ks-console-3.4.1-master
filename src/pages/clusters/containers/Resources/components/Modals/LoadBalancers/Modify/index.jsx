import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import LoadBalancerStore from 'stores/resources/loadbalancers'

const ModifyModal = (props) => {

    const loadBalancerStore = new LoadBalancerStore();

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

    const [vmDataList, setVmDataList] = useState([]);
    const [isMembers, setIsMembers] = useState(true);

    useEffect(() => {
        const getCreateData = async () => {
            const listVm = await loadBalancerStore.fetchVmList(props);

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

    const [formMemberIpFields, setFormMemberIpFields] = useState([]);
    useEffect(() => {
        const opt = props.store.detail?.lb.members.map(obj => ({
            vmName: vmDataList.filter((el) => el.networks.map(elN => elN.ip).includes(obj))[0]?.name
            , memberIp: obj
        }))
        setFormMemberIpFields(opt)
    }, [vmDataList])

    const handleOk = () => {
        const onOk = props.onOk;
        const members = [...formMemberIpFields].filter(el => el.memberIp).map(obj => obj.memberIp);

        setIsMembers(members.length > 0);

        form.current.validator(() => {

            if (members.length > 0) {
                const { data } = form.current.props;
                const { id, lb } = props.store.detail
                data.members = members;
                data.id = id;
                data.network = lb.network.id
                data.description = data.description || ''
                onOk({ lb: data, ...props })
            }

        })
    }

    const closeModal = () => {
        setModalView(false);
    }

    const memberIpObj = {
        vmName: t('RESOURCES_SELECT')
        , memberIp: ''
        , message: ''
    }
    //멤버 IP handler
    const handleMemberIp = {

        handleAddFields: () => {
            const values = [...formMemberIpFields, memberIpObj];
            setFormMemberIpFields(values);
        },

        handleRemoveFields: (i) => {
            const values = [...formMemberIpFields].filter((obj, idx) => idx !== i);
            setFormMemberIpFields(values);
            if (values.length < 1) {
                setIsMembers(false);
            }
        },

        handleSelectClick: (i, val) => {
            const values = [...formMemberIpFields];

            const opt = vmDataList.filter((el) => el.name === val).map((obj) => {
                return obj.networks.filter((el) => el.name === props.store.detail?.lb?.network).map((network) => ({
                    value: network.ip
                }))
            })

            if (!values.map(obj => obj.vmName).includes(val) || values[i].vmName === val || val === "") {
                values[i].message = ""
                values[i].vmName = val;
                values[i].memberIp = opt[0][0].value;
                setIsMembers(true);
            } else {
                values[i].message = t('RESOURCES_ALREADY_SELECTED_VM_NAME');
                setTimeout(() => { handleMemberIp.deleteMessage(i) }, 1000);
            }

            setFormMemberIpFields(values);
        },

        deleteMessage: (i) => {
            const values = [...formMemberIpFields];
            values[i].message = "";
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
                cancelText={t('RESOURCES_CANCEL')}
                visible={modelView}
            >
                <Form data={formData} ref={form}>

                    <Form.Item
                        label={t('RESOURCES_NAME')}
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

                    {t('RESOURCES_MEMBER_IP')}<span className="form-item-required">*</span>
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
                                            <th><strong>{t('RESOURCES_VM_NAME')}</strong></th>
                                            <th><strong>{t('RESOURCES_VM_IP')}</strong></th>
                                            <th><strong></strong></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formMemberIpFields.map((v, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <Select value={v.message ? v.message : v.vmName} options={vmOptions()} onChange={(e) => handleMemberIp.handleSelectClick(i, e)} />
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
                                <div className={`form-item-error ${isMembers ? "hide" : ""}`} style={{ marginLeft: '10px' }}>{t('RESOURCES_SELECT_VM_NAME_TIP')}</div>
                            </div>
                            <div className="text-right">
                                <Button
                                    className={styles.add}
                                    onClick={handleMemberIp.handleAddFields}
                                >
                                    {t('RESOURCES_ADD')}
                                </Button>
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
                            defaultValue={props.store.detail.lb.description || ''}
                            style={{ maxWidth: 'none' }}
                        />
                    </Form.Item>

                </Form>
            </Modal >

        </>
    );
};

export default ModifyModal

