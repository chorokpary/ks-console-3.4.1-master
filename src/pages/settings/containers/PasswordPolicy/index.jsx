import React, { Component, useState, useRef, useEffect } from 'react'
import { Panel, Text } from 'components/Base'
import Banner from 'components/Cards/Banner'

import styles from './index.scss'
import classnames from 'classnames'
import { Notify } from '@kube-design/components'

import { observer, inject } from 'mobx-react'
import {
  Form,
  Input,
  Select,
  Checkbox,
  TextArea,
  Button,
  Loading,
  Column,
  Columns,
  Icon,
  Tabs,
} from '@kube-design/components'

import PasswordPolicyStore from 'stores/passwordPolicy'

const PasswordPolicy = () => {
  
  const passwordPolicyStore = new PasswordPolicyStore()

  const form = useRef()
  const [formData, setFormData] = useState({})

  const { TabPanel } = Tabs
  const [passwordTab, setPasswordTab] = useState('policy')

  const [defaultValues, setDefaultValues] = useState();
  const [values, setValues] = useState();

  useEffect(() => {
    fetchPasswordPolicy()
  },[])

  const fetchPasswordPolicy = async () => {    
    const policyData = await passwordPolicyStore.getPasswordPolicy()
    setValues(policyData)
    setDefaultValues(policyData)
  }

  const handleChange = (name, val) => {
    setValues(prev => ({ ...prev, [name]: val }));
  };

  const restore = () => {
    const { data } = form.current.props

    setValues({ ...defaultValues });
    
    Object.keys(defaultValues).forEach(key => {
      data[key] = defaultValues[key];
    });

  }

  const handleOk = async () => {
    
    form.current.validator(async () => {
      const { data } = form.current.props;  

      const minLength  = Number(data.minLength ?? 8);
      const maxLength  = Number(data.maxLength ?? 64);
      const minUpper   = Number(data.uppercaseCount ?? 0);
      const minLower   = Number(data.lowercaseCount ?? 0);
      const minDigit   = Number(data.minNum ?? 0);
      const minSpecial = Number(data.special ?? 0);
      const specialSet = data.symbol ?? '';

      if(data.period === undefined){
        data.period = defaultValues.period
        data.notice = defaultValues.notice

        if(Number(value) > Number(period)){
          return false
        }
      }

      const rules = [];
      let ruleText = '';

      if (minDigit > 0) { rules.push(`숫자 ${minDigit}개 이상`); }
      if (minLower > 0) { rules.push(`소문자 ${minLower}개 이상`); }
      if (minUpper > 0) { rules.push(`대문자 ${minUpper}개 이상`); }
      if (minSpecial > 0) { rules.push(`특수 문자 ${minSpecial}개 이상(${specialSet})`);}
      if (rules.length > 0) { ruleText = `비밀번호에는 ${rules.join(', ')}이(가) 포함되어야 합니다. `; }

      const lengthText = `길이는 ${minLength}자에서 ${maxLength}자 사이여야 합니다.`;
      const errorText = ruleText + lengthText;
      
      data.errorMessage = errorText;      
      const result = await passwordPolicyStore.update(data)

      Notify.success({ content: t('RESOURCES_SAVE_SUCCESSFUL') })
      await fetchPasswordPolicy()
    });
  }

  return (
  <>
    <div>
      <Banner
        icon="ssh"
        title={t('RESOURCES_PASSWORD_POLICY_MANAGEMENT')}
        description={t('RESOURCES_PASSWORD_POLICY_DESC')}
      />
      <div className={styles.tabsContainer}>
        <Tabs
          type="button"
          activeName={passwordTab}
          onChange={newTab => {
            setPasswordTab(newTab)
          }}
        >
          <TabPanel key={1} label={t('RESOURCES_PASSWORD_POLICY')} name={'policy'} />
          <TabPanel key={2} label={t('RESOURCES_PASSWORD_PERIOD')} name={'period'} />
        </Tabs>
      </div>
      <Panel >
        <div className={styles.header}>
          <Text
            icon="ssh"
            title={passwordTab == "policy" ? t('RESOURCES_PASSWORD_POLICY') : t('RESOURCES_PASSWORD_PERIOD')}
            description={passwordTab == "policy" ? t('RESOURCES_PASSWORD_POLICY_DESC') : t('RESOURCES_PASSWORD_PERIOD_DESC')}
          />
        </div>
        <div className={styles.content}>
          <Form data={formData} ref={form}>
            <Panel title={passwordTab == "policy" ? t('RESOURCES_PASSWORD_POLICY_SETTING') : t('RESOURCES_PASSWORD_PERIOD_SETTING')} className={styles.passwordPanel}>
                
              {passwordTab == "policy" && (
                <>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_PASSWORD_POLICY_SETTING_MIN_LENGTH')}
                      rules={[{ required: true, message: t('RESOURCES_NUMBER_EMPTY_DESC') }]}
                    >
                      <Input 
                        type="number" 
                        name="minLength" 
                        maxLength={10} 
                        style={{ maxWidth: 'none' }} 
                        defaultValue={values?.minLength}
                        onChange={(val) => handleChange('minLength', val)}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                        label={t('RESOURCES_PASSWORD_POLICY_SETTING_MAX_LENGTH')}
                        rules={[{ required: true, message: t('RESOURCES_NUMBER_EMPTY_DESC') }]}
                      >
                        <Input 
                          type="number" 
                          name="maxLength" 
                          maxLength={10} 
                          style={{ maxWidth: 'none' }} 
                          defaultValue={values?.maxLength}
                          onChange={(val) => handleChange('maxLength', val)}
                        />
                      </Form.Item>
                  </Column>
                </Columns>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_PASSWORD_POLICY_SETTING_UPPERCASE_MIN_COUNT')}
                      rules={[{ required: true, message: t('RESOURCES_NUMBER_EMPTY_DESC') }]}
                    >
                      <Input 
                        type="number" 
                        name="uppercaseCount" 
                        maxLength={10} 
                        style={{ maxWidth: 'none' }} 
                        defaultValue={values?.uppercaseCount}
                        onChange={(val) => handleChange('uppercaseCount', val)}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_PASSWORD_POLICY_SETTING_LOWERCASE_MIN_COUNT')}
                      rules={[{ required: true, message: t('RESOURCES_NUMBER_EMPTY_DESC') }]}
                    >
                    <Input 
                      type="number" 
                      name="lowercaseCount" 
                      maxLength={10} 
                      style={{ maxWidth: 'none' }} 
                      defaultValue={values?.lowercaseCount}
                      onChange={(val) => handleChange('lowercaseCount', val)}  
                    />
                    </Form.Item>
                  </Column>
                </Columns>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_PASSWORD_POLICY_SETTING_NUMBER_MIN_COUNT')}
                      rules={[{ required: true, message: t('RESOURCES_NUMBER_EMPTY_DESC') }]}
                    >
                      <Input 
                        type="number" 
                        name="minNum" 
                        maxLength={10} 
                        style={{ maxWidth: 'none' }} 
                        defaultValue={values?.minNum}
                        onChange={(val) => handleChange('minNum', val)}
                        />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_PASSWORD_POLICY_SETTING_SPECIAL_CHARACTER_MIN_COUNT')}
                      rules={[{ required: true, message: t('RESOURCES_NUMBER_EMPTY_DESC') }]}
                    >
                    <Input 
                      type="number" 
                      name="special" 
                      maxLength={10} 
                      style={{ maxWidth: 'none' }} 
                      defaultValue={values?.special}
                      onChange={(val) => handleChange('special', val)}
                    />
                    </Form.Item>
                  </Column>
                </Columns>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_PASSWORD_POLICY_SETTING_SYMBOL_CHARACTER_SET')}
                      rules={[{ required: true, message: t('RESOURCES_PASSWORD_POLICY_SETTING_SYMBOL_CHARACTER_SET_TIP') }]}
                    >
                      <Input 
                        name="symbol" 
                        maxLength={100} 
                        style={{ maxWidth: 'none' }} 
                        defaultValue={values?.symbol}
                        onChange={(val) => handleChange('symbol', val)}
                      />
                    </Form.Item>
                    <div style={{ padding: '5px 0 12px' }}></div>
                  </Column>
                  <Column>
                  </Column>
                </Columns>
                </>
                )}

                {passwordTab == "period" && 
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('RESOURCES_PASSWORD_PERIOD_SETTING_MAXIMUM_AGE')}
                        rules={[
                          { 
                            required: true, 
                            message: t('RESOURCES_PASSWORD_PERIOD_SETTING_MAXIMUM_AGE_TIP') 
                          },
                          {
                            validator: (_, value) => {
                              if (Number(value) <= 0) {
                                return Promise.reject('1 이상만 입력 가능합니다.')
                              }
                              return Promise.resolve()
                            },
                          },
                        ]}
                      >
                        <Input 
                          type="number"
                          name="period" 
                          maxLength={63} 
                          style={{ maxWidth: 'none' }} 
                          defaultValue={values?.period || 10}
                          onChange={(val) => {
                            handleChange('period', val)
                            form.current?.validate('notice')
                          }}
                        />
                      </Form.Item>
                      <div style={{ padding: '5px 0 12px' }}>{t('RESOURCES_PASSWORD_PERIOD_SETTING_DESC')}</div>
                    </Column>
                    <Column>      
                      <Form.Item
                        key={`notice-${values.period}`}
                        label={t('RESOURCES_PASSWORD_PERIOD_SETTING_NOTI_DAY')}
                        rules={[
                          { 
                            required: true, 
                            message: t('RESOURCES_PASSWORD_PERIOD_SETTING_NOTI_DAY_TIP') 
                          },
                          {
                            validator: (_, value) => {                              
                              const formRef = form.current
                              const period = formRef.props.data.period

                              if (value == null || period == null) return Promise.resolve()

                              if (Number(value) > Number(period)) {
                                return Promise.reject(t('NOTICE_DAY_MUST_BE_LESS_THAN_PERIOD'))
                              }

                              const errors = formRef?.state?.errors
                              if (errors?.length) {
                                formRef.setState({
                                  errors: errors.filter(e => e.field !== 'notice')
                                })
                              }
                              return Promise.resolve()                                                        
                            },
                          },
                          ]}
                      >
                        <Input 
                          type="number"
                          min={1}
                          name="notice" 
                          maxLength={63} 
                          style={{ maxWidth: 'none' }} 
                          defaultValue={values?.notice || 7}
                          onChange={(val) => handleChange('notice', val)}  
                        />
                      </Form.Item>                
                    </Column>
                  </Columns>
                }
            </Panel>    
          </Form> 
        </div>
        <div className={styles.buttonContainer}>
          <Button
              onClick={() => restore()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PASSWORD_ORIGINALLY')}
            </Button>
            <Button
              onClick={() => {
                handleOk()
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_SAVE')}
            </Button>
        </div>
      </Panel>
     
    </div>
    </>
  )  
}
export default inject('rootStore')(observer(PasswordPolicy))

