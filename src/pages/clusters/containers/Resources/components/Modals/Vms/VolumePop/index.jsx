import { get } from 'lodash'
import React, { useState, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, Loading } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

const VolumeModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
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

          <Form.Item label={t('')} >   
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                    <colgroup>
                        <col width="10%"/>
                        <col width="20%"/>
                        <col width="15%"/>
                        <col width="20%"/>
                        <col width="15%"/>
                        <col width="20%"/>
                      </colgroup>
                      <thead>
                        <tr>
                          <th><strong>이름</strong></th>
                          <th><strong>접근 모드</strong></th>
                          <th><strong>입력 소스</strong></th>
                          <th><strong>스토리지 클래스</strong></th>
                          <th><strong>용량</strong></th>
                          <th><strong>상태</strong></th>
                          <th><strong>Action</strong></th>
                      </tr>
                      </thead>
                      <tbody>
                          <tr>
                            <td>xxx</td>
                            <td>xxx</td>
                            <td>xxx</td>
                            <td>xxx</td>
                            <td>xxx</td>
                            <td>xxx</td>
                            <td>xxx</td>
                          </tr>           
                      </tbody>
                  </table> 
                </div>
            </div>               
            </Form.Item>
        

        </Form>
      </Modal>

    </>
  );
};

export default VolumeModal

