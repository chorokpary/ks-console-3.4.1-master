import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Column, Columns } from '@kube-design/components'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'

const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;

const RegistModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [cpuType, setCpuType] = useState('ARM')
  const [registryUrl, setRegistryUrl] = useState('')

  const [userName, setPropsUserName] = useState('')
  const [userPassword, setPropsUserPassword] = useState('')

  const [harborValid, setHarborValid] = useState(false)
  const [userValidError, setUserValidError] = useState(false)
  const [harborValidError, setHarborValidError] = useState(false)
  const [harborUrl, setHarborUrl] = useState('')
  const [harborAuth, setHarborAuth] = useState('')

  const cpuTypeOptions = [
  { label: t('ARM'), value: "ARM", },
  { label: t('x86'), value: "x86", }
]

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

  const checkUserValid = async () => {
    // let index = registryUrl.lastIndexOf('api/v2.0/') + 9
    // let url = registryUrl.substring(0, index) + 'users'
    let userAuth = Base64.encode(`${userName}:${userPassword}`)

    await request.post(`customharbor/users`, {
      auth: userAuth
    })
      .then(res => {
        Notify.success({ content: t('RESOURCES_SUCCESS_VALID_DESC') })
        setHarborValid(true)
        setHarborValidError(false)
        setUserValidError(false)

        setHarborAuth(userAuth)
        setHarborUrl(registryUrl)
        setPropsUserName(userName)
        setPropsUserPassword(userPassword)
      })
      .catch(err => {
        setHarborValid(false)
        setUserValidError(true)
        setTagList([])
        setImageName('')
        setTag('')
      })

  }



  const nameValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_NAME_EMPTY_DESC') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('RESOURCES_NAME_EMPTY_DESC') })
      }
    }
    callback()
  }

  const tagValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_TAG_EMPTY_DESC') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('RESOURCES_TAG_EMPTY_DESC') })
      }
    }
    callback()
  }

  const osValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_OS_INFORMATION_EMPTY_DESC') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('RESOURCES_OS_INFORMATION_EMPTY_DESC') })
      }
    }
    callback()
  }


  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      >
        <Form data={formData} ref={form}>

          <Form.Item
            label={t('RESOURCES_NAME')}
            rules={[{ required: true, validator: nameValidator }]}
            desc={t('NAME_DESC')}
          >
            <Input
              name="name"
              autoFocus={true}
              maxLength={63}
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

          <Form.Item
            label={t('RESOURCES_CPU_TYPE')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <RadioGroup
              name="is_realtime"
              wrapClassName="radio"
              defaultValue={cpuType}
              onChange={value => setCpuType(value)}
            >
              {cpuTypeOptions.map(option => (
                <RadioButton key={option.value} value={option.value}>
                  {option.label}
                </RadioButton>
              ))}
            </RadioGroup>
          </Form.Item>

          <Form.Item
            label={t('태그')}
            rules={[{ required: true, validator: tagValidator }]}
            desc={t('RESOURCES_TAG_DESC')}
          >
            <Input
              name="tag"
              maxLength={63}
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

          <Form.Item
            label={t('OS 정보')}
            rules={[{ required: true, validator: osValidator }]}
            desc={t('RESOURCES_OS_DESC')}
          >
            <Input
              name="os"
              maxLength={63}
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

          <Form.Item>     
          <>
            Harbor URL<span className="form-item-required">*</span>
            <div className={styles.content_box_wrap}>
              <div className={styles.cont_box_section}>
                  <div className={styles.cont_box_wrap}>

                    <div className={styles.regi_group_area}>
                      <div className={styles.formarea}>
                        <div className={classnames(styles.custom_input, styles.w_1)}>
                          <label>Registry URL</label>
                          <input type="text" placeholder={'http://{url}/api/v2.0/projects/{project_name}/repositories'} defaultValue={registryUrl} onChange={(e) => setRegistryUrl(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.regi_group_area}>
                      <div className={styles.formarea}>
                        <div className={styles.custom_input}>
                          <label>{t('RESOURCES_USER_NAME')}</label>
                          <input type="text" name="username" defaultValue={userName} onChange={(e) => setUserName(e.target.value)} />
                        </div>
                        <div className={styles.custom_input}>
                          <label>{t('RESOURCES_PASSWORD')}</label>
                          <input type="password" name="password" defaultValue={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                        </div>
                        <button type="button" className={classnames(styles.btn, styles.btn_control)} onClick={() => checkUserValid()}>{t('RESOURCES_VALID')}</button>
                      </div>
                    </div>

                    {userValidError &&
                      <div className="form-item-error" style={{ color: '#ca2621' }}>{t('RESOURCES_FAIL_VALID_TIP')}</div>
                    }

                  </div>
              </div>           
            </div>      
          </>
          </Form.Item>      

          <Form.Item>     
          <>
            {t('RESOURCES_IMAGE_FILE_UPLOAD')}<span className="form-item-required">*</span>   
          </>
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

