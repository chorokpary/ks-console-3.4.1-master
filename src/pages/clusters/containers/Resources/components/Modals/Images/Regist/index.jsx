import React, { useEffect, useRef, useState } from 'react'
import { range } from 'lodash'
import {
  Columns,
  Column,
  Button,
  Form,
  Input,
  Loading,
  Notify,
  Select,
  TextArea,
} from '@kube-design/components'
import {
  RadioButton,
  RadioGroup,
} from '@kube-design/components/lib/components/Radio'
import classnames from 'classnames'
import axios from 'axios'
import request from 'utils/request'

import DistroTypeStore from 'stores/resources/distrotype'
import PreInstallAppStore from 'stores/resources/preinstalls'
import GpuNodeStore from 'stores/resources/gpunodes'
import { UnitSlider } from 'components/Inputs'
import { Modal } from 'components/Base'
import { PATTERN_USER_NAME } from 'utils/constants'
import CardSelect from '../../../CardSelect'
import TypeSelect from '../../../TypeSelect'
import styles from './index.scss'

import { ProjectSelect } from 'components/Inputs'
import SecretStore from 'stores/secret'
import ContainerForm from '../ContainerForm'

const defaultImageSize = '15GB'

const defaultRegistryUrl = 'https://quay.io?namespace=edgestack'

const realTimeOptions = [
  { label: t('RESOURCES_NOT_USE'), value: false },
  { label: t('RESOURCES_USE'), value: true },
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

const ResourceImageModal = ({
  props,
  cluster,
  title,
  store,
  onOk,
  startRefresh,
}) => {
  const imageRegistryStore = new SecretStore()

  const distroTypeStore = new DistroTypeStore()
  const preInstallAppStore = new PreInstallAppStore()
  const gpuNodeStore = new GpuNodeStore()

  const form = useRef()
  const [formData] = useState({})
  const [modelView, setModalView] = useState(true)

  const [realTime, setRealTime] = useState(false)
  const [osType, setOsType] = useState('linux')
  const [userName, setUserName] = useState('')
  const [userPassword, setUserPassword] = useState('')

  const [imageSize, setImageSize] = useState(defaultImageSize)
  const [imageSizeActive, setImageSizeActive] = useState(false)
  const [sizeEmpty, setSizeEmpty] = useState(false)

  const [regStep, setRegStep] = useState(1)

  const [distroTypeData, setDistroTypeData] = useState([])
  const [distroType, setDistroType] = useState('ubuntu')
  const [distroTypeList, setDistroTypeList] = useState([])
  const [linuxDistroTypeList, setLinuxDistroTypeList] = useState([])
  // const [edgeDistroTypeList, setEdgeDistroTypeList] = useState([])
  const [acceleratorType, setAcceleratorType] = useState('None')
  const [acceleratorTypeList, setAcceleratorTypeList] = useState(['None'])
  const [preInstallAppType, setPreInstallAppType] = useState('None')
  const [preInstallAppList, setPreInstallAppList] = useState([])
  const [archType, setArchType] = useState('x86_64')

  const [storageClass, setStorageClass] = useState('nfs-csi')
  const [storageClassDataList, setStorageClassDataList] = useState([])

  const [projectName, setProjectName] = useState('default')
  const [imageRegistries, setImageRegistries] = useState([])
  const [imageTag, setImageTag] = useState({})

  const [secret, setSecret] = useState({})
  const [secretValueNull, setSecretValueNull] = useState(false)

  useEffect(() => {
    const getDistroTypeList = async () => {
      const dist = await distroTypeStore.fetchList()
      setDistroTypeData(dist)
      // setEdgeDistroTypeList(
      //   dist.filter(
      //     obj =>
      //       obj.name !== 'windows' &&
      //       obj.name !== 'fedora' &&
      //       obj.name !== 'rhel'
      //   )
      // )
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

    const getStorageClassList = async () => {
      try {
        const response = await request.get(
          'kapis/resources.kubesphere.io/v1alpha3/storageclasses'
        )
        if (response && response.items && Array.isArray(response.items)) {
          setStorageClassDataList(response.items)

          // nfs-csi가 있는지 확인하고, 없다면 default storage class를 찾아서 설정
          const hasNfsCsi = response.items.some(
            item => item.metadata && item.metadata.name === 'nfs-csi'
          )

          if (!hasNfsCsi) {
            // default storage class 찾기
            const defaultStorageClass = response.items.find(
              item =>
                item.metadata &&
                item.metadata.annotations &&
                item.metadata.annotations[
                  'storageclass.kubernetes.io/is-default-class'
                ] === 'true'
            )

            if (defaultStorageClass) {
              setStorageClass(defaultStorageClass.metadata.name)
            }
          }
        } else {
          setStorageClassDataList([])
        }
      } catch (error) {
        // console.error('Failed to fetch storage classes:', error)
        setStorageClassDataList([])
      }
    }

    // const getVmImageList = async () => {
    //   const originUrl = new URL(registryUrl)
    //   const urlParams = originUrl.searchParams
    //   const namespace = urlParams.get('namespace')

    //   let allRepositories = []
    //   let nextPage = `${originUrl.origin}/api/v1/repository?public=true&namespace=${namespace}&popularity=true&repo_kind=image&`

    //   try {
    //     while (nextPage) {
    //       const response = await axios.get(nextPage, {
    //         headers: {
    //           'X-Requested-With': 'XMLHttpRequest',
    //         },
    //       })
    //       allRepositories = [...allRepositories, ...response.data.repositories]
    //       nextPage = response.data.next_page
    //         ? `${originUrl.origin}/api/v1/repository?public=true&namespace=${namespace}&last_modified=true&popularity=true&repo_kind=image&next_page=${response.data.next_page}`
    //         : null
    //     }
    //     setImageListData(allRepositories)
    //   } catch {
    //     setImageListData([])
    //   }
    // }

    getDistroTypeList()
    getAcceleratorTypeList()
    getPreInstallAppList()
    getStorageClassList()
    // getVmImageList()
  }, [])

  useEffect(() => {
    const val = Number(imageSize.substring(0, imageSize.length - 2))

    if (val < 11) {
      setSizeEmpty(true)
    } else {
      setSizeEmpty(false)
    }
  }, [imageSize])

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

  const storageClassOptions = () => {
    return storageClassDataList
      .filter(obj => obj && obj.metadata && obj.metadata.name)
      .map(obj => ({
        label: t(obj.metadata.name),
        value: t(obj.metadata.name),
      }))
  }

  const handleOk = () => {
    form.current.validator(async () => {
      const { data } = form.current.props

      if (sizeEmpty) {
        return
      }
      data.size = imageSize.slice(0, imageSize.length - 2)
      data.distro_type = distroType
      // data.source = `docker://${dockerUrl}/${projectNameOrigin}/${imageName}:${tag}`
      data.storage_class = storageClass

      data.username = ''
      data.password = ''
      data.source = `docker://${imageTag.image}`

      if (!secretValueNull) {
        const secretsData = await imageRegistryStore.fetchDetail({
          cluster: cluster,
          namespace: projectName,
          name: secret.value,
        })

        const secrets =
          secretsData?.data?.['.dockerconfigjson']?.auths?.[secret.url] || {}
        data.username = secrets.username
        data.password = secrets.password
        data.registrysecrets = secret.value
      }

      if (distroType === 'rocky') {
        data.boot_type = 'uefi'
      }
      // console.log('data : ', data)

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
      // if (registryUrl === defaultRegistryUrl) {
      //   setDistroTypeList(edgeDistroTypeList)
      // } else {
      setDistroTypeList(linuxDistroTypeList)
      // }
    } else {
      setDistroType('')
      setDistroTypeList([])
    }
  }

  const handleDistroType = value => {
    setDistroType(value)
  }

  const handleArchType = value => {
    setArchType(value)
  }

  const handleAcceleratorType = value => {
    setAcceleratorType(value)
  }

  const handlePreInstallAppType = value => {
    setPreInstallAppType(value)
  }

  const getImageRegistries = async () => {
    const imageRegistries = await imageRegistryStore.fetchListByK8s({
      cluster: cluster,
      namespace: projectName,
      fieldSelector: `type=kubernetes.io/dockerconfigjson`,
    })
    setImageRegistries(imageRegistries)
  }

  useEffect(() => {
    getImageRegistries()
    setImageTag({})
  }, [projectName])

  const stepMoveCheck = step => {
    const { data } = form.current.props
    if (step === 1) {
      if (data.name === undefined || !PATTERN_USER_NAME.test(data.name)) {
        handleOk()
      } else {
        setRegStep(2)
      }
    }
    if (step === 2) {
      setRegStep(3)
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
              onClick={() => {
                handleOk()
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
              loading={store.isSubmitting}
              disabled={Object.keys(imageTag).length === 0}
            >
              {t('RESOURCES_CREATE')}
            </Button>
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
              <span className={styles.detail}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>{t('컨테이너 설정')}</div>
                <div className={styles.situation}>
                  {regStep === 3
                    ? t('RESOURCES_CURRENT')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cont_boxwrap}>
            <div className={`${regStep === 1 ? '' : 'hide'}`}>
              <Form.Item>
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
                        name="project"
                        defaultValue={projectName}
                        cluster={cluster}
                        onChange={e => {
                          setProjectName(e)
                        }}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
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
                              osType.slice(1, osType.length)} > ${distroType}`}
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
                    </Columns>
                  </Form.Item>

                  <Form.Item>
                    <Columns>
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
                            defaultValue="uefi"
                            options={bootTypeOptions}
                          />
                        </Form.Item>
                      </Column>
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
                  </Form.Item>
                  <Form.Item>
                    <Columns>
                      <Column>
                        <Form.Item label={t('RESOURCES_VERSION')}>
                          <Input
                            name="version"
                            placeholder="ex) v1.30.1"
                            maxLength={253}
                            style={{ maxWidth: 'none' }}
                          />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item
                          label={t('RESOURCES_REAL_TIME')}
                          // rules={[
                          //   {
                          //     required: true,
                          //   },
                          // ]}
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
            </div>
            <div className={`${regStep === 3 ? '' : 'hide'}`}>
              <Form.Item
                label={t('CONTAINER_SETTINGS')}
                desc={t('CONTAINER_SETTINGS_DESC')}
              >
                <ContainerForm
                  key={imageRegistries}
                  type={'Add'}
                  namespace={projectName}
                  imageRegistries={imageRegistries}
                  cluster={cluster}
                  onImageTag={setImageTag}
                  onSecretChange={setSecret}
                  onSecretValueNull={setSecretValueNull}
                />
              </Form.Item>
            </div>
          </div>
          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  )
}

export default ResourceImageModal
