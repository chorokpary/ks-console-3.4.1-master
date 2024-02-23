import { toJS } from 'mobx'
import React, { useState, useRef,useEffect } from 'react'

import { get, omit } from 'lodash'
import { Modal } from 'components/Base'
import { Form, Input, Select, TextArea, Button, Checkbox, Tabs } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'

import { PATTERN_NAME } from 'utils/constants'

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
    const onOk  = props.onOk;

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
      return callback({ message: t('이미 등록된 IP입니다.') })
    }

    if (!value) {
      return callback({ message: t('IP를 입력해 주세요.') })
    }
   
    callback()
  }

  const clusteNodeNameValidator = (rule, value, callback) => {
    if (value ==  t('SELECT') || value == "") {
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
                    options={nodeNameOptions}/>
              </Form.Item>
           }

           {systemType == "B" && 
            <Form.Item
              label={t('RESOURCES_NAME')}
              rules={[
                { required: true, message: t('NAME_EMPTY_DESC') },
                {
                  pattern: PATTERN_NAME,
                  message: t('INVALID_NAME_DESC'),
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
                      >
                        <Input
                          name="nodeInterval"
                          placeholder={t('60')}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item
                        label={t('Port')}
                      >
                        <Input
                          name="nodePort"
                          placeholder={t('21000')}
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
                      <Form.Item>
                        <Input
                          name={`bmcIp`}
                          placeholder={t('IP')}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                    <Form.Item>
                      <Input
                        name={`bmcInterval`}
                        placeholder={t('Interval')}
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

