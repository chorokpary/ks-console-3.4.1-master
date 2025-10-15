import { get, range } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Slider,
} from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';
import classnames from 'classnames';

import { Modal } from 'components/Base';
import * as common from 'utils/resources';
import { ProjectSelect, UnitSlider } from 'components/Inputs';
import { PATTERN_USER_NAME } from 'utils/constants';
import VolumeStore from 'stores/resources/volumes';
import ImageStore from 'stores/resources/images';
import styles from './index.scss';

import TypeSelect from '../../../TypeSelect';
import CardSelect from '../../../CardSelect';

import DistroTypeStore from 'stores/resources/distrotype';

const regexRootDisk = /^[1-9]\d*GiB?|[1-9]\d*$/;

const RegistModal = props => {
  const volumeStore = new VolumeStore();
  const imageStore = new ImageStore();
  const distroTypeStore = new DistroTypeStore();

  const form = useRef();
  const [formData, setFormData] = useState({});

  const [modelView, setModalView] = useState(true);
  const [regStep, setRegStep] = useState(1);

  const [volumeCapacity, setVolumeCapacity] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [storegeClassDataList, setStoregeClassDataList] = useState([]);
  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default'
  );
  const [images, setImages] = useState([]);
  const [image, setImage] = useState();

  const [importSource, setImportSource] = useState();
  const [storageClassOptions, setStorageClassOptions] = useState([]);
  const [storageClass, setStorageClass] = useState();

  const [osType, setOsType] = useState('linux');
  const [distroTypeData, setDistroTypeData] = useState([]);
  const [distroTypeList, setDistroTypeList] = useState([]);
  const [distroType, setDistroType] = useState('ubuntu');

  const [imageInfoActive, setImageInfoActive] = useState(false);

  useEffect(() => {
    const getStoregeClassData = async () => {
      const listStoregeClass = await volumeStore.fetchStoregeClass(props);
      const opt = listStoregeClass.sces
        // .filter(obj => obj.is_vm_default_class === true)
        .map(obj => {
          return {
            label: t(obj.name),
            value: t(obj.name),
            is_vm_default_class: obj.is_vm_default_class,
          };
        });
      setStorageClassOptions(opt);
    };

    const getImageStore = async () => {
      const listImageBuild = await imageStore.fetchList({
        cluster: props.cluster,
        namespace: props.namespace,
      });
      setImages(listImageBuild);
    };

    setImportSource(importSourceOptions[0].value);

    getStoregeClassData();
    getImageStore();
  }, []);

  const handleImportSource = (e) => {
    setImportSource(e)
    setImageInfoActive(false)
  }

  const handleImageInfoActive = () => {
    if (imageInfoActive) {
      setImageInfoActive(false);
    } else {
      setImageInfoActive(true);
    }
  }

  useEffect(() => {
    const options = imageOptions();
    if (options.length > 0) {
      setImage(options[0].value);
    }
  }, [images]);

  const imageOptions = () => {
    if (images.length === 0) {
      return [];
    }
    const opt = images.map(obj => {
      return {
        label: t(obj.name),
        value: t(obj.name),
      };
    });
    return opt;
  };

  useEffect(() => {
    const getDistroTypeList = async () => {
      const dist = await distroTypeStore.fetchList({
        cluster: props.cluster,
        namespace: props.namespace,
      });
      setDistroTypeData(dist);
      setDistroTypeList(dist.filter(obj => obj.name != 'windows'));
    };
    getDistroTypeList();
  }, []);

  const distroTypeOptions = () => {
    const opt = distroTypeList.map(obj => ({
      label: t(obj.name),
      description: t(obj.vendor),
      icon: `ico-os-${obj.name}`,
      value: t(obj.name),
    }));
    return opt;
  };

  useEffect(() => {
    if (storageClassOptions.length > 0) {
      const opt = storageClassOptions.filter(
        obj => obj.is_vm_default_class === true
      );
      setStorageClass(opt[0].value);
    }
  }, [storageClassOptions]);

  const accessModeOptions = [
    { label: 'RWO (Read Write Once)', value: 'ReadWriteOnce' },
    { label: 'ROX (Read Only Many)', value: 'ReadOnlyMany' },
    { label: 'RWX (Read Write Many)', value: 'ReadWriteMany' },
  ];

  const importSourceOptions = [
    { label: 'Empty', value: 'Empty' },
    { label: 'ImageVolume', value: 'ImageVolume' },
    { label: 'UploadImage', value: 'UploadImage' },
    // { label: 'DataVolume', value: 'DataVolume' },
  ];

  const archTypeOptions = [
    { label: 'x86_64', value: 'x86_64' },
    { label: 'aarch64', value: 'aarch64' },
  ];

  const bootTypeOptions = [
    { label: 'legacy', value: 'legacy' },
    { label: 'uefi', value: 'uefi' },
  ];

  const osTypeOptions = [
    { label: 'Linux', value: 'linux', icon: 'ico-linux' },
    { label: 'Windows', value: 'windows', icon: 'ico-windows' },
    //   { label: 'etc', value: '', icon: 'ico-plus' },
  ];

  const volumeModeOptions = [
    { label: 'Filesystem', value: 'Filesystem' },
    { label: 'Block', value: 'Block' },
  ];

  const bindingModeOptions = [
    {
      label: t('RESOURCES_IMMEDIATE_BINDING'),
      value: t('RESOURCES_IMMEDIATE_BINDING'),
    },
  ];

  const handleOk = () => {
    const onOk = props.onOk;
    const removeText = 'GiB';

    form.current.validator(() => {
      const { data } = form.current.props;

      const accesModeArray = [];
      accesModeArray.push(data.access_mode);
      data.access_modes = accesModeArray;
      data.project = projectName;

      if (imageInfoActive) {
        data.os_distro = distroType;
      } else {
        data.cpu_arch = "";
        data.os_type = "";
        data.os_distro = "";
        data.boot_type = "";
      }

      if (typeof volumeCapacity === 'number') {
        data.capacity = volumeCapacity;
      } else {
        data.capacity = Number(
          volumeCapacity.substring(0, volumeCapacity.indexOf(removeText))
        );
      }

      setIsSubmitting(true);

      onOk({ ...data });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

  const stepMoveCheck = step => {
    const { data } = form.current.props;
    if (step == 1) {
      if (
        data.name == undefined ||
        data.name == '' ||
        !PATTERN_USER_NAME.test(data.name) ||
        (!props.namespace && projectName == undefined)
      ) {
        handleOk();
      } else {
        setRegStep(2);
      }
    }
    if (step == 2) {
      setRegStep(3);
    }
  };

  const handleOsType = value => {
    setOsType(value);
    if (value == 'windows') {
      setDistroType('windows');
      setDistroTypeList(distroTypeData.filter(obj => obj.name == 'windows'));
    } else if (value == 'linux') {
      setDistroType('ubuntu');
      setDistroTypeList(distroTypeData.filter(obj => obj.name != 'windows'));
    } else {
      setDistroType('');
      setDistroTypeList([]);
    }
  };

  const fnGetModalFooter = () => {
    let elements = '';
    elements = (
      <>
        {regStep == 1 && (
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
                stepMoveCheck(1);
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep == 2 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(1);
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(2);
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep == 3 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(2);
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              onClick={() => {
                handleOk();
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
    );

    return elements;
  };

  const getMarks = max => {
    const count = 9;
    return range(count).reduce((marks, index) => {
      const value = (max * index) / (count - 1);
      const mark = value === 0 ? '0' : `${Math.floor(value)}GiB`;
      return { ...marks, [value]: mark };
    }, {});
  };

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
                `${regStep == 1 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep == 1
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
                  {regStep == 1
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
                `${regStep == 2 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
              <div
                  className={`${regStep == 2
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
                  {t('RESOURCES_IMPORT_SOURCE_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep == 2
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
                `${regStep == 3 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep == 3 ? styles.current : styles.todo}`}
                ></div>
              </div>
              <span className={styles.detail}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_DETAIL_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep == 3
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
              <div className={`${regStep == 1 ? '' : 'hide'}`}>
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
                          name="namespace"
                          defaultValue={projectName}
                          cluster={props.cluster}
                          onChange={e => setProjectName(e)}
                        />
                      </Form.Item>
                    </Column>
                  )}
                </Columns>

                <Form.Item
                  className={styles.textarea}
                  label={t('RESOURCES_DESCRIPTION')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea
                    name="description"
                    maxLength={256}
                    defaultValue=""
                  />
                </Form.Item>
              </div>
              {/* 기본설정 설정 끝========================================== */}
              {/* 입력소스 설정 시작======================================== */}
              <div className={`${regStep == 2 ? '' : 'hide'}`}>
                <Form.Item label={t('RESOURCES_INPUT_SOURCE')}>
                  <Select
                    name="import_source"
                    defaultValue={importSource}
                    options={importSourceOptions}
                    onChange={e => handleImportSource(e)}
                  />
                </Form.Item>
                {importSource === 'ImageVolume' && (
                  <Form.Item label={t('RESOURCES_VM_IMAGE')}>
                    <Select
                      name="import_endpoint"
                      defaultValue={image}
                      options={imageOptions()}
                      onChange={e => setImage(e)}
                    />
                  </Form.Item>
                )}
                {importSource === 'UploadImage' && (
                  <Form.Item
                    label={t('RESOURCES_IMAGE_INFO')}
                    rules={[
                      {
                        required: false,
                      },
                    ]}
                  >
                    <div className={styles.cont_box_section}>
                      <div className={styles.cont_box_wrap}>
                        <h6 className={styles.label}>
                          <div className={styles.form_check}>
                            <input type="checkbox" name="chk-0" id="chk-0" />
                            <label
                              htmlFor="chk-0"
                              onClick={() => handleImageInfoActive()}
                            ></label>
                          </div>
                          <div className={styles.title}>
                            <p>{t('RESOURCES_SPECIFY_BOOT_VOLUME')}</p>
                            <span>{t('RESOURCES_SPECIFY_BOOT_VOLUME_TIP')}</span>
                          </div>
                        </h6>
                        {imageInfoActive && (
                          <div className={`${styles.select_inner_content}`}>
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
                                  <Form.Item label={t('RESOURCES_DISTRIBUTION')} rules={[{ required: true, }]}>
                                    <TypeSelect
                                      onChange={e => setDistroType(e)}
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
                                      name="cpu_arch"
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
                          </div>
                        )}
                      </div>
                    </div>
                  </Form.Item>
                )}
              </div>
              {/* 입력소스 설정 끝======================================== */}
              {/* 세부설정 시작========================================== */}
              <div className={`${regStep == 3 ? '' : 'hide'}`}>
                <Form.Item label={t('RESOURCES_STORAGE_CLASS')}>
                  <Select
                    name="storage_class"
                    defaultValue={storageClass}
                    options={storageClassOptions}
                    onChange={e => {
                      setStorageClass(e);
                    }}
                  />
                </Form.Item>

                <Form.Item label={t('RESOURCES_ACCESS_MODE')}>
                  <Select
                    name="access_mode"
                    defaultValue={'ReadWriteOnce'}
                    options={accessModeOptions}
                  />
                </Form.Item>

                <Form.Item
                  label={t('RESOURCES_ROOT_DISK')}
                  rules={[
                    {
                      required: true,
                    },
                    {
                      pattern: regexRootDisk,
                      message: t('RESOURCES_ROOT_DISK_VALID'),
                    },
                  ]}
                >
                  <UnitSlider
                    max={2048}
                    min={0}
                    marks={getMarks(2048)}
                    defaultValue={volumeCapacity}
                    unit={'GiB'}
                    withInput
                    onChange={e => setVolumeCapacity(e)}
                    style={{ padding: '5px', marginLeft: '10px' }}
                  />
                </Form.Item>

                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item label={t('RESOURCES_VOLUME_MODE')}>
                        <Select
                          name="volume_mode"
                          defaultValue={'Filesystem'}
                          options={volumeModeOptions}
                        />
                      </Form.Item>
                    </Column>
                    {/* <Column>
                      <Form.Item
                          label={t('볼륨 바인드 모드')}
                        >
                          <Select
                            name="volume_bind_mode"
                            defaultValue={"즉시 바인딩"}
                            options={bindingModeOptions}
                            clearable
                          />
                        </Form.Item>
                    </Column> */}
                  </Columns>
                </Form.Item>
              </div>
              {/* 세부설정 끝========================================== */}
            </div>
          </div>

          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  );
};

export default RegistModal;
