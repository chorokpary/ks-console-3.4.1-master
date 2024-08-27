import React, { useState, useRef } from 'react'

import { Form, Input, TextArea, Button } from '@kube-design/components'
import {
  RadioButton,
  RadioGroup,
} from '@kube-design/components/lib/components/Radio'
import { Modal } from 'components/Base'

import classnames from 'classnames'

import { PATTERN_USER_NAME } from 'utils/constants'
import styles from './index.scss'

const RegistModal = props => {
  const form = useRef()
  const [modelView, setModalView] = useState(true)
  const [formData, setFormData] = useState({})

  const [cpuType, setCpuType] = useState('ARM')

  const [registryUrl, setRegistryUrl] = useState('')
  const [userName, setUserName] = useState('')
  const [userPassword, setUserPassword] = useState('')

  const [harborValid, setHarborValid] = useState(false)

  const [userValid, setUserValid] = useState(false)
  const [userValidError, setUserValidError] = useState(false)
  const [userValidCheck, setuserValidCheck] = useState(false)
  const [userValidCheckError, setUserValidCheckError] = useState(false)

  const [userValidSuccess, setUserValidSuccess] = useState(false)

  const cpuTypeOptions = [
    { label: t('ARM'), value: 'ARM' },
    { label: t('x86'), value: 'x86' },
  ]

  const handleOk = () => {
    const onOk = props.onOk

    form.current.validator(() => {
      const { data } = form.current.props

      data.registUrl = registryUrl
      data.user = userName
      data.password = userPassword

      if (!!registryUrl && !!userName && !!userPassword) {
        setHarborValid(false)
      } else {
        setHarborValid(true)
        return false
      }

      if (!userValidCheck) {
        setUserValidCheckError(true)
        setUserValidError(false)
        return false
      }

      if (!userValid) {
        return false
      }

      // console.log("data : "+ JSON.stringify(data))
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  const checkUserValid = async () => {
    const userAuth = Base64.encode(`${userName}:${userPassword}`)

    const originUrl = new URL(registryUrl)
    await request
      .post(`customharbor/build`, {
        auth: userAuth,
        originUrl: originUrl.origin,
      })
      .then(res => {
        Notify.success({ content: t('RESOURCES_SUCCESS_VALID_DESC') })
        setuserValidCheck(true)
        setUserValidCheckError(false)
        setUserValid(true)
        setUserValidError(false)
      })
      .catch(err => {
        if (err.status) {
          // 유효하지 않음
          setuserValidCheck(false)
          setUserValidCheckError(false)
          setUserValid(false)
          setUserValidError(true)

          setUserValidSuccess(false)
        } else {
          // 유효함
          setuserValidCheck(true)
          setUserValidCheckError(false)
          setUserValid(true)
          setUserValidError(false)

          setUserValidSuccess(true)
        }
      })
  }

  const tagValidator = (rule, value, callback) => {
    if (value === undefined) {
      return callback({ message: t('RESOURCES_TAG_EMPTY_DESC') })
    }
    callback()
  }

  const osValidator = (rule, value, callback) => {
    if (value === undefined) {
      return callback({ message: t('RESOURCES_OS_INFORMATION_EMPTY_DESC') })
    }
    callback()
  }

  const fnGetModalFooter = () => {
    let elements = ''
    elements = (
      <>
        <Button
          onClick={() => closeModal()}
          className={classnames(styles['btn'], styles['btn-default'])}
        >
          {t('RESOURCES_CANCEL')}
        </Button>
        {props.isSubmitting ? (
          <Button
            onClick={() => {
              handleOk()
            }}
            className={classnames(styles['btn'], styles['btn-control'])}
            loading={props.store.isSubmitting}
            disabled={props.store.isSubmitting}
          >
            {t('RESOURCES_CREATE')}
          </Button>
        ) : (
          <Button
            onClick={() => {
              handleOk()
            }}
            className={classnames(styles['btn'], styles['btn-control'])}
          >
            {t('RESOURCES_CREATE')}
          </Button>
        )}
      </>
    )

    return elements
  }

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form}>
          <div className={styles.cont_boxwrap}>
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

            <Form.Item
              label={t('RESOURCES_CPU_TYPE')}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <RadioGroup
                name="cpuType"
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
              label={t('RESOURCES_TAG')}
              rules={[{ required: true, validator: tagValidator }]}
              desc={t('RESOURCES_TAG_DESC')}
            >
              <Input name="tag" maxLength={63} style={{ maxWidth: 'none' }} />
            </Form.Item>

            <Form.Item
              label={t('RESOURCES_OS_INFORMATION')}
              rules={[{ required: true, validator: osValidator }]}
              desc={t('RESOURCES_OS_DESC')}
            >
              <Input name="os" maxLength={63} style={{ maxWidth: 'none' }} />
            </Form.Item>

            <Form.Item>
              <>
                Harbor URL<span className="form-item-required">*</span>
                <div className={styles.content_box_wrap}>
                  <div className={styles.cont_box_section}>
                    <div className={styles.cont_box_wrap}>
                      <div className={styles.regi_group_area}>
                        <div className={styles.formarea}>
                          <div
                            className={classnames(
                              styles.custom_input,
                              styles.w_1
                            )}
                          >
                            <label>Registry URL</label>
                            <input
                              type="text"
                              placeholder={
                                'http://{url}/api/v2.0/projects/{project_name}/repositories'
                              }
                              defaultValue={registryUrl}
                              onChange={e => setRegistryUrl(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.regi_group_area}>
                        <div className={styles.formarea}>
                          <div className={styles.custom_input}>
                            <label>{t('RESOURCES_USER_NAME')}</label>
                            <input
                              type="text"
                              name="username"
                              defaultValue={userName}
                              onChange={e => setUserName(e.target.value)}
                            />
                          </div>
                          <div className={styles.custom_input}>
                            <label>{t('RESOURCES_PASSWORD')}</label>
                            <input
                              type="password"
                              name="password"
                              defaultValue={userPassword}
                              onChange={e => setUserPassword(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className={classnames(
                              styles.btn,
                              styles.btn_control
                            )}
                            onClick={() => checkUserValid()}
                          >
                            {t('RESOURCES_VALID')}
                          </button>
                        </div>
                      </div>

                      {/* //Harbor URL 정보를 입력해 주세요. */}
                      {harborValid && (
                        <div
                          className="form-item-error"
                          style={{ color: '#ca2621' }}
                        >
                          {t('RESOURCES_HARBOR_VALID_TIP')}
                        </div>
                      )}
                      {/* //유효성을 체크해주세요.. */}
                      {userValidCheckError && (
                        <div
                          className="form-item-error"
                          style={{ color: '#ca2621' }}
                        >
                          {t('RESOURCES_VALID_TIP')}
                        </div>
                      )}
                      {/* //유효하지 않은 사용자 입니다. */}
                      {userValidError && (
                        <div
                          className="form-item-error"
                          style={{ color: '#ca2621' }}
                        >
                          {t('RESOURCES_FAIL_VALID_TIP')}
                        </div>
                      )}
                      {/* //유효성 체크가 완료 되었습니다. */}
                      {userValidSuccess && (
                        <div
                          className="form-item-error"
                          style={{ color: '#55bc8a' }}
                        >
                          {t('RESOURCES_SUCCESS_VALID_DESC')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
          </div>

          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  )
}

export default RegistModal
