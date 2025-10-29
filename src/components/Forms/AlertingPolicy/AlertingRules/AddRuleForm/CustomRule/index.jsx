import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import {
  Form,
  Input,
  TextArea,
  Column,
  Columns,
  Select,
} from '@kube-design/components'
import { get } from 'lodash'
import styles from './index.scss'
import UnitInput from '../../../BaseInfo/UnitInput'
import CustomExpr from './CustomExpr'

import ConfigMapStore from 'stores/configmap'

const durationUnitOptions = [
  {
    label: t('SECONDS'),
    value: 's',
  },
  {
    label: t('MINUTES'),
    value: 'm',
  },
  {
    label: t('HOURS'),
    value: 'h',
  },
]
 
export const severityOptions = [
  {
    label: t('CRITICAL_ALERT'),
    value: 'critical',
    bgColor: '#CA2621',
    color: '#FFFFFF',
  },
  {
    label: t('ERROR_ALERT'),
    value: 'error',
    color: '#FFFFFF',
    bgColor: '#F5A623',
  },
  {
    label: t('WARNING_ALERT'),
    value: 'warning',
    color: '#36435C',
    bgColor: '#D8DEE5',
  },
]

const CustomRule = (props, ref) => {

 const configMapStore = new ConfigMapStore()

  const { editRule } = props

  const [resourceOptions, setResourceOptions] = useState([])

  useEffect(() => {
    const fetchResourceTypes = async () => {

      const params = {
        cluster: 'default',
        namespace: 'kubesphere-monitoring-system',
        name: 'alert-rule-resource-type',
      }

      const configmap = await configMapStore.fetchDetail(params)
      const resourceData = JSON.parse(get(configmap, 'data.resource_type', '[]'))

      const options = Array.isArray(resourceData)
      ? resourceData.map(item => ({
          label: item.toUpperCase(),
          value: item,
        }))
      : []

      setResourceOptions(options)
    }

    fetchResourceTypes()
  }, [])

  const ruleRef = useRef()
  useImperativeHandle(ref, () => ({
    target: ruleRef.current,
  }))

  const [formTemplate] = useState({
    alert: get(editRule, 'alert', ''),
    annotations: {
      summary: get(editRule, 'annotations.summary', ''),
      message: get(editRule, 'annotations.message', ''),
    },
    for: get(editRule, 'for', ''),
    expr: get(editRule, 'expr', ''),
    severity: get(editRule, 'severity', ''),
    disable: get(editRule, 'disable', false),
    labels: {
      resource_type : get(editRule, 'labels.resource_type', ''),
    }
  })

  const timeValidator = (rule, value, callback) => {
    const duration = value.slice(0, -1)
    const time = /^[0-9]*$/

    if (!time.test(duration)) {
      return callback({ message: t('INVALID_TIME_DESC') })
    }
    callback()
  }

  return (
    <Form data={formTemplate} ref={ruleRef}>
      <div className={styles.label}>{t('RULE_SETTINGS')}</div>
      <div className={styles.contentGroup}>
        <Columns>
          <Column>
            <Form.Item
              label={t('RULE_NAME')}
              desc={t('CUSTOM_RULE_NAME_DESC')}
              rules={[{ required: true, message: t('RULE_NAME_REQUIRED') }]}
            >
              <Input name="alert" maxLength={63} />
            </Form.Item>
          </Column>
          <Column>
            <Form.Item
              label={t('TYPE')}
              rules={[{ required: true, message: t('RESOURCE_TYPE_REQUIRED') }]}
            >
              <Select
                name="labels.resource_type"
                options={resourceOptions}
                optionRenderer={({ label, value }) => (
                  <span
                    className={styles[value]}
                    style={{ paddingTop: 2, paddingBottom: 2 }}
                  >
                    {label}
                  </span>
                )}
                valueRenderer={({ label, value }) => (
                  <span className={styles[value]}>{label.toUpperCase()}</span>
                )}
                placeholder=" "
              ></Select>
            </Form.Item>
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Form.Item
              label={t('DURATION')}
              desc={t('ALERT_DURATION')}
              rules={[{ validator: timeValidator }]}
            >
              <UnitInput
                name="for"
                inputClassName={styles.duration}
                unitOptions={durationUnitOptions}
                defaultValue={durationUnitOptions[1].value}
              />
            </Form.Item>
          </Column>
          <Column>
            <Form.Item
              label={t('SEVERITY')}
              rules={[{ required: true, message: t('SEVERITY_REQUIRED') }]}
            >
              <Select
                name="severity"
                options={severityOptions}
                optionRenderer={({ label, value }) => (
                  <span
                    className={styles[value]}
                    style={{ paddingTop: 2, paddingBottom: 2 }}
                  >
                    {label}
                  </span>
                )}
                valueRenderer={({ label, value }) => (
                  <span className={styles[value]}>{label}</span>
                )}
                placeholder=" "
              ></Select>
            </Form.Item>
          </Column>
        </Columns>
        <Form.Item
          label={t('RULE_EXPRESSION')}
          desc={t.html('ALERT_RULE_EXPRESSION_DESC')}
          rules={[{ required: true, message: t('ALERT_RULE_REQUIRED') }]}
        >
          <CustomExpr
            name="expr"
            store={props.store}
            cluster={props.cluster}
            namespace={props.namespace}
          />
        </Form.Item>
      </div>
      <div className={styles.label}>{t('MESSAGE_SETTINGS')}</div>
      <div className={styles.contentGroup}>
        <Form.Item
          className={styles.message}
          label={t('MESSAGE_SUMMARY')}
          desc={t('MESSAGE_SUMMARY_DESC')}
          rules={[{ required: true, message: t('MESSAGE_REQUIRED') }]}
        >
          <Input name="annotations.summary" maxLength={63} />
        </Form.Item>
        <Form.Item
          className={styles.message}
          label={t('MESSAGE_DETAILS')}
          desc={t('MESSAGE_DETAILS_DESC')}
        >
          <TextArea name="annotations.message" maxLength={256} />
        </Form.Item>
      </div>
    </Form>
  )
}

const CustomRuleWithRef = forwardRef(CustomRule)

export default CustomRuleWithRef
