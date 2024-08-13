import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Modal } from 'components/Base';
import { NumberInput } from 'components/Inputs';
import {
  PATTERN_NAME,
  PATTERN_IP,
  PATTERN_IP_MASK,
  PATTERN_MTU,
} from 'utils/constants';
import { Form, Input, Select, Button, TextArea } from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';
import {
  RadioButton,
  RadioGroup,
} from '@kube-design/components/lib/components/Radio';
import * as common from 'utils/resources';
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

  const defaultRouteOptions = [
    { label: t('RESOURCES_NOT_USE'), value: false },
    { label: t('RESOURCES_USE'), value: true },
  ];

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      const { id } = detail;
      const dns = [];
      data.dns?.map(el => {
        if (el != '') {
          dns.push(el);
        }
      });
      data.dns = dns;

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

      data.ip_pool = {
        start: data.ip_pool_start,
        end: data.ip_pool_end,
      };
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

  const cidrValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_CIDR_EMPTY_DESC') });
    }
    if (
      value.split('/').length != 2 ||
      !isValidIpAddress(value.split('/')[0]) ||
      !fnCheckCidrClass(value.split('/')[1])
    ) {
      return callback({ message: t('RESOURCES_CIDR_VALID') });
    }

    callback();
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

  return (
    <>
      <Modal
        icon="pen"
        width={800}
        title={props.title}
        onOk={handleOk}
        okText={t('RESOURCES_EDIT')}
        onCancel={closeModal}
        cancelText={t('RESOURCES_CANCEL')}
        visible={modelView}
        isSubmitting={props.store.isSubmitting}
      >
        <Form data={formData} ref={form}>
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
              // min={1}
              // max={1600}
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

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
                    onChange={e => onChangeCidr(e)}
                    defaultValue={detail.cidr}
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
                          message: t('RESOURCES_IP_POOL_EMPTY_DESC'),
                        },
                        {
                          pattern: PATTERN_IP,
                          message: t('RESOURCES_IP_POOL_VALID'),
                        },
                      ]}
                    >
                      <Input
                        name="ip_pool_start"
                        defaultValue={detail.ip_pool.start}
                      />
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
                        defaultValue={detail.ip_pool.end}
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
                      <RadioButton key={option.value} value={option.value}>
                        {option.label}
                      </RadioButton>
                    ))}
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
                      message: t('RESOURCES_IP_POOL_VALID'),
                    },
                  ]}
                >
                  <Input name="gateway_ip" defaultValue={detail.gateway_ip} />
                </Form.Item>
              </Column>
            </Columns>
          </Form.Item>

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
                    <Input name="dns.0" defaultValue={detail.dns?.[0]} />
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
                    <Input name="dns.1" defaultValue={detail.dns?.[1]} />
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
        </Form>
      </Modal>
    </>
  );
};

export default ModifyModal;
