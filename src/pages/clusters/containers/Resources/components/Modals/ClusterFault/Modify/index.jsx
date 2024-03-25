import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Tooltip, Column, Columns, Radio, Checkbox } from '@kube-design/components'

import { Modal } from 'components/Base'
import TypeSelect from '../../../TypeSelect'

import classnames from 'classnames'
import styles from './index.scss'

import { PATTERN_USER_NAME } from 'utils/constants'

const ModifyModal = (props) => {

  // const detail = props.detail;
  const form = useRef();
  const [formData, setFormData] = useState({});
  const [modelView, setModalView] = useState(true);
  const [operator, setOperator] = useState(get(props.item, 'spec.ai.backend'))
  const [secretkey, setSecretkey] = useState('')

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {
    if (operator === 'openai') {
      getSecretKey()
    }
  }, [])

  const getSecretKey = async () => {
    let secretkey = await props.store.getSecretKey(get(props.item, 'metadata.name'))
    setSecretkey(secretkey)
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
  const localModelOptions = [
    {
      label: 'llama2',
      description: t('RESOURCES_CLUSTER_FAULT_LOCALMODEL_LLAMA2'),
      value: 'llama2',
    },
    {
      label: 'mixtral-8x7b',
      description: t('RESOURCES_CLUSTER_FAULT_LOCALMODEL_MIXTRAL'),
      value: 'mixtral-8x7b',
    }
  ]
  const openModelOptions = [
    {
      label: 'gpt-3.5',
      description: t('RESOURCES_CLUSTER_FAULT_LOCALMODEL_GPT3'),
      value: 'gpt-3.5',
    },
    {
      label: 'gpt-3.5-turbo',
      description: t('RESOURCES_CLUSTER_FAULT_LOCALMODEL_GPT3TURBO'),
      value: 'gpt-3.5-turbo',
    },
    {
      label: 'gpt-4',
      description: t('RESOURCES_CLUSTER_FAULT_LOCALMODEL_GPT4'),
      value: 'gpt-4',
    },
    {
      label: 'gpt-4-turbo',
      description: t('RESOURCES_CLUSTER_FAULT_LOCALMODEL_GPT4TURBO'),
      value: 'gpt-4-turbo',
    }
  ]

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      data.originOperator = get(props.item, 'spec.ai.backend')
      onOk(data)
    })
  }

  const handleOperator = (e) => {
    const { data } = form.current.props;
    setOperator(e)
    data.model = '';
  }

  return (
    <>
      <Modal
        icon="cluster"
        width={1000}
        minHeight={1000}
        title={props.title}
        okText={t('RESOURCES_EDIT')}
        visible={modelView}
        onOk={handleOk}
        onCancel={closeModal}
      >
        <Form data={formData} ref={form}>

          {/* 이름 */}
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
            <Input name="name" maxLength={63}
              style={{ maxWidth: 'none' }} defaultValue={get(props.item, 'metadata.name')}
              readOnly />
          </Form.Item>

          {/* Operator 설정 */}
          <Form.Item
            label={t('RESOURCES_CLUSTER_FAULT_AI_ENGINE') + ' ' + t('RESOURCES_CLUSTER_FAULT_SET')}
            rules={[{ required: true, message: t('RESOURCES_CLUSTER_FAULT_MODAL_OPERATOR_MSG') },]}
          >
            <TypeSelect
              name="operator"
              defaultValue={get(props.item, 'spec.ai.backend')}
              onChange={(e) => handleOperator(e)}
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
            // desc={t('RESOURCES_CLUSTER_FAULT_MODAL_MODEL_DSEC')}
            rules={[{
              required: true,
              message: t('RESOURCES_CLUSTER_FAULT_MODAL_MODEL_MSG')
            },]}
          >
            <TypeSelect
              name="model"
              placeholder={{
                label: t('RESOURCES_SELECT')
              }}
              defaultValue={get(props.item, 'spec.ai.model')}
              defaultDescription={t('RESOURCES_CLUSTER_FAULT_MODAL_OPERATOR_DESC')}
              options={operator === 'localai' ? localModelOptions : operator === 'openai' ? openModelOptions : []}
            />
          </Form.Item>

          {/* 세부 설정 */}
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
                    defaultValue={secretkey}
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
                    defaultValue={get(props.item, 'spec.ai.baseUrl')}
                  />
                </Form.Item>
              }
            </Form.Group>
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default ModifyModal

