import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { Modal } from 'components/Base'
import { NumberInput, ProjectSelect } from 'components/Inputs'
import {
  PATTERN_IP,
  PATTERN_MTU,
  PATTERN_SEGMENT_ID,
  PATTERN_USER_NAME,
} from 'utils/constants'
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
import NetworkStore from 'stores/resources/networks'
import styles from './index.scss'

// ===== CONSTANTS =====
const VF_RESOURCE_PREFIX = 'openshift.io/'
const CIDR_PARTS_LENGTH = 2
const MAX_CIDR_CLASS = 30
const DEFAULT_MTU = 1500
const DEFAULT_PROJECT = 'default'
const INITIAL_REG_STEP = 1
const INITIAL_HOST_ROUTE_ID = 1

// ===== NETWORK CONFIGURATION REDUCER =====
const networkConfigReducer = (state, action) => {
  switch (action.type) {
    case 'SET_EXTERNAL':
      return { ...state, external: action.payload }
    case 'SET_NETWORK_TYPE':
      return {
        ...state,
        networkType: action.payload,
        isTunnelNetwork: action.payload !== 'FLAT',
      }
    case 'SET_NETWORK_OFFLOAD':
      return {
        ...state,
        networkOffload: action.payload.value,
        networkOffloadConfigurable: action.payload.configurable,
        networkOffloadInfo: action.payload.info,
      }
    case 'SET_PHYSNET':
      return { ...state, physnet: action.payload }
    case 'SET_NETWORK_TYPE_OPTIONS':
      return { ...state, networkTypeOptions: action.payload }
    case 'SET_EXTERNAL_INFO':
      return { ...state, externalInfo: action.payload }
    default:
      return state
  }
}

// ===== VALIDATION STATE REDUCER =====
const validationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, [action.field]: action.message }
    case 'CLEAR_ERROR':
      return { ...state, [action.field]: null }
    case 'CLEAR_ALL':
      return {}
    default:
      return state
  }
}

const RegistModal = props => {
  // ===== OPTION ARRAYS =====
  const BINARY_OPTIONS = useMemo(
    () => [
      { label: t('RESOURCES_NOT_USE'), value: false },
      { label: t('RESOURCES_USE'), value: true },
    ],
    []
  )

  const NETWORK_TYPE_OPTIONS = useMemo(
    () => ({
      ADMIN_ONLY: [{ label: 'FLAT', value: 'FLAT' }],
      TUNNEL_TYPES: [
        { label: 'VXLAN', value: 'VXLAN' },
        { label: 'GENEVE', value: 'GENEVE' },
        { label: 'GRE', value: 'GRE' },
      ],
    }),
    []
  )

  // ===== REFS =====
  const form = useRef()
  const networkStore = useMemo(() => new NetworkStore(), [])

  // ===== FORM DATA STATE =====
  const [formData] = useState({})

  // ===== UI STATE =====
  const [modelView, setModalView] = useState(true)
  const [regStep, setRegStep] = useState(INITIAL_REG_STEP)

  // ===== NETWORK CONFIGURATION STATE =====
  const [networkConfig, dispatchNetworkConfig] = useReducer(
    networkConfigReducer,
    {
      external: true,
      networkType: '',
      isTunnelNetwork: false,
      networkOffload: false,
      networkOffloadConfigurable: false,
      networkOffloadInfo: '',
      physnet: '',
      networkTypeOptions: [],
      externalInfo: t('RESOURCES_EXTERNAL_NETWORK_TIP'),
    }
  )

  // ===== VALIDATION STATE =====
  const [validationErrors, dispatchValidation] = useReducer(
    validationReducer,
    {}
  )

  // ===== OTHER STATE =====
  const [defaultRoute, setDefaultRoute] = useState(false)
  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : DEFAULT_PROJECT
  )
  const [, setCidrReducer] = useReducer(cidrReducer => !cidrReducer, false)

  // ===== HOST ROUTE STATE =====
  const nextHostRoute = useRef(INITIAL_HOST_ROUTE_ID)
  const [listHostRoute, setListHostRoute] = useState([INITIAL_HOST_ROUTE_ID])

  // ===== PHYSICAL NETWORK STATE =====
  const [physnetOptions, setPhysnetOptions] = useState([])

  // ===== INITIALIZATION EFFECTS =====
  useEffect(() => {
    const getPhysnetsData = async () => {
      const listPhysnet = await networkStore.fetchPhysnets(props)
      const opt = listPhysnet.physnets.map(el => {
        return {
          label: t(el),
          value: t(el),
        }
      })
      setPhysnetOptions(opt)
      dispatchNetworkConfig({
        type: 'SET_PHYSNET',
        payload: opt.length > 0 ? opt[0].value : '',
      })
    }
    getPhysnetsData()

    const getNodeData = async () => {
      const listNode = await networkStore.fetchNodes(props)
      let tunnelSupported = true

      for (const node of listNode.nodes) {
        if (!node?.data_ip) {
          tunnelSupported = false
          break
        }
      }

      let _networkTypeOptions = []
      if (!props.namespace) {
        _networkTypeOptions = _networkTypeOptions.concat(
          NETWORK_TYPE_OPTIONS.ADMIN_ONLY
        )
      }
      if (tunnelSupported) {
        _networkTypeOptions = _networkTypeOptions.concat(
          NETWORK_TYPE_OPTIONS.TUNNEL_TYPES
        )
      }
      dispatchNetworkConfig({
        type: 'SET_NETWORK_TYPE_OPTIONS',
        payload: _networkTypeOptions,
      })

      // Set default network type to first option
      if (_networkTypeOptions.length > 0) {
        dispatchNetworkConfig({
          type: 'SET_NETWORK_TYPE',
          payload: _networkTypeOptions[0].value,
        })
      }
    }
    getNodeData()
  }, [])

  // ===== FORM PROCESSING HELPERS =====
  const hasFormErrors = useCallback(() => {
    return Object.values(validationErrors).some(
      error => error !== null && error !== ''
    )
  }, [validationErrors])

  const processFormData = data => {
    // Process DNS entries
    const dns = []
    data.dns?.forEach(el => {
      if (el !== '') {
        dns.push(el)
      }
    })

    // Process host routes
    const host_routes = []
    listHostRoute?.forEach(el => {
      if (data.Destination?.[el] && data.Nexthop?.[el]) {
        host_routes.push({
          destination: data.Destination[el],
          nexthop: data.Nexthop[el],
        })
      }
    })

    // Structure final data with explicit field mapping
    const processedData = {
      name: data.name,
      type: data.type,
      project: projectName,
      cidr: data.cidr,
      mtu: data.mtu || DEFAULT_MTU,
      gateway_ip: data.gateway_ip,
      default_route: data.default_route || defaultRoute,
      external: data.external,
      ip_pool: {
        start: data.ip_pool_start,
        end: data.ip_pool_end,
      },
      dns,
      host_routes,
      offload: data.offload,
      elb: data.type === 'FLAT' ? data.elb || false : false,
    }

    // Add optional fields only if they exist
    if (data.description) {
      processedData.description = data.description
    }
    // Handle segment_id for tunnel networks only
    if (data.type !== 'FLAT' && data.segment_id) {
      processedData.segment_id = parseInt(data.segment_id, 10)
    }
    // Handle physnet_name for FLAT networks only
    if (data.type === 'FLAT' && data.physnet_name) {
      processedData.physnet_name = data.physnet_name
    }

    return processedData
  }

  // ===== EVENT HANDLERS =====
  const handleOk = () => {
    const onOk = props.onOk

    form.current.validator(() => {
      const { data } = form.current.props

      if (hasFormErrors()) {
        return
      }

      const processedData = processFormData(data)
      onOk({ network: processedData })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  // ===== VALIDATION HELPERS =====
  const isValidIpAddress = ip => {
    const segments = ip.split('.')
    if (segments.length !== 4) return false
    return segments.every((segment, idx) => {
      const num = parseInt(segment, 10)
      if (idx === 3 && num !== 0) return false
      return !isNaN(num) && num >= 0 && num <= 255
    })
  }

  const isValidCidrClass = num => {
    const parsedNum = parseInt(num, 10)
    return !isNaN(parsedNum) && parsedNum > 0 && parsedNum <= MAX_CIDR_CLASS
  }

  const validateCidrFormat = cidr => {
    const parts = cidr.split('/')
    return (
      parts.length === CIDR_PARTS_LENGTH &&
      isValidIpAddress(parts[0]) &&
      isValidCidrClass(parts[1])
    )
  }

  const checkNetworkAddress = value => {
    const cidrData = common.fnCalculateCidr(value)
    return cidrData.networkAddress === value.split('/')[0]
  }

  const setValidationError = useCallback((field, message) => {
    dispatchValidation({ type: 'SET_ERROR', field, message })
  }, [])

  const clearValidationError = useCallback(field => {
    dispatchValidation({ type: 'CLEAR_ERROR', field })
  }, [])

  // ===== HOST ROUTE HANDLERS =====
  const handleHostRoute = {
    addColumn: () => {
      nextHostRoute.current += 1
      setListHostRoute(_listHostRoute => [
        ..._listHostRoute,
        nextHostRoute.current,
      ])
    },
    delColumn: id => {
      setListHostRoute(listHostRoute.filter(el => el !== id))
    },
  }
  useEffect(() => {
    if (listHostRoute.length === 0) {
      clearValidationError('hostRoute')
    }
  }, [listHostRoute, clearValidationError])

  // ===== FORM FIELD HANDLERS =====
  const onChangeCidr = useCallback(
    e => {
      const { data } = form.current.props
      const isValidCidr = validateCidrFormat(e)

      if (!isValidCidr) {
        // Clear dependent fields
        data.ip_pool_start = ''
        data.ip_pool_end = ''
        data.gateway_ip = ''

        // Set errors
        setValidationError('ip_pool_start', t('RESOURCES_IP_POOL_EMPTY_DESC'))
        setValidationError('ip_pool_end', t('RESOURCES_IP_POOL_EMPTY_DESC'))
        setValidationError('gateway_ip', t('RESOURCES_GATEWAY_IP_EMPTY_DESC'))
      } else {
        // Calculate and set CIDR values
        const cidrData = common.fnCalculateCidr(e, true)
        data.ip_pool_start = cidrData.startIp
        data.ip_pool_end = cidrData.endIp
        data.gateway_ip = cidrData.gatewayIp

        // Clear errors
        clearValidationError('ip_pool_start')
        clearValidationError('ip_pool_end')
        clearValidationError('gateway_ip')
      }

      setCidrReducer()
    },
    [setValidationError, clearValidationError]
  )

  // checkNetworkAddress moved to validation helpers section

  const cidrValidator = (_, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_CIDR_EMPTY_DESC') })
    }
    if (!validateCidrFormat(value) || !checkNetworkAddress(value)) {
      return callback({ message: t('RESOURCES_CIDR_VALID') })
    }
    callback()
  }

  const handleNetworkType = useCallback(
    e => {
      const { data } = form.current.props

      if (e === 'FLAT') {
        data.segment_id = ''
        data.physnet_name =
          physnetOptions.length > 0 ? physnetOptions[0].value : ''

        dispatchNetworkConfig({ type: 'SET_NETWORK_TYPE', payload: e })
        dispatchNetworkConfig({ type: 'SET_EXTERNAL_INFO', payload: '' })
        dispatchNetworkConfig({
          type: 'SET_PHYSNET',
          payload: physnetOptions.length > 0 ? physnetOptions[0].value : '',
        })
      } else {
        // Tunnel networks (VXLAN, GENEVE, GRE)
        data.segment_id = ''
        data.physnet_name = ''

        dispatchNetworkConfig({ type: 'SET_NETWORK_TYPE', payload: e })
        dispatchNetworkConfig({
          type: 'SET_EXTERNAL_INFO',
          payload: t('RESOURCES_EXTERNAL_NETWORK_TIP'),
        })
        refreshNetworkOffloadTooltip('tunnel')
      }

      // Reset radio buttons through refs instead of DOM manipulation
      // These will be handled by the component state updates
    },
    [physnetOptions, refreshNetworkOffloadTooltip]
  )

  // Reload network offload nodes when physnet changes
  useEffect(() => {
    if (networkConfig.physnet.trim() !== '') {
      refreshNetworkOffloadTooltip(networkConfig.physnet)
    } else {
      refreshNetworkOffloadTooltip('tunnel')
    }
  }, [networkConfig.physnet, refreshNetworkOffloadTooltip])

  // ===== NETWORK OFFLOAD HANDLERS =====

  const refreshNetworkOffloadTooltip = useCallback(
    async resourceName => {
      const fullResourceName = VF_RESOURCE_PREFIX + resourceName
      const resp = await networkStore.fetchNodes({ ...props })

      const nodeResource = {}
      for (const node of resp.nodes) {
        if (
          'name' in node &&
          'resource' in node &&
          node.resource &&
          fullResourceName in node.resource
        ) {
          nodeResource[node.name] = node.resource[fullResourceName]
        }
      }

      let nodeStatus = ''
      let totalAvailable = 0
      for (const [key, val] of Object.entries(nodeResource)) {
        nodeStatus += `${key}(${val.available}/${val.allocatable}), `
        totalAvailable += val.available
      }
      nodeStatus = nodeStatus.slice(0, -2)

      if (Object.keys(nodeResource).length === 0) {
        dispatchNetworkConfig({
          type: 'SET_NETWORK_OFFLOAD',
          payload: {
            value: false,
            configurable: false,
            info: `${resourceName}: ${t(
              'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
            )}`,
          },
        })
      } else if (totalAvailable === 0) {
        dispatchNetworkConfig({
          type: 'SET_NETWORK_OFFLOAD',
          payload: {
            value: false,
            configurable: false,
            info: `${resourceName}: ${t(
              'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
            )} ${nodeStatus}`,
          },
        })
      } else {
        dispatchNetworkConfig({
          type: 'SET_NETWORK_OFFLOAD',
          payload: {
            value: networkConfig.networkOffload,
            configurable: true,
            info: `[${resourceName}] ${nodeStatus}`,
          },
        })
      }

      return resp
    },
    [networkStore, props, networkConfig.networkOffload]
  )

  // ===== STEP NAVIGATION =====
  const stepMoveCheck = useCallback(
    step => {
      const { data } = form.current.props
      if (step === 1) {
        if (
          data.name === undefined ||
          data.name === '' ||
          (data.type !== 'FLAT' &&
            (data.segment_id === undefined ||
              data.segment_id === '' ||
              !PATTERN_SEGMENT_ID.test(data.segment_id))) ||
          !PATTERN_MTU.test(data.mtu) ||
          data.cidr === undefined ||
          data.cidr === '' ||
          data.ip_pool_start === undefined ||
          data.ip_pool_start === '' ||
          data.ip_pool_end === undefined ||
          data.ip_pool_end === '' ||
          data.gateway_ip === undefined ||
          data.gateway_ip === '' ||
          !checkNetworkAddress(data.cidr)
        ) {
          handleOk()
        } else {
          setRegStep(2)
        }
      }
    },
    [handleOk]
  )

  // ===== EXTERNAL NETWORK HELPERS =====
  const getExternalNetworkState = useCallback(() => {
    const isAdmin = !props.namespace
    const isFlatNetwork = networkConfig.networkType === 'FLAT'

    if (isAdmin) {
      if (isFlatNetwork) {
        // Admin + FLAT: Enable selection, no tooltip restriction
        return {
          disabled: false,
          tooltipContent: '',
          showTooltip: false,
        }
      }
      // Admin + tunnel: Disable selection, show external network tip
      return {
        disabled: true,
        tooltipContent: t('RESOURCES_EXTERNAL_NETWORK_TIP'),
        showTooltip: true,
      }
    }
    // Tenant: Always disable, show tenant not allowed
    return {
      disabled: true,
      tooltipContent: t('RESOURCES_TENANT_NOT_ALLOWED'),
      showTooltip: true,
    }
  }, [props.namespace, networkConfig.networkType])

  const getElbDedicatedState = useCallback(() => {
    const isFlatNetwork = networkConfig.networkType === 'FLAT'

    if (isFlatNetwork) {
      return {
        disabled: false,
        tooltipContent: '',
        showTooltip: false,
      }
    }

    return {
      disabled: true,
      tooltipContent: t('RESOURCES_ELB_DEDICATED_TIP'),
      showTooltip: true,
    }
  }, [networkConfig.networkType])

  // ===== RENDER HELPERS =====
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
              {t('RESOURCES_CREATE')}
            </Button>
          </>
        )}
      </>
    )
  }

  const onChangeDestination = useCallback(
    (e, idx) => {
      const { data } = form.current.props
      const nexthop = data[`Nexthop.${idx}`] || ''

      if (e.length > 0 || nexthop.length > 0) {
        const isValidDestination = validateCidrFormat(e)
        const isValidNexthop = PATTERN_IP.test(nexthop)

        if (!isValidDestination || !isValidNexthop) {
          setValidationError('hostRoute', t('RESOURCES_HOSTROUTE_VALID'))
        } else {
          clearValidationError('hostRoute')
        }
      } else {
        clearValidationError('hostRoute')
      }
    },
    [setValidationError, clearValidationError]
  )
  const onChangeNexthop = useCallback(
    (e, idx) => {
      const { data } = form.current.props
      const destination = data[`Destination.${idx}`] || ''

      if (e.length > 0 || destination.length > 0) {
        const isValidDestination = validateCidrFormat(destination)
        const isValidNexthop = PATTERN_IP.test(e)

        if (!isValidDestination || !isValidNexthop) {
          setValidationError('hostRoute', t('RESOURCES_HOSTROUTE_VALID'))
        } else {
          clearValidationError('hostRoute')
        }
      } else {
        clearValidationError('hostRoute')
      }
    },
    [setValidationError, clearValidationError]
  )

  const segmentIdValidator = (_, value, callback) => {
    const { data } = form.current.props

    if (data.type !== 'FLAT') {
      if (!value) {
        return callback({
          message: t('RESOURCES_SEGMENT_ID_EMPTY_DESC'),
        })
      }

      if (!PATTERN_SEGMENT_ID.test(value)) {
        return callback({
          message: t('RESOURCES_SEGMENT_ID_VALID'),
        })
      }
      // callback();
    }
    callback()
  }

  // ===== COMPONENT RENDER =====
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
              <div className={styles.basic}></div>
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
              <div className={styles.detail}></div>
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
                          {
                            required: true,
                            message: t('PROJECT_NOT_SELECT_DESC'),
                          },
                        ]}
                      >
                        <ProjectSelect
                          name="namespace"
                          defaultValue={projectName}
                          cluster={props.cluster}
                          onChange={e => setProjectName(e)}
                        />
                      </Form.Item>
                    </Column>
                  )}
                </Columns>

                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('RESOURCES_NETWORK_TYPE')}
                        rules={[
                          {
                            required: true,
                            message: t('RESOURCES_SELECT_NETWORK_TIP'),
                          },
                        ]}
                      >
                        <Select
                          name="type"
                          defaultValue={
                            networkConfig.networkTypeOptions[0]?.value || ''
                          }
                          options={networkConfig.networkTypeOptions}
                          onChange={e => handleNetworkType(e)}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Columns>
                        {networkConfig.isTunnelNetwork && (
                          <Column>
                            <Form.Item
                              label={t('RESOURCES_SEGMENT_ID')}
                              rules={[
                                {
                                  required: true,
                                  validator: segmentIdValidator,
                                },
                              ]}
                            >
                              <NumberInput
                                name="segment_id"
                                style={{ maxWidth: 'none' }}
                              />
                            </Form.Item>
                          </Column>
                        )}
                        {!networkConfig.isTunnelNetwork && (
                          <Column>
                            <Form.Item
                              label={t('RESOURCES_PHYSNET')}
                              rules={[
                                {
                                  required: true,
                                },
                              ]}
                            >
                              <Select
                                name="physnet_name"
                                options={physnetOptions}
                                defaultValue={networkConfig.physnet}
                                onChange={e => {
                                  dispatchNetworkConfig({
                                    type: 'SET_PHYSNET',
                                    payload: e,
                                  })
                                }}
                              />
                            </Form.Item>
                          </Column>
                        )}
                      </Columns>
                    </Column>
                  </Columns>
                </Form.Item>

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
                              defaultValue={networkConfig.external}
                              onChange={e =>
                                dispatchNetworkConfig({
                                  type: 'SET_EXTERNAL',
                                  payload: e,
                                })
                              }
                            >
                              {BINARY_OPTIONS.map((option, idx) => {
                                const externalState = getExternalNetworkState()
                                const isUseOption = idx === 1 // "Use" option

                                return externalState.showTooltip ? (
                                  <Tooltip
                                    key={option.value}
                                    content={externalState.tooltipContent}
                                    placement="right"
                                  >
                                    <RadioButton
                                      id={`radio.${idx}`}
                                      value={option.value}
                                      disabled={
                                        isUseOption && externalState.disabled
                                      }
                                    >
                                      {option.label}
                                    </RadioButton>
                                  </Tooltip>
                                ) : (
                                  <RadioButton
                                    key={option.value}
                                    id={`radio.${idx}`}
                                    value={option.value}
                                    disabled={
                                      isUseOption && externalState.disabled
                                    }
                                  >
                                    {option.label}
                                  </RadioButton>
                                )
                              })}
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
                                  defaultValue={DEFAULT_MTU}
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
                            label={t('RESOURCES_DEFAULT_ROUTE')}
                            rules={[{ required: true }]}
                          >
                            <RadioGroup
                              name="default_route"
                              wrapClassName="radio"
                              defaultValue={defaultRoute}
                              onChange={value => setDefaultRoute(value)}
                            >
                              {BINARY_OPTIONS.map(option => (
                                <RadioButton
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </RadioButton>
                              ))}
                            </RadioGroup>
                          </Form.Item>
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
                                <Input name="ip_pool_start" />
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
                            label={t('RESOURCES_NETWORK_OFFLOAD')}
                            rules={[{ required: true }]}
                          >
                            <RadioGroup
                              name="offload"
                              wrapClassName="radio"
                              defaultValue={networkConfig.networkOffload}
                              onChange={value =>
                                dispatchNetworkConfig({
                                  type: 'SET_NETWORK_OFFLOAD',
                                  payload: {
                                    value,
                                    configurable:
                                      networkConfig.networkOffloadConfigurable,
                                    info: networkConfig.networkOffloadInfo,
                                  },
                                })
                              }
                            >
                              {BINARY_OPTIONS.map(option =>
                                option.value ? (
                                  <Tooltip
                                    content={networkConfig.networkOffloadInfo}
                                    placement="right"
                                  >
                                    <RadioButton
                                      id="radio_offload_on"
                                      key={option.value}
                                      value={option.value}
                                      disabled={
                                        !networkConfig.networkOffloadConfigurable
                                      }
                                    >
                                      {option.label}
                                    </RadioButton>
                                  </Tooltip>
                                ) : (
                                  <RadioButton
                                    id="radio_offload_off"
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </RadioButton>
                                )
                              )}
                            </RadioGroup>
                          </Form.Item>
                          <Form.Item
                            label={t('RESOURCES_ELB_DEDICATED')}
                            rules={[{ required: true }]}
                          >
                            <RadioGroup
                              name="elb"
                              wrapClassName="radio"
                              defaultValue={false}
                            >
                              {BINARY_OPTIONS.map((option, idx) => {
                                const elbState = getElbDedicatedState()
                                const isUseOption = idx === 1

                                return elbState.showTooltip ? (
                                  <Tooltip
                                    key={option.value}
                                    content={elbState.tooltipContent}
                                    placement="right"
                                  >
                                    <RadioButton
                                      value={option.value}
                                      disabled={
                                        isUseOption && elbState.disabled
                                      }
                                    >
                                      {option.label}
                                    </RadioButton>
                                  </Tooltip>
                                ) : (
                                  <RadioButton
                                    key={option.value}
                                    value={option.value}
                                    disabled={isUseOption && elbState.disabled}
                                  >
                                    {option.label}
                                  </RadioButton>
                                )
                              })}
                            </RadioGroup>
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_GATEWAY_IP')}
                            rules={[
                              {
                                required: true,
                                message: t('RESOURCES_GATEWAY_IP_EMPTY_DESC'),
                              },
                              {
                                pattern: PATTERN_IP,
                                message: t('RESOURCES_GATEWAY_IP_POOL_VALID'),
                              },
                            ]}
                          >
                            <Input name="gateway_ip" />
                          </Form.Item>
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
                          <Input name="dns.1" />
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
                          <Input name="dns.2" />
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
                              />
                            </Form.Item>
                          </Column>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`Nexthop.${obj}`}
                                placeholder={t('Nexthop')}
                                onChange={e => onChangeNexthop(e, obj)}
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
                {validationErrors.hostRoute && (
                  <div className="form-item-error">
                    {validationErrors.hostRoute}
                  </div>
                )}
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

export default RegistModal
