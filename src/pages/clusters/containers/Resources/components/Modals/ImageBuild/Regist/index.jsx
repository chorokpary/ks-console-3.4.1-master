import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Column, Columns, Icon } from '@kube-design/components'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'
import * as common from "utils/resources"

import { PATTERN_NAME } from 'utils/constants'


const RegistModal = (props) => {

  console.log("props.isSubmitting  : " + props.isSubmitting)

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [cpuType, setCpuType] = useState('ARM')

  const [registryUrl, setRegistryUrl] = useState('ntels.harbor.core/arm-cmp/test-image:latest')
  const [userName, setUserName] = useState('admin')
  const [userPassword, setUserPassword] = useState('gozldqkdwl2')

  const [harborValid, setHarborValid] = useState(false)
  
  const [userValid, setUserValid] = useState(false)
  const [userValidError, setUserValidError] = useState(false)
  const [userValidCheck, setuserValidCheck] = useState(false)
  const [userValidCheckError, setUserValidCheckError] = useState(false)

  const cpuTypeOptions = [
  { label: t('ARM'), value: "ARM", },
  { label: t('x86'), value: "x86", }
]

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      data.registUrl = registryUrl;
      data.user = userName;
      data.password = userPassword;

      if(!!registryUrl && !!userName && !!userPassword){
        console.log("정보 입력 완료")
        setHarborValid(false);        
      }else{
        console.log("정보 입력 미완료")
        setHarborValid(true);
        return false;
      }

      if(!userValidCheck){
        console.log("유효성 체크하지 않음!!")
        setUserValidCheckError(true);
        setUserValidError(false);
        return false;
      }

      if(!userValid){
        console.log("유효하지 않음!!")
        return false;
      }

      // console.log("data : "+ JSON.stringify(data))
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const checkUserValid = async () => {

    let userAuth = Base64.encode(`${userName}:${userPassword}`)

    await request.post(`customharbor/build`, {
      auth: userAuth
    }).then(res => {
        Notify.success({ content: t('RESOURCES_SUCCESS_VALID_DESC') })
        console.log("SSSSSSSSSSSSSSSSS") 
        setuserValidCheck(true);
        setUserValidCheckError(false);
        setUserValid(true);
        setUserValidError(false);
      }).catch(err => {

        console.log("err.status : "+ JSON.stringify(err.status))

        if(!!err.status){
          //유효하지 않음
          console.log("AAAAAAAAAAAAAAA")
          setuserValidCheck(false);
          setUserValidCheckError(false);
          setUserValid(false);
          setUserValidError(true);
        }else{
          //유효함
          console.log("BBBBBBBBBBBBBBB")
          setuserValidCheck(true);
          setUserValidCheckError(false);
          setUserValid(true);
          setUserValidError(false);
        }          
      })
  }

  const tagValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_TAG_EMPTY_DESC') })
    } 
    callback()
  }

  const osValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_OS_INFORMATION_EMPTY_DESC') })
    } 
    callback()
  }

  const fnGetModalFooter = () => {

    let elements = "";
    elements =
      <>
      
          <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button>
          {props.isSubmitting ?
            <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} disabled loading={true}>{t('RESOURCES_CREATE')}</Button>
            :
            <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} >{t('RESOURCES_CREATE')}</Button>
          }

      </>

    return elements;
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

                      {/* //Harbor URL 정보를 입력해 주세요. */}
                      {harborValid &&
                        <div className="form-item-error" style={{ color: '#ca2621' }}>{t('RESOURCES_HARBOR_VALID_TIP')}</div>
                      }
                      {/* //유효성을 체크해주세요.. */}
                      {userValidCheckError &&
                        <div className="form-item-error" style={{ color: '#ca2621' }}>{t('RESOURCES_VALID_TIP')}</div>
                      }
                      {/* //유효하지 않은 사용자 입니다. */}
                      {userValidError &&
                        <div className="form-item-error" style={{ color: '#ca2621' }}>{t('RESOURCES_FAIL_VALID_TIP')}</div>
                      }                  
                      

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

          <div className={styles['modal-footer']}>
            {fnGetModalFooter()}
          </div>     

        </Form>
      </Modal>

    </>
  );
};

export default RegistModal

