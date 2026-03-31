import React, { useState, useEffect, useRef } from 'react';

import {
  Form,
  Input,
  Select,
  TextArea,
  Tooltip,
  Button,
} from '@kube-design/components';
import { Modal } from 'components/Base';
import LoadBalancerStore from 'stores/resources/loadbalancers';
import styles from './index.scss';

const regexPort = /[^0123456789]/;

const ModifyModal = props => {
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

  const loadBalancerStore = new LoadBalancerStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData] = useState({});

  const [vmDataList, setVmDataList] = useState([]);
  const [isMembers, setIsMembers] = useState(true);
  const [isRules, setIsRules] = useState(true);
  const [isDupRules, setIsDupRules] = useState(true);

  const [networkName, setNetworkName] = useState(
    props.store.detail?.lb?.network.name
  );
  const [networkList, setNetworkList] = useState([]);

  const rules = props.store.detail?.lb?.rules || [];
  const [rulesIds, setRulesIds] = useState([]);

  useEffect(() => {
    const getCreateData = async () => {
      const [listVm, listNetwork] = await Promise.all([
        loadBalancerStore.fetchVmList(props),
        loadBalancerStore.fetchNetworkList(props),
      ]);

      setNetworkList(
        listNetwork.filter(
          obj => obj.project === props.store.detail?.lb.project
        ) || []
      );
      setVmDataList(listVm.vms);
    };

    getCreateData();

    setRulesIds(rules.map(obj => obj.id));

    setFormRulesFields(
      rules.map(obj => ({
        ruleType: t('RESOURCES_SPECIFY_USER'),
        protocol: obj.protocol.toUpperCase(),
        port: `${obj.port || ''}`,
        targetPort: `${obj.targetPort || ''}`,
        isCustom: true,
        validPort: {
          isValid: false,
          message: t('RESOURCES_PORT_RANGE_DESC'),
        },
        validTargetPort: {
          isValid: false,
          message: t('RESOURCES_PORT_RANGE_DESC'),
        },
        message: '',
        originRuleId: obj.id,
      }))
    );
  }, []);

  const vmOpts = vmDataList
    .filter(el => el.project === props.namespace)
    .map(obj => ({
      label: t(obj.name),
      value: t(obj.name),
      disabled: obj.state !== 'Running',
    }));

  const networkOpts = networkList
    .filter(el => el.elb)
    .map(obj => ({
      label: t(obj.name),
      value: t(obj.name),
    }));

  const [formMemberIpFields, setFormMemberIpFields] = useState([]);

  useEffect(() => {
    const opt = props.store.detail?.lb.members.map(obj => ({
      vmId: vmDataList.filter(el =>
        el.networks.map(elN => elN.ip).includes(obj)
      )[0]?.name,
      memberIp: obj,
    }));
    setFormMemberIpFields(opt);
  }, [vmDataList]);

  const handleOk = () => {
    const onOk = props.onOk;
    const members = [...formMemberIpFields]
      .filter(el => el.memberIp)
      .map(obj => obj.memberIp);
    const filteredRules = [...formRulesFields].filter(
      el => el.port && el.targetPort
    );

    setIsMembers(members.length > 0);
    if (isDuplicate(filteredRules)) {
      setIsDupRules(false);
    } else {
      setIsDupRules(true);
      setIsRules(filteredRules.length > 0);
    }

    form.current.validator(() => {
      if (
        members.length > 0 &&
        filteredRules.length > 0 &&
        !isDuplicate(filteredRules) &&
        isRules
      ) {
        const { data } = form.current.props;
        const { name, lb } = props.store.detail;
        data.members = members;
        data.name = name;
        data.network = lb.network.name;
        data.project = props.namespace;
        data.description = data.description || '';
        data.lb_rule = [
          ...formRulesFields.map(
            ({
              validPort,
              validTargetPort,
              isCustom,
              message,
              ...rest
            }) => rest
          ),
        ];
        data.originRule = rulesIds;

        onOk({ lb: data, ...props });
      }
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

  const memberIpObj = {
    vmId: t('RESOURCES_SELECT'),
    memberIp: '',
    message: '',
  };

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

  const networkValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_NETWORK_NAME_TIP') });
    }
    callback();
  };

  const rulsObj = {
    ruleType: t('RESOURCES_SPECIFY_USER'),
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
  const [formRulesFields, setFormRulesFields] = useState([]);

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

  useEffect(() => {
    if (!isDuplicate(formRulesFields)) {
      setIsDupRules(true);
    }
  }, [formRulesFields]);

  const isDuplicate = arr => {
    const seen = new Set();
    return arr.some(x => {
      const key = `${x.protocol}:${x.port}:${x.targetPort}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
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
        <Form.Item label={t('RESOURCES_NAME')}>
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

        <Form.Item
          label={t('RESOURCES_NETWORK_NAME')}
          rules={[{ required: true, validator: networkValidator }]}
        >
          <Select
            name="network"
            options={networkOpts}
            onChange={e => setNetworkName(e)}
            defaultValue={props.store.detail?.lb.network.name}
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
                          disabled={!!v.originRuleId}
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
            defaultValue={props.store.detail.lb.description || ''}
            style={{ maxWidth: 'none' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModifyModal;
