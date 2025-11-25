import React, { useState, useRef, useEffect } from 'react'

import {
  Columns,
  Column,
  Form,
  Input,
  TextArea,
  Button,
} from '@kube-design/components'
import { ProjectSelect } from 'components/Inputs'
import {
  RadioButton,
  RadioGroup,
} from '@kube-design/components/lib/components/Radio'
import { Modal } from 'components/Base'

import classnames from 'classnames'

import { PATTERN_USER_NAME } from 'utils/constants'
import ContainerForm from './ContainerForm'

import styles from './index.scss'

import SecretStore from 'stores/secret'

const RegistModal = props => {
  const imageRegistryStore = new SecretStore()

  const form = useRef()
  const [modelView, setModalView] = useState(true)
  const [formData, setFormData] = useState({})

  const [cpuType, setCpuType] = useState('ARM')

  const [projectName, setProjectName] = useState('default')
  const [imageRegistries, setImageRegistries] = useState([])

  const [secret, setSecret] = useState({})
  const [imageDetail, setImageDetail] = useState('')

  const cpuTypeOptions = [
    { label: t('ARM'), value: 'ARM' },
    { label: t('x86'), value: 'x86' },
  ]

  const handleOk = () => {
    const onOk = props.onOk

    form.current.validator(async () => {
      const { data } = form.current.props

      data.username = ''
      data.password = ''
      data.registUrl = imageDetail

      if (secret.isPublic === false) {
        const secretsData = await imageRegistryStore.fetchDetail({
          cluster: props.cluster,
          namespace: projectName,
          name: secret.value,
        })

        const secrets =
          secretsData?.data?.['.dockerconfigjson']?.auths?.[secret.url] || {}
        data.username = secrets.username
        data.password = secrets.password
      }

      console.log('data : ', data)
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  const getImageRegistries = async () => {
    const imageRegistries = await imageRegistryStore.fetchListByK8s({
      cluster: props.cluster,
      namespace: projectName,
      fieldSelector: `type=kubernetes.io/dockerconfigjson`,
    })
    setImageRegistries(imageRegistries)
  }

  const tagValidator = (rule, value, callback) => {
    if (value === undefined) {
      return callback({ message: t('RESOURCES_TAG_EMPTY_DESC') })
    }
    callback()
  }

  const osValidator = (rule, value, callback) => {
    if (value === undefined) {
      return callback({ message: t('RESOURCES_OS_INFORMATION_EMPTY_DESC') })
    }
    callback()
  }

  useEffect(() => {
    getImageRegistries()
  }, [projectName])

  const onChangeImageDetail = value => {
    setImageDetail(value)
  }

  const fnGetModalFooter = () => {
    return (
      <>
        <Button
          onClick={() => closeModal()}
          className={classnames(styles['btn'], styles['btn-default'])}
        >
          {t('RESOURCES_CANCEL')}
        </Button>
        <Button
          onClick={() => {
            handleOk()
          }}
          className={classnames(styles['btn'], styles['btn-control'])}
          loading={props.store.isSubmitting}
          disabled={imageDetail.length === 0}
        >
          {t('RESOURCES_CREATE')}
        </Button>
      </>
    )
  }

  return (
    <>
      <Modal
        icon="pen"
        width={800}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form}>
          {/* Content */}
          <div className={styles.pop_overflow_y}>
            <div className={styles.cont_boxwrap}>
              <Columns>
                <Column>
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
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item
                    label={t('PROJECT')}
                    desc={t('SELECT_PROJECT_DESC')}
                    rules={[
                      {
                        required: true,
                        message: t('PROJECT_NOT_SELECT_DESC'),
                      },
                    ]}
                  >
                    <ProjectSelect
                      name="metadata.namespace"
                      defaultValue={projectName}
                      cluster={props.cluster}
                      onChange={e => {
                        setProjectName(e)
                      }}
                    />
                  </Form.Item>
                </Column>
              </Columns>

              <Form.Item
                label={t('RESOURCES_CPU_TYPE')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <RadioGroup
                  name="cpuType"
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
                label={t('RESOURCES_TAG')}
                rules={[{ required: true, validator: tagValidator }]}
                desc={t('RESOURCES_TAG_DESC')}
              >
                <Input name="tag" maxLength={63} style={{ maxWidth: 'none' }} />
              </Form.Item>

              <Form.Item
                label={t('RESOURCES_OS_INFORMATION')}
                rules={[{ required: true, validator: osValidator }]}
                desc={t('RESOURCES_OS_DESC')}
              >
                <Input name="os" maxLength={63} style={{ maxWidth: 'none' }} />
              </Form.Item>
              <Form.Item
                label={t('CONTAINER_SETTINGS')}
                desc={t('CONTAINER_SETTINGS_DESC')}
              >
                <ContainerForm
                  type={'Add'}
                  namespace={projectName}
                  imageRegistries={imageRegistries}
                  cluster={props.cluster}
                  onSecretChange={setSecret}
                  onChangeImageDetail={onChangeImageDetail}
                />
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
            </div>
          </div>
          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  )
}

export default RegistModal
