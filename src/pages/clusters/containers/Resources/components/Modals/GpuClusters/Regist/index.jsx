import { find, get, range } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'

import { Modal } from 'components/Base'
import { ProjectSelect, UnitSlider } from 'components/Inputs'
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputPassword,
  Notify,
  Select,
  Tabs,
  TextArea,
} from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import * as common from 'utils/resources'
import { PATTERN_PACKAGE_NAME, PATTERN_USER_NAME } from 'utils/constants'
import classnames from 'classnames'
import VmStore from 'stores/resources/vms'
import QuotaStore from 'stores/quota'
import GpuClustersStore from 'stores/resources/gpuclusters';

import TypeSelect from '../../../TypeSelect'
import CardSelect from '../../../CardSelect'

import styles from './index.scss'
import './checkbox.disabled.css'


const regexRootDisk = /^[1-9][0-9]*$/;

const RegistModal = props => {
  const form = useRef()
  const [formData] = useState({})

  const vmStore = new VmStore()
  const quotaStore = new QuotaStore()
  const gpuStore = new GpuClustersStore()

  const [modelView, setModalView] = useState(true)
  const [regStep, setRegStep] = useState(1)

  const [flavorDataList, setFlavorDataList] = useState([])
  const [imageDataList, setImageDataList] = useState([])
  const [bootVolumeDataList, setBootVolumeDataList] = useState([])
  const [nodeDataList, setNodeDataList] = useState([])
  const [keypairDataList, setKeypairDataList] = useState([])
  const [networkDataList, setNetworkDataList] = useState([])
  const [sriovNetworkDataList, setSriovNetworkDataList] = useState([])
  const [securityGroupDataList, setSecurityGroupDataList] = useState([])
  const [storageClassDataList, setStorageClassDataList] = useState([])
  const [availableIpList, setAvailableIpList] = useState([])
  const [selectedIpList, setSelectedIpList] = useState([])
  const [availableSriovIpList, setAvailableSriovIpList] = useState([])
  const [selectedSriovIpList, setSelectedSriovIpList] = useState([])

  const [networkList, setNetworkList] = useState([])
  const [sriovNetworkList, setSriovNetworkList] = useState([])
  const [securityGroupList, setSecurityGroupList] = useState([])
  const [keypairList, setKeypairList] = useState([])

  const [selectImageName, setSelectImageName] = useState()
  const [selectBootId, setSelectBootId] = useState()
  const [busType, setBusType] = useState('virtio')
  const [selectFlavorName, setSelectFlavorName] = useState()
  const [selectImageDistroType, setSelectImageDistroType] = useState()

  const [imageOptionList, setImageOptionList] = useState([])

  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default'
  )

  const [vmName, setVmName] = useState('')
  const [imageName, setImageName] = useState('')
  const [preInstalledApp, setPreInstalledApp] = useState('None')
  const [bootVolumeName, setBootVolumeName] = useState('')
  const [flavorName, setFlavorName] = useState('')
  const [flavorCpu, setFlavorCpu] = useState('')
  const [flavorMemory, setFlavorMemory] = useState('')
  const [flavorDisk, setFlavorDisk] = useState('')
  const [description, setDescription] = useState('')
  const [keypairName, setKeypairName] = useState('')
  const [nodeName, setNodeName] = useState('')
  const [storageClass, setStorageClass] = useState('')
  const [secureBoot, setSecureBoot] = useState(false)

  const [vmCount, setVmCount] = useState('1');
  const [gpuVmName, setGpuVmName] = useState('');
  const [slideMinCount, setSlideMinCount] = useState(1)
  const [slideMaxCount, setSlideMaxCount] = useState(127)
  const [firstGpuVmName, setFirstGpuVmName] = useState('');
  const [lastGpuVmName, setLastGpuVmName] = useState('');


  const [imageType, setImageType] = useState('I')
  const [osType, setOsType] = useState('linux')

  const [submitButtonFlag, setSubmitButtonFlag] = useState(false)

  const [isProjectQuotaSet, setIsProjectQuotaSet] = useState(false)
  const [isScript, setIsScript] = useState(false)
  const [isJupyterConfig, setIsJupyterConfig] = useState(false)
  const [isPassword, setIsPassword] = useState(false)
  const [isPackage, setIsPackage] = useState(false)
  const [isFileWrite, setIsFileWrite] = useState(false)
  const [isUserScript, setIsUserScript] = useState(false)

  const [jupyterToken, setJupyterToken] = useState('')

  const [isJupyterPortError, setIsJupyterPortError] = useState(false)
  const [isJupyterTokenError, setIsJupyterTokenError] = useState(false)
  const [isPasswordError, setIsPasswordError] = useState(false)
  const [isPackageError, setIsPackageError] = useState(false)
  const [isFileWriteError, setIsFileWriteError] = useState(false)
  const [isUserScriptError, setIsUserScriptError] = useState(false)
  const [isKeypiarPasswordError, setIsKeypiarPasswordError] = useState(false)

  const [packageValidationError, setIsPackageValidationError] = useState(false)

  const [flavorSizeCheck, setFlavorSizeCheck] = useState(true)

  // const initialScriptId1 = useRef('');
  useEffect(() => {
    const getProjectQuota = async () => {
      const listFlavor = await vmStore.fetchVmListFlavor({
        sortBy: 'root_disk',
        ...props,
      })

      const resourceQuota = await quotaStore.fetch({
        ...props,
        namespace: projectName,
      })
      if (
        'hard' in resourceQuota.data &&
        ('limits.cpu' in resourceQuota.data.hard ||
          'limits.memory' in resourceQuota.data.hard)
      ) {
        setIsProjectQuotaSet(true)
        setFlavorDataList(
          listFlavor.flavors.filter(flavor =>
            flavor.extra_specs.some(
              spec => spec.key === 'cpu-pinning' && spec.value === 'True'
            )
          )
        )
      } else {
        setIsProjectQuotaSet(false)
        setFlavorDataList(listFlavor.flavors)
      }
    }
    getProjectQuota()
  }, [projectName])

  useEffect(() => {
    const getGpuVmCount = async () => {
      const vmData = await gpuStore.fetchVmsDetail({ ...props, limit: 10000 })
      const vmList = vmData.vmList;

      if (vmList && vmList.length > 0) {
        const lastVmNumber = vmList.length;
        setSlideMinCount(lastVmNumber+1)
        setSlideMaxCount(127-lastVmNumber)
        setVmCount(1)
      }
    }
    getGpuVmCount()

    const getVmImage = async () => {
      const listImage = await vmStore.fetchVmListImage({ ...props })
      setImageDataList(listImage.images)
      setImageOptionList(
        listImage.images.filter(obj => obj.os_type !== 'windows')
      )
    }
    getVmImage()

    const getVmCreateData = async () => {
      const listAvailableIps = await vmStore.fetchAllAvailableIps({ ...props })
      const listAvailableSriovIps = await vmStore.fetchAllAvailableSriovIps({
        ...props,
      })
      const listBootVolume = await vmStore.fetchVmListBootVolume({ ...props })
      const listNetwork = await vmStore.fetchVmListNetwork({ ...props })
      const listSriovNetwork = await vmStore.fetchVmListSriovNetwork({
        ...props,
      })
      const listKeypair = await vmStore.fetchVmListKeypair({ ...props })
      const listNode = await vmStore.fetchVmListNode({ ...props })
      const listSecurityGroup = await vmStore.fetchVmListSecurityGroup({
        ...props,
      })
      const listStoregeClass = await vmStore.fetchVmListStoregeClass({
        ...props,
      })

      setBootVolumeDataList(listBootVolume.volumes)
      setNetworkDataList(listNetwork.networks)
      setSriovNetworkDataList(listSriovNetwork.sriovs)
      setKeypairDataList(listKeypair.keypairs)
      setNodeDataList(listNode.nodes.filter(obj => obj.node_role !== 'master'))
      setSecurityGroupDataList(listSecurityGroup)
      setStorageClassDataList(listStoregeClass.user_sces)
      setAvailableIpList(listAvailableIps.all_ips)
      setAvailableSriovIpList(listAvailableSriovIps.all_ips)
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
    const securityGroups = securityGroupDataList
      .filter(obj => obj.project === project)
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    setSecurityGroupList(securityGroups)
    const keypairs = keypairDataList.filter(obj => obj.project === project)
    setKeypairList(keypairs)
  }

  const osTypeOptions = [
    { label: 'Linux', value: 'linux', icon: 'ico-linux' },
    { label: 'Windows', value: 'windows', icon: 'ico-windows' },
    // { label: 'etc', value: '', icon: 'ico-plus', }
  ]

  const availableIpOptions = netId => {
    const networkIps = availableIpList.find(obj => obj.network === netId)
    if (networkIps !== undefined) {
      return networkIps.ips.map(ip => {
        return {
          label: t(ip),
          value: t(ip),
        }
      })
    }
  }

  const handleIpSelectClick = (netId, val) => {
    const record = {}
    record.network_name = netId
    record.fixed_ip = val
    const existing = selectedIpList.filter(obj => obj.network_name !== netId)
    if (val !== t('RESOURCES_SELECT') && val !== undefined) {
      existing.push(record)
    }
    setSelectedIpList(existing)

    const updatedNetworkList = networkList.map(item => {
      if (item.id === netId) {
        return { ...item, ip: val }
      }
      return item
    })

    setNetworkList(updatedNetworkList)
  }

  const availableSriovIpOptions = netName => {
    const networkIps = availableSriovIpList.find(obj => obj.network === netName)
    if (networkIps !== undefined) {
      return networkIps.ips.map(ip => {
        return {
          label: t(ip),
          value: t(ip),
        }
      })
    }
  }

  const handleSriovIpSelectClick = (netName, val) => {
    const record = {}
    record.network_name = netName
    record.fixed_ip = val
    const existing = selectedSriovIpList.filter(
      obj => obj.network_name !== netName
    )
    if (val !== t('RESOURCES_SELECT') && val !== undefined) {
      existing.push(record)
    }
    setSelectedSriovIpList(existing)

    const updatedSriovNetworkList = sriovNetworkList.map(item => {
      if (item.name === netName) {
        return { ...item, ip: val }
      }
      return item
    })

    setSriovNetworkList(updatedSriovNetworkList)
  }

  const storageClassOptions = () => {
    return storageClassDataList.map(obj => {
      return {
        label: t(obj.name),
        value: t(obj.name),
      }
    })
  }

  const imageOptions = () => {
    return imageOptionList.map(obj => {
      return {
        label: t(obj.name),
        icon: `ico-os-${obj.distro_type}`,
        description: t(obj.description),
        value: t(obj.name),
        disabled: obj.phase !== 'Succeeded',
      }
    })
  }

  const flavorOptions = () => {
    let size
    const regex = /[^0-9]/g
    let selectedRootDisk
    if (imageType === 'I') {
      selectedRootDisk = imageDataList.find(
        item => item.name === selectImageName
      )
      size = selectedRootDisk?.size.replace(regex, '') || 0
    } else {
      selectedRootDisk = bootVolumeDataList.find(obj => obj.id === selectBootId)
      size = selectedRootDisk?.capacity.replace(regex, '') || 0
    }

    return flavorDataList.map(obj => ({
      label: t(obj.name),
      description: `CPU ${obj.vcpus} Cores / Memory ${common.fnSetBytes(
        obj.ram
      )} GiB / Disk ${obj.root_disk} GiB`,
      value: t(obj.name),
      disabled: Number(obj.root_disk) < Number(size),
    }))
  }

  const bootvolumeOptions = () => {
    const filterData = bootVolumeDataList.filter(
      item =>
        !item.name.includes('boot-dv') &&
        !item.name.includes('boot-volume') &&
        !item.name.includes('bootdisk')
    )
    return filterData.map(obj => ({
      label: t(obj.name),
      value: t(obj.id),
    }))
  }

  const busTypeOptions = [
    { label: 'VirtIO', value: 'virtio' },
    { label: 'SATA', value: 'sata' },
    { label: 'SCSi', value: 'scsi' },
  ]

  const keypairOptions = () => {
    return keypairList.map(obj => ({
      label: t(obj.name),
      value: t(obj.name),
    }))
  }

  const nodeOptions = () => {
    return nodeDataList.map(obj => ({
      label: t(obj.name),
      value: t(obj.name),
    }))
  }

  const handleOk = () => {
    const onOk = props.onOk
    
    form.current.validator(() => {
      setSubmitButtonFlag(true)

      const { data } = form.current.props

      data.project = projectName
      data.network = networkCheckItems
      data.ips = selectedIpList
      data.sriov = sriovCheckItems
      data.sriovIps = selectedSriovIpList
      data.securitygroup = securityGroupCheckItems
      data.imageType = imageType
      data.busType = busType
      data.preInstalledApp = preInstalledApp

      data.bootvolume =
        data?.bootvolume === t('RESOURCES_SELECT') ? '' : data?.bootvolume
      data.keypair = data.keypair === t('RESOURCES_SELECT') ? '' : data.keypair
      data.node = data.node === t('RESOURCES_SELECT') ? '' : data.node
      data.storageClass = storageClass
      data.secureBoot = secureBoot
      data.gpuVmName = gpuVmName
      data.firstGpuVmName = firstGpuVmName
      data.lastGpuVmName = lastGpuVmName

      if (isScript) {
        data.makeScript = getScript()
      }

      onOk({ ...data })
    })
  }

  const getScript = () => {
    const { data } = form.current.props

    if (data.userScript !== '' && data.userScript !== undefined) {
      return {
        custom_script: data.userScript,
      }
    }

    const makeScript = {}

    if (listPasswordRoute.length !== 0) {
      const userPassWord = []
      listPasswordRoute.forEach(obj => {
        userPassWord.push({
          user_name: data[`scriptId_${obj}`],
          password: data[`scriptPassword_${obj}`],
        })
      })
      makeScript['user_password'] = userPassWord
    }

    const writeFiles = []
    listFileRoute.forEach(obj => {
      if (!!data[`scriptPath_${obj}`] && !!data[`scriptContent_${obj}`]) {
        writeFiles.push({
          path: data[`scriptPath_${obj}`],
          content: data[`scriptContent_${obj}`],
        })
      }
    })
    if (writeFiles.length !== 0) {
      makeScript['write_files'] = writeFiles
    }

    if (isJupyterConfig) {
      const preInstalled = {}
      preInstalled['jupyter_lab'] = {
        distro_type: selectImageDistroType,
        token: jupyterToken,
        port: data[`scriptJupyterPort`],
      }
      makeScript['pre_installed_app'] = preInstalled
    }

    return makeScript
  }

  const closeModal = () => {
    setModalView(false)
  }

  const stepMoveCheck = step => {
    const { data } = form.current.props
    if (step === 1) {
      if (
        imageType === 'I' &&
        (data.image === t('RESOURCES_SELECT') ||
          data.flavor === t('RESOURCES_SELECT'))
      ) {
        handleOk()
      } else {
        const imageSize =
          imageType === 'I'
            ? imageDataList
              .filter(item => item.name === selectImageName)
              .map(item => item.size)[0]
              .replace('Gi', '')
            : bootVolumeDataList
              .filter(item => item.id === selectBootId)
              .map(item => item.capacity)[0]
              .replace('Gi', '')
        const flavorSize = flavorDataList
          .filter(item => item.name === selectFlavorName)
          .map(item => item.root_disk)

        if (Number(flavorSize) >= Number(imageSize)) {
          setRegStep(2)
          setFlavorSizeCheck(true)
          projectFilteredData(projectName)
        } else {
          setFlavorSizeCheck(false)
        }
      }
    }
    if (step === 2) {
      setRegStep(3)
    }

    if (step === 3) {
      setImageName(data.image)
      setBootVolumeName(data.bootvolume)
      setFlavorName(data.flavor)
      setDescription(data.description)
      setKeypairName(
        data.keypair === t('RESOURCES_SELECT')
          ? ''
          : get(find(keypairList, { name: data.keypair }), 'name')
      )
      setNodeName(data.node === t('RESOURCES_SELECT') ? '' : data.node)

      const flavorData = flavorDataList.filter(obj => obj.name === data.flavor)
      setFlavorCpu(flavorData[0].vcpus)
      setFlavorMemory(common.fnSetBytes(flavorData[0].ram))
      setFlavorDisk(flavorData[0].root_disk)

      if (isScript) {
        const checkFlagJupyter = checkScriptJupyter()
        const checkFlagPassword = checkScriptPassword()
        const checkFlagFileWrite = checkScriptFilewrite()
        const checkFlagPackage = checkScriptPackage()
        const checkFlagUserScript = checkScriptUserScript()

        if (
          checkFlagJupyter ||
          checkFlagPassword ||
          checkFlagFileWrite ||
          checkFlagPackage ||
          checkFlagUserScript
        ) {
          return false
        }
      }

      // keypair 와 passworkd 둘다 설정하지 않을때...
      const checkFlagKeypairOrPassword = checkKeypairPassword()
      if (checkFlagKeypairOrPassword) {
        return false
      }

      setIsJupyterPortError(false)
      setIsJupyterTokenError(false)
      setIsPasswordError(false)
      setIsPackageError(false)
      setIsFileWriteError(false)
      setIsUserScriptError(false)
      setIsKeypiarPasswordError(false)
      setIsPackageValidationError(false)

      setRegStep(4)
      setSubmitButtonFlag(false)
    }
  }

  const generateToken = () => {
    let token = ''
    for (let i = 0; i < 48; i++) {
      const randomIndex = Math.floor(Math.random() * 16).toString(16)
      token += randomIndex
    }
    return token
  }

  // 스크립트 Validation 시작===================
  const checkScriptJupyter = () => {
    const hexRegex = /^[0-9a-fA-F]{48}$/
    if (isJupyterConfig) {
      const { data } = form.current.props
      if (
        data['scriptJupyterPort'] < 1024 ||
        data['scriptJupyterPort'] > 49151
      ) {
        setIsJupyterPortError(true)
        return true
      }
      if (!hexRegex.test(data['scriptJupyterToken'])) {
        setIsJupyterTokenError(true)
        return true
      }
      setJupyterToken(data['scriptJupyterToken'])
    }
    setIsJupyterPortError(false)
    setIsJupyterTokenError(false)
    return false
  }

  const checkScriptPassword = () => {
    if (isPassword) {
      const { data } = form.current.props
      try {
        listPasswordRoute.forEach(obj => {
          // eslint-disable-next-line no-empty
          if (!!data[`scriptId_${obj}`] && !!data[`scriptPassword_${obj}`]) {
          } else {
            setIsPasswordError(true)
            throw new Error(`Password error for ${obj}`)
          }
        })
      } catch (e) {
        return e
      }
    }
    setIsPasswordError(false)
    return false
  }

  const checkScriptFilewrite = () => {
    if (isFileWrite) {
      const { data } = form.current.props
      try {
        listFileRoute.forEach(obj => {
          // eslint-disable-next-line no-empty
          if (data[`scriptPath_${obj}`]) {
          } else {
            setIsFileWriteError(true)
            throw new Error(`File write error for ${obj}`)
          }
        })
      } catch (e) {
        return e
      }
    }
    setIsFileWriteError(false)
    return false
  }

  const checkScriptPackage = () => {
    if (isPackage) {
      const { data } = form.current.props
      try {
        listPackageRoute.forEach(obj => {
          if (
            !!data[`scriptPackage_${obj}`] &&
            !!data[`scriptVersion_${obj}`]
          ) {
            setIsPackageError(false)
            if (!PATTERN_PACKAGE_NAME.test(data[`scriptPackage_${obj}`])) {
              setIsPackageValidationError(true)
              throw new Error(`Package validation error for ${obj}`)
            }
          } else {
            if (!PATTERN_PACKAGE_NAME.test(data[`scriptPackage_${obj}`])) {
              setIsPackageValidationError(true)
            } else {
              setIsPackageValidationError(false)
            }
            setIsPackageError(true)
            throw new Error(`Package error for ${obj}`)
          }
        })
      } catch (e) {
        return e
      }
    }
    setIsPackageError(false)
    setIsPackageValidationError(false)
    return false
  }

  const checkScriptUserScript = () => {
    let flag = false
    if (isUserScript) {
      const { data } = form.current.props
      if (data['userScript']) {
        flag = false
        setIsUserScriptError(false)
      } else {
        flag = true
        setIsUserScriptError(true)
      }
    } else {
      setIsUserScriptError(false)
    }
    return flag
  }
  // 스크립트 Validation 끝===================

  const checkKeypairPassword = () => {
    const { data } = form.current.props

    let flag
    if (data['keypair']) {
      flag = false
    } else {
      (isScript && isPassword) ? (flag = false) : (flag = true)
    }

    flag ? setIsKeypiarPasswordError(true) : setIsKeypiarPasswordError(false)

    return flag
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
            {submitButtonFlag && props.isSubmitting ? (
              <>
                <Button
                  onClick={() => closeModal()}
                  className={classnames(styles['btn'], styles['btn-default'])}
                  disabled
                >
                  {t('RESOURCES_CANCEL')}
                </Button>
                <Button
                  onClick={() => {
                    setRegStep(3)
                  }}
                  className={classnames(styles['btn'], styles['btn-default'])}
                  disabled
                >
                  {t('RESOURCES_PREVIOUS')}
                </Button>
                <Button
                  onClick={() => {
                    handleOk()
                  }}
                  className={classnames(styles['btn'], styles['btn-control'])}
                  disabled
                  loading={true}
                >
                  {t('RESOURCES_CREATE')}
                </Button>
              </>
            ) : (
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
                <Button
                  onClick={() => {
                    handleOk()
                  }}
                  className={classnames(styles['btn'], styles['btn-control'])}
                >
                  {t('RESOURCES_CREATE')}
                </Button>
              </>
            )}
          </>
        )}
      </>
    )
  }

  // 설명이 길어지면 ui가 깨짐
  const handleOsType = value => {
    setOsType(value)
    setSelectImageName('')
    if (value === 'windows') {
      setImageOptionList(imageDataList.filter(obj => obj.os_type === 'windows'))
    } else if (value === 'linux') {
      setImageOptionList(imageDataList.filter(obj => obj.os_type !== 'windows'))
    } else {
      setImageOptionList([])
    }
  }

  // 체크 리스트 시작 ==================================================
  const [networkCheckItems, setNetworkCheckItems] = useState([])
  const [sriovCheckItems, setSriovCheckItems] = useState([])
  const [securityGroupCheckItems, setSecurityGroupCheckItems] = useState([])

  const dataListVariables = {
    network: networkList,
    sriov: sriovNetworkList,
    security: securityGroupList,
  }

  const stateVariables = {
    network: networkCheckItems,
    sriov: sriovCheckItems,
    security: securityGroupCheckItems,
  }

  const setVariables = {
    network: setNetworkCheckItems,
    sriov: setSriovCheckItems,
    security: setSecurityGroupCheckItems,
  }

  const handleSingleCheck = (checked, name, type) => {
    if (checked) {
      setVariables[type](prev => [...prev, name])
    } else {
      setVariables[type](stateVariables[type].filter(el => el !== name))
    }
  }

  const handleAllCheck = (checked, type) => {
    if (checked) {
      const nameArray = []
      dataListVariables[type].forEach(el =>
        // type === 'sriov' ? nameArray.push(el.name) : nameArray.push(el.id)
        nameArray.push(el.name)
      )      
      setVariables[type](nameArray)
    } else {
      setVariables[type]([])
    }
  }

  const handleDelete = (name, type) => {
    setVariables[type](stateVariables[type].filter(el => el !== name))
  }

  // 체크 리스트 끝 ==================================================

  // Validation 시작 ==================================================

  const imageValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_IMAGE_TIP') })
    }
    callback()
  }

  const bootVolumeValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_BOOT_VOLUME_TIP') })
    }
    callback()
  }

  const busTypeValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_BUS_TIP') })
    }
    callback()
  }

  const flavorValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_FLAVOR_TIP') })
    }
    callback()
  }
  // Validation 끝 ==================================================

  // 스크립트 시작 ==================================================
  const nextPasswordRoute = useRef(1)
  const [listPasswordRoute, setListPasswordRoute] = useState([1])

  // const imageDistroTypeRef = useRef();
  useEffect(() => {
    checkScriptPassword()
  }, [listPasswordRoute])

  const handlePasswordRoute = {
    addColumn: () => {
      if (listPasswordRoute.length > 4) {
        Notify.info(t('RESOURCES_ADD_UNTIL_FIVE'))
        return false
      }
      nextPasswordRoute.current += 1
      setListPasswordRoute(prevList => [...prevList, nextPasswordRoute.current])
    },

    delColumn: id => {
      if (listPasswordRoute.length === 1) {
        Notify.info(t('RESOURCES_DELETING_DEFAULT_NOT_ALLOWED'))
        return false
      }
      if (listPasswordRoute.length > 1 && id > 1)
        setListPasswordRoute(listPasswordRoute.filter(el => el !== id))
    },
  }

  const nextFileRoute = useRef(1)
  const [listFileRoute, setListFileRoute] = useState([1])

  useEffect(() => {
    checkScriptFilewrite()
  }, [listFileRoute])

  const handleFileRoute = {
    addColumn: () => {
      if (listFileRoute.length > 4) {
        Notify.info(t('RESOURCES_ADD_UNTIL_FIVE'))
        return false
      }
      nextFileRoute.current += 1
      setListFileRoute(fileRoutes => [...fileRoutes, nextFileRoute.current])
    },
    delColumn: id => {
      if (listFileRoute.length === 1) {
        Notify.info(t('RESOURCES_DELETING_DEFAULT_NOT_ALLOWED'))
        return false
      }
      if (listFileRoute.length > 1)
        setListFileRoute(listFileRoute.filter(el => el !== id))
    },
  }

  const nextPackageRoute = useRef(1)
  const [listPackageRoute, setlistPackageRoute] = useState([1])

  useEffect(() => {
    checkScriptPackage()
  }, [listPackageRoute])

  const handlePackageRoute = {
    addColumn: () => {
      if (listPackageRoute.length > 4) {
        Notify.info(t('RESOURCES_ADD_UNTIL_FIVE'))
        return false
      }
      nextPackageRoute.current += 1
      setlistPackageRoute(packageRoutes => [
        ...packageRoutes,
        nextPackageRoute.current,
      ])
    },
    delColumn: id => {
      if (listPackageRoute.length === 1) {
        Notify.info(t('RESOURCES_DELETING_DEFAULT_NOT_ALLOWED'))
        return false
      }
      if (listPackageRoute.length > 1)
        setlistPackageRoute(listPackageRoute.filter(el => el !== id))
    },
  }

  const handleImageDistroType = distro_type => {
    setSelectImageDistroType(distro_type)

    if (isPassword) {
      const { data } = form.current.props
      data['scriptId_1'] = distro_type
    }
  }

  const handlePreInstalledApp = app => {
    setPreInstalledApp(app)
    if (app.toLowerCase() === 'jupyter') {
      setJupyterToken(generateToken)
      setIsJupyterConfig(true)
    }
  }

  // 스크립트 끝 ==================================================

  const [tab, setTab] = useState('I')
  const { TabPanel } = Tabs

  const renderIds = () => {
    const list = document.querySelectorAll('[name^="scriptId"]')
    const values = []
    for (const el of list) {
      values.push(el.value)
    }
    return (
      <>
        {t('RESOURCES_CHANGE_PASSWORD')} - {values.join(', ')}
      </>
    )
  }

  const renderFiles = () => {
    const list = document.querySelectorAll('[name^="scriptPath"]')
    const values = []
    for (const el of list) {
      values.push(el.value)
    }
    return (
      <>
        {t('RESOURCES_WRITE_FILE')} - {values.join(', ')}
      </>
    )
  }

  const renderPackages = () => {
    const list = document.querySelectorAll('[name^="scriptPackage"]')
    const list2 = document.querySelectorAll('[name^="scriptVersion"]')
    const values = []
    for (let i = 0; i < list.length; i++) {
      values.push(`${list[i].value}:${list2[i].value}`)
    }
    return (
      <>
        {t('RESOURCES_INSTALL_PACKAGE')} - {values.join(', ')}
      </>
    )
  }

  const getMarks = max => {
      const count = 5;
      return range(count).reduce((marks, index) => {
        const value = (max * index) / (count - 1);
        const mark = value === 0 ? '0' : `${Math.floor(value)}`;
        return { ...marks, [value]: mark };
      }, {});
  };

  useEffect(() => {
    getGpuName();
  }, [vmCount]);

  const getGpuName = async () => {

    const namePrefix = "vm-" + props.name ;

    const vmData = await gpuStore.fetchVmsDetail({ ...props, limit: 10000 })
    const vmList = vmData.vmList;

    const existingNames = vmList.map(vm => vm.vmi.vm_name);

    // 현재 prefix 를 가진 이름만 추출 >  prefix 제거하고 숫자만  > NaN 이 아닌 실제 숫자만 > 오름차순 정렬
    const existingNums = existingNames
    .filter(name => name.startsWith(`${namePrefix}-`))
    .map(name => parseInt(name.replace(`${namePrefix}-`, ""), 10))
    .filter(num => !isNaN(num))
    .sort((a, b) => a - b);

    // 기존 VM 이름들 중 가장 큰 숫자를 찾아서 그 다음 숫자
    const startNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;

    if (Number(vmCount) === 0) {
      setGpuVmName('');
    } else if (Number(vmCount) === 1) {
      setGpuVmName(`${namePrefix}-${(startNum).toString().padStart(3, '0')}`);
    } else {
      const first = `${namePrefix}-${(startNum).toString().padStart(3, '0')}`;
      const last = `${namePrefix}-${(startNum+Number(vmCount)-1).toString().padStart(3, '0')}`;
      setFirstGpuVmName(first)
      setLastGpuVmName(last)
      setGpuVmName(`${first} ~ ${last}`);
    }
  }

  return (
    <>
      <Modal
        icon=""
        width={960}
        title={props.title}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
        disableCloseButton={(submitButtonFlag && props.isSubmitting) ? true : false}
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
                  className={`${regStep === 1
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
                  {t('RESOURCES_VM_SETTINGS')}
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
                  className={`${regStep === 2
                    ? styles.current
                    : regStep > 2
                      ? styles.done
                      : styles.todo
                    }`}
                ></div>
              </div>
              <span className={styles.network}></span>
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
                  className={`${regStep === 3
                    ? styles.current
                    : regStep > 3
                      ? styles.done
                      : styles.todo
                    }`}
                ></div>
              </div>
              <span className={styles.detail}></span>
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
              <span className={styles.check}></span>
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
                      label={t('RESOURCES_GPU_CLUSTER')}
                    >
                      <Input
                        name="gpu_cluster"
                        maxLength={63}
                        style={{ maxWidth: 'none' }}
                        defaultValue={props.name}
                        disabled={true}
                      />
                    </Form.Item>                    
                  </Column>                
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_PROJECT')}
                    >
                      <Input
                        name="project_text"
                        maxLength={63}
                        style={{ maxWidth: 'none' }}
                        defaultValue={props.namespace}
                        disabled={true}
                      />
                    </Form.Item>
                    {!props.namespace && (
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
                          setNetworkCheckItems([])
                          setSriovCheckItems([])
                          setSecurityGroupCheckItems([])
                        }}
                      />
                    </Form.Item>
                      )}
                  </Column>                 
                </Columns>

                <label className="form-item-label" htmlFor="name">
                  {t('RESOURCES_GPU_CLUSTER_VM_CREATE_AVAILABLE_COUNT')}
                  <span className="form-item-required">*</span>
                </label>                
                  <Form.Item
                    rules={[
                      {
                        required: true,
                      },
                      {
                        pattern: regexRootDisk,
                        message: t('RESOURCES_GPU_CLUSTER_VM_CREATE_COUNT_VALID'),
                      },
                    ]}
                  >
                    <UnitSlider
                      name="vm_count"
                      max={slideMaxCount}
                      min={0}
                      marks={getMarks(slideMaxCount)}
                      defaultValue={vmCount}
                      unit={''}
                      withInput
                      onChange={e => setVmCount(e)}
                      style={{ padding: '5px', width: '10%' }}
                    />
                    
                  </Form.Item>
                  
                  <div className={styles.form_item_label_description} >
                   <label htmlFor="name">
                    최대 {slideMaxCount}개의 가상머신을 생성할 수 있습니다.
                   </label>      
                  </div>
                      
                  <Form.Item
                    label={t('RESOURCES_VM_NAME')}
                  >
                    <Input
                      maxLength={200}
                      style={{ maxWidth: 'none' }}
                      value={gpuVmName}
                      disabled={true}
                    />
                  </Form.Item>    

                  <div className={styles.form_item_label_description} >
                   <label htmlFor="name">
                    자동 생성될 가상머신 이름을 확인해 주세요.
                   </label>      
                  </div>

                  {imageType === 'I' && (
                    <Form.Item>
                      <Columns>
                        <Column>      
                            <Form.Item
                              label={t('RESOURCES_IMAGE')}
                              rules={[
                                { required: true, validator: imageValidator },
                              ]}
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
                                  const distro_type = imageOptionList
                                    .filter(item => item.name === e)
                                    .map(item => item.distro_type)[0]
                                  handleImageDistroType(distro_type)
                                  const app = imageOptionList
                                    .filter(item => item.name === e)
                                    .map(item => item.pre_installed_app)[0]
                                  handlePreInstalledApp(app)
                                }}
                                defaultDescription={t(
                                  'RESOURCES_SELECT_IMAGE_TIP'
                                )}
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
                        <Column style={{ maxWidth: '472px' }}>
                            <Form.Item
                              label={t('RESOURCES_FLAVOR')}
                              rules={[
                                { required: true, validator: flavorValidator },
                              ]}
                            >
                              <TypeSelect
                                name="flavor"
                                defaultValue={t('RESOURCES_SELECT')}
                                options={flavorOptions()}
                                onChange={e => setSelectFlavorName(e)}
                                placeholder={{
                                  label: t('RESOURCES_SELECT'),
                                }}
                                defaultDescription={t(
                                  'RESOURCES_SELECT_FLAVOR_TIP'
                                )}
                                newMaxHeight="198"
                              />
                            </Form.Item>
                            <div
                              className={`form-item-error ${flavorSizeCheck ? 'hide' : ''
                                }`}
                            >
                              {imageType === 'I'
                                ? t('RESOURCES_SELECT_SIZE_LAGER_IMAGE_SIZE_DESC')
                                : t('RESOURCES_SELECT_SIZE_LAGER_BOOT_SIZE_DESC')}
                            </div>
                        </Column>
                      </Columns>
                    </Form.Item>
                  )}
                  {isProjectQuotaSet && (
                    <div>{t('RESOURCES_SELECT_FLAVOR_QUOTA_TIP')}</div>
                  )}


                <Form.Item
                  className={styles.textarea}
                  label={t('RESOURCES_DESCRIPTION')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea name="description" maxLength={256} value="" />
                </Form.Item>
              </div>
              {/* 기본설정 설정 끝========================================== */}

              {/* 네트워크 설정 시작========================================== */}
              <div className={`${regStep === 2 ? '' : 'hide'}`}>
                <Form.Item label={t('RESOURCES_NETWORK')}>
                  <div className={styles.wrapper}>
                    {stateVariables['network'].length > 0 && (
                      <div
                        className={classnames(
                          styles.table_title,
                          styles.table_title_bg
                        )}
                      >
                        <Button
                          className={styles.table_title_button}
                          onClick={() => handleAllCheck(false, 'network')}
                        >
                          {t('RESOURCES_ALL_DESELECT')}
                        </Button>
                        {stateVariables['network'].length}
                        {t('RESOURCES_COUNT')} {t('RESOURCES_SELECT')}
                      </div>
                    )}
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
                                name="select-all-network"
                                onChange={checked =>
                                  handleAllCheck(checked, 'network')
                                }
                                checked={
                                  !!(
                                    dataListVariables['network'].length > 0 &&
                                    stateVariables['network'].length ===
                                    dataListVariables['network'].length
                                  )
                                }
                              />
                            </th>
                            <th>
                              <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                            </th>
                            <th>
                              <strong>{t('RESOURCES_NETWORK_TYPE_YOO')}</strong>
                            </th>
                            <th>
                              <strong>{t('RESOURCES_IP_ASSIGNMENT')}</strong>
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
                          {!networkList?.length && (
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
                          {networkList?.map(data => (
                            <tr key={data.name}>
                              <td>
                                <Checkbox
                                  name={`select-${data.name}`}
                                  checked={
                                    !!stateVariables['network'].includes(
                                      data.name
                                    )
                                  }
                                  onChange={checked =>
                                    handleSingleCheck(
                                      checked,
                                      data.name,
                                      'network'
                                    )
                                  }
                                />
                              </td>
                              <td>{data.name}</td>
                              <td>{data.type.toUpperCase()}</td>
                              <td>
                                <Select
                                  name={`${data.name}-ip`}
                                  placeholder={t('RESOURCES_AUTOMATIC')}
                                  options={availableIpOptions(data.name)}
                                  onChange={e =>
                                    handleIpSelectClick(data.name, e)
                                  }
                                  disabled={
                                    !networkCheckItems.includes(data.name)
                                  }
                                  clearable
                                />
                              </td>
                              <td>{data.cidr}</td>
                              <td>{data.gateway_ip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className={styles.removeCheckWrapper}>
                        {networkCheckItems?.map(id => {
                          const name = networkList
                            ?.filter(data => data.name === id)
                            .map(item => item.name)[0]
                          return (
                            <span key={id}>
                              <Button
                                icon="close"
                                onClick={() => handleDelete(id, 'network')}
                              >
                                {name}
                              </Button>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
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
                          {!securityGroupList?.length && (
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
                          {securityGroupList?.map(data => (
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
                                    handleSingleCheck(
                                      checked,
                                      data.name,
                                      'security'
                                    )
                                  }
                                />
                              </td>
                              <td>{data.name}</td>
                              <td>{data.description}</td>
                              <td>{data.ingress_count}</td>
                              <td>{data.egress_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className={styles.removeCheckWrapper}>
                        {securityGroupCheckItems?.map(id => {
                          const name = securityGroupList
                            ?.filter(data => data.name === id)
                            .map(item => item.name)[0]
                          return (
                            <span key={id}>
                              <Button
                                icon="close"
                                onClick={() => handleDelete(id, 'security')}
                              >
                                {name}
                              </Button>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </Form.Item>
              </div>
              {/* 네트워크 설정 끝========================================== */}

              {/* 세부 설정 시작========================================== */}
              <div className={`${regStep === 3 ? '' : 'hide'}`}>
                <Form.Item label={t('RESOURCES_KEYPAIR')}>
                  <Select
                    name="keypair"
                    placeholder={t('RESOURCES_SELECT')}
                    options={keypairOptions()}
                    clearable
                  />
                </Form.Item>

                <div className={styles.wrapperError}>
                  <div
                    className={`form-item-error ${!isKeypiarPasswordError ? 'hide' : ''
                      }`}
                  >
                    {t('RESOURCES_KEYPAIR_PASSWORD_EMPTY_DESC')}
                  </div>
                </div>

                <Form.Group
                  label={t('RESOURCES_SCRIPT')}
                  onChange={() => {
                    setIsScript(!isScript)
                  }}
                  checkable
                >
                  <div
                    className={isUserScript ? 'disabled' : ''}
                    onClick={e => {
                      if (isUserScript) {
                        e.preventDefault()
                      }
                    }}
                  >
                    {preInstalledApp.toLowerCase() === 'jupyter' && (
                      <Form.Group
                        label={t('RESOURCES_JUPYTER_CONFIG')}
                        onChange={() => {
                          setIsJupyterConfig(!isJupyterConfig)
                        }}
                        checkable
                      >
                        <div className={styles.scriptitem}>
                          <Columns>
                            <Column>
                              <Form.Item>
                                <Input
                                  placeholder={'Port'}
                                  defaultValue={'Port'}
                                  disabled={true}
                                />
                              </Form.Item>
                            </Column>
                            <Column>
                              <Form.Item>
                                <Input
                                  type="number"
                                  name={`scriptJupyterPort`}
                                  placeholder={8888}
                                  defaultValue={8888}
                                  onChange={() => checkScriptJupyter()}
                                />
                              </Form.Item>
                            </Column>
                          </Columns>
                        </div>
                        <div
                          className={`form-item-error ${!isJupyterPortError ? 'hide' : ''
                            }`}
                        >
                          {t('RESOURCES_JUPYTER_PORT_RANGE_DESC')}
                        </div>
                        <div className={styles.scriptitem}>
                          <Columns>
                            <Column>
                              <Form.Item>
                                <Input
                                  placeholder={t('TOKEN')}
                                  defaultValue={t('TOKEN')}
                                  disabled={true}
                                />
                              </Form.Item>
                            </Column>
                            <Column>
                              <Form.Item>
                                <Input
                                  name={`scriptJupyterToken`}
                                  placeholder={jupyterToken}
                                  defaultValue={jupyterToken}
                                  onChange={() => checkScriptJupyter()}
                                />
                              </Form.Item>
                            </Column>
                          </Columns>
                        </div>
                        <div
                          className={`form-item-error ${!isJupyterTokenError ? 'hide' : ''
                            }`}
                        >
                          {t('RESOURCES_JUPYTER_TOKEN_DESC')}
                        </div>
                      </Form.Group>
                    )}
                    <Form.Group
                      label={t('RESOURCES_CHANGE_PASSWORD')}
                      onChange={() => {
                        setIsPassword(!isPassword)
                      }}
                      checkable
                      className={'disabled'}
                    >
                      {listPasswordRoute.map((obj, index) => {
                        return (
                          <div className={styles.scriptitem} key={obj}>
                            <Columns>
                              <Column>
                                <Form.Item>
                                  <Input
                                    name={`scriptId_${obj}`}
                                    placeholder={t('ID')}
                                    defaultValue={
                                      index === 0 ? selectImageDistroType : ''
                                    }
                                    disabled={
                                      obj >= 1 && imageType === 'B'
                                        ? false
                                        : !!(obj === 1 && imageType === 'I')
                                    }
                                    onChange={() => {
                                      checkScriptPassword()
                                    }}
                                  />
                                </Form.Item>
                              </Column>
                              <Column>
                                <Form.Item>
                                  <InputPassword
                                    name={`scriptPassword_${obj}`}
                                    placeholder={t('Password')}
                                    onChange={() => checkScriptPassword()}
                                  />
                                </Form.Item>
                              </Column>
                            </Columns>
                            {index > 0 && (
                              <Button
                                type="flat"
                                icon="trash"
                                className={styles.scriptdelete}
                                onClick={() =>
                                  // listPasswordRoute.length > 1 &&
                                  // obj > 1 &&
                                  handlePasswordRoute.delColumn(obj)
                                }
                              />
                            )}
                          </div>
                        )
                      })}

                      <div className="text-right">
                        <Button
                          className={styles.scriptadd}
                          onClick={handlePasswordRoute.addColumn}
                        >
                          {t('RESOURCES_ADD')}
                        </Button>
                      </div>
                      <div
                        className={`form-item-error ${!isPasswordError ? 'hide' : ''
                          }`}
                      >
                        {t('RESOURCES_PASSWORD_EMPTY_DESC')}
                      </div>
                    </Form.Group>

                    <Form.Group
                      label={t('RESOURCES_WRITE_FILE')}
                      onChange={() => {
                        setIsFileWrite(!isFileWrite)
                      }}
                      checkable
                    >
                      {listFileRoute.map(obj => (
                        <div className={styles.scriptitem} key={obj}>
                          <Columns>
                            <Column>
                              <Form.Item>
                                <Input
                                  name={`scriptPath_${obj}`}
                                  placeholder={t('PATH')}
                                  onChange={() => checkScriptFilewrite()}
                                />
                              </Form.Item>
                            </Column>
                            <Column>
                              <Form.Item>
                                <Input
                                  name={`scriptContent_${obj}`}
                                  placeholder={t('Content')}
                                />
                              </Form.Item>
                            </Column>
                          </Columns>
                          {listFileRoute.length > 1 && (
                            <Button
                              type="flat"
                              icon="trash"
                              className={styles.scriptdelete}
                              onClick={() =>
                                // listFileRoute.length > 1 &&
                                handleFileRoute.delColumn(obj)
                              }
                            />
                          )}
                        </div>
                      ))}
                      <div className="text-right">
                        <Button
                          className={styles.scriptadd}
                          onClick={handleFileRoute.addColumn}
                        >
                          {t('RESOURCES_ADD')}
                        </Button>
                      </div>
                      <div
                        className={`form-item-error ${!isFileWriteError ? 'hide' : ''
                          }`}
                      >
                        {t('RESOURCES_FILE_WIRTE_EMPTY_DESC')}
                      </div>
                    </Form.Group>
                    
                  </div>
                  <div
                    className={
                      isJupyterConfig || isPassword || isPackage || isFileWrite
                        ? 'disabled'
                        : ''
                    }
                    onClick={e => {
                      if (
                        isJupyterConfig ||
                        isPassword ||
                        isPackage ||
                        isFileWrite
                      ) {
                        e.preventDefault()
                      }
                    }}
                  >
                    <Form.Group
                      label={t('RESOURCES_CUSTOM')}
                      checkable
                      onChange={() => {
                        setIsUserScript(!isUserScript)
                      }}
                    >
                      <Form.Item className={styles.textarea}>
                        <TextArea
                          name="userScript"
                          rows="5"
                          placeholder={decodeURIComponent(
                            '%23cloud-config%0A%20%0Assh_pwauth%3A%20true%0Ausers%3A%0A%20%20-%20default%0A%20%20-%20name%3A%20adminuser%0A%20%20%20%20sudo%3A%20ALL%3D%28ALL%29%20NOPASSWD%3AALL%0A%20%0Achpasswd%3A%0A%20%20expire%3A%20false%0A%20%20list%3A%0A%20%20%20%20-%20ubuntu%3Adefaultpassword%0A%20%20%20%20-%20adminuser%3AP0werfu1PW%0A%20%0Aruncmd%3A%0A%20%20-%20systemctl%20disable%20firewalld%0A%20%0Awrite_files%3A%0A%20%20-%20path%3A%20/home/ubuntu/simple-message.txt%0A%20%20%20%20content%3A%20%7C%0A%20%20%20%20%20%20cloud-init%20syntax%0A%20%20%20%20%20%20create%20a%20simple%20file'
                          )}
                        />
                      </Form.Item>
                      <div
                        className={`form-item-error ${!isUserScriptError ? 'hide' : ''
                          }`}
                      >
                        {t('RESOURCES_USER_SCRIPT_EMPTY_DESC')}
                      </div>
                    </Form.Group>
                  </div>
                </Form.Group>
              </div>
              {/* 세부 설정 끝========================================== */}

              {/* 입력 정보 확인 시작========================================== */}
              <div className={`${regStep === 4 ? '' : 'hide'}`}>
                <div className={styles.boxwrap}>
                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.basic}></span>
                        <label>{t('RESOURCES_VM_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(1)
                        }}
                      ></Button>
                    </div>
                    <div className={styles.greybgbox}>
                      <div className={styles.list}>
                        <label>{t('RESOURCES_VM_NAME')}</label>
                        <div className={styles.multiline}>
                          <div className={styles.bold}>{gpuVmName}</div>
                        </div>
                      </div>
                      {projectName && (
                        <div className={styles.list}>
                          <label>{t('RESOURCES_PROJECT')}</label>
                          <div className={styles.bold}>{projectName}</div>
                        </div>
                      )}
                      <div className={styles.list}>
                        <label>{`${imageType === 'I'
                          ? t('RESOURCES_IMAGE')
                          : t('RESOURCES_BOOT_VOLUME')
                          }`}</label>
                        <div className={styles.multiline}>
                          <div className={styles.bold}>{`${imageType === 'I' ? imageName : bootVolumeName
                            }`}</div>
                        </div>
                      </div>
                      <div className={styles.list}>
                        <label>{t('RESOURCES_FLAVOR')}</label>
                        <div className={styles.multiline}>
                          <div className={styles.bold}>{flavorName}</div>
                          <p>
                            CPU {flavorCpu} Cores / Memory {flavorMemory} GiB/
                            Disk {flavorDisk} GiB
                          </p>
                        </div>
                      </div>
                    </div>

                    {(imageType === 'I' && description) && (
                      <div className={styles.greybgbox}>
                        <div className={styles.list}>
                          <label>{t('RESOURCES_DESCRIPTION')}</label>
                          <div>{description}</div>
                        </div>
                      </div>
                    )}
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
                    <label>{t('RESOURCES_NETWORK')}</label>
                    {networkList
                      .filter(x => networkCheckItems.includes(x.name))
                      .map((obj, index) => (
                        <div className={styles.greybgbox} key={index}>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_NAME')}</label>
                            <div>{obj.name}</div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_TYPE_YOO')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.type.toUpperCase()}</div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_IP_ASSIGNMENT')}</label>
                            <div className={styles.multiline}>
                              <div>
                                {`${obj.ip === undefined
                                  ? t('RESOURCES_AUTOMATIC')
                                  : obj.ip
                                  }`}
                              </div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_CIDR')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.cidr}</div>
                            </div>
                          </div>
                        </div>
                      ))}

                    <label>{t('RESOURCES_SECURITY_GROUP')}</label>
                    {securityGroupList
                      .filter(x => securityGroupCheckItems.includes(x.name))
                      .map((obj, index) => (
                        <div className={styles.greybgbox} key={index}>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_NAME')}</label>
                            <div>{obj.name}</div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_DESCRIPTION')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.description}</div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_INBOUND_RULE')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.ingress_count}</div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_OUTBOUND_RULE')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.egress_count}</div>
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
                        <label>{t('RESOURCES_KEYPAIR')}</label>
                        <div>{`${keypairName === undefined
                          ? t('RESOURCES_NOT_SELECTED')
                          : keypairName
                          }`}</div>
                      </div>
                      <div className={styles.list}>
                        <label>{t('RESOURCES_SCRIPT')}</label>
                        {isScript && (
                          <div className={styles.multiline}>
                            <div>{isPassword && renderIds()}</div>
                            <div>{isFileWrite && renderFiles()}</div>
                            <div>{isPackage && renderPackages()}</div>
                            <div>
                              {isUserScript && `${t('RESOURCES_CUSTOM')} - Y`}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* <div className={styles.list}>
                        <label>{t('RESOURCES_USER_NAME')}</label>
                        <div>{globals.user.username}</div>
                      </div> */}
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
