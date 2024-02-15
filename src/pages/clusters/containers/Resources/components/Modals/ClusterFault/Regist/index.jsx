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
      description: t('RESOURCES_CLUSTER_FAULT_MODAL_OPENAI_DESC'),
      icon: `ico-type24-solution`,
      value: 'openai',
    },
    {
      label: 'Local AI',
      description: t('RESOURCES_CLUSTER_FAULT_MODAL_LOCALAI_DESC'),
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
        okText={t('RESOURCES_CREATE')}
        visible={modelView}
        onOk={handleOk}
        onCancel={closeModal}
      >
        <Form data={formData} ref={form}>

          {/* 이름 */}
          <Form.Item
            label={t('RESOURCES_NAME')}
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
            label={t('RESOURCES_CLUSTER_FAULT_OPERATOR') + ' ' + t('RESOURCES_CLUSTER_FAULT_SET')}
            rules={[{ required: true, message: t('RESOURCES_CLUSTER_FAULT_MODAL_OPERATOR_MSG') },]}
          >
            <TypeSelect
              name="operator"
              defaultValue={operator}
              onChange={(e) => setOperator(e)}
              placeholder={{
                label: t('RESOURCES_SELECT')
              }}
              defaultDescription={t('RESOURCES_CLUSTER_FAULT_MODAL_OPERATOR_DESC')}
              options={operatorOptions}
            />
          </Form.Item>

          {/* 모델 */}
          <Form.Item
            label={t('RESOURCES_CLUSTER_FAULT_MODAL_MODEL')}
            desc={t('RESOURCES_CLUSTER_FAULT_MODAL_MODEL_DSEC')}
            rules={[{ required: true, message: t('RESOURCES_CLUSTER_FAULT_MODAL_MODEL_MSG') },]}
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
              label={t('RESOURCES_DETAIL_SETTINGS')}
            >
              <Form.Group>
                {/* open ai - secret key */}
                {operator === 'openai' &&
                  <Form.Item label={t('RESOURCES_CLUSTER_FAULT_SECRETKEY')}
                    rules={[{ required: true, message: t('RESOURCES_CLUSTER_FAULT_SECRETKEY_MSG') },]}>
                    <TextArea
                      style={{ maxWidth: 'none' }}
                      name="secret"
                      maxLength={256}
                    />
                  </Form.Item>
                }

                {/* local ai - base url */}
                {operator === 'localai' &&
                  <Form.Item label={t('RESOURCES_CLUSTER_FAULT_BASEURL')}
                    rules={[{ required: true, message: t('RESOURCES_CLUSTER_FAULT_BASEURL_MSG') },]}>
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

