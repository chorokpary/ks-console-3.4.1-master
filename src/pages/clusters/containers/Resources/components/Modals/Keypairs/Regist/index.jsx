import { get } from 'lodash'
import React, { useState, useRef } from 'react'

import { Form, Input, Select, TextArea, Button, Loading } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

const RegistModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = () => {
    const onOk  = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const [downloadBtnVisible, setDownloadBtnVisible] = useState(false); 
  const [loadingBar, setLoadingBar] = useState(false); 

  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState(""); 

  const createKeypair = () => {

    setLoadingBar(true);

    setTimeout(() => {
      let forge = require('node-forge');
      let keyPair = forge.pki.rsa.generateKeyPair(2048)

      let priveteKey = keyPair.privateKey
      let publicKey = keyPair.publicKey

      // const publicKeyToOpenSSH = forge.ssh.publicKeyToOpenSSH(publicKey, globals.user.email);
      const publicKeyToOpenSSH = forge.ssh.publicKeyToOpenSSH(publicKey);
      const privateKeyToOpenSSH = forge.ssh.privateKeyToOpenSSH(priveteKey);

      setPublicKey(publicKeyToOpenSSH)
      setPrivateKey(privateKeyToOpenSSH)

      // 신규키생성 버튼 클릭 후, 지문 & 공개 키 자동입력
      setDownloadBtnVisible(true); // 다운로드버튼 활성화
      setLoadingBar(false);
    }, 300);

  };

  const privateKeyDownload = () => {
    let fileName = 'Private_Key.txt';
    let output = privateKey;
    const element = document.createElement('a');
    const file = new Blob([output], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    element.click();
  }

  const publicKeyDownload = () => {
    let fileName = 'Public_Key.pub';
    let output = privateKey;
    const element = document.createElement('a');
    const file = new Blob([output], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    element.click();
  }

  return (
    <>  
        <Modal
          icon="pen"
          width={700}
          title={props.title}
          onOk={handleOk}
          onCancel={closeModal}
          visible={modelView}
        >
          <Form data={formData} ref={form}>
            
            <div className={styles.divwrap}>
              <div className={styles.div_left}>
                <Form.Item
                    label={t('RESOURCES_NAME')}
                    rules={[{ required: true, message: t('RESOURCES_KEYPAIR_EMPTY_DESC') }]}
                    desc={t('NAME_DESC')}
                  >
                  <Input
                    name="name"
                    autoFocus={true}
                    maxLength={63}
                    style={{ maxWidth: 'none' }}
                  />   
                </Form.Item>
              </div>
              <div className={styles.div_right}>
              <Form.Item>
                <div>
                  {downloadBtnVisible ? "" : <Button onClick={() => createKeypair()}>{t('RESOURCES_CREATE')}</Button> }
                  {!downloadBtnVisible ? "" : <Button onClick={() => publicKeyDownload()}>{t('RESOURCES_PUBLIC_KEY')}</Button> }
                  {!downloadBtnVisible ? "" : <Button onClick={() => privateKeyDownload()}>{t('RESOURCES_PRIVATE_KEY')}</Button> }
                </div>        
              </Form.Item>
              </div>
            </div>

            <Form.Item
              className={styles.textarea}
              label={t('RESOURCES_PUBLIC_KEY')}
              rules={[{ required: true, message: t('RESOURCES_PUBLIC_KEY_EMPTY_DESC') }]}
            >
              {loadingBar ? 
                <Loading spinning={loadingBar}>
                  <TextArea
                    name="publicKey"
                    rows="8"
                    defaultValue={publicKey}
                    readOnly
                  />
                </Loading>  
              : <TextArea
                    name="publicKey"
                    rows="8"
                    defaultValue={publicKey}
                    readOnly
                  />
              }
            </Form.Item>
            <Form.Item
              className={styles.textarea}
              label={t('RESOURCES_DESCRIPTION')}
              desc={t('DESCRIPTION_DESC')}
            >
              <TextArea
                name="description"
                maxLength={256}
                rows="1"    
                defaultValue=""       
              />
            </Form.Item>

          </Form>
        </Modal>

    </>
  );
};

export default RegistModal

