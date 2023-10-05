import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, TextArea, Button, Checkbox, Toggle, Column, Columns, Icon } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import HostDeviceStore from 'stores/resources/hostdevices'
import classnames from 'classnames'
import { COLORS_MAP } from 'utils/constants'

const RegistModal = (props) => {
    const hostDeviceStore = new HostDeviceStore();

    const form = useRef();
    const [modelView, setModalView] = useState(true);
    const [formData, setFormData] = useState({});

    const [dataList, setDataList] = useState([]);

    useEffect(() => {
        const getCreateData = async () => {
            const listPciDevice = await hostDeviceStore.fetchListPciDevices();
            setDataList(
                listPciDevice.pci_devices.map(data => ({
                    vendor_id: data.vendor_id
                    , vendor_name: data.vendor_name
                    , device_id: data.device_id
                    , device_name: data.device_name
                    , isExternal: true
                    , isGpu: false
                })));
        };
        getCreateData();
    }, [])

    const [addRowList, setAddRowList] = useState([]);
    // 체크 리스트 시작 ==================================================
    const [checkItems, setCheckItems] = useState([]);

    const handleSingleCheck = (checked, obj, index) => {
        if (checked) {
            setCheckItems(prev => [...prev, obj.device_name]);
            setAddRowList(prev => [...prev, {
                name: ""
                , vendor_id: obj.vendor_id
                , vendor_name: obj.vendor_name
                , device_id: obj.device_id
                , device_name: obj.device_name
                , isExternal: dataList[index].isExternal
                , isGpu: dataList[index].isGpu
                , description: ""
            }]);
        } else {
            setCheckItems(checkItems.filter((el) => el !== obj.device_name));
            setAddRowList(addRowList.filter((el) => el.device_name !== obj.device_name));
        }
    };

    // 체크박스 전체 선택
    const handleAllCheckModal = (checked) => {
        if (checked) {
            const idArray = [];
            dataList.forEach((el) => idArray.push(el.device_name));
            setCheckItems(idArray);
            setAddRowList(dataList.map(data => ({
                name: ""
                , vendor_id: data.vendor_id
                , vendor_name: data.vendor_name
                , device_id: data.device_id
                , device_name: data.device_name
                , isExternal: data.isExternal
                , isGpu: data.isGpu
                , description: ""})))
        }
        else {
            setCheckItems([]);
            setAddRowList([]);
        }
    }

    const handleDelete = (name) => {
        setCheckItems(checkItems.filter((el) => el !== name));
        setAddRowList(addRowList.filter((el) => el.device_name !== name));
    };

    const hendleExternal = (e, i) => {
        let values = [...dataList];
        values[i].isExternal = e;
        setDataList(values);
    };
    const hendleGpu = (e, i) => {
        let values = [...dataList];
        values[i].isGpu = e;
        setDataList(values);
    };

    const handleInput = (e, i, type) => {
        const values = [...addRowList];

        if (type.indexOf("description") != -1) {
            values[i].description = e;
        } else {
            values[i].name = e;
        }
        setAddRowList(values);
    };

  // 체크 리스트 끝 ==================================================

    const handleOk = () => {
        const onOk = props.onOk;

        const checkName = addRowList.filter((el) => el.name).length > 0;
        if (!checkName) {
            return false;
        }

        form.current.validator(() => {
            onOk({ hostDevices: [...addRowList].filter((el) => el.name) })
        })
    }

    const closeModal = () => {
        setModalView(false);
    }

    const color = {
        primary: COLORS_MAP['white'],
        secondary: COLORS_MAP['white'],
    }

    return (
        <>
            <Modal
                icon="pen"
                width={1000}
                title={props.title}
                onOk={handleOk}
                onCancel={closeModal}
                cancelText={'취소'}
                visible={modelView}
            >
                <Form data={formData} ref={form}>

                    <Form.Item label={t('호스트 디바이스')} >
                        <div className={styles.wrapper}>
                            {checkItems.length > 0 &&
                                <div className={classnames(styles.table_title, styles.table_title_bg)}>
                                    <Button className={styles.table_title_button} onClick={() => handleAllCheckModal(false)}>전체 선택 해제</Button>  {checkItems.length}개 선택
                                </div>
                            }
                            <div className={styles.table}>
                                <table>
                                    <colgroup>
                                        <col width="5%" />
                                        <col width="10%" />
                                        <col width="20%" />
                                        <col width="10%" />
                                        <col width="25%" />
                                        <col width="15%" />
                                        <col width="15%" />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>
                                                <Checkbox name='select-all-network'
                                                    onChange={(checked) => handleAllCheckModal(checked)}
                                                    checked={dataList.length > 0 && checkItems.length === dataList.length ? true : false} />
                                            </th>
                                            <th><strong>제조사 ID</strong></th>
                                            <th><strong>제조명</strong></th>
                                            <th><strong>제품 ID</strong></th>
                                            <th><strong>제품명</strong></th>
                                            <th><strong>External</strong></th>
                                            <th><strong>GPU</strong></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!dataList?.length &&
                                            <tr>
                                                <td colSpan="6" className="no-data">
                                                    <p>할당 가능한 자원이 없습니다.</p>
                                                </td>
                                            </tr>
                                        }
                                        {dataList?.map((data, key) => (
                                            <tr key={data.name}>
                                                <td>
                                                    <Checkbox name={`select-${data.device_name}`} checked={checkItems.includes(data.device_name) ? true : false}
                                                        onChange={(checked) => handleSingleCheck(checked, data, key)} />
                                                </td>
                                                <td>{data.vendor_id}</td>
                                                <td>{data.vendor_name}</td>
                                                <td>{data.device_id}</td>
                                                <td>{data.device_name}</td>
                                                <td style={{ textAlign: "left" }}>
                                                    <Toggle checked={data.isExternal} showText onText="on" offText="off" onChange={(e) => hendleExternal(e, key)} />
                                                </td>
                                                <td style={{ textAlign: "left" }}>
                                                    <Toggle checked={data.isGpu} showText onText="on" offText="off" onChange={(e) => hendleGpu(e, key)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {addRowList?.map((v, i) => (
                                    <div className={styles.item} key={i}>
                                        <Columns>
                                            <Column style={{ width: '5%', flexBasis : '1' }}>
                                                <Icon
                                                    className={styles.substract}
                                                    name="substract"
                                                    size={24}
                                                    color={color}
                                                    onClick={() => handleDelete(v.device_name)}
                                                    clickable
                                                />
                                            </Column>
                                            <Column style={{ width: '15%' }}>
                                                <Form.Item>
                                                    <Input type="text" value={v.name} placeholder="이름" onChange={(e) => handleInput(e, i, 'name')} />
                                                </Form.Item>
                                            </Column>
                                            <Column style={{ width: '10%' }}>
                                                {v.vendor_id}
                                            </Column>
                                            <Column style={{ width: '15%' }}>
                                                {v.vendor_name}
                                            </Column>
                                            <Column style={{ width: '10%' }}>
                                                {v.device_id}
                                            </Column>
                                            <Column style={{ width: '15%' }}>
                                                {v.device_name}
                                            </Column>
                                            <Column style={{ width: '10%' }}>
                                                {v.isExternal ? '사용' : '미사용'}
                                            </Column>
                                            <Column style={{ width: '7%' }}>
                                                {v.isGpu ? 'GPU' : '-'}
                                            </Column>
                                            <Column style={{ width: '20%', flexBasis: '1' }}>
                                                <Form.Item>
                                                    <Input type="text" value={v.description} placeholder="설명" id="description" onChange={(e) => handleInput(e, i, 'description')} />
                                                </Form.Item>
                                            </Column>
                                        </Columns>
                                    </div>
                                )
                                    //<span key={name}><Button onClick={() => handleDelete(name)}>{name}</Button></span>
                                )}
                            </div>
                        </div>
                    </Form.Item>

                </Form>
            </Modal >

        </>
    );
};

export default RegistModal

