import React, { useState, useEffect, useRef } from 'react';

import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  CheckboxGroup,
  Checkbox,
  Slider,
  Tabs,
  Column,
  Columns,
  Tooltip,
} from '@kube-design/components';
import classnames from 'classnames';
import axios from 'axios';
import { UnitSlider, NumberInput } from 'components/Inputs';
import { Modal } from 'components/Base';
import styles from './index.scss';

import { PATTERN_NAME } from 'utils/constants'

const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;

const RegistModal = props => {
  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [rootDisk, setRootDisk] = useState(10);
  const [ephemeralDisk, setEphemeralDisk] = useState(0);
  const [ephemeralDiskActive, setEphemeralDiskActive] = useState(false);

  const [vcpus, setVcpus] = useState(1);

  const [devices, setDevices] = useState([]);
  const [gpus, setGpus] = useState([]);
  const [extraSpecsFields, setExtraSpecsFields] = useState([]);
  const [ram, setRam] = useState(2);
  const [byteFlag, setByteFlag] = useState(true);

  const [regStep, setRegStep] = useState(1);
  const [submitButtonFlag, setSubmitButtonFlag] = useState(false);

  const [tab, setTab] = useState('GiB');
  const { TabPanel } = Tabs;

  useEffect(() => {
    const data = axios.get(`/edgetron/resources/kubevirt/host_devices`);
    const res = [];
    data.then(response => {
      if (response.data.host_devices) {
        for (let i = 0, n = response.data.host_devices.length; i < n; i += 1) {
          res.push({
            label: response.data.host_devices[i].name,
            value: response.data.host_devices[i].name,
          });
        }
        setDevices(res);
      }
    });
    //  setDevices([{ label: "device1", value: "device1" }, { label: "device2", value: "device2" }]);
  }, []);

  useEffect(() => {
    const data = axios.get(`/edgetron/resources/kubevirt/mediated_devices`);
    const res = [];
    data.then(response => {
      if (response.data.mediated_devices) {
        for (
          let i = 0, n = response.data.mediated_devices.length;
          i < n;
          i += 1
        ) {
          res.push({
            label: response.data.mediated_devices[i].resource_name,
            value: response.data.mediated_devices[i].resource_name,
          });
        }
        setGpus(res);
      }
    });
    // setGpus([{ label: "intel.com/x710", value: "intel.com/x710" }, { label: "intel.com/x880", value: "intel.com/x880" }]);
  }, []);

  useEffect(() => {
    const data = axios.get(`/edgetron/resources/kubevirt/extra_specs`);
    const res = [];
    data.then(response => {
      if (response.data.extra_specs) {
        for (let i = 0, n = response.data.extra_specs.length; i < n; i += 1) {
          res.push({
            key: response.data.extra_specs[i].name,
            description: response.data.extra_specs[i].description,
            value: false,
          });
        }
        setExtraSpecsFields(res);
      }
    });
    // setExtraSpecsFields([{ name: "hugepage", description: "ddeessccrriippttiioonn", checked: false }
    //     , { name: "etc", description: "eettccddeesscc", checked: false }]);
  }, []);

  // extrSpec check
  const handCheckExtrSpec = (i, e) => {
    const values = [...extraSpecsFields];
    values[i].value = e;
    setExtraSpecsFields(values);
  };

  //  cpu count
  const addVcpus = e => {
    e.preventDefault();
    setVcpus(vcpus + 1);
  };
  const minusVcpus = e => {
    e.preventDefault();
    if (vcpus > 0) {
      setVcpus(vcpus - 1);
    }
  };

  const [formDeviceFields, setFormDeviceFields] = useState([
    { name: t('RESOURCES_SELECT'), quantity: 0, message: '' },
  ]);

  //  hostDevice handler
  const handleHostDevice = {
    handleAddFields: () => {
      const values = [
        ...formDeviceFields,
        { name: t('RESOURCES_SELECT'), quantity: 0, message: '' },
      ];
      setFormDeviceFields(values);
    },

    handleRemoveFields: i => {
      const values = [...formDeviceFields].filter((obj, idx) => idx !== i);
      setFormDeviceFields(values);
    },

    handleSelectClick: (i, val) => {
      const values = [...formDeviceFields];

      if (
        !values.map(obj => obj.name).includes(val) ||
        values[i].name === val ||
        val === ''
      ) {
        values[i].name = val;
        values[i].message = '';
      } else {
        values[i].message = t('RESOURCES_ALREADY_SELECTED_DEVICE');
        setTimeout(() => {
          handleHostDevice.deleteMessage(i);
        }, 1000);
      }
      setFormDeviceFields(values);
    },

    deleteMessage: i => {
      const values = [...formDeviceFields];
      values[i].message = '';
      setFormDeviceFields(values);
    },

    addCnt: (i, val) => {
      const values = [...formDeviceFields];

      values[i].quantity = Number(val) + 1;
      setFormDeviceFields(values);
    },
    minusCnt: (i, val) => {
      const values = [...formDeviceFields];
      const numVal = Number(val);

      if (numVal > 0) {
        values[i].quantity = numVal - 1;
        setFormDeviceFields(values);
      }
    },
  }; // end hostDevice

  const [formGpuFields, setFormGpuFields] = useState([
    { name: t('RESOURCES_SELECT'), quantity: 0, message: '' },
  ]);
  // GPU handler
  const handleGpu = {
    handleAddFields: () => {
      const values = [
        ...formGpuFields,
        { name: t('RESOURCES_SELECT'), quantity: 0, message: '' },
      ];
      setFormGpuFields(values);
    },

    handleRemoveFields: i => {
      const values = [...formGpuFields].filter((obj, idx) => idx !== i);
      setFormGpuFields(values);
    },

    handleSelectClick: (i, val) => {
      const values = [...formGpuFields];

      if (
        !values.map(obj => obj.name).includes(val) ||
        values[i].name === val ||
        val === ''
      ) {
        values[i].name = val;
        values[i].message = '';
      } else {
        values[i].message = t('RESOURCES_ALREADY_SELECTED_GPU');
        setTimeout(() => {
          handleGpu.deleteMessage(i);
        }, 1000);
      }
      setFormGpuFields(values);
    },

    deleteMessage: i => {
      const values = [...formGpuFields];
      values[i].message = '';
      setFormGpuFields(values);
    },

    addCnt: (i, val) => {
      const values = [...formGpuFields];

      values[i].quantity = Number(val) + 1;
      setFormGpuFields(values);
    },
    minusCnt: (i, val) => {
      const values = [...formGpuFields];
      const numVal = Number(val);

      if (numVal > 0) {
        values[i].quantity = numVal - 1;
        setFormGpuFields(values);
      }
    },
  }; // end GPU

  // ram num check
  const changeRam = e => {
    const { value } = e.target;
    const onlyNumber = value.replace(/[^0-9]/g, '');
    setRam(Number(onlyNumber));
  };

  const handleByte = size => {
    if (size === 'MiB') {
      if (ram !== 0) {
        setRam(Math.round((ram / 1024 / 1024) * 1024 * 1024 * 1024));
      }
      setByteFlag(false);
    } else {
      if (ram !== 0) {
        setRam(Math.round((ram / 1024 / 1024 / 1024) * 1024 * 1024));
      }
      setByteFlag(true);
    }
  };

  const handleOk = () => {
    const onOk = props.onOk;
    const removeText = 'GiB';

    form.current.validator(() => {
      const { data } = form.current.props;
      data.vcpus = vcpus;
      data.ram = byteFlag ? ram * 1024 : ram;

      if (`${rootDisk}`.includes(removeText)) {
        const numRookDisk = rootDisk.substring(0, rootDisk.indexOf(removeText));
        const intRookDisk = parseInt(numRookDisk, 10);
        data.root_disk = intRookDisk;
      } else {
        data.root_disk = parseInt(rootDisk, 10);
      }

      if (`${ephemeralDisk}`.includes(removeText)) {
        const numEphemeralDisk = ephemeralDisk.substring(
          0,
          ephemeralDisk.indexOf(removeText)
        );
        const intEphemeralDisk = parseInt(numEphemeralDisk, 10);

        data.ephemeral_disk = intEphemeralDisk;
      } else {
        data.ephemeral_disk = parseInt(ephemeralDisk, 10);
      }

      data.extra_specs = [...extraSpecsFields].filter(
        obj => delete obj.description
      );
      data.devices = [...formDeviceFields].filter(
        obj =>
          delete obj.message && obj.name && obj.name !== t('RESOURCES_SELECT')
      );
      data.gpus = [...formGpuFields].filter(
        obj =>
          delete obj.message && obj.name && obj.name !== t('RESOURCES_SELECT')
      );
      onOk({ flavor: data });
    });
  };

  const stepMoveCheck = step => {
    const { data } = form.current.props;
    if (step === 1) {
      if (data.name === undefined || !regexName.test(data.name)) {
        handleOk();
      } else {
        setRegStep(2);
        setSubmitButtonFlag(false);
      }
    }
  };

  //  Validation 시작 ==================================================
  const nameValidator = (rule, value, callback) => {
    if (value === undefined) {
      return callback({ message: t('RESOURCES_NAME_EMPTY_DESC') });
    }
    if (!regexName.test(value)) {
      return callback({ message: t('RESOURCES_NAME_CHECK_DESC') });
    }

    callback();
  };

  const fnGetModalFooter = () => {
    let elements = '';
    elements = (
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
                stepMoveCheck(1);
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
                setRegStep(1);
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            {submitButtonFlag ? (
              <Button
                onClick={() => {
                  handleOk();
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
                  handleOk();
                }}
                className={classnames(styles['btn'], styles['btn-control'])}
              >
                {t('RESOURCES_CREATE')}
              </Button>
            )}
          </>
        )}
      </>
    );

    return elements;
  };

  const closeModal = () => {
    setModalView(false);
  };

  const handleEphemeralDiskActive = () => {
    if (ephemeralDiskActive) {
      setEphemeralDiskActive(false);
      setEphemeralDisk(0);
    } else {
      setEphemeralDiskActive(true);
    }
  };

  return (
    <>
      <Modal
        icon="pen"
        width={960}
        title={props.title}
        onOk={handleOk}
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
                    pattern: PATTERN_NAME,
                    message: t('INVALID_NAME_DESC'),
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

              <div style={{ padding: 10 }} />
              <Columns>
                <Column>
                  <Form.Item label={t('CPU')}>
                    <div>
                      <Button icon="substract" onClick={minusVcpus}></Button>
                      &nbsp;&nbsp;
                      <Input
                        name="vcpus"
                        value={vcpus}
                        style={{ width: '30%' }}
                      />
                      &nbsp;&nbsp;
                      <Button icon="add" onClick={addVcpus} />
                    </div>
                  </Form.Item>
                </Column>
                <Column>
                  <div>
                    <Input type="hidden" name="byteFlag" value={byteFlag} />
                    <Form.Item label={t('RESOURCES_MEMORY')}>
                      <div className={styles.divwrap}>
                        <div className={styles.div_left}>
                          <Input name="ram" value={ram} onChange={changeRam} />
                        </div>
                        <div className={styles.div_right}>
                          <Tabs
                            type="button"
                            activeName={tab}
                            onChange={newTab => {
                              setTab(newTab);
                              handleByte(newTab);
                            }}
                          >
                            <TabPanel label="GiB" name="GiB" />
                            <TabPanel label="MiB" name="MiB" />
                          </Tabs>
                        </div>
                      </div>
                    </Form.Item>
                  </div>
                </Column>
              </Columns>

              <Form.Item label={t('RESOURCES_ROOT_DISK')}>
                <Form.Group>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 20,
                    }}
                  >
                    <Input type="hidden" name="rootDisk" value={rootDisk} />
                    <Slider
                      max={320}
                      marks={{
                        0: '0',
                        10: '10',
                        20: '20',
                        40: '40',
                        80: '80',
                        160: '160',
                        320: '320',
                      }}
                      style={{ width: '10%' }}
                      value={rootDisk}
                      unit={'GiB'}
                      onChange={e => setRootDisk(e)}
                      withInput
                    />
                  </div>
                </Form.Group>
              </Form.Item>

              <Form.Item label={t('RESOURCES_TEMPORARY_DISK')}>
                <div className={styles.content_box_wrap}>
                  <div className={styles.content_box}>
                    <div className={styles.cont_box_wrap}>
                      <div className={styles.cont_box_section}>
                        <div className={styles.cont_box_wrap}>
                          <h6 className={styles.label}>
                            <div className={styles.form_check}>
                              <input type="checkbox" name="chk-0" id="chk-0" />
                              <label
                                htmlFor="chk-0"
                                onClick={() => handleEphemeralDiskActive()}
                              ></label>
                            </div>
                            <div className={styles.title}>
                              <p>{`임시디스크 지정`}</p>
                              <span>{`임시디스크를 설정합니다.`}</span>
                            </div>
                          </h6>
                          {ephemeralDiskActive && (
                            // <Form.Group>
                            <div className={`${styles.select_inner_content}`}>
                              <Slider
                                max={40}
                                marks={{
                                  0: '0',
                                  10: '10',
                                  20: '20',
                                  30: '30',
                                  40: '40',
                                }}
                                value={ephemeralDisk}
                                unit={'GiB'}
                                onChange={e => setEphemeralDisk(e)}
                                withInput
                                style={{ padding: '5px', marginLeft: '23px' }}
                              />
                            </div>
                            // </Form.Group>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Form.Item>

              <Form.Item
                className={styles.textarea}
                label={t('RESOURCES_DESCRIPTION')}
                desc={t('DESCRIPTION_DESC')}
              >
                <TextArea
                  name="description"
                  maxLength={256}
                  rows="1"
                  style={{ maxWidth: 'none' }}
                />
              </Form.Item>
            </div>

            <div className={`${regStep === 2 ? '' : 'hide'}`}>
              <Form.Item label={t('EXTRSPEC')}>
                <Form.Group>
                  <CheckboxGroup options={extraSpecsFields}>
                    {extraSpecsFields.map((v, i) => (
                      <>
                        <Input
                          type="hidden"
                          name={`extraSpecs.${i}.key`}
                          value={v.key}
                          key={i}
                        />
                        <Tooltip content={v.description} placement="top">
                          <Checkbox
                            checked={v.value}
                            name={`extraSpecs.${i}.value`}
                            value={v.value}
                            onChange={e => handCheckExtrSpec(i, e)}
                          >
                            {v.key}
                          </Checkbox>
                        </Tooltip>
                      </>
                    ))}
                  </CheckboxGroup>
                </Form.Group>
              </Form.Item>
              <Form.Item label={t('GPU')}>
                <Form.Group>
                  {formGpuFields.map((v, i) => (
                    <div className={styles.item} key={i}>
                      <Columns>
                        <Column>
                          <Form.Item>
                            <Select
                              value={v.message ? v.message : v.name}
                              options={gpus}
                              onChange={e => handleGpu.handleSelectClick(i, e)}
                            />
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item>
                            <div style={{ marginLeft: '45%' }}>
                              <Button
                                icon="substract"
                                onClick={() =>
                                  handleGpu.minusCnt(i, v.quantity)
                                }
                              ></Button>
                              &nbsp;&nbsp;
                              <Input
                                name={`gpus.${i}.quantity`}
                                value={v.quantity}
                                style={{ width: '30%' }}
                              />
                              &nbsp;&nbsp;
                              <Button
                                icon="add"
                                onClick={() => handleGpu.addCnt(i, v.quantity)}
                              />
                            </div>
                          </Form.Item>
                        </Column>
                      </Columns>
                      <Button
                        type="flat"
                        icon="trash"
                        className={styles.delete}
                        onClick={() => handleGpu.handleRemoveFields(i)}
                      />
                    </div>
                  ))}
                  <div className="text-right">
                    <Button
                      className={styles.add}
                      onClick={handleGpu.handleAddFields}
                    >
                      {t('RESOURCES_ADD')}
                    </Button>
                  </div>
                </Form.Group>
              </Form.Item>

              <Form.Item label={t('RESOURCES_HOST_DEVICE')}>
                <Form.Group>
                  {formDeviceFields.map((v, i) => (
                    <div className={styles.item} key={i}>
                      <Columns>
                        <Column>
                          <Form.Item>
                            <Select
                              value={v.message ? v.message : v.name}
                              options={devices}
                              onChange={e =>
                                handleHostDevice.handleSelectClick(i, e)
                              }
                            />
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item>
                            <div style={{ marginLeft: '45%' }}>
                              <Button
                                icon="substract"
                                onClick={() =>
                                  handleHostDevice.minusCnt(i, v.quantity)
                                }
                              ></Button>
                              &nbsp;&nbsp;
                              <Input
                                name={`devices.${i}.quantity`}
                                value={v.quantity}
                                style={{ width: '30%' }}
                              />
                              &nbsp;&nbsp;
                              <Button
                                icon="add"
                                onClick={() =>
                                  handleHostDevice.addCnt(i, v.quantity)
                                }
                              />
                            </div>
                          </Form.Item>
                        </Column>
                      </Columns>
                      <Button
                        type="flat"
                        icon="trash"
                        className={styles.delete}
                        onClick={() => handleHostDevice.handleRemoveFields(i)}
                      />
                    </div>
                  ))}
                  <div className="text-right">
                    <Button
                      className={styles.add}
                      onClick={handleHostDevice.handleAddFields}
                    >
                      {t('RESOURCES_ADD')}
                    </Button>
                  </div>
                </Form.Group>
              </Form.Item>
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
