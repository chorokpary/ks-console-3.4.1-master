import React, { useEffect, useReducer, useRef, useState } from 'react'
import { Modal, TypeSelect, List, Panel } from 'components/Base'
import { PropertiesInput, NumberInput } from 'components/Inputs'
import { PATTERN_NAME } from 'utils/constants'
import { get, omit, range } from 'lodash'
import { Form, Input, Select, Button } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import DistroTypeStore from 'stores/resources/distrotype'
import styles from './index.scss'
import ObjectInput from 'components/Inputs/ObjectInput'
import * as common from "utils/resources"

export default function ResourceImageModal({ title, store, onOk }) {

  const form = useRef();
  const [formData, setFormData] = useState({});
  const [modelView, setModalView] = useState(true);
  const [external, setExternal] = useState(false)
  const [defaultRoute, setDefaultRoute] = useState(true)
  const [cidrReducer, setCidrReducer] = useReducer(cidrReducer => !cidrReducer, false)
  const [externalBool, setExternalBool] = useState(false);


  const networkTypeOptions = [
    { label: 'VXLAN', value: 'VXLAN', },
    { label: 'VLAN', value: 'VLAN', },
    { label: 'FLAT', value: 'FLAT', },
  ]
  const externalOptions = [
    { label: '미사용', value: false, },
    { label: '사용', value: true, }
  ]
  const defaultRouteOptions = [
    { label: '미사용', value: false, },
    { label: '사용', value: true, }
  ]

  const handleOk = () => {


    form.current.validator(() => {
      const { data } = form.current.props;
      console.log(data)
      // onOk({ image: data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const nextHostRoute = useRef(1);
  const [listHostRoute, setListHostRoute] = useState([1]);

  const handleHostRoute = {

    addColumn: () => {
      nextHostRoute.current += 1
      setListHostRoute(listHostRoute => [...listHostRoute, nextHostRoute.current]);

    },
    delColumn: (id) => {
      setListHostRoute(listHostRoute.filter((el) => el !== id));
    },
  }

  // ip 정규식
  const regexIp = /(^(\d{1,3}\.){3}(\d{1,3})$)/;
  // 숫자 정규식
  const regexNumber = /^[0-9]+$/;
  const isValidIpAddress = (ip) => {
    return regexIp.test(ip);
  }
  const fnCheckCidrClass = (num) => {
    if (!regexNumber.test(num)) {
      return false;
    }
    let clsMaximumVal = 128;
    let classVal = parseInt(num);
    if (classVal < 1 || classVal > clsMaximumVal) {
      return false;
    }
    return true;
  }

  const onChaneCidr = (e) => {
    const { data } = form.current.props;
    if (e.split("/").length != 2 || !isValidIpAddress(e.split("/")[0]) || !fnCheckCidrClass(e.split("/")[1])) {
      data.ip_pool_start = '';
      data.ip_pool_end = '';
      data.gateway_ip = '';

      const a = document.getElementById('ip_pool_start')
      const b = document.getElementById('ip_pool_end')
      const c = document.getElementById('gateway_ip')
      if (a.nextElementSibling && a.nextElementSibling.classList.contains('form-item-error')) {
        a.nextElementSibling.classList.remove('hide')
        a.parentElement.parentElement.classList.add("error-item");
        b.nextElementSibling.classList.remove('hide')
        b.parentElement.parentElement.classList.add("error-item");
        c.nextElementSibling.classList.remove('hide')
        c.parentElement.parentElement.classList.add("error-item");
      }

      setCidrReducer()
    } else {
      const cidrData = common.fnCalculateCidr(e);
      data.ip_pool_start = cidrData.startIp
      data.ip_pool_end = cidrData.endIp;
      data.gateway_ip = cidrData.gatewayIp;

      const a = document.getElementById('ip_pool_start')
      const b = document.getElementById('ip_pool_end')
      const c = document.getElementById('gateway_ip')
      if (a.nextElementSibling && a.nextElementSibling.classList.contains('form-item-error')) {
        a.nextElementSibling.classList.add('hide')
        a.parentElement.parentElement.classList.remove("error-item");
        b.nextElementSibling.classList.add('hide')
        b.parentElement.parentElement.classList.remove("error-item");
        c.nextElementSibling.classList.add('hide')
        c.parentElement.parentElement.classList.remove("error-item");
      }

      setCidrReducer()
    }
  }

  const handleExternal = (value) => {
    setExternal(value)

  }

  const handleNetworkType = (e) => {
    if (e == 'FLAT') {
      setExternalBool(true)
    } else {
      setExternalBool(false)
    }
  }

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={title}
        onOk={handleOk}
        okText={'생성'}
        onCancel={closeModal}
        cancelText={'취소'}
        visible={modelView}
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('이름')}
            rules={[{ required: true, message: t('이름을 입력해주세요') },]}
          >
            <Input name="name" maxLength={253}
              style={{ maxWidth: 'none' }} />
          </Form.Item>

          <Form.Item>
            <Columns>
              <Column>
                <Form.Item
                  label={t('네트워크 타입')}
                  rules={[{ required: true, message: t('이름을 입력해주세요') },]}
                >
                  <Select
                    name="network_type"
                    defaultValue="VXLAN"
                    options={networkTypeOptions}
                    onChange={(e) => handleNetworkType(e)} />
                </Form.Item>
              </Column>
              <Column>
                <Form.Item
                  label={t('세그먼트 ID')}
                  rules={[{ required: true, message: t('세그먼트 ID를 입력해주세요') },]}
                >
                  <Input name="segment_id"
                    disabled={externalBool}
                    style={{ maxWidth: 'none' }} />
                </Form.Item>
              </Column>
            </Columns>
          </Form.Item>

          <Form.Item>
            <Columns>
              <Column>
                <Form.Item
                  label={t('External')}
                  rules={[{ required: true },]}
                >
                  <RadioGroup
                    name="external"
                    wrapClassName="radio"
                    defaultValue={external}
                    onChange={value => handleExternal(value)}
                  >
                    {externalOptions.map(option => (
                      <RadioButton key={option.value} value={option.value}>
                        {option.label}
                      </RadioButton>
                    ))}
                  </RadioGroup>
                </Form.Item>
              </Column>
              <Column>
                <Form.Item
                  label={t('MTU')}
                  rules={[{ required: true, message: t('MTU를 입력해주세요.') },]}
                >
                  <NumberInput name="mtu"
                    defaultValue={1500}
                    // min={1}
                    // max={1600}
                    style={{ maxWidth: 'none' }} />
                </Form.Item>
              </Column>
            </Columns>
          </Form.Item>

          <Form.Item>
            <Columns>
              <Column>
                <Form.Item
                  label={t('CIDR')}
                  rules={[{ required: true, message: t('CIDR을 입력해주세요.') },]}
                >
                  <Input name="cidr"
                    style={{ maxWidth: 'none' }}
                    onChange={(e) => onChaneCidr(e)}
                  />
                </Form.Item>
              </Column>
              <Column>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('IP POOL 정보')}
                      rules={[{ required: true, message: t('IP POOL을 입력해주세요.') },]}
                    >
                      <Input name="ip_pool_start" />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      rules={[{ required: true, message: t('IP POOL을 입력해주세요.') },]}
                    >
                      <Input name="ip_pool_end"
                        style={{ marginTop: '24px' }} />
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
                  label={t('디폴트 라우트')}
                  rules={[{ required: true },]}
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
                  label={t('게이트웨이 IP')}
                  rules={[{ required: true, message: t('게이트웨이 IP를 입력해주세요.') },]}
                >
                  <Input name="gateway_ip" />
                </Form.Item>
              </Column>
            </Columns>
          </Form.Item>

          <Form.Item label={t('DNS')}>
            <Form.Group>
              <Columns>
                <Column>
                  <Form.Item
                    label={t('Primary')}
                  >
                    <Input name="dns.1" />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    label={t('Secondary')}
                  >
                    <Input name="dns.2" />
                  </Form.Item>
                </Column>
              </Columns>
            </Form.Group>
          </Form.Item>

          {/* <Form.Item label={t('호스트 라우트')}>
            <Form.Group
            // label={t('ADD_METADATA')}
            // desc={t('VOLUME_ADD_METADATA_DESC')}
            // keepDataWhenUnCheck
            // checkable
            >
              <Form.Item>
                <PropertiesInput name="metadata.labels" addText={t('ADD')} />
              </Form.Item>
            </Form.Group>
          </Form.Item> */}


          <Form.Item label={t('호스트 라우트')}>
            <Form.Group>
              {listHostRoute.map((obj, idx) => (
                <div className={styles.item} key={obj}>
                  <Columns>
                    <Column>
                      <Form.Item>
                        <Input
                          name={`Destination.${obj}`}
                          placeholder={t('Destination')}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item>
                        <Input
                          name={`Nexthop.${obj}`}
                          placeholder={t('Nexthop')}
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
                  추가
                </Button>
              </div>

            </Form.Group>
          </Form.Item>
        </Form>




      </Modal >
    </>

  )

}
