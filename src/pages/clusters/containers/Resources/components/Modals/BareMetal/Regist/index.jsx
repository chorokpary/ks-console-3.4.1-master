import { toJS } from 'mobx';
import React, { useState, useRef, useEffect } from 'react';
import { get, omit } from 'lodash';
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
import {
  Column,
  Columns,
  LevelLeft,
} from '@kube-design/components/lib/components/Layout';
import axios from 'axios';
import classnames from 'classnames';

import { Modal } from 'components/Base';
import { PATTERN_USER_NAME } from 'utils/constants';
import styles from './index.scss';
import NodeStore from 'stores/node';

const RegistModal = props => {
  const regexIp = /(^(\d{1,3}\.){3}(\d{1,3})$)/;

  const nodeStore = new NodeStore();

  const dataList = props.store.dataList;

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [tab, setTab] = useState('C');
  const { TabPanel } = Tabs;

  const [systemType, setSystemType] = useState('C');

  const [clusterNodeDataList, setClusterNodeDataList] = useState([]);

  const [bmcCheck, setBmcCheck] = useState(false);

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      data.systemType = systemType;
      data.bmcCheck = bmcCheck;

      console.log('data :' + JSON.stringify(data));
      onOk({ ...data });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };
  const [nodeIp, setNodeIp] = useState();
  const [nodeInterval, setNodeInterval] = useState();
  const [nodePort, setNodePort] = useState();
  const [chkValidation, setChkValidation] = useState(true);

  const [bmcUsername, setBmcUsername] = useState();
  const [bmcPassword, setBmcPassword] = useState();
  const [bmcIp, setBmcIp] = useState();
  const [bmcInterval, setBmcInterval] = useState();

  useEffect(() => {
    const getClusterNodeData = async () => {
      const clusterNodeData = await nodeStore.fetchList();
      const clusterNodeArray = clusterNodeData.map(item => item.name);
      setClusterNodeDataList(clusterNodeArray);
    };

    getClusterNodeData();
  }, []);

  useEffect(() => {
    if (systemType == 'C') {
      setChkValidation(false);
    }
    if (systemType == 'B') {
      setChkValidation(true);
    }
  }, [systemType]);

  useEffect(() => {
    if (systemType == 'C' && bmcCheck) {
      setChkValidation(true);
    }
    if (systemType == 'C' && !bmcCheck) {
      setChkValidation(false);
    }
  }, [bmcCheck]);
  const nodeNameOptions = clusterNodeDataList.map(name => {
    return {
      label: name,
      value: name,
    };
  });

  // Validation 시작 ==================================================
  const instanceIpValidator = (rule, value, callback) => {
    const duplicate = dataList.filter(el => el.ip == value);

    if (value && duplicate.length > 0) {
      return callback({
        message: t('RESOURCES_REGISTED_IP_EXISTS'),
      });
    }

    if (!value) {
      return callback({
        message: t('RESOURCES_IP_EMPTY_DESC'),
      });
    }

    if (!regexIp.test(value)) {
      return callback({
        message: t('INVALID_IP_DESC'),
      });
    }

    setNodeIp(value);
    callback();
  };

  const intervalNodeValidator = (rule, value, callback) => {
    if (!value) {
      return callback({
        message: t('RESOURCES_INTERVAL_EMPTY_DESC'),
      });
    }

    if (value < 60) {
      return callback({
        message: t('RESOURCES_ENTER_60_MORE'),
      });
    }
    setNodeInterval(value);
    callback();
  };

  const portValidator = (rule, value, callback) => {
    if (!value) {
      return callback({
        message: t('RESOURCES_PORT_EMPTY_DESC'),
      });
    }

    if (!(value >= 1 && value <= 65535)) {
      return callback({
        message: t('RESOURCES_ENTER_1_MORE_AS_65535'),
      });
    }
    setNodePort(value);
    callback();
  };

  const bmcIpValidator = (rule, value, callback) => {
    if (!value) {
      return callback({
        message: t('RESOURCES_IP_EMPTY_DESC'),
      });
    }

    if (!regexIp.test(value)) {
      return callback({
        message: t('INVALID_IP_DESC'),
      });
    }
    setBmcIp(value);
    callback();
  };

  const intervalValidator = (rule, value, callback) => {
    if (!value) {
      return callback({
        message: t('RESOURCES_INTERVAL_EMPTY_DESC'),
      });
    }

    if (value < 60) {
      return callback({
        message: t('RESOURCES_ENTER_60_MORE'),
      });
    }
    setBmcInterval(value);
    callback();
  };

  const bmcIdValidator = (rule, value, callback) => {
    if (!value) {
      return callback({
        message: t('RESOURCES_ID_EMPTY_DESC'),
      });
    }
    setBmcUsername(value);
    callback();
  };

  const bmcPasswordValidator = (rule, value, callback) => {
    if (!value) {
      return callback({
        message: t('RESOURCES_PASSWORD_EMPTY_DESC'),
      });
    }
    setBmcPassword(value);
    callback();
  };

  const clusteNodeNameValidator = (rule, value, callback) => {
    if (value == t('SELECT') || value == '') {
      return callback({
        message: t('RESOURCES_SELECT_NAME_TIP'),
      });
    }
    callback();
  };

  const [userValid, setUserValid] = useState(false);
  const [userValidError, setUserValidError] = useState(false);
  const [userValidCheck, setuserValidCheck] = useState(false);
  const [userValidCheckError, setUserValidCheckError] = useState(false);

  // const [duplicate, setDuplicate] = useState();
  // useEffect(() => {
  //   const duplicate = dataList.filter(el => el.ip == nodeIp);

  //   setDuplicate(duplicate);
  // }, []);
  const [nodeIpError, setNodeIpError] = useState();
  const [nodeIntervalError, setNodeIntervalError] = useState();
  const [nodePortError, setNodePortError] = useState();
  const [chkValidationError, setChkValidationError] = useState(true);

  const [bmcUsernameError, setBmcUsernameError] = useState();
  const [bmcPasswordError, setBmcPasswordError] = useState();
  const [bmcIpError, setBmcIpError] = useState();
  const [bmcIntervalError, setBmcIntervalError] = useState();

  const validationCheck = () => {
    let isError = false;
    if (nodeIp && duplicate.length > 0) {
      setNodeIpError(t('RESOURCES_REGISTED_IP_EXISTS'));
      isError = true;
    } else if (!nodeIp) {
      setNodeIpError(t('RESOURCES_IP_EMPTY_DESC'));
      isError = true;
    } else if (!regexIp.test(nodeIp)) {
      setNodeIpError(t('INVALID_IP_DESC'));
      isError = true;
    } else {
      setNodeIpError();
    }

    if (!value) {
      setNodeIntervalError(t('RESOURCES_INTERVAL_EMPTY_DESC'));
    } else if (value < 60) {
      setNodeIntervalError(t('RESOURCES_ENTER_60_MORE'));
    }
    setNodeInterval(value);

    if (isError) return;

    onClickValChk();
  };
  const onClickValChk = () => {
    const params = {};
    params.ip = nodeIp;
    params.port = Number(nodePort);
    params.timeout = Number(nodeInterval);

    axios
      .post(
        `/kapis/cmp.kubesphere.io/v1alpha1/baremetal-monitor/v1alpha1/validations/node-exporter`,
        params,
      )
      .then(res => {
        setChkValidation(false);

        setuserValidCheck(true);
        setUserValidCheckError(false);
        setUserValid(true);
        setUserValidError(false);
      })
      .catch(error => {
        console.error('Regist error :  ', error);
        console.error('Regist error response :  ', error.response);

        if (error.status) {
          //유효하지 않음
          setuserValidCheck(false);
          setUserValidCheckError(false);
          setUserValid(false);
          setUserValidError(true);

          setUserValidSuccess(false);
        } else {
          //유효함
          setuserValidCheck(true);
          setUserValidCheckError(false);
          setUserValid(true);
          setUserValidError(false);

          setUserValidSuccess(true);
        }
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
        params,
      )
      .then(res => {
        setChkValidation(false);
      })
      .catch(error => {
        console.error('Regist error :  ', error);
        console.error('Regist error response :  ', error.response);
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
          <Form.Item>
            <Tabs
              type="button"
              activeName={tab}
              onChange={newTab => {
                setTab(newTab);
                setSystemType(newTab);
              }}
            >
              <TabPanel label={t('RESOURCES_CLUSTER')} name="C" />
              <TabPanel label={t('RESOURCES_BAREMETAL')} name="B" />
            </Tabs>
          </Form.Item>
          {systemType == 'C' && (
            <Form.Item
              label={t('RESOURCES_NAME')}
              rules={[
                {
                  required: true,
                  validator: clusteNodeNameValidator,
                },
              ]}
            >
              <Select
                name="cluserName"
                defaultValue={t('SELECT')}
                options={nodeNameOptions}
              />
            </Form.Item>
          )}
          {systemType == 'B' && (
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
              <Input name="name" autoFocus={true} maxLength={63} />
            </Form.Item>
          )}
          {systemType == 'B' && (
            <Form.Item label={t('Node Exporter')}>
              <Form.Group>
                <Columns>
                  <Column>
                    <Form.Item
                      label={t('IP')}
                      rules={[
                        {
                          required: true,
                          validator: instanceIpValidator,
                        },
                      ]}
                    >
                      <Input
                        name="nodeIp"
                        placeholder={t('192.168.XX.XX')}
                        value={nodeIp}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('Scrape Interval') + ' (s)'}
                      rules={[
                        {
                          required: true,
                          validator: intervalNodeValidator,
                        },
                      ]}
                    >
                      <Input
                        name="nodeInterval"
                        placeholder={t('60')}
                        type="number"
                        value={nodeInterval}
                      />
                    </Form.Item>
                  </Column>
                  <Column>
                    <Form.Item
                      label={t('Port')}
                      rules={[
                        {
                          required: true,
                          validator: portValidator,
                        },
                      ]}
                    >
                      <Input
                        name="nodePort"
                        placeholder={t('9100')}
                        type="number"
                        value={nodePort}
                      />
                    </Form.Item>
                  </Column>
                </Columns>
                <button
                  type="button"
                  // onClick={validationCheck}
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
              </Form.Group>
            </Form.Item>

            // <Form.Item label={t('Node Exporter')}>
            //   <div className={styles.content_box_wrap}>
            //     <div className={styles.cont_box_section}>
            //       <div className={styles.cont_box_wrap}>
            //         <div className={styles.regi_group_area}>
            //           <div className={styles.formarea}>
            //             <div className={styles.custom_input}>
            //               <label>{t('IP')}</label>
            //               <input
            //                 type="text"
            //                 onChange={e => setNodeIp(e.target.value)}
            //                 name="nodeIp"
            //                 placeholder={t('192.168.XX.XX')}
            //                 value={nodeIp}
            //               />
            //             </div>
            //             {nodeIpError && (
            //               <div
            //                 className="form-item-error"
            //                 style={{ color: '#ca2621' }}
            //               >
            //                 {t('RESOURCES_REGISTED_IP_EXISTS')}
            //               </div>
            //             )}
            //             <div className={styles.custom_input}>
            //               <label>{t('Scrape Interval') + ' (s)'}</label>
            //               <input
            //                 name="nodeInterval"
            //                 placeholder={t('60')}
            //                 type="number"
            //                 value={nodeInterval}
            //                 onChange={e => setNodeInterval(e.target.value)}
            //               />
            //             </div>
            //             <div className={styles.custom_input}>
            //               <label>{t('Port')}</label>
            //               <input
            //                 name="nodePort"
            //                 placeholder={t('9100')}
            //                 type="number"
            //                 value={nodePort}
            //                 onChange={e => setNodePort(e.target.value)}
            //               />
            //             </div>
            //             <button
            //               type="button"
            //               className={classnames(styles.btn, styles.btn_control)}
            //               onClick={validationCheck}
            //             >
            //               {t('RESOURCES_VALID')}
            //             </button>
            //           </div>
            //         </div>
            //         {/* //Harbor URL 정보를 입력해 주세요.  */}
            //         {/* {nodeIp && duplicate && (*/}
            //         <div
            //           className="form-item-error"
            //           style={{ color: '#ca2621' }}
            //         >
            //           {t('RESOURCES_REGISTED_IP_EXISTS')}
            //         </div>
            //         {/*})}*/}
            //       </div>
            //     </div>
            //   </div>
            // </Form.Item>
          )}
          <div className={styles.title}>
            <Checkbox
              name="bmc"
              onClick={() => {
                setBmcCheck(!bmcCheck);
                setChkValidation(true);
              }}
            >
              {t('BMC')}
              <span className={`form-item-required ${bmcCheck ? '' : 'hide'}`}>
                *
              </span>
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
                    rules={[
                      {
                        required: true,
                        validator: bmcIpValidator,
                      },
                    ]}
                  >
                    <Input name={`bmcIp`} placeholder={t('IP')} />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    label={t('Interval') + ' (s)'}
                    rules={[
                      {
                        required: true,
                        validator: intervalValidator,
                      },
                    ]}
                  >
                    <Input
                      name={`bmcInterval`}
                      placeholder={t('Interval')}
                      type="number"
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    label={t('ID')}
                    rules={[
                      {
                        required: true,
                        validator: bmcIdValidator,
                      },
                    ]}
                  >
                    <Input name={`bmcId`} placeholder={t('ID')} />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    label={t('Password')}
                    rules={[
                      {
                        required: true,
                        validator: bmcPasswordValidator,
                      },
                    ]}
                  >
                    <InputPassword
                      name={`bmcPassword`}
                      type="password"
                      placeholder={t('Password')}
                    />
                  </Form.Item>
                </Column>
                {/* <Column>
                  <Button
                    onClick={onClickBmcValChk}
                    style={{
                      position: 'relative',
                      top: '12px',
                      left: '20px',
                    }}
                  >
                    {'check'}
                  </Button>
                </Column> */}
              </Columns>

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
            </Form.Group>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default RegistModal;
