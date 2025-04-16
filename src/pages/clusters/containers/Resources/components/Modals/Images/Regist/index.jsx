import React, { useEffect, useRef, useState } from 'react'
import { range } from 'lodash'
import {
  Button,
  Form,
  Input,
  Loading,
  Notify,
  Select,
  TextArea,
} from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import {
  RadioButton,
  RadioGroup,
} from '@kube-design/components/lib/components/Radio'
import classnames from 'classnames'
import axios from 'axios'
import { Base64 } from 'js-base64'

import DistroTypeStore from 'stores/resources/distrotype'
import PreInstallAppStore from 'stores/resources/preinstalls'
import GpuNodeStore from 'stores/resources/gpunodes'
import { UnitSlider } from 'components/Inputs'
import { Modal } from 'components/Base'
import { PATTERN_USER_NAME } from 'utils/constants'
import CardSelect from '../../../CardSelect'
import TypeSelect from '../../../TypeSelect'
import styles from './index.scss'

const defaultImageSize = '15GB'

const defaultImageText = t('RESOURCES_CONTAINER_IMAGE_SETTINGS_DESC')
const emptyImageText = t('RESOURCES_NOT_FOUND_IMIAGE')
const defaultRegistryUrl = 'https://quay.io?namespace=edgestack'

const realTimeOptions = [
  { label: t('RESOURCES_NOT_USE'), value: false },
  { label: t('RESOURCES_USE'), value: true },
]
const publicTypeOptions = [
  { label: t('RESOURCES_PUBLIC'), value: 'public' },
  { label: t('RESOURCES_PRIVATE'), value: 'private' },
]
const archTypeOptions = [
  { label: 'x86_64', value: 'x86_64' },
  { label: 'aarch64', value: 'aarch64' },
]
const bootTypeOptions = [
  { label: 'UEFI', value: 'uefi' },
  { label: 'BIOS', value: 'legacy' },
]
const osTypeOptions = [
  { label: 'Linux', value: 'linux', icon: 'ico-linux' },
  { label: 'Windows', value: 'windows', icon: 'ico-windows' },
  //   { label: 'etc', value: '', icon: 'ico-plus' },
]

const ResourceImageModal = ({ props, title, store, onOk, startRefresh }) => {
  const distroTypeStore = new DistroTypeStore()
  const preInstallAppStore = new PreInstallAppStore()
  const gpuNodeStore = new GpuNodeStore()

  const form = useRef()
  const [formData] = useState({})
  const [modelView, setModalView] = useState(true)

  const [publicType, setPublicType] = useState('public')

  const [realTime, setRealTime] = useState(false)
  const [osType, setOsType] = useState('linux')
  const [registryUrlActive, setRegistryUrlActive] = useState(false)
  const [registryUrl, setRegistryUrl] = useState(
    publicType === 'private' ? '' : defaultRegistryUrl
  )
  const [registryAuth, setRegistryAuth] = useState('')
  const [userName, setUserName] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [registryChecked, setRegistryChecked] = useState(false)
  const [registryUrlInValid, setRegistryUrlInValid] = useState(false)
  const [registryCheckInValid, setRegistryCheckInValid] = useState(false)
  const [registryUserInvalid, setRegistryUserInvalid] = useState(false)
  const [popActive, setPopActive] = useState(false)
  const [imageList, setImageList] = useState([])
  const [imageListData, setImageListData] = useState([])
  const [imageText, setImageText] = useState(defaultImageText)

  const [imageSize, setImageSize] = useState(defaultImageSize)
  const [imageSizeActive, setImageSizeActive] = useState(false)
  const [sizeEmpty, setSizeEmpty] = useState(false)

  const [regStep, setRegStep] = useState(1)
  const [submitButtonFlag, setSubmitButtonFlag] = useState(false)

  const [distroTypeData, setDistroTypeData] = useState([])
  const [distroType, setDistroType] = useState('ubuntu')
  const [distroTypeList, setDistroTypeList] = useState([])
  const [linuxDistroTypeList, setLinuxDistroTypeList] = useState([])
  const [edgeDistroTypeList, setEdgeDistroTypeList] = useState([])
  const [acceleratorType, setAcceleratorType] = useState('None')
  const [acceleratorTypeList, setAcceleratorTypeList] = useState(['None'])
  const [preInstallAppType, setPreInstallAppType] = useState('None')
  const [preInstallAppList, setPreInstallAppList] = useState([])
  const [archType, setArchType] = useState('x86_64')

  const [imageName, setImageName] = useState('')
  const [tagListData, setTagListData] = useState([])
  const [tagList, setTagList] = useState([])
  const [tag, setTag] = useState('')
  const [projectName, setProjectName] = useState('edgestack')
  const [dockerUrl, setDockerUrl] = useState('quay.io')

  const [loading, setLoading] = useState(false)
  const [sourceEmpty, setSourceEmpty] = useState(false)

  useEffect(() => {
    const getDistroTypeList = async () => {
      const dist = await distroTypeStore.fetchList()
      setDistroTypeData(dist)
      setEdgeDistroTypeList(
        dist.filter(
          obj =>
            obj.name !== 'windows' &&
            obj.name !== 'fedora' &&
            obj.name !== 'rhel'
        )
      )
      setLinuxDistroTypeList(dist.filter(obj => obj.name !== 'windows'))
      setDistroTypeList(
        dist.filter(
          obj =>
            obj.name !== 'windows' &&
            obj.name !== 'fedora' &&
            obj.name !== 'rhel'
        )
      )
    }

    const getAcceleratorTypeList = async () => {
      const accelList = await gpuNodeStore.fetchAcceleratorTypeList(props)
      accelList.sort()
      setAcceleratorTypeList(accelList)
    }

    const getPreInstallAppList = async () => {
      const preInstallApps = await preInstallAppStore.fetchList()
      setPreInstallAppList(preInstallApps)
    }

    const getVmImageList = async () => {
      const originUrl = new URL(registryUrl)
      const urlParams = originUrl.searchParams
      const namespace = urlParams.get('namespace')

      let allRepositories = []
      let nextPage = `${originUrl.origin}/api/v1/repository?public=true&namespace=${namespace}&popularity=true&repo_kind=image&`

      try {
        while (nextPage) {
          const response = await axios.get(nextPage, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          })
          allRepositories = [...allRepositories, ...response.data.repositories]
          nextPage = response.data.next_page
            ? `${originUrl.origin}/api/v1/repository?public=true&namespace=${namespace}&last_modified=true&popularity=true&repo_kind=image&next_page=${response.data.next_page}`
            : null
        }
        setImageListData(allRepositories)
      } catch {
        setImageListData([])
      }
    }

    getDistroTypeList()
    getAcceleratorTypeList()
    getPreInstallAppList()
    getVmImageList()
  }, [])

  useEffect(() => {
    const val = Number(imageSize.substring(0, imageSize.length - 2))

    if (val < 11) {
      setSizeEmpty(true)
    } else {
      setSizeEmpty(false)
    }
  }, [imageSize])

  const resetRegistryValidity = () => {
    setRegistryUrlInValid(false)
    setRegistryUserInvalid(false)
    setRegistryCheckInValid(false)
    setRegistryChecked(false)
  }

  const handleRegistryType = value => {
    setPublicType(value)
    resetRegistryValidity()

    if (value === 'public') {
      document.querySelector('#chk-1').checked = false
      setRegistryUrlActive(false)
      setRegistryUrl(defaultRegistryUrl)
      setDockerUrl('quay.io')
    } else {
      setRegistryUrlActive(true)
      setRegistryUrl('')
      setUserName('')
      setUserPassword('')
      document.querySelector('#chk-1').checked = true
    }
  }

  const handleRegistryUrlActive = () => {
    if (registryUrlActive) {
      setDockerUrl('quay.io')
      setRegistryUrl(defaultRegistryUrl)
      setRegistryUrlActive(false)
      setDistroTypeList(edgeDistroTypeList)
    } else {
      setRegistryUrlActive(true)
    }
    resetRegistryValidity()
  }

  const handleRegistryUrl = value => {
    resetRegistryValidity()
    let originUrl = URL
    try {
      originUrl = new URL(value)
    } catch {
      setRegistryUrlInValid(true)
      setRegistryChecked(false)
      setRegistryUserInvalid(false)
      return
    }
    setDockerUrl(originUrl.host)
    setRegistryUrl(value)
    setDistroTypeList(linuxDistroTypeList)
    if (value === defaultRegistryUrl) {
      setDistroTypeList(edgeDistroTypeList)
    }
  }

  const handleRegistryUserName = value => {
    resetRegistryValidity()
    if (value === '') {
      setRegistryUserInvalid(true)
      return
    }
    setUserName(value)
  }

  const handleRegistryUserPassword = value => {
    resetRegistryValidity()
    if (value === '') {
      setRegistryUserInvalid(true)
      return
    }
    setUserPassword(value)
  }

  const checkUserValid = async () => {
    setRegistryChecked(true)
    setRegistryCheckInValid(false)
    if (registryUrl === '') {
      setRegistryUrlInValid(true)
      return
    }
    if (userName === '' || userPassword === '') {
      setRegistryUserInvalid(true)
      return
    }

    const userAuth = Base64.encode(`${userName}:${userPassword}`)

    const originUrl = new URL(registryUrl)
    const urlParams = originUrl.searchParams
    const project = urlParams.get('projects')
    fetchWithTimeout(userAuth, originUrl, 1000)
      .then(() => {
        setRegistryUrlInValid(false)
        setRegistryUserInvalid(false)

        setRegistryAuth(userAuth)
        setRegistryUrl(registryUrl)
        setUserName(userName)
        setUserPassword(userPassword)
        request
          .post(`customharbor/private`, {
            auth: userAuth,
            projectName: project,
            originUrl: originUrl.origin,
            page: 1,
          })
          .then(() => {
            Notify.success({ content: t('RESOURCES_SUCCESS_VALID_DESC') })
            setRegistryUrlInValid(false)
          })
          .catch(() => {
            setRegistryUrlInValid(true)
          })
      })
      .catch(() => {
        setRegistryUrlInValid(false)
        setRegistryUserInvalid(true)
      })
  }

  function fetchWithTimeout(userAuth, originUrl, timeout = 5000) {
    return Promise.race([
      request.post(`customharbor/users`, {
        auth: userAuth,
        originUrl: originUrl.origin,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      ),
    ])
  }

  const handleImageSizeActive = () => {
    if (imageSizeActive) {
      setImageSize(defaultImageSize)
      setImageSizeActive(false)
      setSizeEmpty(false)
    } else {
      setImageSizeActive(true)
    }
  }

  const distroTypeOptions = () => {
    return distroTypeList.map(obj => ({
      label: t(obj.name),
      description: t(obj.vendor),
      icon: `ico-os-${obj.name}`,
      value: t(obj.name),
    }))
  }

  const accelTypeOptions = () => {
    return acceleratorTypeList.map(obj => ({
      label: t(obj),
      value: t(obj),
    }))
  }

  const preInstallAppOptions = () => {
    return preInstallAppList.map(obj => ({
      label: t(obj.name),
      description: t(obj.description),
      value: t(obj.name),
    }))
  }

  const handleOk = () => {
    form.current.validator(() => {
      const { data } = form.current.props

      if (sizeEmpty) {
        return
      }
      data.size = Number(imageSize.slice(0, imageSize.length - 2))

      if (imageName === '' || tag === '') {
        setSourceEmpty(true)
        return
      }
      setSourceEmpty(false)

      data.userName = userName
      data.userPassword = userPassword
      data.distro_type = distroType
      data.source = `docker://${dockerUrl}/${projectName}/${imageName}:${tag}`
      if (
        publicType === 'public' &&
        (!registryUrlActive || registryUrl === defaultRegistryUrl)
      ) {
        if (distroType === 'rocky') {
          data.boot_type = 'uefi'
        }
      }
      onOk({ image: data })
    })
  }

  const closeModal = () => {
    startRefresh()
    setModalView(false)
  }

  const getMarks = () => {
    const max = 200
    const count = 5
    return range(count).reduce((marks, index) => {
      const value = (max * index) / (count - 1)
      const mark = value === 0 ? '0' : `${Math.floor(value)}GB`
      return { ...marks, [value]: mark }
    }, {})
  }

  const handleOsType = value => {
    let distro = ''
    setOsType(value)
    if (value === 'windows') {
      distro = 'windows'
      setDistroType('windows')
      setDistroTypeList(distroTypeData.filter(obj => obj.name === 'windows'))
    } else if (value === 'linux') {
      distro = 'ubuntu'
      setDistroType('ubuntu')
      if (registryUrl === defaultRegistryUrl) {
        setDistroTypeList(edgeDistroTypeList)
      } else {
        setDistroTypeList(linuxDistroTypeList)
      }
    } else {
      setDistroType('')
      setDistroTypeList([])
    }
    if (registryUrl === defaultRegistryUrl) {
      getPublicImageList(distro)
    }
  }

  const handleDistroType = value => {
    setDistroType(value)
    getPublicImageList(value)
  }

  const getPublicImageList = distro => {
    let containerDisk = '-container-disk'
    if (distro === 'rocky') {
      containerDisk = '-uefi-container-disk'
    }
    if (distro === 'windows') {
      distro = 'win'
      containerDisk = '-container-image'
    }
    const targetImageList = imageListData
      .filter(
        item => item.name.includes(distro) && item.name.includes(containerDisk)
      )
      .sort((a, b) => b.name.localeCompare(a.name))
    setImageList(targetImageList)
    setPopActive(true)
    setImageText(defaultImageText)
  }

  const searchImageList = e => {
    if (e.key === 'Enter') {
      const name = e.target.value
      const list = imageListData.filter(item => item.name.includes(name))
      setImageList(list)
    }
  }

  const handleImageTag = (image, project) => {
    setPopActive(false)
    setLoading(true)
    setImageName(image)
    image = encodeURIComponent(image)
    if (publicType === 'public') {
      getPublicImageTag(image)
    } else {
      getPrivateImageTag(image, project)
    }
  }

  // public image tag
  const getPublicImageTag = async image => {
    setImageName(image)
    image = encodeURIComponent(image)
    const originUrl = new URL(registryUrl)
    const urlParams = originUrl.searchParams
    const namespace = urlParams.get('namespace')
    const response = await axios.get(
      `${originUrl.origin}/api/v1/repository/${namespace}/${image}`,
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    )
    setLoading(false)
    const tags = Object.values(response.data.tags).filter(
      obj => obj.size !== null && obj.size !== 0
    )
    setTagListData(tags)
    setSourceEmpty(false)
    getMatchingTag(tags, archType, acceleratorType, preInstallAppType)
  }

  const getPrivateImageTag = async (image, project) => {
    const originUrl = registryUrl ? new URL(registryUrl) : ''
    const response = await request.post(`customharbor/tags`, {
      auth: registryAuth,
      repositoryName: image,
      projectName: project,
      originUrl: originUrl.origin,
    })
    setLoading(false)

    // eslint-disable-next-line no-shadow
    const tagList = response?.[0]?.tags

    setProjectName(project)
    setTagList(tagList)
    setTag(tagList?.[0]?.name)
    setSourceEmpty(false)
  }

  const handleArchType = value => {
    setArchType(value)
    getMatchingTag(tagListData, value, acceleratorType, preInstallAppType)
  }

  const handleAcceleratorType = value => {
    setAcceleratorType(value)
    getMatchingTag(tagListData, archType, value, preInstallAppType)
  }

  const handlePreInstallAppType = value => {
    setPreInstallAppType(value)
    getMatchingTag(tagListData, archType, acceleratorType, value)
  }

  const getMatchingTag = (tags, arch, accel, preInstallApp) => {
    const filteredTag = tags.filter(item => {
      if (accel === 'None' && preInstallApp === 'None') {
        return item.name === arch
      }
      if (accel === 'None' && preInstallApp !== 'None') {
        return item.name === `${preInstallApp.toLowerCase()}_${arch}`
      }
      if (accel !== 'None' && preInstallApp === 'None') {
        return (
          item.name.includes(accel.toLowerCase()) && item.name.includes(arch)
        )
      }
      return (
        item.name.includes(accel.toLowerCase()) &&
        item.name.includes(preInstallApp.toLowerCase()) &&
        item.name.includes(arch)
      )
    })
    if (filteredTag.length > 0) {
      setTag(filteredTag?.[0].name)
      setSourceEmpty(false)
    } else {
      setTag('')
    }
    setTagList(filteredTag)
  }

  // image list
  const handleImagePop = async () => {
    if (publicType === 'public') {
      const originUrl = new URL(registryUrl)
      const urlParams = originUrl.searchParams
      const namespace = urlParams.get('namespace')

      let allRepositories = []
      let nextPage = `${originUrl.origin}/api/v1/repository?public=true&namespace=${namespace}&last_modified=true&popularity=true&repo_kind=image`

      try {
        while (nextPage) {
          const response = await axios.get(nextPage, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          })

          allRepositories = [...allRepositories, ...response.data.repositories]
          nextPage = response.data.next_page
            ? `${originUrl.origin}/api/v1/repository?public=true&namespace=${namespace}&last_modified=true&popularity=true&repo_kind=image&next_page=${response.data.next_page}`
            : null
        }

        setImageListData(allRepositories)
        setImageList(allRepositories)
        setPopActive(true)
        setImageText(defaultImageText)
      } catch (error) {
        setImageList([])
        setTagList([])
        setPopActive(false)
        setImageText(emptyImageText)
        setTag('')
      }
    } else if (publicType === 'private') {
      getHarborImages()
    }
  }

  const getHarborImages = () => {
    if (registryUrlActive) {
      if (registryUrlInValid) {
        setRegistryUserInvalid(true)
      } else {
        setRegistryUserInvalid(false)
        getPriavteHarborRepositories()
      }
    } else {
      setRegistryUserInvalid(false)
      getPublicHarborRepositories()
    }
  }

  // harbor list
  const getPriavteHarborRepositories = async () => {
    try {
      let allData = []
      let page = 1
      let hasMoreData = true

      while (hasMoreData) {
        try {
          const originUrl = new URL(registryUrl)
          const urlParams = originUrl.searchParams
          const project = urlParams.get('projects')

          const fetchedData = await request.post(`customharbor/private`, {
            auth: registryAuth,
            projectName: project,
            originUrl: originUrl.origin,
            page,
          })
          allData = [...allData, ...fetchedData]

          // 다음 페이지가 있는지 확인
          hasMoreData = fetchedData.length === 100
          page++
        } catch (error) {
          hasMoreData = false
        }
      }

      const list = allData.map(obj => {
        // eslint-disable-next-line no-shadow
        const [projectName, ...name] = obj.name.split('/')
        obj.name = name.join('/')
        obj.project_name = projectName
        obj.popularity = obj.pull_count
        return obj
      })
      setImageListData(list)
      setImageList(list)
      setPopActive(true)
      setImageText(defaultImageText)
    } catch {
      setImageList([])
      setTagList([])
      setPopActive(false)
      setImageText(emptyImageText)
      setTag('')
    }
  }

  // harbor list
  const getPublicHarborRepositories = async () => {
    try {
      const originUrl = registryUrl ? new URL(registryUrl) : ''
      const response = await request.post(`customharbor/public`, {
        originUrl,
      })
      const list = response.map(obj => {
        const [project, ...name] = obj.name.split('/')
        obj.name = name.join('/')
        obj.project_name = project
        obj.popularity = obj.pull_count
        return obj
      })
      setImageList(list)
      setPopActive(true)
      setImageText(defaultImageText)
    } catch {
      setImageList([])
      setTagList([])
      setPopActive(false)
      setImageText(emptyImageText)
      setTag('')
    }
  }

  const stepMoveCheck = step => {
    const { data } = form.current.props
    if (step === 1) {
      setRegistryCheckInValid(!registryChecked)
      if (
        data.name === undefined ||
        !PATTERN_USER_NAME.test(data.name) ||
        (publicType === 'private' &&
          (registryUrlInValid || registryUserInvalid || !registryChecked))
      ) {
        handleOk()
      } else {
        setSourceEmpty(false)
        setImageList([])
        setTagList([])
        setPopActive(false)
        setImageName('')
        setRegStep(2)
        setSubmitButtonFlag(false)
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
            {submitButtonFlag ? (
              <Button
                onClick={() => {
                  handleOk()
                }}
                className={classnames(styles['btn'], styles['btn-control'])}
                loading={store.isSubmitting}
                disabled={store.isSubmitting}
              >
                {t('RESOURCES_CREATE')}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleOk()
                }}
                className={classnames(styles['btn'], styles['btn-control'])}
                loading={store.isSubmitting}
                disabled={store.isSubmitting}
              >
                {t('RESOURCES_CREATE')}
              </Button>
            )}
          </>
        )}
      </>
    )
  }

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={title}
        onOk={handleOk}
        okText={t('RESOURCES_CREATE')}
        onCancel={closeModal}
        cancelText={t('RESOURCES_CANCEL')}
        visible={modelView}
        bodyClassName={styles.body}
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
                  className={`${
                    regStep === 2
                      ? styles.current
                      : regStep > 2
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
                  {regStep === 2
                    ? t('RESOURCES_CURRENT')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cont_boxwrap}>
            <div className={`${regStep === 1 ? '' : 'hide'}`}>
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
              <Form.Item
                label={t('RESOURCES_SOURCE')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <RadioGroup
                  name="is_public"
                  wrapClassName="radio"
                  defaultValue={publicType}
                  onChange={value => handleRegistryType(value)}
                >
                  {publicTypeOptions.map(option => (
                    <RadioButton key={option.value} value={option.value}>
                      {option.label}
                    </RadioButton>
                  ))}
                </RadioGroup>
              </Form.Item>
              <Form.Item>
                <div className={styles.content_box_wrap}>
                  <div className={styles.content_box}>
                    <div
                      className={`${styles.cont_box_wrap} ${
                        publicType === 'private' &&
                        (registryUrlInValid ||
                          registryCheckInValid ||
                          registryUserInvalid)
                          ? styles.formErrorStyle
                          : ''
                      }`}
                    >
                      <div className={styles.cont_box_section}>
                        <h6 className={styles.label}>
                          <div className={styles.form_check}>
                            <input type="checkbox" name="chk-1" id="chk-1" />
                            <label
                              htmlFor="chk-1"
                              onClick={() => handleRegistryUrlActive()}
                            ></label>
                          </div>
                          <div className={styles.title}>
                            <p>Registry URL</p>
                            <span>
                              {t('RESOURCES_IMAGE_REGIST_URL_SETTINGS')}
                            </span>
                          </div>
                        </h6>
                        {registryUrlActive && (
                          <>
                            <div className={styles.regi_group_area}>
                              <div className={styles.formarea}>
                                <div
                                  className={classnames(
                                    styles.custom_input,
                                    styles.w_1
                                  )}
                                >
                                  <label>Registry URL</label>
                                  <input
                                    type="text"
                                    name="regUrl"
                                    placeholder={
                                      publicType === 'private'
                                        ? 'https://{url}?projects={project_name}'
                                        : ''
                                    }
                                    defaultValue={registryUrl}
                                    onChange={e =>
                                      handleRegistryUrl(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            {publicType === 'private' && (
                              <div className={styles.regi_group_area}>
                                <div className={styles.formarea}>
                                  <div className={styles.custom_input}>
                                    <label>{t('RESOURCES_USER_NAME')}</label>
                                    <input
                                      type="text"
                                      name="username"
                                      defaultValue={userName}
                                      onChange={e =>
                                        handleRegistryUserName(e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className={styles.custom_input}>
                                    <label>{t('RESOURCES_PASSWORD')}</label>
                                    <input
                                      type="password"
                                      name="password"
                                      defaultValue={userPassword}
                                      onChange={e =>
                                        handleRegistryUserPassword(
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className={classnames(
                                      styles.btn,
                                      styles.btn_control
                                    )}
                                    onClick={() => checkUserValid()}
                                  >
                                    {t('RESOURCES_VALID')}
                                  </button>
                                </div>
                              </div>
                            )}
                            {publicType === 'private' && registryCheckInValid && (
                              <div
                                className="form-item-error"
                                style={{ color: '#ca2621' }}
                              >
                                {t('RESOURCES_VALID_TIP')}
                              </div>
                            )}
                            {publicType === 'private' && registryUserInvalid && (
                              <div
                                className="form-item-error"
                                style={{ color: '#ca2621' }}
                              >
                                {t('RESOURCES_HARBOR_USER_INVALID_TIP')}
                              </div>
                            )}
                            {registryUrlInValid && (
                              <div
                                className="form-item-error"
                                style={{ color: '#ca2621' }}
                              >
                                {t('RESOURCES_HARBOR_URL_INVALID_TIP')}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Form.Item>
              <Form.Item label={t('RESOURCES_SIZE')}>
                <div className={styles.content_box_wrap}>
                  <div className={styles.content_box}>
                    <div
                      className={`${styles.cont_box_wrap} ${
                        sizeEmpty ? styles.formErrorStyle : ''
                      }`}
                    >
                      <div className={styles.cont_box_section}>
                        <h6 className={styles.label}>
                          <div className={styles.form_check}>
                            <input type="checkbox" name="chk-0" id="chk-0" />
                            <label
                              htmlFor="chk-0"
                              onClick={() => handleImageSizeActive()}
                            ></label>
                          </div>
                          <div className={styles.title}>
                            <p>{t('RESOURCES_SPECIFY_IMAGE_SIZE')}</p>
                            <span>{t('RESOURCES_IMAGE_SIZE_TIP')}</span>
                          </div>
                        </h6>
                        {imageSizeActive && (
                          <div className={`${styles.select_inner_content}`}>
                            <UnitSlider
                              name="size"
                              max={200}
                              min={0}
                              marks={getMarks()}
                              defaultValue={imageSize}
                              unit={'GB'}
                              withInput
                              onChange={e => setImageSize(e)}
                              style={{ padding: '5px', marginLeft: '10px' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Form.Item>
              {sizeEmpty && (
                <div className="form-item-error">
                  {t('RESOURCES_CANNOT_IMAGE_SIZE_SET_ZERO')}
                </div>
              )}
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
            </div>
            {registryUrl === defaultRegistryUrl && (
              <div className={`${regStep === 2 ? '' : 'hide'}`}>
                <Form.Item label={t('RESOURCES_IMAGE_TEMPLATE')}>
                  <Form.Group>
                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_IMAGE')}
                            rules={[
                              {
                                required: true,
                                message: t('RESOURCES_SELECT_IMAGE_TIP'),
                              },
                            ]}
                          >
                            <CardSelect
                              className={`${styles.customUl} customCard`}
                              onChange={e => handleOsType(e)}
                              name="os_type"
                              options={osTypeOptions}
                              defaultValue={osType}
                            />
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_DISTRIBUTION')}
                            rules={[{ required: true }]}
                          >
                            <TypeSelect
                              // name="distro_type"
                              onChange={e => handleDistroType(e)}
                              defaultValue={distroType}
                              options={distroTypeOptions()}
                            />
                          </Form.Item>
                          <Form.Item>
                            <Input
                              defaultValue={`${osType[0].toUpperCase() +
                                osType.slice(
                                  1,
                                  osType.length
                                )} > ${distroType}`}
                              readOnly
                              style={{ maxWidth: 'none' }}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Item>
                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_CPU_TYPE')}
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <Select
                              name="arch_type"
                              defaultValue="x86_64"
                              options={archTypeOptions}
                              onChange={e => handleArchType(e)}
                            />
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_ACCELERATOR_TYPE')}
                            rules={[{ required: false }]}
                          >
                            <Select
                              name="accelerator_type"
                              defaultValue={acceleratorType}
                              options={accelTypeOptions()}
                              onChange={e => handleAcceleratorType(e)}
                            />
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_BOOT_TYPE')}
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <Select
                              name="boot_type"
                              defaultValue="legacy"
                              options={bootTypeOptions}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Item>

                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_PRE_INSTALLED_APP')}
                            rules={[{ required: false }]}
                          >
                            <TypeSelect
                              name="pre_installed_app"
                              defaultValue={preInstallAppType}
                              options={preInstallAppOptions()}
                              onChange={e => handlePreInstallAppType(e)}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Item>
                  </Form.Group>
                </Form.Item>
                <Form.Item>
                  <div className={styles.content_box_wrap}>
                    <div className={styles.content_box}>
                      {/* <label>소스</label> */}
                      <div
                        className={`${styles.cont_box_wrap} ${
                          sourceEmpty ? styles.formErrorStyle : ''
                        }`}
                      >
                        <div className={styles.cont_box_section}>
                          <div
                            className={`${styles.select_inner_content} select_inner_content`}
                          >
                            <div
                              className={classnames(
                                styles.select_list_box,
                                styles.inner_image
                              )}
                            >
                              <div
                                className={classnames(
                                  styles.selected_item,
                                  styles.image
                                )}
                                onClick={() => handleDistroType(distroType)}
                              >
                                <p className={styles.inner_image}>
                                  <span>Docker</span>
                                </p>
                                <div className={styles.placeholder}>
                                  {imageName}
                                </div>
                              </div>
                              {popActive && (
                                <div
                                  className={styles.select_list_image}
                                  style={{ display: 'block' }}
                                >
                                  <ul className={styles.sel_img}>
                                    {imageList.length > 0 &&
                                      imageList.map((obj, idx) => (
                                        <li
                                          onClick={() =>
                                            handleImageTag(
                                              obj.name,
                                              obj.project_name
                                            )
                                          }
                                          key={idx}
                                        >
                                          <i
                                            style={{
                                              background: `url('/assets/resources/images/icons/ico-os-${
                                                obj.name.split('-')[0]
                                              }.svg') center no-repeat`,
                                              width: '30px',
                                              height: '30px',
                                              marginRight: '5px',
                                            }}
                                          ></i>
                                          <p className={styles.name}>
                                            <strong>{obj.name}</strong>
                                            <span>{obj.description}</span>
                                          </p>
                                          <div className={styles.rank}>
                                            <i
                                              className={styles.ico_type_star}
                                            ></i>
                                            <span>{obj.popularity}</span>
                                          </div>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={styles.section_box}>
                            <Loading spinning={loading}>
                              {tagList.length > 0 ? (
                                <div className={styles.radio_list}>
                                  {tagList.map((obj, idx) => (
                                    <div
                                      className={styles.form_radio}
                                      key={idx}
                                      onClick={() => setTag(obj.name)}
                                    >
                                      <input
                                        type="radio"
                                        name="rdo-tag"
                                        value="Y"
                                        id={`rdo-tag-n${idx}`}
                                        defaultChecked={idx === 0}
                                      />
                                      <label htmlFor={`rdo-tag-n${idx}`}>
                                        <i className={styles.ico_etc_tag}></i>
                                        <span>{obj.name}</span>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className={styles.empty}>
                                  <i className={styles.ico_type_container2}></i>
                                  <span>{imageText}</span>
                                </div>
                              )}
                            </Loading>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Form.Item>
                {sourceEmpty && (
                  <div className="form-item-error">
                    {t('RESOURCES_SETTING_IMAGE_TIP')}
                  </div>
                )}
              </div>
            )}
            {registryUrlActive && registryUrl !== defaultRegistryUrl && (
              <div className={`${regStep === 2 ? '' : 'hide'}`}>
                <Form.Item label={t('RESOURCES_IMAGE_TEMPLATE')}>
                  <Form.Group>
                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_IMAGE')}
                            rules={[
                              {
                                required: true,
                                message: t('RESOURCES_SELECT_IMAGE_TIP'),
                              },
                            ]}
                          >
                            <CardSelect
                              className={`${styles.customUl} customCard`}
                              onChange={e => handleOsType(e)}
                              name="os_type"
                              options={osTypeOptions}
                              defaultValue={osType}
                            />
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_DISTRIBUTION')}
                            rules={[{ required: true }]}
                          >
                            <TypeSelect
                              // name="distro_type"
                              onChange={e => setDistroType(e)}
                              defaultValue={distroType}
                              options={distroTypeOptions()}
                            />
                          </Form.Item>
                          <Form.Item>
                            <Input
                              defaultValue={`${osType[0].toUpperCase() +
                                osType.slice(
                                  1,
                                  osType.length
                                )} > ${distroType}`}
                              readOnly
                              style={{ maxWidth: 'none' }}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Item>

                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_CPU_TYPE')}
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <Select
                              name="arch_type"
                              defaultValue="x86_64"
                              options={archTypeOptions}
                            />
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_BOOT_TYPE')}
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <Select
                              name="boot_type"
                              defaultValue="legacy"
                              options={bootTypeOptions}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Item>

                    <Form.Item>
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_REAL_TIME')}
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <RadioGroup
                              name="is_realtime"
                              wrapClassName="radio"
                              defaultValue={realTime}
                              onChange={value => setRealTime(value)}
                            >
                              {realTimeOptions.map(option => (
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
                          <Form.Item label={t('RESOURCES_VERSION')}>
                            <Input
                              name="version"
                              maxLength={253}
                              style={{ maxWidth: 'none' }}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Item>
                  </Form.Group>
                </Form.Item>
                <Form.Item>
                  <div className={styles.content_box_wrap}>
                    <div className={styles.content_box}>
                      {/* <label>소스</label> */}
                      <div
                        className={`${styles.cont_box_wrap} ${
                          sourceEmpty ? styles.formErrorStyle : ''
                        }`}
                      >
                        <div className={styles.cont_box_section}>
                          <div
                            className={`${styles.select_inner_content} select_inner_content`}
                          >
                            <div
                              className={classnames(
                                styles.select_list_box,
                                styles.inner_image
                              )}
                            >
                              <div
                                className={classnames(
                                  styles.selected_item,
                                  styles.image
                                )}
                                onClick={() => handleImagePop()}
                              >
                                <p className={styles.inner_image}>
                                  <span>Docker</span>
                                </p>
                                <div className={styles.placeholder}>
                                  {imageName}
                                </div>
                              </div>
                              {popActive && (
                                <div
                                  className={styles.select_list_image}
                                  style={{ display: 'block' }}
                                >
                                  <div className={styles.sel_search}>
                                    <i className={styles.ico_search_small}></i>
                                    <div className={styles.input_search_pop}>
                                      <input
                                        type="text"
                                        placeholder={t('RESOURCES_SEARCH')}
                                        onKeyDown={searchImageList}
                                        style={{ border: 0 }}
                                      />
                                    </div>
                                  </div>
                                  <ul className={styles.sel_img}>
                                    {imageList.length > 0 &&
                                      imageList.map((obj, idx) => (
                                        <li
                                          onClick={() =>
                                            handleImageTag(
                                              obj.name,
                                              obj.project_name
                                            )
                                          }
                                          key={idx}
                                        >
                                          {/* <img src={`/assets/resources/images/icons/ico-os-${obj.name.split('-')[0]}.svg`} /> */}
                                          <i
                                            style={{
                                              background: `url('/assets/resources/images/icons/ico-os-${
                                                obj.name.split('-')[0]
                                              }.svg') center no-repeat`,
                                              width: '30px',
                                              height: '30px',
                                              marginRight: '5px',
                                            }}
                                          ></i>
                                          <p className={styles.name}>
                                            <strong>{obj.name}</strong>
                                            <span>{obj.description}</span>
                                          </p>
                                          <div className={styles.rank}>
                                            <i
                                              className={styles.ico_type_star}
                                            ></i>
                                            <span>{obj.popularity}</span>
                                          </div>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={styles.section_box}>
                            <Loading spinning={loading}>
                              {tagList.length > 0 ? (
                                <div className={styles.radio_list}>
                                  {tagList.map((obj, idx) => (
                                    <div
                                      className={styles.form_radio}
                                      key={idx}
                                      onClick={() => setTag(obj.name)}
                                    >
                                      <input
                                        type="radio"
                                        name="rdo-tag"
                                        value="Y"
                                        id={`rdo-tag-n${idx}`}
                                        defaultChecked={idx === 0}
                                      />
                                      <label htmlFor={`rdo-tag-n${idx}`}>
                                        <i className={styles.ico_etc_tag}></i>
                                        <span>{obj.name}</span>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className={styles.empty}>
                                  <i className={styles.ico_type_container2}></i>
                                  <span>{imageText}</span>
                                </div>
                              )}
                            </Loading>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Form.Item>

                {sourceEmpty && (
                  <div className="form-item-error">
                    {t('RESOURCES_SETTING_IMAGE_TIP')}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  )
}

export default ResourceImageModal
