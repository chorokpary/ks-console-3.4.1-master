import { toJS } from 'mobx'
import React, { useState, useRef } from 'react'

import { get, omit } from 'lodash'
import { Modal } from 'components/Base'
import { Form, Input, Select, TextArea, Button, Checkbox, Tabs } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'

import styles from './index.scss'

const EditModal = (props) => {

  const detailInfo = toJS(props.store.list.data).find(item => get(item, 'name') == props.store.detail.name) 

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = () => {
    const onOk  = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      data.systemType = detailInfo.system_type;

      console.log("data :" + JSON.stringify(data))
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }
  

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
                          >
                          <Input
                            name="nodeIp"
                            placeholder={t('192.168.XX.XX')}
                            defaultValue={detailInfo.nodeExporter.ip}
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
                          placeholder={t('Interval')}
                          defaultValue={!!detailInfo.nodeExporter?.scrapeInterval ? (detailInfo.nodeExporter.scrapeInterval).replace('s','') : ""}                         
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
                          defaultValue={detailInfo.nodeExporter.port}
                        />
                      </Form.Item>
                    </Column>
                  </Columns>

              </Form.Group>
            </Form.Item>
            }

            <Form.Group label={t('BMC')} desc={t('RESOURCES_BMC_SYSTEM_TIP')}> 
                <div className={styles.item}>
                 <Columns>
                    <Column>
                      <Form.Item>
                        <Input
                          name={`bmcIp`}
                          placeholder={t('IP')}
                          defaultValue={detailInfo.openBMC.address}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                    <Form.Item>
                      <Input
                        name={`bmcInterval`}
                        placeholder={t('Interval')}
                        defaultValue={!!detailInfo.openBMC?.scrapeInterval ? (detailInfo.openBMC.scrapeInterval).replace('s','') : ""}  
                      />
                    </Form.Item>
                    </Column>
                    <Column>
                    <Form.Item>
                      <Input
                        name={`bmcId`}
                        placeholder={t('ID')}
                        defaultValue={detailInfo.openBMC.username}
                      />
                    </Form.Item>
                    </Column>
                    <Column>
                    <Form.Item>
                      <Input
                        name={`bmcPassword`}
                        placeholder={t('Password')}
                        type="password"
                        defaultValue={detailInfo.openBMC.password}
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

export default EditModal

