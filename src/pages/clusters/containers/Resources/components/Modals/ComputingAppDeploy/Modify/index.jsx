import { get, find } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Loading,
  Column,
  Columns,
  Icon,
  Notify,
} from '@kube-design/components'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import * as common from 'utils/resources'
import axios from 'axios'
import moment from 'moment-mini'

import VmStore from 'stores/resources/vms'

import { PATTERN_USER_NAME, PATTERN_IP } from 'utils/constants'
import styles from './index.scss'

const ModifyModal = props => {
  const vmStore = new VmStore()

  const form = useRef()
  const [modelView, setModalView] = useState(true)
  const [formData, setFormData] = useState({})

  const [file, setFile] = useState(null)
  const [fileValidError, setFilerValidError] = useState(false)
  const [fileExtError, setFileExtError] = useState(false)
  const [vmValidError, setVmValidError] = useState(false)

  const [submitButtonFlag, setSubmitButtonFlag] = useState(false)

  const [vmList, setVmList] = useState([])
  const [vmOptionList, setVmOptionList] = useState([])

  const vmInitInvetoryCount = props.store.detail.vm.length

  const handleOk = () => {
    const onOk = props.onOk

    form.current.validator(() => {
      const { data } = form.current.props

      if (!(props.store.detail.playbookName === fileName && !file)) {
        if (!file) {
          setFilerValidError(true)
          setFileExtError(false)
          return false
        }
        const ext = file.name
          .split('.')
          .pop()
          .toLowerCase()
        const isValidExt = ext == 'zip'
        if (isValidExt) {
          setFilerValidError(false)
        } else {
          setFilerValidError(false)
          setFileExtError(true)
          return false
        }
      }

      const vmErrorArray = []
      listVmInventory.map(obj => {
        if (
          !!data[`vm_${obj}`] &&
          !!data[`ip_${obj}`] &&
          !!data[`user_${obj}`] &&
          !!data[`private_key_${obj}`]
        ) {
          const isValidIpAddress = !PATTERN_IP.test(data[`ip_${obj}`])
          setVmValidError(isValidIpAddress)
          vmErrorArray.push(isValidIpAddress)
          return false
        }
        vmErrorArray.push(true)
        setVmValidError(true)
        return false
      })

      if (vmErrorArray.includes(true)) {
        return false
      }

      const timestamp = moment(Date()).toISOString()

      const jsonData = {}
      const vmDataArray = []

      jsonData.name = data.name
      jsonData.version = data['version']
      jsonData.registrant = globals.user.username
      jsonData.registrationDate = props.store.detail.registrationDate
      jsonData.modificationDate = timestamp

      listVmInventory.map(item => {
        const vmData = {
          name: data[`vm_${item}`],
          host: data[`ip_${item}`],
          user: data[`user_${item}`],
          privateKey: data[`private_key_${item}`],
        }
        vmDataArray.push(vmData)
      })

      jsonData.vm = vmDataArray

      const formData = new FormData()
      formData.append('body', JSON.stringify(jsonData))

      setSubmitButtonFlag(true)
      if (!(props.store.detail.playbookName === fileName && !file)) {
        formData.append('playbook', file)
        setFileUploadStartFlag(true)
      }

      // const url = props.cluster ? `/kapis/cmp.kubesphere.io/v1alpha1/klusters/${props.cluster}/app-manager/v1alpha1/templates`
      //                           : `/kapis/cmp.kubesphere.io/v1alpha1/app-manager/v1alpha1/templates`

      const url = `/kapis/cmp.kubesphere.io/v1alpha1/app-manager/v1alpha1/templates`

      axios
        .put(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            fnProgress(
              progressEvent.total,
              progressEvent.loaded,
              percentCompleted
            )
            // console.log(progressEvent.total, progressEvent.loaded, percentCompleted + '%')
          },
        })
        .then(res => {
          // console.log(res.data);
          onOk({ ...data })
          setSubmitButtonFlag(false)
        })
        .catch(err => {
          // console.error(err);
          Notify.error({
            title: err.reason,
            content: t(err.message),
            duration: 3000,
          })
          setSubmitButtonFlag(false)
        })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  const versionValidator = (rule, value, callback) => {
    if (!value) {
      return callback({ message: t('RESOURCES_VERSION_EMPTY_DESC') })
    }
    callback()
  }

  const fnSelectedVmOption = async () => {
    const { data } = form?.current?.props

    const selectedVmArray = []
    await listVmInventory.map(item => {
      !!data?.[`vm_${item}`] && selectedVmArray.push(data?.[`vm_${item}`])
      getVmIp(item)
    })

    const checkVmDisabled = await vmOptionList.map(item => ({
      ...item,
      disabled: !!selectedVmArray.includes(item.value),
    }))

    setVmOptionList(checkVmDisabled)
  }

  const getVmIp = num => {
    const { data } = form.current.props
    const vmName = data[`vm_${num}`]
    const vmIp = get(
      get(find(vmList, { name: vmName }), 'networks', []).find(
        item => item.name == 'k8s-pod-network'
      ),
      'ip',
      ''
    )
    !data[`ip_${num}`] ? (data[`ip_${num}`] = vmIp) : ''
  }

  useEffect(() => {
    const getVmData = async () => {
      const listVms = await vmStore.fetchList()

      const cloneNotList = listVms.filter(item => !item.name.includes('-clone'))

      const opt = cloneNotList.map(obj => ({
        label: t(obj.name),
        value: t(obj.name),
        disabled: false,
      }))
      setVmList(cloneNotList)
      setVmOptionList(opt)
    }

    const getVmInventoryData = async () => {
      props.store.detail.vm.map((item, index) => {
        setListVmInventory(listVmInventory => [
          ...listVmInventory,
          Number(index + 1),
        ])
      })
    }

    getVmData()
    getVmInventoryData()
  }, [])

  // 가상머신 selectbox disabled 처리 Start ############################################
  const [vmSelect, setVmSelect] = useState([])
  const fnChangeSelect = val => {
    setVmSelect(val)
  }

  useEffect(() => {
    if (vmSelect.length > 0) {
      fnSelectedVmOption()
    }
  }, [vmSelect])
  // 가상머신 selectbox disabled 처리 End ############################################

  // 가상머신 Add, Delete Start ############################################
  const nextVm = useRef(vmInitInvetoryCount)
  const [listVmInventory, setListVmInventory] = useState([])

  const handleVmInventory = {
    addColumn: () => {
      listVmInventory.length == 1 && fnSelectedVmOption()
      nextVm.current += 1
      setListVmInventory(listVmInventory => [
        ...listVmInventory,
        nextVm.current,
      ])
    },
    delColumn: async id => {
      fnChangeSelect(listVmInventory.filter(el => el !== id))
      setListVmInventory(listVmInventory.filter(el => el !== id))
    },
  }
  // 가상머신 Add, Delete End ############################################

  // File Upload Start ############################################
  const fileInputRef = useRef(null)
  const [fileName, setFileName] = useState(props.store.detail.playbookName)

  const [fileUploadStartFlag, setFileUploadStartFlag] = useState(false)
  const uploadingText = useRef()
  const progressText = useRef()
  const progressbar = useRef()
  const loadedText = useRef()

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  const onFileChange = async e => {
    const file = e.target.files[0]
    setFileName(file.name)
    setFile(file)
  }

  const fnProgress = (totalLoaded, fileSize, percentage) => {
    if (!!progressText.current === true) {
      progressText.current.textContent = `${percentage} %`
      progressbar.current.style.transform = `translateX(${percentage}%)`
      loadedText.current.textContent = ` ( ${fileSize
        .toString()
        .replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ','
        )} / ${totalLoaded
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Bytes ) `
    }
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
                  pattern: PATTERN_USER_NAME,
                  message: t('RESOURCES_INVALID_NAME_DESC'),
                },
              ]}
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
              <Input
                name="version"
                maxLength={253}
                style={{ maxWidth: 'none' }}
                placeholder="v1"
                defaultValue={props.store.detail.version}
              />
            </Form.Item>

            <Form.Item>
              <>
                {t('RESOURCES_APP_DEPLOY_PLAYBOOK_ADD')}
                <span className="form-item-required">*</span>
                <div style={{ color: '#79879c' }}>
                  ({t('RESOURCES_APP_DEPLOY_PLAYBOOK_ADD_DESC')})
                </div>
                <Form.Group>
                  <div>
                    <input
                      type="file"
                      onChange={onFileChange}
                      style={{ display: 'none' }}
                      ref={el => {
                        fileInputRef.current = el
                      }}
                      accept=".zip"
                    />
                    <Input
                      name="fileName"
                      className={styles.file_input}
                      value={fileName || ''}
                      readOnly
                    />
                    <Button type="primary" onClick={() => handleButtonClick()}>
                      {t('RESOURCES_FIND_FILE')}
                    </Button>
                  </div>

                  <div className={fileUploadStartFlag ? '' : styles.hide}>
                    <div style={{ margin: '10px 0 10px 0' }}>
                      * <span ref={uploadingText}>Uploading</span> :{' '}
                      <span ref={progressText}></span>
                      <span ref={loadedText}></span>
                      <div
                        style={{
                          backgroundColor: '#2275d7',
                          borderRadius: '4px',
                          boxShadow: 'inset 0 0.5em 0.5em rgba(0,0,0,0.05)',
                          height: '10px',
                          margin: '2rem 0 2rem 0',
                          overflow: 'hidden',
                          position: 'relative',
                          transform: 'translateZ(0)',
                          width: '100%',
                        }}
                      >
                        <div
                          ref={progressbar}
                          style={{
                            backgroundColor: '#828e94',
                            borderRadius: '4px',
                            boxShadow:
                              'inset 0 0.5em 0.5em rgba(94, 49, 49, 0.05)',
                            height: '10px',
                            transform: 'translateX(0%)',
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {fileValidError && (
                    <div
                      className="form-item-error"
                      style={{ color: '#ca2621' }}
                    >
                      {t('RESOURCES_FILE_EMPTY_DESC')}
                    </div>
                  )}
                  {fileExtError && (
                    <div
                      className="form-item-error"
                      style={{ color: '#ca2621' }}
                    >
                      {t('RESOURCES_ONLY_UPLOAD_ZIP_FILE')}
                    </div>
                  )}
                </Form.Group>
              </>
            </Form.Item>

            <Form.Item>
              <>
                {t('RESOURCES_VM')}
                <span className="form-item-required">*</span>
                <div style={{ color: '#79879c' }}>
                  ({t('RESOURCES_APP_DEPLOY_VM_ADD_DESC')})
                </div>
                <Form.Group>
                  {listVmInventory.map((obj, idx) => (
                    <div className={styles.scriptitem} key={obj}>
                      <Form.Item>
                        <Select
                          name={`vm_${obj}`}
                          placeholder={t('RESOURCES_NAME')}
                          options={vmOptionList}
                          onChange={() => fnSelectedVmOption()}
                          defaultValue={props.store.detail.vm[obj - 1]?.name}
                        />
                      </Form.Item>
                      <div className={styles.scriptInput}>
                        <Form.Item>
                          <Input
                            name={`ip_${obj}`}
                            placeholder={t('IP')}
                            defaultValue={props.store.detail.vm[obj - 1]?.host}
                            maxLength="15"
                          />
                        </Form.Item>
                      </div>
                      <div className={styles.scriptInput}>
                        <Form.Item>
                          <Input
                            name={`user_${obj}`}
                            placeholder={t('User')}
                            defaultValue={props.store.detail.vm[obj - 1]?.user}
                          />
                        </Form.Item>
                      </div>
                      <div className={styles.scriptTextArea}>
                        <Form.Item>
                          <TextArea
                            name={`private_key_${obj}`}
                            rows="1"
                            cols="70"
                            placeholder={t('Private Key')}
                            defaultValue={
                              props.store.detail.vm[obj - 1]?.privateKey
                            }
                          />
                        </Form.Item>
                      </div>
                      <Button
                        type="flat"
                        icon="trash"
                        className={styles.scriptdelete}
                        onClick={() =>
                          listVmInventory.length > 1 &&
                          handleVmInventory.delColumn(obj)
                        }
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
                  {vmValidError && (
                    <div
                      className="form-item-error"
                      style={{ color: '#ca2621' }}
                    >
                      {t('RESOURCES_APP_DEPLOY_VM_EMPTY_DESC')}
                    </div>
                  )}
                </Form.Group>
              </>
            </Form.Item>
          </div>
        </Form>
        <div className={styles['modal-footer']}>
          <Button
            onClick={() => closeModal()}
            className={classnames(styles['btn'], styles['btn-default'])}
          >
            {t('RESOURCES_CANCEL')}
          </Button>
          {submitButtonFlag ? (
            <Button
              onClick={() => {
                handleOk()
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
              disabled
              loading={true}
            >
              {t('RESOURCES_CONFIRM')}
            </Button>
          ) : (
            <Button
              onClick={() => {
                handleOk()
              }}
              className={classnames(styles['btn'], styles['btn-control'])}
            >
              {t('RESOURCES_CONFIRM')}
            </Button>
          )}
        </div>
      </Modal>
    </>
  )
}

export default ModifyModal
