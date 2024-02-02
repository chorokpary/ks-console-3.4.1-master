import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Column, Columns, Icon, Notify } from '@kube-design/components'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'
import * as common from "utils/resources"

import VmStore from 'stores/resources/vms'

const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;

const RegistModal = (props) => {

  const vmStore = new VmStore();
  
  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [file, setFile] = useState(null);
  const [fileValidError, setFilerValidError] = useState(false);

  const [vmDataList, setVmDataList] = useState([]);
  const [vmOptionList, setVmOptionList] = useState([]);

  const handleOk = () => {
    const onOk = props.onOk;

    if(!file){
      setFilerValidError(true);
      return false;
    }else{
      setFilerValidError(false)
    }

    form.current.validator(() => {
      const { data } = form.current.props;
      console.log("data : "+ JSON.stringify(data))
      //onOk({ ...data })
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


  const fnSelectedVmOption = async () => {
    const { data } = form.current.props;
    
    console.log("listVmInventory : "+ JSON.stringify(listVmInventory))
    console.log("data : "+ JSON.stringify(data))
    const selectedVmArray = [];
    await listVmInventory.map((item) => {
      !!data['vm_' + item] && selectedVmArray.push(data['vm_' + item])
    })

    console.log("selectedVmArray : "+ JSON.stringify(selectedVmArray))

    const checkVmDisabled = await vmOptionList.map((item) => ({
      ...item,
      disabled: selectedVmArray.includes(item.value) ? true : false
    }));
  
    setVmOptionList(checkVmDisabled);

  }

  useEffect(() => {
    const getVmData = async () => {
      const listVms = await vmStore.fetchList();
      setVmDataList(listVms);

      const opt = listVms.map((obj) => ({
        label: t(obj.name),
        value: t(obj.id),
        disabled: false,
      }))
      setVmOptionList(opt)
    };

    getVmData();
  }, [])

  // 가상머신 Start ############################################
  const nextVm = useRef(1);
  const [listVmInventory, setListVmInventory] = useState([1]);

  const handleVmInventory = {
    addColumn: () => {
      if (listVmInventory.length > 4) {
        Notify.info(t('RESOURCES_ADD_UNTIL_FIVE'))
        return false;
      }
      nextVm.current += 1
      setListVmInventory(listVmInventory => [...listVmInventory, nextVm.current]);

    },
    delColumn: async (id) => {
      setListVmInventory(listVmInventory.filter((el) => el !== id));    
      setTimeout(()=>{ fnSelectedVmOption() }, 1000)
    },
  }
  // 가상머신 End ############################################


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
            />
          </Form.Item>
   
          <Form.Item>     
          <>
            {t('Playbook 등록')}<span className="form-item-required">*</span>   
            <Form.Group>
              <div>
                <input type="file" 
                  onChange={onFileChange}
                  style={{ display: 'none' }}
                  ref={el => {
                    fileInputRef.current = el
                  }}
                />  
                <Input name="fileName" className={styles.file_input} value={fileName ? fileName : ''} readOnly />                     
                <Button type="primary" onClick={() => handleButtonClick()} >
                  {t('파일 찾기')}
                </Button>             
              </div>


              {fileValidError &&
                <div className="form-item-error" style={{ color: '#ca2621' }}>{t('파일을 업로드해 주세요.')}</div>
              }
              </Form.Group>             
          </>
          </Form.Item>   

          <Form.Item>     
            <>
              {t('가상머신')}<span className="form-item-required">*</span>   
              <Form.Group>
                {listVmInventory.map((obj, idx) => (
                  <div className={styles.scriptitem} key={obj}>
                    <Columns>
                      <Column>
                        <Form.Item>
                        <Select
                           name={`vm_${obj}`}
                            placeholder={t('이름')}
                            options={vmOptionList}
                            onChange={() => fnSelectedVmOption()}
                        />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item>
                          <Input
                            name={`ip_${obj}`}
                            placeholder={t('IP')}
                          />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item>
                          <Input
                            name={`user_${obj}`}
                            placeholder={t('User')}
                          />
                        </Form.Item>
                      </Column>
                      <Column>
                        <Form.Item>
                          <TextArea
                            name={`private_key_${obj}`}
                            rows="1"
                            defaultValue=""
                            placeholder={t('Private Key')}
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
              </Form.Group>
            </>
          </Form.Item>   

        </Form>
      </Modal>

    </>
  );
};

export default RegistModal

