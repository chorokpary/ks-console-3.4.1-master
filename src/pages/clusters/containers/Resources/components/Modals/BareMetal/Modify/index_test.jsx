import { toJS } from 'mobx'
import React, { useState, useRef } from 'react'

import { get, omit } from 'lodash'
import { Modal } from 'components/Base'
import { Form, Input, Select, TextArea, Button, Checkbox, Tabs, InputPassword } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'

import styles from './index.scss'

const EditModal = (props) => {

  const detailInfo = toJS(props.store.list.data).find(item => get(item, 'name') == props.store.detail.name) 

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [bmcCheck, setBmcCheck] = useState(false);

  const handleOk = () => {
    const onOk  = props.onOk;

    console.log("AAAAAAAAAA")

    form.current.validator(() => {
      const { data } = form.current.props;
      data.systemType = detailInfo.system_type;
      data.bmcCheck = bmcCheck;

      console.log("data :" + JSON.stringify(data))
      // onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }
  
  // Validation 시작 ==================================================
  const instanceIpValidator = (rule, value, callback) => {

    const duplicate = dataList.filter((el) => el.ip == value)

    if (value && duplicate.length > 0) {
      return callback({ message: t('RESOURCES_REGISTED_IP_EXISTS') })
    }

    if (!value) {
      return callback({ message: t('RESOURCES_IP_EMPTY_DESC') })
    }

    if (!(regexIp.test(value))) {
      return callback({ message: t('INVALID_IP_DESC') })
    }

    callback()
  }

  const intervalNodeValidator = (rule, value, callback) => {

    if (!value) {
      return callback({ message: t('RESOURCES_INTERVAL_EMPTY_DESC') })
    }

    if (value < 60) {
      return callback({ message: t('RESOURCES_ENTER_60_MORE') })
    }
    callback()
  }

  const portValidator = (rule, value, callback) => {

    if (!value) {
      return callback({ message: t('RESOURCES_PORT_EMPTY_DESC') })
    }

    if (!((value >= 1) && (value <= 65535))) {
      return callback({ message: t('RESOURCES_ENTER_1_MORE_AS_65535') })
    }
    callback()
  }

  const bmcIpValidator = (rule, value, callback) => {

    if (!value) {
      return callback({ message: t('RESOURCES_IP_EMPTY_DESC') })
    }

    if (!(regexIp.test(value))) {
      return callback({ message: t('INVALID_IP_DESC') })
    }

    callback()
  }

  const intervalValidator = (rule, value, callback) => {

    if (!value) {
      return callback({ message: t('RESOURCES_INTERVAL_EMPTY_DESC') })
    }

    if (value < 60) {
      return callback({ message: t('RESOURCES_ENTER_60_MORE') })
    }
    callback()
  }

  const bmcIdValidator = (rule, value, callback) => {

    if (!value) {
      return callback({ message: t('RESOURCES_ID_EMPTY_DESC') })
    }

    callback()
  }

  const bmcPasswordValidator = (rule, value, callback) => {

    if (!value) {
      return callback({ message: t('RESOURCES_PASSWORD_EMPTY_DESC') })
    }

    callback()
  }
  // Validation 끝 ==================================================

  return (
    <>  
        <Modal
          icon="pen"
          width={800}
          title={props.title}
          onOk={handleOk}
          onCancel={closeModal}
          visible={modelView}
        >
          <Form data={formData} ref={form}>

            <Form.Item
              label={t('이름')}
              rules={[{ required: true, message: t('이름을 입력해 주세요.') }]}
              desc={t('NAME_DESC')}
            >
              <Input
                name="name"
                autoFocus={true}
                maxLength={63}
                defaultValue={detailInfo.name}
                disabled
              />   
            </Form.Item>

          {detailInfo.system_type == "B" && 
            <Form.Item label={t('Node Exporter')}>
                <Form.Group>

                  <Columns>
                    <Column>
                      <Form.Item
                            label={t('IP')}
                            rules={[{ required: true, validator: instanceIpValidator }]}
                          >
                          <Input
                            name="nodeIp"
                            placeholder={t('192.168.XX.XX')}
                            defaultValue={detailInfo.nodeExporter.ip}
                          />   
                        </Form.Item>
                    </Column>             
                    <Column>
                      <Form.Item
                        label={t('Scrape Interval')}
                        rules={[{ required: true, validator: intervalNodeValidator }]}
                      >
                        <Input
                          name="nodeInterval"
                          placeholder={t('Interval')}
                          defaultValue={!!detailInfo.nodeExporter?.scrapeInterval ? (detailInfo.nodeExporter.scrapeInterval).replace('s','') : ""}                         
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item
                        label={t('Port')}
                        rules={[{ required: true, validator: portValidator }]}
                      >
                        <Input
                          name="nodePort"
                          placeholder={t('21000')}
                          defaultValue={detailInfo.nodeExporter.port}
                        />
                      </Form.Item>
                    </Column>
                  </Columns>

              </Form.Group>
            </Form.Item>
            }

          <div className={styles.title}> 
              <Checkbox name="bmc" onClick={() => {
                setBmcCheck(!bmcCheck);
              }}>{t('BMC')}
              <span className={`form-item-required ${bmcCheck ? '' : 'hide'}`}>*</span>
              </Checkbox>
          </div>
          {bmcCheck && (<div className={styles.desc}>{t('RESOURCES_INTERVAL_60_OVER_DESC')}</div>)}
          {bmcCheck && (
            <Form.Group>                   
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('IP')}
                        rules={[{ required: true, validator: bmcIpValidator }]}
                      >
                        <Input
                          name={`bmcIp`}
                          placeholder={t('IP')}
                          defaultValue={detailInfo.openBMC.address}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item
                        label={t('Interval')}
                        rules={[{ required: true, validator: intervalValidator }]}
                      >
                        <Input
                          name={`bmcInterval`}
                          placeholder={t('Interval')}
                          type="number"
                          defaultValue={!!detailInfo.openBMC?.scrapeInterval ? (detailInfo.openBMC.scrapeInterval).replace('s','') : ""}  
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item
                        label={t('ID')}
                        rules={[{ required: true, validator: bmcIdValidator }]}
                      >
                        <Input
                          name={`bmcId`}
                          placeholder={t('ID')}          
                          defaultValue={detailInfo.openBMC.username}              
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item
                        label={t('Password')}
                        rules={[{ required: true, validator: bmcPasswordValidator }]}
                      >
                        <InputPassword
                          name={`bmcPassword`}
                          type="password"
                          placeholder={t('Password')}
                          defaultValue={detailInfo.openBMC.password}
                        />
                      </Form.Item>
                    </Column>
                  </Columns>
            </Form.Group>
           )}

          </Form>
        </Modal>

    </>
  );
};

export default EditModal

