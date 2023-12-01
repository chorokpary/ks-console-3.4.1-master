import React, { useEffect, useRef, useState } from 'react'
import { Modal, List } from 'components/Base'
import { UnitSlider, NumberInput } from 'components/Inputs'
import { get, omit, range } from 'lodash'
import { Form, Input, Select, Icon, Tooltip, TextArea, Dropdown } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import DistroTypeStore from 'stores/resources/distrotype'
import styles from './index.scss'
import ContainerForm from 'components/Forms/Workload/ContainerSettings/ContainerForm'
import TypeSelect from '../../../TypeSelect'
import CardSelect from '../../../CardSelect'
import classnames from 'classnames'
import axios from 'axios'

const defaultDockerText = '컨테이너에 대한 이미지를 설정합니다.'
const emptyDockerText = '이미지를 찾을 수 없습니다.'
const defaultRegistryUrl = 'https://quay.io/api/v1/repository?public=true&namespace=edgestack&last_modified=true&popularity=true&repo_kind=image'
const defaultImageSize = '12GB'

export default function ResourceImageModal({ title, store, onOk }) {

  const form = useRef();
  const [formData, setFormData] = useState({});
  const distroTypeStore = new DistroTypeStore();

  const [modelView, setModalView] = useState(true);

  const [publicType, setPublicType] = useState('public')
  const [osType, setOsType] = useState('linux')
  const [distroTypeData, setDistroTypeData] = useState([])
  const [distroTypeList, setDistroTypeList] = useState([])
  const [distroType, setDistroType] = useState('ubuntu')

  const [registryUrl, setRegistryUrl] = useState(defaultRegistryUrl)
  const [registryUrlActive, setRegistryUrlActive] = useState(false)
  const [dockerPopActive, setDockerPopActive] = useState(false)
  const [imageSize, setImageSize] = useState(defaultImageSize)
  const [imageSizeActive, setImageSizeActive] = useState(false)
  const [sizeEmpty, setSizeEmpty] = useState(false)

  const [dockerName, setDockerName] = useState('')
  const [dockerListData, setDockerListData] = useState([])
  const [dockerList, setDockerList] = useState([])
  const [dockerTagList, setDockerTagList] = useState([])
  const [dockerTag, setDockerTag] = useState('')
  const [sourceEmpty, setSourceEmpty] = useState(false)

  const [docekerText, setDockerText] = useState(defaultDockerText)

  useEffect(() => {
    const getDistroTypeList = async () => {
      const dist = await distroTypeStore.fetchList();
      setDistroTypeData(dist)
      setDistroTypeList(dist.filter(obj => obj.name != 'windows'))
    };
    getDistroTypeList();
  }, [])

  const handleClickOutside = (e) => {
    if (!e.target.closest('.select_inner_content')) {
      setDockerPopActive(false);
    }
  };
  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleRegistryUrl = () => {
    if (registryUrlActive) {
      setRegistryUrl(defaultRegistryUrl)
      setRegistryUrlActive(false)
    } else {
      setRegistryUrlActive(true)
    }
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

  // docker list
  const handleDockerPop = async () => {

    // const response = await axios.get(`https://quay.io/api/v1/repository?public=true&namespace=edgestack&last_modified=true&popularity=true&repo_kind=image`, {
    try {
      const response = await axios.get(registryUrl, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        }
      });
      setDockerListData(response.data.repositories)
      setDockerList(response.data.repositories)
      setDockerPopActive(true)
      setDockerText(defaultDockerText)
    } catch {
      setDockerList([])
      setDockerTagList([])
      setDockerPopActive(false)
      setDockerText(emptyDockerText)
      setDockerTag('')
    }
  }

  // docker tag list
  const handleDockerTag = async (imageName) => {
    setDockerName(imageName)
    const response = await axios.get(`https://quay.io/api/v1/repository/edgestack/${imageName}`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      }
    });

    const tagList = Object.values(response.data.tags).filter((obj) => (
      obj.size != null && obj.size != 0
    ));
    setDockerTagList(tagList)
    setDockerTag(tagList?.[0]?.name)
    setDockerPopActive(false)
    setSourceEmpty(false)
  }

  const searchDockerList = (e) => {
    if (e.key === 'Enter') {
      const name = e.target.value
      const list = dockerListData.filter(item => (
        item.name.includes(name)
      ))
      setDockerList(list)
    }
  }

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
    // { label: 'etc', value: '', icon: 'ico-plus', }
  ]

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

      if (imageSize == '0GB') {
        setSizeEmpty(true)
        return
      } else {
        setSizeEmpty(false)
        data.size = Number(imageSize.slice(0, imageSize.length - 2))
      }
      if (dockerTag == '') {
        setSourceEmpty(true)
        return
      } else {
        setSourceEmpty(false)
      }

      data.os_distro = distroType;
      data.source = 'docker://quay.io/edgestack/' + dockerName + ':' + dockerTag;
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
      return callback({ message: t('버전을 입력해 주세요.') })
    }
    callback()
  }

  const handlePublicType = (value) => {
    setPublicType(value)
    // setRegistryUrlActive(false)
    // if (value == 'public') {
    //   setRegistryUrl(defaultRegistryUrl)
    // }
  }

  useEffect(() => {
    if (imageSize == '0GB') {
      setSizeEmpty(true)
    } else {
      setSizeEmpty(false)
    }
  }, [imageSize])

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
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('이름')}
            rules={[
              { required: true, message: t('이름을 입력해주세요') },
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
                  label={t('이미지')}
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

          <Form.Item
            label={t('쿠버네티스 버전')}
            rules={[{ required: true, validator: versionValidator }]}
          >
            <Input name="kube_version" maxLength={253}
              style={{ maxWidth: 'none' }} placeholder="v1.1.1" />
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

          <Form.Item
            label={t('소스')}
            rules={[{
              required: true,
            }]}>
            <RadioGroup
              name="is_public"
              wrapClassName="radio"
              defaultValue={publicType}
              onChange={value => handlePublicType(value)}
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
                <div className={`${styles.cont_box_wrap} ${sourceEmpty ? styles.formErrorStyle : ''}`}>
                  {/* <div className={styles.regi_group_area}>
                    <div className={styles.formarea}>
                      <div className={styles.custom_input}>
                        <label>사용자 이름</label>
                        <input type="text" />
                      </div>
                      <div className={styles.custom_input}>
                        <label>패스워드</label>
                        <input type="password" />
                      </div>
                      <button type="button" className={classnames(styles.btn, styles.btn_control)}>유효성 체크</button>
                    </div>
                  </div> */}
                  <div className={styles.cont_box_section}>
                    <div className={styles.cont_box_wrap}>
                      <h6 className={styles.label}>
                        {/* {publicType == 'private' && */}
                        <div className={styles.form_check}>
                          <input type="checkbox" name="chk-1" id="chk-1" />
                          <label htmlFor="chk-1" onClick={() => handleRegistryUrl()}></label>
                        </div>
                        {/* } */}
                        <div className={styles.title}>
                          <p>Registry URL</p>
                          <span>이미지 레지스트리 URL을 설정합니다.</span>
                        </div>
                      </h6>
                      {registryUrlActive &&
                        <div className={styles.regi_group_area}>
                          <div className={styles.formarea}>
                            <div className={classnames(styles.custom_input, styles.w_1)}>
                              <label>Registry URL</label>
                              <input type="text" defaultValue={registryUrl} onChange={(e) => setRegistryUrl(e.target.value)} />
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                    <div className={`${styles.select_inner_content} select_inner_content`} >
                      <div className={classnames(styles.select_list_box, styles.inner_image)}>
                        <div className={classnames(styles.selected_item, styles.image)} onClick={() => handleDockerPop()}>
                          <p className={styles.inner_image}>
                            <span>Docker</span>
                          </p>
                          <div className={styles.placeholder}>{dockerName}</div>
                        </div>
                        {dockerPopActive &&
                          <div className={styles.select_list_image} style={{ display: 'block' }}>
                            <div className={styles.sel_search}>
                              <i className={styles.ico_search_small}></i>
                              <div className={styles.input_search_pop}>
                                <input type="text" placeholder="검색" onKeyDown={searchDockerList}
                                  style={{ border: 0 }} />
                              </div>
                            </div>
                            <ul className={styles.sel_img}>
                              {dockerList.length > 0 &&
                                dockerList.map((obj, idx) => (
                                  <li onClick={() => handleDockerTag(obj.name)} key={idx}>
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
                      {dockerTagList.length > 0 ?
                        <div className={styles.radio_list}>
                          {dockerTagList.map((obj, idx) => (
                            <div className={styles.form_radio} key={idx} onClick={() => setDockerTag(obj.name)}>
                              <input type="radio" name="rdo-tag" value="Y" id={`rdo-tag-n${idx}`} defaultChecked={idx == 0} />
                              <label htmlFor={`rdo-tag-n${idx}`}><i className={styles.ico_etc_tag}></i><span>{obj.name}</span></label>
                            </div>
                          ))}
                        </div>
                        :
                        <div className={styles.empty}>
                          <i className={styles.ico_type_container2}></i>
                          <span>{docekerText}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form.Item>
          {sourceEmpty &&
            <div className="form-item-error">이미지를 설정해주세요</div>
          }

          {/* <Form.Item>
            <Input name="source_url"
              defaultValue={'https://quay.io/api/v1/repository?public=true&namespace=edgestack&last_modified=true&popularity=true&repo_kind=image'}
              readOnly
              style={{ maxWidth: 'none' }}
            />
          </Form.Item> */}
          {/* <Form.Item>
            <ContainerForm
              type={'Add'}
              // namespace={get({ metadata: { namespace: 'kdh-project01' } }, 'metadata.namespace')}
              namespace={'kdh-project01'}
            />
          </Form.Item> */}
          {/* <Form.Item>
            <Input name="source"
              defaultValue={'docker://quay.io/edgestack/ubuntu-2004-kube:x86_64'}
              readOnly
              style={{ maxWidth: 'none' }}
            />
          </Form.Item> */}

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
        </Form>

      </Modal >
    </>

  )

}
