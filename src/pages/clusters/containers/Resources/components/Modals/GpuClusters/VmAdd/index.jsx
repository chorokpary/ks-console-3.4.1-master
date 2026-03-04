import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Tabs,
  Loading,
  Text,
  Checkbox,
} from '@kube-design/components'
import { Modal } from 'components/Base'
import classnames from 'classnames'
import styles from './index.scss'

const VmAddModal = props => {
  const store = props.store
  const [vmDataList, setVmDataList] = useState([])

  const form = useRef()
  const [modelView, setModalView] = useState(true)
  const [formData, setFormData] = useState({})

  const [tab, setTab] = useState('vmall')
  const { TabPanel } = Tabs

  useEffect(() => {
    const fnGetData = async () => {
      const detailParams = {
        namespace: store.detail.data?.namespace,
        name: store.detail.data?.name,
        limit: 1000,
      }

      const vmList = await store.fetchVmsList(detailParams)
      setVmDataList(vmList)
    }
    fnGetData()
  }, [])

  useEffect(() => {
    if (vmDataList.length > 0) {
      setVmCheckItems(vmDataList.filter(vm => vm.connect).map(vm => vm.vmName))
    }
  }, [vmDataList])

  const handleOk = () => {
    const onOk = props.onOk

    form.current.validator(() => {
      onOk({ data: vmCheckItems })
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
      vmDataList.forEach(el => nameArray.push(el.vmName))

      setVmCheckItems(nameArray)
    } else {
      setVmCheckItems([])
    }
  }

  const handleDelete = vmName => {
    setVmCheckItems(vmCheckItems.filter(el => el !== vmName))
  }

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
            <Form.Item>
              <Tabs
                type="button"
                activeName={tab}
                onChange={newTab => {
                  setTab(newTab)
                }}
              >
                <TabPanel label={t('전체')} name="vmall" />
                <TabPanel label={t('연결')} name="vmconnect" />
                <TabPanel label={t('미연결')} name="vmdisconnect" />
              </Tabs>
            </Form.Item>
            <Form.Item>
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
                                vmDataList.length > 0 &&
                                vmCheckItems.length === vmDataList.length
                              )
                            }
                          />
                        </th>
                        <th>
                          <strong>{t('RESOURCES_NAME')}</strong>
                        </th>
                        <th>
                          <strong>{t('RESOURCES_STATE')}</strong>
                        </th>
                        <th>
                          <strong>{t('RESOURCES_NODE')}</strong>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vmDataList.length == 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="no-data"
                            style={{ textAlign: 'center' }}
                          >
                            <p>{t('RESOURCES_NO_VM')}</p>
                          </td>
                        </tr>
                      )}
                      {vmDataList
                        .filter(data => {
                          if (tab == 'vmconnect') {
                            return !!vmCheckItems.includes(data.vmName)
                          } else if (tab == 'vmdisconnect') {
                            return !vmCheckItems.includes(data.vmName)
                          } else {
                            return data
                          }
                        })
                        .sort((a, b) => a.vmName.localeCompare(b.vmName))
                        .map((data, key) => {
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
                              <td>
                                {t(`RESOURCES_${data.vmPhase.toUpperCase()}`)}
                              </td>
                              <td>{data.nodeName}</td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Form.Item>
          </Form>
        </div>

        <div className={styles.footer}>
          <Button onClick={closeModal} data-test="modal-cancel">
            {t('CANCEL')}
          </Button>
          <Button
            type="control"
            loading={props.store.isSubmitting}
            disabled={
              props.store.isSubmitting
              //  || vmCheckItems.length === 0
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

export default VmAddModal
