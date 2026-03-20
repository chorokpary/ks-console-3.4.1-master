import { get, set, isEmpty } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Tooltip,
  Column,
  Columns,
  Icon,
} from '@kube-design/components';
import { Modal } from 'components/Base';
import { ProjectSelect } from 'components/Inputs'

import { PATTERN_USER_NAME, PATTERN_IP } from 'utils/constants';
import ExteranlLoadBalancerStore from 'stores/resources/externalloadbalancers';
import styles from './index.scss';

import classnames from 'classnames'

const RegistModal = props => {

  const loadBalancerStore = new ExteranlLoadBalancerStore();

  const regexPort = /[^0123456789-]/g;

  const protocolOptions = [
    { value: 'TCP', label: 'TCP' },
    { value: 'UDP', label: 'UDP' },
  ];

  const methodOptions = [
    { value: 'round_robin', label: 'Round robin' },
    { value: 'least_connections', label: 'Least connections' },
    { value: 'weighted_round_robin', label: 'Weighted round robin' },
    { value: 'weighted_least_connections', label: 'Weighted least connections' },
    { value: 'iP_hash', label: 'IP hash' },
    { value: 'uri_hash', label: 'Uri hash' },
  ];

   const monitorTypeOptions = [
    { value: 'TCP', label: 'TCP' },
    { value: 'UDP', label: 'UDP' },
    { value: 'HTTP', label: 'HTTP' },
    { value: 'HTTPS', label: 'HTTPS' },
    { value: 'ICMP', label: 'ICMP' },
    { value: 'SNMP', label: 'SNMP' },
  ];

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [regStep, setRegStep] = useState(1)
  const [submitButtonFlag, setSubmitButtonFlag] = useState(false)

  const [vmDataList, setVmDataList] = useState([]);
  const [driverList, setDriverList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  
  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default'
  );

  const [isListeners, setIsListeners] = useState(true);
  const [isDupListeners, setIsDupListeners] = useState(true);
  const [isDupProject, setIsDupProject] = useState(true);
  const [isDupLoadbalancer, setIsDupLoadbalancer] = useState(true);
  const [isDupLoadbalancerIp, setIsDupLoadbalancerIp] = useState(true);
  
  const [isPools, setIsPools] = useState(true);

  const existedProjects = props.store.projectNameList
  const existedLoadbalancers = props.store.loadbalancerNameList
  const existedLoadbalancersIp = props.store.loadbalancerIpList
  
  useEffect(() => {
    const getCreateData = async () => {
      const result = await loadBalancerStore.fetchDrivers();

      setDriverList(result.drivers || []);  

      const listVm = await loadBalancerStore.fetchVmList(props);
      setVmDataList(listVm.vms); 
      
      const listMember = await loadBalancerStore.fetchExistedList('M');
      setMemberList(listMember)
    };

    getCreateData();
  }, []);

  const vmOptions = () => {
    const opt = vmDataList
      .map(obj => ({
        label: t(obj.name),
        value: t(obj.name),
        disabled: obj.state !== 'Running' || memberList.includes(obj.name),
      }));
    return opt;
  };

  const driverOptions = () => {
      const opt = driverList
      .filter(el => el.enabled === true)
      .map(obj => ({
        label: t(obj.name),
        value: t(obj.id),
      }));
      return opt;
  }

  const poolOptions = () => {
    const opt = formPoolFields
      .map(obj => ({
        label: t(obj.poolName),
        value: t(obj.poolName),
      }));
    return opt;
  };

  const isDuplicateListener = arr => {
    const set = new Set()
    const hasDuplicated = arr.some(({ protocol, port }) => {
      const key = `${protocol}-${port}`
      if (set.has(key)) return true
      set.add(key)
      return false
    })
    return hasDuplicated
  };

  const handleOk = () => {
    console.log("handleOk ~~!!!")
    const onOk = props.onOk;
    const { data } = form.current.props;

    form.current.validator(() => {
      setSubmitButtonFlag(true)

      if(!PATTERN_IP.test(data.ip)){
        return false;
      }
  
      data.formListenerFields = formListenerFields
      data.formPoolFields = formPoolFields
      data.formMemberIpFields = formMemberIpFields
      // console.log(JSON.stringify(data))
      onOk({ lb: data });          
    });
  };

  // Validation 시작 ==================================================
  const closeModal = () => {
    setModalView(false);
  };

  const listenerObj = {
    ruleType: t('RESOURCES_SPECIFY_USER'),
    protocol: 'TCP',
    port: '22',
    isCustom: true,
    validPort: { isValid: false, message: t('RESOURCES_PORT_RANGE_DESC') },
    message: '',
    pool: '',
  };
  const [formListenerFields, setFormListenerFields] = useState([listenerObj])
   // 리스너 handler
  const handleListener = {
    handleAddFields: () => {
      const values = [...formListenerFields, listenerObj];
      setFormListenerFields(values);
      if ([...formListenerFields].length < 1) {
        setIsListeners(true);
      }
    },

    handleRemoveFields: i => {
      const values = [...formListenerFields].filter((obj, idx) => idx !== i);
      setFormListenerFields(values);
      if (values.length < 1) {
        setIsListeners(false);
      }

      if(isDuplicateListener(values)){
        setIsDupListeners(false)
      }else{          
        setIsDupListeners(true)
      }  
    },

    handleInputChange: (i, field, e) => {
      const values = [...formListenerFields];
      const val = e.currentTarget.value;

      if (regexPort.test(val) || val < 1 || val > 65535) {
        values[i].validPort.isValid = true;
      } else {
        values[i].validPort.isValid = false;
      }
      values[i].port = val;
      setIsListeners(true);
      setFormListenerFields(values);
    },

    handleSelectClick: (i, field, val) => {
      let values = [...formListenerFields];
      values[i][field] = val;
      setIsListeners(true);
      setFormListenerFields(values);
    },

    deleteMessage: i => {
      const values = [...formListenerFields];
      values[i].message = '';
      setFormListenerFields(values);
    },
  }; // end 리스너

  const poolObj = {
    poolName: '',
    lbmethod: '',
    member: [],
    type: '',
    interval: '',
    timeout: '',
    description: '',
    changed: {
      poolName: false,
      lbmethod: false,
    },
    isMember: {
      checked: false,
      valid: false,
    },
    isMonitor: {
      checked: false,
      valid: false,
    },
    isDuplicate: false,
  };
  const [formPoolFields, setFormPoolFields] = useState([poolObj])
   // Pool handler
  const handlePool = {
    handleAddFields: () => {
      const values = [...formPoolFields, poolObj];
      setFormPoolFields(values);
      if ([...formPoolFields].length < 1) {
        setIsPools(true);
      }

      //다음 멤버 초기값 추가
      const nextIndex = Object.keys(formMemberIpFields).length;
      const udpateMemberObj = {
        ...formMemberIpFields,
        [nextIndex]: [memberObj],
      };
      setFormMemberIpFields(udpateMemberObj);
    },

    handleRemoveFields: i => {
      const values = [...formPoolFields].filter((obj, idx) => idx !== i);
      setFormPoolFields(values);
      if (values.length < 1) {
        setIsPools(false);
      }  

      // pool 삭제 시 member 삭제 처리
      const memberValues = formMemberIpFields
      delete memberValues[i]
      setFormMemberIpFields(memberValues)
    },

    handleInputChange: (i, field, e) => {
      const values = [...formPoolFields];
      const val = e.currentTarget.value;
      values[i][field] = val;
      values[i].changed[field] = true;

      if (field === 'poolName') {
        // 현재 index는 제외하고, 같은 poolName을 가진 항목이 이미 있는지 체크
        const isDuplicate =  formPoolFields.some((item, index) => index !== i && item.poolName === val)
        values[i].isDuplicate = isDuplicate
      }

      setIsPools(true);
      setFormPoolFields(values);
    },

    handleSelectClick: (i, field, val) => {
      let values = [...formPoolFields];
      values[i][field] = val;
      values[i].changed[field] = true;
      setFormPoolFields(values);
    },
  }; // end Pool

  const memberObj = {
    vmId: t('RESOURCES_SELECT'),
    memberIp: '',
    memberPort: '',
    memberWeight: '',
    message: '',
    validPort: { isValid: false, message: t('RESOURCES_PORT_RANGE_DESC') },
    validWeight: { isValid: false, message: t('RESOURCES_WEIGHT_RANGE_DESC') },
  };
  const [formMemberIpFields, setFormMemberIpFields] = useState({0: [memberObj]});  
  // 멤버 handler
  const handleMemberIp = {
    handleAddFields: (i) => {
      setFormMemberIpFields(prev => ({
        ...prev,
        [i]: [...(prev[i] || []), memberObj,],
      }));
    },

    handleRemoveFields: (index, i) => {
      const values = {
        ...formMemberIpFields,
        [i]: formMemberIpFields[i].filter((_, rowIdx) => rowIdx !== index),
      };
      
      setFormMemberIpFields(values);
      inputPoolMemer(values[i], i) // 풀에 멤버 추가
    },

    handleInputChange: (index, field, e, i) => {
      const val = e.currentTarget.value;

      const updataValues = {
        ...formMemberIpFields,
        [i]: formMemberIpFields[i].map((item, idx) =>
          idx === index
            ? { ...item, [field]: val }
            : item
        ),
      };

      if (field === 'memberPort') {
        if (regexPort.test(val) || val < 1 || val > 65535) {
          updataValues[i][index].validPort.isValid = true;
        } else {
          updataValues[i][index].validPort.isValid = false;
        }
      }else if (field === 'memberWeight') {
        if (val < 1 || val > 100) {
          updataValues[i][index].validWeight.isValid = true;
        } else {
          updataValues[i][index].validWeight.isValid = false;
        }
      }

      setFormMemberIpFields(updataValues);
      inputPoolMemer(updataValues[i], i)
    },

    handleSelectClick: (index, val, i) => {
      //각 풀에서 체크
      const list = formMemberIpFields[i] || [];
      const isDuplicate = list.some((item, idx) => item.vmId === val && idx !== index);

      // 전체에서 체크
      const listAll = formMemberIpFields || [];
      const vmIds = Object.values(listAll).flatMap(arr => arr.map(item => item.vmId))
      const isDuplicateAll = vmIds.includes(val)

      const opt = vmDataList
        .filter(el => el.name === val)
        .map(obj => {
          return obj.networks.map(network => ({
              value: network.ip,
            }));
        });

      const values = {
        ...formMemberIpFields,
        [i]: list.map((item, idx) => {
          if (idx !== index) return item;

          if (!isDuplicateAll || val === '') {
            return {
              ...item,
              vmId: val,
              memberIp: opt[0][0].value,
              message: '',
            };
          }

          return {
            ...item,
            message: t('RESOURCES_ALREADY_SELECTED_VM_NAME'),
          };
        }),
      };

      setFormMemberIpFields(values);
      inputPoolMemer(values[i], i);

      if (isDuplicateAll) {
        setTimeout(() => {
          handleMemberIp.deleteMessage(index, i);
        }, 1000);
      }
    },

    deleteMessage: (index, i) => {
      const values = {
        ...formMemberIpFields,
        [i]: formMemberIpFields[i].map((item, idx) =>
          idx === index
            ? { ...item, message: '' }
            : item
        ),
      };

      setFormMemberIpFields(values);
      inputPoolMemer(values[i], i);
    },

  }; // end 멤버

  const inputPoolMemer = (values, i) => {
    const poolValues = [...formPoolFields];
    poolValues[i].member = values;
    setFormPoolFields(poolValues);   
  }

  const handlePoolValidation = () => {

    const SELECT_LABEL = t('RESOURCES_SELECT')
    // acc : 누적 객체 (최종 결과)
    // key : pool index ("0", "1")
    // list : 해당 pool의 member 배열
    const memberCheckByIndex = Object.entries(formMemberIpFields).reduce(
      (acc, [key, list]) => {
        acc[key] = list.every(item =>
          item.vmId &&
          item.vmId !== SELECT_LABEL &&
          !isEmpty(item.memberIp) &&
          !isEmpty(item.memberPort) &&
          !isEmpty(item.memberWeight)
        );
        return acc;
      },
      {}
    );

    const values = [...formPoolFields];
    values.forEach((v, index) => {
      const hasType = !isEmpty(v?.type);
      
      let isIntervalValid = true;

      if (hasType) {
        if (isEmpty(v?.interval) || isEmpty(v?.timeout)) {
          isIntervalValid = false;
        } else {
          const interval = Number(v.interval);
          const timeout = Number(v.timeout);
          isIntervalValid = !Number.isNaN(interval) && !Number.isNaN(timeout) && interval < timeout;
        }
      }
        
      v.changed.poolName = true;
      v.changed.lbmethod = true;
      v.isMember.checked = true;
      v.isMember.valid = memberCheckByIndex[index];
      v.isMonitor.checked = true;
      v.isMonitor.valid = isIntervalValid;
    });

    setFormPoolFields(values);
  };

  const stepMoveCheck = step => {
    const { data } = form.current.props

    if (step === 1) {
      if (
        (data.name === undefined ||
          data.driverId === undefined ||
          !PATTERN_USER_NAME.test(data.name) ||
          data.projectName === undefined ||
          !PATTERN_USER_NAME.test(data.projectName) ||
          data.ip === undefined ||
          data.ip == "" ||
          !isDupProject ||
          !isDupLoadbalancer ||
          !isDupLoadbalancerIp ||
          !PATTERN_IP.test(data.ip)                
         )
      ) {
        handleOk()
      } else {
        setRegStep(2)
      }
    }

     if (step === 2) {
    
      const isPoolCheck = formPoolFields.every(item => !isEmpty(item.poolName) && !isEmpty(item.lbmethod) && !item.isDuplicate)

      const SELECT_LABEL = t('RESOURCES_SELECT');
      const allMemberCheck = Object.values(formMemberIpFields).every(list =>
                              list.every(item =>
                                item.vmId &&
                                item.vmId !== SELECT_LABEL &&
                                !isEmpty(item.memberIp) &&
                                !isEmpty(item.memberPort) &&
                                !isEmpty(item.memberWeight)
                              )
                            );

      const allMonitorCheck = Object.entries(formPoolFields).every(
                              ([index, v]) => {

                                const hasType = !isEmpty(v?.type);   

                                let isIntervalValid = true;
                                if (hasType) {
                                  if (isEmpty(v?.interval) || isEmpty(v?.timeout)) {
                                    isIntervalValid = false;
                                  } else {
                                    const interval = Number(v.interval);
                                    const timeout = Number(v.timeout);
                                    isIntervalValid = !Number.isNaN(interval) && !Number.isNaN(timeout) && interval < timeout;
                                  }
                                }
                                return isIntervalValid
                              }
                            );

      if(isPoolCheck && allMemberCheck && allMonitorCheck){
        setRegStep(3)
        handlePoolValidation()  // 필드별 체크해서 오류 노출
      }else{
        handlePoolValidation()
      }
      setSubmitButtonFlag(false)
    }

    if (step === 3) {
      
      const SELECT_LABEL = t('RESOURCES_SELECT')

      // 리스너 입력 체크
      const allListenerCheck = formListenerFields.every(item =>
        item.pool !== SELECT_LABEL &&
        !isEmpty(item.pool) &&  
        !isEmpty(item.port)
      )

      if (allListenerCheck){
        setIsListeners(true)
        if(isDuplicateListener(formListenerFields)){
          setIsDupListeners(false)
        }else{
          setIsDupListeners(true)
          setRegStep(4)
        }        
      }else{
        setIsListeners(false)
      }  

    }   
  }

  const fnGetModalFooter = () => {
    return (
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
                stepMoveCheck(1)
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
                setRegStep(regStep - 1)
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(2)
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
         {regStep === 3 && (
          <>
            <Button
              onClick={() => closeModal()}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_CANCEL')}
            </Button>
            <Button
              onClick={() => {
                setRegStep(regStep - 1)
              }}
              className={classnames(styles['btn'], styles['btn-default'])}
            >
              {t('RESOURCES_PREVIOUS')}
            </Button>
            <Button
              type="control"
              onClick={() => {
                stepMoveCheck(3)
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_NEXT')}
            </Button>
          </>
        )}
        {regStep === 4 && (
          <>
            {submitButtonFlag && props.isSubmitting ? (
              <>
                <Button
                  onClick={() => closeModal()}
                  className={classnames(styles['btn'], styles['btn-default'])}
                  disabled
                >
                  {t('RESOURCES_CANCEL')}
                </Button>
                <Button
                  onClick={() => {
                    setRegStep(3)
                  }}
                  className={classnames(styles['btn'], styles['btn-default'])}
                  disabled
                >
                  {t('RESOURCES_PREVIOUS')}
                </Button>
                <Button
                  onClick={() => {
                    handleOk()
                  }}
                  className={classnames(styles['btn'], styles['btn-control'])}
                  disabled
                  loading={true}
                >
                  {t('RESOURCES_CREATE')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => closeModal()}
                  className={classnames(styles['btn'], styles['btn-default'])}
                >
                  {t('RESOURCES_CANCEL')}
                </Button>
                <Button
                  onClick={() => {
                    setRegStep(3)
                  }}
                  className={classnames(styles['btn'], styles['btn-default'])}
                >
                  {t('RESOURCES_PREVIOUS')}
                </Button>
                <Button
                  onClick={() => {
                    handleOk()
                  }}
                  className={classnames(styles['btn'], styles['btn-control'])}
                >
                  {t('RESOURCES_CREATE')}
                </Button>
              </>
            )}
          </>
        )}
      </>
    )
  }
  
  return (
    <>
      <Modal
        icon="pen"
        width={960}
        title={props.title}
        onCancel={closeModal}
        bodyClassName={styles.body}
        onOk={handleOk}
        cancelText={t('RESOURCES_CANCEL')}
        visible={modelView}
        hideFooter
        disableCloseButton={!!(submitButtonFlag && props.isSubmitting)}
      >
        <Form data={formData} ref={form}>
          <div className={styles.tab_process}>
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
              <div className={styles.basic}></div>
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
              <div className={styles.network}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_POOL_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep === 2
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
                `${regStep === 3 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${
                    regStep === 3
                      ? styles.current
                      : regStep > 3
                      ? styles.done
                      : styles.todo
                  }`}
                ></div>
              </div>
              <div className={styles.detail}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_LISTENER_SETTINGS')}
                </div>
                <div className={styles.situation}>
                  {regStep === 3
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
                `${regStep === 4 ? styles.current : ''}`
              )}
            >
              <div className={styles.status}>
                <div
                  className={`${regStep === 4 ? styles.current : styles.todo}`}
                ></div>
              </div>
              <div className={styles.confirm}></div>
              <div className={styles.title}>
                <div className={styles.step_name}>
                  {t('RESOURCES_CHECK_INPUT_INFORMATION')}
                </div>
                <div className={styles.situation}>
                  {regStep === 4
                    ? t('RESOURCES_CURRENT')
                    : t('RESOURCES_NOT_SET')}
                </div>
              </div>
            </div>
          </div>

           {/* Content */}
            <div className={styles.pop_overflow_y}>
              <div className={styles.cont_boxwrap}>

                {/* 기본설정 설정 시작======================================== */}
                <div className={`${regStep === 1 ? '' : 'hide'}`}>
                  <Columns>
                    <Column>
                      <Form.Item
                        label={t('PROJECT_NAME')}
                        rules={[
                          { required: true, message: t('NAME_EMPTY_DESC') },
                          {
                            pattern: PATTERN_USER_NAME,
                            message: t('RESOURCES_INVALID_NAME_DESC'),
                          },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const name = `${value.trim()}`
                              // const isDuplicated = existedProjects.includes(name)
                              // setIsDupProject(isDuplicated ? false : true)
                              const isDuplicated = false; // 고정 처리
                              setIsDupProject(isDuplicated ? false : true)
                              return isDuplicated ? Promise.reject(new Error(t('RESOURCES_DUPLICATE_NAME'))) : Promise.resolve()
                            },
                          },
                        ]}
                        desc={t('NAME_DESC')}
                      >
                        <Input
                          name="projectName"
                          autoFocus={true}
                          maxLength={63}
                          style={{ maxWidth: 'none' }}
                        />
                      </Form.Item>
                    </Column>
                      <Column>                      
                        <Form.Item
                          label={t('RESOURCES_EXTERNAL_DRIVER')}
                          rules={[
                            { required: true, message: t('RESOURCES_SELECT_DRIVER') },
                          ]}
                        >
                           <Select
                              name="driverId"
                              defaultValue={driverOptions()[0]?.value}
                              options={driverOptions()}
                              placeholder={t('RESOURCES_SELECT')}
                            />
                        </Form.Item>                  
                      </Column>
                  </Columns>

                  <Columns>
                    <Column>
                        <Form.Item
                          label={t('RESOURCES_EXTERNAL_LB_NAME')}
                          rules={[
                            { required: true, message: t('NAME_EMPTY_DESC') },
                            {
                              pattern: PATTERN_USER_NAME,
                              message: t('RESOURCES_INVALID_NAME_DESC'),
                            },
                            {
                              validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                const name = `${value.trim()}`
                                const isDuplicated = existedLoadbalancers.includes(name)
                                setIsDupLoadbalancer(isDuplicated ? false : true)
                                return isDuplicated ? Promise.reject(new Error(t('RESOURCES_DUPLICATE_NAME'))) : Promise.resolve()
                              },
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
                    </Column> 
                    <Column>
                      <Form.Item
                        label={t('IP')}
                        rules={[
                          { required: true, message: t('RESOURCES_IP_EMPTY_DESC') },
                          {
                            pattern: PATTERN_IP,
                            message: t('RESOURCES_IP_VALID'),
                          },
                          {
                              validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                const name = `${value.trim()}`
                                const isDuplicated = existedLoadbalancersIp.includes(name)
                                setIsDupLoadbalancerIp(isDuplicated ? false : true)
                                return isDuplicated ? Promise.reject(new Error(t('RESOURCES_ALREADY_USED_IP'))) : Promise.resolve()
                              },
                          },               
                        ]}
                      >
                        <Input
                          name="ip"
                          maxLength={63}
                          style={{ maxWidth: 'none' }}
                        />
                      </Form.Item>
                    </Column>                      
                  </Columns>

                  <Form.Item
                    className={styles.textarea}
                    label={t('RESOURCES_DESCRIPTION')}
                    desc={t('DESCRIPTION_DESC')}
                  >
                    <TextArea
                      name="description"
                      maxLength={256}
                      style={{ maxWidth: 'none' }}
                    />
                  </Form.Item>
                </div>
                {/* 기본설정 설정 끝========================================== */}

                {/* 풀 설정 시작======================================== */}
                <div className={`${regStep === 2 ? '' : 'hide'}`}>                
                  
                  <div className={styles.header}>
                    <div className={styles.left}>
                      {t('RESOURCES_POOL')} <span className="form-item-required">*</span>
                    </div>
                    <Button
                      onClick={handlePool.handleAddFields}
                    >
                      {t('RESOURCES_ADD_POOL')}
                    </Button>
                  </div>
                                    
                  <div style={{ padding: 10 }} />   
                  <div className={styles.wrapper_pool}>  
                    {/* Poll List Start ================================================*/}
                    {formPoolFields.map((v, i) => (
                      <div key={`pool_${i}`}>
                        <div className={styles.wrapper}>   
                          <div className={styles.pool_title} >
                              <span>{t('RESOURCES_POOL')} {`#${i + 1}`}</span>
                              <Icon className={`${i === 0 ? 'hide' : ''}`} name="close" onClick={() => handlePool.handleRemoveFields(i)}/>                         
                          </div>                   
                          <div style={{ padding: 10 }} />
                          <Columns>
                            <Column>
                                <>
                                  {t('RESOURCES_NAME')}                                  
                                  <span className="form-item-required">*</span>  
                                  <div style={{ padding: 2 }} />
                                  <Input
                                    name="poolName"
                                    maxLength={63}
                                    style={{ maxWidth: 'none' }}
                                    onChange={e => handlePool.handleInputChange(i,'poolName',e)}
                                  />
                                  <div className={`form-item-error ${ !v.changed.poolName || v.poolName ? 'hide' : ''}`}>
                                    {t('NAME_EMPTY_DESC')}
                                  </div>
                                  <div className={`form-item-error ${ v.isDuplicate ? '' : 'hide'}`}>
                                    {t('RESOURCES_DUPLICATE_NAME')}
                                  </div>                                  
                                </>                                
                            </Column> 
                            <Column>                             
                                <>
                                  {'LB method'}
                                  <span className="form-item-required">*</span>  
                                  <div style={{ padding: 2 }} />
                                  <Select
                                    name="lbmethod"
                                    options={methodOptions}
                                    onChange={e => handlePool.handleSelectClick(i,'lbmethod',e)}
                                    value={v.lbmethod}
                                    placeholder={t('RESOURCES_SELECT')}
                                  />
                                  <div className={`form-item-error ${!v.changed.lbmethod || v.lbmethod ? 'hide' : ''}`}>
                                    {t('RESOURCES_SELECT_LB_METHOD_TIP')}
                                  </div>
                                </>
                            </Column>                      
                          </Columns>                      
                          <div style={{ padding: 10 }} />
                          {t('RESOURCES_MEMBER')}
                          <span className="form-item-required">*</span>                      
                          <Form.Item>
                            <div className={styles.wrapper}>
                              <div className={styles.table}>
                                <table>
                                  <colgroup>
                                    <col width="20%" />
                                    <col width="20%" />
                                    <col width="20%" />
                                    <col width="20%" />
                                    <col width="10%" />
                                  </colgroup>
                                  <thead>
                                    <tr>
                                      <th><strong>{t('RESOURCES_VM')}</strong></th>
                                      <th><strong>{t('IP')}</strong></th>
                                      <th><strong>{t('PORT')}</strong></th>
                                      <th><strong>Weight</strong></th>
                                      <th><strong></strong></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {formMemberIpFields[i].map((v, index) => (
                                      <tr key={`vm_${index}`}>
                                        <td>
                                          <Select
                                            value={v.message ? v.message : v.vmId}
                                            options={vmOptions()}
                                            onChange={e => handleMemberIp.handleSelectClick(index, e, i)}
                                          />                                          
                                        </td>
                                        <td><Input type="text" value={v.memberIp} disabled /></td>
                                        {/* <td><Input type="text" value={v.memberIp} onChange={e => handleMemberIp.handleInputChange(index,'memberIp',e, i)}/></td> */}
                                        <td>
                                          <Tooltip
                                            content={v.validPort?.isValid ? v.validPort.message : ''}
                                            placement="right"
                                            always={v.validPort?.isValid}
                                          >
                                            <Input type="number" value={v.memberPort} onChange={e => handleMemberIp.handleInputChange(index,'memberPort',e, i)}/>
                                          </Tooltip>
                                        </td>
                                        <td>
                                          <Tooltip
                                            content={v.validWeight?.isValid ? v.validWeight.message : ''}
                                            placement="right"
                                            always={v.validWeight?.isValid}
                                          >
                                            <Input type="number" value={v.memberWeight} onChange={e => handleMemberIp.handleInputChange(index,'memberWeight',e, i)}/>
                                          </Tooltip>
                                        </td>
                                        <td className={`${index === 0 ? 'hide' : ''}`}>
                                          <Button type="flat" icon="trash" onClick={() => handleMemberIp.handleRemoveFields(index, i)} />                                            
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>                              
                                <div
                                  className={`form-item-error ${!v.isMember.checked ? 'hide' : v.isMember.valid ? 'hide' : ''}`}
                                  style={{ marginLeft: '10px' }}
                                >
                                  {t('RESOURCES_MEMBER_EMPTY_DESC')}
                                </div>
                              </div>
                              <div className="text-right">
                                <Button className={styles.add} onClick={() => handleMemberIp.handleAddFields(i)}>
                                  {t('RESOURCES_ADD')}
                                </Button>
                              </div>
                            </div>
                          </Form.Item>
                          <div style={{ padding: 10 }} />
                          {t('RESOURCES_MONITOR')}
                          <Form.Item>
                            <div className={styles.wrapper}>
                              <div className={styles.table}>
                                <table>
                                  <colgroup>
                                    <col width="25%" />
                                    <col width="25%" />
                                    <col width="25%" />
                                    <col width="25%" />
                                  </colgroup>
                                  <thead>
                                    <tr>
                                      <th><strong>{t('RESOURCES_TYPE')}</strong></th>
                                      <th><strong>{t('RESOURCES_INTERVAL')}</strong></th>
                                      <th><strong>{t('RESOURCES_TIME_OUT')}</strong></th>
                                      <th><strong>{t('RESOURCES_DESCRIPTION')}</strong></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                      <tr>
                                        <td>
                                          <Select
                                            name="monitortype"
                                            options={monitorTypeOptions}
                                            onChange={e => handlePool.handleSelectClick(i,'type',e)}
                                            value={v.type}
                                            placeholder={t('RESOURCES_SELECT')}
                                          />
                                        </td>
                                        <td><Input type="number" onChange={e => handlePool.handleInputChange(i,'interval',e)}/></td>
                                        <td><Input type="number" onChange={e => handlePool.handleInputChange(i,'timeout',e)}/></td>
                                        <td><Input type="text" onChange={e => handlePool.handleInputChange(i,'description',e)}/></td>
                                      </tr>
                                  </tbody>
                                </table>
                                <div
                                  className={`form-item-error ${!v.isMonitor.checked ? 'hide' : v.isMonitor.valid ? 'hide' : ''}`}
                                  style={{ marginLeft: '10px' }}
                                >
                                  {t('RESOURCES_INTERVAL_LESSS_THAN_TIMEOUT_DESC')}
                                </div>
                                {v.type && 
                                  <div
                                    className={`form-item-error ${(v.interval && v.timeout) ? 'hide' : ''}`}
                                    style={{ marginLeft: '10px' }}
                                  >
                                    {t('RESOURCES_MONITOR_VALID')}
                                  </div>
                                }
                              </div>
                            </div>
                          </Form.Item>                       
                        </div>        
                        <div style={{ padding: 10 }} />      
                      </div>
                    ))}
                    {/* Poll List End ================================================*/}
                    <div style={{ padding: 10 }} />                    
                  </div> 
                                
                </div>
                {/* 풀 설정 끝========================================== */}

                {/* 리스너 설정 시작======================================== */}
                <div className={`${regStep === 3 ? '' : 'hide'}`}>
                  {t('RESOURCES_LISTENER')}
                    <span className="form-item-required">*</span>
                    <Form.Item>
                      <div className={styles.wrapper}>
                        <div className={styles.table}>
                          <table>
                            <colgroup>
                              <col width="20%" />
                              <col width="15%" />
                              <col width="20%" />
                              <col width="10%" />
                            </colgroup>
                            <thead>
                              <tr>                              
                                <th>
                                  <strong>{t('RESOURCES_PROTOCOL')}</strong>
                                </th>
                                <th>
                                  <strong>
                                    {t('PORT')}
                                    <span className="form-item-required">*</span>
                                  </strong>
                                </th>
                                <th>
                                  <strong>
                                    {t('RESOURCES_POOL')}
                                    <span className="form-item-required">*</span>
                                  </strong>
                                </th>
                                <th>
                                  <strong></strong>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {formListenerFields.map((v, i) => (
                                <tr key={`listener_${i}`}>
                                  <td>
                                    <Select
                                      value={v.message ? v.message : v.protocol}
                                      options={protocolOptions}
                                      onChange={e => handleListener.handleSelectClick(i, 'protocol', e)}
                                      disabled={!v.isCustom}
                                    />
                                  </td>
                                  <td>
                                    <Tooltip
                                      content={v.validPort?.isValid ? v.validPort.message : ''}
                                      placement="right"
                                      always={v.validPort?.isValid}
                                    >
                                      <Input
                                        type="text"
                                        onChange={e => handleListener.handleInputChange(i,'port',e)}
                                        value={v.port}
                                      />
                                    </Tooltip> 
                                  </td>
                                  <td>
                                    <Select
                                      value={v.message ? v.message : v.pool}
                                      options={poolOptions()}
                                      onChange={e => handleListener.handleSelectClick(i, 'pool', e)}
                                      placeholder={t('RESOURCES_SELECT')}
                                    />
                                  </td>
                                  <td className={`${i === 0 ? 'hide' : ''}`}>
                                    <Button
                                      type="flat"
                                      icon="trash"
                                      onClick={() => handleListener.handleRemoveFields(i)}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>                         
                        </div>
                        <div className="text-left">
                          <div
                            className={`form-item-error ${isListeners ? 'hide' : ''}`}
                            style={{ marginLeft: '10px' }}
                          >
                            {t('RESOURCES_LISTENER_EMPTY_DESC')}
                          </div>
                          <div
                            className={`form-item-error ${isDupListeners ? 'hide' : ''}`}
                            style={{ marginLeft: '10px' }}
                          >
                            {t('RESOURCES_DUPLICATE_LISTENER_TIP')}
                          </div>
                        </div>
                        <div className="text-right">                           
                          <Button
                            className={styles.add}
                            onClick={handleListener.handleAddFields}
                            disabled={formListenerFields.length >= (formPoolFields.length * 4) ? true : false}
                          >
                            {t('RESOURCES_ADD')}
                          </Button>
                        </div>
                      </div>
                    </Form.Item>    
                </div>
                {/* 리스너 설정 끝========================================== */}

                {/* 입력 정보 확인 시작======================================== */}
                <div className={`${regStep === 4 ? '' : 'hide'}`}>
                  <div className={styles.wrapper_pool}>  
                    <div className={styles.boxwrap}>

                      {/* 기본 설정 start */}
                      <div className={styles.box_style}>
                        <div className={styles.boxtitle}>
                          <div className={styles.titlename}>
                            <span className={styles.basic}></span>
                            <label>{t('RESOURCES_DEFAULT_SETTINGS')}</label>
                          </div>
                          <Button
                            icon="pen"
                            onClick={() => {
                              setRegStep(1)
                            }}
                          ></Button>
                        </div>
                        <div className={styles.table}>
                          <table>
                            <colgroup>
                              <col width="20%" />
                              <col width="20%" />
                              <col width="20%" />
                              <col width="20%" />
                              <col width="20%" />
                            </colgroup>
                            <thead>
                              <tr>
                              <th>{t('RESOURCES_PROJECT')}</th>
                              <th>{t('RESOURCES_NAME')}</th>                              
                              <th>{t('IP')}</th>
                              <th>{t('RESOURCES_EXTERNAL_DRIVER')}</th>
                              <th>{t('RESOURCES_DESCRIPTION')}</th>
                              </tr>
                            </thead>
                            <tbody>  
                                <tr>                              
                                  <td>{form.current?.props?.data?.projectName}</td>
                                  <td>{form.current?.props?.data?.name}</td>
                                  <td>{form.current?.props?.data?.ip}</td>
                                  <td>{form.current?.props?.data?.driverId?.toUpperCase()}</td>
                                  <td>{form.current?.props?.data?.description}</td>
                                </tr>                          
                            </tbody>
                          </table>
                        </div>  
                      </div>
                      {/* 기본 설정 end */}

                      {/* 풀 설정 start */}  
                      <div className={styles.box_style}>
                        <div className={styles.boxtitle}>
                          <div className={styles.titlename}>
                            <span className={styles.detail}></span>
                            <label>{t('RESOURCES_POOL_SETTINGS')}</label>
                          </div>
                          <Button
                            icon="pen"
                            onClick={() => {
                              setRegStep(2)
                            }}
                          ></Button>
                        </div>
                      
                        {formPoolFields.map((v, i) => (
                          <div className={styles.box_wrapper} key={`info_pool_${i}`}>
                            <div className={styles.box_title}>
                              {t('RESOURCES_POOL')}{` #${i+1}`}
                            </div>   
                            {t('BASIC_INFORMATION')}     
                            <div className={styles.table}>
                              <table>
                                <colgroup>
                                  <col width="20%" />
                                  <col width="20%" />
                                  <col width="30%" />
                                  <col width="30%" />
                                </colgroup>
                                <thead>
                                  <tr>
                                    <th>{t('RESOURCES_NAME')}</th>
                                    <th>{'LB method'}</th>
                                    <th></th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>  
                                    <tr>                              
                                      <td>{v.poolName}</td>
                                      <td>{v.lbmethod}</td>
                                    </tr>                          
                                </tbody>
                              </table>
                            </div>  
                            <div style={{ padding: 10 }} /> 
                            {t('RESOURCES_MEMBER')}     
                            <div className={styles.table}>
                              <table>
                                <colgroup>
                                  <col width="20%" />
                                  <col width="20%" />
                                  <col width="20%" />
                                  <col width="40%" />
                                </colgroup>
                                <thead>
                                  <tr>
                                    <th>{t('RESOURCES_VM')}</th>
                                    <th>{t('IP')}</th>
                                    <th>{t('PORT')}</th>                                    
                                    <th>WEIGHT</th>                          
                                  </tr>
                                </thead>
                                <tbody>  
                                  {formMemberIpFields[i].map((v, index) => (
                                    <tr key={`info_vm_${index}`}>                              
                                      <td>{v.vmId}</td>
                                      <td>{v.memberIp}</td>
                                      <td>{v.memberPort}</td>
                                      <td>{v.memberWeight}</td>
                                    </tr>
                                  ))}                          
                                </tbody>
                              </table>
                            </div>  
                            <div style={{ padding: 10 }} /> 
                            {t('RESOURCES_MONITOR')}     
                            <div className={styles.table}>
                              <table>
                                <colgroup>
                                  <col width="20%" />
                                  <col width="20%" />
                                  <col width="20%" />
                                  <col width="40%" />
                                </colgroup>
                                <thead>
                                  <tr>
                                    <th>{t('RESOURCES_TYPE')}</th>
                                    <th>{t('RESOURCES_INTERVAL')}</th>
                                    <th>{t('RESOURCES_TIME_OUT')}</th>
                                    <th>{t('RESOURCES_DESCRIPTION')}</th>
                                  </tr>
                                </thead>
                                <tbody>  
                                    <tr>                              
                                      <td>{v.type}</td>
                                      <td>{v.interval}</td>
                                      <td>{v.timeout}</td>
                                      <td>{v.description}</td>
                                    </tr>                          
                                </tbody>
                              </table>
                            </div>  
                          </div> 
                        ))}
                      </div>
                      {/* 풀 설정 end */}

                      {/* 리스너 설정 start */}
                      <div className={styles.box_style}>
                        <div className={styles.boxtitle}>
                          <div className={styles.titlename}>
                            <span className={styles.network}></span>
                            <label>{t('RESOURCES_LISTENER_SETTINGS')}</label>
                          </div>
                          <Button
                            icon="pen"
                            onClick={() => {
                              setRegStep(3)
                            }}
                          ></Button>
                        </div>
                        <div className={styles.table}>
                          <table>
                            <colgroup>
                              <col width="20%" />
                              <col width="20%" />
                              <col width="30%" />
                              <col width="30%" />
                            </colgroup>
                            <thead>
                              <tr>
                              <th>{t('RESOURCES_PROTOCOL')}</th>
                              <th>{t('PORT')}</th>
                               <th>{t('RESOURCES_POOL')}</th>
                              <th></th>
                              </tr>
                            </thead>
                            <tbody>  
                              {formListenerFields.map((v, i) => (
                                <tr key={`info_listener_${i}`}>                              
                                  <td>{v.protocol}</td>
                                  <td>{v.port}</td>
                                  <td>{v.pool}</td>
                                </tr>      
                              ))}                      
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {/* 리스너 설정 end */}

                    </div>     
                  </div>
                </div>
                {/* 입력 정보 확인 끝========================================== */}
              
              </div>
            </div>
          {/* Content */}

          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>          
        </Form>
      </Modal>
    </>
  );
};

export default RegistModal;
