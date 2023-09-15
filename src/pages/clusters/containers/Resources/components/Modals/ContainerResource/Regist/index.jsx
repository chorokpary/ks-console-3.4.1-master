import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Modal, TypeSelect } from 'components/Base'
import { UnitSlider, CardSelect, NumberInput } from 'components/Inputs'
import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox, InputPassword, Notify, Tabs, Icon } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import * as common from "utils/resources"

import classnames from 'classnames'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'

const RegistModal = (props) => {

    const form = useRef();
    const [formData, setFormData] = useState({});

    const vmStore = new VmStore();

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
    const [masterFlavorSelect, setMasterFlavorSelect] = useState('select');
    const [masterFlavorCpu, setMasterFlavorCpu] = useState('');
    const [masterFlavorMemory, setMasterFlavorMemory] = useState('');
    const [masterFlavorDisk, setMasterFlavorDisk] = useState('');
    const [masterFlavorSelectCnt, setMasterFlavorSelectCnt] = useState(1);
    const [workerFlavorSelect, setWorkerFlavorSelect] = useState('select');
    const [workerFlavorCpu, setWorkerFlavorCpu] = useState('');
    const [workerFlavorMemory, setWorkerFlavorMemory] = useState('');
    const [workerFlavorDisk, setWorkerFlavorDisk] = useState('');
    const [workerFlavorSelectCnt, setWorkerFlavorSelectCnt] = useState(1);
    const [cniSelect, setCniSelect] = useState('');
    const [csiSelect, setCsiSelect] = useState('');
    const [imageSelect, setImageSelect] = useState();
    const [networkSelect, setNetworkSelect] = useState('네트워크');
    const [elbSelect, setElbSelect] = useState('metalLB');
    const [expirationSelect, setExpirationSelect] = useState('10');
    const [ekgStack, setEkgStack] = useState('');

    const [isElb, setIsElb] = useState(false);

    const [isAutoScale, setIsAutoScale] = useState(false);
    const [autoScale, setAutoScale] = useState([0, 0]);
    const [autoScaleRange, setAutoScaleRange] = useState(0);

    const [osType, setOsType] = useState('linux')

    useEffect(() => {


        const getVmCreateData = async () => {
            const listFlavor = await vmStore.fetchVmListFlavor();
            const listImage = await vmStore.fetchVmListImage();
            const listNetwork = await vmStore.fetchVmListNetwork();
            const listSriovNetwork = await vmStore.fetchVmListSriovNetwork();

            setFlavorDataList(listFlavor.flavors);
            setImageDataList(listImage.images);
            setImageOptionList(listImage.images);
            setNetworkDataList(listNetwork.networks);
            setSriovNetworkDataList(listSriovNetwork.networks);
        };

        getVmCreateData();

    }, [])

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
            description: `CPU ${obj.vcpus} Cores / Memory ${common.fnSetBytes(obj.ram)} / Disk ${obj.root_disk} GiB`,
            value: t(obj.name),
        }))
        return opt
    }

    const expirationOption = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const handleOk = () => {
        
        const onOk = props.onOk;
        form.current.validator(() => {

            const { data } = form.current.props;

            data.network = networkCheckItems;
            data.sriov = sriovCheckItems;


            onOk({ ...data })
        })
    }

    const closeModal = () => {
        setModalView(false);
    }

    const stepMoveCheck = (step) => {
        const { data } = form.current.props;

        if (step == 1) {
            if (data.name == undefined || data.image == "선택" || data.flavor == "선택") {
                handleOk();
            } else if (data.name == undefined || data.bootvolume == "선택" || data.flavor == "선택") {
                handleOk();
            } else {
                setRegStep(2);
            }
        }
        if (step == 3) {
            setClusterName(data.name);
            setImageName(data.image);
            setMasterFlavorName(data.flavor);
            setDescription(data.description)

            const flavorData = flavorDataList.filter(obj => obj.name == data.flavor)
            setMasterFlavorCpu(flavorData[0].vcpus)
            setMasterFlavorMemory(common.fnSetBytes(flavorData[0].ram))
            setMasterFlavorDisk(flavorData[0].root_disk)

            setRegStep(4);
        }
    }

    const fnGetModalFooter = () => {
        let elements = "";
        elements =
            <>
                {regStep == 1 &&
                    <>
                        <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-cancel'])}>취소</Button>
                        <Button type="control" onClick={() => { stepMoveCheck(1) }} className={classnames(styles['btn'], styles['btn-control'])}>다음</Button>
                    </>
                }
                {(regStep == 2) &&
                    <>
                        <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-cancel'])}>취소</Button>
                        <Button onClick={() => { setRegStep(regStep - 1) }} className={classnames(styles['btn'], styles['btn-default'])}>이전</Button>
                        <Button type="control" onClick={() => { setRegStep(regStep + 1) }} className={classnames(styles['btn'], styles['btn-control'])}>다음</Button>
                    </>
                }
                {(regStep == 3) &&
                    <>
                        <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-cancel'])}>취소</Button>
                        <Button onClick={() => { setRegStep(regStep - 1) }} className={classnames(styles['btn'], styles['btn-default'])}>이전</Button>
                        <Button type="control" onClick={() => { stepMoveCheck(3) }} className={classnames(styles['btn'], styles['btn-control'])}>다음</Button>
                    </>
                }
                {regStep == 4 &&
                    <>
                        <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-cancel'])}>취소</Button>
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
    const [networkCheckItems, setNetworkCheckItems] = useState("");
    const [sriovCheckItems, setSriovCheckItems] = useState("");
    const [elbCheckItems, setElbCheckItems] = useState("");

    const dataListVariables = {
        network: networkDataList,
        sriov: sriovNetworkDataList,
        elb: loadBalancerDataList,
    };

    const stateVariables = {
        network: networkCheckItems,
        sriov: sriovCheckItems,
        elb: setElbCheckItems,
    };

    const setVariables = {
        network: setNetworkCheckItems,
        sriov: setSriovCheckItems,
        elb: setElbCheckItems,
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

    const flavorValidator = (rule, value, callback) => {
        if (value == "선택" || value == "select") {
            return callback({ message: t('Flavor를 선택해 주세요.') })
        }
        callback()
    }
    // Validation 끝 ==================================================


    // 스크립트 시작 ==================================================
    const imageSelectChange = (ostype) => {
        setOsType(ostype);
        let selectList = "";
        if (ostype === "linux") {
            selectList = imageOption?.filter((row) => !row.name.toLowerCase().includes('window'));
        } else {
            selectList = imageOption?.filter((row) => row.name.toLowerCase().includes('window'));
        }

        if (selectList.length > 0) {
            const selectText = selectList[0].name;
            setImageSelect(selectText)
        } else {
            setImageSelect("선택없음")
        }
    }

    const onChangeSlider = (e) => {
        const range = e;
        setAutoScale(range);
        setAutoScaleRange(range[1]);
    }
    const onChangeInput = (e) => {
        const { value } = e.target;
        let onlyNumber = Number(value.replace(/[^0-9]/g, ''));
        onlyNumber = onlyNumber > 10 ? 10 : onlyNumber;
        const maxScale = onlyNumber;
        if (maxScale <= autoScale[0]) {
            setAutoScale([maxScale - 1, maxScale]);
        } else {
            setAutoScale([autoScale[0], maxScale]);
        }
        setAutoScaleRange(onlyNumber);
    }

    const onChangeNetwork = (el) => {
        setNetworkSelect(el);
        if (networkSelect === "네트워크") {
            handleSingleCheck("", "network");
            setValue('networkValue', '');
        } else {
            handleSingleCheck("", "sriov");
            setValue('networkValue', '');
        }
    }

    //cpu count
    const addBtn = (e) => {
        e.preventDefault();
        setWorkerFlavorSelectCnt(workerFlavorSelectCnt + 1);
    }
    const minusBtn = (e) => {
        e.preventDefault();
        if (workerFlavorSelectCnt > 0) {
            setWorkerFlavorSelectCnt(workerFlavorSelectCnt - 1);
        }
    }
    // 스크립트 끝 ==================================================


    const [tab, setTab] = useState("I");
    const { TabPanel } = Tabs;

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

                                <Form.Item>
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
                                </Form.Item>

                                <Form.Item
                                    label={t('Master Flavor')}
                                    rules={[{ required: true, validator: flavorValidator }]}
                                >
                                    <Columns>
                                        <Column>
                                            <TypeSelect
                                                name="master_flavor"
                                                defaultValue="선택"
                                                options={flavorOptions()}
                                                placeholder={{ label: t('선택') }} 
                                                onChange={(e) => setMasterFlavorSelect(e)}
                                            />
                                        </Column>
                                        <Column>
                                            <Select name="master_number" options={[{ label: 1, value: 1 }, { label: 3, value: 3 }, { label: 5, value: 5 }]} onClick={(e) => setMasterFlavorSelectCnt(e)} />
                                        </Column>
                                    </Columns>
                                </Form.Item>

                                <Form.Item
                                    label={t('Worker Flavor')}
                                    rules={[{ required: true, validator: flavorValidator }]}
                                >
                                    <Columns>
                                        <Column>
                                            <TypeSelect
                                                name="worker_flavor"
                                                defaultValue="선택"
                                                options={flavorOptions()}
                                                placeholder={{ label: t('선택') }}
                                                onChange={(e) => setWorkerFlavorSelect(e)}
                                            />
                                        </Column>
                                        <Column>
                                            <Button icon="substract" onClick={minusBtn} />&nbsp;&nbsp;
                                            <Input name="worker_number" value={workerFlavorSelectCnt} style={{ width: '15%' }} />&nbsp;&nbsp;
                                            <Button icon="add" onClick={addBtn} />
                                        </Column>
                                    </Columns>
                                </Form.Item>

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
                                        </div>
                                    </div>
                                </Form.Item>

                                <Form.Item label={t('SR-IOV 네트워크')} >
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
                                        </div>
                                    </div>
                                </Form.Item>
                            </div>
                            {/* 네트워크 설정 끝==========================================*/}

                            {/* 세부 설정 시작==========================================*/}
                            <div className={`${regStep == 3 ? "" : "hide"}`}>



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
                                                <label>Flavor</label>
                                                <div className={styles.multiline}>
                                                    <div className={styles.bold}>{masterFlavorSelect}</div>
                                                    <p>
                                                        CPU {masterFlavorCpu} Cores / Memory {masterFlavorMemory} / Disk {masterFlavorDisk} Gib
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

