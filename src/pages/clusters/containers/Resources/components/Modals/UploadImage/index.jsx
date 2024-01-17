import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'

import * as tus from 'tus-js-client'
import { Form, Input, Select, Button } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'

const UploadModal = (props) => {

  const [modelView, setModalView] = useState(true);

  const [file, setFile] = useState(null);
  const [uploader, setUploader] = useState(undefined);


  const uploadingText = useRef();
  const progressText = useRef();
  const progressbar = useRef();
  const loadedText = useRef();
  const _trProgress = useRef();
  const _trProgressbar = useRef();

  const closeModal = () => {
    setModalView(false);
  }

  const onFileChange = async (e) => {

    var file = e.target.files[0]

    var upload = new tus.Upload(file, {
      // Endpoint is the upload creation URL from your tus server
      // endpoint: 'https://tusd.tusdemo.net/files/'
      // endpoint: 'http://localhost:1080/files/',
      endpoint: 'http://192.168.61.164:8080/files',
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
    console.log(file)
  }

  const startOrResumeUpload = (upload) => {
    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one.
        if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0])
        }

        // Start the upload
        upload.start()
    })
}

  const fnAbort = async () => {
    uploader.abort()
  };


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


  return (
    <>
       <Modal
        title={t('이미지 업로드')}
        width={600}
        bodyClassName={styles.modalBody}
        onCancel={closeModal}
        visible={modelView}
        closable={true}
        hideFooter={true}
      >
        <div>
          <Form.Item>
              <Form.Group>
                <Columns>
                  <Column>
                      <Input type="file" 
                        onChange={onFileChange}
                      />
                  </Column>
                  <Column>
                      <Button
                      onClick={() => startOrResumeUpload(uploader)}
                      disabled={!file ? true : false}
                      >
                        {t('업로드')}
                      </Button>
                      <Button
                      onClick={() => fnAbort()}
                      disabled={!file ? true : false}
                      >
                        {t('일시중지')}
                      </Button>
                  </Column>
                </Columns>
              </Form.Group>
            </Form.Item>

            <div className={styles.hide}>
              <Form.Item>
                <Form.Group>              
                * <span ref={uploadingText}>Uploading</span> :{" "}
                  <span ref={progressText}></span>
                  <span ref={loadedText}></span>
                <div
                  style={{
                    backgroundColor: "#2275d7",
                    borderRadius: "4px",
                    boxShadow: "inset 0 0.5em 0.5em rgba(0,0,0,0.05)",
                    height: "5px",
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
                      height: "5px",
                      transform: "translateX(0%)",
                    }}
                  ></div>
                </div>
                </Form.Group>
              </Form.Item>
            </div>

        </div>
      </Modal>
    </>
  );
};

export default UploadModal

