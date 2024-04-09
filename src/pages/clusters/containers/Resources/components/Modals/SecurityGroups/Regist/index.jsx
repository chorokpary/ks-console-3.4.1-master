import { cloneDeep, get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, Columns, Column, Tooltip } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'
import { ProjectSelect, NumberInput } from 'components/Inputs'

import { PATTERN_USER_NAME, PATTERN_IP, PATTERN_IP_MASK, PATTERN_PORT } from 'utils/constants'

const RegistModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [projectName, setProjectName] = useState(props.namespace ? props.namespace : 'default');
  const [btnDimmOut, setBtnDimmOut] = useState(false);
  const [btnDimmIn, setBtnDimmIn] = useState(false);

  const [inDupRules, setInDupRules] = useState(true);
  const [outDupRules, setOutDupRules] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false)

  const regexRemoteIp = /[^0123456789.\/]/g;
  const regexPort = /[^0123456789]/g;

  const ruleTypeOptions = [
    { value: "CUSTOM", label: t('RESOURCES_SPECIFY_USER'), protocol: "TCP", port: 0 },
    { value: "ALL", label: "ALL", protocol: "TCP", port: "0-65535" },
    { value: "FTP", label: "FTP", protocol: "TCP", port: 20 },
    { value: "SSH", label: "SSH", protocol: "TCP", port: 22 },
    { value: "TELNET", label: "TELNET", protocol: "TCP", port: 23 },
    { value: "SMTP", label: "SMTP", protocol: "TCP", port: 25 },
    { value: "DNS", label: "DNS", protocol: "TCP", port: 53 },
    { value: t('RESOURCES_DHCP_SERVER'), label: t('RESOURCES_DHCP_SERVER'), protocol: "UDP", port: 67 },
    { value: t('RESOURCES_DHCP_CLIENT'), label: t('RESOURCES_DHCP_CLIENT'), protocol: "UDP", port: 68 },
    { value: "HTTP", label: "HTTP", protocol: "TCP", port: 80 },
    { value: "POP3", label: "POP3", protocol: "TCP", port: 110 },
    { value: "IMAP4", label: "IMAP4", protocol: "TCP", port: 143 },
    { value: "HTTPS", label: "HTTPS", protocol: "TCP", port: 443 },
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
    { value: "", label: t('RESOURCES_CONNTECT_DIRECT') },
  ];

  const nextIngress = useRef(0);
  const [formRulesIngressFields, setFormRulesIngressFields] = useState([]);
  //Rules handler
  const handleIngressRules = {

    handleAddFields: () => {
      const values = [...formRulesIngressFields,
      {
        ruleType: t('RESOURCES_SPECIFY_USER')
        , direction: 'Ingress'
        , ethernetType: 'IPv4'
        , remoteIpPrefix: '0.0.0.0/0'
        , protocol: 'TCP'
        , portRangeMin: 0
        , portRangeMax: 0
        , isCustom: true
        , idx: nextIngress.current += 1
        // , validPort: { isValid: false, message: t('RESOURCES_SG_PORT_RANGE_DESC') }
      }];
      setFormRulesIngressFields(values);
    },

    handleRemoveFields: (i) => {
      const values = [...formRulesIngressFields].filter((obj) => obj.idx !== i);
      setFormRulesIngressFields(values);
      if (values.length < 1) {
        setBtnDimmIn(false);
      }
      form.current.props.data[`ipIn_${i}`] = '0.0.0.0/0'
      form.current.props.data[`portIn_${i}`] = 1
    },

    handleInputChange: (i, field, e) => {
      const values = [...formRulesIngressFields];
      const val = e

      if (field.indexOf("remoteIpPrefix") != -1) {
        values[i].remoteIpPrefix = val;
      } else {

        values[i].portRangeMax = val;
      }

      setFormRulesIngressFields(values);
    },

    handleSelectClick: (i, field, val, customIdx) => {
      let values = [...formRulesIngressFields];

      if (field === "ethernetType") {
        values[i].ethernetType = val;
      } else if (field === "protocol") {
        values[i].protocol = val;
      } else if (field === "remoteIpPrefix") {
        values[i].remoteIpPrefix = val;
      } else {
        values[i].ruleType = val;
        values = setRuleTypeHandler(i, val, values, 'In', customIdx);
      }

      if (val === "ALL") {
        values = values.filter((obj, idx) => idx === i);
        setBtnDimmIn(true);
      } else {
        setBtnDimmIn(false);
      }

      setFormRulesIngressFields(values);
    },

  }//end Rules

  const nextEngress = useRef(0);
  const [formRulesEgressFields, setFormRulesEgressFields] = useState([]);
  //Rules handler
  const handleEgressRules = {

    handleAddFields: () => {
      const values = [...formRulesEgressFields,
      {
        ruleType: t('RESOURCES_SPECIFY_USER')
        , direction: 'Egress'
        , ethernetType: 'IPv4'
        , remoteIpPrefix: '0.0.0.0/0'
        , protocol: 'TCP'
        , portRangeMin: 0
        , portRangeMax: 0
        , isCustom: true
        , idx: nextEngress.current += 1
        // , validPort: { isValid: false, message: t('RESOURCES_SG_PORT_RANGE_DESC') }
      }];
      setFormRulesEgressFields(values);
    },

    handleRemoveFields: (i) => {
      const values = [...formRulesEgressFields].filter((obj) => obj.idx !== i);
      setFormRulesEgressFields(values);
      if (values.length < 1) {
        setBtnDimmOut(false);
      }
      form.current.props.data[`ipOut_${i}`] = '0.0.0.0/0'
      form.current.props.data[`portOut_${i}`] = 1
    },

    handleInputChange: (i, field, e) => {
      const values = [...formRulesEgressFields];
      const val = e;

      if (field.indexOf("remoteIpPrefix") != -1) {
        values[i].remoteIpPrefix = val;
      } else {
        values[i].portRangeMax = val;
      }

      setFormRulesEgressFields(values);
    },

    handleSelectClick: (i, field, val, customIdx) => {
      let values = [...formRulesEgressFields];

      if (field === "ethernetType") {
        values[i].ethernetType = val;
      } else if (field === "protocol") {
        values[i].protocol = val;
      } else if (field === "remoteIpPrefix") {
        values[i].remoteIpPrefix = val;
      } else {
        values[i].ruleType = val;
        values = setRuleTypeHandler(i, val, values, 'Out', customIdx);

        if (val === "ALL") {
          values = values.filter((obj, idx) => idx === i);
          setBtnDimmOut(true);
        } else {
          setBtnDimmOut(false);
        }
      }

      setFormRulesEgressFields(values);
    },

  }//end Rules

  //유형에 맞는 프로토콜, 포트범위 셋팅
  const setRuleTypeHandler = (i, val, values, portType, customIdx) => {

    const { data } = form.current.props;
    values[i].isCustom = (val === "CUSTOM") ? true : false;
    if (val === "ALL") {
      values[i].protocol = "ALL";
      values[i].ethernetType = "ALL";
    } else {
      values[i].protocol = ruleTypeOptions.filter((obj) => obj.value === val)[0].protocol;
      values[i].ethernetType = "IPv4";
    }
    values[i].portRangeMax = ruleTypeOptions.filter((obj) => obj.value === val)[0].port;
    data[`port${portType}_${customIdx}`] = values[i].portRangeMax

    let portInput = document.querySelector(`input[name=port${portType}_${customIdx}]`)
    if (
      portInput.nextElementSibling &&
      portInput.nextElementSibling.classList.contains('form-item-error')
    ) {
      portInput.nextElementSibling.classList.add('hide');
      portInput.parentElement.parentElement.classList.remove('error-item');
    }
    // values[i].validPort.isValid = false;

    return values;
  }
  //----------------end 

  // const ruleDuplicate = (rules) => {
  //   const arr = cloneDeep(rules)
  //   let cnt = 0;
  //   arr.some(function (x) {
  //     delete x.idx
  //     arr.some(function (y) {
  //       delete y.idx
  //       if (JSON.stringify(x) === JSON.stringify(y)) {
  //         cnt++
  //       }
  //     })
  //   });
  //   return cnt !== rules.length
  // }

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {

      const { data } = form.current.props;
      const security_group_rules = [...formRulesIngressFields.filter(obj => delete obj.validPort && delete obj.isCustom && obj.remoteIpPrefix)
        , ...formRulesEgressFields.filter(obj => delete obj.validPort && delete obj.isCustom && obj.remoteIpPrefix)];
      const sgData = {
        name: data.name,
        security_group_rules,
        project: projectName
      }
      setIsSubmitting(true)
      // console.log(sgData)
      onOk({ security_group: sgData })

    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  // cidr Validator
  const cidrValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_CIDR_EMPTY_DESC') })
    } else {
      if (value.split("/").length != 2 || !isValidIpAddress(value.split("/")[0]) || !fnCheckCidrClass(value.split("/")[1])) {
        return callback({ message: t('RESOURCES_CIDR_VALID') })
      }
    }
    callback()
  }

  // port Validator
  const portValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('ENTER_PORT_NUMBER') })
    } else {
      if (value === '0-65535') {
        return callback();
      }
      if (!isValidPort || !Number.isInteger(value)) {
        return callback({ message: t('INVALID_PORT_DESC') })
      }
    }
    callback()
  }

  // port valid
  const isValidPort = port => {
    return PATTERN_PORT.test(port);
  };

  // ip valid
  const isValidIpAddress = ip => {
    return PATTERN_IP.test(ip);
  };

  // cidrclass valid
  const fnCheckCidrClass = num => {
    if (parseInt(num) === 0) {
      return true;
    }
    if (!PATTERN_IP_MASK.test(num)) {
      return false;
    }
    const clsMaximumVal = 128;
    const classVal = parseInt(num);
    if (classVal < 1 || classVal > clsMaximumVal) {
      return false;
    }
    return true;
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
        isSubmitting={isSubmitting}
      >
        <Form data={formData} ref={form}>

          <Columns>
            <Column>
              <Form.Item
                label={t('RESOURCES_NAME')}
                rules={[
                  { required: true, message: t('NAME_EMPTY_DESC') },
                  {
                    pattern: PATTERN_USER_NAME,
                    message: t('RESOURCES_INVALID_NAME_DESC'),
                  }
                ]}
                desc={t('NAME_DESC')}
              >
                <Input
                  name="name"
                  autoFocus={true}
                  maxLength={63}
                  style={{ maxWidth: 'none' }}
                />
              </Form.Item>
            </Column>
            {!props.namespace && (
              <Column>
                <Form.Item
                  label={t('PROJECT')}
                  desc={t('SELECT_PROJECT_DESC')}
                  rules={[
                    { required: true, message: t('PROJECT_NOT_SELECT_DESC') },
                  ]}
                >
                  <ProjectSelect
                    name="namespace"
                    defaultValue={projectName}
                    cluster={props.cluster}
                    onChange={(e) => setProjectName(e)}
                  />
                </Form.Item>
              </Column>
            )}
          </Columns>

          <Form.Item label={t('RESOURCES_SECURITY_RULE')}>
            <Form.Group>
              <Form.Item label={t('RESOURCES_INBOUND')}>
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
                          <th><strong>{t('RESOURCES_POLICY')}</strong></th>
                          <th><strong>{t('RESOURCES_PROTOCOL')}</strong></th>
                          <th><strong>{t('RESOURCES_PORT_RANGE')}</strong></th>
                          <th><strong>{t('RESOURCES_ETHERNET_TYPE')}</strong></th>
                          <th><strong>{t('RESOURCES_REMOTE_IP_RANGE')}</strong></th>
                          <th><strong></strong></th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 인그레스 */}
                        {formRulesIngressFields.map((v, i) => (
                          <tr key={i}>
                            {/* 정책 */}
                            <td>
                              <Select value={v.ruleType} options={ruleTypeOptions} onChange={(e) => handleIngressRules.handleSelectClick(i, 'ruleType', e, v.idx)} />
                            </td>
                            {/* 프로토콜 */}
                            <td>
                              <Select value={v.protocol} options={protocolOptions} onChange={(e) => handleIngressRules.handleSelectClick(i, 'protocol', e, v.idx)} disabled={!v.isCustom} />
                            </td>
                            {/* 포트 범위 */}
                            <td>
                              {/* <Tooltip content={v.validPort.isValid ? v.validPort.message : ''} placement="right" always={v.validPort.isValid} > */}

                              <Form.Item
                                rules={[
                                  {
                                    validator: portValidator,
                                  },
                                ]}
                              >
                                <NumberInput
                                  name={`portIn_${v.idx}`}
                                  min={0}
                                  max={65535}
                                  onChange={(e) => handleIngressRules.handleInputChange(i, 'portRangeMax', e)}
                                  defaultValue={v.portRangeMax}
                                  disabled={!v.isCustom}
                                />
                              </Form.Item>
                              {/* </Tooltip> */}
                            </td>
                            <td>
                              <Select value={v.ethernetType} options={ethernetTypeOptions} disabled={true} />
                            </td>
                            {/* IP 범위 */}
                            <td>
                              <Form.Item
                                rules={[
                                  {
                                    validator: cidrValidator,
                                  },
                                ]}
                              >
                                <Input type="text"
                                  name={`ipIn_${v.idx}`}
                                  onChange={(e) => handleIngressRules.handleInputChange(i, 'remoteIpPrefix', e)}
                                  defaultValue={v.remoteIpPrefix} />
                              </Form.Item>
                            </td>
                            <td>
                              <Button
                                type="flat"
                                icon="trash"
                                onClick={() => handleIngressRules.handleRemoveFields(v.idx)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* <div className={`form-item-error ${inDupRules ? "hide" : ""}`} style={{ marginLeft: '10px' }}>{t('RESOURCES_DUPLICATE_POLICY_TIP')}</div> */}
                  </div>
                  <div className="text-right">
                    <Button
                      className={styles.add}
                      onClick={handleIngressRules.handleAddFields}
                      disabled={btnDimmIn}
                    >
                      추가
                    </Button>
                  </div>
                </div>
              </Form.Item>

              <Form.Item label={t('RESOURCES_OUTBOUND')}>
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
                          <th><strong>{t('RESOURCES_POLICY')}</strong></th>
                          <th><strong>{t('RESOURCES_PROTOCOL')}</strong></th>
                          <th><strong>{t('RESOURCES_PORT_RANGE')}</strong></th>
                          <th><strong>{t('RESOURCES_ETHERNET_TYPE')}</strong></th>
                          <th><strong>{t('RESOURCES_REMOTE_IP_RANGE')}</strong></th>
                          <th><strong></strong></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formRulesEgressFields.map((v, i) => (
                          <tr key={i}>
                            <td>
                              <Select value={v.ruleType} options={ruleTypeOptions} onChange={(e) => handleEgressRules.handleSelectClick(i, 'ruleType', e, v.idx)} />
                            </td>
                            <td>
                              <Select value={v.protocol} options={protocolOptions} onChange={(e) => handleEgressRules.handleSelectClick(i, 'protocol', e, v.idx)} disabled={!v.isCustom} />
                            </td>
                            <td>
                              {/* <Tooltip content={v.validPort.isValid ? v.validPort.message : ''} placement="right" always={v.validPort.isValid} > */}

                              <Form.Item
                                rules={[
                                  {
                                    validator: portValidator,
                                  },
                                ]}
                              >
                                <NumberInput
                                  name={`portOut_${v.idx}`}
                                  min={0}
                                  max={65535}
                                  onChange={(e) => handleEgressRules.handleInputChange(i, 'portRangeMax', e)}
                                  defaultValue={v.portRangeMax}
                                  disabled={!v.isCustom} />
                              </Form.Item>
                              {/* </Tooltip> */}
                            </td>
                            <td>
                              <Select value={v.ethernetType} options={ethernetTypeOptions} disabled={true} />
                            </td>
                            <td>
                              <Form.Item
                                rules={[
                                  {
                                    validator: cidrValidator,
                                  },
                                ]}
                              >
                                <Input type="text"
                                  name={`ipOut_${v.idx}`}
                                  onChange={(e) => handleEgressRules.handleInputChange(i, 'remoteIpPrefix', e)}
                                  defaultValue={v.remoteIpPrefix} />
                              </Form.Item>
                            </td>
                            <td>
                              <Button
                                type="flat"
                                icon="trash"
                                onClick={() => handleEgressRules.handleRemoveFields(v.idx)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* <div className={`form-item-error ${outDupRules ? "hide" : ""}`} style={{ marginLeft: '10px' }}>{t('RESOURCES_DUPLICATE_POLICY_TIP')}</div> */}
                  </div>
                  <div className="text-right">
                    <Button
                      className={styles.add}
                      onClick={handleEgressRules.handleAddFields}
                      disabled={btnDimmOut}
                    >
                      {t('RESOURCES_ADD')}
                    </Button>
                  </div>
                </div>
              </Form.Item>
            </Form.Group>
          </Form.Item>

          <div style={{ padding: 10 }} />

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

