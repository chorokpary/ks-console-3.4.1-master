import React, { useEffect, useReducer, useRef, useState } from 'react'
import { Modal } from 'components/Base'
import { NumberInput } from 'components/Inputs'
import { PATTERN_IP, PATTERN_IP_MASK, PATTERN_MTU } from 'utils/constants'
import {
  Button,
  Form,
  Input,
  Select,
  TextArea,
  Tooltip,
} from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import {
  RadioButton,
  RadioGroup,
} from '@kube-design/components/lib/components/Radio'
import * as common from 'utils/resources'
import classnames from 'classnames'
import styles from './index.scss'

const DEFAULT_ELB_TYPE = 'kubelb'

const validationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, [action.field]: action.message }
    case 'CLEAR_ERROR':
      return { ...state, [action.field]: null }
    default:
      return state
  }
}

const ModifyModal = props => {
  const detail = props.detail
  const form = useRef()
  const [formData] = useState({})
  const [modelView, setModalView] = useState(true)
  const [, setCidrReducer] = useReducer(cidrReducer => !cidrReducer, false)
  const [regStep, setRegStep] = useState(1)
  const [elbManagementEnabled, setElbManagementEnabled] = useState(
    !!detail.elb_management
  )
  const [validationErrors, dispatchValidation] = useReducer(
    validationReducer,
    {}
  )

  const defaultOptions = [
    { label: t('RESOURCES_NOT_USE'), value: false },
    { label: t('RESOURCES_USE'), value: true },
  ]

  const setValidationError = (field, message) => {
    dispatchValidation({ type: 'SET_ERROR', field, message })
  }

  const clearValidationError = field => {
    dispatchValidation({ type: 'CLEAR_ERROR', field })
  }

  const hasFormErrors = () => {
    return Object.values(validationErrors).some(
      error => error !== null && error !== ''
    )
  }

  const ipToNumber = ip =>
    ip.split('.').reduce((sum, octet) => sum * 256 + Number(octet), 0)

  const isPoolRangeValid = (start, end) =>
    PATTERN_IP.test(start) &&
    PATTERN_IP.test(end) &&
    ipToNumber(start) <= ipToNumber(end)

  const isIpInPool = (ip, start, end) => {
    if (!PATTERN_IP.test(ip) || !isPoolRangeValid(start, end)) {
      return false
    }
    const target = ipToNumber(ip)
    return target >= ipToNumber(start) && target <= ipToNumber(end)
  }

  const isPoolOverlap = (startA, endA, startB, endB) => {
    if (!isPoolRangeValid(startA, endA) || !isPoolRangeValid(startB, endB)) {
      return false
    }
    const maxStart = Math.max(ipToNumber(startA), ipToNumber(startB))
    const minEnd = Math.min(ipToNumber(endA), ipToNumber(endB))
    return maxStart <= minEnd
  }

  const validateGatewayPoolConflicts = data => {
    clearValidationError('gateway_pool_conflict')

    const hasGateway = PATTERN_IP.test(data.gateway_ip || '')
    const hasIpPool = isPoolRangeValid(data.ip_pool_start, data.ip_pool_end)

    if (
      hasGateway &&
      hasIpPool &&
      isIpInPool(data.gateway_ip, data.ip_pool_start, data.ip_pool_end)
    ) {
      setValidationError(
        'gateway_pool_conflict',
        t('RESOURCES_GATEWAY_IP_IN_POOL_DESC')
      )
      return false
    }

    if (
      hasGateway &&
      data.elb_management &&
      isPoolRangeValid(data.elb_ip_pool_start, data.elb_ip_pool_end) &&
      isIpInPool(data.gateway_ip, data.elb_ip_pool_start, data.elb_ip_pool_end)
    ) {
      setValidationError(
        'gateway_pool_conflict',
        t('RESOURCES_GATEWAY_IP_IN_ELB_POOL_DESC')
      )
      return false
    }

    return true
  }

  const validateElbManagementRules = data => {
    clearValidationError('elb_management')
    clearValidationError('elb_ip_pool')
    clearValidationError('elb_ip_pool_overlap')

    const isElbManagementAllowed =
      detail.type === 'FLAT' && detail.external === true
    const isElbManagementEnabled = !!data.elb_management
    let isValid = true

    if (isElbManagementEnabled && !isElbManagementAllowed) {
      setValidationError(
        'elb_management',
        t('RESOURCES_ELB_MANAGEMENT_CONDITION_TIP')
      )
      isValid = false
    }

    if (isElbManagementEnabled) {
      if (!data.elb_type) {
        data.elb_type = DEFAULT_ELB_TYPE
      }

      if (!data.elb_ip_pool_start || !data.elb_ip_pool_end) {
        setValidationError('elb_ip_pool', t('RESOURCES_ELB_IP_POOL_EMPTY_DESC'))
        isValid = false
      } else if (
        !isPoolRangeValid(data.elb_ip_pool_start, data.elb_ip_pool_end)
      ) {
        setValidationError('elb_ip_pool', t('RESOURCES_IP_POOL_VALID'))
        isValid = false
      }

      if (
        isPoolRangeValid(data.ip_pool_start, data.ip_pool_end) &&
        isPoolRangeValid(data.elb_ip_pool_start, data.elb_ip_pool_end) &&
        isPoolOverlap(
          data.ip_pool_start,
          data.ip_pool_end,
          data.elb_ip_pool_start,
          data.elb_ip_pool_end
        )
      ) {
        setValidationError(
          'elb_ip_pool_overlap',
          t('RESOURCES_ELB_IP_POOL_OVERLAP_DESC')
        )
        isValid = false
      }
    }

    if (!validateGatewayPoolConflicts(data)) {
      isValid = false
    }

    return isValid
  }

  const handleOk = () => {
    const onOk = props.onOk

    form.current.validator(() => {
      const { data } = form.current.props

      const error = document.querySelectorAll('.form-item-error')
      for (const i of error) {
        if (!i.classList.contains('hide')) {
          return
        }
      }

      const isElbValidationPassed = validateElbManagementRules(data)
      if (!isElbValidationPassed || hasFormErrors()) {
        return
      }

      const dns = []
      data.dns?.forEach(el => {
        if (el !== '') {
          dns.push(el)
        }
      })
      data.dns = dns

      const host_routes = []
      listHostRoute?.forEach(el => {
        if (data.Destination?.[el] && data.Nexthop?.[el]) {
          host_routes.push({
            destination: data.Destination[el],
            nexthop: data.Nexthop[el],
          })
        }
      })
      data.host_routes = host_routes
      const updatedData = {
        project: detail.project,
        mtu: data.mtu,
        cidr: data.cidr,
        gateway_ip: data.gateway_ip,
        ip_pool: {
          start: data.ip_pool_start,
          end: data.ip_pool_end,
        },
        dns: data.dns,
        host_routes: data.host_routes,
        description: data.description,
        // Deprecated: default_route will be removed. Kept for backward compatibility with older backend images.
        default_route: !!data.gateway_ip,
        elb_management: !!data.elb_management,
      }

      if (updatedData.elb_management) {
        updatedData.elb_type = data.elb_type || DEFAULT_ELB_TYPE
        updatedData.elb_ip_pool = {
          start: data.elb_ip_pool_start,
          end: data.elb_ip_pool_end,
        }
      }

      if (!updatedData.description) {
        delete updatedData.description
      }

      onOk({ ...updatedData })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  const isValidIpAddress = ip => {
    return PATTERN_IP.test(ip)
  }
  const fnCheckCidrClass = num => {
    if (parseInt(num, 10) > 30) {
      return false
    }
    if (!PATTERN_IP_MASK.test(num)) {
      return false
    }
    const clsMaximumVal = 128
    const classVal = parseInt(num, 10)
    return !(classVal < 1 || classVal > clsMaximumVal)
  }

  const checkNetworkAddress = value => {
    const cidrData = common.fnCalculateCidr(value)
    return cidrData.networkAddress === value.split('/')[0]
  }

  const cidrValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_CIDR_EMPTY_DESC') })
    }
    if (
      value.split('/').length !== 2 ||
      !isValidIpAddress(value.split('/')[0]) ||
      !fnCheckCidrClass(value.split('/')[1]) ||
      !checkNetworkAddress(value)
    ) {
      return callback({ message: t('RESOURCES_CIDR_VALID') })
    }

    callback()
  }

  const onChangeCidr = e => {
    const { data } = form.current.props
    if (
      e.split('/').length !== 2 ||
      !isValidIpAddress(e.split('/')[0]) ||
      !fnCheckCidrClass(e.split('/')[1])
    ) {
      data.ip_pool_start = ''
      data.ip_pool_end = ''
      data.gateway_ip = ''

      const a = document.getElementById('ip_pool_start')
      const b = document.getElementById('ip_pool_end')
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.remove('hide')
        a.parentElement.parentElement.classList.add('error-item')
        b.nextElementSibling.classList.remove('hide')
        b.parentElement.parentElement.classList.add('error-item')
      }

      setCidrReducer()
    } else {
      const cidrData = common.fnCalculateCidr(e, true)
      data.ip_pool_start = cidrData.startIp
      data.ip_pool_end = cidrData.endIp
      data.gateway_ip = cidrData.gatewayIp

      const a = document.getElementById('ip_pool_start')
      const b = document.getElementById('ip_pool_end')
      if (
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('form-item-error')
      ) {
        a.nextElementSibling.classList.add('hide')
        a.parentElement.parentElement.classList.remove('error-item')
        b.nextElementSibling.classList.add('hide')
        b.parentElement.parentElement.classList.remove('error-item')
      }

      setCidrReducer()
    }
  }
  const nextHostRoute = useRef(
    detail?.host_routes.length === 0 ? 1 : detail?.host_routes.length - 1
  )
  const [listHostRoute, setListHostRoute] = useState(
    Array.from({ length: detail?.host_routes.length || 1 }, (v, i) => i)
  )

  const handleHostRoute = {
    addColumn: () => {
      nextHostRoute.current += 1
      setListHostRoute(hostRoutes => [...hostRoutes, nextHostRoute.current])
    },
    delColumn: id => {
      setListHostRoute(listHostRoute.filter(el => el !== id))
    },
  }
  useEffect(() => {
    if (listHostRoute.length === 0) {
      const a = document.getElementById('hostRoute')
      a.classList.add('hide')
    }
  }, [listHostRoute])

  const stepMoveCheck = step => {
    const { data } = form.current.props
    if (step === 1) {
      const isElbValidationPassed = validateElbManagementRules(data)
      if (
        data.name === undefined ||
        data.name === '' ||
        !PATTERN_MTU.test(data.mtu) ||
        data.cidr === undefined ||
        data.cidr === '' ||
        data.ip_pool_start === undefined ||
        data.ip_pool_start === '' ||
        data.ip_pool_end === undefined ||
        data.ip_pool_end === '' ||
        !checkNetworkAddress(data.cidr) ||
        !isElbValidationPassed
      ) {
        handleOk()
      } else {
        setRegStep(2)
      }
    }
  }

  const fnGetModalFooter = () => {
    return (
      <>
        {regStep === 1 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(1)
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep === 2 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(1)
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              onClick={() => {
                handleOk()
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
              loading={props.store.isSubmitting}
              disabled={props.store.isSubmitting}
            >
              {t('RESOURCES_EDIT')}
            </Button>
          </>
        )}
      </>
    )
  }

  const onChangeDestination = (e, idx) => {
    const a = document.getElementById('hostRoute')
    const nexthop = document.getElementById(`Nexthop.${idx}`).value

    if (e.length > 0 || nexthop.length > 0) {
      if (
        e.split('/').length !== 2 ||
        !isValidIpAddress(e.split('/')[0]) ||
        !fnCheckCidrClass(e.split('/')[1]) ||
        !PATTERN_IP.test(nexthop)
      ) {
        a.classList.remove('hide')
      } else {
        a.classList.add('hide')
      }
    } else {
      a.classList.add('hide')
    }
  }
  const onChangeNexthop = (e, idx) => {
    const a = document.getElementById('hostRoute')
    const destination = document.getElementById(`Destination.${idx}`).value

    if (e.length > 0 || destination.length > 0) {
      if (
        destination.split('/').length !== 2 ||
        !isValidIpAddress(destination.split('/')[0]) ||
        !fnCheckCidrClass(destination.split('/')[1]) ||
        !PATTERN_IP.test(e)
      ) {
        a.classList.remove('hide')
      } else {
        a.classList.add('hide')
      }
    } else {
      a.classList.add('hide')
    }
  }

  return (
    <>
      <Modal
        icon="pen"
        width={800}
        title={props.title}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form}>
          {/* Header */}
          <div className={styles.tab_process}>
            {/* styles.view_screen  : 이전 링크 관련 class */}
            <div
              className={classnames(
                styles.process_item,
                `${regStep === 1 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${
                    regStep === 1
                      ? styles.current
                      : regStep > 1
                      ? styles.done
                      : styles.todo
                  }`}
                ></div>
              </div>
              <span className={styles.basic}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_DEFAULT_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep === 1
                    ? t('RESOURCES_CURRENT')
                    : regStep > 1
                    ? t('RESOURCES_COMPLETED_SETTINGS')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
            <div
              className={classnames(
                styles.process_item,
                `${regStep === 2 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep === 2 ? styles.current : styles.todo}`}
                ></div>
              </div>
              <span className={styles.detail}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_DETAIL_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep === 2
                    ? t('RESOURCES_CURRENT')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.pop_overflow_y}>
            <div className={styles.cont_boxwrap}>
              {/* 기본설정 설정 시작========================================== */}
              <div className={`${regStep === 1 ? '' : 'hide'}`}>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_NAME')}
                      rules={[
                        {
                          required: true,
                          message: t('RESOURCES_NAME_EMPTY_DESC'),
                        },
                      ]}
                      desc={t('NAME_DESC')}
                    >
                      <Input
                        name="name"
                        maxLength={253}
                        defaultValue={detail.name}
                        readOnly
                        style={{ maxWidth: 'none' }}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
                <Form.Item label={t('RESOURCES_SUBNET')}>
                  <Form.Group>
                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_SUBNET_EXTERNAL')}
                            rules={[{ required: true }]}
                          >
                            <RadioGroup
                              name="external"
                              wrapClassName="radio"
                              defaultValue={detail.external}
                            >
                              {defaultOptions.map(option => (
                                <Tooltip
                                  content={t('RESOURCES_NOT_EDITABLE_FIELD')}
                                  placement="right"
                                >
                                  <RadioButton
                                    key={option.value}
                                    value={option.value}
                                    disabled="true"
                                  >
                                    {option.label}
                                  </RadioButton>
                                </Tooltip>
                              ))}
                            </RadioGroup>
                          </Form.Item>
                        </Column>
                        <Column>
                          <Columns>
                            <Column>
                              <Form.Item
                                label={t('RESOURCES_CIDR')}
                                rules={[
                                  {
                                    required: true,
                                    validator: cidrValidator,
                                  },
                                ]}
                              >
                                <Input
                                  name="cidr"
                                  style={{ maxWidth: 'none' }}
                                  onChange={e => onChangeCidr(e)}
                                  defaultValue={detail.cidr}
                                />
                              </Form.Item>
                            </Column>
                            <Column>
                              <Form.Item
                                label={t('RESOURCES_MTU')}
                                rules={[
                                  {
                                    required: true,
                                    message: t('RESOURCES_MTU_EMPTY_DESC'),
                                  },
                                  {
                                    pattern: PATTERN_MTU,
                                    message: t('RESOURCES_MTU_VALID'),
                                  },
                                ]}
                              >
                                <NumberInput
                                  name="mtu"
                                  defaultValue={detail.mtu}
                                  // min={1}
                                  // max={1600}
                                  style={{ maxWidth: 'none' }}
                                />
                              </Form.Item>
                            </Column>
                          </Columns>
                        </Column>
                      </Columns>
                    </Form.Item>

                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_ELB_DEDICATED')}
                            rules={[{ required: true }]}
                          >
                            <RadioGroup
                              name="elb"
                              wrapClassName="radio"
                              defaultValue={detail.elb || false}
                            >
                              {defaultOptions.map(option => (
                                <Tooltip
                                  content={t('RESOURCES_NOT_EDITABLE_FIELD')}
                                  placement="right"
                                >
                                  <RadioButton
                                    key={option.value}
                                    value={option.value}
                                    disabled="true"
                                  >
                                    {option.label}
                                  </RadioButton>
                                </Tooltip>
                              ))}
                            </RadioGroup>
                          </Form.Item>
                          <Form.Item
                            label={t('RESOURCES_ELB_MANAGEMENT')}
                            rules={[{ required: true }]}
                          >
                            <RadioGroup
                              name="elb_management"
                              wrapClassName="radio"
                              defaultValue={detail.elb_management || false}
                              onChange={value => {
                                const { data } = form.current.props
                                data.elb_management = value
                                setElbManagementEnabled(value)
                                clearValidationError('elb_management')
                                clearValidationError('elb_ip_pool')
                                clearValidationError('elb_ip_pool_overlap')

                                if (!value) {
                                  data.elb_type = DEFAULT_ELB_TYPE
                                  data.elb_ip_pool_start = ''
                                  data.elb_ip_pool_end = ''
                                  clearValidationError('gateway_pool_conflict')
                                }
                              }}
                            >
                              {defaultOptions.map((option, idx) => (
                                <Tooltip
                                  content={
                                    idx === 1 &&
                                    !(detail.type === 'FLAT' && detail.external)
                                      ? t(
                                          'RESOURCES_ELB_MANAGEMENT_CONDITION_TIP'
                                        )
                                      : ''
                                  }
                                  placement="right"
                                >
                                  <RadioButton
                                    key={option.value}
                                    value={option.value}
                                    disabled={
                                      idx === 1 &&
                                      !(
                                        detail.type === 'FLAT' &&
                                        detail.external
                                      )
                                    }
                                  >
                                    {option.label}
                                  </RadioButton>
                                </Tooltip>
                              ))}
                            </RadioGroup>
                          </Form.Item>
                          {validationErrors.elb_management && (
                            <div className="form-item-error">
                              {validationErrors.elb_management}
                            </div>
                          )}
                        </Column>
                        <Column>
                          <Columns>
                            <Column>
                              <Form.Item
                                label={t('RESOURCES_IP_POOL_INFORMATION')}
                                rules={[
                                  {
                                    required: true,
                                    message: t('RESOURCES_IP_POOL_EMPTY_DESC'),
                                  },
                                  {
                                    pattern: PATTERN_IP,
                                    message: t('RESOURCES_IP_POOL_VALID'),
                                  },
                                ]}
                              >
                                <Input
                                  name="ip_pool_start"
                                  defaultValue={detail.ip_pool.start}
                                />
                              </Form.Item>
                            </Column>
                            <Column>
                              <Form.Item
                                rules={[
                                  {
                                    required: true,
                                    message: t('RESOURCES_IP_POOL_EMPTY_DESC'),
                                  },
                                  {
                                    pattern: PATTERN_IP,
                                    message: t('RESOURCES_IP_POOL_VALID'),
                                  },
                                ]}
                              >
                                <Input
                                  name="ip_pool_end"
                                  style={{ marginTop: '24px' }}
                                  defaultValue={detail.ip_pool.end}
                                />
                              </Form.Item>
                            </Column>
                          </Columns>
                          {elbManagementEnabled && (
                            <Columns>
                              <Column>
                                <Form.Item
                                  label={t('RESOURCES_ELB_TYPE')}
                                  rules={[{ required: true }]}
                                >
                                  <Select
                                    name="elb_type"
                                    defaultValue={
                                      detail.elb_type || DEFAULT_ELB_TYPE
                                    }
                                    options={[
                                      {
                                        label: DEFAULT_ELB_TYPE,
                                        value: DEFAULT_ELB_TYPE,
                                      },
                                    ]}
                                  />
                                </Form.Item>
                              </Column>
                              <Column>
                                <Columns>
                                  <Column>
                                    <Form.Item
                                      label={t(
                                        'RESOURCES_ELB_IP_POOL_INFORMATION'
                                      )}
                                      rules={[
                                        {
                                          required: true,
                                          message: t(
                                            'RESOURCES_ELB_IP_POOL_EMPTY_DESC'
                                          ),
                                        },
                                        {
                                          pattern: PATTERN_IP,
                                          message: t('RESOURCES_IP_POOL_VALID'),
                                        },
                                      ]}
                                    >
                                      <Input
                                        name="elb_ip_pool_start"
                                        defaultValue={
                                          detail.elb_ip_pool?.start || ''
                                        }
                                      />
                                    </Form.Item>
                                  </Column>
                                  <Column>
                                    <Form.Item
                                      rules={[
                                        {
                                          required: true,
                                          message: t(
                                            'RESOURCES_ELB_IP_POOL_EMPTY_DESC'
                                          ),
                                        },
                                        {
                                          pattern: PATTERN_IP,
                                          message: t('RESOURCES_IP_POOL_VALID'),
                                        },
                                      ]}
                                    >
                                      <Input
                                        name="elb_ip_pool_end"
                                        style={{ marginTop: '24px' }}
                                        defaultValue={
                                          detail.elb_ip_pool?.end || ''
                                        }
                                      />
                                    </Form.Item>
                                  </Column>
                                </Columns>
                              </Column>
                            </Columns>
                          )}
                          {(validationErrors.elb_ip_pool ||
                            validationErrors.elb_ip_pool_overlap) && (
                            <div className="form-item-error">
                              {validationErrors.elb_ip_pool ||
                                validationErrors.elb_ip_pool_overlap}
                            </div>
                          )}
                        </Column>
                      </Columns>
                    </Form.Item>
                    <Form.Item>
                      <Columns>
                        <Column />
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_GATEWAY_IP')}
                            rules={[
                              {
                                pattern: PATTERN_IP,
                                message: t('RESOURCES_IP_POOL_VALID'),
                              },
                            ]}
                          >
                            <Input
                              name="gateway_ip"
                              defaultValue={detail.gateway_ip}
                            />
                          </Form.Item>
                          {validationErrors.gateway_pool_conflict && (
                            <div className="form-item-error">
                              {validationErrors.gateway_pool_conflict}
                            </div>
                          )}
                        </Column>
                      </Columns>
                    </Form.Item>
                  </Form.Group>
                </Form.Item>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_DESCRIPTION')}
                      desc={t('DESCRIPTION_DESC')}
                    >
                      <TextArea
                        defaultValue={detail.description}
                        style={{ maxWidth: 'none' }}
                        name="description"
                        maxLength={256}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
              </div>
              {/* 기본설정 설정 끝========================================== */}

              {/* 세부 설정 시작========================================== */}
              <div className={`${regStep === 2 ? '' : 'hide'}`}>
                <Form.Item label={t('RESOURCES_DNS')}>
                  <Form.Group>
                    <Columns>
                      <Column>
                        <Form.Item
                          label={t('RESOURCES_DNS_PRIMARY')}
                          rules={[
                            {
                              pattern: PATTERN_IP,
                              message: t('RESOURCES_DNS_VALID'),
                            },
                          ]}
                        >
                          <Input name="dns.0" defaultValue={detail.dns?.[0]} />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item
                          label={t('RESOURCES_DNS_SECONDARY')}
                          rules={[
                            {
                              pattern: PATTERN_IP,
                              message: t('RESOURCES_DNS_VALID'),
                            },
                          ]}
                        >
                          <Input name="dns.1" defaultValue={detail.dns?.[1]} />
                        </Form.Item>
                        <div className="form-item-error hide">
                          {t('RESOURCES_DNS_VALID')}
                        </div>
                      </Column>
                    </Columns>
                  </Form.Group>
                </Form.Item>

                <Form.Item label={t('RESOURCES_HOST_ROUTE')}>
                  <Form.Group>
                    {listHostRoute.map(obj => (
                      <div className={styles.item} key={obj}>
                        <Columns>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`Destination.${obj}`}
                                placeholder={t('Destination')}
                                onChange={e => onChangeDestination(e, obj)}
                                defaultValue={
                                  detail.host_routes?.[obj]?.destination
                                }
                              />
                            </Form.Item>
                          </Column>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`Nexthop.${obj}`}
                                placeholder={t('Nexthop')}
                                onChange={e => onChangeNexthop(e, obj)}
                                defaultValue={
                                  detail.host_routes?.[obj]?.nexthop
                                }
                              />
                            </Form.Item>
                          </Column>
                        </Columns>
                        <Button
                          type="flat"
                          icon="trash"
                          className={styles.delete}
                          onClick={() => handleHostRoute.delColumn(obj)}
                        />
                      </div>
                    ))}
                    <div className="text-right">
                      <Button
                        className={styles.add}
                        onClick={handleHostRoute.addColumn}
                      >
                        {t('RESOURCES_ADD')}
                      </Button>
                    </div>
                  </Form.Group>
                </Form.Item>
                <div className="form-item-error hide" id="hostRoute">
                  {t.html('RESOURCES_HOSTROUTE_VALID', {})}
                </div>
              </div>
              {/* 세부 설정 끝========================================== */}
            </div>
          </div>
          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  )
}

export default ModifyModal
