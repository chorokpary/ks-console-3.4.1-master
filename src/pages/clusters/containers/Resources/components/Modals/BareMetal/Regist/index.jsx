import { toJS } from 'mobx'
import React, { useState, useRef, useEffect } from 'react'

import { get, omit } from 'lodash'
import { Modal } from 'components/Base'
import { Form, Input, Select, TextArea, Button, Checkbox, Tabs } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'

import { PATTERN_USER_NAME, PATTERN_IP } from 'utils/constants'

import styles from './index.scss'
import NodeStore from 'stores/node'

const RegistModal = (props) => {

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

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {

      const { data } = form.current.props;
      data.systemType = systemType;

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

    if (!(PATTERN_IP.test(value))) {
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
    } else {
      if (!(PATTERN_IP.test(value))) {
        return callback({ message: t('INVALID_IP_DESC') })
      }
    }

    callback()
  }

  const intervalValidator = (rule, value, callback) => {

    if (!value) {
    } else {
      if (value < 60) {
        return callback({ message: t('RESOURCES_ENTER_60_MORE') })
      }
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
                  <Column></Column>
                </Columns>

                <Columns>
                  <Column>
                    <Form.Item
                      label={t('Scrape Interval')}
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
                        placeholder={t('21000')}
                        type="number"
                      />
                    </Form.Item>
                  </Column>
                </Columns>

              </Form.Group>
            </Form.Item>
          }

          <Form.Group label={t('BMC')} onChange={(e) => setIsBmc(!isBmc)} checkable desc={t('RESOURCES_BMC_SYSTEM_TIP')}>
            <div className={styles.item}>
              <Columns>
                <Column>
                  <Form.Item
                    rules={[{ required: false, validator: bmcIpValidator }]}
                  >
                    <Input
                      name={`bmcIp`}
                      placeholder={t('IP')}
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    rules={[{ required: false, validator: intervalValidator }]}
                  >
                    <Input
                      name={`bmcInterval`}
                      placeholder={t('Interval')}
                      type="number"
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item>
                    <Input
                      name={`bmcId`}
                      placeholder={t('ID')}
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item>
                    <Input
                      name={`bmcPassword`}
                      type="password"
                      placeholder={t('Password')}
                    />
                  </Form.Item>
                </Column>
              </Columns>
            </div>
          </Form.Group>


        </Form>
      </Modal>

    </>
  );
};

export default RegistModal

