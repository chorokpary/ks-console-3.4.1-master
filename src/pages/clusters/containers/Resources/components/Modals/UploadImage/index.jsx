import { get } from 'lodash'
import React, { useRef, useState } from 'react'

import { Modal } from 'components/Base'

import * as common from 'utils/resources'

import { Button, Form, Icon, Input } from '@kube-design/components'
import * as tus from 'tus-js-client'
import styles from './index.scss'

const UploadModal = props => {
  const job_uuid = props.detail.name

  const onOk = props.onOk

  // console.log(`job_uuid : ${job_uuid}`);

  const [modelView, setModalView] = useState(true)

  const [file, setFile] = useState(null)
  const [uploader, setUploader] = useState(undefined)
  const [fileUploadCompleteFlag, setFileUploadCompleteFlag] = useState(false)
  const [fileUploadStartFlag, setFileUploadStartFlag] = useState(false)
  const [fileUploadingFlag, setFileUploadingFlag] = useState(false)
  const [fileValidError, setFilerValidError] = useState(false)

  const progressText = useRef()
  const progressbar = useRef()
  const loadedText = useRef()

  const closeModal = () => {
    setModalView(false)
  }

  // File Upload Start ############################################

  const fileInputRef = useRef(null)
  const [fileName, setFileName] = useState()

  const handleButtonClick = () => {
    // console.log('Button clicked, fileInputRef:', fileInputRef.current)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const onFileChange = async e => {
    const f = e.target?.files?.[0]
    if (!f) return

    setFileName(f.name)

    // 이어받기용 ID가 제공되면 uploadUrl 사용
    const uploadInfo = get(props.detail, ['upload-info-list', 'upload-info'])
    const uploadId =
      uploadInfo?.[0]?.['upload-file-info']?.['file-info']?.['ID'] ?? ''
    const hasId = Boolean(uploadId)

    const upload = new tus.Upload(f, {
      endpoint: `/files/${job_uuid}`, // 새 업로드
      uploadUrl: hasId ? `/files/${job_uuid}/${uploadId}` : null, // 이어받기
      //retryDelays: [0, 3000, 5000, 10000, 20000],
      retryDelays: [],
      metadata: {
        filename: f.name,
        filetype: f.type || '',
        fileid: f.name,
      },
      onError(error) {
        // console.error('[tus] upload error:', error)
        // console.error('endpoint:', this.endpoint)
        // console.error('uploadUrl:', this.uploadUrl)

        // 업로드 상태 리셋
        setFileUploadingFlag(false)
        setFileUploadStartFlag(false)
        setFileValidError(true)

        // 사용자에게 에러 알림 (선택적)
        // alert(`업로드 실패: ${error.message || '네트워크 오류'}`);
      },
      onProgress(bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        fnProgress(bytesUploaded, bytesTotal, percentage)
      },
      onSuccess() {
        setFileUploadCompleteFlag(true)
        closeModal()
        //onOk({});
      },
      onAfterResponse(req, res) {
        try {
          if (typeof res?.getStatus === 'function') {
            // 간단한 상태 확인 로그
            // console.log('[tus] status:', res.getStatus());
          }
        } catch (e) {
          void e // intentionally ignored
          // console.warn('[tus] onAfterResponse log failed:', e);
        }
      },
    })

    setUploader(upload)
  }

  const startOrResumeUpload = upload => {
    if (!upload) {
      setFileValidError(true)
      return
    }
    upload.findPreviousUploads().then(previousUploads => {
      if (previousUploads?.length) {
        upload.resumeFromPreviousUpload(previousUploads[0])
        setFileUploadingFlag(true)
      }
      setFileUploadStartFlag(true)
      upload.start()
    })
  }

  const fnAbort = async () => {
    // console.log('fnAbort~~~~~~~~~!!!!');
    uploader.abort()
    // setFileUploadingFlag(false);
  }

  const fnProgress = (totalLoaded, fileSize, percentage) => {
    if (!!progressText.current === true) {
      progressText.current.textContent = `${percentage} %`
      progressbar.current.style.transform = `translateX(${percentage}%)`
      loadedText.current.textContent = common.fnFormatBytes(
        totalLoaded.toString()
      )
    }
  }
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
                  <input
                    type="file"
                    onChange={onFileChange}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    accept="image/*,.tar,.gz,.zip"
                  />
                  <Input
                    name="fileName"
                    className={styles.file_input}
                    value={fileName || ''}
                    readOnly
                  />
                  <Button
                    type="primary"
                    onClick={() => handleButtonClick()}
                    disabled={!!fileUploadCompleteFlag}
                  >
                    {t('RESOURCES_FIND_FILE')}
                  </Button>
                  <Button
                    type="control"
                    onClick={() => startOrResumeUpload(uploader)}
                    disabled={
                      !uploader || fileUploadingFlag || fileUploadCompleteFlag
                    }
                  >
                    {fileUploadingFlag ? '업로드 중...' : t('RESOURCES_UPLOAD')}
                  </Button>
                </div>
                <div className={fileUploadStartFlag ? '' : styles.hide}>
                  <div className={styles.divwrap}>
                    <div className={styles.div_left}>
                      <Icon name="upload" size={40} />
                    </div>
                    <div className={styles.div_middle}>
                      <div className={styles.progressbar_wrap}>
                        <div className={styles.right}>
                          File size <span ref={loadedText}></span> / Upload
                          percent <span ref={progressText}></span>
                        </div>
                        <div
                          style={{
                            backgroundColor: '#2275d7',
                            borderRadius: '4px',
                            boxShadow: 'inset 0 0.5em 0.5em rgba(0,0,0,0.05)',
                            height: '20px',
                            margin: '15px 0px 15px 0px',
                            overflow: 'hidden',
                            position: 'relative',
                            transform: 'translateZ(0)',
                            width: '100%',
                          }}
                        >
                          <div
                            ref={progressbar}
                            style={{
                              backgroundColor: '#eff4f9',
                              borderRadius: '0px',
                              boxShadow:
                                'inset 0 0.5em 0.5em rgba(94, 49, 49, 0.05)',
                              height: '20px',
                              transform: 'translateX(0%)',
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

                {fileValidError && (
                  <div className="form-item-error" style={{ color: '#ca2621' }}>
                    {t('RESOURCES_FILE_EMPTY_DESC')}
                  </div>
                )}
              </Form.Group>
            </>
          </Form.Item>
        </div>
      </Modal>
    </>
  )
}

export default UploadModal
