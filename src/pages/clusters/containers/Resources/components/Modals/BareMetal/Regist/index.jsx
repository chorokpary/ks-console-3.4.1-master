import { toJS } from 'mobx'
import React, { useState, useRef, useEffect } from 'react'

import { get, omit } from 'lodash'
import { Modal } from 'components/Base'
import { Form, Input, Select, TextArea, Button, Checkbox, Tabs, InputPassword } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'

import { PATTERN_USER_NAME } from 'utils/constants'

import styles from './index.scss'
import NodeStore from 'stores/node'

const RegistModal = (props) => {

  const regexIp = /(^(\d{1,3}\.){3}(\d{1,3})$)/;

  const nodeStore = new NodeStore()

  const dataList = props.store.dataList;

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [tab, setTab] = useState("C");
  const { TabPanel } = Tabs;

  const [isBmc, setIsBmc] = useState(false);
  const [systemType, setSystemType] = useState('C')

  const [clusterNodeDataList, setClusterNodeDataList] = useState([]);

  const [bmcCheck, setBmcCheck] = useState(false);

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {

      const { data } = form.current.props;
      data.systemType = systemType;
      data.bmcCheck = bmcCheck;

      console.log("data :" + JSON.stringify(data))
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {

    const getClusterNodeData = async () => {
      const clusterNodeData = await nodeStore.fetchList();
      const clusterNodeArray = clusterNodeData.map(item => item.name);
      setClusterNodeDataList(clusterNodeArray);
    };

    getClusterNodeData();
  }, [])


  const nodeNameOptions = clusterNodeDataList.map((name) => {
    return {
      label: name, value: name,
    }
  })


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

  const clusteNodeNameValidator = (rule, value, callback) => {
    if (value == t('SELECT') || value == "") {
      return callback({ message: t('RESOURCES_SELECT_NAME_TIP') })
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

          <Form.Item>
            <Tabs type="button" activeName={tab} onChange={newTab => {
              setTab(newTab);
              setSystemType(newTab);

            }}>
              <TabPanel label={t('RESOURCES_CLUSTER')} name="C" />
              <TabPanel label={t('RESOURCES_BAREMETAL')} name="B" />
            </Tabs>
          </Form.Item>

          {systemType == "C" &&
            <Form.Item
              label={t('RESOURCES_NAME')}
              rules={[{ required: true, validator: clusteNodeNameValidator }]}
            >
              <Select
                name="cluserName"
                defaultValue={t('SELECT')}
                options={nodeNameOptions} />
            </Form.Item>
          }

          {systemType == "B" &&
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
              />
            </Form.Item>
          }

          {systemType == "B" &&
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
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('Scrape Interval')+' (s)'}
                      rules={[{ required: true, validator: intervalNodeValidator }]}
                    >
                      <Input
                        name="nodeInterval"
                        placeholder={t('60')}
                        type="number"
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
                        placeholder={t('9100')}
                        type="number"
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
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('Interval')+' (s)'}
                      rules={[{ required: true, validator: intervalValidator }]}
                    >
                      <Input
                        name={`bmcInterval`}
                        placeholder={t('Interval')}
                        type="number"
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

export default RegistModal

