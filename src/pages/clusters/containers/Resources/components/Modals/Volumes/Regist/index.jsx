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

import { Modal, TypeSelect } from 'components/Base';
import * as common from 'utils/resources';
import { ProjectSelect, UnitSlider } from 'components/Inputs';
import { PATTERN_USER_NAME } from 'utils/constants';
import styles from './index.scss';
import VolumeStore from 'stores/resources/volumes';
import ImageStore from 'stores/resources/images';

const regexRootDisk = /^[1-9]\d*GiB?|[1-9]\d*$/;

const RegistModal = props => {
  const volumeStore = new VolumeStore();
  const imageStore = new ImageStore();

  const form = useRef();
  const [formData, setFormData] = useState({});

  const [modelView, setModalView] = useState(true);
  const [regStep, setRegStep] = useState(1);

  const [volumeCapacity, setVolumeCapacity] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [storegeClassDataList, setStoregeClassDataList] = useState([]);
  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default',
  );
  const [images, setImages] = useState([]);
  const [image, setImage] = useState();

  const [importSource, setImportSource] = useState();

  useEffect(() => {
    const getStoregeClassData = async () => {
      const listStoregeClass = await volumeStore.fetchStoregeClass(props);
      setStoregeClassDataList(listStoregeClass.sces);
    };
    const getImageStore = async () => {
      const listImageBuild = await imageStore.fetchList();
      setImages(listImageBuild);
    };

    setImportSource(importSourceOptions[0].value);

    getStoregeClassData();
    getImageStore();
  }, []);

  useEffect(() => {
    const options = imageOptions();
    if (options.length > 0) {
      setImage(options[0].value);
    }
  }, [images]);

  const storageClassOptions = () => {
    const opt = storegeClassDataList
      .filter(obj => obj.is_default_class == true)
      .map(obj => {
        return {
          label: t(obj.name),
          value: t(obj.name),
        };
      });

    return opt;
  };

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

  const accessModeOptions = [
    { label: 'RWO (Read Write Once)', value: 'ReadWriteOnce' },
    { label: 'ROM (Read Only Many)', value: 'ReadOnlyMany' },
    { label: 'RWM (Read Write Many)', value: 'ReadWriteMany' },
  ];

  const importSourceOptions = [
    { label: 'Empty', value: 'Empty' },
    { label: 'ImageVolume', value: 'ImageVolume' },
    // { label: 'DataVolume', value: 'DataVolume' },
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

      if (typeof volumeCapacity === 'number') {
        data.capacity = volumeCapacity;
      } else {
        data.capacity = Number(
          volumeCapacity.substring(0, volumeCapacity.indexOf(removeText)),
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
              onClick={() => {
                handleOk();
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
              loading={isSubmitting}
              disabled={isSubmitting}
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
    const count = 5;
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
        width={960}
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
                `${regStep == 1 ? styles.current : ''}`,
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${
                    regStep == 1
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
                `${regStep == 2 ? styles.current : ''}`,
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep == 2 ? styles.current : styles.todo}`}
                ></div>
              </div>
              <span className={styles.check}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_DETAIL_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep == 2
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
                    rows="1"
                    defaultValue=""
                  />
                </Form.Item>
              </div>
              {/* 기본설정 설정 끝========================================== */}

              {/* 세부설정 시작========================================== */}
              <div className={`${regStep == 2 ? '' : 'hide'}`}>
                <Form.Item label={t('RESOURCES_STOREGE_CLASS')}>
                  <Select
                    name="storage_class"
                    defaultValue={'openebs-hostpath'}
                    options={storageClassOptions()}
                    clearable
                  />
                </Form.Item>

                <Form.Item label={t('RESOURCES_ACCESS_MODE')}>
                  <Select
                    name="access_mode"
                    defaultValue={'ReadWriteOnce'}
                    options={accessModeOptions}
                    clearable
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
                    max={320}
                    min={0}
                    marks={getMarks(320)}
                    defaultValue={volumeCapacity}
                    unit={'GiB'}
                    withInput
                    onChange={e => setVolumeCapacity(e)}
                    style={{ padding: '5px', marginLeft: '10px' }}
                  />
                </Form.Item>

                <Form.Item label={t('RESOURCES_INPUT_SOURCE')}>
                  <Select
                    name="import_source"
                    defaultValue={importSource}
                    options={importSourceOptions}
                    onChange={e => {
                      setImportSource(e);
                    }}
                    clearable
                  />
                </Form.Item>

                {importSource === 'ImageVolume' && (
                  <Form.Item label={'가상머신 이미지'}>
                    <Select
                      name="import_endpoint"
                      defaultValue={image}
                      options={imageOptions()}
                      onChange={e => setImage(e)}
                      clearable
                    />
                  </Form.Item>
                )}

                <Form.Item>
                  <Columns>
                    <Column>
                      <Form.Item label={t('RESOURCES_VOLUME_MODE')}>
                        <Select
                          name="volume_mode"
                          defaultValue={'Filesystem'}
                          options={volumeModeOptions}
                          clearable
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
