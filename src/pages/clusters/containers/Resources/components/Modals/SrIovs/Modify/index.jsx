/* eslint-disable no-extra-boolean-cast */
import { get } from 'lodash';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Checkbox,
} from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';
import classnames from 'classnames';
import { Modal, TypeSelect } from 'components/Base';
import { PATTERN_NAME, PATTERN_IP, PATTERN_IP_MASK } from 'utils/constants';
import { PropertiesInput, NumberInput } from 'components/Inputs';
import * as common from 'utils/resources';
import SriovStore from 'stores/resources/sriovs';

import styles from './index.scss';

const ModifyModal = props => {
  const detail = props.store.detail.network;

  const form = useRef();
  const [formData, setFormData] = useState({});

  const sriovStore = new SriovStore();

  const [modelView, setModalView] = useState(true);
  const [regStep, setRegStep] = useState(1);

  const [bondcheck, setBondCheck] = useState(false);
  const [sriovBondDataList, setSriovBondDataList] = useState([]);
  const [cidrReducer, setCidrReducer] = useReducer(
    cidrReducer => !cidrReducer,
    false
  );
  const [vfs, setVfs] = useState();
  const [availableRange, setAvailableRange] = useState(0);

  useEffect(() => {
    const getSriovVfs = async () => {
      const numberOfVfs = await sriovStore.fetchSriovVfs({ resourceName: detail.resource_name, ...props });
      setVfs(numberOfVfs.number);
    };
    getSriovVfs();

    const getSriovCreateData = async () => {
      const listSriovBond = await sriovStore.fetchSriovBondList({ ...props });
      setSriovBondDataList(listSriovBond.resources);
      // setSriovBondDataList(["sriov-bond-slave1", "sriov-bond-slave2"]);
    };

    getSriovCreateData();
  }, []);

  const handleOk = () => {
    const onOk = props.onOk;
    form.current.validator(() => {
      const { data } = form.current.props;

      const dns = [];
      if (!!data.dns_primary) {
        dns.push(data.dns_primary);
      }
      if (!!data.dns_secondary) {
        dns.push(data.dns_secondary);
      }

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

      data.networks = [];
      data.networks = bondCheckItems;

      if (data.segment_id == ' ') {
        delete data.segment_id;
      }
      // console.log("data : " + JSON.stringify(data))

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
              {t('RESOURCES_EDIT')}
            </Button>
          </>
        )}
      </>
    );

    return elements;
  };

  const nextHostRoute = useRef(
    detail?.host_routes.length == 0 ? 1 : detail?.host_routes.length - 1
  );
  const [listHostRoute, setListHostRoute] = useState(
    Array.from({ length: detail?.host_routes.length || 1 }, (v, i) => i)
  );

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

  const ipValidator = (rule, value, callback) => {
    const { data } = form.current.props;
    if (!value) {
      return callback({ message: t('RESOURCES_IP_POOL_EMPTY_DESC') });
    }
    if (!isValidIpAddress(value)) {
      return callback({ message: t('RESOURCES_IP_POOL_VALID') });
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
        (a.nextElementSibling &&
          a.nextElementSibling.classList.contains('form-item-error')) ||
        (b.nextElementSibling &&
          b.nextElementSibling.classList.contains('form-item-error'))
      ) {
        a.nextElementSibling?.classList.remove('hide');
        a.parentElement.parentElement?.classList.add('error-item');
        b.nextElementSibling?.classList.remove('hide');
        b.parentElement.parentElement?.classList.add('error-item');
      }

      setCidrReducer();
    } else {
      const cidrData = common.fnCalculateCidr(e);
      data.ip_pool_start = cidrData.startIp;
      data.ip_pool_end = cidrData.endIp;

      const a = document.getElementById('ip_pool_start');
      const b = document.getElementById('ip_pool_end');
      if (
        (a.nextElementSibling &&
          a.nextElementSibling.classList.contains('form-item-error')) ||
        (b.nextElementSibling &&
          b.nextElementSibling.classList.contains('form-item-error'))
      ) {
        a.nextElementSibling?.classList.add('hide');
        a.parentElement.parentElement?.classList.remove('error-item');
        b.nextElementSibling?.classList.add('hide');
        b.parentElement.parentElement?.classList.remove('error-item');
      }

      setCidrReducer();
      calculateRange();
    }
  };

  // 체크 리스트 시작 ==================================================
  const [bondCheckItems, setBondCheckItems] = useState([]);

  const dataListVariables = {
    bond: sriovBondDataList,
  };

  const stateVariables = {
    bond: bondCheckItems,
  };

  const setVariables = {
    bond: setBondCheckItems,
  };

  const handleSingleCheck = (checked, name, type) => {
    if (checked) {
      setVariables[type](prev => [...prev, name]);
    } else {
      setVariables[type](stateVariables[type].filter(el => el !== name));
    }
  };

  const handleAllCheck = (checked, type) => {
    if (checked) {
      const nameArray = [];
      dataListVariables[type].forEach(el => nameArray.push(el));
      setVariables[type](nameArray);
    } else {
      setVariables[type]([]);
    }
  };

  const handleDelete = (name, type) => {
    setVariables[type](stateVariables[type].filter(el => el !== name));
  };

  // 체크 리스트 끝 ==================================================

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
                  className={`${
                    regStep == 1
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
                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('RESOURCES_RESOURCE_NAME')}
                        rules={[{ required: true }]}
                      >
                        <Input
                          name="resource_name"
                          defaultValue={props.store.detail.name}
                          disabled
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <div/>
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
                        <Input
                          name="type"
                          defaultValue={detail.type.toUpperCase()}
                          disabled
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item label={t('RESOURCES_SEGMENT_ID')}>
                        <NumberInput
                          name="segment_id"
                          disabled={true}
                          defaultValue={detail.segment_id}
                          style={{ maxWidth: 'none' }}
                        />
                      </Form.Item>
                    </Column>
                  </Columns>
                </Form.Item>

                <Form.Item label={t('RESOURCES_SUBNET')}>
                  <Form.Group style={{ marginBottom: '0px' }}>
                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('CIDR')}
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
                              defaultValue={detail.cidr}
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
                                  defaultValue={detail.ip_pool.start}
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
                                  defaultValue={detail.ip_pool.end}
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
                            <Input
                              name="gateway_ip"
                              defaultValue={detail.gateway_ip}
                            />
                          </Form.Item>
                        </Column>
                        <Column>{/* 빈 컬럼 */}</Column>
                      </Columns>
                    </Form.Item>
                  </Form.Group>
                </Form.Item>
                {availableRange > vfs && (
                  <div
                    className="form-item-error"
                    style={{ marginTop: '-10px', marginBottom: '10px' }}
                  >
                    {t('IP POOL 범위가 VF 개수를 넘어갑니다.')}
                  </div>
                )}

                <Form.Item
                  className={styles.textarea}
                  label={t('RESOURCES_DESCRIPTION')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea
                    name="description"
                    maxLength={256}
                    defaultValue={detail.description}
                  />
                </Form.Item>

                <Form.Item>
                  <Checkbox
                    name="bond"
                    value="Y"
                    onClick={() => {
                      setBondCheck(!bondcheck);
                    }}
                  >
                    BOND
                  </Checkbox>
                </Form.Item>

                {bondcheck && (
                  <Form.Item>
                    <div className={styles.wrapper}>
                      {stateVariables['bond'].length > 0 && (
                        <div
                          className={classnames(
                            styles.table_title,
                            styles.table_title_bg
                          )}
                        >
                          <Button
                            className={styles.table_title_button}
                            onClick={() => handleAllCheck(false, 'bond')}
                          >
                            {t('RESOURCES_ALL_DESELECT')}
                          </Button>{' '}
                          {stateVariables['bond'].length}
                          {t('RESOURCES_COUNT')} {t('RESOURCES_SELECT')}
                        </div>
                      )}
                      <div className={styles.table}>
                        <table>
                          <colgroup>
                            <col width="5%" />
                            <col width="95%" />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>
                                <Checkbox
                                  name="select-all-bond"
                                  onChange={checked =>
                                    handleAllCheck(checked, 'bond')
                                  }
                                  checked={
                                    !!(
                                      dataListVariables['bond'].length > 0 &&
                                      stateVariables['bond'].length ===
                                        dataListVariables['bond'].length
                                    )
                                  }
                                />
                              </th>
                              <th>
                                <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sriovBondDataList.length == 0 && (
                              <tr>
                                <td colSpan="2" className="no-data">
                                  <p>{t('RESOURCES_DETAIL_NO_DATA')}</p>
                                </td>
                              </tr>
                            )}
                            {sriovBondDataList?.map((data, idx) => {
                              return (
                                <tr key={idx}>
                                  <td>
                                    <Checkbox
                                      name={`select-${idx}`}
                                      checked={
                                        !!stateVariables['bond'].includes(data)
                                      }
                                      onChange={checked =>
                                        handleSingleCheck(checked, data, 'bond')
                                      }
                                    />
                                  </td>
                                  <td>{data}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className={styles.removeCheckWrapper}>
                          {bondCheckItems?.map(name => (
                            <span key={name}>
                              <Button
                                icon="close"
                                onClick={() => handleDelete(name, 'bond')}
                              >
                                {name}
                              </Button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Form.Item>
                )}
              </div>
              {/* 기본설정 설정 끝========================================== */}

              {/* 세부 설정 시작========================================== */}
              <div className={`${regStep == 2 ? '' : 'hide'}`}>
                <Form.Item label={t('DNS')}>
                  <Form.Group>
                    <Columns>
                      <Column>
                        <Form.Item
                          label={t('Primary')}
                          rules={[
                            {
                              pattern: PATTERN_IP,
                              message: t('RESOURCES_DNS_VALID'),
                            },
                          ]}
                        >
                          <Input
                            name="dns_primary"
                            defaultValue={detail.dns?.[0]}
                          />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item
                          label={t('Secondary')}
                          rules={[
                            {
                              pattern: PATTERN_IP,
                              message: t('RESOURCES_DNS_VALID'),
                            },
                          ]}
                        >
                          <Input
                            name="dns_secondary"
                            defaultValue={detail.dns?.[1]}
                          />
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
                    {/* {detail.host_routes.length < 1 && (
                      <div>{t('RESOURCES_NO_REGISTERED_HOST_ROUTE')}</div>
                    )} */}
                    {listHostRoute.map((obj, index) => (
                      <div className={styles.item} key={obj}>
                        <Columns>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`Destination.${obj}`}
                                placeholder={t('Destination')}
                                defaultValue={
                                  detail.host_routes?.[obj]?.destination
                                }
                                onChange={e => onChangeDestination(e, obj)}
                              />
                            </Form.Item>
                          </Column>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`Nexthop.${obj}`}
                                placeholder={t('Nexthop')}
                                defaultValue={
                                  detail.host_routes?.[obj]?.nexthop
                                }
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

export default ModifyModal;
