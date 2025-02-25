import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Modal, TypeSelect, List, Panel } from 'components/Base';
import { PropertiesInput, NumberInput, ProjectSelect } from 'components/Inputs';
import {
  PATTERN_USER_NAME,
  PATTERN_IP,
  PATTERN_IP_MASK,
  PATTERN_SEGMENT_ID,
  PATTERN_MTU,
} from 'utils/constants';
import { Form, Input, Select, Button, Tooltip, TextArea } from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';
import {
  RadioButton,
  RadioGroup,
} from '@kube-design/components/lib/components/Radio';
import * as common from 'utils/resources';

import classnames from 'classnames';
import NetworkStore from 'stores/resources/networks';
import styles from './index.scss';

const RegistModal = props => {
  const form = useRef();
  const networkStore = new NetworkStore();
  const [formData, setFormData] = useState({});
  const [modelView, setModalView] = useState(true);
  const [external, setExternal] = useState(false);
  const [defaultRoute, setDefaultRoute] = useState(false);
  const [networkOffload, setNetworkOffload] = useState(false);
  const [networkOffloadConfigurable, setNetworkOffloadConfigurable] = useState(false);
  const [networkOffloadInfo, setNetworkOffloadInfo] = useState('');
  const [cidrReducer, setCidrReducer] = useReducer(
    cidrReducer => !cidrReducer,
    false
  );
  const [externalBool, setExternalBool] = useState(false);
  const [externalInfo, setExternalInfo] = useState(t('RESOURCES_EXTERNAL_NETWORK_TIP'));

  const [regStep, setRegStep] = useState(1);
  const [submitButtonFlag, setSubmitButtonFlag] = useState(false);
  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default'
  );

  const [isTenantNetwork, setIsTenantNetwork] = useState(true);
  const [networkTypeOptions, setNetworkTypeOptions] = useState([]);

  const externalOptions = [
    { label: t('RESOURCES_NOT_USE'), value: false },
    { label: t('RESOURCES_USE'), value: true },
  ];
  const defaultRouteOptions = [
    { label: t('RESOURCES_NOT_USE'), value: false },
    { label: t('RESOURCES_USE'), value: true },
  ];
  const networkOffloadOptions = [
    { label: t('RESOURCES_NOT_USE'), value: false },
    { label: t('RESOURCES_USE'), value: true },
  ];

  const [physnetOptions, setPhysnetOptions] = useState([]);
  const [physnet, setPhysnet] = useState(undefined);

  useEffect(() => {
    const getPhysnetsData = async () => {
      const listPhysnet = await networkStore.fetchPhysnets(props);
      const opt = listPhysnet.physnets.map(physnet => {
        return {
          label: t(physnet),
          value: t(physnet),
        };
      });
      setPhysnetOptions(opt);
    };
    getPhysnetsData();

    const getNodeData = async () => {
      const listNode = await networkStore.fetchNodes(props);
      let sttSupported = true;
      let tunnelSupported = true;
      for (const node of listNode.nodes) {
        if (node?.info?.kernelVersion) {
          const kernelVersionMajor = parseInt(node.info.kernelVersion.split('.')[0]);
          const kernelVersionMinor = parseInt(node.info.kernelVersion.split('.')[1]);
          if (kernelVersionMajor > 5 || (kernelVersionMajor == 5 && kernelVersionMinor >= 14)) {
            // Disable STT if kernel version is 5.14 or higher
            sttSupported = false;
            break;
          }
        } else {
          // Disable STT if kernel version is unknown
          sttSupported = false;
          break;
        }
      }

      for (const node of listNode.nodes) {
        if (node?.node_role == 'master' && !node?.data_ip) {
          tunnelSupported = false;
          break;
        }
      }

      let networkTypeOptions = [];
      if (!props.namespace) {
        networkTypeOptions = networkTypeOptions.concat([
          { label: 'FLAT', value: 'FLAT' },
          { label: 'VLAN', value: 'VLAN' },
        ]);
      }
      if (tunnelSupported) {
        networkTypeOptions = networkTypeOptions.concat([
          { label: 'VXLAN', value: 'VXLAN' },
          { label: 'GENEVE', value: 'GENEVE' },
          { label: 'GRE', value: 'GRE' },
        ]);
        if (sttSupported) {
          networkTypeOptions.push({ label: 'STT', value: 'STT' });
        }
      }
      setNetworkTypeOptions(networkTypeOptions);
    }
    getNodeData();

  }, []);

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      const error = document.querySelectorAll('.form-item-error');
      for (const i of error) {
        if (!i.classList.contains('hide')) {
          return;
        }
      }

      const dns = [];
      data.dns?.map(el => {
        if (el != '') {
          dns.push(el);
        }
      });
      const host_routes = [];
      listHostRoute?.map(el => {
        if (data.Destination?.[el] && data.Nexthop?.[el]) {
          host_routes.push({
            destination: data.Destination[el],
            nexthop: data.Nexthop[el],
          });
        }
      });

      data.ip_pool = {
        start: data.ip_pool_start,
        end: data.ip_pool_end,
      };
      data.dns = dns;
      data.host_routes = host_routes;
      data.networktype_app = false;
      data.project = projectName;

      onOk({ network: data });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

  const nextHostRoute = useRef(1);
  const [listHostRoute, setListHostRoute] = useState([1]);

  const handleHostRoute = {
    addColumn: () => {
      nextHostRoute.current += 1;
      setListHostRoute(listHostRoute => [
        ...listHostRoute,
        nextHostRoute.current,
      ]);
    },
    delColumn: id => {
      setListHostRoute(listHostRoute.filter(el => el !== id));
    },
  };
  useEffect(() => {
    if (listHostRoute.length == 0) {
      const a = document.getElementById('hostRoute');
      a.classList.add('hide');
    }
  }, [listHostRoute]);

  const isValidIpAddress = ip => {
    return PATTERN_IP.test(ip);
  };
  const fnCheckCidrClass = num => {
    if (parseInt(num) > 30) {
      return false;
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

  const onChangeCidr = e => {
    const { data } = form.current.props;
    if (
      e.split('/').length != 2 ||
      !isValidIpAddress(e.split('/')[0]) ||
      !fnCheckCidrClass(e.split('/')[1])
    ) {
      data.ip_pool_start = '';
      data.ip_pool_end = '';
      data.gateway_ip = '';

      const a = document.getElementById('ip_pool_start');
      const b = document.getElementById('ip_pool_end');
      const c = document.getElementById('gateway_ip');
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.remove('hide');
        a.parentElement.parentElement.classList.add('error-item');
        b.nextElementSibling.classList.remove('hide');
        b.parentElement.parentElement.classList.add('error-item');
        c.nextElementSibling.classList.remove('hide');
        c.parentElement.parentElement.classList.add('error-item');
      }

      setCidrReducer();
    } else {
      const cidrData = common.fnCalculateCidr(e, true);
      data.ip_pool_start = cidrData.startIp;
      data.ip_pool_end = cidrData.endIp;
      data.gateway_ip = cidrData.gatewayIp;

      const a = document.getElementById('ip_pool_start');
      const b = document.getElementById('ip_pool_end');
      const c = document.getElementById('gateway_ip');
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.add('hide');
        a.parentElement.parentElement.classList.remove('error-item');
        b.nextElementSibling.classList.add('hide');
        b.parentElement.parentElement.classList.remove('error-item');
        c.nextElementSibling.classList.add('hide');
        c.parentElement.parentElement.classList.remove('error-item');
      }

      setCidrReducer();
    }
  };

  const checkNetworkAddress = (value) => {
    const cidrData = common.fnCalculateCidr(value);
    const checkNetwork = cidrData.networkAddress == value.split('/')[0] ? true : false;
    return checkNetwork;
  }

  const cidrValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_CIDR_EMPTY_DESC') });
    }
    if (
      value.split('/').length != 2 ||
      !isValidIpAddress(value.split('/')[0]) ||
      !fnCheckCidrClass(value.split('/')[1]) ||
      !checkNetworkAddress(value)
    ) {
      return callback({ message: t('RESOURCES_CIDR_VALID') });
    }

    callback();
  };

  const handleExternal = value => {
    setExternal(value);
  };

  const handleNetworkType = e => {
    const { data } = form.current.props;
    if (
      e == 'FLAT'
      // || e == 'VLAN'
    ) {
      data.segment_id = ' ';
      data.physnet_name = '';
      /*
      const a = document.getElementById('segment_id')
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.add('hide')
        a.parentElement.parentElement.classList.remove('error-item')
      }
      
      */
      setExternalBool(true);
      setExternalInfo('');
      setIsTenantNetwork(false);
      setPhysnet('');
    } else {
      data.segment_id = '';
      data.physnet_name = ' ';
      /* const a = document.getElementById('segment_id')
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.remove('hide')
        a.parentElement.parentElement.classList.add('error-item')
      } */

      document.getElementById('radio.0').click();
      setExternalBool(false);
      setExternalInfo(t('RESOURCES_EXTERNAL_NETWORK_TIP'));
      setIsTenantNetwork(true);
      refreshNetworkOffloadTooltip('tunnel');
    }
    document.getElementById('radio_offload_off').click();
  };

  // Reload network offload nodes when physnet changes
  useEffect(() => {
    if (physnet == undefined) {
      // Default network type is VXLAN and physnet is undefined at the beginning
      refreshNetworkOffloadTooltip('tunnel');
    } else if (typeof physnet == 'string' && physnet.trim() != '') {
      refreshNetworkOffloadTooltip(physnet);
    } else {
      // physnet becomes '' after switching the network type
      setNetworkOffloadInfo(t('RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'));
      disableNetworkOffloadTooltip();
    }
  }, [physnet]);

  const disableNetworkOffloadTooltip = () => {
    document.getElementById('radio_offload_off').click();
    setNetworkOffloadConfigurable(false);
  };

  const refreshNetworkOffloadTooltip = async (resourceName) => {
    const vfResourcePrefix = 'openshift.io/';
    const fullResourceName = vfResourcePrefix + resourceName;
    const resp = await networkStore.fetchNodes({...props});

    let nodeResource = {};
    for (const node of resp.nodes) {
      if ('name' in node && 'resource' in node && node.resource && fullResourceName in node.resource) {
        nodeResource[node.name] = node.resource[fullResourceName];
      }
    }

    let nodeStatus = '';
    let totalAvailable = 0;
    for (const [key, val] of Object.entries(nodeResource)) {
      nodeStatus += `${key}(${val.available}/${val.allocatable}), `;
      totalAvailable += val.available;
    }
    nodeStatus = nodeStatus.slice(0, -2);

    if (Object.keys(nodeResource).length == 0) {
      disableNetworkOffloadTooltip();
      setNetworkOffloadInfo(`${resourceName}: ${t('RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION')}`);
    } else if (totalAvailable == 0) {
      disableNetworkOffloadTooltip();
      setNetworkOffloadInfo(`${resourceName}: ${t('RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION')} ${nodeStatus}`);
    } else {
      setNetworkOffloadConfigurable(true);
      setNetworkOffloadInfo(`[${resourceName}] ${nodeStatus}`);
    }

    return resp;
  };

  const stepMoveCheck = step => {
    const { data } = form.current.props;
    if (step == 1) {
      if (
        data.name == undefined ||
        data.name == '' ||
        (!externalBool &&
          (data.segment_id == undefined || data.segment_id == '')) ||
        (data.type !== 'FLAT' && !PATTERN_SEGMENT_ID.test(data.segment_id)) ||
        !PATTERN_MTU.test(data.mtu) ||
        data.cidr == undefined ||
        data.cidr == '' ||
        data.ip_pool_start == undefined ||
        data.ip_pool_start == '' ||
        data.ip_pool_end == undefined ||
        data.ip_pool_end == '' ||
        data.gateway_ip == undefined ||
        data.gateway_ip == '' ||
        !checkNetworkAddress(data.cidr)
      ) {
        handleOk();
      } else {
        setRegStep(2);
      }
    }
  };

  const fnGetModalFooter = () => {
    let elements = '';
    elements = (
      <>
        {regStep == 1 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(1);
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep == 2 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(1);
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              onClick={() => {
                handleOk();
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
              loading={props.store.isSubmitting}
              disabled={props.store.isSubmitting}
            >
              {t('RESOURCES_CREATE')}
            </Button>
          </>
        )}
      </>
    );
    return elements;
  };

  const onChangeDestination = (e, idx) => {
    const a = document.getElementById('hostRoute');
    const nexthop = document.getElementById(`Nexthop.${idx}`).value;

    if (e.length > 0 || nexthop.length > 0) {
      if (
        e.split('/').length != 2 ||
        !isValidIpAddress(e.split('/')[0]) ||
        !fnCheckCidrClass(e.split('/')[1]) ||
        !PATTERN_IP.test(nexthop)
      ) {
        a.classList.remove('hide');
      } else {
        a.classList.add('hide');
      }
    } else {
      a.classList.add('hide');
    }
  };
  const onChangeNexthop = (e, idx) => {
    const a = document.getElementById('hostRoute');
    const destination = document.getElementById(`Destination.${idx}`).value;

    if (e.length > 0 || destination.length > 0) {
      if (
        destination.split('/').length != 2 ||
        !isValidIpAddress(destination.split('/')[0]) ||
        !fnCheckCidrClass(destination.split('/')[1]) ||
        !PATTERN_IP.test(e)
      ) {
        a.classList.remove('hide');
      } else {
        a.classList.add('hide');
      }
    } else {
      a.classList.add('hide');
    }
  };

  const segmentIdValidator = (rule, value, callback) => {
    const { data } = form.current.props;

    if (data.type !== 'FLAT') {
      if (!value) {
        return callback({
          message: t('RESOURCES_SEGMENT_ID_EMPTY_DESC'),
        });
      }

      if (!PATTERN_SEGMENT_ID.test(value)) {
        return callback({
          message: t('RESOURCES_SEGMENT_ID_VALID'),
        });
      }
      // callback();
    }
    callback();
  };

  return (
    <>
      <Modal
        icon="pen"
        width={800}
        title={props.title}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form}>
          {/* Header */}
          <div className={styles.tab_process}>
            {/* styles.view_screen  : 이전 링크 관련 class */}
            <div
              className={classnames(
                styles.process_item,
                `${regStep == 1 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep == 1
                    ? styles.current
                    : regStep > 1
                      ? styles.done
                      : styles.todo
                    }`}
                ></div>
              </div>
              <span className={styles.basic}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_DEFAULT_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep == 1
                    ? t('RESOURCES_CURRENT')
                    : regStep > 1
                      ? t('RESOURCES_COMPLETED_SETTINGS')
                      : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
            <div
              className={classnames(
                styles.process_item,
                `${regStep == 2 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep == 2 ? styles.current : styles.todo}`}
                ></div>
              </div>
              <span className={styles.check}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_DETAIL_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep == 2
                    ? t('RESOURCES_CURRENT')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.pop_overflow_y}>
            <div className={styles.cont_boxwrap}>
              {/* 기본설정 설정 시작========================================== */}
              <div className={`${regStep == 1 ? '' : 'hide'}`}>
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
                          {
                            required: true,
                            message: t('PROJECT_NOT_SELECT_DESC'),
                          },
                        ]}
                      >
                        <ProjectSelect
                          name="namespace"
                          defaultValue={projectName}
                          cluster={props.cluster}
                          onChange={e => setProjectName(e)}
                        />
                      </Form.Item>
                    </Column>
                  )}
                </Columns>

                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('RESOURCES_NETWORK_TYPE')}
                        rules={[
                          {
                            required: true,
                            message: t('RESOURCES_SELECT_NETWORK_TIP'),
                          },
                        ]}
                      >
                        <Select
                          name="type"
                          defaultValue="FLAT"
                          options={networkTypeOptions}
                          onChange={e => handleNetworkType(e)}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Columns>
                        {isTenantNetwork && (
                          <Column>
                            <Form.Item
                              label={t('RESOURCES_SEGMENT_ID')}
                              rules={[
                                {
                                  required: true,
                                  validator: segmentIdValidator,
                                },
                              ]}
                            >
                              <NumberInput
                                name="segment_id"
                                disabled={externalBool}
                                style={{ maxWidth: 'none' }}
                              />
                            </Form.Item>
                          </Column>
                        )}
                        {!isTenantNetwork && (
                          <Column>
                            <Form.Item
                              label={t('RESOURCES_PHYSNET')}
                              rules={[
                                {
                                  required: true,
                                },
                              ]}
                            >
                              <Select
                                name="physnet_name"
                                options={physnetOptions}
                                disabled={!externalBool}
                                onChange={e => {
                                  setPhysnet(e);
                                }}
                              />
                            </Form.Item>
                          </Column>
                        )}
                      </Columns>
                    </Column>
                  </Columns>
                </Form.Item>

                <Form.Item label={t('RESOURCES_SUBNET')}>
                  <Form.Group>
                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_SUBNET_EXTERNAL')}
                            rules={[{ required: true }]}
                          >
                            <RadioGroup
                              name="external"
                              wrapClassName="radio"
                              defaultValue={external}
                              onChange={value => handleExternal(value)}
                            >
                              {externalOptions.map((option, idx) =>
                                !props.namespace ? (
                                  <Tooltip content={externalInfo} placement="right">
                                    <RadioButton
                                      id={`radio.${idx}`}
                                      key={option.value}
                                      value={option.value}
                                      disabled={!!(!externalBool && idx == 1)}
                                    >
                                      {option.label}
                                    </RadioButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip content={t('RESOURCES_TENANT_NOT_ALLOWED')} placement="right">
                                    <RadioButton
                                      id={`radio.${idx}`}
                                      key={option.value}
                                      value={option.value}
                                      disabled={idx == 1}
                                    >
                                      {option.label}
                                    </RadioButton>
                                  </Tooltip>
                                )
                              )}
                            </RadioGroup>
                          </Form.Item>
                        </Column>
                        <Column>
                          <Columns>
                            <Column>
                              <Form.Item
                                label={t('RESOURCES_CIDR')}
                                rules={[
                                  {
                                    required: true,
                                    validator: cidrValidator,
                                  },
                                ]}
                              >
                                <Input
                                  name="cidr"
                                  style={{ maxWidth: 'none' }}
                                  onChange={e => onChangeCidr(e)}
                                />
                              </Form.Item>
                            </Column>
                            <Column>
                              <Form.Item
                                label={t('RESOURCES_MTU')}
                                rules={[
                                  {
                                    required: true,
                                    message: t('RESOURCES_MTU_EMPTY_DESC'),
                                  },
                                  {
                                    pattern: PATTERN_MTU,
                                    message: t('RESOURCES_MTU_VALID'),
                                  },
                                ]}
                              >
                                <NumberInput
                                  name="mtu"
                                  defaultValue={1500}
                                  // min={1}
                                  // max={1600}
                                  style={{ maxWidth: 'none' }}
                                />
                              </Form.Item>
                            </Column>
                          </Columns>
                        </Column>
                      </Columns>
                    </Form.Item>

                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_DEFAULT_ROUTE')}
                            rules={[{ required: true }]}
                          >
                            <RadioGroup
                              name="default_route"
                              wrapClassName="radio"
                              defaultValue={defaultRoute}
                              onChange={value => setDefaultRoute(value)}
                            >
                              {defaultRouteOptions.map(option => (
                                <RadioButton
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </RadioButton>
                              ))}
                            </RadioGroup>
                          </Form.Item>
                        </Column>
                        <Column>
                          <Columns>
                            <Column>
                              <Form.Item
                                label={t('RESOURCES_IP_POOL_INFORMATION')}
                                rules={[
                                  {
                                    required: true,
                                    message: t('RESOURCES_IP_POOL_EMPTY_DESC'),
                                  },
                                  {
                                    pattern: PATTERN_IP,
                                    message: t('RESOURCES_IP_POOL_VALID'),
                                  },
                                ]}
                              >
                                <Input name="ip_pool_start" />
                              </Form.Item>
                            </Column>
                            <Column>
                              <Form.Item
                                rules={[
                                  {
                                    required: true,
                                    message: t('RESOURCES_IP_POOL_EMPTY_DESC'),
                                  },
                                  {
                                    pattern: PATTERN_IP,
                                    message: t('RESOURCES_IP_POOL_VALID'),
                                  },
                                ]}
                              >
                                <Input
                                  name="ip_pool_end"
                                  style={{ marginTop: '24px' }}
                                />
                              </Form.Item>
                            </Column>
                          </Columns>
                        </Column>
                      </Columns>
                    </Form.Item>

                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_NETWORK_OFFLOAD')}
                            rules={[{ required: true }]}
                          >
                            <RadioGroup
                              name="offload"
                              wrapClassName="radio"
                              defaultValue={networkOffload}
                              onChange={value => setNetworkOffload(value)}
                            >
                              {networkOffloadOptions.map(option =>
                                option.value ? (
                                  <Tooltip content={networkOffloadInfo} placement="right">
                                    <RadioButton
                                      id="radio_offload_on"
                                      key={option.value}
                                      value={option.value}
                                      disabled={!networkOffloadConfigurable}
                                    >
                                      {option.label}
                                    </RadioButton>
                                  </Tooltip>
                                ) : (
                                  <RadioButton
                                    id="radio_offload_off"
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </RadioButton>
                                )
                              )}
                            </RadioGroup>
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_GATEWAY_IP')}
                            rules={[
                              {
                                required: true,
                                message: t('RESOURCES_GATEWAY_IP_EMPTY_DESC'),
                              },
                              {
                                pattern: PATTERN_IP,
                                message: t('RESOURCES_GATEWAY_IP_POOL_VALID'),
                              },
                            ]}
                          >
                            <Input name="gateway_ip" />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Item>
                  </Form.Group>
                </Form.Item>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_DESCRIPTION')}
                      desc={t('DESCRIPTION_DESC')}
                    >
                      <TextArea
                        style={{ maxWidth: 'none' }}
                        name="description"
                        maxLength={256}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
              </div>
              {/* 기본설정 설정 끝========================================== */}

              {/* 세부 설정 시작========================================== */}
              <div className={`${regStep == 2 ? '' : 'hide'}`}>
                <Form.Item label={t('RESOURCES_DNS')}>
                  <Form.Group>
                    <Columns>
                      <Column>
                        <Form.Item
                          label={t('RESOURCES_DNS_PRIMARY')}
                          rules={[
                            {
                              pattern: PATTERN_IP,
                              message: t('RESOURCES_DNS_VALID'),
                            },
                          ]}
                        >
                          <Input name="dns.1" />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item
                          label={t('RESOURCES_DNS_SECONDARY')}
                          rules={[
                            {
                              pattern: PATTERN_IP,
                              message: t('RESOURCES_DNS_VALID'),
                            },
                          ]}
                        >
                          <Input name="dns.2" />
                        </Form.Item>
                        <div className="form-item-error hide">
                          {t('RESOURCES_DNS_VALID')}
                        </div>
                      </Column>
                    </Columns>
                  </Form.Group>
                </Form.Item>

                <Form.Item label={t('RESOURCES_HOST_ROUTE')}>
                  <Form.Group>
                    {listHostRoute.map((obj, idx) => (
                      <div className={styles.item} key={obj}>
                        <Columns>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`Destination.${obj}`}
                                placeholder={t('Destination')}
                                onChange={e => onChangeDestination(e, obj)}
                              />
                            </Form.Item>
                          </Column>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`Nexthop.${obj}`}
                                placeholder={t('Nexthop')}
                                onChange={e => onChangeNexthop(e, obj)}
                              />
                            </Form.Item>
                          </Column>
                        </Columns>
                        <Button
                          type="flat"
                          icon="trash"
                          className={styles.delete}
                          onClick={() => handleHostRoute.delColumn(obj)}
                        />
                      </div>
                    ))}
                    <div className="text-right">
                      <Button
                        className={styles.add}
                        onClick={handleHostRoute.addColumn}
                      >
                        {t('RESOURCES_ADD')}
                      </Button>
                    </div>
                  </Form.Group>
                </Form.Item>
                <div className="form-item-error hide" id="hostRoute">
                  {t.html('RESOURCES_HOSTROUTE_VALID', {})}
                </div>
              </div>
              {/* 세부 설정 끝========================================== */}
            </div>
          </div>

          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  );
};

export default RegistModal;
