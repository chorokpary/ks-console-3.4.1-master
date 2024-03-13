import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'
import * as common from "utils/resources"

import * as tus from 'tus-js-client'
import { Form, Input, Select, Button, Icon  } from '@kube-design/components'


const UploadModal = (props) => {

  const image_uuid = props.detail.name;

  const onOk = props.onOk;

  console.log("image_uuid : "+ image_uuid)

  const [modelView, setModalView] = useState(true);

  const [file, setFile] = useState(null);
  const [uploader, setUploader] = useState(undefined);
  const [fileUploadCompleteFlag, setFileUploadCompleteFlag] = useState(false);
  const [fileUploadStartFlag, setFileUploadStartFlag] = useState(false);
  const [fileUploadingFlag, setFileUploadingFlag] = useState(false);
  const [fileValidError, setFilerValidError] = useState(false);

  const progressText = useRef();
  const progressbar = useRef();
  const loadedText = useRef();

  const closeModal = () => {
    setModalView(false);
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
      // endpoint: 'https://tusd.tusdemo.net/files/',
      // endpoint: `http://localhost:1080/files/${image_uuid}`,
      // endpoint: 'http://192.168.61.164:8080/files',
      endpoint: `http://192.168.16.80:31001/files/${image_uuid}`,      
      // Retry delays will enable tus-js-client to automatically retry on errors
      retryDelays: [0, 3000, 5000, 10000, 20000],
      // Attach additional meta data about the file for the server
      metadata: {
        filename: file.name,
        filetype: file.type,
        fileid: file.name,
      },
      chunkSize: 100,
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
        // closeModal();
        onOk({});
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
      console.log("previousUploads : "+ previousUploads)
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
    console.log("fnAbort~~~~~~~~~!!!!")
    uploader.abort();
    // setFileUploadingFlag(false);
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
        title={t('RESOURCES_IMAGE_FILE_UPLOAD')}
        width={1000}
        bodyClassName={styles.modalBody}
        onCancel={closeModal}
        visible={modelView}
        closable={true}
        hideFooter={true}
      >
        
        <div className={styles.content}>

        <Form.Item>     
          <>
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
                  {/* {(!fileUploadingFlag && file && !fileUploadCompleteFlag) && */}
                    <Button
                    type="control"
                    onClick={() => startOrResumeUpload(uploader)}
                    >
                      {t('업로드')}
                    </Button>
                  {/* } */}
                  {/* {(fileUploadingFlag && file && !fileUploadCompleteFlag) && */}
                    <Button
                    type="control"
                    onClick={() => fnAbort()}
                    >
                      {t('일시중지')}
                    </Button>
                  {/* }         */}
                </div>
                <div className={ fileUploadStartFlag ? '' : styles.hide }>    
                  
                  <div className={styles.divwrap}>
                    <div className={styles.div_left}>
                        <Icon name="upload" size={40} /> 
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
                        {/* <Icon name="upload" size={40} />                      */}
                    </div>
                  </div>     
                </div>

                {fileValidError &&
                  <div className="form-item-error" style={{ color: '#ca2621' }}>{t('파일을 업로드해 주세요.')}</div>
                }
              </Form.Group>             
          </>
        </Form.Item>    
          
        </div>
      </Modal>
    </>
  );
};

export default UploadModal

