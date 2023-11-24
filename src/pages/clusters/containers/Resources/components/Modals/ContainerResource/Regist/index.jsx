import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Modal } from 'components/Base'

import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox, Tabs, Icon, Slider } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import * as common from "utils/resources"

import TypeSelect from '../../../TypeSelect'
import CardSelect from '../../../CardSelect'

import classnames from 'classnames'
import styles from './index.scss'

import axios from "axios";
import VmStore from 'stores/resources/vms'
import ResourceStore from 'stores/resources/containerresource'

const CONFIG_CPU_MASTER = 4;
const CONFIG_RAM_MASTER = 8;
const CONFIG_DISK_MASTER = 80;
const CONFIG_CPU_WORKER = 8;
const CONFIG_RAM_WORKER = 16;
const CONFIG_DISK_WORKER = 160;
const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;

const RegistModal = (props) => {

    const form = useRef();
    const [formData, setFormData] = useState({});

    const vmStore = new VmStore();
    const resourceStore = new ResourceStore();

    const [modelView, setModalView] = useState(true);
    const [regStep, setRegStep] = useState(1);

    const [flavorDataList, setFlavorDataList] = useState([]);
    const [imageDataList, setImageDataList] = useState([]);
    const [selectImageName, setSelectImageName] = useState()
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
    const [cniSelect, setCniSelect] = useState('');
    const [csiSelect, setCsiSelect] = useState('');
    const [elbSelect, setElbSelect] = useState('pureLB');
    const [expirationSelect, setExpirationSelect] = useState('10');
    const [ekgStack, setEkgStack] = useState([]);

    const [cnis, setCnis] = useState([]);
    const [csis, setCsis] = useState([]);
    const [features, setFeatures] = useState([]);

    const [networkFlag, setNetworkFlag] = useState(1);
    const [networkName, setNetworkName] = useState('');
    const [isElb, setIsElb] = useState(false);

    const [isAutoScale, setIsAutoScale] = useState(false);
    const [autoScale, setAutoScale] = useState([1, 4]);
    const [isFirst, setIsFirst] = useState(true);

    const [osType, setOsType] = useState('linux')

    const [submitButtonFlag, setSubmitButtonFlag] = useState(false);

    useEffect(() => {

        const getVmCreateData = async () => {
            const listFlavor = await vmStore.fetchVmListFlavor({ sortBy: 'root_disk' });
            const listNetwork = await vmStore.fetchVmListNetwork();
            const listSriovNetwork = await vmStore.fetchVmListSriovNetwork();

            const listImage = await resourceStore.fetchListImage();
            const listLoadBalancer = await resourceStore.fetchListLoadBalancer();

            setFlavorDataList(listFlavor.flavors);
            setImageDataList(listImage._originData.images);
            setImageOptionList(listImage._originData.images);
            setNetworkDataList(listNetwork.networks);
            setSriovNetworkDataList(listSriovNetwork.networks);
            setLoadBalancerDataList(listLoadBalancer._originData.lbs);
        };

        getVmCreateData();

    }, [])

    useEffect(() => {
        const cniData = axios.get(`/edgetron/resources/capk/metadata/cnis`);
        let resCni = [];
        cniData.then(response => {
            if (response.data.cnis) {
                for (let i = 0, n = response.data.cnis.length; i < n; i += 1) {
                    resCni.push({
                        label: response.data.cnis[i].name,
                        value: response.data.cnis[i].name,
                    });
                };
                setCnis(resCni);
            }
        });

        const csiData = axios.get(`/edgetron/resources/capk/metadata/csis`);
        let resCsi = [];
        csiData.then(response => {
            if (response.data.csis) {
                for (let i = 0, n = response.data.csis.length; i < n; i += 1) {
                    resCsi.push({
                        label: response.data.csis[i].name,
                        value: response.data.csis[i].name,
                    });
                };
                setCsis(resCsi);
            }
        });

        const featureData = axios.get(`/edgetron/resources/capk/metadata/features`);
        let resFeature = [{ label: '모두선택', value: 'all', icon: 'ico-etc-checkall' }];
        featureData.then(response => {
            if (response.data.features) {
                for (let i = 0, n = response.data.features.length; i < n; i += 1) {
                    resFeature.push({
                        label: response.data.features[i].name,
                        value: response.data.features[i].name,
                        //icon: response.data.features[i].name.toLowerCase(),
                        icon: 'ico-etc-' + response.data.features[i].name.toLowerCase(),
                    });
                };
                setFeatures(resFeature);
            }
        });
    }, []);

    const osTypeOptions = [
        { label: 'Linux', value: 'linux', icon: 'ico-linux', },
        { label: 'Windows', value: 'window', icon: 'ico-windows', }
    ]


    const imageOptions = () => {
        const opt = imageOptionList.map((obj) => {
            // const exceptonArray = ['ubuntu', 'centos']
            // const distroType = exceptonArray.includes(obj.distro_type) ? obj.distro_type : "linux"
            const distroType = (obj.image_detail.os_distro).split("-")[0]
            return {
                label: t(obj.name),
                icon: `ico-os-${distroType}`,
                value: t(obj.name),
                description: t(obj.image_detail.description),
            }
        })
        return opt
    }

    const flavorOptions = (flag) => {
        const opt = flavorDataList.map((obj) => ({
            label: t(obj.name),
            description: `CPU ${obj.vcpus} Cores / Memory ${common.fnSetBytes(obj.ram)} Gib / Disk ${obj.root_disk} Gib`,
            value: t(obj.name),
            disabled: flag === 1 ? (obj.vcpus < CONFIG_CPU_MASTER || common.fnSetBytes(obj.ram) < CONFIG_RAM_MASTER || obj.root_disk < CONFIG_DISK_MASTER)
                : (obj.vcpus < CONFIG_CPU_WORKER || common.fnSetBytes(obj.ram) < CONFIG_RAM_WORKER || obj.root_disk < CONFIG_DISK_WORKER)
        }))
        return opt
    }

    const expirationOption = [
        { label: "1년", value: 1 },
        { label: "2년", value: 2 },
        { label: "3년", value: 3 },
        { label: "4년", value: 4 },
        { label: "5년", value: 5 },
        { label: "6년", value: 6 },
        { label: "7년", value: 7 },
        { label: "8년", value: 8 },
        { label: "9년", value: 9 },
        { label: "10년", value: 10 }
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
            data.cni = cniSelect;
            data.csi = csiSelect;
            data.features = ekgStack;
            data.expiration = expirationSelect;
            data.private_registry = tab === 'private';

            onOk({ ...data })
        })
    }

    const closeModal = () => {
        setModalView(false);
    }

    const stepMoveCheck = (step) => {
        const { data } = form.current.props;

        if (step == 1) {

            if (isFirst) {
                if (networkDataList.length > 0) {
                    handleSingleCheck(networkDataList.filter((el) => el.external)[0].name, "network");
                    setNetworkName(networkDataList.filter((el) => el.external)[0].name);
                }
                setCniSelect(cnis[0].value);
                setCsiSelect(csis[0].value);
                setIsFirst(false)
            }

            if (data.name == undefined || !regexName.test(data.name) || data.image == "선택" || data.masterFlavor == "선택" || data.workerFlavor == "선택") {
                handleOk();
            } else {
                setRegStep(2);
            }
        }

        if (step == 2) {


            if (!networkName) {
                return false;
            } else {
                setRegStep(3);
            }
        }

        if (step == 3) {

            setClusterName(data.name);
            setImageName(data.image);
            setDescription(data.description)

            const masterFlavorData = flavorDataList.filter(obj => obj.name == data.masterFlavor)
            setMasterFlavorCpu(masterFlavorData[0].vcpus)
            setMasterFlavorMemory(common.fnSetBytes(masterFlavorData[0].ram))
            setMasterFlavorDisk(masterFlavorData[0].root_disk)

            const workerFlavorData = flavorDataList.filter(obj => obj.name == data.workerFlavor)
            setWorkerFlavorCpu(workerFlavorData[0].vcpus)
            setWorkerFlavorMemory(common.fnSetBytes(workerFlavorData[0].ram))
            setWorkerFlavorDisk(workerFlavorData[0].root_disk)

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
                        <Button type="control" onClick={() => { stepMoveCheck(2) }} className={classnames(styles['btn'], styles['btn-control'])}>다음</Button>
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
                            <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])}>생성</Button>
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
        } else {
            setImageOptionList(imageDataList.filter(obj => obj.os_type != 'window'))
        }
    }

    // 체크 리스트 시작 ==================================================
    const [networkCheckItem, setNetworkCheckItem] = useState("");
    const [sriovCheckItem, setSriovCheckItem] = useState("");
    const [elbCheckItem, setElbCheckItem] = useState("");

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
        if (type !== "elb") {
            setNetworkName(name);
        }
    };

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

    const masterFlavorValidator = (rule, value, callback) => {
        if (value == "선택" || value == "select") {
            return callback({ message: t('Master Flavor를 선택해 주세요.') })
        }
        callback()
    }
    const workerFlavorValidator = (rule, value, callback) => {
        if (value == "선택" || value == "select") {
            return callback({ message: t('Worker Flavor를 선택해 주세요.') })
        }
        callback()
    }

    const networkValidator = (rule, value, callback) => {
        if (!value) {
            return callback({ message: t('네트워크를 선택해 주세요.') })
        }
        callback()
    }
    // Validation 끝 ==================================================


    // 스크립트 시작 ==================================================
    const onChangeNetwork = (el) => {
        setNetworkFlag(el);
        setNetworkName('');
        handleSingleCheck('', "sriov");
        handleSingleCheck('', "network");
    }

    //cpu count
    const addMasterBtn = (e) => {
        e.preventDefault();
        if (masterFlavorNumber < 5) {
            setMasterFlavorNumber(masterFlavorNumber + 2);
        }
    }
    const minusMasterBtn = (e) => {
        e.preventDefault();
        if (masterFlavorNumber > 1) {
            setMasterFlavorNumber(masterFlavorNumber - 2);
        }
    }
    const addWorkerBtn = (e) => {
        e.preventDefault();
        if (workerFlavorNumber < 10) {
            setWorkerFlavorNumber(workerFlavorNumber + 1);
        }
    }
    const minusWorkerBtn = (e) => {
        e.preventDefault();
        if (workerFlavorNumber > 1) {
            setWorkerFlavorNumber(workerFlavorNumber - 1);
        }
    }

    const handlerAutoScale = (e) => {
        if (Array.isArray(e)) {
            const scale = [e[0], e[1] < 1 ? 1 : e[1]]
            setAutoScale(scale)
        } else {
            const maxNum = e > 10 ? 10 : (e < 1 ? 1 : e);
            setAutoScale([0, maxNum]);
        }
    }

    const handleEkgStack = (e => {
        setEkgStack(e.filter(obj => obj !== 'all'));
    })

    const [tab, setTab] = useState("private");
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
                                <div style={{ padding: 10 }} />


                                이미지<span className="form-item-required">*</span>
                                <Form.Group>
                                    <Columns>
                                        <Column>
                                            <Form.Item rules={[{ required: true, message: t('OS를 선택해주세요.') }]}>
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
                                            <Form.Item rules={[{ required: true, validator: imageValidator }]}>
                                                <TypeSelect
                                                    name="image"
                                                    defaultValue={"선택"}
                                                    placeholder={{
                                                        label: t('선택')
                                                    }}
                                                    options={imageOptions()}
                                                    onChange={(e) => setSelectImageName(e)}
                                                    defaultDescription={"이미지를 선택해 주세요."}
                                                />
                                            </Form.Item>
                                            {
                                                selectImageName &&
                                                <Form.Item>
                                                    <Input
                                                        name="imageView"
                                                        defaultValue={osType[0].toUpperCase() + osType.slice(1, osType.length) + ' > ' + selectImageName}
                                                        readOnly
                                                        style={{ maxWidth: 'none' }}
                                                    />
                                                </Form.Item>
                                            }
                                        </Column>
                                    </Columns>
                                </Form.Group>

                                Master Flavor<span className="form-item-required">*</span>
                                <Form.Group>
                                    <Columns>
                                        <Column>
                                            <Form.Item rules={[{ required: true, validator: masterFlavorValidator }]}>
                                                <TypeSelect
                                                    name="masterFlavor"
                                                    defaultValue={"선택"}
                                                    options={flavorOptions(1)}
                                                    placeholder={{ label: t('선택') }}
                                                    onChange={(e) => setMasterFlavorSelect(e)}
                                                    defaultDescription={"Master Flavor를 선택해 주세요."}
                                                />
                                            </Form.Item>
                                        </Column>
                                        <Column>
                                            <Form.Item desc={t('Master는 홀수 개이며 최대 개수는 5개 입니다.')}>
                                                <div>
                                                    <Button icon="substract" onClick={minusMasterBtn} />&nbsp;&nbsp;
                                                    <Input name="masterNumber" value={masterFlavorNumber} style={{ width: '20%', textAlign: "center" }} />&nbsp;&nbsp;
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
                                            <Form.Item rules={[{ required: true, validator: workerFlavorValidator }]}>
                                                <TypeSelect
                                                    name="workerFlavor"
                                                    defaultValue={"선택"}
                                                    options={flavorOptions(2)}
                                                    placeholder={{ label: t('선택') }}
                                                    onChange={(e) => setWorkerFlavorSelect(e)}
                                                    defaultDescription={"Worker Flavor를 선택해 주세요."}
                                                />
                                            </Form.Item>
                                        </Column>
                                        <Column>
                                            <Form.Item desc={t('Worker 최대 개수는 10개 입니다.')}>
                                                <div>
                                                    <Button icon="substract" onClick={minusWorkerBtn} />&nbsp;&nbsp;
                                                    <Input name="workerNumber" value={workerFlavorNumber} style={{ width: '20%', textAlign: "center" }} />&nbsp;&nbsp;
                                                    <Button icon="add" onClick={addWorkerBtn} />
                                                </div>
                                            </Form.Item>
                                        </Column>
                                    </Columns>
                                </Form.Group>

                                <Form.Item
                                    className={styles.textarea}
                                    label={t('설명')}
                                    desc={t('DESCRIPTION_DESC')}
                                >
                                    <TextArea
                                        name="description"
                                        maxLength={256}
                                        rows="1"
                                    />
                                </Form.Item>
                                <div style={{ padding: 25 }} />
                            </div>
                            {/* 기본설정 설정 끝==========================================*/}

                            {/* 네트워크 설정 시작==========================================*/}
                            <div className={`${regStep == 2 ? "" : "hide"}`}>
                                {t('네트워크')}<span className="form-item-required">*</span>
                                <Form.Item>
                                    <Form.Group>
                                        <Form.Item>
                                            <div>
                                                <Select
                                                    options={[{ label: "네트워크", value: 1 }, { label: "SR-IOV 네트워크", value: 2 }]}
                                                    onChange={(e) => onChangeNetwork(e)}
                                                    defaultValue={1} />
                                            </div>
                                        </Form.Item>

                                        <Form.Item label={t('네트워크')}
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
                                                                <th><strong>네트워크 이름</strong></th>
                                                                <th><strong>네트워크 유형</strong></th>
                                                                <th><strong>기본 경로</strong></th>
                                                                <th><strong>CIDR</strong></th>
                                                                <th><strong>게이트웨이</strong></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {!networkDataList?.filter((el) => el.external).length &&
                                                                <tr>
                                                                    <td colSpan="6" className="no-data">
                                                                        <p>할당 가능한 자원이 없습니다.</p>
                                                                    </td>
                                                                </tr>
                                                            }
                                                            {networkDataList?.filter((el) => el.external).map((data, key) => (
                                                                <tr key={data.name}>
                                                                    <td>
                                                                        <Radio name={`select-${data.name}`}
                                                                            checked={data.name === networkCheckItem}
                                                                            onChange={(e) => handleSingleCheck(data.name, "network")} />
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
                                                </div>
                                            </div>
                                        </Form.Item>

                                        <Form.Item label={t('SR-IOV 네트워크')}
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
                                                                        <Radio name={`select-${data.name}`}
                                                                            checked={data.name === sriovCheckItem}
                                                                            onChange={(e) => handleSingleCheck(data.name, "sriov")} />
                                                                    </td>
                                                                    <td>{data.name}</td>
                                                                    <td>{(data.type).toUpperCase()}</td>
                                                                    <td>{data.cidr}</td>
                                                                    <td>{data.gateway_ip}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </Form.Item>
                                        <div className={`form-item-error ${!networkName ? "" : "hide"}`}>네트워크를 선택해 주세요.</div>
                                    </Form.Group>
                                </Form.Item>

                                <Form.Group label={t('ELB (External Load Balancer)')} onChange={(e) => { setIsElb(!isElb); handleSingleCheck("", "elb"); }} checkable>
                                    <Form.Item>
                                        <Select
                                            options={[{ label: "metalLB", value: "metalLB" }, { label: "pureLB", value: "pureLB" }]}
                                            onChange={(e) => setElbSelect(e)}
                                            value={elbSelect}
                                        />
                                    </Form.Item>

                                    <Form.Item label={t('네트워크')}>
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
                                                            <th><strong>네트워크 이름</strong></th>
                                                            <th><strong>네트워크 유형</strong></th>
                                                            <th><strong>기본 경로</strong></th>
                                                            <th><strong>CIDR</strong></th>
                                                            <th><strong>게이트웨이</strong></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {!networkDataList?.filter((el) => el.external).length &&
                                                            <tr>
                                                                <td colSpan="6" className="no-data">
                                                                    <p>할당 가능한 자원이 없습니다.</p>
                                                                </td>
                                                            </tr>
                                                        }
                                                        {networkDataList?.filter((el) => el.external).map((data, key) => (
                                                            <tr key={data.name}>
                                                                <td>
                                                                    <Radio name={`select-${data.name}`}
                                                                        checked={data.name === elbCheckItem}
                                                                        onChange={() => handleSingleCheck(data.name, "elb")} />
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
                                            </div>
                                        </div>
                                    </Form.Item>
                                </Form.Group>

                            </div>
                            {/* 네트워크 설정 끝==========================================*/}

                            {/* 세부 설정 시작==========================================*/}
                            <div className={`${regStep == 3 ? "" : "hide"}`}>
                                <Form.Group label={t('자동확장')} onChange={(e) => setIsAutoScale(!isAutoScale)} checkable>
                                    <Form.Item label={t('스케일링')}>
                                        <Slider max={10} marks={{
                                            0: "0",
                                            1: "1",
                                            2: "2",
                                            3: "3",
                                            4: "4",
                                            5: "5",
                                            6: "6",
                                            7: "7",
                                            8: "8",
                                            9: "9",
                                            10: "10"
                                        }} step={1} Max={10} value={autoScale} onChange={(e) => handlerAutoScale(e)} range withInput />
                                    </Form.Item>
                                </Form.Group>

                                <Form.Group label="Plug-in" checkable keepDataWhenUnCheck>
                                    <Columns>
                                        <Column>
                                            <Form.Item label={"CNI  (Container Network Interface)"}>
                                                <Select name="cni"
                                                    options={cnis}
                                                    onChange={(el) => setCniSelect(el)}
                                                    defaultValue={cniSelect}
                                                />
                                            </Form.Item>
                                        </Column>
                                        <Column>
                                            <div>
                                                <Form.Item label={"CSI  (Container Storage Interface)"}>
                                                    <Select name="csi"
                                                        options={csis}
                                                        onChange={(el) => setCsiSelect(el)}
                                                        defaultValue={csiSelect}
                                                    />
                                                </Form.Item>
                                            </div>
                                        </Column>
                                    </Columns>
                                </Form.Group>

                                <Form.Item label={t('EKG Stack')}>
                                    <Form.Group>
                                        <Form.Item>
                                            <CardSelect
                                                className={styles.customUl}
                                                onChange={(e) => handleEkgStack(e)}
                                                options={features}
                                                value={ekgStack}
                                                customSize={[`70%`, `15%`]}
                                            />
                                        </Form.Item>
                                    </Form.Group>
                                </Form.Item>

                                <Form.Item label={t('컨테이너 이미지')}>
                                    <Tabs type="button" activeName={tab} onChange={newTab => setTab(newTab)}>
                                        <TabPanel label="프라이빗" name="private" />
                                        <TabPanel label="퍼블릭" name="public" />
                                    </Tabs>
                                </Form.Item>

                                <Form.Item label={t('인증서 유효기간')}>
                                    <Select name="expiration"
                                        options={expirationOption}
                                        defaultValue={10}
                                        onChange={(el) => setExpirationSelect(el)}
                                    />
                                </Form.Item>
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
                                                <div className={styles.bold}>{clusterName}</div>
                                            </div>
                                            <div className={styles.list}>
                                                <label>이미지</label>
                                                <div className={styles.multiline}>
                                                    <Icon name="ubunt" size={40} />
                                                    <div className={styles.bold}>{imageName}</div>
                                                </div>
                                            </div>
                                            <div className={styles.list}>
                                                <label style={{ width: '100%' }}>Master Flavor</label>
                                                <div className={styles.multiline}>
                                                    <div className={styles.bold}>{masterFlavorSelect}</div>
                                                    <p>
                                                        CPU {masterFlavorCpu} Cores / Memory {masterFlavorMemory} Gib / Disk {masterFlavorDisk} Gib
                                                    </p>
                                                </div>
                                                <label style={{ width: '100%' }}>Worker Flavor</label>
                                                <div className={styles.multiline}>
                                                    <div className={styles.bold}>{workerFlavorSelect}</div>
                                                    <p>
                                                        CPU {workerFlavorCpu} Cores / Memory {workerFlavorMemory} Gib / Disk {workerFlavorDisk} Gib
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
                                        <label className={`${networkFlag === 1 ? '' : 'hide'}`}>네트워크</label>
                                        {networkDataList.filter(x => networkCheckItem === x.name).map((obj, index) => (
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
                                        <label className={`${networkFlag === 2 ? '' : 'hide'}`}>SR-IOV 네트워크</label>
                                        {sriovNetworkDataList.filter(x => sriovCheckItem === x.name).map((obj, index) => (
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
                                        <label className={`${networkDataList.filter(x => elbCheckItem === x.name).length > 0 ? '' : 'hide'}`}>ELB</label>
                                        {networkDataList.filter(x => elbCheckItem === x.name).map((obj, index) => (
                                            <div className={styles.greybgbox} key={index}>
                                                <div className={styles.list} style={{ width: '15%' }}>
                                                    <label>타입</label>
                                                    <div>{elbSelect}</div>
                                                </div>
                                                <div className={styles.list} style={{ width: '20%' }}>
                                                    <label>이름</label>
                                                    <div>{obj.name}</div>
                                                </div>
                                                <div className={styles.list} style={{ width: '15%' }}>
                                                    <label>유형</label>
                                                    <div className={styles.multiline}>
                                                        <div>{obj.type}</div>
                                                    </div>
                                                </div>
                                                <div className={styles.list} style={{ width: '10%' }}>
                                                    <label>경로</label>
                                                    <div className={styles.multiline}>
                                                        <div>{obj.default_route ? "사용" : "미사용"}</div>
                                                    </div>
                                                </div>
                                                <div className={styles.list}>
                                                    <label>CIDR</label>
                                                    <div className={styles.multiline}>
                                                        <div>{obj.cidr}</div>
                                                    </div>
                                                </div>
                                                <div className={styles.list}>
                                                    <label>게이트웨이</label>
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
                                                <label>세부 설정</label>
                                            </div>
                                            <Button icon="pen" onClick={() => { setRegStep(3) }}></Button>
                                        </div>
                                        <div className={styles.greybgbox}>
                                            <div className={styles.list}>
                                                <label style={{ width: '100%' }}>자동확장 스케일링</label>
                                                <div className="multiline">
                                                    <div>{isAutoScale ? '사용' : '미사용'}</div>
                                                    <div className={`${isAutoScale ? '' : 'hide'}`}>Min : {autoScale[0]}</div>
                                                    <div className={`${isAutoScale ? '' : 'hide'}`}>Max : {autoScale[1]}</div>
                                                </div>
                                            </div>
                                            <div className={styles.list}>
                                                <label>Plug-in</label>
                                                <div className="multiline">
                                                    <div>CNI: {cniSelect}</div>
                                                    <div>CSI: {csiSelect}</div>
                                                </div>
                                            </div>
                                            <div className={styles.list} style={{ width: '100%' }}>
                                                <label>EKG Stack</label>
                                                <div className={styles.multiline}>
                                                    {ekgStack.map((obj, index) => (
                                                        <div key={index}>{obj}</div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className={styles.list}>
                                                <label style={{ width: '100%' }}>인증서 유효기간</label>
                                                <div>{expirationSelect}년</div>
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

