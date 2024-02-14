import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Tooltip, Column, Columns, Radio, Checkbox } from '@kube-design/components'

import { Modal } from 'components/Base'
import TypeSelect from '../../../TypeSelect'

import classnames from 'classnames'
import styles from './index.scss'

const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;

const RegistModal = (props) => {
  // const detail = props.detail;
  const form = useRef();
  const [formData, setFormData] = useState({});
  const [modelView, setModalView] = useState(true);
  const [operator, setOperator] = useState('')

  const closeModal = () => {
    setModalView(false);
  }

  const operatorOptions = [
    {
      label: 'Open AI',
      description: 'Open AI 엔진 기반으로 분석합니다.',
      icon: `ico-type24-solution`,
      value: 'openai',
    },
    {
      label: 'Local AI',
      description: 'Local AI 엔진 기반으로 분석합니다.',
      icon: `ico-type24-solution`,
      value: 'localai',
    }
  ]

  const nameValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_NAME_EMPTY_DESC') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('RESOURCES_NAME_CHECK_DESC') })
      }
    }
    callback()
  }

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      onOk(data)
    })
  }

  return (
    <>
      <Modal
        icon="cluster"
        width={1000}
        minHeight={1000}
        title={props.title}
        visible={modelView}
        onOk={handleOk}
        onCancel={closeModal}
      >
        <Form data={formData} ref={form}>

          {/* 이름 */}
          <Form.Item
            label={t('이름')}
            rules={[
              {
                required: true,
                validator: nameValidator
              },
            ]}
            desc={t('NAME_DESC')}
          >
            <Input name="name" maxLength={63}
              style={{ maxWidth: 'none' }} />
          </Form.Item>

          {/* Operator 설정 */}
          <Form.Item
            label={t('Operator 설정')}
            rules={[{ required: true, message: t('Operator를 선택해주세요.') },]}
          >
            <TypeSelect
              name="operator"
              defaultValue={operator}
              onChange={(e) => setOperator(e)}
              placeholder={{
                label: t('선택')
              }}
              defaultDescription={t('분석 엔진을 선택합니다.')}
              options={operatorOptions}
            />
          </Form.Item>

          {/* 모델 */}
          <Form.Item
            label={t('모델')}
            desc={t('모델 입력 최대 길이는 63자입니다.')}
            rules={[{ required: true, message: t('모델을 입력해주세요.') },]}
          >
            <TextArea
              style={{ maxWidth: 'none' }}
              name="model"
              maxLength={63}
            />
          </Form.Item>


          {/* 세부 설정 */}
          {operator !== '' &&
            <Form.Item
              label={t('세부 설정')}
            >
              <Form.Group>
                {/* open ai - secret key */}
                {operator === 'openai' &&
                  <Form.Item label={t('Secret Key')}
                    rules={[{ required: true, message: t('Secret Key를 입력해주세요.') },]}>
                    <TextArea
                      style={{ maxWidth: 'none' }}
                      name="secret"
                      maxLength={256}
                    />
                  </Form.Item>
                }

                {/* local ai - base url */}
                {operator === 'localai' &&
                  <Form.Item label={t('Base URL')}
                    rules={[{ required: true, message: t('Base URL을 입력해주세요.') },]}>
                    <TextArea
                      style={{ maxWidth: 'none' }}
                      name="baseurl"
                      maxLength={256}
                    />
                  </Form.Item>
                }
              </Form.Group>
            </Form.Item>
          }
        </Form>
      </Modal>

    </>
  );
};

export default RegistModal

