import { toJS } from 'mobx';
import React, { useState, useRef, useEffect } from 'react';

import { get, omit } from 'lodash';
import { Modal } from 'components/Base';
import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Checkbox,
  Tabs,
  InputPassword,
} from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';

import axios from 'axios';
import styles from './index.scss';

const EditModal = props => {
  const regexIp = /(^(\d{1,3}\.){3}(\d{1,3})$)/;

  const detailInfo = toJS(props.store.list.data).find(
    item => get(item, 'name') == props.store.detail.name
  );

  const dataList = props.store.dataList;

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [bmcCheck, setBmcCheck] = useState(false);

  const [userValidError, setUserValidError] = useState(false);
  const [userValidBmcError, setUserValidBmcError] = useState(false);
  const [userValidSuccess, setUserValidSuccess] = useState(false);
  const [userValidBmcSuccess, setUserValidBmcSuccess] = useState(false);

  const [nodeIp, setNodeIp] = useState();
  const [nodeInterval, setNodeInterval] = useState();
  const [nodePort, setNodePort] = useState();
  const [chkValidation, setChkValidation] = useState(true);

  const [bmcUsername, setBmcUsername] = useState();
  const [bmcPassword, setBmcPassword] = useState();
  const [bmcIp, setBmcIp] = useState();
  const [bmcInterval, setBmcInterval] = useState();

  useEffect(() => {
    const bmcData = detailInfo.openBMC;
    if (
      !!bmcData.address &&
      !!bmcData.scrapeInterval &&
      !!bmcData.username &&
      !!bmcData.password
    ) {
      setBmcCheck(true);
    }
  }, []);
  useEffect(() => {
    setNodeIp(detailInfo.nodeExporter?.ip);
    setNodeInterval(
      detailInfo.nodeExporter?.scrapeInterval
        ? detailInfo.nodeExporter.scrapeInterval.replace('s', '')
        : ''
    );
    setNodePort(detailInfo?.nodeExporter?.port);
    // setChkValidation();
    setBmcUsername(detailInfo?.openBMC?.username);
    setBmcPassword(detailInfo.openBMC.password);
    setBmcIp(detailInfo?.openBMC?.address);
    setBmcInterval(
      detailInfo.openBMC?.scrapeInterval
        ? detailInfo.openBMC.scrapeInterval.replace('s', '')
        : ''
    );
  }, []);

  useEffect(() => {
    const bmcData = detailInfo.openBMC;
    if (
      !!bmcData.address &&
      !!bmcData.scrapeInterval &&
      !!bmcData.username &&
      !!bmcData.password
    ) {
      setBmcCheck(true);
    }
  }, []);

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      data.systemType = detailInfo.system_type;
      data.bmcCheck = bmcCheck;

      // console.log("data :" + JSON.stringify(data))
      onOk({ ...data });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

  // Validation 시작 ==================================================
  const instanceIpValidator = (rule, value, callback) => {
    const duplicate = dataList.filter(el => el.ip == value);

    if (value && duplicate.length > 0) {
      return callback({ message: t('RESOURCES_REGISTED_IP_EXISTS') });
    }

    if (!value) {
      return callback({ message: t('RESOURCES_IP_EMPTY_DESC') });
    }

    if (!regexIp.test(value)) {
      return callback({ message: t('INVALID_IP_DESC') });
    }
    setNodeIp(value);
    callback();
  };

  const intervalNodeValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_INTERVAL_EMPTY_DESC') });
    }

    if (value < 60) {
      return callback({ message: t('RESOURCES_ENTER_60_MORE') });
    }
    setNodeInterval(value);
    callback();
  };

  const portValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_PORT_EMPTY_DESC') });
    }

    if (!(value >= 1 && value <= 65535)) {
      return callback({ message: t('RESOURCES_ENTER_1_MORE_AS_65535') });
    }
    setNodePort(value);
    callback();
  };

  const bmcIpValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_IP_EMPTY_DESC') });
    }

    if (!regexIp.test(value)) {
      return callback({ message: t('INVALID_IP_DESC') });
    }

    setBmcIp(value);
    callback();
  };

  const intervalValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_INTERVAL_EMPTY_DESC') });
    }

    if (value < 60) {
      return callback({ message: t('RESOURCES_ENTER_60_MORE') });
    }
    setBmcInterval(value);
    callback();
  };

  const bmcIdValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_ID_EMPTY_DESC') });
    }

    setBmcUsername(value);
    callback();
  };

  const bmcPasswordValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_PASSWORD_EMPTY_DESC') });
    }

    setBmcPassword(value);
    callback();
  };

  const onClickValChk = () => {
    const params = {};
    params.ip = nodeIp;
    params.port = Number(nodePort);
    params.timeout = Number(nodeInterval);

    axios
      .post(
        `/kapis/cmp.kubesphere.io/v1alpha1/baremetal-monitor/v1alpha1/validations/node-exporter`,
        params
      )
      .then(res => {
        if (bmcCheck) {
          setChkValidation(true);
        } else {
          setChkValidation(false); // 저장버튼 활성화
        }

        // 유효성 체크 validation 문구
        setUserValidError(false);
        setUserValidSuccess(true);
      })
      .catch(error => {
        console.error('Regist error :  ', error);
        setChkValidation(true); // 저장버튼 비활성화
        // 유효성 체크 validation 문구
        setUserValidError(true);
        setUserValidSuccess(false);
      });
  };

  const onClickBmcValChk = () => {
    const params = {};
    params.username = bmcUsername;
    params.password = bmcPassword;
    params.address = bmcIp;
    params.timeout = Number(bmcInterval);

    axios
      .post(
        `/kapis/cmp.kubesphere.io/v1alpha1/baremetal-monitor/v1alpha1/validations/openbmc`,
        params
      )
      .then(res => {
        if (!userValidError) {
          setChkValidation(false);
        } else {
          setChkValidation(true);
        }
        setUserValidBmcError(false);
        setUserValidBmcSuccess(true);
      })
      .catch(error => {
        console.error('Regist error :  ', error);

        setChkValidation(true);
        setUserValidBmcError(true);
        setUserValidBmcSuccess(false);
      });
  };
  // Validation 끝 ==================================================

  return (
    <>
      <Modal
        icon="pen"
        width={800}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        disableSubmit={chkValidation}
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('이름')}
            rules={[{ required: true, message: t('이름을 입력해 주세요.') }]}
            desc={t('NAME_DESC')}
          >
            <Input
              name="name"
              autoFocus={true}
              maxLength={63}
              defaultValue={detailInfo.name}
              disabled
            />
          </Form.Item>

          {detailInfo.system_type == 'B' && (
            <Form.Item label={t('Node Exporter')}>
              <Form.Group>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('IP')}
                      rules={[
                        { required: true, validator: instanceIpValidator },
                      ]}
                    >
                      <Input
                        name="nodeIp"
                        placeholder={t('192.168.XX.XX')}
                        defaultValue={nodeIp}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={`${t('Scrape Interval')} (s)`}
                      rules={[
                        { required: true, validator: intervalNodeValidator },
                      ]}
                    >
                      <Input
                        name="nodeInterval"
                        placeholder={t('Interval')}
                        defaultValue={
                          detailInfo.nodeExporter?.scrapeInterval
                            ? detailInfo.nodeExporter.scrapeInterval.replace(
                                's',
                                ''
                              )
                            : ''
                        }
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('Port')}
                      rules={[{ required: true, validator: portValidator }]}
                    >
                      <Input
                        name="nodePort"
                        placeholder={t('21000')}
                        defaultValue={nodePort}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
                <div
                  style={{
                    position: 'relative',
                    bottom: '10px',
                  }}
                >
                  {/* 유효하지 않은 정보입니다. */}
                  {userValidError && (
                    <div
                      className="form-item-error"
                      style={{
                        position: 'relative',
                        top: '27px',
                      }}
                    >
                      {t('RESOURCES_FAIL_VALID_INFO')}
                    </div>
                  )}
                  {/* //유효성 체크가 완료 되었습니다. */}
                  {userValidSuccess && (
                    <div
                      className="form-item-error"
                      style={{
                        color: '#55bc8a',
                        position: 'relative',
                        top: '27px',
                      }}
                    >
                      {t('RESOURCES_SUCCESS_VALID_DESC')}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onClickValChk}
                    style={{
                      position: 'relative',
                      left: '615px',
                      flex: '0 0 auto !important',
                      background: '#242e42',
                      color: '#fff',
                      boxShadow: '0 4px 8px 0 rgba(35, 45, 65, 0.28)',
                      fontWeight: 'normal',
                      borderRadius: '16px',
                      minWidth: '60px',
                      height: '32px',
                      lineHeight: '20px',
                      fontSize: '12px',
                      padding: '5px 15px',
                      cursor: 'pointer',
                      outline: 'none',
                      border: '0',
                      transition: '.5s ease',
                      fontFamily: 'Roboto Pretendard sans-serif',
                      backfaceVisibility: 'hidden',
                      resize: 'none',
                      appearance: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {t('RESOURCES_VALID')}
                  </button>
                </div>
              </Form.Group>
            </Form.Item>
          )}

          <div className={styles.title}>
            <Checkbox
              name="bmc"
              onClick={() => {
                setBmcCheck(!bmcCheck);
              }}
              checked={bmcCheck}
              disabled
            >
              {t('BMC')}
              {/* <span className={`form-item-required ${bmcCheck ? '' : 'hide'}`}>
                *
              </span> */}
            </Checkbox>
          </div>
          {bmcCheck && (
            <div className={styles.desc}>
              {t('RESOURCES_INTERVAL_60_OVER_DESC')}
            </div>
          )}
          {bmcCheck && (
            <Form.Group>
              <Columns>
                <Column>
                  <Form.Item
                    label={t('IP')}
                    rules={[{ required: true, validator: bmcIpValidator }]}
                  >
                    <Input
                      name={`bmcIp`}
                      placeholder={t('IP')}
                      defaultValue={bmcIp}
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    label={`${t('Interval')} (s)`}
                    rules={[{ required: true, validator: intervalValidator }]}
                  >
                    <Input
                      name={`bmcInterval`}
                      placeholder={t('Interval')}
                      type="number"
                      defaultValue={bmcInterval}
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    label={t('ID')}
                    rules={[{ required: true, validator: bmcIdValidator }]}
                  >
                    <Input
                      name={`bmcId`}
                      placeholder={t('ID')}
                      defaultValue={bmcUsername}
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    label={t('Password')}
                    rules={[
                      { required: true, validator: bmcPasswordValidator },
                    ]}
                  >
                    <InputPassword
                      name={`bmcPassword`}
                      type="password"
                      placeholder={t('Password')}
                      defaultValue={bmcPassword}
                    />
                  </Form.Item>
                </Column>
              </Columns>

              <div
                style={{
                  position: 'relative',
                  bottom: '10px',
                }}
              >
                {/* 유효하지 않은 정보입니다. */}
                {userValidBmcError && (
                  <div
                    className="form-item-error"
                    style={{
                      position: 'relative',
                      top: '27px',
                    }}
                  >
                    {t('RESOURCES_FAIL_VALID_INFO')}
                  </div>
                )}
                {/* 유효성 체크가 완료 되었습니다. */}
                {userValidBmcSuccess && (
                  <div
                    className="form-item-error"
                    style={{
                      color: '#55bc8a',
                      position: 'relative',
                      top: '27px',
                    }}
                  >
                    {t('RESOURCES_SUCCESS_VALID_DESC')}
                  </div>
                )}
                <button
                  type="button"
                  onClick={onClickBmcValChk}
                  style={{
                    position: 'relative',
                    left: '615px',
                    flex: '0 0 auto !important',
                    background: '#242e42',
                    color: '#fff',
                    boxShadow: '0 4px 8px 0 rgba(35, 45, 65, 0.28)',
                    fontWeight: 'normal',
                    borderRadius: '16px',
                    minWidth: '60px',
                    height: '32px',
                    lineHeight: '20px',
                    fontSize: '12px',
                    padding: '5px 15px',
                    cursor: 'pointer',
                    outline: 'none',
                    border: '0',
                    transition: '.5s ease',
                    fontFamily: 'Roboto Pretendard sans-serif',
                    backfaceVisibility: 'hidden',
                    resize: 'none',
                    appearance: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {t('RESOURCES_VALID')}
                </button>
              </div>
            </Form.Group>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default EditModal;
