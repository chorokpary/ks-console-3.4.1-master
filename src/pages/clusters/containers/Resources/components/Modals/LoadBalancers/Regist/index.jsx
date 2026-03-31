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
import { ProjectSelect } from 'components/Inputs';

import { PATTERN_USER_NAME } from 'utils/constants';
import LoadBalancerStore from 'stores/resources/loadbalancers';
import styles from './index.scss';

const regexPort = /[^0123456789]/;

const RegistModal = props => {
  const loadBalancerStore = new LoadBalancerStore();

  const ruleTypeOptions = [
    {
      value: 'CUSTOM',
      label: t('RESOURCES_SPECIFY_USER'),
      protocol: 'TCP',
      port: '',
      targetPort: '',
    },
    {
      value: 'HTTP',
      label: 'HTTP',
      protocol: 'TCP',
      port: '80',
      targetPort: '80',
    },
    {
      value: 'HTTPS',
      label: 'HTTPS',
      protocol: 'TCP',
      port: '443',
      targetPort: '443',
    },
    {
      value: 'DNS',
      label: 'DNS',
      protocol: 'UDP',
      port: '53',
      targetPort: '53',
    },
    {
      value: 'SSH',
      label: 'SSH',
      protocol: 'TCP',
      port: '22',
      targetPort: '22',
    },
  ];

  const protocolOptions = [
    { value: 'TCP', label: 'TCP' },
    { value: 'UDP', label: 'UDP' },
  ];

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData] = useState({});

  const [networkName, setNetworkName] = useState();

  const [networkDataList, setNetworkDataList] = useState([]);
  const [networkList, setNetworkList] = useState([]);
  const [vmDataList, setVmDataList] = useState([]);
  const [isMembers, setIsMembers] = useState(true);
  const [isRules, setIsRules] = useState(true);
  const [isDupRules, setIsDupRules] = useState(true);
  const [projectName, setProjectName] = useState(
    props.namespace || 'default'
  );
  const [isNetworkSelect, setIsNetworkSelect] = useState(true);

  useEffect(() => {
    const getCreateData = async () => {
      const [listNetwork, listVm] = await Promise.all([
        loadBalancerStore.fetchNetworkList(props),
        loadBalancerStore.fetchVmList(props),
      ]);

      setNetworkDataList(listNetwork);
      setVmDataList(listVm.vms);
    };

    getCreateData();
  }, []);

  useEffect(() => {
    if (!isDuplicate(formRulesFields)) {
      setIsDupRules(true);
    }
  }, [formRulesFields]);

  useEffect(() => {
    initNetworkList();
  }, [networkDataList]);

  useEffect(() => {
    setNetworkName(t('RESOURCES_SELECT'));
    initNetworkList();
  }, [projectName]);

  const initNetworkList = () => {
    setNetworkList(
      networkDataList
        .filter(network => network.project === projectName && network.elb)
        .map(obj => ({
          label: t(obj.name),
          value: t(obj.name),
        }))
    );
  };

  const vmOpts = vmDataList
    .filter(el => el.project === projectName)
    .map(obj => ({
      label: t(obj.name),
      value: t(obj.name),
      disabled: obj.state !== 'Running',
    }));

  const isDuplicate = arr => {
    const seen = new Set();
    return arr.some(x => {
      const key = `${x.protocol}:${x.port}:${x.targetPort}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
  };

  const handleOk = () => {
    const onOk = props.onOk;
    const members = [...formMemberIpFields]
      .filter(el => el.vmId && el.vmId !== t('RESOURCES_SELECT'))
      .map(obj => obj.vmId);
    const rules = [...formRulesFields].filter(el => el.port && el.targetPort);

    setIsMembers(members.length > 0);
    setIsNetworkSelect(
      networkName !== t('RESOURCES_SELECT') && networkName !== 'select'
    );

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
        data.lb_rule = rules.map(
          ({ validPort, validTargetPort, isCustom, message, targetPort, ...rest }) => ({
            ...rest,
            target_port: targetPort,
          })
        );
        onOk({ lb: data });
      }
    });
  };

  const networkValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
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

  const handleMemberIp = {
    handleAddFields: () => {
      setFormMemberIpFields([...formMemberIpFields, memberIpObj]);
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
      const vm = vmDataList.find(el => el.name === val);
      const firstIp = vm?.networks?.[0]?.ip || '';
      if (
        !values.map(obj => obj.vmId).includes(val) ||
        values[i].vmId === val ||
        val === ''
      ) {
        values[i].message = '';
        values[i].vmId = val;
        values[i].memberIp = firstIp;
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

    handleIpClear: () => {
      setFormMemberIpFields([memberIpObj]);
    },
  };

  const rulsObj = {
    ruleType: 'CUSTOM',
    protocol: 'TCP',
    port: '',
    targetPort: '',
    isCustom: true,
    validPort: { isValid: false, message: t('RESOURCES_PORT_RANGE_DESC') },
    validTargetPort: {
      isValid: false,
      message: t('RESOURCES_PORT_RANGE_DESC'),
    },
    message: '',
  };
  const [formRulesFields, setFormRulesFields] = useState([rulsObj]);

  const handleRules = {
    handleAddFields: () => {
      setFormRulesFields([...formRulesFields, rulsObj]);
    },

    handleRemoveFields: i => {
      const values = [...formRulesFields].filter((obj, idx) => idx !== i);
      setFormRulesFields(values);
      if (values.length < 1) {
        setIsRules(false);
      }
    },

    handleInputChange: (i, field, e) => {
      const values = [...formRulesFields];
      const val = e.currentTarget.value;
      const validKey = field === 'port' ? 'validPort' : 'validTargetPort';

      if (regexPort.test(val) || val < 1 || val > 65535) {
        values[i][validKey].isValid = true;
      } else {
        values[i][validKey].isValid = false;
      }
      values[i][field] = val;
      setIsRules(true);

      setFormRulesFields(values);
    },

    handleSelectClick: (i, field, val) => {
      let values = [...formRulesFields];

      if (field === 'protocol') {
        values[i].protocol = val;
      } else if (
        !values.map(obj => obj.ruleType).includes(val) ||
        values[i].ruleType === val ||
        val === '' ||
        val === 'CUSTOM'
      ) {
        values[i].message = '';
        values[i].ruleType = val;
        values = setRuleTypeHandler(i, val, values);
      } else {
        values[i].message = t('RESOURCES_ALREADY_SELECTED_TYPE');
        setTimeout(() => {
          handleRules.deleteMessage(i);
        }, 1000);
      }

      setFormRulesFields(values);
    },

    deleteMessage: i => {
      const values = [...formRulesFields];
      values[i].message = '';
      setFormRulesFields(values);
    },
  };

  const setRuleTypeHandler = (i, val, values) => {
    const preset = ruleTypeOptions.find(obj => obj.value === val);
    values[i].isCustom = val === 'CUSTOM';
    values[i].protocol = preset.protocol;
    values[i].port = preset.port;
    values[i].targetPort = preset.targetPort;
    values[i].validPort.isValid = false;
    values[i].validTargetPort.isValid = false;
    setIsRules(true);

    return values;
  };

  return (
    <Modal
      icon="pen"
      width={800}
      title={props.title}
      onOk={handleOk}
      onCancel={closeModal}
      cancelText={t('RESOURCES_CANCEL')}
      visible={modelView}
      isSubmitting={props.store.isSubmitting}
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
          <>
            <Select
              name="network"
              options={networkList}
              onChange={e => {
                setNetworkName(e);
                setIsNetworkSelect(true);
              }}
              value={networkName}
              placeholder={t('RESOURCES_SELECT')}
            />
            <div
              className={`form-item-error ${isNetworkSelect ? 'hide' : ''}`}
            >
              {t('RESOURCES_SELECT_NETWORK_NAME_TIP')}
            </div>
          </>
        </Form.Item>
        <div style={{ padding: 10 }} />

        {t('RESOURCES_LB_TARGETS')}
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
                          options={vmOpts}
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
                          onClick={() =>
                            handleMemberIp.handleRemoveFields(i)
                          }
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
                  <col width="12%" />
                  <col width="15%" />
                  <col width="15%" />
                  <col width="8%" />
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
                      <strong>ExternalPort</strong>
                    </th>
                    <th>
                      <strong>TargetPort</strong>
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
                              handleRules.handleInputChange(i, 'port', e)
                            }
                            value={v.port}
                            disabled={!v.isCustom}
                          />
                        </Tooltip>
                      </td>
                      <td>
                        <Tooltip
                          content={
                            v.validTargetPort?.isValid
                              ? v.validTargetPort.message
                              : ''
                          }
                          placement="right"
                          always={v.validTargetPort?.isValid}
                        >
                          <Input
                            type="text"
                            onChange={e =>
                              handleRules.handleInputChange(
                                i,
                                'targetPort',
                                e
                              )
                            }
                            value={v.targetPort}
                            disabled={!v.isCustom}
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
            style={{ maxWidth: 'none' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RegistModal;
