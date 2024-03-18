import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Column, Columns } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'
import { ProjectSelect } from 'components/Inputs'

import { PATTERN_NAME } from 'utils/constants'

import classnames from 'classnames'

const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;

const RegistModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [privateKeyDownFlag, setPrivateKeyDownFlag] = useState(false);
  
  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      data.project = projectName
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
  const [projectName, setProjectName] = useState(props.namespace ? props.namespace : 'default');

  const createKeypair = async () => {
    let valid = false;
    await validCreate().then(res => {
      if (res) valid = true
    })

    if (valid) {
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
    }
  };

  const validCreate = async () => {
    // 이름과 프로젝트명을 입력해야만 공개키 생성되도록
    await form.current.validator()
    form.current.resetValidateResults("publicKey");
    if (form.current.state.errors.length == 0) {
      return true
    }
    return false
  }

  const privateKeyDownload = () => {
    const { data } = form.current.props;
    const keypairName = data['name'];

    let fileName = `${globals.user.username}-${keypairName}-rsa-key.txt`;
    let output = privateKey;
    const element = document.createElement('a');
    const file = new Blob([output], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    element.click();

    setPrivateKeyDownFlag(true);
  }

  const publicKeyDownload = () => {
    const { data } = form.current.props;
    const keypairName = data['name'];

    let fileName = `${globals.user.username}-${keypairName}-rsa-key.pub`;
    let output = privateKey;
    const element = document.createElement('a');
    const file = new Blob([output], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    element.click();
  }

  const nameValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_KEYPAIR_EMPTY_DESC') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('RESOURCES_NAME_CHECK_DESC') })
      }
    }
    callback()
  }

  const fnGetModalFooter = () => {

    let elements = "";
    elements =
      <>
      
          <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button>
          {!privateKeyDownFlag ?
            <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} disabled>{t('RESOURCES_CONFIRM')}</Button>
            :
            <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} >{t('RESOURCES_CONFIRM')}</Button>
          }

      </>

    return elements;
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
        bodyClassName={styles.body}
        hideFooter
      >
        <Form data={formData} ref={form}>
        <div className={styles.cont_boxwrap}>

          <div className={styles.divwrap}>
            <div className={styles.div_left}>
              <Columns>
                <Column>
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
                      style={{ maxWidth: 'none' }}
                    />
                  </Form.Item>
                </Column>
                {!props.namespace && (
                  <Column>
                    <Form.Item
                      label={t('PROJECT')}
                      desc={t('SELECT_PROJECT_DESC')}
                      rules={[
                        { required: true, message: t('PROJECT_NOT_SELECT_DESC') },
                      ]}
                    >
                      <ProjectSelect
                        name="namespace"
                        defaultValue={projectName}
                        cluster={props.cluster}
                        onChange={(e) => setProjectName(e)}
                      />
                    </Form.Item>
                  </Column>
                )}
              </Columns>
            </div>
            <div className={styles.div_right}>
              <Form.Item>
                <div>
                  {downloadBtnVisible ? "" : <Button onClick={() => createKeypair()}>{t('RESOURCES_CREATE')}</Button>}
                  {!downloadBtnVisible ? "" : <Button onClick={() => publicKeyDownload()}>{t('RESOURCES_PUBLIC_KEY')}</Button>}
                  {!downloadBtnVisible ? "" : <Button onClick={() => privateKeyDownload()}>{t('RESOURCES_PRIVATE_KEY')}</Button>}
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

        </div>

        {/* Footer */}
        <div className={styles['modal-footer']}>
            {fnGetModalFooter()}
        </div>

        </Form>
      </Modal>

    </>
  );
};

export default RegistModal

