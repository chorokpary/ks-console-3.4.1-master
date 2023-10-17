import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, Columns, Column, Tooltip } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

const RegistModal = (props) => {

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

    const [btnDimm, setBtnDimm] = useState(false);

    const regexRemoteIp = /[^0123456789.\/]/g;
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

    const ethernetTypeOptions = [
        { value: "ALL", label: "ALL" },
        { value: "IPv4", label: "IPv4" },
    ];

    const protocolOptions = [
        //{ value: "ALL", label: "ALL" },
        { value: "TCP", label: "TCP" },
        { value: "UDP", label: "UDP" },
        { value: "ICMP", label: "ICMP" },
        { value: "SCTP", label: "SCTP" },
    ];

    const remoteIpPrefixOptions = [
        { value: "ALL", label: "ALL" },
        { value: "", label: "직접입력" },
    ];

    const [formRulesIngressFields, setFormRulesIngressFields] = useState([]);
    //Rules handler
    const handleIngressRules = {

        handleAddFields: () => {
            const values = [...formRulesIngressFields,
            {
                ruleType: '사용자 지정'
                , direction: 'Ingress'
                , ethernetType: 'IPv4'
                , remoteIpPrefix: ''
                , protocol: 'TCP'
                , portRangeMin: 0
                , portRangeMax: 0
                , isCustom: true
                , validPort: { isValid: false, message: "포트 범위는 숫자이거나 0~65535 숫자 범위이어야 합니다." }
            }];
            setFormRulesIngressFields(values);
        },

        handleRemoveFields: (i) => {
            const values = [...formRulesIngressFields].filter((obj, idx) => idx !== i);
            setFormRulesIngressFields(values);
        },

        handleInputChange: (i, field, e) => {
            const values = [...formRulesIngressFields];
            const val = e.currentTarget.value;

            if (field.indexOf("remoteIpPrefix") != -1) {
                values[i].remoteIpPrefix = val.replace(regexRemoteIp, '');
            } else {
                if (regexPort.test(val) || (val < 0 || val > 65535)) {
                    values[i].validPort.isValid = true;
                } else {
                    values[i].validPort.isValid = false;
                }

                values[i].portRangeMax = val;
            }

            setFormRulesIngressFields(values);
        },

        handleSelectClick: (i, field, val) => {
            let values = [...formRulesIngressFields];

            if (field === "ethernetType") {
                values[i].ethernetType = val;
            } else if (field === "protocol") {
                values[i].protocol = val;
            } else if (field === "remoteIpPrefix") {
                values[i].remoteIpPrefix = val;
            } else {
                values[i].ruleType = val;
                values = setRuleTypeHandler(i, val, values);
            }

            setFormRulesIngressFields(values);
        },

    }//end Rules

    const [formRulesEgressFields, setFormRulesEgressFields] = useState([]);
    //Rules handler
    const handleEgressRules = {

        handleAddFields: () => {
            const values = [...formRulesEgressFields,
            {
                ruleType: '사용자 지정'
                , direction: 'Egress'
                , ethernetType: 'IPv4'
                , remoteIpPrefix: ''
                , protocol: 'TCP'
                , portRangeMin: 0
                , portRangeMax: 0
                , isCustom: true
                , validPort: { isValid: false, message: "포트 범위는 숫자이거나 0~65535 숫자 범위이어야 합니다." }
            }];
            setFormRulesEgressFields(values);
        },

        handleRemoveFields: (i) => {
            const values = [...formRulesEgressFields].filter((obj, idx) => idx !== i);
            setFormRulesEgressFields(values);
            if (values.length < 1) {
                setBtnDimm(false);
            }
        },

        handleInputChange: (i, field, e) => {
            const values = [...formRulesEgressFields];
            const val = e.currentTarget.value;

            if (field.indexOf("remoteIpPrefix") != -1) {
                values[i].remoteIpPrefix = val.replace(regexRemoteIp, '');
            } else {
                if (regexPort.test(val) || (val < 0 || val > 65535)) {
                    values[i].validPort.isValid = true;
                } else {
                    values[i].validPort.isValid = false;
                }

                values[i].portRangeMax = val;
            }

            setFormRulesEgressFields(values);
        },

        handleSelectClick: (i, field, val) => {
            let values = [...formRulesEgressFields];

            if (field === "ethernetType") {
                values[i].ethernetType = val;
            } else if (field === "protocol") {
                values[i].protocol = val;
            } else if (field === "remoteIpPrefix") {
                values[i].remoteIpPrefix = val;
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

            setFormRulesEgressFields(values);
        },

    }//end Rules

    //유형에 맞는 프로토콜, 포트범위 셋팅
    const setRuleTypeHandler = (i, val, values) => {

        values[i].isCustom = (val === "CUSTOM") ? true : false;
        if (val === "ALL") {
            values[i].protocol = "ALL";
            values[i].ethernetType = "ALL";
        } else {
            values[i].protocol = ruleTypeOptions.filter((obj) => obj.value === val)[0].protocol;
            values[i].ethernetType = "IPv4";
        }
        values[i].portRangeMax = ruleTypeOptions.filter((obj) => obj.value === val)[0].port;
        values[i].validPort.isValid = false;

        return values;
    }
    //----------------end 

    const handleOk = () => {
        const onOk = props.onOk;

        form.current.validator(() => {
            const { data } = form.current.props;
            data.security_group_rules = [...formRulesIngressFields.filter(obj => delete obj.validPort && delete obj.isCustom && obj.remoteIpPrefix)
                , ...formRulesEgressFields.filter(obj => delete obj.validPort && delete obj.isCustom && obj.remoteIpPrefix)];
            onOk({ security_group: data })
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

                    <div style={{ padding: 10 }} />

                    <Form.Item label={t('보안정책')}>
                        <Form.Group>
                            <Form.Item label={t('인바운드')}>
                                <div className={styles.wrapper}>
                                    <div className={styles.table}>
                                        <table>
                                            <colgroup>
                                                <col width="20%" />
                                                <col width="15%" />
                                                <col width="20%" />
                                                <col width="15%" />
                                                <col width="20%" />
                                                <col width="10%" />
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <th><strong>정책</strong></th>
                                                    <th><strong>프로토콜</strong></th>
                                                    <th><strong>포트 범위</strong></th>
                                                    <th><strong>이더넷 유형</strong></th>
                                                    <th><strong>원격 IP 범위</strong></th>
                                                    <th><strong></strong></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formRulesIngressFields.map((v, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            <Select value={v.ruleType} options={ruleTypeOptions} onChange={(e) => handleIngressRules.handleSelectClick(i, 'ruleType', e)} />
                                                        </td>
                                                        <td>
                                                            <Select value={v.protocol} options={protocolOptions} onChange={(e) => handleIngressRules.handleSelectClick(i, 'protocol', e)} disabled={!v.isCustom} />
                                                        </td>
                                                        <td>
                                                            <Tooltip content={v.validPort.isValid ? v.validPort.message : ''} placement="right" always={v.validPort.isValid} >
                                                                <Input type="text"
                                                                    onChange={(e) => handleIngressRules.handleInputChange(i, 'portRangeMax', e)}
                                                                    value={v.portRangeMax}
                                                                    disabled={!v.isCustom} />
                                                            </Tooltip>
                                                        </td>
                                                        <td>
                                                            <Select value={v.ethernetType} options={ethernetTypeOptions} disabled={true} />
                                                        </td>
                                                        <td>
                                                            <Input type="text"
                                                                onChange={(e) => handleIngressRules.handleInputChange(i, 'remoteIpPrefix', e)}
                                                                value={v.remoteIpPrefix} />
                                                        </td>
                                                        <td>
                                                            <Button
                                                                type="flat"
                                                                icon="trash"
                                                                onClick={() => handleIngressRules.handleRemoveFields(i)}
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
                                            onClick={handleIngressRules.handleAddFields}
                                        >
                                            추가
                                        </Button>
                                    </div>
                                </div>
                            </Form.Item>

                            <Form.Item label={t('아웃바운드')}>
                                <div className={styles.wrapper}>
                                    <div className={styles.table}>
                                        <table>
                                            <colgroup>
                                                <col width="20%" />
                                                <col width="15%" />
                                                <col width="20%" />
                                                <col width="15%" />
                                                <col width="20%" />
                                                <col width="10%" />
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <th><strong>정책</strong></th>
                                                    <th><strong>프로토콜</strong></th>
                                                    <th><strong>포트 범위</strong></th>
                                                    <th><strong>이더넷 유형</strong></th>
                                                    <th><strong>원격 IP 범위</strong></th>
                                                    <th><strong></strong></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formRulesEgressFields.map((v, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            <Select value={v.ruleType} options={ruleTypeOptions} onChange={(e) => handleEgressRules.handleSelectClick(i, 'ruleType', e)} />
                                                        </td>
                                                        <td>
                                                            <Select value={v.protocol} options={protocolOptions} onChange={(e) => handleEgressRules.handleSelectClick(i, 'protocol', e)} disabled={!v.isCustom} />
                                                        </td>
                                                        <td>
                                                            <Tooltip content={v.validPort.isValid ? v.validPort.message : ''} placement="right" always={v.validPort.isValid} >
                                                                <Input type="text"
                                                                    onChange={(e) => handleEgressRules.handleInputChange(i, 'portRangeMax', e)}
                                                                    value={v.portRangeMax}
                                                                    disabled={!v.isCustom} />
                                                            </Tooltip>
                                                        </td>
                                                        <td>
                                                            <Select value={v.ethernetType} options={ethernetTypeOptions} disabled={true} />
                                                        </td>
                                                        <td>
                                                            <Input type="text"
                                                                onChange={(e) => handleEgressRules.handleInputChange(i, 'remoteIpPrefix', e)}
                                                                value={v.remoteIpPrefix} />
                                                        </td>
                                                        <td>
                                                            <Button
                                                                type="flat"
                                                                icon="trash"
                                                                onClick={() => handleEgressRules.handleRemoveFields(i)}
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
                                            onClick={handleEgressRules.handleAddFields}
                                            disabled={btnDimm}
                                        >
                                            추가
                                        </Button>
                                    </div>
                                </div>
                            </Form.Item>
                        </Form.Group>
                    </Form.Item>

                    <div style={{ padding: 10 }} />

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

