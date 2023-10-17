import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, Tooltip } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import LoadBalancerStore from 'stores/resources/loadbalancers'

const RegistModal = (props) => {

    const loadBalancerStore = new LoadBalancerStore();

    const regexPort = /[^0123456789-]/g;
    const ruleTypeOptions = [
        { value: "CUSTOM", label: "사용자 지정", protocol: "TCP", port: "0" },
        { value: "ALL", label: "ALL", protocol: "TCP", port: "0-65535" },
        { value: "FTP", label: "FTP", protocol: "TCP", port: "20" },
        { value: "SSH", label: "SSH", protocol: "TCP", port: "22" },
        { value: "TELNET", label: "TELNET", protocol: "TCP", port: "23" },
        { value: "SMTP", label: "SMTP", protocol: "TCP", port: "25" },
        { value: "DNS", label: "DNS", protocol: "TCP", port: "53" },
        { value: "DHCP서버", label: "DHCP서버", protocol: "UDP", port: "67" },
        { value: "DHCP클라이언트", label: "DHCP클라이언트", protocol: "UDP", port: "68" },
        { value: "HTTP", label: "HTTP", protocol: "TCP", port: "80" },
        { value: "POP3", label: "POP3", protocol: "TCP", port: "110" },
        { value: "IMAP4", label: "IMAP4", protocol: "TCP", port: "143" },
        { value: "HTTPS", label: "HTTPS", protocol: "TCP", port: "443" },
    ];

    const protocolOptions = [
        { value: "ALL", label: "ALL" },
        { value: "TCP", label: "TCP" },
        { value: "UDP", label: "UDP" },
        { value: "ICMP", label: "ICMP" },
    ];

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

    const [networkName, setNetworkName] = useState('');

    const [btnDimm, setBtnDimm] = useState(false);

    const [networkDataList, setNetworkDataList] = useState([]);
    const [vmDataList, setVmDataList] = useState([]);

    useEffect(() => {

        const getCreateData = async () => {
            const listNetwork = await loadBalancerStore.fetchNetworkList();
            const listVm = await loadBalancerStore.fetchVmList();

            setNetworkDataList(listNetwork.networks);
            setVmDataList(listVm.vms);
        };
        
        getCreateData();
    }, [])

    const networkOptions = () => {
        const opt = networkDataList.filter((el) => !el.external).map((obj) => ({
            label: t(obj.name),
            value: t(obj.name),
        }))
        return opt
    }
    const vmOptions = () => {
        const opt = vmDataList.filter((el) => el.networks.map(elN => elN.name).includes(networkName)).map((obj) => ({
            label: t(obj.name),
            value: t(obj.name),
        }))
        return opt
    }

    const handleOk = () => {
        const onOk = props.onOk;

        form.current.validator(() => {
            const { data } = form.current.props;
            data.network = networkName
            data.members = [...formMemberIpFields].filter(el => el.memberIp).map(obj => obj.memberIp);

            data.lb_rule = [...formRulesFields.filter(el => delete el.validPort && delete el.isCustom)];

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
                return obj.networks.filter((el) => el.name === networkName).map((network) => ({
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

        handleIpClear: () => {
            setFormMemberIpFields([memberIpObj]);
        },

    }//end 멤버 IP

    const rulsObj = {
        ruleType: '사용자 지정'
        , protocol: 'TCP'
        , portRangeMin: '0'
        , portRangeMax: '0'
        , isCustom: true
        , validPort: { isValid: false, message: "포트 범위는 숫자이거나 0~65535 숫자 범위이어야 합니다." }
    }
    const [formRulesFields, setFormRulesFields] = useState([rulsObj]);
    //Rules handler
    const handleRules = {

        handleAddFields: () => {
            const values = [...formRulesFields, rulsObj];
            setFormRulesFields(values);
        },

        handleRemoveFields: (i) => {
            const values = [...formRulesFields].filter((obj, idx) => idx !== i);
            setFormRulesFields(values);
            if (values.length < 1) {
                setBtnDimm(false);
            }
        },

        handleInputChange: (i, field, e) => {
            const values = [...formRulesFields];
            const val = e.currentTarget.value;

            if (regexPort.test(val) || (val < 0 || val > 65535)) {
                values[i].validPort.isValid = true;
            } else {
                values[i].validPort.isValid = false;
            }

            values[i].portRangeMax = val;

            setFormRulesFields(values);
        },

        handleSelectClick: (i, field, val) => {
            let values = [...formRulesFields];

            if (field === "protocol") {
                values[i].protocol = val;
            } else {
                values[i].ruleType = val;
                values = setRuleTypeHandler(i, val, values);

                if (val === "ALL") {
                    values = values.filter((obj, idx) => idx === i);
                    setBtnDimm(true);
                } else {
                    setBtnDimm(false);
                }
            }

            setFormRulesFields(values);
        },

    }//end Rules

    //유형에 맞는 프로토콜, 포트범위 셋팅
    const setRuleTypeHandler = (i, val, values) => {

        values[i].isCustom = (val === "CUSTOM") ? true : false;
        if (val === "ALL") {
            values[i].protocol = "ALL";
        } else {
            values[i].protocol = ruleTypeOptions.filter((obj) => obj.value === val)[0].protocol;
        }
        values[i].portRangeMax = ruleTypeOptions.filter((obj) => obj.value === val)[0].port;
        values[i].validPort.isValid = false;

        return values;
    }
    //----------------end

    const networkValidator = (rule, value, callback) => {
        if (value == "선택" || value == "select") {
            return callback({ message: t('네트워크이름을 선택해 주세요.') })
        }
        callback()
    }

    useEffect(() => {
        handleMemberIp.handleIpClear();
    }, [networkName])

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

                    <Form.Item label={t('네트워크 이름')} rules={[{ required: true, validator: networkValidator }]}>
                        <Select name="network"
                            options={networkOptions()}
                            onChange={(e) => setNetworkName(e)}
                            defaultValue={"선택"}
                            />
                    </Form.Item>
                    <div style={{ padding: 10 }} />

                    {t('멤버 IP')} <span className="form-item-required">*</span>
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
                                                    <Input type="text "value={v.memberIp} disabled/>
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
                    <div style={{ padding: 10 }} />

                    {t('정책')} <span className="form-item-required">*</span>
                    <Form.Item>
                        <div className={styles.wrapper}>
                            <div className={styles.table}>
                                <table>
                                    <colgroup>
                                        <col width="20%" />
                                        <col width="15%" />
                                        <col width="20%" />
                                        <col width="10%" />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th><strong>유형</strong></th>
                                            <th><strong>프로토콜</strong></th>
                                            <th><strong>포트 범위</strong></th>
                                            <th><strong></strong></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formRulesFields.map((v, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <Select value={v.ruleType} options={ruleTypeOptions} onChange={(e) => handleRules.handleSelectClick(i, 'ruleType', e)} />
                                                </td>
                                                <td>
                                                    <Select value={v.protocol} options={protocolOptions} onChange={(e) => handleRules.handleSelectClick(i, 'protocol', e)} disabled={!v.isCustom} />
                                                </td>
                                                <td>
                                                    <Tooltip content={v.validPort.isValid ? v.validPort.message : ''} placement="right" always={v.validPort.isValid} >
                                                        <Input type="text"
                                                            onChange={(e) => handleRules.handleInputChange(i, 'portRangeMax', e)}
                                                            value={v.portRangeMax}
                                                            disabled={!v.isCustom} />
                                                    </Tooltip>
                                                </td>
                                                <td>
                                                    <Button
                                                        type="flat"
                                                        icon="trash"
                                                        onClick={() => handleRules.handleRemoveFields(i)}
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
                                    onClick={handleRules.handleAddFields}
                                    disabled={btnDimm}
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

