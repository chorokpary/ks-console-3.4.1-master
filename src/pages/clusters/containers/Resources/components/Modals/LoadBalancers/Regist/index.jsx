import { get } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Tooltip,
  Column,
  Columns,
} from '@kube-design/components';
import { Modal } from 'components/Base';
import styles from './index.scss';
import { ProjectSelect } from 'components/Inputs';

import { PATTERN_USER_NAME } from 'utils/constants';
import LoadBalancerStore from 'stores/resources/loadbalancers';

const RegistModal = props => {
  const loadBalancerStore = new LoadBalancerStore();

  const regexPort = /[^0123456789-]/g;
  const ruleTypeOptions = [
    {
      value: 'CUSTOM',
      label: t('RESOURCES_SPECIFY_USER'),
      protocol: 'TCP',
      port: '1',
    },
    { value: 'ALL', label: 'ALL', protocol: 'TCP', port: '0-65535' },
    { value: 'FTP', label: 'FTP', protocol: 'TCP', port: '20' },
    { value: 'SSH', label: 'SSH', protocol: 'TCP', port: '22' },
    { value: 'TELNET', label: 'TELNET', protocol: 'TCP', port: '23' },
    { value: 'SMTP', label: 'SMTP', protocol: 'TCP', port: '25' },
    { value: 'DNS', label: 'DNS', protocol: 'TCP', port: '53' },
    {
      value: t('RESOURCES_DHCP_SERVER'),
      label: t('RESOURCES_DHCP_SERVER'),
      protocol: 'UDP',
      port: '67',
    },
    {
      value: t('RESOURCES_DHCP_CLIENT'),
      label: t('RESOURCES_DHCP_CLIENT'),
      protocol: 'UDP',
      port: '68',
    },
    { value: 'HTTP', label: 'HTTP', protocol: 'TCP', port: '80' },
    { value: 'POP3', label: 'POP3', protocol: 'TCP', port: '110' },
    { value: 'IMAP4', label: 'IMAP4', protocol: 'TCP', port: '143' },
    { value: 'HTTPS', label: 'HTTPS', protocol: 'TCP', port: '443' },
  ];

  const protocolOptions = [
    { value: 'ALL', label: 'ALL' },
    { value: 'TCP', label: 'TCP' },
    { value: 'UDP', label: 'UDP' },
    { value: 'ICMP', label: 'ICMP' },
  ];

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [networkName, setNetworkName] = useState('');

  const [btnDimm, setBtnDimm] = useState(false);

  const [networkDataList, setNetworkDataList] = useState([]);
  const [networkList, setNetworkList] = useState([]);
  const [vmDataList, setVmDataList] = useState([]);
  const [isMembers, setIsMembers] = useState(true);
  const [isRules, setIsRules] = useState(true);
  const [isDupRules, setIsDupRules] = useState(true);
  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default'
  );

  useEffect(() => {
    const getCreateData = async () => {
      const listNetwork = await loadBalancerStore.fetchNetworkList(props);
      const listVm = await loadBalancerStore.fetchVmList(props);

      setNetworkDataList(listNetwork);
      setVmDataList(listVm.vms);
    };

    getCreateData();
  }, []);

  useEffect(() => {
    getNetworkFilterList(projectName);
  }, [networkDataList]);

  const getNetworkFilterList = projectName => {
    const networkList =
      networkDataList.filter(obj => obj.project === projectName) || [];
    setNetworkList(networkList);
  };

  const networkOptions = () => {
    const opt = networkList
      .filter(el => !el.external)
      .map(obj => ({
        label: t(obj.name),
        value: t(obj.id),
      }));
    return opt;
  };

  const vmOptions = () => {
    const opt = vmDataList
      .filter(el => el.networks.map(elN => elN.name).includes(networkName))
      .map(obj => ({
        label: t(obj.name),
        value: t(obj.id),
        disabled: obj.state === 'Running' ? false : true,
      }));
    return opt;
  };

  const isDuplicate = arr => {
    let cnt = 0;
    arr.some(function(x) {
      formRulesFields.some(function(y) {
        if (JSON.stringify(x) === JSON.stringify(y)) {
          cnt++;
        }
      });
    });
    return cnt !== arr.length;
  };

  const handleOk = () => {
    const onOk = props.onOk;
    const members = [...formMemberIpFields]
      .filter(el => el.memberIp)
      .map(obj => obj.memberIp);
    const rules = [...formRulesFields].filter(el => el.portRangeMax);

    setIsMembers(members.length > 0);
    if (isDuplicate(rules)) {
      setIsDupRules(false);
    } else {
      setIsDupRules(true);
      setIsRules(rules.length > 0);
    }

    form.current.validator(() => {
      if (
        members.length > 0 &&
        rules.length > 0 &&
        !isDuplicate(rules) &&
        isRules
      ) {
        const { data } = form.current.props;
        data.network = networkName;
        data.members = members;
        data.project = projectName;
        data.lb_rule = [
          ...rules.filter(el => delete el.validPort && delete el.isCustom),
        ];
        // console.log(data)
        onOk({ lb: data });
      }
    });
  };

  // Validation 시작 ==================================================
  const networkValidator = (rule, value, callback) => {
    if (value == t('RESOURCES_SELECT') || value == 'select') {
      return callback({ message: t('RESOURCES_SELECT_NETWORK_NAME_TIP') });
    }
    callback();
  };

  const closeModal = () => {
    setModalView(false);
  };

  const memberIpObj = {
    vmId: t('RESOURCES_SELECT'),
    memberIp: '',
    message: '',
  };
  const [formMemberIpFields, setFormMemberIpFields] = useState([memberIpObj]);
  //멤버 IP handler
  const handleMemberIp = {
    handleAddFields: () => {
      const values = [...formMemberIpFields, memberIpObj];
      setFormMemberIpFields(values);
    },

    handleRemoveFields: i => {
      const values = [...formMemberIpFields].filter((obj, idx) => idx !== i);
      setFormMemberIpFields(values);
      if (values.length < 1) {
        setIsMembers(false);
      }
    },

    handleSelectClick: (i, val) => {
      const values = [...formMemberIpFields];

      const opt = vmDataList
        .filter(el => el.id === val)
        .map(obj => {
          return obj.networks
            .filter(el => el.name === networkName)
            .map(network => ({
              value: network.ip,
            }));
        });

      if (
        !values.map(obj => obj.vmId).includes(val) ||
        values[i].vmId === val ||
        val === ''
      ) {
        values[i].message = '';
        values[i].vmId = val;
        values[i].memberIp = opt[0][0].value;
        setIsMembers(true);
      } else {
        values[i].message = t('RESOURCES_ALREADY_SELECTED_VM_NAME');
        setTimeout(() => {
          handleMemberIp.deleteMessage(i);
        }, 1000);
      }

      setFormMemberIpFields(values);
    },

    deleteMessage: i => {
      const values = [...formMemberIpFields];
      values[i].message = '';
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
  }; //end 멤버 IP

  const rulsObj = {
    ruleType: t('RESOURCES_SPECIFY_USER'),
    protocol: 'TCP',
    portRangeMin: '0',
    portRangeMax: '1',
    isCustom: true,
    validPort: { isValid: false, message: t('RESOURCES_PORT_RANGE_DESC') },
    message: '',
  };
  const [formRulesFields, setFormRulesFields] = useState([rulsObj]);
  //Rules handler
  const handleRules = {
    handleAddFields: () => {
      const values = [...formRulesFields, rulsObj];
      setFormRulesFields(values);
      if ([...formRulesFields].length < 1) {
        setIsRules(true);
      }
    },

    handleRemoveFields: i => {
      const values = [...formRulesFields].filter((obj, idx) => idx !== i);
      setFormRulesFields(values);
      if (values.length < 1) {
        setBtnDimm(false);
        setIsRules(false);
      }
    },

    handleInputChange: (i, field, e) => {
      const values = [...formRulesFields];
      const val = e.currentTarget.value;

      if (regexPort.test(val) || val < 1 || val > 65535) {
        values[i].validPort.isValid = true;
      } else {
        values[i].validPort.isValid = false;
      }
      values[i].portRangeMax = val;
      setIsRules(true);

      setFormRulesFields(values);
    },

    handleSelectClick: (i, field, val) => {
      let values = [...formRulesFields];

      if (field === 'protocol') {
        values[i].protocol = val;
      } else {
        if (
          !values.map(obj => obj.ruleType).includes(val) ||
          values[i].ruleType === val ||
          val === '' ||
          val === 'CUSTOM'
        ) {
          values[i].message = '';
          values[i].ruleType = val;
          values = setRuleTypeHandler(i, val, values);

          if (val === 'ALL') {
            values = values.filter((obj, idx) => idx === i);
            setBtnDimm(true);
          } else {
            setBtnDimm(false);
          }
        } else {
          values[i].message = t('RESOURCES_ALREADY_SELECTED_TYPE');
          setTimeout(() => {
            handleRules.deleteMessage(i);
          }, 1000);
        }
      }

      setFormRulesFields(values);
    },

    deleteMessage: i => {
      const values = [...formRulesFields];
      values[i].message = '';
      setFormRulesFields(values);
    },
  }; //end Rules

  //유형에 맞는 프로토콜, 포트범위 셋팅
  const setRuleTypeHandler = (i, val, values) => {
    values[i].isCustom = val === 'CUSTOM' ? true : false;
    if (val === 'ALL') {
      values[i].protocol = 'ALL';
    } else {
      values[i].protocol = ruleTypeOptions.filter(
        obj => obj.value === val
      )[0].protocol;
    }
    values[i].portRangeMax = ruleTypeOptions.filter(
      obj => obj.value === val
    )[0].port;
    values[i].validPort.isValid = false;
    setIsRules(true);

    return values;
  };
  //----------------end

  useEffect(() => {
    handleMemberIp.handleIpClear();
  }, [networkName]);

  useEffect(() => {
    if (!isDuplicate(formRulesFields)) {
      setIsDupRules(true);
    }
  }, [formRulesFields]);

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
          <Columns>
            <Column>
              <Form.Item
                label={t('RESOURCES_NAME')}
                rules={[
                  { required: true, message: t('NAME_EMPTY_DESC') },
                  {
                    pattern: PATTERN_USER_NAME,
                    message: t('RESOURCES_INVALID_NAME_DESC'),
                  },
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
                    onChange={e => {
                      setProjectName(e);
                      getNetworkFilterList(e);
                    }}
                  />
                </Form.Item>
              </Column>
            )}
          </Columns>

          <Form.Item
            label={t('RESOURCES_NETWORK_NAME')}
            rules={[{ required: true, validator: networkValidator }]}
          >
            <Select
              name="network"
              options={networkOptions()}
              onChange={e => setNetworkName(e)}
              defaultValue={t('RESOURCES_SELECT')}
            />
          </Form.Item>
          <div style={{ padding: 10 }} />

          {t('RESOURCES_MEMBER_IP')}
          <span className="form-item-required">*</span>
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
                      <th>
                        <strong>{t('RESOURCES_VM_NAME')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_VM_IP')}</strong>
                      </th>
                      <th>
                        <strong></strong>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formMemberIpFields.map((v, i) => (
                      <tr key={i}>
                        <td>
                          <Select
                            value={v.message ? v.message : v.vmId}
                            options={vmOptions()}
                            onChange={e =>
                              handleMemberIp.handleSelectClick(i, e)
                            }
                          />
                        </td>
                        <td>
                          <Input type="text" value={v.memberIp} disabled />
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
                <div
                  className={`form-item-error ${isMembers ? 'hide' : ''}`}
                  style={{ marginLeft: '10px' }}
                >
                  {t('RESOURCES_SELECT_VM_NAME_TIP')}
                </div>
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
          <div style={{ padding: 10 }} />

          {t('RESOURCES_POLICY')}
          <span className="form-item-required">*</span>
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
                      <th>
                        <strong>{t('RESOURCES_TYPE_YOO')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_PROTOCOL')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_PORT_RANGE')}</strong>
                      </th>
                      <th>
                        <strong></strong>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formRulesFields.map((v, i) => (
                      <tr key={i}>
                        <td>
                          <Select
                            value={v.message ? v.message : v.ruleType}
                            options={ruleTypeOptions}
                            onChange={e =>
                              handleRules.handleSelectClick(i, 'ruleType', e)
                            }
                          />
                        </td>
                        <td>
                          <Select
                            value={v.protocol}
                            options={protocolOptions}
                            onChange={e =>
                              handleRules.handleSelectClick(i, 'protocol', e)
                            }
                            disabled={!v.isCustom}
                          />
                        </td>
                        <td>
                          <Tooltip
                            content={
                              v.validPort?.isValid ? v.validPort.message : ''
                            }
                            placement="right"
                            always={v.validPort?.isValid}
                          >
                            <Input
                              type="text"
                              onChange={e =>
                                handleRules.handleInputChange(
                                  i,
                                  'portRangeMax',
                                  e
                                )
                              }
                              value={
                                v.protocol === 'ICMP' ? '' : v.portRangeMax
                              }
                              disabled={!v.isCustom || v.protocol === 'ICMP'}
                            />
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
                <div
                  className={`form-item-error ${isRules ? 'hide' : ''}`}
                  style={{ marginLeft: '10px' }}
                >
                  {t('RESOURCES_SELECT_POLICY_TIP')}
                </div>
                <div
                  className={`form-item-error ${isDupRules ? 'hide' : ''}`}
                  style={{ marginLeft: '10px' }}
                >
                  {t('RESOURCES_DUPLICATE_POLICY_TIP')}
                </div>
              </div>
              <div className="text-right">
                <Button
                  className={styles.add}
                  onClick={handleRules.handleAddFields}
                  disabled={btnDimm}
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
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RegistModal;
