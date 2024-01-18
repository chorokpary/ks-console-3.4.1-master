import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Column, Columns, Icon } from '@kube-design/components'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'
import * as common from "utils/resources"

import * as tus from 'tus-js-client'

const regexName = /^[a-z0-9]*[a-z0-9-]*[a-z0-9]$/;

const RegistModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [cpuType, setCpuType] = useState('ARM')
  const [registryUrl, setRegistryUrl] = useState('')

  const [userName, setPropsUserName] = useState('')
  const [userPassword, setPropsUserPassword] = useState('')

  const [harborValid, setHarborValid] = useState(false)
  const [userValidError, setUserValidError] = useState(false)
  const [harborValidError, setHarborValidError] = useState(false)
  const [harborUrl, setHarborUrl] = useState('')
  const [harborAuth, setHarborAuth] = useState('')

  const [file, setFile] = useState(null);
  const [uploader, setUploader] = useState(undefined);
  const [fileUploadCompleteFlag, setFileUploadCompleteFlag] = useState(false);
  const [fileUploadStartFlag, setFileUploadStartFlag] = useState(false);
  const [fileUploadingFlag, setFileUploadingFlag] = useState(false);
  const [fileValidError, setFilerValidError] = useState(false);

  const progressText = useRef();
  const progressbar = useRef();
  const loadedText = useRef();

  const cpuTypeOptions = [
  { label: t('ARM'), value: "ARM", },
  { label: t('x86'), value: "x86", }
]

  const handleOk = () => {
    const onOk = props.onOk;

    if(!!!fileUploadCompleteFlag){
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

  const checkUserValid = async () => {
    // let index = registryUrl.lastIndexOf('api/v2.0/') + 9
    // let url = registryUrl.substring(0, index) + 'users'
    let userAuth = Base64.encode(`${userName}:${userPassword}`)

    await request.post(`customharbor/users`, {
      auth: userAuth
    })
      .then(res => {
        Notify.success({ content: t('RESOURCES_SUCCESS_VALID_DESC') })
        setHarborValid(true)
        setHarborValidError(false)
        setUserValidError(false)

        setHarborAuth(userAuth)
        setHarborUrl(registryUrl)
        setPropsUserName(userName)
        setPropsUserPassword(userPassword)
      })
      .catch(err => {
        setHarborValid(false)
        setUserValidError(true)
        setTagList([])
        setImageName('')
        setTag('')
      })

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

  const tagValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_TAG_EMPTY_DESC') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('RESOURCES_TAG_EMPTY_DESC') })
      }
    }
    callback()
  }

  const osValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_OS_INFORMATION_EMPTY_DESC') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('RESOURCES_OS_INFORMATION_EMPTY_DESC') })
      }
    }
    callback()
  }

  // File Upload Start ############################################

  const fileInputRef = useRef(null); 
  const [fileName, setFileName] = useState(); 

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const onFileChange = async (e) => {

    var file = e.target.files[0];

    setFileName(file.name);

    var upload = new tus.Upload(file, {
      // Endpoint is the upload creation URL from your tus server
      // endpoint: 'https://tusd.tusdemo.net/files/'
      endpoint: 'http://localhost:1080/files/',
      // endpoint: 'http://192.168.61.164:8080/files',
      // Retry delays will enable tus-js-client to automatically retry on errors
      retryDelays: [0, 3000, 5000, 10000, 20000],
      // Attach additional meta data about the file for the server
      metadata: {
        filename: file.name,
        filetype: file.type,
        fileid: file.name,
      },
      // Callback for errors which cannot be fixed using retries
      onError: function (error) {
        console.log('Failed because: ' + error)
      },
      // Callback for reporting upload progress
      onProgress: function (bytesUploaded, bytesTotal) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        console.log(bytesUploaded, bytesTotal, percentage + '%')
        fnProgress(bytesTotal, bytesUploaded, percentage);
      },
      // Callback for once the upload is completed
      onSuccess: function () {
        setFileUploadCompleteFlag(true);
        console.log('Download %s from %s', upload.file.name, upload.url)
      },
      
      // 업로드 중 응답 콜백
      onAfterResponse: (req, res) => {
        console.log("upload : "+ JSON.stringify(upload))
        response = res.getBody();
        console.log("response : "+ response)
      }
    })

    setFile(file);
    setUploader(upload);
  }

  const startOrResumeUpload = (upload) => {
    upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one.
        if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0])
            setFileUploadingFlag(true);
        }

        setFileUploadStartFlag(true);
        // Start the upload
        upload.start()
    })
}

  const fnAbort = async () => {
    uploader.abort();
    setFileUploadingFlag(false);
  };

  const fnProgress = (totalLoaded, fileSize, percentage) => {
    if (!!progressText.current === true) {
      progressText.current.textContent = percentage + " %";
      progressbar.current.style.transform = "translateX(" + percentage + "%)";
      loadedText.current.textContent = common.fnFormatBytes(totalLoaded.toString());
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

          <Form.Item
            label={t('RESOURCES_CPU_TYPE')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <RadioGroup
              name="is_realtime"
              wrapClassName="radio"
              defaultValue={cpuType}
              onChange={value => setCpuType(value)}
            >
              {cpuTypeOptions.map(option => (
                <RadioButton key={option.value} value={option.value}>
                  {option.label}
                </RadioButton>
              ))}
            </RadioGroup>
          </Form.Item>

          <Form.Item
            label={t('태그')}
            rules={[{ required: true, validator: tagValidator }]}
            desc={t('RESOURCES_TAG_DESC')}
          >
            <Input
              name="tag"
              maxLength={63}
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

          <Form.Item
            label={t('OS 정보')}
            rules={[{ required: true, validator: osValidator }]}
            desc={t('RESOURCES_OS_DESC')}
          >
            <Input
              name="os"
              maxLength={63}
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

          <Form.Item>     
          <>
            Harbor URL<span className="form-item-required">*</span>
            <div className={styles.content_box_wrap}>
              <div className={styles.cont_box_section}>
                  <div className={styles.cont_box_wrap}>

                    <div className={styles.regi_group_area}>
                      <div className={styles.formarea}>
                        <div className={classnames(styles.custom_input, styles.w_1)}>
                          <label>Registry URL</label>
                          <input type="text" placeholder={'http://{url}/api/v2.0/projects/{project_name}/repositories'} defaultValue={registryUrl} onChange={(e) => setRegistryUrl(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.regi_group_area}>
                      <div className={styles.formarea}>
                        <div className={styles.custom_input}>
                          <label>{t('RESOURCES_USER_NAME')}</label>
                          <input type="text" name="username" defaultValue={userName} onChange={(e) => setUserName(e.target.value)} />
                        </div>
                        <div className={styles.custom_input}>
                          <label>{t('RESOURCES_PASSWORD')}</label>
                          <input type="password" name="password" defaultValue={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                        </div>
                        <button type="button" className={classnames(styles.btn, styles.btn_control)} onClick={() => checkUserValid()}>{t('RESOURCES_VALID')}</button>
                      </div>
                    </div>

                    {userValidError &&
                      <div className="form-item-error" style={{ color: '#ca2621' }}>{t('RESOURCES_FAIL_VALID_TIP')}</div>
                    }

                  </div>
              </div>           
            </div>      
          </>
          </Form.Item>      

          <Form.Item>     
          <>
            {t('RESOURCES_IMAGE_FILE_UPLOAD')}<span className="form-item-required">*</span>   
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
                <Button type="primary" onClick={() => handleButtonClick()} disabled={fileUploadCompleteFlag ? true : false} >
                  {t('파일 찾기')}
                </Button>             
                {(!fileUploadingFlag && file && !fileUploadCompleteFlag) &&
                  <Button
                  type="control"
                  onClick={() => startOrResumeUpload(uploader)}
                  >
                    {t('업로드')}
                  </Button>
                }
                {(fileUploadingFlag && file && !fileUploadCompleteFlag) &&
                  <Button
                  type="control"
                  onClick={() => fnAbort()}
                  >
                    {t('일시중지')}
                  </Button>
                }        
              </div>
              <div className={ fileUploadStartFlag ? '' : styles.hide }>    
                  
                  <div className={styles.divwrap}>
                    <div className={styles.div_left}>
                        <Icon name="file" size={40} /> 
                    </div>
                    <div className={styles.div_middle}>
                      <div className={styles.progressbar_wrap}>
                          <div className={styles.right}>
                            File size <span ref={loadedText}></span> / Upload percent <span ref={progressText}></span>                      
                          </div>                   
                          <div
                            style={{
                              backgroundColor: "#55bc8a",
                              borderRadius: "4px",
                              boxShadow: "inset 0 0.5em 0.5em rgba(0,0,0,0.05)",
                              height: "20px",
                              margin: "15px 0px 15px 0px",
                              overflow: "hidden",
                              position: "relative",
                              transform: "translateZ(0)",
                              width: "100%",
                            }}
                          >
                            <div
                              ref={progressbar}
                              style={{
                                backgroundColor: "#eff4f9",
                                borderRadius: "0px",
                                boxShadow:
                                  "inset 0 0.5em 0.5em rgba(94, 49, 49, 0.05)",
                                height: "20px",
                                transform: "translateX(0%)",
                              }}
                            ></div>
                          </div>
                        </div> 
                    </div>                      
                    <div className={styles.div_right}>
                        <Icon name="upload" size={40} />                     
                    </div>
                  </div>     
              </div>

              {fileValidError &&
                <div className="form-item-error" style={{ color: '#ca2621' }}>{t('파일을 업로드해 주세요.')}</div>
              }
              </Form.Group>             
          </>
          </Form.Item>         

          <Form.Item
            className={styles.textarea}
            label={t('RESOURCES_DESCRIPTION')}
            desc={t('DESCRIPTION_DESC')}
          >
            <TextArea
              name="description"
              maxLength={256}
              rows="1"
              defaultValue=""
            />
          </Form.Item>

        </Form>
      </Modal>

    </>
  );
};

export default RegistModal

