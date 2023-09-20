import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Modal, TypeSelect } from 'components/Base'
import { UnitSlider, CardSelect, NumberInput } from 'components/Inputs'
import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox, Tabs, Icon, Slider } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import * as common from "utils/resources"

import classnames from 'classnames'
import styles from './index.scss'

import axios from "axios";
import VmStore from 'stores/resources/vms'
import ResourceStore from 'stores/resources/containerresource'

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
    const [elbSelect, setElbSelect] = useState('metalLB');
    const [expirationSelect, setExpirationSelect] = useState('10');
    const [ekgStack, setEkgStack] = useState('');

    const [cnis, setCnis] = useState([]);
    const [csis, setCsis] = useState([]);
    const [uis, setUis] = useState([]);

    const [networkFlag, setNetworkFlag] = useState(1);
    const [networkName, setNetworkName] = useState('');
    const [isElb, setIsElb] = useState(false);

    const [isAutoScale, setIsAutoScale] = useState(false);
    const [autoScale, setAutoScale] = useState([0, 1]);

    const [osType, setOsType] = useState('linux')

    useEffect(() => {
        
        const getVmCreateData = async () => {
            const listFlavor = await vmStore.fetchVmListFlavor();
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

        const uiData = axios.get(`/edgetron/resources/capk/metadata/uis`);
        let resUi = [];
        uiData.then(response => {
            if (response.data.uis) {
                for (let i = 0, n = response.data.uis.length; i < n; i += 1) {
                    resUi.push({
                        label: response.data.uis[i].name,
                        value: response.data.uis[i].name,
                        icon: response.data.uis[i].name.toLowerCase(),
                    });
                };
                setUis(resUi);
                setEkgStack(resUi[0]?.value);
            }
        });
    }, []);

    const osTypeOptions = [
        { label: 'Linux', value: 'linux', icon: 'linux', },
        { label: 'Windows', value: 'window', icon: 'windows', }
    ]

    const imageOptions = () => {
        const opt = imageOptionList.map((obj) => {
            const exceptonArray = ['ubuntu', 'centos']
            const distroType = exceptonArray.includes(obj.distro_type) ? obj.distro_type : "linux"

            return {
                label: t(obj.name),
                icon: distroType,
                value: t(obj.name),
            }

        })
        return opt
    }

    const flavorOptions = () => {
        const opt = flavorDataList.map((obj) => ({
            label: t(obj.name),
            description: `CPU ${obj.vcpus} Cores / Memory ${common.fnSetBytes(obj.ram)} Gib/ Disk ${obj.root_disk} Gib`,
            value: t(obj.name),
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

            const workerScaleRange = {};
            workerScaleRange.worker_min_replicas = autoScale[0];
            workerScaleRange.worker_max_replicas = autoScale[1];

            const { data } = form.current.props;

            data.external_network = networkCheckItems;
            data.sriov_network = sriovCheckItems;
            data.elb_network = elbCheckItems;
            data.elb_type = elbSelect;

            data.kube_image = imageSelect;
            data.master_flavor = masterFlavorSelect;
            data.worker_flavor = workerFlavorSelect;
            data.master_number = masterFlavorNumber;
            data.worker_number = workerFlavorNumber;
            data.worker_autoscale = isAutoScale;
            data.worker_scale_range = workerScaleRange;
            data.cni = cniSelect.toLowerCase();
            data.csi = csiSelect.toLowerCase();
            data.ui = ekgStack.toLowerCase();
            data.expiration = expirationSelect;
            data.private_registry = true;

            onOk({ ...data })
        })
    }

    const closeModal = () => {
        setModalView(false);
    }

    const stepMoveCheck = (step) => {
        const { data } = form.current.props;

        if (step == 1) {
            if (data.name == undefined || data.image == "선택" || data.masterFlavor == "선택" || data.workerFlavor == "선택") {
                handleOk();
            } else {
                setRegStep(2);
            }
        }

        if (step == 2) {
            if ((networkFlag === 1 && networkCheckItem == "") || (networkFlag === 2 && sriovCheckItem == "")) {
                handleOk();
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
                        <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])}>생성</Button>
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
    };

    const handleDelete = (name, type) => {
        setVariables[type](stateVariables[type].filter((el) => el !== name));
    };

    // 체크 리스트 끝 ==================================================


    // Validation 시작 ==================================================
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
        console.log(networkName)
        console.log(isElb)
        console.log(elbCheckItem)
        if (networkFlag == 1 && networkName == "") {
            return callback({ message: t('네트워크를 선택해 주세요.') })
        }
        if (networkFlag == 2 && networkName == "") {
            return callback({ message: t('SR-IOV 네트워크를 선택해 주세요.') })
        }
        callback()
    }
    // Validation 끝 ==================================================


    // 스크립트 시작 ==================================================
    const onChangeNetwork = (el) => {
        setNetworkFlag(el);
        setNetworkName("");
        if (networkFlag === 1) {
            handleSingleCheck("", "sriov");
        } else {
            handleSingleCheck("", "network");
        }
    }

    //cpu count
    const addBtn = (e) => {
        e.preventDefault();
        setWorkerFlavorNumber(workerFlavorNumber + 1);
    }
    const minusBtn = (e) => {
        e.preventDefault();
        if (workerFlavorNumber > 0) {
            setWorkerFlavorNumber(workerFlavorNumber - 1);
        }
    }

    const handlerAutoScale = (e) => {
        if (Array.isArray(e)) {
            setAutoScale(e)
        } else {
            const maxNum = e > 10 ? 10 : e;
            setAutoScale([0, maxNum]);
        }
    }

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
                                <div className={styles.situation}>{regStep == 1 ? "Current" : regStep > 1 ? "Done" : "To do"}</div>
                            </div>
                        </div>
                        <div className={classnames(styles.process_item, `${regStep == 2 ? styles.current : ''}`)}>
                            <div className={styles.status}>
                                <div className={`${regStep == 2 ? styles.current : regStep > 2 ? styles.done : styles.todo}`}></div>
                            </div>
                            <span className={styles.network}></span>
                            <div className={styles.title}>
                                <div className={styles.step_name}>네트워크 설정</div>
                                <div className={styles.situation}>{regStep == 2 ? "Current" : regStep > 2 ? "Done" : "To do"}</div>
                            </div>
                        </div>
                        <div className={classnames(styles.process_item, `${regStep == 3 ? styles.current : ''}`)}>
                            <div className={styles.status}>
                                <div className={`${regStep == 3 ? styles.current : regStep > 3 ? styles.done : styles.todo}`}></div>
                            </div>
                            <span className={styles.detail}></span>
                            <div className={styles.title}>
                                <div className={styles.step_name}>세부 설정</div>
                                <div className={styles.situation}>{regStep == 3 ? "Current" : regStep > 3 ? "Done" : "To do"}</div>
                            </div>
                        </div>
                        <div className={classnames(styles.process_item, `${regStep == 4 ? styles.current : ''}`)}>
                            <div className={styles.status}>
                                <div className={`${regStep == 4 ? styles.current : styles.todo}`} ></div>
                            </div>
                            <span className={styles.check}></span>
                            <div className={styles.title}>
                                <div className={styles.step_name}>입력 정보 확인</div>
                                <div className={styles.situation}>{regStep == 4 ? "Current" : "To do"}</div>
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
                                    rules={[{ required: true, message: t('이름를 입력해 주세요.') }]}
                                    desc={t('NAME_DESC')}
                                >
                                    <Input name="name" autoFocus={true} maxLength={63} style={{ maxWidth: 'none' }} />
                                </Form.Item>

                                <Form.Group>
                                    <Columns>
                                        <Column>
                                            <Form.Item
                                                label={t('OS 타입')}
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
                                                    onChange={(e) => setSelectImageName(e)}
                                                />
                                            </Form.Item>
                                            {
                                                selectImageName &&
                                                <Form.Item>
                                                    <Input
                                                        name="imageView"
                                                        defaultValue={osType + ' > ' + selectImageName}
                                                        readOnly
                                                        style={{ maxWidth: 'none' }}
                                                    />
                                                </Form.Item>
                                            }
                                        </Column>
                                    </Columns>
                                    </Form.Group>

                                <Form.Group>
                                <Columns>
                                    <Column>
                                        <Form.Item
                                            label={t('Master Flavor')}
                                            rules={[{ required: true, validator: masterFlavorValidator }]}
                                        >
                                            <TypeSelect
                                                name="masterFlavor"
                                                defaultValue={"선택"}
                                                options={flavorOptions()}
                                                placeholder={{ label: t('선택') }}
                                                onChange={(e) => setMasterFlavorSelect(e)}
                                            />
                                        </Form.Item>
                                    </Column>
                                    <Column>
                                        <Form.Item label={t('\r\n')}>
                                            <div>
                                                <br />
                                                <Select name="masterNumber"
                                                    options={[{ label: 1, value: 1 }, { label: 3, value: 3 }, { label: 5, value: 5 }]}
                                                    onChange={(e) => setMasterFlavorNumber(e)}
                                                    defaultValue={1} />
                                            </div>
                                        </Form.Item>
                                    </Column>
                                </Columns>
                                </Form.Group>
                                <Form.Group>
                                <Columns>
                                    <Column>
                                        <Form.Item
                                            label={t('Worker Flavor')}
                                            rules={[{ required: true, validator: workerFlavorValidator }]}
                                        >
                                            <TypeSelect
                                                name="workerFlavor"
                                                defaultValue={"선택"}
                                                options={flavorOptions()}
                                                placeholder={{ label: t('선택') }}
                                                onChange={(e) => setWorkerFlavorSelect(e)}
                                            />
                                        </Form.Item>
                                    </Column>
                                    <Column>
                                        <Form.Item label={t('\r\n')}>
                                            <div>
                                                <br />
                                                <Button icon="substract" onClick={minusBtn} />&nbsp;&nbsp;
                                                <Input name="workerNumber" value={workerFlavorNumber} style={{ width: '20%' }} />&nbsp;&nbsp;
                                                <Button icon="add" onClick={addBtn} />
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
                                        defaultValue=""
                                    />
                                </Form.Item>

                            </div>
                            {/* 기본설정 설정 끝==========================================*/}

                            {/* 네트워크 설정 시작==========================================*/}
                            <div className={`${regStep == 2 ? "" : "hide"}`}>
                                <Form.Group label={t('네트워크')} >
                                    <Form.Item>
                                        <div>
                                            <Select
                                                options={[{ label: "네트워크", value: 1 }, { label: "SR-IOV 네트워크", value: 2 }]}
                                                onChange={(e) => onChangeNetwork(e)}
                                                defaultValue={1} />
                                                &nbsp;네트워크 타입을 선택해주세요.
                                        </div>
                                    </Form.Item>

                                    <Form.Item label={t('네트워크')}
                                        className={`${networkFlag === 1 ? '' : 'hide'}`}
                                        rules={[{ required: true }]}>
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
                                                                    <Radio name={`select-${data.name}`}
                                                                        checked={data.name === networkCheckItem}
                                                                        onChange={(e) => { handleSingleCheck(data.name, "network"); setNetworkName(data.name); }} />
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
                                        rules={[{ required: true }]}>
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
                                                                        onChange={(e) => { handleSingleCheck(data.name, "sriov"); setNetworkName(data.name); }} />
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

                                    <Form.Item rules={[{ required: true, validator: networkValidator }]}>
                                        <Input type="hidden" name="networkName" value={networkName} />
                                    </Form.Item>
                                </Form.Group>

                                <Form.Group label={t('ELB (External Load Balancer)')} onChange={(e) => setIsElb(!isElb)} checkable>
                                    <Form.Item>
                                        <Select
                                            name="elbType"
                                            options={[{ label: "metalLB", value: "metalLB" }, { label: "pureLB", value: "pureLB" }]}
                                            onChange={(e) => setElbSelect(e)}
                                            defaultValue="metalLB" />
                                    </Form.Item>

                                    <Form.Item label={t('LB')}>
                                        <div className={styles.wrapper}>
                                            <div className={styles.table}>
                                                <table>
                                                    <colgroup>
                                                        <col width="5%" />
                                                        <col width="20%" />
                                                        <col width="20%" />
                                                        <col width="20%" />
                                                        <col width="20%" />
                                                        <col width="15%" />
                                                    </colgroup>
                                                    <thead>
                                                        <tr>
                                                            <th></th>
                                                            <th><strong>이름</strong></th>
                                                            <th><strong>네트워크 이름</strong></th>
                                                            <th><strong>멤버 IP</strong></th>
                                                            <th><strong>VIP</strong></th>
                                                            <th><strong>정책 개수</strong></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {!loadBalancerDataList?.length &&
                                                            <tr>
                                                                <td colSpan="6" className="no-data">
                                                                    <p>할당 가능한 자원이 없습니다.</p>
                                                                </td>
                                                            </tr>
                                                        }
                                                        {loadBalancerDataList?.map((data, key) => (
                                                            <tr key={data.name}>
                                                                <td>
                                                                    <Radio name={`select-${data.name}`} checked={data.name === elbCheckItem} onChange={() => handleSingleCheck(data.name, "elb")} />
                                                                </td>
                                                                <td><p>{data.name}</p></td>
                                                                <td><p>{data.network}</p></td>
                                                                <td>{data.members?.length && data.members?.map((el, i) => (<p key={i}>{el}</p>))}</td>
                                                                <td><p>{data.virtual_ip}</p></td>
                                                                <td><p>{data.rulesCount}</p></td>
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
                                        }} step={1} max={10} onChange={(e) => handlerAutoScale(e)} range withInput />
                                    </Form.Item>
                                </Form.Group>

                                <Form.Group label="Plug-in" checkable keepDataWhenUnCheck>
                                    <Columns>
                                        <Column>
                                            <Form.Item>
                                                <div>
                                                    CNI  (Container Network Interface)
                                                    <Select name="cni"
                                                        options={cnis}
                                                        defaultValue={"선택"}
                                                        onChange={(el) => setCniSelect(el)}
                                                        />
                                                </div>
                                            </Form.Item>
                                        </Column>
                                        <Column>
                                            <div>
                                                <Form.Item>
                                                    <div>
                                                        CSI  (Container Storage Interface)
                                                        <Select name="csi"
                                                            options={csis}
                                                            defaultValue={"선택"}
                                                            onChange={(el) => setCsiSelect(el)}
                                                            />
                                                    </div>
                                                </Form.Item>
                                            </div>
                                        </Column>
                                    </Columns>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Item label={t('EKG Stack')}>
                                        <CardSelect
                                            name="ekgStack"
                                            className={styles.customUl}
                                            onChange={(e) => setEkgStack(e)}
                                            options={uis}
                                            defaultValue={ekgStack}
                                        />
                                    </Form.Item>
                                </Form.Group>

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
                                                        CPU {masterFlavorCpu} Cores / Memory {masterFlavorMemory} Gib/ Disk {masterFlavorDisk} Gib
                                                    </p>
                                                </div>
                                                <label style={{ width: '100%' }}>Worker Flavor</label>
                                                <div className={styles.multiline}>
                                                    <div className={styles.bold}>{workerFlavorSelect}</div>
                                                    <p>
                                                        CPU {workerFlavorCpu} Cores / Memory {workerFlavorMemory} Gib/ Disk {workerFlavorDisk} Gib
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
                                        <label className={`${loadBalancerDataList.filter(x => elbCheckItem === x.name).length > 0 ? '' : 'hide'}`}>ELB</label>
                                        {loadBalancerDataList.filter(x => elbCheckItem === x.name).map((obj, index) => (
                                            <div className={styles.greybgbox} key={index}>
                                                <div className={styles.list} style={{ width: '16%' }}>
                                                    <label style={{ width: '100%' }}>네트워크 이름</label>
                                                    <div>{obj.network}</div>
                                                </div>
                                                <div className={styles.list} style={{ width: '16%' }}>
                                                    <label>타입</label>
                                                    <div>{elbSelect}</div>
                                                </div>
                                                <div className={styles.list} style={{ width: '16%' }}>
                                                    <label>ELB 이름</label>
                                                    <div>{obj.name}</div>
                                                </div>
                                                <div className={styles.list} style={{ width: '16%' }}>
                                                    <label>멤버IP</label>
                                                    <div className="multiline">
                                                        {obj.members?.map((el, i) => (
                                                            <div key={i}>{el}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className={styles.list} style={{ width: '16%' }}>
                                                    <label>VIP</label>
                                                    <div>{obj.virtual_ip}</div>
                                                </div>
                                                <div className={styles.list} style={{ width: '16%' }}>
                                                    <label>정책 개수</label>
                                                    <div>{obj.rulesCount}</div>
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
                                            <div className={styles.list}>
                                                <label>EKG Stack</label>
                                                <div>{ekgStack}</div>
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

