import React, { useEffect, useReducer, useRef, useState } from 'react'
import { Modal, List } from 'components/Base'
import { UnitSlider, NumberInput } from 'components/Inputs'
import { get, omit, range } from 'lodash'
import { Form, Input, Select, Button, Tooltip, TextArea, Dropdown } from '@kube-design/components'
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
import { async } from 'q'

const defaultImageSize = '12GB'
const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;

const defaultImageText = '컨테이너에 대한 이미지를 설정합니다.'
const emptyImageText = '이미지를 찾을 수 없습니다.'
const defaultRegistryUrl = 'https://quay.io/api/v1/repository?public=true&namespace=edgestack&last_modified=true&popularity=true&repo_kind=image'

const realTimeOptions = [
  { label: '미사용', value: false, },
  { label: '사용', value: true, }
]
const publicTypeOptions = [
  { label: '퍼블릭', value: 'public', },
  { label: '프라이빗', value: 'private', }
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
  { label: 'etc', value: '', icon: 'ico-plus', }
]

export default function ResourceImageModal({ title, store, onOk }) {

  const form = useRef();
  const [formData, setFormData] = useState({});
  const distroTypeStore = new DistroTypeStore();

  const [modelView, setModalView] = useState(true);

  const [realTime, setRealTime] = useState(false)
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
      data.distro_type = distroType;
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
    } else if (value == 'linux') {
      setDistroType('ubuntu')
      setDistroTypeList(distroTypeData.filter(obj => obj.name != 'windows'))
    } else {
      setDistroType('')
      setDistroTypeList([])
    }
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
      if (data.name == undefined || !regexName.test(data.name) || sizeEmpty) {
        handleOk();
      } else {
        setRegStep(2);
        setSubmitButtonFlag(false);
      }
    }
  }

  const nameValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('이름을 입력해 주세요.') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('이름을 확인해 주세요.') })
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
            <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>취소</Button>
            <Button type="control" onClick={() => { stepMoveCheck(1) }} className={classnames(styles['btn'], styles['btn-control'])}>다음</Button>
          </>
        }
        {regStep == 2 &&
          <>
            <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>취소</Button>
            <Button onClick={() => { setRegStep(1) }} className={classnames(styles['btn'], styles['btn-default'])}>이전</Button>
            {submitButtonFlag ?
              <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} disabled loading={true}>생성</Button>
              :
              <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])}>생성</Button>
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
        okText={'생성'}
        onCancel={closeModal}
        cancelText={'취소'}
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
                <div className={styles.step_name}>기본 설정</div>
                <div className={styles.situation}>{regStep == 1 ? "현재" : regStep > 1 ? "설정완료" : "미설정"}</div>
              </div>
            </div>
            <div className={classnames(styles.process_item, `${regStep == 2 ? styles.current : ''}`)}>
              <div className={styles.status}>
                <div className={`${regStep == 2 ? styles.current : regStep > 2 ? styles.done : styles.todo}`}></div>
              </div>
              <span className={styles.detail}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>세부 설정</div>
                <div className={styles.situation}>{regStep == 2 ? "현재" : "미설정"}</div>
              </div>
            </div>
          </div>

          <div className={styles.cont_boxwrap}>
            <div className={`${regStep == 1 ? "" : "hide"}`}>
              <Form.Item
                label={t('이름')}
                rules={[
                  // { required: true, message: t('NAME_EMPTY_DESC') },
                  { required: true, validator: nameValidator },
                  // {
                  //   pattern: PATTERN_NAME,
                  //   message: t('INVALID_NAME_DESC', {
                  //     message: t('LONG_NAME_DESC'),
                  //   }),
                  // },

                ]}
                desc={t('NAME_DESC')}
              >
                <Input name="name" maxLength={63}
                  style={{ maxWidth: 'none' }} />
              </Form.Item>

              <Form.Item>

                <Columns>
                  <Column>
                    <Form.Item
                      label={t('이미지')}
                      rules={[{ required: true, message: t('이미지를 선택해주세요.') }]}
                    >
                      <CardSelect
                        className={`${styles.customUl} customCard`}
                        onChange={(e) => handleOsType(e)}
                        name="os_type"
                        options={osTypeOptions}
                        defaultValue={osType}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item label={t('배포판')}>
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
                      label={t('CPU 타입')}
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
                      label={t('부트 타입')}
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

              <Form.Item>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('리얼 타임')}
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
                          <RadioButton key={option.value} value={option.value}>
                            {option.label}
                          </RadioButton>
                        ))}
                      </RadioGroup>
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item label={t('버전')}>
                      <Input name="version" maxLength={253}
                        style={{ maxWidth: 'none' }} />
                    </Form.Item>
                  </Column>
                </Columns>
              </Form.Item>

              <Form.Item
                label={t('사이즈')}
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
                              <p>이미지 사이즈 지정</p>
                              <span>이미지 사이즈를 설정합니다.</span>
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
                <div className="form-item-error">이미지 사이즈를 0 으로 설정할 수 없습니다.</div>
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

        </Form >

      </Modal >
    </>
  )
}

const Step1 = () => {

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
        const response = await axios.get(registryUrl, {
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
      const [, url] = harborUrl.split('api/v2.0/projects/')
      const [projectName] = url.split("/")
      const response = await request.post(`customharbor/private`, {
        auth: harborAuth,
        projectName
      })
      const list = response.map(obj => {
        const [projectName, name] = obj.name.split("/")
        obj.name = name
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
      const response = await request.post(`customharbor/public`)
      const list = response.map(obj => {
        const [projectName, name] = obj.name.split("/")
        obj.name = name
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
    if (publicType == 'public') {
      getPulicImageTag(imageName)
    } else {
      getPrivateImageTag(imageName, projectName)
    }
  }

  // public image tag
  const getPulicImageTag = async (imageName) => {
    //todo registry url > namespcae 로 edgestack 가져와야함.
    const response = await axios.get(`https://quay.io/api/v1/repository/edgestack/${imageName}`, {
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
    const response = await request.post(`customharbor/tags`, {
      auth: harborAuth,
      repositoryName: imageName,
      projectName
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
    // let index = registryUrl.lastIndexOf('api/v2.0/') + 9
    // let url = registryUrl.substring(0, index) + 'users'
    let userAuth = Base64.encode(`${userName}:${userPassword}`)

    await request.post(`customharbor/users`, {
      auth: userAuth
    })
      .then(res => {
        Notify.success({ content: t('유효성 체크가 완료되었습니다.') })
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
        label={t('소스')}
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
                      <span>이미지 레지스트리 URL을 설정합니다.</span>
                    </div>
                  </h6>
                  {registryUrlActive &&
                    <>
                      <div className={styles.regi_group_area}>
                        <div className={styles.formarea}>
                          <div className={classnames(styles.custom_input, styles.w_1)}>
                            <label>Registry URL</label>
                            <input type="text" placeholder={publicType == 'private' ? 'http://{url}/api/v2.0/projects/{project_name}/repositories' : ''} defaultValue={registryUrl} onChange={(e) => setRegistryUrl(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      {publicType == 'private' &&
                        <div className={styles.regi_group_area}>
                          <div className={styles.formarea}>
                            <div className={styles.custom_input}>
                              <label>사용자 이름</label>
                              <input type="text" name="username" defaultValue={userName} onChange={(e) => setUserName(e.target.value)} />
                            </div>
                            <div className={styles.custom_input}>
                              <label>패스워드</label>
                              <input type="password" name="password" defaultValue={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                            </div>
                            <button type="button" className={classnames(styles.btn, styles.btn_control)} onClick={() => checkUserValid()}>유효성 체크</button>
                          </div>
                        </div>
                      }
                      {userValidError &&
                        <div className="form-item-error" style={{ color: '#ca2621' }}>유효하지 않은 사용자입니다</div>
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
                            <input type="text" placeholder="검색" onKeyDown={searchImageList}
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
        <div className="form-item-error">이미지를 설정해주세요</div>
      }
      {harborValidError &&
        <div className="form-item-error">유효성을 체크해주세요</div>
      }

      <Form.Item
        label={t('설명')}
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
