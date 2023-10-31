import { toJS } from 'mobx'
import React, { useState, useRef, useEffect } from 'react'

import { get, omit } from 'lodash'
import { Modal } from 'components/Base'
import { Form, Input, Select, TextArea, Button, Checkbox } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'

import styles from './index.scss'

const RegistModal = (props) => {

  const detailInfo = toJS(props.store.detail.nodes).find(item => get(item, 'name') === props.store.detail.name) 

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = () => {
    const onOk  = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      const target_array = []
      data.TargetIp?.map((el, idx) => {
        if (el != '') {
          target_array.push(data.TargetIp[idx])
        }
      })

      data.target_ip_array = target_array 
      console.log("data : "+ JSON.stringify(data))
      
      // onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const nextSystem = useRef(1);
  const [listSystem, setListSystem] = useState([1]);

  const handleSystem = {

    addColumn: () => {
      nextSystem.current += 1
      setListSystem(listSystem => [...listSystem, nextSystem.current]);

    },
    delColumn: (id) => {
      setListSystem(listSystem.filter((el) => el !== id));
    },
  }

  useEffect(() => {    
    if(detailInfo['redfish-exporter']['target'].length > 0){
      (detailInfo['redfish-exporter']['target']).map((obj, index) => {
        index > 0 ? handleSystem.addColumn() : "";
      })
    }
  }, [])

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

            <Form.Item
                label={t('IP')}
                rules={[{ required: true, message: t('IP을 입력해 주세요.') }]}
              >
              <Input
                name="ip"
                autoFocus={true}
                defaultValue={detailInfo.ip}
                disabled
              />   
            </Form.Item>

            <Form.Item label={t('Node Exporter')}>
              <Form.Group>
                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('Scrape Interval')}
                      >
                        <Input
                          name="nodeInterval"
                          placeholder={t('60')}
                          defaultValue={(detailInfo.nodeExporter.ScrapeInterval).replace('s','')}
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
                </Form.Item>
              </Form.Group>
            </Form.Item>

            <Form.Item label={t('Redfish Exporter')}>
              <Form.Group>
                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('Scrape Interval')}
                      >
                        <Input
                          name="refishInterval"
                          placeholder={t('60')}
                          defaultValue={(detailInfo['redfish-exporter']['ScrapeInterval']).replace('s','')}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item
                        label={t('Port')}
                      >
                        <Input
                          name="refishPort"
                          placeholder={t('9610')}
                          defaultValue={detailInfo['redfish-exporter']['port']}
                        />
                      </Form.Item>
                    </Column>
                  </Columns>
                </Form.Item>
              </Form.Group>
            </Form.Item>

            <Form.Item label={t('Redfish Exporter Target')}>
              <Form.Group >
                {listSystem.map((obj, idx) => (
                  <div className={styles.item} key={obj}>
                    <Form.Item>
                      <Input
                        name={`TargetIp.${obj}`}
                        placeholder={t('192.168.XX.XX:11000')}
                        style={{ maxWidth: 'none' }}
                        defaultValue={detailInfo['redfish-exporter']['target'].length > 0 ? detailInfo['redfish-exporter']['target'][idx] : ''}
                      />
                    </Form.Item>  
                    <Button
                      type="flat"
                      icon="trash"
                      className={styles.delete}
                      onClick={() => handleSystem.delColumn(obj)}
                    />
                  </div>
                ))}
                <div className="text-right">
                  <Button
                    className={styles.add}
                    onClick={handleSystem.addColumn}
                  >
                    추가
                  </Button>
                </div>

              </Form.Group>
            </Form.Item>

          </Form>
        </Modal>

    </>
  );
};

export default RegistModal

