import { get } from 'lodash'
import React, { useState, useRef, useEffect, useMemo } from 'react'

import { observer, inject } from 'mobx-react'

import {
  Form,
  Input,
  Select,
  Checkbox,
  TextArea,
  Button,
  Loading,
  Column,
  Columns,
  Icon,
} from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'
import { ProjectSelect } from 'components/Inputs'
import classnames from 'classnames'

import { PATTERN_USER_NAME } from 'utils/constants'
import NetworkStore from 'stores/resources/networks'


const fabricKeyOptions = [
  { label: 'infiniband', value: 'infiniband' },
  { label: 'ethernet', value: 'ethernet' },
]

const ClusterModal = props => {
  const store = props.store
  const rootStore = props.rootStore

  const form = useRef()
  const networkStore = useMemo(() => new NetworkStore(), [])

  const [modelView, setModalView] = useState(true)
  const [formData, setFormData] = useState({})

  const [isCreateSend, setIsCreateSend] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isCreateSuccessd, setIsCreateSuccessd] = useState(false)

  const [clusterName, setClusterName] = useState('')
  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default'
  )
  const [networkOptions, setNetworkOptions] = useState([])
  const [fabricType, setFabricType] = useState(fabricKeyOptions[0]?.value || '')

  useEffect(() => {
    const getNetworkData = async () => {
      const networkList = await networkStore.fetchList({
        limit: 1000,
        cluster: props.cluster,
      })
      const opt = networkList.map(el => {
        return {
          label: `${el.name} / ${el.cidr}`,
          value: el.name,
        }
      })
      setNetworkOptions(opt)
    }
    getNetworkData()
  }, [])

  const handleOk = () => {
    const onOk = props.onOk

    form.current.validator(() => {
      setIsDisabled(true)     
      const { data } = form.current.props
      data.project = projectName

      setClusterName(data.name)

      onOk({
        ...data,
        createSuccess,
        createFail,
      })
    })
  }

  const isValidFabricKey = (fabricType, fabricKey) => {
    if (!/^0x[0-9a-fA-F]{4}$/.test(fabricKey)) {
      return false // 형식이 0x0000~0xFFFF 아님
    }

    const key = parseInt(fabricKey, 16)

    if (fabricType === 'infiniband') {
      return key >= 0x0001 && key <= 0x7ffe
    }

    if (fabricType === 'ethernet') {
      return key >= 0x0001 && key <= 0x0ffe
    }

    return false // 알 수 없는 fabricType
  }

  const [getListDataFn, setGetListDataFn] = useState(null)

  const createSuccess = getListData => {
    setGetListDataFn(() => getListData)
    setIsCreateSuccessd(true)  
    setIsCreateSend(true)      
  }

  const createFail= () => {
    setIsCreateSuccessd(false)
    setIsDisabled(false)    
  }

  const closeModal = () => {
    setModalView(false)
  }

  const fnGetModalFooter = () => {
    let elements = ''
    elements = (
      <>
        <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button>
        {!isCreateSend && (
          <Button
            onClick={() => {
              handleOk()
            }}
            className={classnames(styles['btn'], styles['btn-control'])}
            loading={props.store.isSubmitting}
            disabled={props.store.isSubmitting}
          >
            {t('RESOURCES_CREATE')}
          </Button>
        )}
        {isCreateSuccessd && (
          <Button onClick={() => { handleVmCreate() }}
            className={classnames(styles['btn'], styles['btn-control'])}
          >{t('RESOURCES_CREATE_VM')}
          </Button>
        )}
      </>
    )

    return elements
  }

  const handleVmCreate = () => {
    console.log('handleVmCreate~~!!') // 실제 API 가 연동되면 재개발 해야 함...
    rootStore.triggerAction('gpuclusters.regist', {
      store: store,
      cluster: projectName,
      namespace: projectName,
      id: clusterName,
      name: clusterName,
      type: clusterName,
      success: getListDataFn,
    })
    closeModal()
  }

  const segmentIdValidator = (_, value, callback) => {
    if (!isValidFabricKey(fabricType, value)) {
      return callback({
        message: t('RESOURCES_INVALID_FABRIC_KEY_DESC'),
      })
    }
    callback()
  }

  return (
    <>
      <Modal
        icon="pen"
        width={700}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        bodyClassName={styles.body}
        hideFooter
      >
        <Form data={formData} ref={form}>
          <div className={styles.cont_boxwrap}>
            <Columns>
              <Column>
                <Form.Item
                  label={t('RESOURCES_GPU_CLUSTER')}
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
                    disabled={isDisabled}
                  />
                </Form.Item>
              </Column>
              <Column>
                <Form.Item
                  label={t('PROJECT')}
                  desc={t('SELECT_PROJECT_DESC')}
                  rules={[
                    { required: true, message: t('PROJECT_NOT_SELECT_DESC') },
                  ]}
                >
                  <ProjectSelect
                    name="namespace"
                    defaultValue={projectName}
                    cluster={props.cluster}
                    onChange={e => setProjectName(e)}
                    style={{ maxWidth: 'none' }}
                    disabled={isDisabled}
                  />
                </Form.Item>
              </Column>
            </Columns>

            <Columns>
              <Column>
                <Form.Item
                  label={t('RESOURCES_GPU_CLUSTER_FABRICTYPE')}
                  rules={[
                    {
                      required: true,
                      message: t('RESOURCES_SELECT_NETWORK_TIP'),
                    },
                  ]}
                >
                  <Select
                    name="fabricType"
                    defaultValue={fabricKeyOptions[0]?.value || ''}
                    options={fabricKeyOptions}
                    onChange={e => setFabricKey(e)}
                  />
                </Form.Item>
              </Column>
              <Column>
                <Form.Item
                  label={t('RESOURCES_GPU_CLUSTER_SONANETWORK')}
                  rules={[
                    {
                      required: true,
                      message: t('RESOURCES_SELECT_NETWORK_TIP'),
                    },
                  ]}
                >
                  <Select
                    name="sonaNetwork"
                    defaultValue={networkOptions[0]?.value || ''}
                    options={networkOptions}
                  />
                </Form.Item>
              </Column>
            </Columns>

            <Columns>
              <Column>
                <Form.Item
                  label={t('RESOURCES_GPU_CLUSTER_FABRICKEY')}
                  rules={[{ required: true, validator: segmentIdValidator }]}
                  // desc={t('RESOURCES_FABRIC_KEY_DESC')}
                >
                  <Input
                    name="fabricKey"
                    autoFocus={true}
                    maxLength={63}
                    style={{ maxWidth: 'none' }}
                    // onChange={isValidFabricKey}
                    // disabled={isDisabled}
                  />
                </Form.Item>
              </Column>
              <Column></Column>
            </Columns>
            <Columns>
              <Column>
                <Form.Item
                  label={t('RESOURCES_DESCRIPTION')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea
                    style={{ maxWidth: 'none' }}
                    name="description"
                    maxLength={256}
                  />
                </Form.Item>
              </Column>
            </Columns>
          </div>

          <div className={styles.loading_boxwrap}>
            {props.store.isSubmitting && (
              <>
                <Loading />
                <p>GPU 클러스터를 생성중입니다.</p>
              </>
            )}
            {!props.store.isSubmitting && isCreateSuccessd && (
              <>
                <Icon name="check" type="dark" size={40} />
                {/* <div className={styles.iconwrapper}>
                  <i className={styles[`ico-status-running`]}/>
                </div> */}
                <p>GPU 클러스터가 생성되었습니다.</p>
                <p>가상머신을 생성하시겠습니까?</p>
              </>
            )}
          </div>

          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  )
}

export default inject('store', 'rootStore')(observer(ClusterModal))
