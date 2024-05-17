import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, Checkbox, TextArea, Button, Loading, Column, Columns } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'
import { ProjectSelect } from 'components/Inputs'
import classnames from 'classnames'

import { PATTERN_USER_NAME } from 'utils/constants'

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
  const [cryptoType, setCryptoType] = useState("RSA"); // Default crypto type
  const [isEditable, setIsEditable] = useState(false);

  const cryptoOptions = [
      { label: 'RSA', value: 'RSA', },
      { label: 'ECDSA', value: 'ECDSA', },
      { label: 'ED25519', value: 'ED25519', },
  ]

  const initKeypair = async () => {
    setDownloadBtnVisible(false); // deactivate download button
    setPrivateKeyDownFlag(false); // deactivate confirmation button
    setPublicKey("");
    setPrivateKey("");
    const { data } = form.current.props;
    data.publicKey = "";
  };

  const togglePublicKeyEditable = async () => {
    setIsEditable(!isEditable);
    setPrivateKeyDownFlag(!isEditable);
  };

  const createKeypair = async () => {
    let valid = false;
    await validCreate().then(res => {
      if (res) valid = true
    })

    if (valid) {
      setLoadingBar(true);

      setTimeout(() => {
        let forge = require('node-forge');
        let sshpk = require('sshpk');

	// Specify the curve
        const curve = 'nistp521'; // You can use 'nistp256', 'nistp384', or 'nistp521'

	let publicKeyToOpenSSH;
	let privateKeyToOpenSSH;

        const { data } = form.current.props;
	const crypto = data['crypto'];

	if (crypto === "RSA") {
	  let keyPair = forge.pki.rsa.generateKeyPair(2048)
          let priveteKey = keyPair.privateKey
          let publicKey = keyPair.publicKey
          publicKeyToOpenSSH = forge.ssh.publicKeyToOpenSSH(publicKey);
	  privateKeyToOpenSSH = forge.ssh.privateKeyToOpenSSH(priveteKey);
        } else if (crypto === "ECDSA") {
	  let keyPair = sshpk.generatePrivateKey('ecdsa', { curve });
	  publicKeyToOpenSSH = keyPair.toPublic() + " ";
	  privateKeyToOpenSSH = keyPair.toString('openssh');
	} else if (crypto === "ED25519") {
          let keyPair = sshpk.generatePrivateKey('ed25519');
          publicKeyToOpenSSH = keyPair.toPublic().toString('ssh') + " ";
          privateKeyToOpenSSH = keyPair.toString('ssh');
        }

        let refinedPublicKey = publicKeyToOpenSSH + globals.user.username + "@" + "petasus"

        setPublicKey(refinedPublicKey)
        setPrivateKey(privateKeyToOpenSSH)

        data.publicKey = refinedPublicKey

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

    let fileName = `${globals.user.username}-${keypairName}-${cryptoType.toLowerCase()}-key.txt`;
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

    let fileName = `${globals.user.username}-${keypairName}-${cryptoType.toLowerCase()}-key.pub`;
    let output = publicKey;
    const element = document.createElement('a');
    const file = new Blob([output], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    element.click();
  }

  const fnGetModalFooter = () => {

    let elements = "";
    elements =
      <>

        <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button>
        {!privateKeyDownFlag ?
          <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} disabled>{t('RESOURCES_CONFIRM')}</Button>
          :
          <Button onClick={() => { handleOk() }} 
            className={classnames(styles['btn'], styles['btn-control'])} 
            loading={props.store.isSubmitting}
            disabled={props.store.isSubmitting}
          >{t('RESOURCES_CONFIRM')}
          </Button>
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
            <Form.Item>
              <Columns>
                <Column>
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
	    </Form.Item>
	    <Form.Item>
	      <Columns>
	        <Column>
	          <Form.Item
                    label={t('RESOURCES_CRYPTO_METHOD')}
                    desc={t('RESOURCES_SELECT_CRYPTO_METHOD_DESC')}
                    rules={[{ required: true, message: 'RESOURCES_CRYPTO_METHOD_NOT_SELECT_DESC' }]}
                  >
                    <Select
                      name="crypto"
                      defaultValue="RSA"
                      options={cryptoOptions}
                      onChange={(value) => setCryptoType(value)} />
                  </Form.Item>
	        </Column>
	        <Column>
                  <Form.Item
	            label={t('RESOURCES_KEY_GENERATION')}
	            desc={t('RESOURCES_STORE_PRIVATE_KEY_DESC')}
	            rules={[{ required: false }]}
	          >
                    <div>
                      {downloadBtnVisible ? "" : <Button onClick={() => createKeypair()}>{t('RESOURCES_CREATE')}</Button>}
                      {!downloadBtnVisible ? "" : <Button onClick={() => publicKeyDownload()}>{t('RESOURCES_PUBLIC_KEY')}</Button>}
                      {!downloadBtnVisible ? "" : <Button onClick={() => privateKeyDownload()}>{t('RESOURCES_PRIVATE_KEY')}</Button>}
                      {!downloadBtnVisible ? "" : <Button onClick={() => initKeypair()}>{t('RESOURCES_KEY_INITIALIZE')}</Button>}
                    </div>
                  </Form.Item>
	        </Column>
	      </Columns>
	    </Form.Item>
	    <Form.Item>
              <Checkbox
                name="editable"
                value="Y"
                onClick={() => togglePublicKeyEditable()}
              >
                {t('RESOURCES_CUSTOMIZE_PUBLIC_KEY')}
              </Checkbox>
            </Form.Item>
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
                    readOnly={!isEditable}
                  />
                </Loading>
                : <TextArea
                  name="publicKey"
                  rows="8"
		  readOnly={!isEditable}
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

