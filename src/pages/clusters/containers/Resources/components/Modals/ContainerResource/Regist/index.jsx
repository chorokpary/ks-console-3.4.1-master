import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  Form,
  Input,
  Radio,
  Select,
  Tabs,
  TextArea,
} from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import classnames from 'classnames'

import { Modal } from 'components/Base'
import { ProjectSelect, PropertiesInput } from 'components/Inputs'
import { PATTERN_USER_NAME } from 'utils/constants'
import VmStore from 'stores/resources/vms'
import KaasStore from 'stores/resources/containerresource'
import TypeSelect from '../../../TypeSelect'
import CardSelect from '../../../CardSelect'
import styles from './index.scss'

const RegistModal = props => {
  const form = useRef()
  const [formData] = useState({})

  const vmStore = new VmStore()
  const kaasStore = new KaasStore()

  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default'
  )

  const [modelView, setModalView] = useState(true)
  const [regStep, setRegStep] = useState(1)

  const [, setFlavorDataList] = useState([])
  const [imageDataList, setImageDataList] = useState([])
  const [selectImageName, setSelectImageName] = useState('')
  const [imageOptionList, setImageOptionList] = useState([])
  const [networkDataList, setNetworkDataList] = useState([])
  const [sriovNetworkDataList, setSriovNetworkDataList] = useState([])
  const [securityGroupDataList, setSecurityGroupDataList] = useState([])
  const [storageClassDataList, setStorageClassDataList] = useState([])

  const [networkList, setNetworkList] = useState([])
  const [sriovNetworkList, setSriovNetworkList] = useState([])

  const [clusterName, setClusterName] = useState('')
  const [imageName, setImageName] = useState('')
  const [description, setDescription] = useState('')
  const [masterArchSelect, setMasterArchSelect] = useState('')
  const [masterKubeVersionSelect, setMasterKubeVersionSelect] = useState('')
  const [masterReplicas, setMasterReplicas] = useState(1)

  const [selectOsDistro, setSelectOsDistro] = useState('')
  const [cniSelect, setCniSelect] = useState('cilium')
  const [csiSelect, setCsiSelect] = useState('')
  const [elbSelect, setElbSelect] = useState('')
  const [expirationSelect, setExpirationSelect] = useState('10')
  const [ekgStack, setEkgStack] = useState([])
  const [storageClass, setStorageClass] = useState('')
  const [imageStorageClass, setImageStorageClass] = useState('')
  const [storageClassTab, setStorageClassTab] = useState('default') // 'default', 'image', 'manual'

  // options
  const [cnis, setCnis] = useState([])
  const [csis, setCsis] = useState([])
  const [features, setFeatures] = useState([])
  const [elbs, setElbs] = useState([])
  const [securityGroups, setSecurityGroups] = useState([])
  const [secureBoot, setSecureBoot] = useState(false)

  const [networkFlag, setNetworkFlag] = useState(1)
  const [networkName, setNetworkName] = useState('')
  const [isElb, setIsElb] = useState(false)

  const [isFirst, setIsFirst] = useState(true)

  const [osType] = useState('linux')
  const [osDistro, setOsDistro] = useState('ubuntu-2404')

  const [submitButtonFlag, setSubmitButtonFlag] = useState(false)

  // 레이블 관련 상태 추가
  const [nodeSelector, setNodeSelector] = useState({})
  const [nodeSelectorError, setNodeSelectorError] = useState(false)

  useEffect(() => {
    const getVmCreateData = async () => {
      const listFlavor = await vmStore.fetchVmListFlavor({
        sortBy: 'root_disk',
        ...props,
      })
      const listNetwork = await vmStore.fetchVmListNetwork({
        ...props,
      })
      const listSriovNetwork = await vmStore.fetchVmListSriovNetwork({
        ...props,
      })

      const listImage = await kaasStore.fetchListImage(props)

      const listStoregeClass = await vmStore.fetchVmListStoregeClass({
        ...props,
      })
      const listSecurityGroup = await vmStore.fetchVmListSecurityGroupSummray({
        ...props,
      })

      setFlavorDataList(listFlavor.flavors)
      setImageDataList(listImage._originData.images)
      setNetworkDataList(listNetwork.networks)
      setNetworkList(listNetwork.networks)
      setSriovNetworkDataList(listSriovNetwork.sriovs)
      setSriovNetworkList(listSriovNetwork.sriovs)
      setStorageClassDataList(listStoregeClass.user_sces)
      setSecurityGroupDataList(listSecurityGroup)
    }

    getVmCreateData()
  }, [])

  const projectFilteredData = project => {
    const networks = networkDataList.filter(obj => obj.project === project)
    setNetworkList(networks)
    const sriovNetworks = sriovNetworkDataList.filter(
      obj => obj.project === project
    )
    setSriovNetworkList(sriovNetworks)
    const sgs = securityGroupDataList
      .filter(obj => obj.project === project)
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    setSecurityGroups(sgs)
  }

  useEffect(() => {
    const csiData = request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.cluster}/edgetron/resources/capk/metadata/csis`
    )
    const resCsi = []
    csiData.then(response => {
      if (response.csis) {
        for (let i = 0, n = response.csis.length; i < n; i += 1) {
          resCsi.push({
            label: response.csis[i].name,
            value: response.csis[i].name,
            description: response.csis[i].description,
          })
        }
        setCsis(resCsi)
      }
    })

    const featureData = request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.cluster}/edgetron/resources/capk/metadata/features`
    )
    const resFeature = [
      {
        label: t('RESOURCES_SELECT_ALL'),
        value: 'all',
        icon: 'ico-etc-checkall',
      },
    ]
    featureData.then(response => {
      if (response.features) {
        for (let i = 0, n = response.features.length; i < n; i += 1) {
          resFeature.push({
            label: t(
              `RESOURCES_KAAS_FEATURE_${response.features[
                i
              ].name.toUpperCase()}`
            ),
            value: response.features[i].name,
            // icon: response.data.features[i].name.toLowerCase(),
            icon: `ico-etc-${response.features[i].name.toLowerCase()}`,
          })
        }
        setFeatures(resFeature)
      }
    })

    // hier
    const elbsData = request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.cluster}/edgetron/resources/capk/metadata/elbs`
    )
    const resElbs = []
    elbsData.then(response => {
      response?.elbs.forEach(items => {
        resElbs.push({
          label: items.name,
          value: items.name,
        })
      })
      setElbs(resElbs)
      setElbSelect(resElbs[0].label)
    })
  }, [])

  useEffect(() => {
    if (selectImageName) {
      const selectOs = imageOptionList.find(obj => selectImageName === obj.name)
      setSelectOsDistro(selectOs?.os_distro)
    }
  }, [selectImageName])

  useEffect(() => {
    if (selectOsDistro) {
      const cniData = request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.cluster}/edgetron/resources/capk/metadata/cnis/${selectOsDistro}`
      )
      const resCni = []
      cniData.then(response => {
        if (response.cnis) {
          for (let i = 0, n = response.cnis.length; i < n; i += 1) {
            resCni.push({
              label: response.cnis[i].name,
              value: response.cnis[i].name,
              description: response.cnis[i].description,
            })
          }
          setCnis(resCni)
        }
      })
    }
  }, [selectOsDistro])

  useEffect(() => {
    if (cnis.length > 0) {
      setCniSelect(cnis[0].value)
      // document.querySelector(
      //   'input[name="cni"]',
      // ).parentElement.previousElementSibling.innerText = cnis[0].value;
    }
  }, [cnis])

  const osDistroOptions = [
    { label: 'Ubuntu 2404', value: 'ubuntu-2404', icon: 'ico-os-ubuntu' },
    { label: 'RockyLinux 9', value: 'rocky-9', icon: 'ico-os-rocky' },
    { label: 'AlmaLinux 9', value: 'almalinux-9', icon: 'ico-os-almalinux' },
  ]

  const archOptions = () => {
    const uniqueArchOptions = new Set(
      imageDataList
        .filter(obj => obj.os_distro === osDistro)
        .map(obj => t(obj.arch_type))
    )
    return Array.from(uniqueArchOptions).map(arch => {
      let label
      switch (arch) {
        case 'x86_64':
          label = 'amd64'
          break
        case 'aarch64':
          label = 'arm64'
          break
        default:
          label = arch
      }
      return {
        label: t(label),
        value: t(arch),
        description: `${t(arch)} ${t('RESOURCES_CPU_ARCH')}`,
      }
    })
    // { label: 'amd64', value: 'x86_64' },
    // { label: 'arm64', value: 'aarch64' },
  }

  const kubeVersionOptions = () => {
    const uniqueKubeVersions = new Set(
      imageDataList
        .filter(
          obj =>
            obj.os_distro === osDistro &&
            obj.arch_type === masterArchSelect &&
            obj.accelerator_type.toLowerCase() === 'none'
        )
        .map(obj => t(obj.kube_version))
    )
    return Array.from(uniqueKubeVersions).map(version => ({
      label: t(version),
      value: t(version),
      description: `${t('RESOURCES_KUBERNETES')} ${t(version)} ${t(
        'RESOURCES_VERSION'
      )}`,
    }))
  }

  const imageOptions = () => {
    return imageOptionList.map(obj => {
      // const exceptonArray = ['ubuntu', 'centos']
      // const distroType = exceptonArray.includes(obj.distro_type) ? obj.distro_type : "linux"
      const distroType = obj.os_distro.split('-')[0]
      return {
        label: t(obj.name),
        icon: `ico-os-${distroType}`,
        value: t(obj.name),
        description: t(obj.description),
        disabled: obj.phase !== 'Succeeded',
      }
    })
  }

  const storageClassOptions = () => {
    return storageClassDataList.map(obj => {
      return {
        label: t(obj.name),
        value: t(obj.name),
      }
    })
  }

  const expirationOption = [
    { label: `1${t('RESOURCES_YEAR')}`, value: 1 },
    { label: `2${t('RESOURCES_YEAR')}`, value: 2 },
    { label: `3${t('RESOURCES_YEAR')}`, value: 3 },
    { label: `4${t('RESOURCES_YEAR')}`, value: 4 },
    { label: `5${t('RESOURCES_YEAR')}`, value: 5 },
    { label: `6${t('RESOURCES_YEAR')}`, value: 6 },
    { label: `7${t('RESOURCES_YEAR')}`, value: 7 },
    { label: `8${t('RESOURCES_YEAR')}`, value: 8 },
    { label: `9${t('RESOURCES_YEAR')}`, value: 9 },
    { label: `10${t('RESOURCES_YEAR')}`, value: 10 },
  ]

  const handleOk = () => {
    const onOk = props.onOk
    form.current.validator(() => {
      setSubmitButtonFlag(true)

      const { data } = form.current.props

      data.project = projectName
      data.external_network = networkCheckItem
      data.sriov_networks = sriovCheckItems
      data.elb_network = elbCheckItem
      data.elb_type = elbSelect

      data.master_number = masterReplicas
      if (cniSelect) {
        data.cni = cniSelect
      }
      data.csi = csiSelect
      data.features = ekgStack
      data.expiration = expirationSelect
      data.private_registry = tab === 'private'
      data.secure_boot = secureBoot
      data.node_selectors = nodeSelector
      data.storage_class = storageClass
      data.security_groups = securityGroupCheckItems.map(
        item => `${projectName}/${item}`
      )
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    props.startRefresh()
    setModalView(false)
  }

  const stepMoveCheck = step => {
    const { data } = form.current.props

    if (step === 1) {
      if (isFirst) {
        if (networkList.length > 0) {
          handleSingleCheck(
            networkList.filter(el => el.external)[0].name,
            'network'
          )
          setNetworkName(networkList.filter(el => el.external)[0].name)
        }
        setCniSelect(cnis?.[0]?.value || 'cilium')
        setCsiSelect(csis?.[0]?.value || '')
        setIsFirst(false)
      }

      if (
        data.name === undefined ||
        !PATTERN_USER_NAME.test(data.name) ||
        data.image === t('RESOURCES_SELECT') ||
        data.masterFlavor === t('RESOURCES_SELECT')
      ) {
        handleOk()
      } else {
        setRegStep(2)
        projectFilteredData(projectName)
      }
    }

    if (step === 2) {
      if (!networkName) {
        return false
      }
      setRegStep(3)
    }

    if (step === 3) {
      if (nodeSelectorError) {
        return false
      }
      setClusterName(data.name)
      setImageName(data.image)
      setDescription(data.description)

      setRegStep(4)
      setSubmitButtonFlag(false)
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
                setRegStep(regStep - 1)
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(2)
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep === 3 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(regStep - 1)
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(3)
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep === 4 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(3)
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            {submitButtonFlag ? (
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
                loading={props.store.isSubmitting}
                disabled={props.store.isSubmitting}
              >
                {t('RESOURCES_CREATE')}
              </Button>
            )}
          </>
        )}
      </>
    )
  }
  const handleOsDistro = value => {
    setOsDistro(value)
    setSelectImageName('')
    setImageOptionList(
      imageDataList.filter(
        obj =>
          obj.accelerator_type.toLowerCase() === 'none' &&
          obj.os_distro === value &&
          obj.arch_type === masterArchSelect &&
          obj.kube_version === masterKubeVersionSelect
      )
    )
  }

  const handleMasterArch = value => {
    setMasterArchSelect(value)
    setSelectImageName('')
    setImageOptionList(
      imageDataList.filter(
        obj =>
          obj.accelerator_type.toLowerCase() === 'none' &&
          obj.os_distro === osDistro &&
          obj.arch_type === value &&
          obj.kube_version === masterKubeVersionSelect
      )
    )
  }

  const handleMasterKubeVersion = value => {
    setMasterKubeVersionSelect(value)
    setSelectImageName('')
    setImageOptionList(
      imageDataList.filter(
        obj =>
          obj.accelerator_type.toLowerCase() === 'none' &&
          obj.os_distro === osDistro &&
          obj.arch_type === masterArchSelect &&
          obj.kube_version === value
      )
    )
  }

  // 체크 리스트 시작 ==================================================
  const [networkCheckItem, setNetworkCheckItem] = useState('')
  const [sriovCheckItems, setSriovCheckItems] = useState([])
  const [elbCheckItem, setElbCheckItem] = useState('')
  const [securityGroupCheckItems, setSecurityGroupCheckItems] = useState([])

  const setVariables = {
    network: setNetworkCheckItem,
    sriov: setSriovCheckItems,
    elb: setElbCheckItem,
    security: setSecurityGroupCheckItems,
  }
  const dataListVariables = {
    sriov: sriovNetworkList,
    security: securityGroups,
  }
  const stateVariables = {
    sriov: sriovCheckItems,
    security: securityGroupCheckItems,
  }

  const handleSingleCheck = (name, type) => {
    setVariables[type](name)
    if (type !== 'elb' && type !== 'security') {
      setNetworkName(name)
    }
  }

  const handleSGCheck = (checked, name) => {
    if (checked) {
      setVariables['security'](prev => [...prev, name])
    } else {
      setVariables['security'](
        stateVariables['security'].filter(el => el !== name)
      )
    }
  }

  const handleSriovCheck = (checked, name) => {
    if (checked) {
      setVariables['sriov'](prev => [...prev, name])
      setNetworkName(name)
    } else {
      const filtered = stateVariables['sriov'].filter(el => el !== name)
      setVariables['sriov'](filtered)
      if (networkFlag === 2) {
        setNetworkName(filtered[0] || '')
      }
    }
  }

  const handleAllCheck = (checked, type) => {
    if (checked) {
      const nameArray = []
      dataListVariables[type].forEach(el => nameArray.push(el.name))
      setVariables[type](nameArray)
      if (type === 'sriov') {
        setNetworkName(nameArray[0] || '')
      }
    } else {
      setVariables[type]([])
      if (type === 'sriov' && networkFlag === 2) {
        setNetworkName('')
      }
    }
  }

  // Validation 시작 ==================================================

  const imageValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_IMAGE_TIP') })
    }
    callback()
  }

  // 스크립트 시작 ==================================================
  const onChangeNetwork = el => {
    setNetworkFlag(el)
    setNetworkName('')
    setSriovCheckItems([])
    handleSingleCheck('', 'network')
  }

  // cpu count
  const addMasterBtn = e => {
    e.preventDefault()
    if (masterReplicas < 5) {
      setMasterReplicas(masterReplicas + 2)
    }
  }
  const minusMasterBtn = e => {
    e.preventDefault()
    if (masterReplicas > 1) {
      setMasterReplicas(masterReplicas - 2)
    }
  }
  const handleEkgStack = e => {
    setEkgStack(e.filter(obj => obj !== 'all'))
  }

  // 레이블 관련 핸들러 추가
  const handleNodeSelectorChange = value => {
    setNodeSelector(value)
  }

  const handleNodeSelectorError = error => {
    setNodeSelectorError(!!error)
  }

  const [tab, setTab] = useState('private')
  const { TabPanel } = Tabs

  // 스크립트 끝 ==================================================

  return (
    <>
      <Modal
        icon="templet"
        width={840}
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
                  className={`${
                    regStep === 2
                      ? styles.current
                      : regStep > 2
                      ? styles.done
                      : styles.todo
                  }`}
                ></div>
              </div>
              <div className={styles.network}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_NETWORK_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep === 2
                    ? t('RESOURCES_CURRENT')
                    : regStep > 2
                    ? t('RESOURCES_COMPLETED_SETTINGS')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
            <div
              className={classnames(
                styles.process_item,
                `${regStep === 3 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${
                    regStep === 3
                      ? styles.current
                      : regStep > 3
                      ? styles.done
                      : styles.todo
                  }`}
                ></div>
              </div>
              <div className={styles.detail}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_DETAIL_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep === 3
                    ? t('RESOURCES_CURRENT')
                    : regStep > 3
                    ? t('RESOURCES_COMPLETED_SETTINGS')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
            <div
              className={classnames(
                styles.process_item,
                `${regStep === 4 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep === 4 ? styles.current : styles.todo}`}
                ></div>
              </div>
              <div className={styles.confirm}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_CHECK_INPUT_INFORMATION')}
                </div>
                <div className={styles.situation}>
                  {regStep === 4
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
                      label={t('NAME')}
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
                          name="metadata.namespace"
                          defaultValue={projectName}
                          cluster={props.cluster}
                          onChange={e => {
                            setProjectName(e)
                            setNetworkCheckItem('')
                            setSriovCheckItems([])
                            setElbCheckItem('')
                            setSecurityGroupCheckItems([])
                          }}
                        />
                      </Form.Item>
                    </Column>
                  )}
                </Columns>
                <div style={{ padding: 10 }} />
                {t('RESOURCES_OS_DISTRO')}
                <span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
                      <Form.Item
                        rules={[
                          {
                            required: true,
                            message: t('RESOURCES_SELECT_OS_TIP'),
                          },
                        ]}
                      >
                        <CardSelect
                          className={styles.customUl}
                          onChange={e => handleOsDistro(e)}
                          name="os_type"
                          options={osDistroOptions}
                          defaultValue={osDistro}
                        />
                      </Form.Item>
                    </Column>
                  </Columns>
                </Form.Group>
                ControlPlane
                <span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
                      <Form.Item>
                        <TypeSelect
                          name="masterArchitecture"
                          defaultValue={t('RESOURCES_SELECT')}
                          options={archOptions()}
                          placeholder={{ label: t('RESOURCES_SELECT') }}
                          onChange={e => handleMasterArch(e)}
                          defaultDescription={t(
                            'RESOURCES_SELECT_MASTER_ARCH_TIP'
                          )}
                        />
                      </Form.Item>
                      <Form.Item>
                        <TypeSelect
                          name="masterKubeVersion"
                          defaultValue={t('RESOURCES_SELECT')}
                          options={kubeVersionOptions()}
                          placeholder={{ label: t('RESOURCES_SELECT') }}
                          onChange={e => handleMasterKubeVersion(e)}
                          defaultDescription={t(
                            'RESOURCES_SELECT_MASTER_KUBE_VERSION_TIP'
                          )}
                        />
                      </Form.Item>
                      <Form.Item
                        rules={[{ required: true, validator: imageValidator }]}
                      >
                        <TypeSelect
                          name="image"
                          defaultValue={t('RESOURCES_SELECT')}
                          placeholder={{
                            label: t('RESOURCES_SELECT'),
                          }}
                          options={imageOptions()}
                          onChange={e => {
                            setSelectImageName(e)
                            // 이미지 선택 시 storage_class 업데이트
                            const imageSC = imageOptionList.find(
                              item => item.name === e
                            )?.storage_class
                            if (imageSC) {
                              setImageStorageClass(imageSC)
                            }
                            if (storageClassTab === 'image') {
                              setStorageClass(imageSC)
                            }
                          }}
                          defaultDescription={t('RESOURCES_SELECT_IMAGE_TIP')}
                        />
                      </Form.Item>
                      {selectImageName && (
                        <Form.Item>
                          <div className={styles.wrapperImageView}>
                            {`${osType[0].toUpperCase() +
                              osType.slice(
                                1,
                                osType.length
                              )} > ${selectImageName}`}
                          </div>
                        </Form.Item>
                      )}
                    </Column>
                    <Column>
                      <Form.Item label={t('RESOURCES_STORAGE_CLASS')}>
                        <Tabs
                          type="button"
                          activeName={storageClassTab}
                          onChange={newTab => {
                            setStorageClassTab(newTab)
                            if (newTab === 'default') {
                              setStorageClass('')
                            }
                            if (newTab === 'image') {
                              setStorageClass(imageStorageClass)
                            }
                          }}
                        >
                          <TabPanel
                            label={t('RESOURCES_DEFAULT')}
                            name="default"
                          />
                          <TabPanel
                            label={t('RESOURCES_IMAGE_CLASS')}
                            name="image"
                          />
                          <TabPanel
                            label={t('RESOURCES_MANUAL_SELECTION')}
                            name="manual"
                          />
                        </Tabs>
                      </Form.Item>
                      {storageClassTab === 'manual' && (
                        <Form.Item>
                          <Select
                            options={storageClassOptions()}
                            onChange={el => setStorageClass(el)}
                            value={
                              storageClass !== ''
                                ? storageClass
                                : t('RESOURCES_SELECT')
                            }
                          />
                        </Form.Item>
                      )}
                      {storageClassTab === 'image' && storageClass !== '' && (
                        <Form.Item>
                          <div className={styles.wrapperImageView}>
                            {storageClass}
                          </div>
                        </Form.Item>
                      )}
                      <Form.Item label={t('RESOURCES_VM_CUSTOM_SETTINGS')}>
                        <div className={styles.box_wrapper}>
                          <div className={styles.box_title}>
                            <Checkbox
                              checked={secureBoot}
                              onChange={sb => setSecureBoot(sb)}
                            >
                              {t('RESOURCES_ENABLE_SECURE_BOOT')}
                            </Checkbox>
                          </div>
                        </div>
                      </Form.Item>
                      <Form.Item
                        label={t('RESOURCES_NODE_COUNT')}
                        desc={t('RESOURCES_MASTER_COUNT_MAX_DESC')}
                      >
                        <div>
                          <Button icon="substract" onClick={minusMasterBtn} />
                          &nbsp;&nbsp;
                          <Input
                            name="masterNumber"
                            value={masterReplicas}
                            style={{ width: '20%', textAlign: 'center' }}
                          />
                          &nbsp;&nbsp;
                          <Button icon="add" onClick={addMasterBtn} />
                        </div>
                      </Form.Item>
                    </Column>
                  </Columns>
                </Form.Group>
                <Form.Item
                  className={styles.textarea}
                  label={t('RESOURCES_DESCRIPTION')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea name="description" maxLength={256} />
                </Form.Item>
                <div style={{ padding: 25 }} />
              </div>
              {/* 기본설정 설정 끝========================================== */}

              {/* 네트워크 설정 시작========================================== */}
              <div className={`${regStep === 2 ? '' : 'hide'}`}>
                {t('RESOURCES_NETWORK')}
                <span className="form-item-required">*</span>
                <Form.Item>
                  <Form.Group>
                    <Form.Item>
                      <div>
                        <Select
                          options={[
                            { label: t('RESOURCES_NETWORK'), value: 1 },
                            { label: t('RESOURCES_SR_IOV_NETWORK'), value: 2 },
                          ]}
                          onChange={e => onChangeNetwork(e)}
                          defaultValue={1}
                        />
                      </div>
                    </Form.Item>

                    <Form.Item
                      label={t('RESOURCES_NETWORK')}
                      className={`${networkFlag === 1 ? '' : 'hide'}`}
                    >
                      <div className={styles.wrapper}>
                        <div className={styles.table}>
                          <table>
                            <colgroup>
                              <col width="5%" />
                              <col width="20%" />
                              <col width="15%" />
                              <col width="20%" />
                              <col width="20%" />
                              <col width="20%" />
                            </colgroup>
                            <thead>
                              <tr>
                                <th>
                                  <Checkbox
                                    name="select-all-sriov"
                                    onChange={checked =>
                                      handleAllCheck(checked, 'sriov')
                                    }
                                    checked={
                                      !!(
                                        dataListVariables['sriov'].length > 0 &&
                                        stateVariables['sriov'].length ===
                                          dataListVariables['sriov'].length
                                      )
                                    }
                                  />
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                                </th>
                                <th>
                                  <strong>
                                    {t('RESOURCES_NETWORK_TYPE_YOO')}
                                  </strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_DEFAULT_PATH')}</strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_CIDR')}</strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_GATEWAY')}</strong>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {!networkList?.filter(el => el.external)
                                .length && (
                                <tr>
                                  <td colSpan="6" className="no-data">
                                    <p>
                                      {t(
                                        'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                      )}
                                    </p>
                                  </td>
                                </tr>
                              )}
                              {networkList
                                ?.filter(el => el.external)
                                .map(data => (
                                  <tr key={data.name}>
                                    <td>
                                      <Radio
                                        name={`select-${data.name}`}
                                        checked={data.name === networkCheckItem}
                                        onChange={() =>
                                          handleSingleCheck(
                                            data.name,
                                            'network'
                                          )
                                        }
                                      />
                                    </td>
                                    <td>{data.name}</td>
                                    <td>{data.type.toUpperCase()}</td>
                                    <td>
                                      {data.default_route
                                        ? t('RESOURCES_USE')
                                        : t('RESOURCES_NOT_USE')}
                                    </td>
                                    <td>{data.cidr}</td>
                                    <td>{data.gateway_ip}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Form.Item>

                    <Form.Item
                      label={t('RESOURCES_SR_IOV_NETWORK')}
                      className={`${networkFlag === 2 ? '' : 'hide'}`}
                    >
                      <div className={styles.wrapper}>
                        <div className={styles.table}>
                          <table>
                            <colgroup>
                              <col width="5%" />
                              <col width="25%" />
                              <col width="20%" />
                              <col width="25%" />
                              <col width="25%" />
                            </colgroup>
                            <thead>
                              <tr>
                                <th></th>
                                <th>
                                  <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                                </th>
                                <th>
                                  <strong>
                                    {t('RESOURCES_NETWORK_TYPE_YOO')}
                                  </strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_CIDR')}</strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_GATEWAY')}</strong>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {!sriovNetworkList?.length && (
                                <tr>
                                  <td colSpan="5" className="no-data">
                                    <p>
                                      {t(
                                        'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                      )}
                                    </p>
                                  </td>
                                </tr>
                              )}
                              {sriovNetworkList?.map(data => (
                                <tr key={data.name}>
                                  <td>
                                    <Checkbox
                                      name={`select-${data.name}`}
                                      checked={
                                        !!stateVariables['sriov'].includes(
                                          data.name
                                        )
                                      }
                                      onChange={checked =>
                                        handleSriovCheck(checked, data.name)
                                      }
                                    />
                                  </td>
                                  <td>{data.name}</td>
                                  <td>{data.type.toUpperCase()}</td>
                                  <td>{data.cidr}</td>
                                  <td>{data.gateway_ip}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Form.Item>
                    <div
                      className={`form-item-error ${
                        !networkName ? '' : 'hide'
                      }`}
                    >
                      {t('RESOURCES_SELECT_NETWORK_TIP')}
                    </div>
                  </Form.Group>
                </Form.Item>

                <Form.Item label={t('RESOURCES_SECURITY_GROUP')}>
                  <div className={styles.wrapper}>
                    {stateVariables['security'].length > 0 && (
                      <div
                        className={classnames(
                          styles.table_title,
                          styles.table_title_bg
                        )}
                      >
                        <Button
                          className={styles.table_title_button}
                          onClick={() => handleAllCheck(false, 'security')}
                        >
                          {t('RESOURCES_ALL_DESELECT')}
                        </Button>
                        {stateVariables['security'].length}
                        {t('RESOURCES_COUNT')} {t('RESOURCES_SELECT')}
                      </div>
                    )}
                    <div className={styles.table}>
                      <table>
                        <colgroup>
                          <col width="5%" />
                          <col width="30%" />
                          <col width="30%" />
                          <col width="20%" />
                          <col width="20%" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>
                              <Checkbox
                                name="select-all-security"
                                onChange={checked =>
                                  handleAllCheck(checked, 'security')
                                }
                                checked={
                                  !!(
                                    dataListVariables['security'].length > 0 &&
                                    stateVariables['security'].length ===
                                      dataListVariables['security'].length
                                  )
                                }
                              />
                            </th>
                            <th>
                              <strong>
                                {t('RESOURCES_SECURITY_GROUP_NAME')}
                              </strong>
                            </th>
                            <th>
                              <strong>{t('RESOURCES_DESCRIPTION')}</strong>
                            </th>
                            <th>
                              <strong>
                                {t('RESOURCES_INBOUND_RULE_COUNT')}
                              </strong>
                            </th>
                            <th>
                              <strong>
                                {t('RESOURCES_OUTBOUND_RULE_COUNT')}
                              </strong>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {!securityGroups?.length && (
                            <tr>
                              <td colSpan="5" className="no-data">
                                <p>
                                  {t(
                                    'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                  )}
                                </p>
                              </td>
                            </tr>
                          )}
                          {securityGroups?.map(data => (
                            <tr key={data.name}>
                              <td>
                                <Checkbox
                                  name={`select-${data.name}`}
                                  checked={
                                    !!stateVariables['security'].includes(
                                      data.name
                                    )
                                  }
                                  onChange={checked =>
                                    handleSGCheck(checked, data.name)
                                  }
                                />
                              </td>
                              <td>{data.name}</td>
                              <td>{data.description}</td>
                              <td>{data.ingress}</td>
                              <td>{data.egress}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Form.Item>

                <Form.Group
                  label={t('ELB (External Load Balancer)')}
                  onChange={() => {
                    setIsElb(!isElb)
                    handleSingleCheck('', 'elb')
                  }}
                  checkable
                >
                  <Form.Item>
                    <Select
                      name="elbs"
                      options={elbs}
                      onChange={e => setElbSelect(e)}
                      defaultValue={elbSelect}
                    />
                  </Form.Item>

                  <Form.Item label={t('RESOURCES_NETWORK')}>
                    <div className={styles.wrapper}>
                      <div className={styles.table}>
                        <table>
                          <colgroup>
                            <col width="5%" />
                            <col width="20%" />
                            <col width="15%" />
                            <col width="20%" />
                            <col width="20%" />
                            <col width="20%" />
                          </colgroup>
                          <thead>
                            <tr>
                              <th></th>
                              <th>
                                <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                              </th>
                              <th>
                                <strong>
                                  {t('RESOURCES_NETWORK_TYPE_YOO')}
                                </strong>
                              </th>
                              <th>
                                <strong>{t('RESOURCES_DEFAULT_PATH')}</strong>
                              </th>
                              <th>
                                <strong>{t('RESOURCES_CIDR')}</strong>
                              </th>
                              <th>
                                <strong>{t('RESOURCES_GATEWAY')}</strong>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {!networkList?.filter(el => el.external).length && (
                              <tr>
                                <td colSpan="6" className="no-data">
                                  <p>
                                    {t(
                                      'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                    )}
                                  </p>
                                </td>
                              </tr>
                            )}
                            {networkList
                              ?.filter(el => el.external)
                              .map(data => (
                                <tr key={data.name}>
                                  <td>
                                    <Radio
                                      name={`select-${data.name}`}
                                      checked={data.name === elbCheckItem}
                                      onChange={() =>
                                        handleSingleCheck(data.name, 'elb')
                                      }
                                    />
                                  </td>
                                  <td>{data.name}</td>
                                  <td>{data.type.toUpperCase()}</td>
                                  <td>
                                    {data.default_route
                                      ? t('RESOURCES_USE')
                                      : t('RESOURCES_NOT_USE')}
                                  </td>
                                  <td>{data.cidr}</td>
                                  <td>{data.gateway_ip}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Form.Item>
                </Form.Group>
              </div>
              {/* 네트워크 설정 끝========================================== */}

              {/* 세부 설정 시작========================================== */}
              <div className={`${regStep === 3 ? '' : 'hide'}`}>
                {/* <Form.Group label="Plug-in" checkable keepDataWhenUnCheck>
                  <Columns>
                    <Column>
                      <Form.Item label={'CNI  (Container Network Interface)'}>
                        <Select
                          name="cni"
                          options={cnis}
                          onChange={el => setCniSelect(el)}
                          defaultValue={cniSelect}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <div>
                        <Form.Item label={'CSI  (Container Storage Interface)'}>
                          <Select
                            name="csi"
                            options={csis}
                            onChange={el => setCsiSelect(el)}
                            defaultValue={csiSelect}
                          />
                        </Form.Item>
                      </div>
                    </Column>
                  </Columns>
                </Form.Group> */}

                <Form.Group label="Plug-in" checkable keepDataWhenUnCheck>
                  <Form.Item label={t('RESOURCES_CNI_DESC')}>
                    <TypeSelect
                      name="cni"
                      defaultValue={cniSelect}
                      onChange={e => setCniSelect(e)}
                      placeholder={{ label: t('RESOURCES_SELECT') }}
                      defaultDescription={t('RESOURCES_SELECT_CNI')}
                      // {t(
                      //   'RESOURCES_CLUSTER_FAULT_MODAL_OPERATOR_DESC',
                      // )}
                      options={cnis}
                    />
                  </Form.Item>
                  <Form.Item label={t('RESOURCES_CSI_DESC')}>
                    <TypeSelect
                      name="csi"
                      defaultValue={csiSelect}
                      onChange={e => setCsiSelect(e)}
                      placeholder={{ label: t('RESOURCES_SELECT') }}
                      defaultDescription={t('RESOURCES_SELECT_CSI')}
                      // defaultDescription={t(
                      //   'RESOURCES_CLUSTER_FAULT_MODAL_OPERATOR_DESC',
                      // )}
                      options={csis}
                    />
                  </Form.Item>
                </Form.Group>

                <Form.Item label={t('RESOURCES_PETASUS_KUBERNETES_STACK')}>
                  <Form.Group>
                    <Form.Item>
                      <CardSelect
                        className={styles.customStackUl}
                        onChange={e => handleEkgStack(e)}
                        options={features}
                        value={ekgStack}
                        customSize={[`100%`, `0%`]}
                      />
                    </Form.Item>
                  </Form.Group>
                </Form.Item>

                {/* 노드셀렉터 레이블 입력 필드 추가 */}
                <Form.Item label={t('ADD_NODE_SELECTOR')}>
                  <div className={styles.box_wrapper}>
                    <div
                      className={`form-item-error ${
                        nodeSelectorError ? '' : 'hide'
                      }`}
                    >
                      {t('ADD_NODE_SELECTOR_TIP')}
                    </div>
                    <div className={styles.box_title}>
                      <PropertiesInput
                        value={nodeSelector}
                        onChange={handleNodeSelectorChange}
                        onError={handleNodeSelectorError}
                        addText={t('ADD')}
                      />
                    </div>
                  </div>
                </Form.Item>

                <Columns>
                  <Column>
                    <Form.Item label={t('RESOURCES_CONTAINER_IMAGE')}>
                      <Tabs
                        type="button"
                        activeName={tab}
                        onChange={newTab => setTab(newTab)}
                      >
                        <TabPanel
                          label={t('RESOURCES_PRIVATE')}
                          name="private"
                        />
                        <TabPanel label={t('RESOURCES_PUBLIC')} name="public" />
                      </Tabs>
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_CERTIFICATE_EXPIRATION_PERIOD')}
                    >
                      <Select
                        name="expiration"
                        options={expirationOption}
                        defaultValue={10}
                        onChange={el => setExpirationSelect(el)}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
              </div>
              {/* 세부 설정 끝========================================== */}

              {/* 입력 정보 확인 시작========================================== */}
              <div className={`${regStep === 4 ? '' : 'hide'}`}>
                <div className={styles.boxwrap}>
                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.basic}></span>
                        <label>{t('RESOURCES_DEFAULT_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(1)
                        }}
                      ></Button>
                    </div>
                    <div className={styles.greybgbox}>
                      <div className={styles.list} style={{ width: '25%' }}>
                        <label>{t('RESOURCES_NAME')}</label>
                        <div className={styles.bold}>{clusterName}</div>
                      </div>
                      {projectName && (
                        <div className={styles.list}>
                          <label>{t('RESOURCES_PROJECT')}</label>
                          <div className={styles.bold}>{projectName}</div>
                        </div>
                      )}
                      <div className={styles.list} style={{ width: '35%' }}>
                        <label>{t('RESOURCES_IMAGE')}</label>
                        <div className={styles.multiline}>
                          <div className={styles.bold}>{imageName}</div>
                        </div>
                      </div>
                      <div className={styles.list} style={{ width: '40%' }}>
                        <label>{t('RESOURCES_DESCRIPTION')}</label>
                        <div>{description}</div>
                      </div>
                      {storageClass && (
                        <div className={styles.list} style={{ width: '40%' }}>
                          <label>{t('RESOURCES_STORAGE_CLASS')}</label>
                          <div className={styles.bold}>{storageClass}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.network}></span>
                        <label>{t('RESOURCES_NETWORK_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(2)
                        }}
                      ></Button>
                    </div>
                    <label className={`${networkFlag === 1 ? '' : 'hide'}`}>
                      {t('RESOURCES_NETWORK')}
                    </label>
                    {networkList
                      .filter(x => networkCheckItem === x.name)
                      .map((obj, index) => (
                        <div className={styles.greybgbox} key={index}>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_NAME')}</label>
                            <div>{obj.name}</div>
                          </div>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_TYPE_YOO')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.type}</div>
                            </div>
                          </div>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_CIDR')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.cidr}</div>
                            </div>
                          </div>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_GATEWAY')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.gateway_ip}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    <label className={`${networkFlag === 2 ? '' : 'hide'}`}>
                      {t('RESOURCES_SR_IOV_NETWORK')}
                    </label>
                    {sriovNetworkList
                      .filter(x => sriovCheckItems.includes(x.name))
                      .map((obj, index) => (
                        <div className={styles.greybgbox} key={index}>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_NAME')}</label>
                            <div>{obj.name}</div>
                          </div>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_TYPE_YOO')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.type}</div>
                            </div>
                          </div>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_CIDR')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.cidr}</div>
                            </div>
                          </div>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_GATEWAY')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.gateway_ip}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    <label>{t('RESOURCES_SECURITY_GROUP')}</label>
                    <div className={styles.greybgbox}>
                      {securityGroupCheckItems.length === 0
                        ? t('RESOURCES_NOT_SELECTED')
                        : securityGroupCheckItems.join(', ')}
                    </div>
                    <label
                      className={`${
                        networkList.filter(x => elbCheckItem === x.name)
                          .length > 0
                          ? ''
                          : 'hide'
                      }`}
                    >
                      ELB ({elbSelect})
                    </label>
                    {networkList
                      .filter(x => elbCheckItem === x.name)
                      .map((obj, index) => (
                        <div className={styles.greybgbox} key={index}>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_NAME')}</label>
                            <div>{obj.name}</div>
                          </div>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_TYPE_YOO')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.type}</div>
                            </div>
                          </div>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_CIDR')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.cidr}</div>
                            </div>
                          </div>
                          <div
                            className={styles.list}
                            style={{ width: '100%' }}
                          >
                            <label>{t('RESOURCES_GATEWAY')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.gateway_ip}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.detail}></span>
                        <label>{t('RESOURCES_DETAIL_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(3)
                        }}
                      ></Button>
                    </div>
                    <div className={styles.greybgbox}>
                      <div className={styles.list}>
                        <label>{t('RESOURCES_PLUG_IN')}</label>
                        <div className="multiline">
                          <div>
                            {t('RESOURCES_CNI')}: {cniSelect}
                          </div>
                          <div>
                            {t('RESOURCES_CSI')}: {csiSelect}
                          </div>
                        </div>
                      </div>
                      <div className={styles.list} style={{ width: '100%' }}>
                        <label>{t('RESOURCES_PETASUS_KUBERNETES_STACK')}</label>
                        <div className={styles.multiline}>
                          {ekgStack.map((obj, index) => (
                            <div key={index}>{obj}</div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.list} style={{ width: '100%' }}>
                        <label style={{ width: '100%' }}>
                          {t('RESOURCES_CONTAINER_IMAGE')}
                        </label>
                        <div>
                          {tab === 'private'
                            ? t('RESOURCES_PRIVATE')
                            : t('RESOURCES_PUBLIC')}
                        </div>
                      </div>
                      <div className={styles.list} style={{ width: '100%' }}>
                        <label style={{ width: '100%' }}>
                          {t('RESOURCES_CERTIFICATE_EXPIRATION_PERIOD')}
                        </label>
                        <div>
                          {expirationSelect}
                          {t('RESOURCES_YEAR')}
                        </div>
                      </div>
                      {/* 레이블 정보 표시 추가 */}
                      {Object.keys(nodeSelector).length > 0 && (
                        <div className={styles.list} style={{ width: '100%' }}>
                          <label style={{ width: '100%' }}>
                            {t('ADD_NODE_SELECTOR')}
                          </label>
                          <div className={styles.multiline}>
                            {Object.entries(nodeSelector).map(
                              ([key, value]) => (
                                <div key={key}>
                                  {key}: {value}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 입력 정보 확인 끝========================================== */}
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
