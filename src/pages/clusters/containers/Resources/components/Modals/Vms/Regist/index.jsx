import { get, omit } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Modal, } from 'components/Base'
import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox, InputPassword, Notify, Tabs, Icon } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import * as common from "utils/resources"
import TypeSelect from '../../../TypeSelect'
import CardSelect from '../../../CardSelect'

import classnames from 'classnames'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'

const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;
const RegistModal = (props) => {

  const form = useRef();
  const [formData, setFormData] = useState({});

  const vmStore = new VmStore();

  const [modelView, setModalView] = useState(true);
  const [regStep, setRegStep] = useState(1);

  const [flavorDataList, setFlavorDataList] = useState([]);
  const [imageDataList, setImageDataList] = useState([]);
  const [bootVolumeDataList, setBootVolumeDataList] = useState([]);
  const [nodeDataList, setNodeDataList] = useState([]);
  const [keypairDataList, setKeypairDataList] = useState([]);
  const [networkDataList, setNetworkDataList] = useState([]);
  const [sriovNetworkDataList, setSriovNetworkDataList] = useState([]);
  const [securityGroupDataList, setSecurityGroupDataList] = useState([]);

  const [selectImageName, setSelectImageName] = useState();
  const [selectFlavorName, setSelectFlavorName] = useState();
  const [selectImageDistroType, setSelectImageDistroType] = useState();
  
  const [imageOptionList, setImageOptionList] = useState([]);  

  const [vmName, setVmName] = useState('');
  const [imageName, setImageName] = useState('');
  const [bootVolumeName, setBootVolumeName] = useState('');
  const [flavorName, setFlavorName] = useState('');
  const [flavorCpu, setFlavorCpu] = useState('');
  const [flavorMemory, setFlavorMemory] = useState('');
  const [flavorDisk, setFlavorDisk] = useState('');
  const [description, setDescription] = useState('');
  const [keypairName, setKeypairName] = useState('');
  const [nodeName, setNodeName] = useState('');
  const [storageClass, setStorageClass] = useState('선택');

  const [imageType, setImageType] = useState('I')
  const [osType, setOsType] = useState('linux')

  const [submitButtonFlag, setSubmitButtonFlag] = useState(false);

  const [isScript, setIsScript] = useState(false);
  const [isPassword, setIsPassword] = useState(false);
  const [isPackage, setIsPackage] = useState(false);
  const [isFileWrite, setIsFileWrite] = useState(false);
  const [isUserScript, setIsUserScript] = useState(false);

  const [flavorSizeCheck, setFlavorSizeCheck] = useState(true);
  

  useEffect(() => {

    const getVmCreateData = async () => {
      const listFlavor = await vmStore.fetchVmListFlavor({ sortBy: 'root_disk' });
      const listImage = await vmStore.fetchVmListImage();
      const listBootVolume = await vmStore.fetchVmListBootVolume();
      const listNetwork = await vmStore.fetchVmListNetwork();
      const listSriovNetwork = await vmStore.fetchVmListSriovNetwork();
      const listKeypair = await vmStore.fetchVmListKeypair();
      const listNode = await vmStore.fetchVmListNode();
      const listSecurityGroup = await vmStore.fetchVmListSecurityGroup();

      setFlavorDataList(listFlavor.flavors);
      setImageDataList(listImage.images);
      setImageOptionList(listImage.images);
      setBootVolumeDataList(listBootVolume.volumes);
      setNetworkDataList(listNetwork.networks);
      setSriovNetworkDataList(listSriovNetwork.networks);
      setKeypairDataList(listKeypair.keypairs);
      setNodeDataList(listNode.nodes);
      setSecurityGroupDataList(listSecurityGroup);
    };

    getVmCreateData();

  }, [])

  const imageTypeOptions = [
    { label: '이미지', value: 'I', },
    { label: '부트볼륨', value: 'B', }
  ]

  const osTypeOptions = [
    { label: 'Linux', value: 'linux', icon: 'ico-linux', },
    { label: 'Windows', value: 'windows', icon: 'ico-windows', },
    { label: 'etc', value: '', icon: 'ico-plus', }
  ]

  const storageClassOptions = [
    { label: 'longhorn', value: 'longhorn' },
    { label: 'openebs-hostpath', value: 'openebs-hostpath' },
    { label: 'hostpath-csi', value: 'hostpath-csi' }
  ]

  const imageOptions = () => {
    const opt = imageOptionList.map((obj) => {
      return {
        label: t(obj.name),
        icon: `ico-os-${obj.distro_type}`,
        description: t(obj.description),
        value: t(obj.name),
      }

    })
    return opt
  }

  const flavorOptions = () => {
    const opt = flavorDataList.map((obj) => ({
      label: t(obj.name),
      description: `CPU ${obj.vcpus} Cores / Memory ${common.fnSetBytes(obj.ram)} Gib / Disk ${obj.root_disk} Gib`,
      value: t(obj.name),
    }))
    return opt
  }

  const bootvolumeOptions = () => {
    const opt = bootVolumeDataList.map((obj) => ({
      label: t(obj.name),
      value: t(obj.name),
    }))
    return opt
  }

  const keypairOptions = () => {
    const opt = keypairDataList.map((obj) => ({
      label: t(obj.name),
      value: t(obj.name),
    }))
    return opt
  }

  const nodeOptions = () => {
    const opt = nodeDataList.map((obj) => ({
      label: t(obj.name),
      value: t(obj.name),
    }))
    return opt
  }


  const handleOk = () => {
    const onOk = props.onOk;
    form.current.validator(() => {

      setSubmitButtonFlag(true);

      const { data } = form.current.props;

      data.network = networkCheckItems;
      data.sriov = sriovCheckItems;
      data.securitygroup = securityGroupCheckItems;
      data.imageType = imageType;

      data.bootvolume = data?.bootvolume == "선택" ? "" : data?.bootvolume;
      data.keypair = data.keypair == "선택" ? "" : data.keypair;
      data.node = data.node == "선택" ? "" : data.node;
      data.storageClass = (imageType == "I" && storageClass != "선택") ?  storageClass : "";

      let makeScriptStep_1 = false;

      let userPasswordScript = "";

      if(listPasswordRoute.length == 1){
        listPasswordRoute.map((obj) => {
          if (!!data['scriptPassword_' + obj]) {
            userPasswordScript += `#cloud-config\nssh_pwauth: True\nusers:\n  - default\nchpasswd:\n  list: |\n    ${data['scriptId_' + obj]}:${data['scriptPassword_' + obj]}\n  expire: False`
            makeScriptStep_1 = true;
          }
        })
      }else{
        userPasswordScript = "#cloud-config\nssh_pwauth: True\nusers:\n  - default\n  - name: user\n    gecos: user\n    sudo: ALL=(ALL) NOPASSWD:ALL\nchpasswd:\n  list: |\n"
        listPasswordRoute.map((obj) => {
          if (!!data['scriptId_' + obj] && !!data['scriptPassword_' + obj]) {
            userPasswordScript += "    " + data['scriptId_' + obj] + ":" + data['scriptPassword_' + obj] + "\n"
            makeScriptStep_1 = true;
          }
        })
        userPasswordScript += "  expire: False"
      }
     

      if (!makeScriptStep_1) {
        userPasswordScript = "";
      }

      console.log(userPasswordScript)

      data.makeScript = userPasswordScript;

      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const stepMoveCheck = (step) => {
    const { data } = form.current.props;

    if (step == 1) {

      if (imageType == "I" && (data.name == undefined || !regexName.test(data.name)  || data.image == "선택" || data.flavor == "선택")) {
        handleOk();
      } else if (imageType == "B" && (data.name == undefined || !regexName.test(data.name) || data.bootvolume == "선택" || data.flavor == "선택")) {
        handleOk();
      } else {
        const imageSize = imageDataList.filter(item => item.name == selectImageName).map(item => item.size)[0].replace('Gi','');
        const flavorSize = flavorDataList.filter(item => item.name == selectFlavorName).map(item => item.root_disk);

        if(flavorSize > imageSize){
          setRegStep(2);
          setFlavorSizeCheck(true);
        }else{
          setFlavorSizeCheck(false);
        }        
      }
    }
    if (step == 3) {
      setVmName(data.name);
      setImageName(data.image);
      setBootVolumeName(data.bootvolume);
      setFlavorName(data.flavor);
      setDescription(data.description)
      setKeypairName(data.keypair == "선택" ? "" : data.keypair);
      setNodeName(data.node == "선택" ? "" : data.node);

      const flavorData = flavorDataList.filter(obj => obj.name == data.flavor)
      setFlavorCpu(flavorData[0].vcpus)
      setFlavorMemory(common.fnSetBytes(flavorData[0].ram))
      setFlavorDisk(flavorData[0].root_disk)

      setRegStep(4);
      setSubmitButtonFlag(false);
    }
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
        {(regStep == 2) &&
          <>
            <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>취소</Button>
            <Button onClick={() => { setRegStep(regStep - 1) }} className={classnames(styles['btn'], styles['btn-default'])}>이전</Button>
            <Button type="control" onClick={() => { setRegStep(regStep + 1) }} className={classnames(styles['btn'], styles['btn-control'])}>다음</Button>
          </>
        }
        {(regStep == 3) &&
          <>
            <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>취소</Button>
            <Button onClick={() => { setRegStep(regStep - 1) }} className={classnames(styles['btn'], styles['btn-default'])}>이전</Button>
            <Button type="control" onClick={() => { stepMoveCheck(3) }} className={classnames(styles['btn'], styles['btn-control'])}>다음</Button>
          </>
        }
        {regStep == 4 &&
          <>
            <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>취소</Button>
            <Button onClick={() => { setRegStep(3) }} className={classnames(styles['btn'], styles['btn-default'])}>이전</Button>
            {submitButtonFlag ?
              <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} disabled loading={true}>생성</Button>
              :
              <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} >생성</Button>
            }
          </>
        }
      </>

    return elements;
  }

  const handleOsType = (value) => {
    setOsType(value)
    setSelectImageName('')
    if (value == 'window') {
      setImageOptionList(imageDataList.filter(obj => obj.os_type == 'window'))
    } else if (value == 'linux') {
      setImageOptionList(imageDataList.filter(obj => obj.os_type != 'windows'))
    } else {
      setImageOptionList([])
    }
  }

  // 체크 리스트 시작 ==================================================
  const [networkCheckItems, setNetworkCheckItems] = useState([]);
  const [sriovCheckItems, setSriovCheckItems] = useState([]);
  const [securityGroupCheckItems, setSecurityGroupCheckItems] = useState([]);

  const dataListVariables = {
    network: networkDataList,
    sriov: sriovNetworkDataList,
    security: securityGroupDataList,
  };

  const stateVariables = {
    network: networkCheckItems,
    sriov: sriovCheckItems,
    security: securityGroupCheckItems,
  };

  const setVariables = {
    network: setNetworkCheckItems,
    sriov: setSriovCheckItems,
    security: setSecurityGroupCheckItems,
  };

  const handleSingleCheck = (checked, name, type) => {
    if (checked) {
      setVariables[type](prev => [...prev, name]);
    } else {
      setVariables[type](stateVariables[type].filter((el) => el !== name));
    }
  };

  const handleAllCheck = (checked, type) => {
    if (checked) {
      const nameArray = [];
      dataListVariables[type].forEach((el) => nameArray.push(el.name));
      setVariables[type](nameArray);
    } else {
      setVariables[type]([]);
    }
  }

  const handleDelete = (name, type) => {
    setVariables[type](stateVariables[type].filter((el) => el !== name));
  };

  // 체크 리스트 끝 ==================================================


  // Validation 시작 ==================================================
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

  const imageValidator = (rule, value, callback) => {
    if (value == "선택" || value == "select") {
      return callback({ message: t('이미지를 선택해 주세요.') })
    }
    callback()
  }

  const bootVolumeValidator = (rule, value, callback) => {
    if (value == "선택" || value == "select") {
      return callback({ message: t('부트볼륨을 선택해 주세요.') })
    }
    callback()
  }

  const flavorValidator = (rule, value, callback) => {
    if (value == "선택" || value == "select") {
      return callback({ message: t('Flavor를 선택해 주세요.') })
    }
    callback()
  }
  // Validation 끝 ==================================================


  // 스크립트 시작 ==================================================
  const nextPasswordRoute = useRef(1);
  const [listPasswordRoute, setlistPasswordRoute] = useState([1]);

  const handlePasswordRoute = {

    addColumn: () => {
      if (listPasswordRoute.length > 4) {
        Notify.info('5개까지 추가 가능합니다.')
        return false;
      }
      nextPasswordRoute.current += 1
      setlistPasswordRoute(listPasswordRoute => [...listPasswordRoute, nextPasswordRoute.current]);

    },
    delColumn: (id) => {
      setlistPasswordRoute(listPasswordRoute.filter((el) => el !== id));
    },
  }

  const nextFileRoute = useRef(1);
  const [listFileRoute, setlistFileRoute] = useState([1]);

  const handleFileRoute = {

    addColumn: () => {
      if (listFileRoute.length > 4) {
        Notify.info('5개까지 추가 가능합니다.')
        return false;
      }
      nextFileRoute.current += 1
      setlistFileRoute(listFileRoute => [...listFileRoute, nextFileRoute.current]);

    },
    delColumn: (id) => {
      setlistFileRoute(listFileRoute.filter((el) => el !== id));
    },
  }

  const nextPackageRoute = useRef(1);
  const [listPackageRoute, setlistPackageRoute] = useState([1]);

  const handlePackageRoute = {

    addColumn: () => {
      if (listPackageRoute.length > 4) {
        Notify.info('5개까지 추가 가능합니다.')
        return false;
      }
      nextPackageRoute.current += 1
      setlistPackageRoute(listPackageRoute => [...listPackageRoute, nextPackageRoute.current]);

    },
    delColumn: (id) => {
      setlistPackageRoute(listPackageRoute.filter((el) => el !== id));
    },
  }
  // 스크립트 끝 ==================================================


  const [tab, setTab] = useState("I");
  const { TabPanel } = Tabs;

  return (
    <>
      <Modal
        icon="pen"
        width={960}
        title={props.title}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form} >

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
              <span className={styles.network}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>네트워크 설정</div>
                <div className={styles.situation}>{regStep == 2 ? "현재" : regStep > 2 ? "설정완료" : "미설정"}</div>
              </div>
            </div>
            <div className={classnames(styles.process_item, `${regStep == 3 ? styles.current : ''}`)}>
              <div className={styles.status}>
                <div className={`${regStep == 3 ? styles.current : regStep > 3 ? styles.done : styles.todo}`}></div>
              </div>
              <span className={styles.detail}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>세부 설정</div>
                <div className={styles.situation}>{regStep == 3 ? "현재" : regStep > 3 ? "설정완료" : "미설정"}</div>
              </div>
            </div>
            <div className={classnames(styles.process_item, `${regStep == 4 ? styles.current : ''}`)}>
              <div className={styles.status}>
                <div className={`${regStep == 4 ? styles.current : styles.todo}`} ></div>
              </div>
              <span className={styles.check}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>입력 정보 확인</div>
                <div className={styles.situation}>{regStep == 4 ? "현재" : "미설정"}</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.pop_overflow_y}>
            <div className={styles.cont_boxwrap}>

              {/* 기본설정 설정 시작==========================================*/}
              <div className={`${regStep == 1 ? "" : "hide"}`}>
                <Form.Item
                  label={t('이름')}
                  rules={[{ required: true, validator: nameValidator }]}
                  desc={t('NAME_DESC')}
                >
                  <Input name="name" autoFocus={true} maxLength={63} style={{ maxWidth: 'none' }} />
                </Form.Item>

                <Form.Item
                  label={t('유형')}
                >
                  <Tabs type="button" activeName={tab} onChange={newTab => {
                    setTab(newTab);
                    setImageType(newTab);
                    setStorageClass("");
                  }}>
                    <TabPanel label="이미지" name="I" />
                    <TabPanel label="부트볼륨" name="B" />
                  </Tabs>
                </Form.Item>

                {/* <Form.Item
                    label={t('유형')}
                  >
                    <RadioGroup
                      name="imageType"
                      wrapClassName="radio"
                      defaultValue={imageType}
                      onChange={value => setImageType(value)}
                    >
                      {imageTypeOptions.map(option => (
                        <RadioButton key={option.value} value={option.value}>
                          {option.label}
                        </RadioButton>
                      ))}
                    </RadioGroup>
                  </Form.Item>     */}

                {imageType == "I" &&
                  <Form.Item>
                    <Columns>
                      <Column>
                        <Form.Item
                          label={t('OS 타입')}
                          rules={[{ required: true, message: t('OS를 선택해주세요.') }]}
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
                        <Form.Item
                          label={t('이미지')}
                          rules={[{ required: true, validator: imageValidator }]}
                        >
                          <TypeSelect
                            name="image"
                            defaultValue={"선택"}
                            placeholder={{
                              label: t('선택')
                            }}
                            options={imageOptions()}
                            onChange={(e) => {
                              setSelectImageName(e);

                              const distro_type = imageOptionList.filter(item => item.name == e).map(item => item.distro_type)[0];
                              setSelectImageDistroType(distro_type);
                            }}
                            defaultDescription={"이미지를 선택해 주세요."}
                          />
                        </Form.Item>
                        {
                          selectImageName &&
                          <Form.Item>
                            <div className={styles.wrapperImageView}>
                                {osType[0].toUpperCase() + osType.slice(1, osType.length) + ' > ' + selectImageName}
                            </div>
                          </Form.Item>
                        }
                      </Column>
                    </Columns>
                  </Form.Item>
                }

                {imageType == "B" &&
                  <Form.Item
                    label={t('부트볼륨')}
                    rules={[{ required: true, validator: bootVolumeValidator }]}
                  >
                    <Select
                      name="bootvolume"
                      defaultValue={"선택"}
                      options={bootvolumeOptions()}
                    // clearable
                    />
                  </Form.Item>
                }
                <Columns>
                  <Column>
                    {imageType == "B" &&
                      <div style={{ padding: 8 }} />
                    }
                    <Form.Item
                      label={t('Flavor')}
                      rules={[{ required: true, validator: flavorValidator }]}
                    >
                      <TypeSelect
                        name="flavor"
                        defaultValue="선택"
                        options={flavorOptions()}
                        onChange={(e) => setSelectFlavorName(e)}
                        placeholder={{
                          label: t('선택')
                        }}
                        defaultDescription={"Flavor를 선택해 주세요."}
                      />
                    </Form.Item>
                    <div className={`form-item-error ${flavorSizeCheck ? "hide" : ""}`}>이미지 사이즈보다 큰 사이즈를 선택해 주세요.</div>
                  </Column>

                  <Column>
                    <div style={{ padding: 12 }} />
                    {imageType == "I" &&
                      <Form.Group label={t('스토리지 클래스')} onChange={(e) => { setStorageClass("선택"); }} checkable>
                        <Form.Item>
                          <Select
                            options={storageClassOptions}
                            onChange={(el) => setStorageClass(el)}
                            value={storageClass}
                          />
                        </Form.Item>
                      </Form.Group>
                    }
                  </Column>
                </Columns>

                <Form.Item
                  className={styles.textarea}
                  label={t('설명')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea
                    name="description"
                    maxLength={256}
                    rows="1"
                    defaultValue=""
                  />
                </Form.Item>

              </div>
              {/* 기본설정 설정 끝==========================================*/}

              {/* 네트워크 설정 시작==========================================*/}
              <div className={`${regStep == 2 ? "" : "hide"}`}>

                <Form.Item label={t('네트워크')} >
                  <div className={styles.wrapper}>
                    {stateVariables['network'].length > 0 &&
                      <div className={classnames(styles.table_title, styles.table_title_bg)}>
                        <Button className={styles.table_title_button} onClick={() => handleAllCheck(false, "network")}>전체 선택 해제</Button>  {stateVariables['network'].length}개 선택
                      </div>
                    }
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
                              <Checkbox name='select-all-network'
                                onChange={(checked) => handleAllCheck(checked, "network")}
                                checked={dataListVariables['network'].length > 0 && stateVariables['network'].length === dataListVariables['network'].length ? true : false} />
                            </th>
                            <th><strong>네트워크 이름</strong></th>
                            <th><strong>네트워크 유형</strong></th>
                            <th><strong>기본 경로</strong></th>
                            <th><strong>CIDR</strong></th>
                            <th><strong>게이트웨이</strong></th>
                          </tr>
                        </thead>
                        <tbody>
                          {!networkDataList?.length &&
                            <tr>
                              <td colSpan="6" className="no-data">
                                <p>할당 가능한 자원이 없습니다.</p>
                              </td>
                            </tr>
                          }
                          {networkDataList?.map((data, key) => (
                            <tr key={data.name}>
                              <td>
                                <Checkbox name={`select-${data.name}`} checked={stateVariables['network'].includes(data.name) ? true : false}
                                  onChange={(checked) => handleSingleCheck(checked, data.name, "network")} />
                              </td>
                              <td>{data.name}</td>
                              <td>{(data.type).toUpperCase()}</td>
                              <td>{data.default_route ? "사용" : "미사용"}</td>
                              <td>{data.cidr}</td>
                              <td>{data.gateway_ip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className={styles.removeCheckWrapper}>
                        {networkCheckItems?.map((name) =>
                          <span key={name}><Button icon="close" onClick={() => handleDelete(name, "network")}>{name}</Button></span>
                        )}
                      </div>
                    </div>
                  </div>
                </Form.Item>

                <Form.Item label={t('SR-IOV 네트워크')} >
                  <div className={styles.wrapper}>
                    {stateVariables['sriov'].length > 0 &&
                      <div className={classnames(styles.table_title, styles.table_title_bg)}>
                        <Button className={styles.table_title_button} onClick={() => handleAllCheck(false, "sriov")}>전체 선택 해제</Button>  {stateVariables['sriov'].length}개 선택
                      </div>
                    }
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
                            <th>
                              <Checkbox name='select-all-sriov'
                                onChange={(checked) => handleAllCheck(checked, "sriov")}
                                checked={dataListVariables['sriov'].length > 0 && stateVariables['sriov'].length === dataListVariables['sriov'].length ? true : false} />
                            </th>
                            <th><strong>네트워크 이름</strong></th>
                            <th><strong>네트워크 유형</strong></th>
                            <th><strong>CIDR</strong></th>
                            <th><strong>게이트웨이</strong></th>
                          </tr>
                        </thead>
                        <tbody>
                          {!sriovNetworkDataList?.length &&
                            <tr>
                              <td colSpan="5" className="no-data">
                                <p>할당 가능한 자원이 없습니다.</p>
                              </td>
                            </tr>
                          }
                          {sriovNetworkDataList?.map((data, key) => (
                            <tr key={data.name}>
                              <td>
                                <Checkbox name={`select-${data.name}`} checked={stateVariables['sriov'].includes(data.name) ? true : false}
                                  onChange={(checked) => handleSingleCheck(checked, data.name, "sriov")} />
                              </td>
                              <td>{data.name}</td>
                              <td>{(data.type).toUpperCase()}</td>
                              <td>{data.cidr}</td>
                              <td>{data.gateway_ip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className={styles.removeCheckWrapper}>
                        {sriovCheckItems?.map((name) =>
                          <span key={name}><Button icon="close" onClick={() => handleDelete(name, "sriov")}>{name}</Button></span>
                        )}
                      </div>
                    </div>
                  </div>
                </Form.Item>
              </div>
              {/* 네트워크 설정 끝==========================================*/}

              {/* 세부 설정 시작==========================================*/}
              <div className={`${regStep == 3 ? "" : "hide"}`}>

                <Form.Item
                  label={t('키페어')}
                >
                  <Select
                    name="keypair"
                    placeholder={t('SELECT')}
                    options={keypairOptions()}
                    clearable
                  />
                </Form.Item>

                <Form.Item label={t('보안그룹')} >
                  <div className={styles.wrapper}>
                    {stateVariables['security'].length > 0 &&
                      <div className={classnames(styles.table_title, styles.table_title_bg)}>
                        <Button className={styles.table_title_button} onClick={() => handleAllCheck(false, "security")}>전체 선택 해제</Button>  {stateVariables['security'].length}개 선택
                      </div>
                    }
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
                              <Checkbox name='select-all-security'
                                onChange={(checked) => handleAllCheck(checked, "security")}
                                checked={dataListVariables['security'].length > 0 && stateVariables['security'].length === dataListVariables['security'].length ? true : false} />
                            </th>
                            <th><strong>보안그룹 이름</strong></th>
                            <th><strong>설명</strong></th>
                            <th><strong>인바운드 규칙수</strong></th>
                            <th><strong>아웃바운드 규칙수</strong></th>
                          </tr>
                        </thead>
                        <tbody>
                          {!securityGroupDataList?.length &&
                            <tr>
                              <td colSpan="5" className="no-data">
                                <p>할당 가능한 자원이 없습니다.</p>
                              </td>
                            </tr>
                          }
                          {securityGroupDataList?.map((data, key) => (
                            <tr key={data.name}>
                              <td>
                                <Checkbox name={`select-${data.name}`} checked={stateVariables['security'].includes(data.name) ? true : false}
                                  onChange={(checked) => handleSingleCheck(checked, data.name, "security")} />
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
                        {securityGroupCheckItems?.map((name) =>
                          <span key={name}><Button icon="close" onClick={() => handleDelete(name, "security")}>{name}</Button></span>
                        )}
                      </div>
                    </div>
                  </div>
                </Form.Item>

                <Form.Item
                  label={t('노드')}
                >
                  <Select
                    name="node"
                    placeholder={t('SELECT')}
                    options={nodeOptions()}
                    clearable
                  />
                </Form.Item>

                <Form.Group label={t('스크립트')} onChange={(e) => setIsScript(!isScript)} checkable>
                  <Form.Group label="패스워드 변경" onChange={(e) => setIsPassword(!isPassword)} checkable >
                    {listPasswordRoute.map((obj, idx) => (
                      <div className={styles.scriptitem} key={obj}>
                        <Columns>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`scriptId_${obj}`}
                                placeholder={t('ID')}
                                defaultValue={obj == 1 ? selectImageDistroType : "" }
                                disabled={obj == 1 ? true : false }
                              />
                            </Form.Item>
                          </Column>
                          <Column>
                            <Form.Item>
                              <InputPassword
                                name={`scriptPassword_${obj}`}
                                placeholder={t('Password')}
                              />
                            </Form.Item>
                          </Column>
                        </Columns>
                        <Button
                          type="flat"
                          icon="trash"
                          className={styles.scriptdelete}
                          onClick={() => (listPasswordRoute.length > 1 && obj > 1) && handlePasswordRoute.delColumn(obj) }
                        />
                      </div>
                    ))}
                    <div className="text-right">
                      <Button
                        className={styles.scriptadd}
                        onClick={handlePasswordRoute.addColumn}
                      >
                        추가
                      </Button>
                    </div>
                  </Form.Group>
                  <Form.Group label="파일 쓰기" onChange={(e) => setIsPackage(!isPackage)} checkable >
                    {listFileRoute.map((obj, idx) => (
                      <div className={styles.scriptitem} key={obj}>
                        <Columns>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`scriptPath_${obj}`}
                                placeholder={t('PATH')}
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
                        <Button
                          type="flat"
                          icon="trash"
                          className={styles.scriptdelete}
                          onClick={() => listFileRoute.length > 1 && handleFileRoute.delColumn(obj)}
                        />
                      </div>
                    ))}
                    <div className="text-right">
                      <Button
                        className={styles.scriptadd}
                        onClick={handleFileRoute.addColumn}
                      >
                        추가
                      </Button>
                    </div>
                  </Form.Group>
                  <Form.Group label="패키지 설치" onChange={(e) => setIsFileWrite(!isFileWrite)} checkable >
                    {listPackageRoute.map((obj, idx) => (
                      <div className={styles.scriptitem} key={obj}>
                        <Columns>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`scriptPackage_${obj}`}
                                placeholder={t('Package')}
                              />
                            </Form.Item>
                          </Column>
                          <Column>
                            <Form.Item>
                              <Input
                                name={`scriptVersion_${obj}`}
                                placeholder={t('Ver')}
                              />
                            </Form.Item>
                          </Column>
                        </Columns>
                        <Button
                          type="flat"
                          icon="trash"
                          className={styles.scriptdelete}
                          onClick={() => listPackageRoute.length > 1 && handlePackageRoute.delColumn(obj)}
                        />
                      </div>
                    ))}
                    <div className="text-right">
                      <Button
                        className={styles.scriptadd}
                        onClick={handlePackageRoute.addColumn}
                      >
                        추가
                      </Button>
                    </div>
                  </Form.Group>
                  <Form.Group label="사용자 정의" onChange={(e) => setIsUserScript(!isUserScript)} checkable>
                    <Form.Item
                      className={styles.textarea}
                    >
                      <TextArea
                        name="userScript"
                        rows="5"
                      />
                    </Form.Item>
                  </Form.Group>
                </Form.Group>

              </div>
              {/* 세부 설정 끝==========================================*/}

              {/* 입력 정보 확인 시작==========================================*/}
              <div className={`${regStep == 4 ? "" : "hide"}`}>
                <div className={styles.boxwrap}>

                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.basic}></span>
                        <label>기본 설정</label>
                      </div>
                      <Button icon="pen" onClick={() => { setRegStep(1) }}></Button>
                    </div>
                    <div className={styles.greybgbox}>
                      <div className={styles.list}>
                        <label>이름</label>
                        <div className={styles.bold}>{vmName}</div>
                      </div>
                      <div className={styles.list}>
                        <label>{`${imageType == "I" ? '이미지' : '부트볼륨'}`}</label>
                        <div className={styles.multiline}>
                          <div className={styles.bold}>{`${imageType == "I" ? imageName : bootVolumeName}`}</div>
                        </div>
                      </div>
                      <div className={styles.list}>
                        <label>Flavor</label>
                        <div className={styles.multiline}>
                          <div className={styles.bold}>{flavorName}</div>
                          <p>
                            CPU {flavorCpu} Cores / Memory {flavorMemory} Gib/ Disk {flavorDisk} Gib
                          </p>
                        </div>
                      </div>
                      <div className={styles.list}>
                        <label>설명</label>
                        <div>{description}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.network}></span>
                        <label>네트워크 설정</label>
                      </div>
                      <Button icon="pen" onClick={() => { setRegStep(2) }}></Button>
                    </div>
                    <label>네트워크</label>
                    {networkDataList.filter(x => networkCheckItems.includes(x.name)).map((obj, index) => (
                      <div className={styles.greybgbox} key={index}>
                        <div className={styles.list}>
                          <label>이름</label>
                          <div>{obj.name}</div>
                        </div>
                        <div className={styles.list}>
                          <label>유형</label>
                          <div className={styles.multiline}>
                            <div>{obj.type}</div>
                          </div>
                        </div>
                        <div className={styles.list}>
                          <label>CIDR</label>
                          <div className={styles.multiline}>
                            <div>{obj.cidr}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <label>SR-IOV 네트워크</label>
                    {sriovNetworkDataList.filter(x => sriovCheckItems.includes(x.name)).map((obj, index) => (
                      <div className={styles.greybgbox} key={index}>
                        <div className={styles.list}>
                          <label>이름</label>
                          <div>{obj.name}</div>
                        </div>
                        <div className={styles.list}>
                          <label>유형</label>
                          <div className={styles.multiline}>
                            <div>{obj.type}</div>
                          </div>
                        </div>
                        <div className={styles.list}>
                          <label>CIDR</label>
                          <div className={styles.multiline}>
                            <div>{obj.cidr}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.detail}></span>
                        <label>세부 설정</label>
                      </div>
                      <Button icon="pen" onClick={() => { setRegStep(3) }}></Button>
                    </div>
                    <div className={styles.greybgbox}>
                      <div className={styles.list}>
                        <label>키 페어</label>
                        <div>{keypairName}</div>
                      </div>
                      <div className={styles.list}>
                        <label>보안그룹</label>
                        <div className={styles.multiline}>
                          {securityGroupCheckItems.map((name) => (
                            <div key={name}>{name}</div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.list}>
                        <label>노드</label>
                        <div className={styles.multiline}>
                          <div>{nodeName}</div>
                        </div>
                      </div>
                      <div className={styles.list}>
                        <label>사용자이름</label>
                        <div>{globals.user.username}</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 입력 정보 확인 끝==========================================*/}

            </div>
          </div>

          {/* Footer */}
          <div className={styles['modal-footer']}>
            {fnGetModalFooter()}
          </div>

        </Form>
      </Modal>

    </>
  );
};

export default RegistModal

