import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Column, Columns, Icon, Notify } from '@kube-design/components'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'
import * as common from "utils/resources"
import axios from 'axios'
import moment from 'moment-mini'

import { PATTERN_NAME } from 'utils/constants'

import VmStore from 'stores/resources/vms'

const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;
const regexIp = /(^(\d{1,3}\.){3}(\d{1,3})$)/;

const RegistModal = (props) => {

  const vmStore = new VmStore();
  
  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [file, setFile] = useState(null);
  const [fileValidError, setFilerValidError] = useState(false);
  const [fileExtError, setFileExtError] = useState(false);
  const [vmValidError, setVmValidError] = useState(false);

  const [submitButtonFlag, setSubmitButtonFlag] = useState(false);

  const [vmOptionList, setVmOptionList] = useState([]);

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {      

      const { data } = form.current.props;

      if(!file){
        setFilerValidError(true)
        setFileExtError(false)
        return false;
      }else{    
        const ext =  (file.name).split('.').pop().toLowerCase();
        const isValidExt = ext == "zip" ? true : false;
        if(isValidExt){
          setFilerValidError(false)
        }else{
          setFilerValidError(false)
          setFileExtError(true)
          return false;
        }     
      }
  
      const vmErrorArray = [];
      listVmInventory.map((obj) => {
        if(!!data['vm_'+obj] && !!data['ip_'+obj] && !!data['user_'+obj] && !!data['private_key_'+obj]){
          const isValidIpAddress = regexIp.test(data['ip_'+obj]) ? false : true;
          setVmValidError(isValidIpAddress);
          vmErrorArray.push(isValidIpAddress)
          return false;     
        }else{
          vmErrorArray.push(true)
          setVmValidError(true)
          return false;
        }  
      })

      if(vmErrorArray.includes(true)){
        return false;
      }

      const timestamp = moment(Date()).toISOString();

      const jsonData = {};
      const vmDataArray = [];
  
      jsonData.name = data.name;
      jsonData.version = data['version'];
      jsonData.registrant = globals.user.username;
      jsonData.registrationDate = timestamp;

      listVmInventory.map((item) => {
        const vmData = {
          name : data['vm_'+item],
          host : data['ip_'+item],
          user : data['user_'+item],
          privateKey : data['private_key_'+item]
        }
        vmDataArray.push(vmData)
      })

      jsonData.vm = vmDataArray

      console.log(JSON.stringify(jsonData))      

      const formData = new FormData();
      formData.append("body", JSON.stringify(jsonData));
      formData.append("playbook", file);

      setSubmitButtonFlag(true);
      setFileUploadStartFlag(true);

      axios.post('/app-manager/v1alpha1/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          fnProgress(progressEvent.total, progressEvent.loaded, percentCompleted);
          console.log(progressEvent.total, progressEvent.loaded, percentCompleted + '%')
        },
      }).then((res) => {
          console.log(res.data);
          onOk({ ...data })
      }).catch((err) => {
          // console.error(err);
          console.log(err);
      });

    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const nameValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_NAME_EMPTY_DESC') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('RESOURCES_NAME_EMPTY_DESC') })
      }
    }
    callback()
  }

  const versionValidator = (rule, value, callback) => {
    if (!!!value) {
      return callback({ message: t('RESOURCES_VERSION_EMPTY_DESC') })
    }
    callback()
  }

  const fnSelectedVmOption = async () => {
    const { data } = form.current.props;
    
    const selectedVmArray = [];
    await listVmInventory.map((item) => {
      !!data['vm_' + item] && selectedVmArray.push(data['vm_' + item])
    })

    const checkVmDisabled = await vmOptionList.map((item) => ({
      ...item,
      disabled: selectedVmArray.includes(item.value) ? true : false
    }));
  
    setVmOptionList(checkVmDisabled);
  }

  useEffect(() => {
    const getVmData = async () => {
      const listVms = await vmStore.fetchList();
      const opt = listVms.map((obj) => ({
        label: t(obj.name),
        value: t(obj.name),
        disabled: false,
      }))
      setVmOptionList(opt)
    };

    getVmData();
  }, [])
  
  // 가상머신 selectbox disabled 처리 Start ############################################
  const [vmSelect,setVmSelect] = useState([]);
  const fnChangeSelect = (val) => {
    setVmSelect(val)
  }

  useEffect(()=>{
    fnSelectedVmOption();
  },[vmSelect]);
  // 가상머신 selectbox disabled 처리 End ############################################

  // 가상머신 Add, Delete Start ############################################
  const nextVm = useRef(1);
  const [listVmInventory, setListVmInventory] = useState([1]);

  const handleVmInventory = {
    addColumn: () => {
      // if (listVmInventory.length > (vmOptionList.length-1)) {
      //   return false;
      // }
      nextVm.current += 1
      setListVmInventory(listVmInventory => [...listVmInventory, nextVm.current]);

    },
    delColumn: async (id) => {
      fnChangeSelect(listVmInventory.filter((el) => el !== id));
      setListVmInventory(listVmInventory.filter((el) => el !== id));    
    },
  }
  // 가상머신 Add, Delete End ############################################


  // File Upload Start ############################################
  const fileInputRef = useRef(null); 
  const [fileName, setFileName] = useState(); 

  const [fileUploadStartFlag, setFileUploadStartFlag] = useState(false);
  const uploadingText = useRef();
  const progressText = useRef();
  const progressbar = useRef();
  const loadedText = useRef();

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const onFileChange = async (e) => {
    var file = e.target.files[0];
    setFileName(file.name);
    setFile(file);
  }

  const fnProgress = (totalLoaded, fileSize, percentage) => {
    if (!!progressText.current === true) {
      progressText.current.textContent = percentage + " %";
      progressbar.current.style.transform = "translateX(" + percentage + "%)";
      loadedText.current.textContent =
        " ( " +
        fileSize.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        " / " +
        totalLoaded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        " Bytes ) ";
    }
  };
  // File Upload End ############################################

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form}>
         <div className={styles.cont_boxwrap}>

          <Form.Item
            label={t('RESOURCES_NAME')}
            rules={[
              { required: true, message: t('NAME_EMPTY_DESC') },
              {
                pattern: PATTERN_NAME,
                message: t('INVALID_NAME_DESC'),
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

          <Form.Item
                label={t('RESOURCES_VERSION')}
                rules={[{ required: true, validator: versionValidator }]}
              >
                <Input name="version" maxLength={253}
                  style={{ maxWidth: 'none' }} placeholder="v1" />
              </Form.Item>
   
          <Form.Item>     
          <>
            {t('RESOURCES_APP_DEPLOY_PLAYBOOK_ADD')}<span className="form-item-required">*</span>
            <div style={{ color: '#79879c' }}>({t('RESOURCES_APP_DEPLOY_PLAYBOOK_ADD_DESC')})</div>  
            <Form.Group>
              <div>
                <input type="file" 
                  onChange={onFileChange}
                  style={{ display: 'none' }}
                  ref={el => {
                    fileInputRef.current = el
                  }}
                  accept=".zip"
                />  
                <Input name="fileName" className={styles.file_input} value={fileName ? fileName : ''} readOnly />                     
                <Button type="primary" onClick={() => handleButtonClick()} >
                  {t('RESOURCES_FIND_FILE')}
                </Button>             
              </div>

              <div className={ fileUploadStartFlag ? '' : styles.hide }>      
                <div style={{margin: "10px 0 10px 0"}}>
                  * <span ref={uploadingText}>Uploading</span> :{" "}
                    <span ref={progressText}></span>
                    <span ref={loadedText}></span>
                  <div
                    style={{
                      backgroundColor: "#2275d7",
                      borderRadius: "4px",
                      boxShadow: "inset 0 0.5em 0.5em rgba(0,0,0,0.05)",
                      height: "10px",
                      margin: "2rem 0 2rem 0",
                      overflow: "hidden",
                      position: "relative",
                      transform: "translateZ(0)",
                      width: "100%",
                    }}
                  >
                    <div
                      ref={progressbar}
                      style={{
                        backgroundColor: "#828e94",
                        borderRadius: "4px",
                        boxShadow:
                          "inset 0 0.5em 0.5em rgba(94, 49, 49, 0.05)",
                        height: "10px",
                        transform: "translateX(0%)",
                      }}
                    ></div>
                  </div>
                </div>   
              </div>
              
              {fileValidError &&
                <div className="form-item-error" style={{ color: '#ca2621' }}>{t('RESOURCES_FILE_EMPTY_DESC')}</div>
              }    
              {fileExtError &&
                <div className="form-item-error" style={{ color: '#ca2621' }}>{t('RESOURCES_ONLY_UPLOAD_ZIP_FILE')}</div>
              }        
              </Form.Group>                         
          </>
          </Form.Item>   

          <Form.Item>     
            <>
              {t('RESOURCES_VM')}<span className="form-item-required">*</span>    
              <div style={{ color: '#79879c' }}>({t('RESOURCES_APP_DEPLOY_VM_ADD_DESC')})</div>            
              <Form.Group>
                {listVmInventory.map((obj, idx) => (
                  <div className={styles.scriptitem} key={obj}>
                        <Form.Item>
                        <Select
                           name={`vm_${obj}`}
                            placeholder={t('RESOURCES_NAME')}
                            options={vmOptionList}
                            onChange={() => fnSelectedVmOption()}
                        />
                        </Form.Item>
                        <div className={styles.scriptInput}>
                        <Form.Item>                          
                            <Input
                              name={`ip_${obj}`}
                              placeholder={t('IP')}
                              maxLength="15"
                            />
                        </Form.Item>
                        </div>
                        <div className={styles.scriptInput}>
                        <Form.Item>
                          <Input
                            name={`user_${obj}`}
                            placeholder={t('User')}
                          />
                        </Form.Item>
                        </div>
                        <div className={styles.scriptTextArea}>
                        <Form.Item>                         
                          <TextArea
                            name={`private_key_${obj}`}
                            rows="1"
                            cols="70"
                            defaultValue=""
                            placeholder={t('Private Key')}
                          />
                        </Form.Item>
                        </div>
                    <Button
                      type="flat"
                      icon="trash"
                      className={styles.scriptdelete}
                      onClick={() => listVmInventory.length > 1 && handleVmInventory.delColumn(obj)}
                    />
                  </div>
                ))}
                <div className="text-right">
                  <Button
                    className={styles.scriptadd}
                    onClick={handleVmInventory.addColumn}
                  >
                    {t('RESOURCES_ADD')}
                  </Button>
                </div>   
                {vmValidError &&
                  <div className="form-item-error" style={{ color: '#ca2621' }}>{t('애플리케이션이 배포될 가상머신을 입력해 주세요.')}</div>
                }                    
              </Form.Group>              
            </>
          </Form.Item>   
          </div>
        </Form>
        <div className={styles['modal-footer']}>
            <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button>
            {submitButtonFlag ?
              <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} disabled loading={true}>{t('RESOURCES_CONFIRM')}</Button>
              :
              <Button onClick={() => { handleOk() }} className={classnames(styles['btn'], styles['btn-control'])} >{t('RESOURCES_CONFIRM')}</Button>
            }
        </div>
      </Modal>

    </>
  );
};

export default RegistModal

