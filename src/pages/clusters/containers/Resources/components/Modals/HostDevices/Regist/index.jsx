import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Toggle,
  InputSearch,
  Button,
} from '@kube-design/components';
import classnames from 'classnames';

import { Modal, Indicator } from 'components/Base';
import HostDeviceStore from 'stores/resources/hostdevices';
import { PATTERN_USER_NAME, COLORS_MAP } from 'utils/constants';

import styles from './index.scss';

const regexName = /^[a-z][a-z0-9-]*\.[a-z]{2,}\/[a-z0-9]+$/;

const RegistModal = props => {
  const hostDeviceStore = new HostDeviceStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [dataList, setDataList] = useState([]);
  const [keyword, setKeyword] = useState(2);
  const [isCheck, setIsCheck] = useState(false);
  const [isCheckName, setIsCheckName] = useState(false);

  const [addRowList, setAddRowList] = useState([]);
  const [checkItems, setCheckItems] = useState([]);

  const getCreateData = async () => {
    const listPciDevice = await hostDeviceStore.fetchListPciDevices(props);
    setDataList(
      listPciDevice.pci_devices.map(data => ({
        vendor_id: data.vendor_id,
        vendor_name: data.vendor_name,
        device_id: data.device_id,
        device_name: data.device_name,
        isExternal: false,
        isGpu: false,
      }))
    );
  };

  useEffect(() => {
    getCreateData();
  }, []);

  // 체크 리스트 시작 ==================================================
  const nextIndex = useRef(0);
  const handleSingleCheck = (checked, obj, index) => {
    console.log();
    if (checked) {
      setCheckItems(prev => [...prev, obj.device_name]);
      // setAddRowList(prev => [
      //   ...prev,
      //   {
      //     name: '',
      //     vendor_id: obj.vendor_id,
      //     vendor_name: obj.vendor_name,
      //     device_id: obj.device_id,
      //     device_name: obj.device_name,
      //     isExternal: dataList[index].isExternal,
      //     isGpu: dataList[index].isGpu,
      //     description: '',
      //     idx: nextIndex.current += 1,
      //   },
      // ]);
      setAddRowList([
        ...addRowList,
        {
          name: '',
          vendor_id: obj.vendor_id,
          vendor_name: obj.vendor_name,
          device_id: obj.device_id,
          device_name: obj.device_name,
          isExternal: dataList[index].isExternal,
          isGpu: dataList[index].isGpu,
          description: '',
          idx: (nextIndex.current += 1),
        },
      ]);
    } else {
      setCheckItems(checkItems.filter(el => el !== obj.device_name));
      setAddRowList(
        addRowList.filter(el => el.device_name !== obj.device_name)
      );
    }
  };

  // 체크박스 전체 선택
  const handleAllCheckModal = checked => {
    if (checked) {
      const idArray = [];
      dataList.forEach(el => idArray.push(el.device_name));
      setCheckItems(idArray);

      // setAddRowList(
      //   dataList.map(data => {
      //     return {
      //       name: '',
      //       vendor_id: data.vendor_id,
      //       vendor_name: data.vendor_name,
      //       device_id: data.device_id,
      //       device_name: data.device_name,
      //       isExternal: data.isExternal,
      //       isGpu: data.isGpu,
      //       description: '',
      //     };
      //   })
      // );
    } else {
      setCheckItems([]);
      setAddRowList([]);
    }
  };

  const handleDelete = name => {
    setCheckItems(checkItems.filter(el => el !== name));
    setAddRowList(addRowList.filter(el => el.device_name !== name));
    if (
      addRowList.length - 1 < 1 ||
      addRowList.filter(el => PATTERN_USER_NAME.test(el.name)).length ==
        addRowList.length - 1
    ) {
      setIsCheckName(false);
    }
  };

  const hendleExternal = (e, i) => {
    const valuesData = [...dataList];
    valuesData[i].isExternal = e;
    setDataList(valuesData);
  };

  const hendleGpu = (e, i) => {
    const valuesData = [...dataList];
    valuesData[i].isGpu = e;
    setDataList(valuesData);
  };

  const handleInput = (value, i, type) => {
    const valuesAddRowList = [...addRowList];

    if (type.indexOf('description') != -1) {
      valuesAddRowList[i].description = value;
    } else {
      valuesAddRowList[i].name = value;
      if (PATTERN_USER_NAME.test(value)) {
        setIsCheckName(false);
      }
    }

    // setAddRowList(valuesAddRowList);
  };

  // 체크 리스트 끝 ==================================================

  const fnSearch = e => {
    if (e) {
      if (keyword === 1) {
        setDataList(
          dataList.filter(el =>
            el.vendor_name.toLowerCase().includes(e.toLowerCase())
          )
        );
      } else {
        setDataList(
          dataList.filter(el =>
            el.device_name.toLowerCase().includes(e.toLowerCase())
          )
        );
      }
    } else {
      getCreateData();
    }
  };

  const handleOk = () => {
    const onOk = props.onOk;
    const filterCount = addRowList.filter(el => regexName.test(el.name)).length;

    setIsCheck(true);
    const checkName = filterCount == addRowList.length && filterCount > 0;
    setIsCheckName(!checkName);
    if (!checkName) {
      return false;
    }

    form.current.validator(() => {
      const { data } = form.current.props;
      onOk({ hostDevices: [...addRowList].filter(el => el.name) });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

  const color = {
    primary: COLORS_MAP['white'],
    secondary: COLORS_MAP['white'],
  };

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        cancelText={t('RESOURCES_CANCEL')}
        visible={modelView}
        disableSubmit={dataList.length === 0 && true}
        isSubmitting={props.store.isSubmitting}
      >
        <Form data={formData} ref={form}>
          {t('RESOURCES_HOST_DEVICE')}
          <span className="form-item-required">*</span>
          {/* <Form.Item
                        desc={`${t(
                            "RESOURCES_NAME_VALID_DESC",
                        )} ex) nvidia.com/t1`}
                    > */}
          <div
            style={{
              marginTop: '4px',
              fontFamily: 'sans-serif',
              fontSize: '12px',
              fontWeight: 'normal',
              fontStyle: 'normal',
              fontStretch: 'normal',
              lineHeight: 1.67,
              letterSpacing: 'normal',
              color: '#79879c',
            }}
          >
            <div>
              <div className={styles.divwrap} style={{ marginBottom: '10px' }}>
                <Select
                  name="select"
                  options={[
                    {
                      label: t('RESOURCES_MANUFACTURING_COMPANY_NAME'),
                      value: 1,
                    },
                    {
                      label: t('RESOURCES_PRODUCT_NAME'),
                      value: 2,
                    },
                  ]}
                  onChange={e => setKeyword(e)}
                  value={keyword}
                  className={styles.div_input}
                />
                <InputSearch
                  onSearch={e => fnSearch(e)}
                  placeholder={t('RESOURCES_SEARCH')}
                  style={{ width: '40%' }}
                />
              </div>
              <div className={styles.wrapper}>
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
                          <Checkbox
                            name="select-all-network"
                            onChange={checked => handleAllCheckModal(checked)}
                            checked={
                              !!(
                                dataList.length > 0 &&
                                checkItems.length === dataList.length
                              )
                            }
                          />
                        </th>
                        <th>
                          <strong>
                            {t('RESOURCES_MANUFACTURING_COMPANY_ID')}
                          </strong>
                        </th>
                        <th>
                          <strong>{t('RESOURCES_MANUFACTURING_NAME')}</strong>
                        </th>
                        <th>
                          <strong>{t('RESOURCES_PRODUCT_ID')}</strong>
                        </th>
                        <th>
                          <strong>{t('RESOURCES_PRODUCT_NAME')}</strong>
                        </th>
                        <th>
                          <strong>External</strong>
                        </th>
                        <th>
                          <strong>GPU</strong>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!dataList?.length && (
                        <tr>
                          <td
                            colSpan="7"
                            className="no-data"
                            style={{
                              textAlign: 'center',
                            }}
                          >
                            <p>
                              {t('RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION')}
                            </p>
                          </td>
                        </tr>
                      )}
                      {dataList?.map((data, key) => (
                        <tr key={data.name}>
                          <td>
                            <Checkbox
                              name={`select-${data.device_name}`}
                              checked={!!checkItems.includes(data.device_name)}
                              onChange={checked =>
                                handleSingleCheck(checked, data, key)
                              }
                            />
                          </td>
                          <td>{data.vendor_id}</td>
                          <td>{data.vendor_name}</td>
                          <td>{data.device_id}</td>
                          <td>{data.device_name}</td>
                          <td
                            style={{
                              textAlign: 'left',
                            }}
                          >
                            <Toggle
                              checked={data.isExternal}
                              showText
                              onText="on"
                              offText="off"
                              onChange={e => hendleExternal(e, key)}
                            />
                          </td>
                          <td
                            style={{
                              textAlign: 'left',
                            }}
                          >
                            <Toggle
                              checked={data.isGpu}
                              showText
                              onText="on"
                              offText="off"
                              onChange={e => hendleGpu(e, key)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {addRowList.length < 1 ? (
                <div
                  className={`form-item-error ${isCheck ? '' : 'hide'}`}
                  style={{ marginLeft: '10px' }}
                >
                  {t('RESOURCES_SELECT_HOST_DEVICE_TIP')}
                </div>
              ) : (
                <div className={styles.wrapper}>
                  <div className={styles.table}>
                    <table>
                      <colgroup>
                        <col width="5%" />
                        <col width="20%" />
                        <col width="7%" />
                        <col width="10%" />
                        <col width="7%" />
                        <col width="13%" />
                        <col width="9%" />
                        <col width="7%" />
                        <col width="24%" />
                      </colgroup>
                      <thead></thead>
                      <tbody>
                        {addRowList?.map((v, i) => (
                          <tr key={`${v.name}-${i}`}>
                            <td>
                              <Button
                                icon="substract"
                                type="flat"
                                onClick={() => handleDelete(v.device_name)}
                                size="small"
                              />
                            </td>
                            <td>
                              <Form.Item
                                rules={[
                                  {
                                    required: true,
                                    message: t('NAME_EMPTY_DESC'),
                                  },
                                  {
                                    pattern: regexName,
                                    message: t(
                                      'RESOURCES_INVALID_NAME_HOSTDEVICES_DESC'
                                    ),
                                  },
                                ]}
                              >
                                <Input
                                  name={`name-${v.idx}`}
                                  type="text"
                                  value={v.name}
                                  placeholder={t('RESOURCES_NAME')}
                                  onChange={e => {
                                    handleInput(e, i, `name`);
                                  }}
                                />
                              </Form.Item>
                            </td>
                            <td>{v.vendor_id}</td>
                            <td>{v.vendor_name}</td>
                            <td>{v.device_id}</td>
                            <td>{v.device_name}</td>
                            <td>
                              {v.isExternal ? (
                                <div className={styles.divwrap}>
                                  <Indicator
                                    type="running"
                                    className={styles.indicator}
                                    flicker
                                  />
                                  {t('RESOURCES_USE')}
                                </div>
                              ) : (
                                <div className={styles.divwrap}>
                                  <Indicator
                                    type="inactive"
                                    className={styles.indicator}
                                    flicker
                                  />
                                  {t('RESOURCES_NOT_USE')}
                                </div>
                              )}
                            </td>
                            <td>{v.isGpu ? 'GPU' : '-'}</td>
                            <td>
                              <Form.Item>
                                <Input
                                  type="text"
                                  value={v.description}
                                  placeholder={t('RESOURCES_DESCRIPTION')}
                                  id="description"
                                  name={`description`}
                                  onChange={e => {
                                    handleInput(e, i, 'description');
                                  }}
                                />
                              </Form.Item>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className={`form-item-error ${
                      isCheck && isCheckName ? '' : 'hide'
                    }`}
                    style={{ marginLeft: '10px' }}
                  >
                    {t('RESOURCES_NAME_CHECK_DESC')}
                  </div>
                </div>
              )}
            </div>
            {`${t('RESOURCES_NAME_VALID_DESC')} ex) nvidia.com/t1`}
          </div>
          {/* </Form.Item> */}
        </Form>
      </Modal>
    </>
  );
};

export default RegistModal;
