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

import { UnitSlider } from 'components/Inputs';
import { Modal } from 'components/Base';
import FlavorStore from 'stores/resources/flavors';
import { PATTERN_USER_NAME } from 'utils/constants';
import { range } from 'lodash';
import styles from './index.scss';

const regexNum = /^[1-9]\d*GiB?|[1-9]\d*$/;
const regexRootDisk = /^[1-9]\d*GiB?|[1-9]\d*$/;
const RegistModal = props => {
  const store = new FlavorStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [rootDisk, setRootDisk] = useState('10GiB');
  const [ephemeralDisk, setEphemeralDisk] = useState('0GiB');
  const [ephemeralDiskActive, setEphemeralDiskActive] = useState(false);

  const [vcpus, setVcpus] = useState(1);

  const [hostDevices, setHostDevices] = useState();
  const [gpus, setGpus] = useState();
  const [extraSpecsFields, setExtraSpecsFields] = useState();
  const [ram, setRam] = useState(2);
  const [byteFlag, setByteFlag] = useState(true);

  const [regStep, setRegStep] = useState(1);
  const [submitButtonFlag, setSubmitButtonFlag] = useState(false);

  const [tab, setTab] = useState('GiB');
  const { TabPanel } = Tabs;

  useEffect(() => {
    const useEffectFunction = async () => {
      // hostDevices
      // hostDevices 에서 GPU 사용하면 host device에서 사라지고 GPU 목록에만 나와야함
      // setGpus
      const listHostDevices = await store.fetchFlavorHostDevices(props.cluster);
      const responseHostDevices = listHostDevices?.host_devices;

      const resHostDevices = [];
      const resHostDevicesGpu = [];
      responseHostDevices?.forEach(items => {
        if (items.is_gpu) {
          resHostDevicesGpu.push({
            label: items.name,
            value: items.name,
          });
        } else {
          resHostDevices.push({
            label: items.name,
            value: items.name,
          });
        }
      });
      setHostDevices(resHostDevices);
      setGpus(resHostDevicesGpu);

      // extraSpecs
      const extraSpecs = await store.fetchFlavorExtraSpecs(props.cluster);
      const responseExtraSpecs = extraSpecs?.extra_specs;

      const resExtraSpecs = [];
      responseExtraSpecs?.forEach(items => {
        resExtraSpecs.push({
          key: items.name,
          description: items.description,
          value: false,
        });
      });

      setExtraSpecsFields(resExtraSpecs);
    };
    useEffectFunction();
  }, []);

  const handCheckExtrSpec = (i, isChecked) => {
    const updatedExtraSpecs = extraSpecsFields.map((item, index) => {
      if (index === i) {
        return { ...item, value: isChecked };
      }
      return item;
    });

    setExtraSpecsFields(updatedExtraSpecs);
  };

  //  cpu count
  const addVcpus = e => {
    e.preventDefault();
    setVcpus(vcpus + 1);
    const { data } = form.current.props;
    data.vcpus = vcpus + 1;
  };
  const minusVcpus = e => {
    e.preventDefault();
    if (vcpus > 0) {
      setVcpus(vcpus - 1);
      const { data } = form.current.props;
      data.vcpus = vcpus - 1;
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
        !values?.map(obj => obj.name).includes(val) ||
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
        !values?.map(obj => obj.name).includes(val) ||
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
    // const { value } = e.target;
    const onlyNumber = e.replace(/[^0-9]/g, '');
    setRam(Number(onlyNumber));
  };

  const handleByte = size => {
    const { data } = form.current.props;

    if (ram !== 0) {
      if (size === 'MiB') {
        const num = Math.round(ram * 1024);
        data.ram = num;
        setRam(num);
        setByteFlag(false);
      } else {
        const num = Math.round(ram / 1024);
        data.ram = num;
        setRam(num);
        setByteFlag(true);
      }
    }
  };

  const handleOk = () => {
    const onOk = props.onOk;
    const removeText = 'GiB';

    form.current.validator(() => {
      const { data } = form.current.props;
      data.vcpus = vcpus;
      data.ram = byteFlag ? ram * 1024 : ram;

      data.root_disk = Number(
        rootDisk.substring(0, rootDisk.indexOf(removeText))
      );
      data.ephemeral_disk = Number(
        ephemeralDisk.substring(0, ephemeralDisk.indexOf(removeText))
      );

      data.extra_specs = [...extraSpecsFields]
        .filter(obj => obj.value === true)
        .map(({ key, value }) => ({ key, value }));

      data.devices = [...formDeviceFields].filter(
        obj =>
          delete obj.message && obj.name && obj.name !== t('RESOURCES_SELECT')
      );
      data.gpus = [...formGpuFields].filter(
        obj =>
          delete obj.message && obj.name && obj.name !== t('RESOURCES_SELECT')
      );
      // console.log(data)
      onOk({ flavor: data });
    });
  };

  const stepMoveCheck = step => {
    const { data } = form.current.props;
    if (step === 1) {
      if (
        data.name === undefined ||
        !PATTERN_USER_NAME.test(data.name) ||
        data.vcpus === undefined ||
        !regexNum.test(data.vcpus) ||
        data.ram === undefined ||
        !regexNum.test(data.ram) ||
        data.root_disk === undefined ||
        !regexRootDisk.test(data.root_disk)
      ) {
        handleOk();
      } else {
        setRegStep(2);
        setSubmitButtonFlag(false);
      }
    }
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
                  className={`${regStep === 1
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
                  className={`${regStep === 2
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
                  {
                    required: true,
                    message: t('NAME_EMPTY_DESC'),
                  },
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
              <div style={{ padding: 10 }} />
              <Columns>
                <Column>
                  <label className="form-item-label" htmlFor="name">
                    {t('CPU')}
                    <span className="form-item-required">*</span>
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      icon="substract"
                      onClick={e => minusVcpus(e)}
                    ></Button>
                    &nbsp;&nbsp;
                    <Form.Item
                      style={{ maxWidth: '137px' }}
                      rules={[
                        {
                          required: true,
                          message: t('ROSOURCES_CPU_VALID'),
                        },
                        {
                          pattern: regexNum,
                          message: t('ROSOURCES_CPU_NUM_VALID'),
                        },
                      ]}
                    >
                      <Input
                        name="vcpus"
                        defaultValue={vcpus}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    &nbsp;&nbsp;
                    <Button icon="add" onClick={e => addVcpus(e)} />
                  </div>
                </Column>
                <Column>
                  <div>
                    <Input type="hidden" name="byteFlag" value={byteFlag} />
                    <label className="form-item-label" htmlFor="name">
                      {t('RESOURCES_MEMORY')}
                      <span className="form-item-required">*</span>
                    </label>
                    <div className={styles.divwrap}>
                      <div className={styles.div_left}>
                        <Form.Item
                          rules={[
                            {
                              required: true,
                              message: t('ROSOURCES_CPU_VALID'),
                            },
                            {
                              pattern: regexNum,
                              message: t('ROSOURCES_CPU_NUM_VALID'),
                            },
                          ]}
                        >
                          <Input
                            name="ram"
                            defaultValue={ram}
                            onChange={e => changeRam(e)}
                          />
                        </Form.Item>
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
                  </div>
                </Column>
              </Columns>
              <label className="form-item-label" htmlFor="name">
                {t('RESOURCES_ROOT_DISK')}
                <span className="form-item-required">*</span>
              </label>
              <Form.Group>
                <Form.Item
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
                    name="root_disk"
                    max={128}
                    min={0}
                    marks={getMarks(128)}
                    defaultValue={rootDisk}
                    unit={'GiB'}
                    withInput
                    onChange={e => setRootDisk(e)}
                    style={{ padding: '5px', width: '10%' }}
                  />
                </Form.Item>
              </Form.Group>

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
                              <p>{t('RESOURCES_TEMPORARY_DISK')}</p>
                              <span>{t('RESOURCES_TEMPORARY_DISK_DESC')}</span>
                            </div>
                          </h6>
                          {ephemeralDiskActive && (
                            <div className={`${styles.select_inner_content}`}>
                              <UnitSlider
                                max={40}
                                min={0}
                                marks={getMarks(40)}
                                defaultValue={ephemeralDisk}
                                unit={'GiB'}
                                withInput
                                onChange={e => setEphemeralDisk(e)}
                                style={{ padding: '5px', marginLeft: '10px' }}
                              />
                            </div>
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
                    {extraSpecsFields?.map((v, i) => (
                      <React.Fragment key={`extra-specs-${i}`}>
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
                      </React.Fragment>
                    ))}
                  </CheckboxGroup>
                </Form.Group>
              </Form.Item>

              <Form.Item label={t('GPU')}>
                <Form.Group>
                  {formGpuFields?.map((v, i) => (
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
                            <div
                              style={{
                                marginLeft: '45%',
                              }}
                            >
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
                                style={{
                                  width: '30%',
                                }}
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
                  {formDeviceFields?.map((v, i) => (
                    <div className={styles.item} key={i}>
                      <Columns>
                        <Column>
                          <Form.Item>
                            <Select
                              value={v.message ? v.message : v.name}
                              options={hostDevices}
                              onChange={e =>
                                handleHostDevice.handleSelectClick(i, e)
                              }
                            />
                          </Form.Item>
                        </Column>
                        <Column>
                          <Form.Item>
                            <div
                              style={{
                                marginLeft: '45%',
                              }}
                            >
                              <Button
                                icon="substract"
                                onClick={() =>
                                  handleHostDevice.minusCnt(i, v.quantity)
                                }
                              ></Button>
                              &nbsp;&nbsp;
                              <Input
                                name={`hostDevices.${i}.quantity`}
                                value={v.quantity}
                                style={{
                                  width: '30%',
                                }}
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
