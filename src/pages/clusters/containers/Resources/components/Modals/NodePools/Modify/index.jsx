import React, { useEffect, useRef, useState } from 'react'
import { Button, Form, Input, Slider, TextArea } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import classnames from 'classnames'

import { Modal } from 'components/Base'
import { PATTERN_USER_NAME } from 'utils/constants'
import ResourceStore from 'stores/resources/containerresource'
import TypeSelect from '../../../TypeSelect'
import styles from './index.scss'

const ModifyNodePoolModal = ({ nodepool, ...props }) => {
  const form = useRef()
  const [formData] = useState({})

  const resourceStore = new ResourceStore()

  const [modelView, setModalView] = useState(true)
  const [imageOptionList, setImageOptionList] = useState([])
  const [nodepoolReplicas, setNodepoolReplicas] = useState(
    nodepool.nodepool_replicas
  )
  const [isAutoScale, setIsAutoScale] = useState(nodepool.autoscale)
  const [autoScale, setAutoScale] = useState(() => {
    if (nodepool.autoscale) {
      return [
        nodepool.scale_range.min_replicas,
        nodepool.scale_range.max_replicas,
      ]
    }
    return [1, 3]
  })

  useEffect(() => {
    const getVmCreateData = async () => {
      const listImage = await resourceStore.fetchListImage(props)

      setImageOptionList(listImage._originData.images)
    }

    getVmCreateData()
  }, [])

  const imageOptions = () => {
    return imageOptionList.map(obj => {
      const distroType = obj.os_distro.split('-')[0]
      return {
        label: t(obj.name),
        icon: `ico-os-${distroType}`,
        value: t(obj.name),
        description: t(obj.description),
        disabled: obj.phase !== 'Succeeded',
      }
    })
  }

  const handleEdit = () => {
    form.current.validator(() => {
      const { data } = form.current.props
      const scaleRange = {}
      scaleRange.min_replicas = isAutoScale ? autoScale[0] : 0
      scaleRange.max_replicas = isAutoScale ? autoScale[1] : 0
      data.scale_range = scaleRange
      data.autoscale = isAutoScale
      if (!isAutoScale) {
        data.replicas = nodepoolReplicas
      }
      props.onEdit({ ...data })
    })
  }
  const closeModal = () => {
    setModalView(false)
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
            handleEdit()
          }}
          className={classnames(styles['btn'], styles['btn-control'])}
          type={'control'}
          loading={props.store.isSubmitting}
          disabled={props.store.isSubmitting}
        >
          {t('RESOURCES_EDIT')}
        </Button>
      </>
    )
  }

  // Validation 시작 ==================================================
  const imageValidator = (rule, value, callback) => {
    if (value === t('RESOURCES_SELECT') || value === 'select') {
      return callback({ message: t('RESOURCES_SELECT_IMAGE_TIP') })
    }
    callback()
  }

  // 스크립트 시작 ==================================================
  // cpu count
  const increaseReplicaBtn = e => {
    e.preventDefault()
    if (nodepoolReplicas < 10) {
      setNodepoolReplicas(nodepoolReplicas + 1)
    }
  }
  const decreaseReplicaBtn = e => {
    e.preventDefault()
    if (nodepoolReplicas > 1) {
      setNodepoolReplicas(nodepoolReplicas - 1)
    }
  }

  const handlerAutoScale = e => {
    if (Array.isArray(e)) {
      const scale = [e[0], e[1] < 1 ? 1 : e[1]]
      setAutoScale(scale)
    } else {
      const maxNum = e > 10 ? 10 : e < 1 ? 1 : e
      setAutoScale([1, maxNum])
    }
  }

  // 스크립트 끝 ==================================================
  return (
    <>
      <Modal
        icon="pen"
        width={800}
        title={t('RESOURCES_EDIT_NODEPOOL')}
        onCancel={closeModal}
        bodyClassName={styles.body}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form}>
          {/* Content */}
          <div className={styles.pop_overflow_y}>
            <div className={styles.cont_boxwrap}>
              {/* 기본설정 설정 시작========================================== */}
              <div>
                <Form.Item
                  label={t('NAME')}
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
                    defaultValue={nodepool.name}
                    disabled={true}
                  />
                </Form.Item>
                <div style={{ padding: 10 }} />
                NodePool
                <span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
                      <Form.Item
                        rules={[{ required: true, validator: imageValidator }]}
                      >
                        <TypeSelect
                          name="kube_image"
                          defaultValue={nodepool.kube_image}
                          placeholder={{
                            label: t('RESOURCES_SELECT'),
                          }}
                          options={imageOptions()}
                          defaultDescription={t('RESOURCES_SELECT_IMAGE_TIP')}
                          disabled={true}
                        />
                      </Form.Item>
                    </Column>
                  </Columns>
                </Form.Group>
                <div style={{ padding: 10 }} />
                Replicas
                <span className="form-item-required">*</span>
                <Form.Group>
                  <Columns>
                    <Column>
                      <Form.Group
                        label={t('RESOURCES_AUTO_EXPAND')}
                        onChange={() => setIsAutoScale(!isAutoScale)}
                        checkable
                      >
                        <Form.Item label={t('RESOURCES_SCALING')}>
                          {isAutoScale ? (
                            <Slider
                              max={10}
                              min={1}
                              marks={{
                                1: '1',
                                2: '2',
                                3: '3',
                                4: '4',
                                5: '5',
                                6: '6',
                                7: '7',
                                8: '8',
                                9: '9',
                                10: '10',
                              }}
                              step={1}
                              defaultValue={autoScale}
                              onChange={e => handlerAutoScale(e)}
                              range
                              withInput
                            />
                          ) : (
                            <Slider
                              max={10}
                              min={1}
                              marks={{
                                1: '1',
                                2: '2',
                                3: '3',
                                4: '4',
                                5: '5',
                                6: '6',
                                7: '7',
                                8: '8',
                                9: '9',
                                10: '10',
                              }}
                              step={1}
                              value={autoScale}
                              onChange={e => handlerAutoScale(e)}
                              range
                              withInput
                            />
                          )}
                        </Form.Item>
                      </Form.Group>
                    </Column>
                    {!isAutoScale && (
                      <Column
                        align={'middle'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Form.Item>
                          <div style={{ marginBottom: '12px' }}>
                            <Button
                              icon="substract"
                              onClick={decreaseReplicaBtn}
                            />
                            &nbsp;&nbsp;
                            <Input
                              name="nodepoolReplicas"
                              value={nodepoolReplicas}
                              onChange={e => setNodepoolReplicas(e)}
                              style={{ width: '40%', textAlign: 'center' }}
                            />
                            &nbsp;&nbsp;
                            <Button icon="add" onClick={increaseReplicaBtn} />
                          </div>
                        </Form.Item>
                      </Column>
                    )}
                  </Columns>
                </Form.Group>
                <Form.Item
                  className={styles.textarea}
                  label={t('RESOURCES_DESCRIPTION')}
                  desc={t('DESCRIPTION_DESC')}
                >
                  <TextArea
                    name="description"
                    maxLength={256}
                    defaultValue={nodepool.description}
                  />
                </Form.Item>
                <div style={{ padding: 25 }} />
              </div>
              {/* 기본설정 설정 끝========================================== */}
            </div>
          </div>

          {/* Footer */}
          <div className={styles['modal-footer']}>{fnGetModalFooter()}</div>
        </Form>
      </Modal>
    </>
  )
}

export default ModifyNodePoolModal
