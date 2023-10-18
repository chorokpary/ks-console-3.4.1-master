import { toJS } from 'mobx'
import React, { useState, useRef } from 'react'

import { get, omit } from 'lodash'
import { Modal } from 'components/Base'
import { Form, Input, Select, TextArea, Button, Checkbox } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'

import styles from './index.scss'

const RegistModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = () => {
    const onOk  = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      const system_array = []
      data.NodeIp?.map((el, idx) => {
        if (el != '') {
          system_array.push({ ip: el, node_name: data.NodeName[idx] })
        }
      })

      data.system_data = system_array 
      console.log("data : "+ JSON.stringify(data))
      
      onOk({ ...data })
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

  return (
    <>  
        <Modal
          icon="pen"
          width={960}
          title={props.title}
          onOk={handleOk}
          onCancel={closeModal}
          visible={modelView}
        >
          <Form data={formData} ref={form}>
            
            <div className={styles.divwrap}>
              <div className={styles.div_top}>시스템 정보 입력</div>
              <div className={styles.div_bottom}>등록 하려는 시스템의 IP, 노드명 정보를 입력해주세요.</div>
            </div>

            <Form.Group>
              {listSystem.map((obj, idx) => (
                <div className={styles.item} key={obj}>
                  <Columns>
                    <Column>
                      <Form.Item>
                        <Input
                          name={`NodeIp.${obj}`}
                          placeholder={t('IP')}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item>
                        <Input
                          name={`NodeName.${obj}`}
                          placeholder={t('노드명')}
                        />
                      </Form.Item>
                    </Column>
                  </Columns>
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




          </Form>
        </Modal>

    </>
  );
};

export default RegistModal

