import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Modal } from 'components/Base';
import { NumberInput } from 'components/Inputs';
import {
  PATTERN_NAME,
  PATTERN_IP,
  PATTERN_IP_MASK,
  PATTERN_MTU,
} from 'utils/constants';
import { Form, Input, Button, Select, Tooltip, TextArea } from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';
import {
  RadioButton,
  RadioGroup,
} from '@kube-design/components/lib/components/Radio';
import * as common from 'utils/resources';
import classnames from 'classnames';
import styles from './index.scss';

const ModifyModal = props => {
  const detail = props.detail;
  const form = useRef();
  const [formData, setFormData] = useState({});
  const [modelView, setModalView] = useState(true);
  const [defaultRoute, setDefaultRoute] = useState(detail.default_route);
  const [cidrReducer, setCidrReducer] = useReducer(
    cidrReducer => !cidrReducer,
    false
  );
  const [regStep, setRegStep] = useState(1);

  const defaultRouteOptions = [
    { label: t('RESOURCES_NOT_USE'), value: false },
    { label: t('RESOURCES_USE'), value: true },
  ];

  const fabricOptions = [
    { label: 'ETHERNET', value: 'ethernet' },
    { label: 'INFINIBAND', value: 'infiniband' },
  ]

  const indexOptions = [
    { label: '0', value: 0 },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
  ]

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

      const { id } = detail;

      const host_routes = [];
      listHostRoute?.map(el => {
        if (data.Destination?.[el] && data.Nexthop?.[el]) {
          host_routes.push({
            destination: data.Destination[el],
            nexthop: data.Nexthop[el],
          });
        }
      });
      data.host_routes = host_routes;
      data.id = id;

      onOk({ ...data });
    });
  };

  const closeModal = () => {
    setModalView(false);
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

  const nextHostRoute = useRef(
    detail?.host_routes?.length == 0 ? 1 : detail?.host_routes?.length - 1
  );
  const [listHostRoute, setListHostRoute] = useState(
    Array.from({ length: detail?.host_routes?.length || 1 }, (v, i) => i)
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

  const stepMoveCheck = step => {
    const { data } = form.current.props;
    if (step == 1) {
      if (
        data.name == undefined ||
        data.name == '' ||
        !PATTERN_MTU.test(data.mtu) ||
        data.gateway_ip == undefined ||
        data.gateway_ip == ''
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
              {t('RESOURCES_EDIT')}
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
                        { required: true, message: t('RESOURCES_NAME_EMPTY_DESC') },
                      ]}
                      desc={t('NAME_DESC')}
                    >
                      <Input
                        name="name"
                        maxLength={253}
                        defaultValue={detail.name}
                        readOnly
                        style={{ maxWidth: 'none' }}
                      />
                    </Form.Item>
                  </Column>
                </Columns>

                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('RESOURCES_RESOURCE_NAME')}
                        rules={[
                          {
                            required: false,
                          },
                        ]}
                      >
                        <Input
                          name="resource_name"
                          maxLength={253}
                          defaultValue={detail.resource_name}
                          readOnly
                          style={{ maxWidth: 'none' }}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Columns>
                        <Column>
                          <Columns>
                            <Column>
                              <Form.Item
                                label={t('RESOURCES_FABRIC')}
                                rules={[
                                  {
                                    required: false,
                                  },
                                ]}
                              >
                                <Select
                                  name="fabric"
                                  defaultValue={detail.fabric}
                                  options={fabricOptions}
                                />
                              </Form.Item>
                            </Column>
                            <Column>
                              <Form.Item
                                label={t('RESOURCES_INTERFACE_INDEX')}
                                rules={[
                                  {
                                    required: true,
                                    message: t('RESOURCES_SELECT_INTERFACE_INDEX_TIP'),
                                  },
                                ]}
                              >
                                <Select
                                  name="interface_index"
                                  defaultValue={detail.interface_index}
                                  options={indexOptions}
                                />
                              </Form.Item>
                            </Column>
                          </Columns>
                        </Column>
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
                            label={t('RESOURCES_GATEWAY_IP')}
                            rules={[
                              {
                                required: true,
                                message: t('RESOURCES_GATEWAY_IP_EMPTY_DESC'),
                              },
                              {
                                pattern: PATTERN_IP,
                                message: t('RESOURCES_IP_POOL_VALID'),
                              },
                            ]}
                          >
                            <Input name="gateway_ip" defaultValue={detail.gateway_ip} />
                          </Form.Item>
                        </Column>
                        <Column>
                          <Columns>
                            <Column>
                              <Form.Item
                                label={t('RESOURCES_MTU')}
                                rules={[
                                  { required: true, message: t('RESOURCES_MTU_EMPTY_DESC') },
                                  {
                                    pattern: PATTERN_MTU,
                                    message: t('RESOURCES_MTU_VALID'),
                                  },
                                ]}
                              >
                                <NumberInput
                                  name="mtu"
                                  defaultValue={detail.mtu}
                                  style={{ maxWidth: 'none' }}
                                />
                              </Form.Item>
                            </Column>
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
                                    <RadioButton key={option.value} value={option.value}>
                                      {option.label}
                                    </RadioButton>
                                  ))}
                                </RadioGroup>
                              </Form.Item>
                            </Column>
                          </Columns>
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
                        defaultValue={detail.description}
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
                                defaultValue={detail.host_routes?.[obj]?.destination}
                              />
                            </Form.Item>
                          </Column>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`Nexthop.${obj}`}
                                placeholder={t('Nexthop')}
                                onChange={e => onChangeNexthop(e, obj)}
                                defaultValue={detail.host_routes?.[obj]?.nexthop}
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
