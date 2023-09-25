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

import classnames from 'classnames'

export default function ResourceNetworkModal({ title, store, onOk }) {

  const form = useRef();
  const [formData, setFormData] = useState({});
  const [modelView, setModalView] = useState(true);
  const [external, setExternal] = useState(false)
  const [defaultRoute, setDefaultRoute] = useState(false)
  const [cidrReducer, setCidrReducer] = useReducer(cidrReducer => !cidrReducer, false)
  const [externalBool, setExternalBool] = useState(false);

  const [regStep, setRegStep] = useState(1);
  const [submitButtonFlag, setSubmitButtonFlag] = useState(false);


  const networkTypeOptions = [
    { label: 'VXLAN', value: 'VXLAN', },
    { label: 'VLAN', value: 'VLAN', },
    { label: 'FLAT', value: 'FLAT', },
    { label: 'GRE', value: 'GRE', },
    { label: 'GENEVE', value: 'GENEVE', },
    { label: 'STT', value: 'STT', },
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

      const dns = []
      data.dns?.map((el) => {
        if (el != '') {
          dns.push(el)
        }
      });
      const host_routes = []
      data.Destination?.map((el, idx) => {
        if (el != '') {
          host_routes.push({ destination: el, nexthop: data.Nexthop[idx] })
        }
      })
      data.ip_pool = {
        start: data.ip_pool_start,
        end: data.ip_pool_end
      }
      data.dns = dns
      data.host_routes = host_routes
      data.networktype_app = false

      if (data.segment_id == " ") {
        delete data.segment_id;
      }

      onOk({ network: data })
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
  // const regexIpzero = /(^(\d{1,3}\.){3}([0])$)/; // 끝자리 0 정규식
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
    const { data } = form.current.props;
    if (e == 'FLAT' || e == 'VLAN') {
      data.segment_id = ' ';
      const a = document.getElementById('segment_id')
      if (a.nextElementSibling && a.nextElementSibling.classList.contains('form-item-error')) {
        a.nextElementSibling.classList.add('hide')
        a.parentElement.parentElement.classList.remove("error-item");
      }
      setExternalBool(true)
    } else {
      data.segment_id = '';
      const a = document.getElementById('segment_id')
      if (a.nextElementSibling && a.nextElementSibling.classList.contains('form-item-error')) {
        a.nextElementSibling.classList.remove('hide')
        a.parentElement.parentElement.classList.add("error-item");
      }
      document.getElementById('radio.0').click();
      setExternalBool(false)
    }
  }

  const stepMoveCheck = (step) => {
    const { data } = form.current.props;
    if(step ==1){
      if(data.name == undefined || data.name == "" 
      || data.segment_id == undefined || data.segment_id == ""
      || data.cidr == undefined || data.cidr == ""
      || data.ip_pool_start == undefined || data.ip_pool_start == ""
      || data.ip_pool_end == undefined || data.ip_pool_end == ""
      || data.gateway_ip == undefined || data.gateway_ip == ""
      ){
        handleOk();
      }else{
        setRegStep(2);
      }
    }
  }

  const fnGetModalFooter = () => {
    let elements = "";
    elements =
          <>
              {regStep == 1 &&
                <>
                  <Button onClick={() => closeModal()} className={classnames(styles['btn'],styles['btn-default'])}>취소</Button>
                  <Button type="control" onClick={() => {stepMoveCheck(1)}} className={classnames(styles['btn'],styles['btn-control'])}>다음</Button>                    
                </>
              }
              {regStep == 2 &&
                <>
                  <Button onClick={() => closeModal()} className={classnames(styles['btn'],styles['btn-default'])}>취소</Button>
                  <Button onClick={() => {setRegStep(1)}} className={classnames(styles['btn'],styles['btn-default'])}>이전</Button>
                  <Button onClick={() => {handleOk()}} className={classnames(styles['btn'],styles['btn-control'])} >생성</Button>
                </>
              }
          </>
      return elements;
  }

  return (
    <>
      <Modal
        icon="pen"
        width={960}
        title={title}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}   
        hideFooter    
      >
        <Form data={formData} ref={form}>

           {/* Header */}
           <div className={styles.tab_process}>
              {/* styles.view_screen  : 이전 링크 관련 class*/}
              <div className={classnames(styles.process_item,`${regStep == 1 ? styles.current : ''}`)}>
                  <div className={styles.status}>
                    <div className={`${regStep == 1 ? styles.current : regStep > 1 ? styles.done : styles.todo}`}></div>
                  </div>
                  <span className={styles.basic}></span>
                  <div className={styles.title}>
                    <div className={styles.step_name}>기본 설정</div>
                    <div className={styles.situation}>{regStep == 1 ? "Current" : regStep > 1 ? "Done" : "To do"}</div>
                  </div>
                </div>
                <div className={classnames(styles.process_item,`${regStep == 2 ? styles.current : ''}`)}>
                  <div className={styles.status}>
                    <div className={`${regStep == 2 ? styles.current : styles.todo}`} ></div>
                  </div>
                  <span className={styles.check}></span>
                  <div className={styles.title}>
                    <div className={styles.step_name}>세부 설정</div>
                    <div className={styles.situation}>{regStep == 2 ? "Current" : "To do"}</div>
                  </div>
                </div>
            </div>


              {/* Content */}
              <div className={styles.pop_overflow_y}>
              <div className={styles.cont_boxwrap}>

                {/* 기본설정 설정 시작==========================================*/}
                <div className={`${regStep == 1 ? "" : "hide"}`}>
                  
                  <Form.Item
                    label={t('이름')}
                    rules={[{ required: true, message: t('이름을 입력해주세요') },]}
                    desc={t('NAME_DESC')}
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
                            name="type"
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
                          <NumberInput name="segment_id"
                            disabled={externalBool}
                            style={{ maxWidth: 'none' }} />
                        </Form.Item>
                      </Column>
                    </Columns>
                  </Form.Item>

                  <Form.Item label={t('서브넷')}>
                    <Form.Group>
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
                                {externalOptions.map((option, idx) => (
                                  <RadioButton id={`radio.${idx}`} key={option.value} value={option.value}
                                    disabled={!externalBool && idx == 1 ? true : false}
                                  >
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
                    </Form.Group>
                  </Form.Item>

                </div>
                {/* 기본설정 설정 끝==========================================*/}

                {/* 세부 설정 시작==========================================*/}
                <div className={`${regStep == 2 ? "" : "hide"}`}>

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

                </div>
                {/* 세부 설정 끝==========================================*/}

              </div> 
            </div>

            {/* Footer */}
            <div className={styles['modal-footer']}>
              {fnGetModalFooter()}  
            </div>

        </Form>
      </Modal >
    </>

  )

}
