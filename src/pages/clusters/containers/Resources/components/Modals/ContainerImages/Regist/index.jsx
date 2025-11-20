import React, { useEffect, useRef, useState } from 'react'
import { Modal } from 'components/Base'
import { UnitSlider } from 'components/Inputs'
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
import ClusterDistroTypeStore from 'stores/resources/clusterdistrotype'
import classnames from 'classnames'
import axios from 'axios'
import { Base64 } from 'js-base64'
import request from 'utils/request'

import GpuNodeStore from 'stores/resources/gpunodes'
import TypeSelect from '../../../TypeSelect'
import styles from './index.scss'

const defaultImageSize = '15GB'
const regexVersion = /^v(\d+\.\d+\.\d+)$/
const regexName = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/

const defaultImageText = t('RESOURCES_CONTAINER_IMAGE_SETTINGS_DESC')
const emptyImageText = t('RESOURCES_NOT_FOUND_IMIAGE')
// const defaultRegistryUrl = 'https://quay.io/api/v1/repository?public=true&namespace=edgestack&last_modified=true&popularity=true&repo_kind=image'
const defaultRegistryUrl = 'https://quay.io?namespace=edgestack'

const publicTypeOptions = [
  { label: t('RESOURCES_PUBLIC'), value: 'public' },
  { label: t('RESOURCES_PRIVATE'), value: 'private' },
]

const archTypeOptions = [
  { label: 'x86_64', value: 'x86_64' },
  { label: 'aarch64', value: 'aarch64' },
]

const ResourceImageModal = props => {
  const distroTypeStore = new ClusterDistroTypeStore()
  const gpuNodeStore = new GpuNodeStore()

  const { title, onOk } = props
  const form = useRef()
  const [formData] = useState({})

  const [modelView, setModalView] = useState(true)

  const [publicType, setPublicType] = useState('public')

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

  const [distroType, setDistroType] = useState('ubuntu-2204')
  const [distroTypeList, setDistroTypeList] = useState([])
  const [acceleratorType, setAcceleratorType] = useState('None')
  const [acceleratorTypeList, setAcceleratorTypeList] = useState(['None'])
  const [archType, setArchType] = useState('x86_64')

  const [imageName, setImageName] = useState('')
  const [unfilteredTags, setUnfilteredTags] = useState([])
  const [filteredTags, setFilteredTags] = useState([])
  const [tag, setTag] = useState('')
  const [projectName, setProjectName] = useState('edgestack')
  const [dockerUrl, setDockerUrl] = useState('quay.io')

  const [storageClass, setStorageClass] = useState('nfs-csi')
  const [storageClassDataList, setStorageClassDataList] = useState([])

  const [loading, setLoading] = useState(false)
  const [sourceEmpty, setSourceEmpty] = useState(false)

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

  // registry url 활성/비활성
  const handleRegistryUrlActive = () => {
    if (registryUrlActive) {
      setDockerUrl('quay.io')
      setRegistryUrlActive(false)
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

  const handleOk = () => {
    form.current.validator(() => {
      const { data } = form.current.props

      if (sizeEmpty) {
        return
      }
      data.size = imageSize.slice(0, imageSize.length - 2)

      if (imageName === '' || tag === '') {
        setSourceEmpty(true)
        return
      }
      setSourceEmpty(false)

      data.username = userName
      data.password = userPassword
      data.os_distro = distroType
      data.source = `docker://${dockerUrl}/${projectName}/${imageName}:${tag}`
      data.storage_class = storageClass
      if (
        publicType === 'public' &&
        (!registryUrlActive || registryUrl === defaultRegistryUrl)
      ) {
        data.kube_version = tag.split('-')[0]
      }
      onOk({ image: data })
    })
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

  useEffect(() => {
    const val = Number(imageSize.substring(0, imageSize.length - 2))

    if (val === 0) {
      setSizeEmpty(true)
    } else {
      setSizeEmpty(false)
    }
  }, [imageSize])

  const stepMoveCheck = step => {
    const { data } = form.current.props

    if (step === 1) {
      setRegistryCheckInValid(!registryChecked)
      if (
        data.name === undefined ||
        !regexName.test(data.name) ||
        (publicType === 'private' &&
          (registryUrlInValid || registryUserInvalid || !registryChecked))
      ) {
        handleOk()
      } else {
        setRegStep(2)
        setSourceEmpty(false)
        setUnfilteredTags([])
        setPopActive(false)
        setImageName('')
        setSubmitButtonFlag(false)
      }
    }
  }

  const closeModal = () => {
    props.startRefresh()
    setModalView(false)
  }

  useEffect(() => {
    const getDistroTypeList = async () => {
      const dist = await distroTypeStore.fetchList()
      setDistroTypeList(dist.filter(obj => obj.name !== 'windows'))
    }

    const getAcceleratorTypeList = async () => {
      const accelList = await gpuNodeStore.fetchAcceleratorTypeList(props)
      setAcceleratorTypeList(accelList)
    }

    const getStorageClassList = async () => {
      try {
        const response = await request.get(
          'kapis/resources.kubesphere.io/v1alpha3/storageclasses'
        )
        if (response && response.items && Array.isArray(response.items)) {
          setStorageClassDataList(response.items)
        } else {
          setStorageClassDataList([])
        }
      } catch (error) {
        console.error('Failed to fetch storage classes:', error)
        setStorageClassDataList([])
      }
    }

    getDistroTypeList()
    getAcceleratorTypeList()
    getStorageClassList()
  }, [])

  const distroTypeOptions = () => {
    return distroTypeList.map(obj => ({
      label: t(obj.name),
      description: t(obj.vendor),
      icon: `ico-os-${obj.name.split('-')[0]}`,
      value: t(obj.name),
    }))
  }

  const accelTypeOptions = () => {
    return acceleratorTypeList.map(obj => ({
      label: t(obj),
      value: t(obj),
    }))
  }

  const storageClassOptions = () => {
    return storageClassDataList
      .filter(obj => obj && obj.metadata && obj.metadata.name)
      .map(obj => ({
        label: t(obj.metadata.name),
        value: t(obj.metadata.name),
      }))
  }

  const handleDistroType = value => {
    let kubeDistroImage
    setDistroType(value)
    if (value === 'rocky-8' || value === 'rocky-9') {
      kubeDistroImage = `${value}-uefi-kube`
    } else {
      kubeDistroImage = `${value}-kube`
    }
    setLoading(true)
    getPublicImageTag(kubeDistroImage)
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

    const tags = Object.values(response.data.tags).filter(
      obj => obj.size !== null && obj.size !== 0
    )
    setUnfilteredTags(tags)
    setSourceEmpty(false)
    getMatchingTags(tags, archType, acceleratorType)
  }

  const handleArchType = value => {
    setLoading(true)
    setArchType(value)
    getMatchingTags(unfilteredTags, value, acceleratorType)
  }

  const handleAcceleratorType = value => {
    setLoading(true)
    setAcceleratorType(value)
    getMatchingTags(unfilteredTags, archType, value)
  }

  const getMatchingTags = (tags, arch, accel) => {
    let tagRegex = ''
    if (arch === 'x86_64') {
      arch = 'amd64'
    }
    if (accel === 'None') {
      tagRegex = RegExp(`^v\\d+\\.\\d+\\.\\d+(-${arch})$`)
    } else {
      tagRegex = RegExp(
        `^v\\d+\\.\\d+\\.\\d+(-${accel.toLowerCase()}(?:-\\d+)?(?:-[a-zA-Z0-9]+)*-${arch})$`
      )
    }
    const matchingTags = tags
      .filter(ver => tagRegex.test(ver.name))
      .sort((a, b) => b.name.localeCompare(a.name))
    setFilteredTags(matchingTags)
    setTag(matchingTags?.[0]?.name)
    setLoading(false)
  }

  const versionValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_VERSION_EMPTY_DESC') })
    }
    if (!regexVersion.test(value)) {
      return callback({ message: t('RESOURCES_VERSION_CHECK_DESC') })
    }
    callback()
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
    setUnfilteredTags(tagList)
    setTag(tagList?.[0]?.name)
    setSourceEmpty(false)
  }

  // image list
  const handleImagePop = async () => {
    if (publicType === 'public') {
      try {
        const originUrl = new URL(registryUrl)
        const urlParams = originUrl.searchParams
        const namespace = urlParams.get('namespace')

        const response = await axios.get(
          `${originUrl.origin}/api/v1/repository?public=true&namespace=${namespace}&last_modified=true&popularity=true&repo_kind=image`,
          {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        )
        setImageListData(response.data.repositories)
        setImageList(response.data.repositories)
        setPopActive(true)
        setImageText(defaultImageText)
      } catch {
        setImageList([])
        setUnfilteredTags([])
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
      setUnfilteredTags([])
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
      setImageListData(list)
      setImageList(list)
      setPopActive(true)
      setImageText(defaultImageText)
    } catch {
      setImageList([])
      setUnfilteredTags([])
      setPopActive(false)
      setImageText(emptyImageText)
      setTag('')
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
                disabled
                loading={true}
              >
                {t('RESOURCES_CREATE')}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleOk()
                }}
                className={classnames(styles['btn'], styles['btn-control'])}
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
        width={800}
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
                    pattern: regexName,
                    message: t('RESOURCES_INVALID_NAME_DESC'),
                  },
                ]}
                desc={t('NAME_DESC')}
              >
                <Input
                  name="name"
                  maxLength={253}
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
            {publicType === 'public' &&
              (!registryUrlActive || registryUrl === defaultRegistryUrl) && (
                <div className={`${regStep === 2 ? '' : 'hide'}`}>
                  <Form.Item label={t('RESOURCES_IMAGE_TEMPLATE')}>
                    <Form.Group>
                      <Columns>
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
                              defaultValue={`Linux > ${distroType}`}
                              readOnly
                              style={{ maxWidth: 'none' }}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
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
                      </Columns>

                      {/* Storage Class 선택 필드 추가 */}
                      <Columns>
                        <Column>
                          <Form.Item
                            label={t('RESOURCES_STORAGE_CLASS')}
                            rules={[{ required: true }]}
                          >
                            <Select
                              name="storage_class"
                              defaultValue={storageClass}
                              options={storageClassOptions()}
                              onChange={e => setStorageClass(e)}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Group>
                  </Form.Item>
                  <Form.Item>
                    <div className={styles.content_box_wrap}>
                      <div
                        className={`${styles.cont_box_wrap} ${
                          sourceEmpty ? styles.formErrorStyle : ''
                        }`}
                      >
                        <div className={styles.cont_box_section}>
                          <div
                            className={`${styles.select_inner_content} select_inner_content`}
                            onClick={() => handleDistroType(distroType)}
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
                              >
                                <p className={styles.inner_image}>
                                  <span>Docker</span>
                                </p>
                                <div className={styles.placeholder}>
                                  {imageName}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={styles.section_box}>
                            <Loading spinning={loading}>
                              {filteredTags.length > 0 ? (
                                <div className={styles.radio_list}>
                                  {filteredTags.map((obj, idx) => (
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
                                  <span>{defaultImageText}</span>
                                </div>
                              )}
                            </Loading>
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
                              defaultValue={`Linux > ${distroType}`}
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
                            label={t('RESOURCES_ACCELERATOR_TYPE')}
                            rules={[{ required: false }]}
                          >
                            <Select
                              name="accelerator_type"
                              defaultValue={acceleratorType}
                              options={accelTypeOptions()}
                              onChange={e => setAcceleratorType(e)}
                            />
                          </Form.Item>
                        </Column>
                      </Columns>
                    </Form.Item>
                    <Columns>
                      <Column>
                        <Form.Item
                          label={t('RESOURCES_KUBERNETES_VERSION')}
                          rules={[
                            { required: true, validator: versionValidator },
                          ]}
                        >
                          <Input
                            name="kube_version"
                            maxLength={253}
                            style={{ maxWidth: 'none' }}
                            placeholder="v1.1.1"
                          />
                        </Form.Item>
                      </Column>
                    </Columns>

                    {/* Storage Class 선택 필드 추가 */}
                    <Columns>
                      <Column>
                        <Form.Item
                          label={t('RESOURCES_STORAGE_CLASS')}
                          rules={[{ required: false }]}
                        >
                          <Select
                            name="storage_class"
                            defaultValue={storageClass}
                            options={storageClassOptions()}
                            onChange={e => setStorageClass(e)}
                          />
                        </Form.Item>
                      </Column>
                    </Columns>
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
                              {unfilteredTags.length > 0 ? (
                                <div className={styles.radio_list}>
                                  {unfilteredTags.map((obj, idx) => (
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
