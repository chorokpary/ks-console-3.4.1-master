import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import axios from "axios";

const RegistModal = (props) => {

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

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
                , validPort: { isValid: false, message: "※포트 범위는 숫자이거나 0~65535 숫자 범위이어야 합니다." }
            }];
            setFormRulesIngressFields(values);
        },

        handleRemoveFields: (i) => {
            let values = [...formRulesIngressFields].filter((obj, idx) => idx !== i);
            setFormRulesIngressFields(values);
        },

        handleInputChange: (i, e) => {
            const values = [...formRulesIngressFields];

            if (e.target.id.indexOf("remoteIpPrefix") != -1) {
                values[i].remoteIpPrefix = e.target.value.replace(regexRemoteIp, '');
            } else {
                if (regexPort.test(e.target.value) || (e.target.value < 0 || e.target.value > 65535)) {
                    values[i].validPort.isValid = true;
                } else {
                    values[i].validPort.isValid = false;
                }

                if (e.target.id.indexOf("portRangeMin") != -1) {
                    values[i].portRangeMin = e.target.value;
                } else {
                    values[i].portRangeMax = e.target.value;
                }
            }

            setFormRulesIngressFields(values);
        },

        handleSelectClick: (i, e, field, val) => {
            let values = [...formRulesIngressFields];

            if (field === "ethernetType") {
                values[i].ethernetType = val;
            } else if (field === "protocol") {
                values[i].protocol = val;
            } else if (field === "remoteIpPrefix") {
                values[i].remoteIpPrefix = val;
            } else {
                values[i].ruleType = val;
                values = setRuleTypeHandler(i, e, val, values);
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
                , validPort: { isValid: false, message: "※포트 범위는 숫자이거나 0~65535 숫자 범위이어야 합니다." }
            }];
            setFormRulesEgressFields(values);
        },

        handleRemoveFields: (i) => {
            let values = [...formRulesEgressFields].filter((obj, idx) => idx !== i);
            setFormRulesEgressFields(values);

            if (values.filter(obj => obj.ruleType === "ALL").length < 1) {
                setBtnDisabled(false);
            }
        },

        handleInputChange: (i, e) => {
            const values = [...formRulesEgressFields];

            if (e.target.id.indexOf("remoteIpPrefix") != -1) {
                values[i].remoteIpPrefix = e.target.value.replace(regexRemoteIp, '');
            } else {
                if (regexPort.test(e.target.value) || (e.target.value < 0 || e.target.value > 65535)) {
                    values[i].validPort.isValid = true;
                } else {
                    values[i].validPort.isValid = false;
                }

                if (e.target.id.indexOf("portRangeMin") != -1) {
                    values[i].portRangeMin = e.target.value;
                } else {
                    values[i].portRangeMax = e.target.value;
                }
            }

            setFormRulesEgressFields(values);
        },

        handleSelectClick: (i, e, field, val) => {
            let values = [...formRulesEgressFields];

            if (field === "ethernetType") {
                values[i].ethernetType = val;
            } else if (field === "protocol") {
                values[i].protocol = val;
            } else if (field === "remoteIpPrefix") {
                values[i].remoteIpPrefix = val;
            } else {
                values[i].ruleType = val;
                if (val === "ALL") {
                    setBtnDisabled(true);
                } else {
                    setBtnDisabled(false);
                }
                values = setRuleTypeHandler(i, e, val, values);
            }

            setFormRulesEgressFields(values);
        },

    }//end Rules

    //유형에 맞는 프로토콜, 포트범위 셋팅
    const setRuleTypeHandler = (i, e, val, values) => {

        values[i].isCustom = val === "CUSTOM" ? true : false;
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

                    <div style={{ padding: 10 }} />

                    

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

