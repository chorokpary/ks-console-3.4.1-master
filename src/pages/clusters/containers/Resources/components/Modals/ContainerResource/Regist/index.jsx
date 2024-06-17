import { get } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Loading,
  Radio,
  Checkbox,
  Tabs,
  Icon,
  Slider,
} from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';
import classnames from 'classnames';
import axios from 'axios';

import { Modal } from 'components/Base';
import * as common from 'utils/resources';
import { PATTERN_USER_NAME } from 'utils/constants';
import VmStore from 'stores/resources/vms';
import ResourceStore from 'stores/resources/containerresource';
import TypeSelect from '../../../TypeSelect';
import CardSelect from '../../../CardSelect';
import styles from './index.scss';

const CONFIG_CPU_MASTER = 8;
const CONFIG_RAM_MASTER = 16;
const CONFIG_DISK_MASTER = 160;
const CONFIG_CPU_WORKER = 4;
const CONFIG_RAM_WORKER = 8;
const CONFIG_DISK_WORKER = 80;

const RegistModal = props => {
  const form = useRef();
  const [formData, setFormData] = useState({});

  const vmStore = new VmStore();
  const resourceStore = new ResourceStore();

  const [modelView, setModalView] = useState(true);
  const [regStep, setRegStep] = useState(1);

  const [flavorDataList, setFlavorDataList] = useState([]);
  const [imageDataList, setImageDataList] = useState([]);
  const [selectImageName, setSelectImageName] = useState();
  const [imageOptionList, setImageOptionList] = useState([]);
  const [networkDataList, setNetworkDataList] = useState([]);
  const [sriovNetworkDataList, setSriovNetworkDataList] = useState([]);
  const [loadBalancerDataList, setLoadBalancerDataList] = useState([]);

  const [clusterName, setClusterName] = useState('');
  const [imageName, setImageName] = useState('');
  const [description, setDescription] = useState('');
  const [masterFlavorSelect, setMasterFlavorSelect] = useState();
  const [masterFlavorCpu, setMasterFlavorCpu] = useState('');
  const [masterFlavorMemory, setMasterFlavorMemory] = useState('');
  const [masterFlavorDisk, setMasterFlavorDisk] = useState('');
  const [masterFlavorNumber, setMasterFlavorNumber] = useState(1);
  const [workerFlavorSelect, setWorkerFlavorSelect] = useState();
  const [workerFlavorCpu, setWorkerFlavorCpu] = useState('');
  const [workerFlavorMemory, setWorkerFlavorMemory] = useState('');
  const [workerFlavorDisk, setWorkerFlavorDisk] = useState('');
  const [workerFlavorNumber, setWorkerFlavorNumber] = useState(1);

  const [selectOsDistro, setSelectOsDistro] = useState('');
  const [cniSelect, setCniSelect] = useState('');
  const [csiSelect, setCsiSelect] = useState('');
  const [elbSelect, setElbSelect] = useState('');
  const [expirationSelect, setExpirationSelect] = useState('10');
  const [ekgStack, setEkgStack] = useState([]);

  // options
  const [cnis, setCnis] = useState([]);
  const [csis, setCsis] = useState([]);
  const [features, setFeatures] = useState([]);
  const [elbs, setElbs] = useState([]);

  const [networkFlag, setNetworkFlag] = useState(1);
  const [networkName, setNetworkName] = useState('');
  const [isElb, setIsElb] = useState(false);

  const [isAutoScale, setIsAutoScale] = useState(false);
  const [autoScale, setAutoScale] = useState([1, 3]);
  const [isFirst, setIsFirst] = useState(true);

  const [osType, setOsType] = useState('linux');

  const [submitButtonFlag, setSubmitButtonFlag] = useState(false);

  useEffect(() => {
    const getVmCreateData = async () => {
      const listFlavor = await vmStore.fetchVmListFlavor({
        sortBy: 'root_disk',
        ...props,
      });
      const listNetwork = await vmStore.fetchVmListNetwork({
        ...props,
        namespace: 'default',
      });
      const listSriovNetwork = await vmStore.fetchVmListSriovNetwork({
        ...props,
        namespace: 'default',
      });

      const listImage = await resourceStore.fetchListImage(props);
      const listLoadBalancer = await resourceStore.fetchListLoadBalancer(props);

      setFlavorDataList(listFlavor.flavors);
      setImageDataList(listImage._originData.images);
      setImageOptionList(listImage._originData.images);
      setNetworkDataList(listNetwork.networks);
      setSriovNetworkDataList(listSriovNetwork.networks);
      setLoadBalancerDataList(listLoadBalancer._originData.lbs);
    };

    getVmCreateData();
  }, []);

  useEffect(() => {
    const csiData = request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.cluster}/edgetron/resources/capk/metadata/csis`
    );
    const resCsi = [];
    csiData.then(response => {
      if (response.csis) {
        for (let i = 0, n = response.csis.length; i < n; i += 1) {
          resCsi.push({
            label: response.csis[i].name,
            value: response.csis[i].name,
            description: response.csis[i].description,
          });
        }
        setCsis(resCsi);
      }
    });

    const featureData = request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.cluster}/edgetron/resources/capk/metadata/features`
    );
    const resFeature = [
      {
        label: t('RESOURCES_SELECT_ALL'),
        value: 'all',
        icon: 'ico-etc-checkall',
      },
    ];
    featureData.then(response => {
      if (response.features) {
        for (let i = 0, n = response.features.length; i < n; i += 1) {
          resFeature.push({
            label: response.features[i].name,
            value: response.features[i].name,
            // icon: response.data.features[i].name.toLowerCase(),
            icon: `ico-etc-${response.features[i].name.toLowerCase()}`,
          });
        }
        setFeatures(resFeature);
      }
    });

    // hier
    const elbsData = request.get(
      `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.cluster}/edgetron/resources/capk/metadata/elbs`
    );
    const resElbs = [];
    elbsData.then(response => {
      response?.elbs.forEach(items => {
        resElbs.push({
          label: items.name,
          value: items.name,
        });
      });
      setElbs(resElbs);
      setElbSelect(resElbs[0].label);
    });
  }, []);

  useEffect(() => {
    if (selectImageName) {
      const selectOs = imageOptionList.find(
        obj => selectImageName === obj.name
      );
      setSelectOsDistro(selectOs?.os_distro);
    }
  }, [selectImageName]);

  useEffect(() => {
    if (selectOsDistro) {
      const cniData = request.get(
        `kapis/edgestack.kubesphere.io/v1alpha1/klusters/${props.cluster}/edgetron/resources/capk/metadata/cnis/${selectOsDistro}`
      );
      const resCni = [];
      cniData.then(response => {
        if (response.cnis) {
          for (let i = 0, n = response.cnis.length; i < n; i += 1) {
            resCni.push({
              label: response.cnis[i].name,
              value: response.cnis[i].name,
              description: response.cnis[i].description,
            });
          }
          setCnis(resCni);
        }
      });
    }
  }, [selectOsDistro]);

  useEffect(() => {
    if (cnis.length > 0) {
      setCniSelect(cnis[0].value);
      // document.querySelector(
      //   'input[name="cni"]',
      // ).parentElement.previousElementSibling.innerText = cnis[0].value;
    }
  }, [cnis]);

  const osTypeOptions = [
    { label: 'Linux', value: 'linux', icon: 'ico-linux' },
    { label: 'Windows', value: 'window', icon: 'ico-windows' },
  ];

  const imageOptions = () => {
    const opt = imageOptionList.map(obj => {
      // const exceptonArray = ['ubuntu', 'centos']
      // const distroType = exceptonArray.includes(obj.distro_type) ? obj.distro_type : "linux"
      const distroType = obj.os_distro.split('-')[0];
      return {
        label: t(obj.name),
        icon: `ico-os-${distroType}`,
        value: t(obj.name),
        description: t(obj.description),
        disabled: obj.phase !== 'Succeeded',
      };
    });
    return opt;
  };

  const flavorOptions = flag => {
    const opt = flavorDataList.map(obj => ({
      label: t(obj.name),
      description: `CPU ${obj.vcpus} Cores / Memory ${common.fnSetBytes(
        obj.ram
      )} Gib / Disk ${obj.root_disk} Gib`,
      value: t(obj.name),
      disabled:
        flag === 1
          ? obj.vcpus < CONFIG_CPU_MASTER ||
            common.fnSetBytes(obj.ram) < CONFIG_RAM_MASTER ||
            obj.root_disk < CONFIG_DISK_MASTER
          : obj.vcpus < CONFIG_CPU_WORKER ||
            common.fnSetBytes(obj.ram) < CONFIG_RAM_WORKER ||
            obj.root_disk < CONFIG_DISK_WORKER,
    }));
    return opt;
  };

  const expirationOption = [
    { label: `1${t('RESOURCES_YEAR')}`, value: 1 },
    { label: `2${t('RESOURCES_YEAR')}`, value: 2 },
    { label: `3${t('RESOURCES_YEAR')}`, value: 3 },
    { label: `4${t('RESOURCES_YEAR')}`, value: 4 },
    { label: `5${t('RESOURCES_YEAR')}`, value: 5 },
    { label: `6${t('RESOURCES_YEAR')}`, value: 6 },
    { label: `7${t('RESOURCES_YEAR')}`, value: 7 },
    { label: `8${t('RESOURCES_YEAR')}`, value: 8 },
    { label: `9${t('RESOURCES_YEAR')}`, value: 9 },
    { label: `10${t('RESOURCES_YEAR')}`, value: 10 },
  ];

  const handleOk = () => {
    const onOk = props.onOk;
    form.current.validator(() => {
      setSubmitButtonFlag(true);

      const workerScaleRange = {};
      workerScaleRange.worker_min_replicas = isAutoScale ? autoScale[0] : 0;
      workerScaleRange.worker_max_replicas = isAutoScale ? autoScale[1] : 0;

      const { data } = form.current.props;

      data.external_network = networkCheckItem;
      data.sriov_network = sriovCheckItem;
      data.elb_network = elbCheckItem;
      data.elb_type = elbSelect;

      data.master_number = masterFlavorNumber;
      data.worker_number = workerFlavorNumber;
      data.worker_autoscale = isAutoScale;
      data.worker_scale_range = workerScaleRange;
      if (cniSelect) {
        data.cni = cniSelect;
      }
      data.csi = csiSelect;
      data.features = ekgStack;
      data.expiration = expirationSelect;
      data.private_registry = tab === 'private';
      onOk({ ...data });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

  const stepMoveCheck = step => {
    const { data } = form.current.props;

    if (step == 1) {
      if (isFirst) {
        if (networkDataList.length > 0) {
          handleSingleCheck(
            networkDataList.filter(el => el.external)[0].id,
            'network'
          );
          setNetworkName(networkDataList.filter(el => el.external)[0].id);
        }
        setCniSelect(cnis?.[0]?.value || '');
        setCsiSelect(csis?.[0]?.value || '');
        setIsFirst(false);
      }

      if (
        data.name == undefined ||
        !PATTERN_USER_NAME.test(data.name) ||
        data.image == t('RESOURCES_SELECT') ||
        data.masterFlavor == t('RESOURCES_SELECT') ||
        data.workerFlavor == t('RESOURCES_SELECT')
      ) {
        handleOk();
      } else {
        setRegStep(2);
      }
    }

    if (step == 2) {
      if (!networkName) {
        return false;
      }
      setRegStep(3);
    }

    if (step == 3) {
      setClusterName(data.name);
      setImageName(data.image);
      setDescription(data.description);

      const masterFlavorData = flavorDataList.filter(
        obj => obj.name == data.masterFlavor
      );
      setMasterFlavorCpu(masterFlavorData[0].vcpus);
      setMasterFlavorMemory(common.fnSetBytes(masterFlavorData[0].ram));
      setMasterFlavorDisk(masterFlavorData[0].root_disk);

      const workerFlavorData = flavorDataList.filter(
        obj => obj.name == data.workerFlavor
      );
      setWorkerFlavorCpu(workerFlavorData[0].vcpus);
      setWorkerFlavorMemory(common.fnSetBytes(workerFlavorData[0].ram));
      setWorkerFlavorDisk(workerFlavorData[0].root_disk);

      setRegStep(4);
      setSubmitButtonFlag(false);
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
                setRegStep(regStep - 1);
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
                setRegStep(regStep - 1);
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(3);
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep == 4 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(3);
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
                loading={props.store.isSubmitting}
                disabled={props.store.isSubmitting}
              >
                {t('RESOURCES_CREATE')}
              </Button>
            ) : (
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
            )}
          </>
        )}
      </>
    );

    return elements;
  };

  const handleOsType = value => {
    setOsType(value);
    setSelectImageName('');
    if (value == 'window') {
      setImageOptionList(imageDataList.filter(obj => obj.os_type == 'window'));
    } else {
      setImageOptionList(imageDataList.filter(obj => obj.os_type != 'window'));
    }
  };

  // 체크 리스트 시작 ==================================================
  const [networkCheckItem, setNetworkCheckItem] = useState('');
  const [sriovCheckItem, setSriovCheckItem] = useState('');
  const [elbCheckItem, setElbCheckItem] = useState('');

  const dataListVariables = {
    network: networkDataList,
    sriov: sriovNetworkDataList,
    elb: loadBalancerDataList,
  };

  const stateVariables = {
    network: networkCheckItem,
    sriov: sriovCheckItem,
    elb: elbCheckItem,
  };

  const setVariables = {
    network: setNetworkCheckItem,
    sriov: setSriovCheckItem,
    elb: setElbCheckItem,
  };

  const handleSingleCheck = (name, type) => {
    setVariables[type](name);
    if (type !== 'elb') {
      setNetworkName(name);
    }
  };

  const handleDelete = (name, type) => {
    setVariables[type](stateVariables[type].filter(el => el !== name));
  };

  // 체크 리스트 끝 ==================================================

  // Validation 시작 ==================================================

  const imageValidator = (rule, value, callback) => {
    if (value == t('RESOURCES_SELECT') || value == 'select') {
      return callback({ message: t('RESOURCES_SELECT_IMAGE_TIP') });
    }
    callback();
  };

  const masterFlavorValidator = (rule, value, callback) => {
    if (value == t('RESOURCES_SELECT') || value == 'select') {
      return callback({ message: t('RESOURCES_SELECT_MASTER_FLAVOR_TIP') });
    }
    callback();
  };
  const workerFlavorValidator = (rule, value, callback) => {
    if (value == t('RESOURCES_SELECT') || value == 'select') {
      return callback({ message: t('RESOURCES_SELECT_WORKER_FLAVOR_TIP') });
    }
    callback();
  };

  const networkValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_SELECT_NETWORK_TIP') });
    }
    callback();
  };
  // Validation 끝 ==================================================

  // 스크립트 시작 ==================================================
  const onChangeNetwork = el => {
    setNetworkFlag(el);
    setNetworkName('');
    handleSingleCheck('', 'sriov');
    handleSingleCheck('', 'network');
  };

  // cpu count
  const addMasterBtn = e => {
    e.preventDefault();
    if (masterFlavorNumber < 5) {
      setMasterFlavorNumber(masterFlavorNumber + 2);
    }
  };
  const minusMasterBtn = e => {
    e.preventDefault();
    if (masterFlavorNumber > 1) {
      setMasterFlavorNumber(masterFlavorNumber - 2);
    }
  };
  const addWorkerBtn = e => {
    e.preventDefault();
    if (workerFlavorNumber < 10) {
      setWorkerFlavorNumber(workerFlavorNumber + 1);
    }
  };
  const minusWorkerBtn = e => {
    e.preventDefault();
    if (workerFlavorNumber > 1) {
      setWorkerFlavorNumber(workerFlavorNumber - 1);
    }
  };

  const handlerAutoScale = e => {
    if (Array.isArray(e)) {
      const scale = [e[0], e[1] < 1 ? 1 : e[1]];
      setAutoScale(scale);
    } else {
      const maxNum = e > 10 ? 10 : e < 1 ? 1 : e;
      setAutoScale([1, maxNum]);
    }
  };

  const handleEkgStack = e => {
    setEkgStack(e.filter(obj => obj !== 'all'));
  };

  const [tab, setTab] = useState('private');
  const { TabPanel } = Tabs;

  // 스크립트 끝 ==================================================

  return (
    <>
      <Modal
        icon="templet"
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
                `${regStep == 1 ? styles.current : ''}`
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
                `${regStep == 2 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${
                    regStep == 2
                      ? styles.current
                      : regStep > 2
                      ? styles.done
                      : styles.todo
                  }`}
                ></div>
              </div>
              <span className={styles.network}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_NETWORK_SETTINGS')}
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
                  className={`${
                    regStep == 3
                      ? styles.current
                      : regStep > 3
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
                  {regStep == 3
                    ? t('RESOURCES_CURRENT')
                    : regStep > 3
                    ? t('RESOURCES_COMPLETED_SETTINGS')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
            <div
              className={classnames(
                styles.process_item,
                `${regStep == 4 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep == 4 ? styles.current : styles.todo}`}
                ></div>
              </div>
              <span className={styles.check}></span>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_CHECK_INPUT_INFORMATION')}
                </div>
                <div className={styles.situation}>
                  {regStep == 4
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
                <Form.Item
                  label={t('NAME')}
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
                <div style={{ padding: 10 }} />
                {t('RESOURCES_IMAGE')}
                <span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
                      <Form.Item
                        rules={[
                          {
                            required: true,
                            message: t('RESOURCES_SELECT_OS_TIP'),
                          },
                        ]}
                      >
                        <CardSelect
                          className={styles.customUl}
                          onChange={e => handleOsType(e)}
                          name="os_type"
                          options={osTypeOptions}
                          defaultValue={osType}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item
                        rules={[{ required: true, validator: imageValidator }]}
                      >
                        <TypeSelect
                          name="image"
                          defaultValue={t('RESOURCES_SELECT')}
                          placeholder={{
                            label: t('RESOURCES_SELECT'),
                          }}
                          options={imageOptions()}
                          onChange={e => setSelectImageName(e)}
                          defaultDescription={t('RESOURCES_SELECT_IMAGE_TIP')}
                        />
                      </Form.Item>
                      {selectImageName && (
                        <Form.Item>
                          <div className={styles.wrapperImageView}>
                            {`${osType[0].toUpperCase() +
                              osType.slice(
                                1,
                                osType.length
                              )} > ${selectImageName}`}
                          </div>
                        </Form.Item>
                      )}
                    </Column>
                  </Columns>
                </Form.Group>
                Master Flavor<span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
                      <Form.Item
                        rules={[
                          { required: true, validator: masterFlavorValidator },
                        ]}
                      >
                        <TypeSelect
                          name="masterFlavor"
                          defaultValue={t('RESOURCES_SELECT')}
                          options={flavorOptions(1)}
                          placeholder={{ label: t('RESOURCES_SELECT') }}
                          onChange={e => setMasterFlavorSelect(e)}
                          defaultDescription={t(
                            'RESOURCES_SELECT_MASTER_FLAVOR_TIP'
                          )}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item desc={t('RESOURCES_MASTER_COUNT_MAX_DESC')}>
                        <div>
                          <Button icon="substract" onClick={minusMasterBtn} />
                          &nbsp;&nbsp;
                          <Input
                            name="masterNumber"
                            value={masterFlavorNumber}
                            style={{ width: '20%', textAlign: 'center' }}
                          />
                          &nbsp;&nbsp;
                          <Button icon="add" onClick={addMasterBtn} />
                        </div>
                      </Form.Item>
                    </Column>
                  </Columns>
                </Form.Group>
                Worker Flavor<span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
                      <Form.Item
                        rules={[
                          { required: true, validator: workerFlavorValidator },
                        ]}
                      >
                        <TypeSelect
                          name="workerFlavor"
                          defaultValue={t('RESOURCES_SELECT')}
                          options={flavorOptions(2)}
                          placeholder={{ label: t('RESOURCES_SELECT') }}
                          onChange={e => setWorkerFlavorSelect(e)}
                          defaultDescription={t(
                            'RESOURCES_SELECT_WORKER_FLAVOR_TIP'
                          )}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <Form.Item desc={t('RESOURCES_WORKER_MAX_COUNT_DESC')}>
                        <div>
                          <Button icon="substract" onClick={minusWorkerBtn} />
                          &nbsp;&nbsp;
                          <Input
                            name="workerNumber"
                            value={workerFlavorNumber}
                            style={{ width: '20%', textAlign: 'center' }}
                          />
                          &nbsp;&nbsp;
                          <Button icon="add" onClick={addWorkerBtn} />
                        </div>
                      </Form.Item>
                    </Column>
                  </Columns>
                </Form.Group>
                <Form.Item
                  className={styles.textarea}
                  label={t('RESOURCES_DESCRIPTION')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea name="description" maxLength={256} rows="1" />
                </Form.Item>
                <div style={{ padding: 25 }} />
              </div>
              {/* 기본설정 설정 끝========================================== */}

              {/* 네트워크 설정 시작========================================== */}
              <div className={`${regStep == 2 ? '' : 'hide'}`}>
                {t('RESOURCES_NETWORK')}
                <span className="form-item-required">*</span>
                <Form.Item>
                  <Form.Group>
                    <Form.Item>
                      <div>
                        <Select
                          options={[
                            { label: t('RESOURCES_NETWORK'), value: 1 },
                            { label: t('RESOURCES_SR_IOV_NETWORK'), value: 2 },
                          ]}
                          onChange={e => onChangeNetwork(e)}
                          defaultValue={1}
                        />
                      </div>
                    </Form.Item>

                    <Form.Item
                      label={t('RESOURCES_NETWORK')}
                      className={`${networkFlag === 1 ? '' : 'hide'}`}
                    >
                      <div className={styles.wrapper}>
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
                                <th></th>
                                <th>
                                  <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                                </th>
                                <th>
                                  <strong>
                                    {t('RESOURCES_NETWORK_TYPE_YOO')}
                                  </strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_DEFAULT_PATH')}</strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_CIDR')}</strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_GATEWAY')}</strong>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {!networkDataList?.filter(el => el.external)
                                .length && (
                                <tr>
                                  <td colSpan="6" className="no-data">
                                    <p>
                                      {t(
                                        'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                      )}
                                    </p>
                                  </td>
                                </tr>
                              )}
                              {networkDataList
                                ?.filter(el => el.external)
                                .map((data, key) => (
                                  <tr key={data.name}>
                                    <td>
                                      <Radio
                                        name={`select-${data.name}`}
                                        checked={data.id === networkCheckItem}
                                        onChange={e =>
                                          handleSingleCheck(data.id, 'network')
                                        }
                                      />
                                    </td>
                                    <td>{data.name}</td>
                                    <td>{data.type.toUpperCase()}</td>
                                    <td>
                                      {data.default_route
                                        ? t('RESOURCES_USE')
                                        : t('RESOURCES_NOT_USE')}
                                    </td>
                                    <td>{data.cidr}</td>
                                    <td>{data.gateway_ip}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Form.Item>

                    <Form.Item
                      label={t('RESOURCES_SR_IOV_NETWORK')}
                      className={`${networkFlag === 2 ? '' : 'hide'}`}
                    >
                      <div className={styles.wrapper}>
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
                                <th></th>
                                <th>
                                  <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                                </th>
                                <th>
                                  <strong>
                                    {t('RESOURCES_NETWORK_TYPE_YOO')}
                                  </strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_CIDR')}</strong>
                                </th>
                                <th>
                                  <strong>{t('RESOURCES_GATEWAY')}</strong>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {!sriovNetworkDataList?.length && (
                                <tr>
                                  <td colSpan="5" className="no-data">
                                    <p>
                                      {t(
                                        'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                      )}
                                    </p>
                                  </td>
                                </tr>
                              )}
                              {sriovNetworkDataList?.map((data, key) => (
                                <tr key={data.name}>
                                  <td>
                                    <Radio
                                      name={`select-${data.name}`}
                                      checked={data.name === sriovCheckItem}
                                      onChange={e =>
                                        handleSingleCheck(data.name, 'sriov')
                                      }
                                    />
                                  </td>
                                  <td>{data.name}</td>
                                  <td>{data.type.toUpperCase()}</td>
                                  <td>{data.cidr}</td>
                                  <td>{data.gateway_ip}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Form.Item>
                    <div
                      className={`form-item-error ${
                        !networkName ? '' : 'hide'
                      }`}
                    >
                      {t('RESOURCES_SELECT_NETWORK_TIP')}
                    </div>
                  </Form.Group>
                </Form.Item>

                <Form.Group
                  label={t('ELB (External Load Balancer)')}
                  onChange={e => {
                    setIsElb(!isElb);
                    handleSingleCheck('', 'elb');
                  }}
                  checkable
                >
                  <Form.Item>
                    <Select
                      name="elbs"
                      options={elbs}
                      onChange={e => setElbSelect(e)}
                      defaultValue={elbSelect}
                    />
                  </Form.Item>

                  <Form.Item label={t('RESOURCES_NETWORK')}>
                    <div className={styles.wrapper}>
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
                              <th></th>
                              <th>
                                <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                              </th>
                              <th>
                                <strong>
                                  {t('RESOURCES_NETWORK_TYPE_YOO')}
                                </strong>
                              </th>
                              <th>
                                <strong>{t('RESOURCES_DEFAULT_PATH')}</strong>
                              </th>
                              <th>
                                <strong>{t('RESOURCES_CIDR')}</strong>
                              </th>
                              <th>
                                <strong>{t('RESOURCES_GATEWAY')}</strong>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {!networkDataList?.filter(el => el.external)
                              .length && (
                              <tr>
                                <td colSpan="6" className="no-data">
                                  <p>
                                    {t(
                                      'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                    )}
                                  </p>
                                </td>
                              </tr>
                            )}
                            {networkDataList
                              ?.filter(el => el.external)
                              .map((data, key) => (
                                <tr key={data.name}>
                                  <td>
                                    <Radio
                                      name={`select-${data.name}`}
                                      checked={data.name === elbCheckItem}
                                      onChange={() =>
                                        handleSingleCheck(data.name, 'elb')
                                      }
                                    />
                                  </td>
                                  <td>{data.name}</td>
                                  <td>{data.type.toUpperCase()}</td>
                                  <td>
                                    {data.default_route
                                      ? t('RESOURCES_USE')
                                      : t('RESOURCES_NOT_USE')}
                                  </td>
                                  <td>{data.cidr}</td>
                                  <td>{data.gateway_ip}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Form.Item>
                </Form.Group>
              </div>
              {/* 네트워크 설정 끝========================================== */}

              {/* 세부 설정 시작========================================== */}
              <div className={`${regStep == 3 ? '' : 'hide'}`}>
                <Form.Group
                  label={t('RESOURCES_AUTO_EXPAND')}
                  onChange={e => setIsAutoScale(!isAutoScale)}
                  checkable
                >
                  <Form.Item label={t('RESOURCES_SCALING')}>
                    <Slider
                      max={10}
                      min={1}
                      marks={{
                        1: '1',
                        2: '2',
                        3: '3',
                        4: '4',
                        5: '5',
                        6: '6',
                        7: '7',
                        8: '8',
                        9: '9',
                        10: '10',
                      }}
                      step={1}
                      value={autoScale}
                      onChange={e => handlerAutoScale(e)}
                      range
                      withInput
                    />
                  </Form.Item>
                </Form.Group>

                {/* <Form.Group label="Plug-in" checkable keepDataWhenUnCheck>
                  <Columns>
                    <Column>
                      <Form.Item label={'CNI  (Container Network Interface)'}>
                        <Select
                          name="cni"
                          options={cnis}
                          onChange={el => setCniSelect(el)}
                          defaultValue={cniSelect}
                        />
                      </Form.Item>
                    </Column>
                    <Column>
                      <div>
                        <Form.Item label={'CSI  (Container Storage Interface)'}>
                          <Select
                            name="csi"
                            options={csis}
                            onChange={el => setCsiSelect(el)}
                            defaultValue={csiSelect}
                          />
                        </Form.Item>
                      </div>
                    </Column>
                  </Columns>
                </Form.Group> */}

                <Form.Group label="Plug-in" checkable keepDataWhenUnCheck>
                  <Form.Item label={t('RESOURCES_CNI_DESC')}>
                    <TypeSelect
                      name="cni"
                      defaultValue={cniSelect}
                      onChange={e => setCniSelect(e)}
                      placeholder={{ label: t('RESOURCES_SELECT') }}
                      defaultDescription={t('RESOURCES_SELECT_CNI')}
                      // {t(
                      //   'RESOURCES_CLUSTER_FAULT_MODAL_OPERATOR_DESC',
                      // )}
                      options={cnis}
                    />
                  </Form.Item>
                  <Form.Item label={t('RESOURCES_CSI_DESC')}>
                    <TypeSelect
                      name="csi"
                      defaultValue={csiSelect}
                      onChange={e => setCsiSelect(e)}
                      placeholder={{ label: t('RESOURCES_SELECT') }}
                      defaultDescription={t('RESOURCES_SELECT_CSI')}
                      // defaultDescription={t(
                      //   'RESOURCES_CLUSTER_FAULT_MODAL_OPERATOR_DESC',
                      // )}
                      options={csis}
                    />
                  </Form.Item>
                </Form.Group>

                <Form.Item label={t('RESOURCES_PETASUS_KUBERNETES_STACK')}>
                  <Form.Group>
                    <Form.Item>
                      <CardSelect
                        className={styles.customUl}
                        onChange={e => handleEkgStack(e)}
                        options={features}
                        value={ekgStack}
                        customSize={[`70%`, `15%`]}
                      />
                    </Form.Item>
                  </Form.Group>
                </Form.Item>

                <Form.Item label={t('RESOURCES_CONTAINER_IMAGE')}>
                  <Tabs
                    type="button"
                    activeName={tab}
                    onChange={newTab => setTab(newTab)}
                  >
                    <TabPanel label={t('RESOURCES_PRIVATE')} name="private" />
                    <TabPanel label={t('RESOURCES_PUBLIC')} name="public" />
                  </Tabs>
                </Form.Item>

                <Form.Item label={t('RESOURCES_CERTIFICATE_EXPIRATION_PERIOD')}>
                  <Select
                    name="expiration"
                    options={expirationOption}
                    defaultValue={10}
                    onChange={el => setExpirationSelect(el)}
                  />
                </Form.Item>
              </div>
              {/* 세부 설정 끝========================================== */}

              {/* 입력 정보 확인 시작========================================== */}
              <div className={`${regStep == 4 ? '' : 'hide'}`}>
                <div className={styles.boxwrap}>
                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.basic}></span>
                        <label>{t('RESOURCES_DEFAULT_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(1);
                        }}
                      ></Button>
                    </div>
                    <div className={styles.greybgbox}>
                      <div className={styles.list}>
                        <label>{t('RESOURCES_NAME')}</label>
                        <div className={styles.bold}>{clusterName}</div>
                      </div>
                      <div className={styles.list}>
                        <label>{t('RESOURCES_IMAGE')}</label>
                        <div className={styles.multiline}>
                          <Icon name="ubunt" size={40} />
                          <div className={styles.bold}>{imageName}</div>
                        </div>
                      </div>
                      <div className={styles.list}>
                        <label style={{ width: '100%' }}>Master Flavor</label>
                        <div className={styles.multiline}>
                          <div className={styles.bold}>
                            {masterFlavorSelect} / {masterFlavorNumber}
                          </div>
                          <p>
                            CPU {masterFlavorCpu} Cores / Memory{' '}
                            {masterFlavorMemory} Gib / Disk {masterFlavorDisk}{' '}
                            Gib
                          </p>
                        </div>
                        <label style={{ width: '100%' }}>Worker Flavor</label>
                        <div className={styles.multiline}>
                          <div className={styles.bold}>
                            {workerFlavorSelect} / {workerFlavorNumber}
                          </div>
                          <p>
                            CPU {workerFlavorCpu} Cores / Memory{' '}
                            {workerFlavorMemory} Gib / Disk {workerFlavorDisk}{' '}
                            Gib
                          </p>
                        </div>
                      </div>
                      <div className={styles.list}>
                        <label>{t('RESOURCES_DESCRIPTION')}</label>
                        <div>{description}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.network}></span>
                        <label>{t('RESOURCES_NETWORK_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(2);
                        }}
                      ></Button>
                    </div>
                    <label className={`${networkFlag === 1 ? '' : 'hide'}`}>
                      {t('RESOURCES_NETWORK')}
                    </label>
                    {networkDataList
                      .filter(x => networkCheckItem === x.id)
                      .map((obj, index) => (
                        <div className={styles.greybgbox} key={index}>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_NAME')}</label>
                            <div>{obj.name}</div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_TYPE_YOO')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.type}</div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_CIDR')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.cidr}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    <label className={`${networkFlag === 2 ? '' : 'hide'}`}>
                      {t('RESOURCES_SR_IOV_NETWORK')}
                    </label>
                    {sriovNetworkDataList
                      .filter(x => sriovCheckItem === x.name)
                      .map((obj, index) => (
                        <div className={styles.greybgbox} key={index}>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_NAME')}</label>
                            <div>{obj.name}</div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_TYPE_YOO')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.type}</div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_CIDR')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.cidr}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    <label
                      className={`${
                        networkDataList.filter(x => elbCheckItem === x.name)
                          .length > 0
                          ? ''
                          : 'hide'
                      }`}
                    >
                      ELB
                    </label>
                    {networkDataList
                      .filter(x => elbCheckItem === x.name)
                      .map((obj, index) => (
                        <div className={styles.greybgbox} key={index}>
                          <div className={styles.list} style={{ width: '15%' }}>
                            <label>{t('RESOURCES_TYPE')}</label>
                            <div>{elbSelect}</div>
                          </div>
                          <div className={styles.list} style={{ width: '20%' }}>
                            <label>{t('RESOURCES_NAME')}</label>
                            <div>{obj.name}</div>
                          </div>
                          <div className={styles.list} style={{ width: '15%' }}>
                            <label>{t('RESOURCES_TYPE_YOO')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.type}</div>
                            </div>
                          </div>
                          <div className={styles.list} style={{ width: '10%' }}>
                            <label>{t('RESOURCES_PATH')}</label>
                            <div className={styles.multiline}>
                              <div>
                                {obj.default_route
                                  ? t('RESOURCES_USE')
                                  : t('RESOURCES_NOT_USE')}
                              </div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_CIDR')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.cidr}</div>
                            </div>
                          </div>
                          <div className={styles.list}>
                            <label>{t('RESOURCES_GATEWAY')}</label>
                            <div className={styles.multiline}>
                              <div>{obj.gateway_ip}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className={styles.box_style}>
                    <div className={styles.boxtitle}>
                      <div className={styles.titlename}>
                        <span className={styles.detail}></span>
                        <label>{t('RESOURCES_DETAIL_SETTINGS')}</label>
                      </div>
                      <Button
                        icon="pen"
                        onClick={() => {
                          setRegStep(3);
                        }}
                      ></Button>
                    </div>
                    <div className={styles.greybgbox}>
                      <div className={styles.list}>
                        <label style={{ width: '100%' }}>
                          {t('RESOURCES_AUTO_EXPAND_SCALING')}
                        </label>
                        <div className="multiline">
                          <div>
                            {isAutoScale
                              ? t('RESOURCES_USE')
                              : t('RESOURCES_NOT_USE')}
                          </div>
                          <div className={`${isAutoScale ? '' : 'hide'}`}>
                            {t('RESOURCES_MIN')} : {autoScale[0]}
                          </div>
                          <div className={`${isAutoScale ? '' : 'hide'}`}>
                            {t('RESOURCES_MAX')} : {autoScale[1]}
                          </div>
                        </div>
                      </div>
                      <div className={styles.list}>
                        <label>{t('RESOURCES_PLUG_IN')}</label>
                        <div className="multiline">
                          <div>
                            {t('RESOURCES_CNI')}: {cniSelect}
                          </div>
                          <div>
                            {t('RESOURCES_CSI')}: {csiSelect}
                          </div>
                        </div>
                      </div>
                      <div className={styles.list} style={{ width: '100%' }}>
                        <label>{t('PETASUS_KUBERNETES_STACK_DESC')}</label>
                        <div className={styles.multiline}>
                          {ekgStack.map((obj, index) => (
                            <div key={index}>{obj}</div>
                          ))}
                        </div>
                      </div>
                      <div className={styles.list}>
                        <label style={{ width: '100%' }}>
                          {t('RESOURCES_CONTAINER_IMAGE')}
                        </label>
                        <div>
                          {tab == 'private'
                            ? t('RESOURCES_PRIVATE')
                            : t('RESOURCES_PUBLIC')}
                        </div>
                        <label style={{ width: '100%' }}>
                          {t('RESOURCES_CERTIFICATE_EXPIRATION_PERIOD')}
                        </label>
                        <div>
                          {expirationSelect}
                          {t('RESOURCES_YEAR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 입력 정보 확인 끝========================================== */}
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
