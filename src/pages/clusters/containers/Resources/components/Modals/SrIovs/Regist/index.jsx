/* eslint-disable no-extra-boolean-cast */
import { get } from 'lodash';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Toggle,
} from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';
import classnames from 'classnames';
import { Modal, TypeSelect } from 'components/Base';
import { PropertiesInput, NumberInput, ProjectSelect } from 'components/Inputs';
import { PATTERN_NAME, PATTERN_USER_NAME, PATTERN_MTU, PATTERN_IP, PATTERN_IP_MASK } from 'utils/constants';
import * as common from 'utils/resources';
import SriovStore from 'stores/resources/sriovs';
import styles from './index.scss';

// ===== CONSTANTS =====
const DEFAULT_MTU = 9000

const RegistModal = props => {
  const form = useRef();
  const [formData, setFormData] = useState({});

  const sriovStore = new SriovStore();

  const [modelView, setModalView] = useState(true);
  const [regStep, setRegStep] = useState(1);
  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default'
  );

  const [sriovResourceDataList, setSriovResourceDataList] = useState([]);

  const [cidrReducer, setCidrReducer] = useReducer(
    cidrReducer => !cidrReducer,
    false
  );
  const [externalBool, setExternalBool] = useState(false);
  const [dhcpEnabled, setDhcpEnabled] = useState(false);
  const [availableRange, setAvailableRange] = useState(0);

  const resourceNameOptions = sriovResourceDataList.map(name => {
    return {
      label: name,
      value: name,
    };
  });

  const networkTypeOptions = [
    { label: 'VLAN', value: 'vlan' },
    { label: 'FLAT', value: 'flat' },
  ];

  useEffect(() => {
    const getSriovCreateData = async () => {
      const listSriovResource = await sriovStore.fetchSriovResourceList();
      setSriovResourceDataList(listSriovResource.resources);
      // setSriovResourceDataList(['fastnet']);
    };

    getSriovCreateData();
  }, []);

  const handleOk = () => {
    const onOk = props.onOk;
    form.current.validator(() => {
      const error = document.querySelectorAll('.form-item-error');
      for (const i of error) {
        if (!i.classList.contains('hide')) {
          return;
        }
      }

      const { data } = form.current.props;
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
      data.project = projectName;
      data.dhcp_enabled = dhcpEnabled;
      onOk({ ...data });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

  const stepMoveCheck = step => {
    const { data } = form.current.props;

    if (step == 1) {
      if (
        data.name == undefined ||
        data.name == '' ||
        data.resource_name == undefined ||
        data.resource_name == '' ||
        data.cidr == undefined ||
        data.cidr == '' ||
        data.ip_pool_start == undefined ||
        !isValidIpAddress(data.ip_pool_start) ||
        data.ip_pool_start == '' ||
        data.ip_pool_end == undefined ||
        !isValidIpAddress(data.ip_pool_end) ||
        data.ip_pool_end == '' ||
        !checkNetworkAddress(data.cidr)
      ) {
        handleOk();
      } else {
        setRegStep(2);
      }
    }
  };

  const calculateRange = () => {
    const { data } = form.current.props;
    const startIPArray = data.ip_pool_start?.split('.').map(Number);
    const endIPArray = data.ip_pool_end?.split('.').map(Number);

    const startIPNum =
      (startIPArray[0] << 24) +
      (startIPArray[1] << 16) +
      (startIPArray[2] << 8) +
      startIPArray[3];

    const endIPNum =
      (endIPArray[0] << 24) +
      (endIPArray[1] << 16) +
      (endIPArray[2] << 8) +
      endIPArray[3];

    // 가용 범위 계산
    const available = endIPNum - startIPNum + 1;
    setAvailableRange(available);
    return available;
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

  const ipValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_IP_POOL_EMPTY_DESC') });
    }
    if (!isValidIpAddress(value)) {
      return callback({ message: t('RESOURCES_IP_POOL_VALID') });
    }

    callback();
  };

  const checkNetworkAddress = (value) => {
    const cidrData = common.fnCalculateCidr(value);
    const checkNetwork = cidrData.networkAddress == value.split('/')[0] ? true : false;
    return checkNetwork;
  }

  const segmentIdValidator = (rule, value, callback) => {
    const { data } = form.current.props;
    // Check if the vlan value is number string and between 2 and 4094
    if (data.type == 'vlan' && (!/^\d+$/.test(value) || parseInt(value) < 2 || parseInt(value) > 4094)) {
      return callback({ message: t('RESOURCES_SEGMENT_ID_VALID_VLAN') });
    }
    callback();
  };

  const cidrValidator = (rule, value, callback) => {
    const { data } = form.current.props;
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

  const onChaneCidr = e => {
    const { data } = form.current.props;
    if (
      e.split('/').length != 2 ||
      !isValidIpAddress(e.split('/')[0]) ||
      !fnCheckCidrClass(e.split('/')[1])
    ) {
      data.ip_pool_start = '';
      data.ip_pool_end = '';

      const a = document.getElementById('ip_pool_start');
      const b = document.getElementById('ip_pool_end');
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.remove('hide');
        a.parentElement.parentElement.classList.add('error-item');
        b.nextElementSibling.classList.remove('hide');
        b.parentElement.parentElement.classList.add('error-item');
      }

      setCidrReducer();
    } else {
      const cidrData = common.fnCalculateCidr(e);
      data.ip_pool_start = cidrData.startIp;
      data.ip_pool_end = cidrData.endIp;

      const a = document.getElementById('ip_pool_start');
      const b = document.getElementById('ip_pool_end');
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.add('hide');
        a.parentElement.parentElement.classList.remove('error-item');
        b.nextElementSibling.classList.add('hide');
        b.parentElement.parentElement.classList.remove('error-item');
      }

      setCidrReducer();
      calculateRange();
    }
  };

  const handleNetworkType = e => {
    const { data } = form.current.props;
    if (e == 'flat') {
      data.segment_id = ' ';
      const a = document.getElementById('segment_id');
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.add('hide');
        a.parentElement.parentElement.classList.remove('error-item');
      }
      setExternalBool(true);
    } else {
      data.segment_id = '';
      const a = document.getElementById('segment_id');
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.remove('hide');
        a.parentElement.parentElement.classList.add('error-item');
      }
      // document.getElementById('radio.0').click();
      setExternalBool(false);
    }
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

  return (
    <>
      <Modal
        icon="pen"
        width={850}
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
              <span className={styles.detail}></span>
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
                <Form.Item>
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
                  </Columns>
                </Form.Item>
                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('RESOURCES_RESOURCE_NAME')}
                        rules={[
                          {
                            required: true,
                            message: t('RESOURCES_SELECT_RESOURCE_NAME_TIP'),
                          },
                        ]}
                      >
                        <Select
                          name="resource_name"
                          placeholder={t('RESOURCES_SELECT')}
                          options={resourceNameOptions}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item label={t('RESOURCES_DHCP_SERVER_DEPLOY')}>
                        <Toggle
                          checked={dhcpEnabled}
                          showText
                          onText="on"
                          offText="off"
                          onChange={e => setDhcpEnabled(e)}
                        />
                      </Form.Item>
                    </Column>
                  </Columns>
                </Form.Item>
                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('RESOURCES_NETWORK_TYPE')}
                        rules={[
                          {
                            required: true,
                            message: t('RESOURCES_SELECT_NAME_TIP'),
                          },
                        ]}
                      >
                        <Select
                          name="type"
                          defaultValue="vlan"
                          options={networkTypeOptions}
                          onChange={e => handleNetworkType(e)}
                        />
                      </Form.Item>
                    </Column>
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
                  </Columns>
                </Form.Item>

                <Form.Item label={t('RESOURCES_SUBNET')}>
                  <Form.Group>
                    <Form.Item>
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
                              onChange={e => onChaneCidr(e)}
                            />
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
                                    validator: ipValidator,
                                  },
                                ]}
                              >
                                <Input
                                  name="ip_pool_start"
                                  onChange={() => calculateRange()}
                                />
                              </Form.Item>
                            </Column>
                            <Column>
                              <Form.Item
                                rules={[
                                  {
                                    required: true,
                                    validator: ipValidator,
                                  },
                                ]}
                              >
                                <Input
                                  name="ip_pool_end"
                                  style={{ marginTop: '24px' }}
                                  onChange={() => calculateRange()}
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
                            label={t('RESOURCES_GATEWAY_IP')}
                            rules={[
                              {
                                pattern: PATTERN_IP,
                                message: t('RESOURCES_GATEWAY_IP_POOL_VALID'),
                              },
                            ]}
                          >
                            <Input name="gateway_ip" />
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
                              defaultValue={DEFAULT_MTU}
                              style={{ maxWidth: 'none' }}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Item>
                  </Form.Group>
                </Form.Item>
                <Form.Item
                  className={styles.textarea}
                  label={t('RESOURCES_DESCRIPTION')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea
                    name="description"
                    maxLength={256}
                    defaultValue=""
                  />
                </Form.Item>
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
