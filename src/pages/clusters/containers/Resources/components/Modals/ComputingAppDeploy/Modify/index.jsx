import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Column, Columns, Icon, Notify } from '@kube-design/components'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'
import * as common from "utils/resources"
import axios from 'axios'

import VmStore from 'stores/resources/vms'

const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;
const regexIp = /(^(\d{1,3}\.){3}(\d{1,3})$)/;

const ModifyModal = (props) => {

  const vmStore = new VmStore();
  
  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [file, setFile] = useState(null);
  const [fileValidError, setFilerValidError] = useState(false);
  const [fileExtError, setFileExtError] = useState(false);
  const [vmValidError, setVmValidError] = useState(false);

  const [vmOptionList, setVmOptionList] = useState([]);

  const vmInitInvetoryCount = props.store.detail.vm.length;

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

      const jsonData = {};
      const vmDataArray = [];
  
      jsonData.name = data.name;
      jsonData.version = data['version'];

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

      const formData = new FormData();
      formData.append("body", JSON.stringify(jsonData));
      formData.append("playbook", file);

      axios.put('/app-manager/v1alpha1/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res) => {
          console.log(res.data);
          onOk({ ...data })
      }).catch((err) => {
          console.log("AAAAAAAAAA");
          console.error(err);
          Notify.error(t('DELETING_CURRENT_USER_NOT_ALLOWED'))
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
    const { data } = form?.current?.props;
    
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

    const getVmInventoryData = async () => {
      (props.store.detail.vm).map((item, index) => {
        setListVmInventory(listVmInventory => [...listVmInventory, Number(index+1)]);
      })
    };

    getVmData();
    getVmInventoryData();
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
  const nextVm = useRef(vmInitInvetoryCount);
  const [listVmInventory, setListVmInventory] = useState([]);

  const handleVmInventory = {
    addColumn: () => {
      listVmInventory.length == 1 && fnSelectedVmOption();
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

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const onFileChange = async (e) => {
    var file = e.target.files[0];
    setFileName(file.name);
    setFile(file);
  }
  // File Upload End ############################################

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      >
        <Form data={formData} ref={form}>

          <Form.Item
            label={t('RESOURCES_NAME')}
            rules={[{ required: true, validator: nameValidator }]}
            desc={t('NAME_DESC')}
          >
            <Input
              name="name"
              autoFocus={true}
              maxLength={63}
              style={{ maxWidth: 'none' }}
              defaultValue={props.store.detail.name}
              disabled
            />
          </Form.Item>

          <Form.Item
                label={t('RESOURCES_VERSION')}
                rules={[{ required: true, validator: versionValidator }]}
              >
                <Input name="version" maxLength={253}
                  style={{ maxWidth: 'none' }} placeholder="v1" 
                  defaultValue={props.store.detail.version}
                  />
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
                {/* {(props.store.detail.vm).map((obj, idx) => (
                  <div className={styles.scriptitem} key={idx+1}>
                    <Columns>
                      <Column>
                        <Form.Item>
                        <Select
                          name={`vm_${idx+1}`}
                            placeholder={t('RESOURCES_NAME')}
                            options={vmOptionList}
                            onChange={() => fnSelectedVmOption()}  
                            defaultValue={obj.name}
                        />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item>
                          <Input
                            name={`ip_${idx+1}`}
                            placeholder={t('IP')}          
                            defaultValue={obj.host}                             
                          />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item>
                          <Input
                            name={`user_${idx+1}`}
                            placeholder={t('User')}
                            defaultValue={obj.user}                  
                          />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item>
                          <TextArea
                            name={`private_key_${idx+1}`}
                            rows="1"
                            placeholder={t('Private Key')}
                            defaultValue={obj.privateKey}                  
                          />
                        </Form.Item>
                      </Column>
                    </Columns>
                    <Button
                      type="flat"
                      icon="trash"
                      className={styles.scriptdelete}
                      onClick={() => handleVmInventory.delColumn(idx+1)}
                    />
                  </div>
                ))} */}


                {listVmInventory.map((obj, idx) => (
                  <div className={styles.scriptitem} key={obj}>
                    <Columns>
                      <Column>
                        <Form.Item>
                        <Select
                           name={`vm_${obj}`}
                            placeholder={t('RESOURCES_NAME')}
                            options={vmOptionList}
                            onChange={() => fnSelectedVmOption()}     
                            defaultValue={props.store.detail.vm[obj-1]?.name}                   
                        />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item>
                          <Input
                            name={`ip_${obj}`}
                            placeholder={t('IP')}   
                            defaultValue={props.store.detail.vm[obj-1]?.host}                   
                          />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item>
                          <Input
                            name={`user_${obj}`}
                            placeholder={t('User')}
                            defaultValue={props.store.detail.vm[obj-1]?.user} 
                          />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item>
                          <TextArea
                            name={`private_key_${obj}`}
                            rows="1"
                            placeholder={t('Private Key')}
                            defaultValue={props.store.detail.vm[obj-1]?.privateKey} 
                          />
                        </Form.Item>
                      </Column>
                    </Columns>
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

        </Form>
      </Modal>

    </>
  );
};

export default ModifyModal

