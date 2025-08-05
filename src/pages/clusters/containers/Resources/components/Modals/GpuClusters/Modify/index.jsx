import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Loading,
  Text,
  Checkbox,
} from '@kube-design/components'
import { Modal } from 'components/Base'
import classnames from 'classnames'
import styles from './index.scss'

const ModifyModal = props => {
  const store = props.store
  const vmData = store.detail.data?.instances || []
  const [vmList, setVmiList] = useState(vmData)

  const form = useRef()
  const [modelView, setModalView] = useState(true)
  const [formData, setFormData] = useState({})
  const [retype, setRetype] = useState('')

  const handleOk = () => {
    const onOk = props.onOk

    form.current.validator(() => {
      const { data } = form.current.props
      data.id = props.store.detail.id
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false)
  }

  // 체크 리스트 시작 ==================================================

  const [vmCheckItems, setVmCheckItems] = useState([])

  const handleSingleCheck = (checked, vmName) => {
    if (checked) {
      setVmCheckItems(prev => [...prev, vmName])
    } else {
      setVmCheckItems(vmCheckItems.filter(el => el !== vmName))
    }
  }

  const handleAllCheck = checked => {
    if (checked) {
      const nameArray = []
      vmList.forEach(el => nameArray.push(el.vmName))

      setVmCheckItems(nameArray)
    } else {
      setVmCheckItems([])
    }
  }

  const handleDelete = vmName => {
    setVmCheckItems(vmCheckItems.filter(el => el !== vmName))
  }

  useEffect(() => {
    console.log('vmCheckItems', vmCheckItems)
  }, [vmCheckItems])

  // 체크 리스트 끝 ==================================================

  return (
    <>
      <Modal
        icon="pen"
        width={700}
        title={props.title}
        bodyClassName={styles.modalBody}
        // onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        isSubmitting={props.store.isSubmitting}
        hideFooter
      >
        <div className={styles.body}>
          <Form data={formData} ref={form}>
            <Form.Item label={t('RESOURCES_VM')}>
              <div className={styles.wrapper}>
                {vmCheckItems.length > 0 && (
                  <div
                    className={classnames(
                      styles.table_title,
                      styles.table_title_bg
                    )}
                  >
                    <Button
                      className={styles.table_title_button}
                      onClick={() => handleAllCheck(false)}
                    >
                      {t('RESOURCES_ALL_DESELECT')}
                    </Button>{' '}
                    {vmCheckItems.length}
                    {t('RESOURCES_COUNT')} {t('RESOURCES_SELECT')}
                  </div>
                )}
                <div className={styles.table}>
                  <table>
                    <colgroup>
                      <col width="5%" />
                      <col width="40%" />
                      <col width="30%" />
                      <col width="25%" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>
                          <Checkbox
                            name="select-all-internal"
                            onChange={checked =>
                              handleAllCheck(checked, 'internal')
                            }
                            checked={
                              !!(
                                vmList.length > 0 &&
                                vmCheckItems.length === vmList.length
                              )
                            }
                          />
                        </th>
                        <th>
                          <strong>{t('이름')}</strong>
                        </th>
                        <th>
                          <strong>{t('상태')}</strong>
                        </th>
                        <th>
                          <strong>{t('노드')}</strong>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vmList.length == 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="no-data"
                            style={{ textAlign: 'center' }}
                          >
                            <p>{t('할당된 가상머신이 없습니다.')}</p>
                          </td>
                        </tr>
                      )}
                      {vmList.map((data, key) => {
                        return (
                          <tr key={data.vmName}>
                            <td>
                              <Checkbox
                                name={`select-${data.vmName}`}
                                checked={!!vmCheckItems.includes(data.vmName)}
                                onChange={checked =>
                                  handleSingleCheck(checked, data.vmName)
                                }
                              />
                            </td>
                            <td>{data.vmName}</td>
                            <td>{data.vmPhase}</td>
                            <td>{data.nodeName}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {/* <div className={styles.removeCheckWrapper}>
                    {vmCheckItems?.map(vmName => {
                      return (
                        <span key={vmName}>
                          <Button
                            icon="close"
                            onClick={() => handleDelete(vmName)}
                          >
                            {vmName}
                          </Button>{' '}
                        </span>
                      )
                    })}
                  </div> */}
                </div>
              </div>
            </Form.Item>

            <Form.Item
              label={t('삭제 확인')}
              desc={t(
                `가상머신 이름 ${vmCheckItems
                  .map(name => name)
                  .join(
                    ', '
                  )}을 입력하여 이 작업의 위험을 이해하고 있는지 확인합니다.`
              )}
            >
              <Input
                style={{ maxWidth: 'none' }}
                name="retype"
                placeholder={vmCheckItems.map(name => name).join(', ')}
                onChange={e => setRetype(e)}
                defaultValue={retype}
                // defaultValue={props.store.detail.keypair.description}
              />
            </Form.Item>
          </Form>
        </div>

        <div className={styles.footer}>
          <Button onClick={closeModal} data-test="modal-cancel">
            {t('CANCEL')}
          </Button>
          <Button
            type="danger"
            loading={props.store.isSubmitting}
            disabled={
              props.store.isSubmitting ||
              vmCheckItems.length === 0 ||
              !retype ||
              retype !== vmCheckItems.join(', ')
            }
            onClick={handleOk}
            data-test="modal-ok"
          >
            {t('OK')}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default ModifyModal
