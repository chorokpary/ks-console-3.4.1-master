import React, { useEffect, useRef, useState } from 'react'
import { Modal, List } from 'components/Base'
import { UnitSlider, NumberInput } from 'components/Inputs'
import { get, omit, range } from 'lodash'
import { Form, Input, Select, Button, TextArea, Dropdown } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import DistroTypeStore from 'stores/resources/distrotype'
import styles from './index.scss'
import TypeSelect from '../../../TypeSelect'
import CardSelect from '../../../CardSelect'
import classnames from 'classnames'
import axios from 'axios'
import { Base64 } from 'js-base64'
import { Loading } from '@kube-design/components'
import { Notify } from '@kube-design/components'

import { PATTERN_NAME } from 'utils/constants'

const defaultImageSize = '12GB'
const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;
const regexVersion = /^v(\d+\.\d+\.\d+)$/;

const defaultImageText = t('RESOURCES_CONTAINER_IMAGE_SETTINGS_DESC')
const emptyImageText = t('RESOURCES_NOT_FOUND_IMIAGE')
// const defaultRegistryUrl = 'https://quay.io/api/v1/repository?public=true&namespace=edgestack&last_modified=true&popularity=true&repo_kind=image'
const defaultRegistryUrl = 'https://quay.io?namespace=edgestack'

const publicTypeOptions = [
  { label: t('RESOURCES_PUBLIC'), value: 'public', },
  { label: t('RESOURCES_PRIVATE'), value: 'private', }
]

const archTypeOptions = [
  { label: 'x86_64', value: 'x86_64', },
  { label: 'aarch64', value: 'aarch64', },
]

const bootTypeOptions = [
  { label: 'legacy', value: 'legacy', },
  { label: 'uefi', value: 'uefi', }
]

const osTypeOptions = [
  { label: 'Linux', value: 'linux', icon: 'ico-linux', },
  { label: 'Windows', value: 'windows', icon: 'ico-windows', },
  // { label: 'etc', value: '', icon: 'ico-plus', }
]

export default function ResourceImageModal({ title, store, onOk }) {

  const form = useRef();
  const [formData, setFormData] = useState({});
  const distroTypeStore = new DistroTypeStore();

  const [modelView, setModalView] = useState(true);

  const [osType, setOsType] = useState('linux')
  const [distroTypeData, setDistroTypeData] = useState([])
  const [distroTypeList, setDistroTypeList] = useState([])
  const [distroType, setDistroType] = useState('ubuntu')

  const [imageSize, setImageSize] = useState(defaultImageSize)
  const [imageSizeActive, setImageSizeActive] = useState(false)
  const [sizeEmpty, setSizeEmpty] = useState(false)

  const [regStep, setRegStep] = useState(1);
  const [submitButtonFlag, setSubmitButtonFlag] = useState(false);

  const [imageName, setPropsImageName] = useState('')
  const [imageTag, setPropsImageTag] = useState('')
  const [projectName, setProjectName] = useState('edgestack')
  const [dockerUrl, setDockerUrl] = useState('quay.io')

  const [sourceEmpty, setSourceEmpty] = useState(false)
  const [userName, setPropsUserName] = useState('')
  const [userPassword, setPropsUserPassword] = useState('')


  useEffect(() => {
    const getDistroTypeList = async () => {
      const dist = await distroTypeStore.fetchList();
      setDistroTypeData(dist)
      setDistroTypeList(dist.filter(obj => obj.name != 'windows'))
    };
    getDistroTypeList();
  }, [])

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
    const opt = distroTypeList.map((obj) => ({
      label: t(obj.name),
      description: t(obj.vendor),
      icon: `ico-os-${obj.name}`,
      value: t(obj.name),
    }))
    return opt
  }

  const handleOk = () => {

    form.current.validator(() => {
      const { data } = form.current.props;

      if (sizeEmpty) {
        return
      } else {
        data.size = Number(imageSize.slice(0, imageSize.length - 2))
      }
      if (imageTag == '') {
        setSourceEmpty(true)
        return
      } else {
        setSourceEmpty(false)
      }

      data.userName = userName
      data.userPassword = userPassword
      data.os_distro = distroType;
      data.source = `docker://${dockerUrl}/${projectName}/${imageName}:${imageTag}`;

      onOk({ image: data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const getMarks = () => {
    const max = 40
    const count = 5
    return range(count).reduce((marks, index) => {
      const value = (max * index) / (count - 1)
      const mark = value === 0 ? '0' : `${Math.floor(value)}GB`
      return { ...marks, [value]: mark }
    }, {})
  }

  const handleOsType = (value) => {
    setOsType(value)
    if (value == 'windows') {
      setDistroType('windows')
      setDistroTypeList(distroTypeData.filter(obj => obj.name == 'windows'))
    } else {
      setDistroType('ubuntu')
      setDistroTypeList(distroTypeData.filter(obj => obj.name != 'windows'))
    }
  }

  const versionValidator = (rule, value, callback) => {
    if (!!!value) {
      return callback({ message: t('RESOURCES_VERSION_EMPTY_DESC') })
    }
    if (!regexVersion.test(value)) {
      return callback({ message: t('RESOURCES_VERSION_CHECK_DESC') })
    }
    callback()
  }

  useEffect(() => {
    let val = Number(imageSize.substring(0, imageSize.length - 2))

    if (val == 0) {
      setSizeEmpty(true)
    } else {
      setSizeEmpty(false)
    }
  }, [imageSize])

  const stepMoveCheck = (step) => {
    const { data } = form.current.props;

    if (step == 1) {
      if (data.name == undefined || !regexName.test(data.name) || sizeEmpty
        || !regexVersion.test(data.kube_version)) {
        handleOk();
      } else {
        setRegStep(2);
        setSubmitButtonFlag(false);
      }
    }
  }

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

  const fnGetModalFooter = () => {
    let elements = "";
    elements =
      <>
        {regStep == 1 &&
          <>
            <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button>
            <Button type="control" onClick={() => { stepMoveCheck(1) }} className={classnames(styles['btn'], styles['btn-control'])}>{t('RESOURCES_NEXT')}</Button>
          </>
        }
        {regStep == 2 &&
          <>
            <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button>
            <Button onClick={() => { setRegStep(1) }} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_PREVIOUS')}</Button>
            {submitButtonFlag ?
              <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} disabled loading={true}>{t('RESOURCES_CREATE')}</Button>
              :
              <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])}>{t('RESOURCES_CREATE')}</Button>
            }
          </>
        }
      </>

    return elements;
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
            {/* styles.view_screen  : 이전 링크 관련 class*/}
            <div className={classnames(styles.process_item, `${regStep == 1 ? styles.current : ''}`)}>
              <div className={styles.status}>
                <div className={`${regStep == 1 ? styles.current : regStep > 1 ? styles.done : styles.todo}`}></div>
              </div>
              <span className={styles.basic}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>{t('RESOURCES_DEFAULT_SETTINGS')}</div>
                <div className={styles.situation}>{regStep == 1 ? t('RESOURCES_CURRENT') : regStep > 1 ? t('RESOURCES_COMPLETED_SETTINGS') : t('RESOURCES_NOT_SET')}</div>
              </div>
            </div>
            <div className={classnames(styles.process_item, `${regStep == 2 ? styles.current : ''}`)}>
              <div className={styles.status}>
                <div className={`${regStep == 2 ? styles.current : regStep > 2 ? styles.done : styles.todo}`}></div>
              </div>
              <span className={styles.detail}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>{t('RESOURCES_DETAIL_SETTINGS')}</div>
                <div className={styles.situation}>{regStep == 2 ? t('RESOURCES_CURRENT') : t('RESOURCES_NOT_SET')}</div>
              </div>
            </div>
          </div>

          <div className={styles.cont_boxwrap}>
            <div className={`${regStep == 1 ? "" : "hide"}`}>
              <Form.Item
                label={t('RESOURCES_NAME')}
                rules={[
                  { required: true, message: t('NAME_EMPTY_DESC') },
                  {
                    pattern: PATTERN_NAME,
                    message: t('INVALID_NAME_DESC'),
                  },
                ]}
                desc={t('NAME_DESC')}
              >
                <Input name="name" maxLength={253}
                  style={{ maxWidth: 'none' }} />
              </Form.Item>

              <Form.Item>

                <Columns>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_IMAGE')}
                      rules={[{ required: true, }]}
                    >
                      <CardSelect
                        className={styles.customUl}
                        onChange={(e) => handleOsType(e)}
                        name="os_type"
                        options={osTypeOptions}
                        defaultValue={osType}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item label={t('RESOURCES_DISTRIBUTION')}>
                      <TypeSelect
                        // name="distro_type"
                        onChange={(e) => setDistroType(e)}
                        defaultValue={distroType}
                        options={distroTypeOptions()}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Input
                        defaultValue={osType[0].toUpperCase() + osType.slice(1, osType.length) + ' > ' + distroType}
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
                        options={archTypeOptions} />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('RESOURCES_BOOT_TYPE')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}>
                      <Select
                        name="boot_type"
                        defaultValue="legacy"
                        options={bootTypeOptions}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
              </Form.Item>

              <Form.Item
                label={t('RESOURCES_KUBERNETES_VERSION')}
                rules={[{ required: true, validator: versionValidator }]}
              >
                <Input name="kube_version" maxLength={253}
                  style={{ maxWidth: 'none' }} placeholder="v1.1.1" />
              </Form.Item>

              <Form.Item
                label={t('RESOURCES_SIZE')}
                rules={[{
                  required: true,
                }]}>

                <div className={styles.content_box_wrap}>
                  <div className={styles.content_box}>
                    <div className={`${styles.cont_box_wrap} ${sizeEmpty ? styles.formErrorStyle : ''}`}>
                      <div className={styles.cont_box_section}>
                        <div className={styles.cont_box_wrap}>
                          <h6 className={styles.label}>
                            <div className={styles.form_check}>
                              <input type="checkbox" name="chk-0" id="chk-0" />
                              <label htmlFor="chk-0" onClick={() => handleImageSizeActive()}></label>
                            </div>
                            <div className={styles.title}>
                              <p>{t('RESOURCES_SPECIFY_IMAGE_SIZE')}</p>
                              <span>{t('RESOURCES_IMAGE_SIZE_TIP')}</span>
                            </div>
                          </h6>
                          {imageSizeActive &&
                            <div className={`${styles.select_inner_content}`} >
                              <UnitSlider
                                name="size"
                                max={40}
                                min={0}
                                marks={getMarks()}
                                defaultValue={imageSize}
                                unit={'GB'}
                                withInput
                                onChange={(e) => setImageSize(e)}
                                style={{ padding: '5px' }}
                              />
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Form.Item>
              {sizeEmpty &&
                <div className="form-item-error">{t('RESOURCES_CANNOT_IMAGE_SIZE_SET_ZERO')}</div>
              }
            </div>

            <Step2
              regStep={regStep}
              setPropsImageName={setPropsImageName}
              setPropsImageTag={setPropsImageTag}
              setProjectName={setProjectName}
              setDockerUrl={setDockerUrl}
              sourceEmpty={sourceEmpty}
              setSourceEmpty={setSourceEmpty}
              setPropsUserName={setPropsUserName}
              setPropsUserPassword={setPropsUserPassword}
            />
          </div>


          {/* Footer */}
          <div className={styles['modal-footer']}>
            {fnGetModalFooter()}
          </div>
        </Form>

      </Modal >
    </>
  )
}

/**
 * 이미지 세부설정
 * 소스(도커 이미지) 및 설명 부분
 * @returns 
 */
const Step2 = (
  {
    regStep,
    setPropsImageName,
    setPropsImageTag,
    setProjectName,
    setDockerUrl,
    sourceEmpty,
    setSourceEmpty,
    setPropsUserName,
    setPropsUserPassword
  }
) => {

  const [loading, setLoading] = useState(false);
  const [publicType, setPublicType] = useState('public')

  const [registryUrl, setRegistryUrl] = useState(publicType == 'private' ? '' : defaultRegistryUrl)
  const [registryUrlActive, setRegistryUrlActive] = useState(false)
  const [popActive, setPopActive] = useState(false)

  const [imageName, setImageName] = useState('')
  const [imageListData, setImageListData] = useState([])
  const [imageList, setImageList] = useState([])
  const [tagList, setTagList] = useState([])
  const [tag, setTag] = useState('')

  const [userName, setUserName] = useState('')
  const [userPassword, setUserPassword] = useState('')

  const [harborValid, setHarborValid] = useState(false)
  const [userValidError, setUserValidError] = useState(false)
  const [harborValidError, setHarborValidError] = useState(false)
  const [harborUrl, setHarborUrl] = useState('')
  const [harborAuth, setHarborAuth] = useState('')

  const [imageText, setImageText] = useState(defaultImageText)

  useEffect(() => {
    document.querySelector('#chk-1').checked = false;
    resetAll()
    if (publicType == 'public') {
      setRegistryUrl(defaultRegistryUrl)
    } else {
      setRegistryUrl('')
    }
  }, [publicType])

  useEffect(() => {
    setPropsImageName(imageName)
  }, [imageName])

  useEffect(() => {
    setPropsImageTag(tag)
    if (registryUrl) {
      const [, path] = registryUrl.split(/https?:\/\//)
      const [url] = path.split('/')
      setDockerUrl(url)
    }
  }, [tag])

  // public type 바뀔때마다 설정 초기화
  const resetAll = () => {
    setRegistryUrlActive(false) // registry url 비활성
    setTagList([])
    setImageName('')
    setTag('')

    // error 초기화
    setHarborValidError(false)
    setUserValidError(false)
    setHarborValid(false)
  }

  // registry url 활성/비활성
  const handleRegistryUrl = () => {
    if (registryUrlActive) {
      resetAll()
    } else {
      setRegistryUrlActive(true)
    }
    // error 초기화
    setHarborValidError(false)
    setUserValidError(false)
    setHarborValid(false)
  }

  // image list
  const handleImagePop = async () => {

    if (publicType == 'public') {
      // const response = await axios.get(`https://quay.io/api/v1/repository?public=true&namespace=edgestack&last_modified=true&popularity=true&repo_kind=image`, {
      try {
        let originUrl = new URL(registryUrl);
        const urlParams = originUrl.searchParams;
        const namespace = urlParams.get('namespace')

        const response = await axios.get(`${originUrl.origin}/api/v1/repository?public=true&namespace=${namespace}&last_modified=true&popularity=true&repo_kind=image`, {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          }
        });
        setImageListData(response.data.repositories)
        setImageList(response.data.repositories)
        setPopActive(true)
        setImageText(defaultImageText)
      } catch {
        setImageList([])
        setTagList([])
        setPopActive(false)
        setImageText(emptyImageText)
        setTag('')
      }
    } else if (publicType == 'private') {
      getHarborImages()
    }
  }

  const getHarborImages = () => {
    if (registryUrlActive) {
      if (!harborValid) {
        setHarborValidError(true)
      } else {
        setHarborValidError(false)
        getPriavteHarborRepositories();
      }
    } else {
      setHarborValidError(false)
      getPublicHarborRepositories();
    }
  }

  // harbor list
  const getPriavteHarborRepositories = async () => {
    try {
      let originUrl = new URL(registryUrl);
      const urlParams = originUrl.searchParams;
      const projectName = urlParams.get('projects')

      const response = await request.post(`customharbor/private`, {
        auth: harborAuth,
        projectName,
        originUrl: originUrl.origin
      })
      const list = response.map(obj => {
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
      let originUrl = registryUrl ? new URL(registryUrl) : ''
      const response = await request.post(`customharbor/public`, {
        originUrl,
      })
      const list = response.map(obj => {
        const [projectName, ...name] = obj.name.split("/")
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

  // image tag list
  const handleImageTag = (imageName, projectName) => {
    setPopActive(false)
    setLoading(true)
    setImageName(imageName)
    imageName = encodeURIComponent(imageName)
    if (publicType == 'public') {
      getPulicImageTag(imageName)
    } else {
      getPrivateImageTag(imageName, projectName)
    }
  }

  // public image tag
  const getPulicImageTag = async (imageName) => {
    let originUrl = new URL(registryUrl);
    const urlParams = originUrl.searchParams;
    const namespace = urlParams.get('namespace')
    const response = await axios.get(`${originUrl.origin}/api/v1/repository/${namespace}/${imageName}`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      }
    });
    setLoading(false)

    const tagList = Object.values(response.data.tags).filter((obj) => (
      obj.size != null && obj.size != 0
    ));
    setTagList(tagList)
    setTag(tagList?.[0]?.name)
    setSourceEmpty(false)
  }

  // private image tag
  const getPrivateImageTag = async (imageName, projectName) => {
    let originUrl = registryUrl ? new URL(registryUrl) : ''
    const response = await request.post(`customharbor/tags`, {
      auth: harborAuth,
      repositoryName: imageName,
      projectName,
      originUrl: originUrl.origin
    })
    setLoading(false)

    let tagList = []
    tagList = response?.[0]?.tags

    setProjectName(projectName)
    setTagList(tagList)
    setTag(tagList?.[0]?.name)
    setSourceEmpty(false)
  }

  const searchImageList = (e) => {
    if (e.key === 'Enter') {
      const name = e.target.value
      const list = imageListData.filter(item => (
        item.name.includes(name)
      ))
      setImageList(list)
    }
  }

  const checkUserValid = async () => {
    let userAuth = Base64.encode(`${userName}:${userPassword}`)

    let originUrl = new URL(registryUrl);
    await request.post(`customharbor/users`, {
      auth: userAuth,
      originUrl: originUrl.origin
    })
      .then(res => {
        Notify.success({ content: t('RESOURCES_SUCCESS_VALID_DESC') })
        setHarborValid(true)
        setHarborValidError(false)
        setUserValidError(false)

        setHarborAuth(userAuth)
        setHarborUrl(registryUrl)
        setPropsUserName(userName)
        setPropsUserPassword(userPassword)
      })
      .catch(err => {
        setHarborValid(false)
        setUserValidError(true)
        setTagList([])
        setImageName('')
        setTag('')
      })

  }

  const handleClickOutside = (e) => {
    if (!e.target.closest('.select_inner_content')) {
      setPopActive(false);
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className={`${regStep == 2 ? "" : "hide"}`}>
      <Form.Item
        label={t('RESOURCES_SOURCE')}
        rules={[{
          required: true,
        }]}>
        <RadioGroup
          name="is_public"
          wrapClassName="radio"
          defaultValue={publicType}
          onChange={value => setPublicType(value)}
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
            {/* <label>소스</label> */}
            <div className={`${styles.cont_box_wrap} ${sourceEmpty || harborValidError || userValidError ? styles.formErrorStyle : ''}`}>
              <div className={styles.cont_box_section}>
                <div className={styles.cont_box_wrap}>
                  <h6 className={styles.label}>
                    <div className={styles.form_check}>
                      <input type="checkbox" name="chk-1" id="chk-1" />
                      <label htmlFor="chk-1" onClick={() => handleRegistryUrl()}></label>
                    </div>
                    <div className={styles.title}>
                      <p>Registry URL</p>
                      <span>{t('RESOURCES_IMAGE_REGIST_URL_SETTINGS')}</span>
                    </div>
                  </h6>
                  {registryUrlActive &&
                    <>
                      <div className={styles.regi_group_area}>
                        <div className={styles.formarea}>
                          <div className={classnames(styles.custom_input, styles.w_1)}>
                            <label>Registry URL</label>
                            <input type="text" placeholder={publicType == 'private' ? 'https://{url}?projects=${project_name}' : ''} defaultValue={registryUrl} onChange={(e) => setRegistryUrl(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      {publicType == 'private' &&
                        <div className={styles.regi_group_area}>
                          <div className={styles.formarea}>
                            <div className={styles.custom_input}>
                              <label>{t('RESOURCES_USER_NAME')}</label>
                              <input type="text" name="username" defaultValue={userName} onChange={(e) => setUserName(e.target.value)} />
                            </div>
                            <div className={styles.custom_input}>
                              <label>{t('RESOURCES_PASSWORD')}</label>
                              <input type="password" name="password" defaultValue={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                            </div>
                            <button type="button" className={classnames(styles.btn, styles.btn_control)} onClick={() => checkUserValid()}>{t('RESOURCES_VALID')}</button>
                          </div>
                        </div>
                      }
                      {userValidError &&
                        <div className="form-item-error" style={{ color: '#ca2621' }}>{t('RESOURCES_FAIL_VALID_TIP')}</div>
                      }
                    </>
                  }
                </div>
                <div className={`${styles.select_inner_content} select_inner_content`} >
                  <div className={classnames(styles.select_list_box, styles.inner_image)}>
                    <div className={classnames(styles.selected_item, styles.image)} onClick={() => handleImagePop()}>
                      <p className={styles.inner_image}>
                        <span>Docker</span>
                      </p>
                      <div className={styles.placeholder}>{imageName}</div>
                    </div>
                    {popActive &&
                      <div className={styles.select_list_image} style={{ display: 'block' }}>
                        <div className={styles.sel_search}>
                          <i className={styles.ico_search_small}></i>
                          <div className={styles.input_search_pop}>
                            <input type="text" placeholder={t('RESOURCES_SEARCH')} onKeyDown={searchImageList}
                              style={{ border: 0 }} />
                          </div>
                        </div>
                        <ul className={styles.sel_img}>
                          {imageList.length > 0 &&
                            imageList.map((obj, idx) => (
                              <li onClick={() => handleImageTag(obj.name, obj.project_name)} key={idx}>
                                {/* <img src={`/assets/resources/images/icons/ico-os-${obj.name.split('-')[0]}.svg`} /> */}
                                <i style={{ background: `url('/assets/resources/images/icons/ico-os-${obj.name.split('-')[0]}.svg') center no-repeat`, width: '30px', height: '30px', marginRight: '5px' }}></i>
                                <p className={styles.name}>
                                  <strong>{obj.name}</strong>
                                  <span>{obj.description}</span>
                                </p>
                                <div className={styles.rank}>
                                  <i className={styles.ico_type_star}></i>
                                  <span>{obj.popularity}</span>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    }
                  </div>
                </div>

                <div className={styles.section_box}>
                  <Loading spinning={loading}>
                    {tagList.length > 0 ?
                      <div className={styles.radio_list}>
                        {tagList.map((obj, idx) => (
                          <div className={styles.form_radio} key={idx} onClick={() => setTag(obj.name)}>
                            <input type="radio" name="rdo-tag" value="Y" id={`rdo-tag-n${idx}`} defaultChecked={idx == 0} />
                            <label htmlFor={`rdo-tag-n${idx}`}><i className={styles.ico_etc_tag}></i><span>{obj.name}</span></label>
                          </div>
                        ))}
                      </div>
                      :
                      <div className={styles.empty}>
                        <i className={styles.ico_type_container2}></i>
                        <span>{imageText}</span>
                      </div>
                    }
                  </Loading>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form.Item>

      {sourceEmpty &&
        <div className="form-item-error">{t('RESOURCES_SETTING_IMAGE_TIP')}</div>
      }
      {harborValidError &&
        <div className="form-item-error">{t('RESOURCES_VALID_TIP')}</div>
      }

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
  )
}
