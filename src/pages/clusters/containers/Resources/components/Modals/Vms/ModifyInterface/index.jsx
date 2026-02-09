import { toJS } from 'mobx'
import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'

import VmStore from 'stores/resources/vms'
import classnames from 'classnames'
import styles from './index.scss'

const ModifyInterfaceModal = (props) => {

  const form = useRef();
  const project = props.store.detail.vm.project
  const vmStore = new VmStore()
  const [modelView, setModalView] = useState(true)
  const [formData, setFormData] = useState({})

  const [networkList, setNetworkList] = useState([])
  const [selectedIpList, setSelectedIpList] = useState([])
  const [availableIpList, setAvailableIpList] = useState([])

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      if (networkCheckItems.length > 0) {
        const { data } = form.current.props;
        data.project = project;
        data.interfaces = selectedIpList;
        onOk({ ...data })
      }
    })
  }
  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {
    const getVmCreateData = async () => {
      const listAvailableIps = await vmStore.fetchAllAvailableIps({ ...props })
      setNetworkList(props.store.networksList);
      setAvailableIpList(listAvailableIps.all_ips)
    };

    getVmCreateData();

  }, [])

  // 체크 리스트 시작 ==================================================
  const [networkCheckItems, setNetworkCheckItems] = useState([])

  const dataListVariables = {
    network: networkList,
  }

  const stateVariables = {
    network: networkCheckItems,
  }

  const setVariables = {
    network: setNetworkCheckItems,
  }
  
  const availableIpOptions = (netId, project) => {
    const networkIps = availableIpList.find(
      obj => obj.network === netId && obj.project === project
    )
    if (networkIps !== undefined) {
      return networkIps.ips.map(ip => {
        return {
          label: t(ip),
          value: t(ip),
        }
      })
    }
  }

  const handleIpSelectClick = (netId, val) => {
    const record = {}
    record.network = project + "/" + netId
    record.ipAddress = val
    const existing = selectedIpList.filter(obj => obj.network !== project + "/" + netId)
    if (val !== t('RESOURCES_SELECT') && val !== undefined) {
      existing.push(record)
    }
    setSelectedIpList(existing)

    const updatedNetworkList = networkList.map(item => {
      if (item.id === netId) {
        return { ...item, ip: val }
      }
      return item
    })
    setNetworkList(updatedNetworkList)
  }
  
  const handleSingleCheck = (checked, name, type) => {
    if (checked) {
      setVariables[type](prev => [...prev, name]);
    } else {
      setVariables[type](stateVariables[type].filter((el) => el !== name));
    }
  };

  const handleAllCheck = (checked, type) => {
    if (checked) {
      const nameArray = [];
      dataListVariables[type].forEach((el) => nameArray.push(el.name));
      setVariables[type](nameArray);
    } else {
      setVariables[type]([]);
    }
  }

  const handleDelete = (name, type) => {
    setVariables[type](stateVariables[type].filter((el) => el !== name));
  };

  // 체크 리스트 끝 ==================================================

  return (
    <>
      <Modal
        icon="pen"
        width={900}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        isSubmitting={props.store.isSubmitting}
      >
        <Form data={formData} ref={form}>
          <Form.Item label={t('RESOURCES_NETWORK')}>
            <div className={styles.wrapper}>
              {stateVariables['network'].length > 0 && (
                <div
                  className={classnames(
                    styles.table_title,
                    styles.table_title_bg
                  )}
                >
                  <Button
                    className={styles.table_title_button}
                    onClick={() => handleAllCheck(false, 'network')}
                  >
                    {t('RESOURCES_ALL_DESELECT')}
                  </Button>
                  {stateVariables['network'].length}
                  {t('RESOURCES_COUNT')} {t('RESOURCES_SELECT')}
                </div>
              )}
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="5%" />
                    <col width="20%" />
                    <col width="15%" />
                    <col width="20%" />
                    <col width="20%" />
                    <col width="20%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>
                        <Checkbox
                          name="select-all-network"
                          onChange={checked =>
                            handleAllCheck(checked, 'network')
                          }
                          checked={
                            !!(
                              dataListVariables['network'].length > 0 &&
                              stateVariables['network'].length ===
                              dataListVariables['network'].length
                            )
                          }
                        />
                      </th>
                      <th>
                        <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_NETWORK_TYPE_YOO')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_IP_ASSIGNMENT')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_CIDR')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GATEWAY')}</strong>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!networkList?.length && (
                      <tr>
                        <td colSpan="6" className="no-data">
                          <p>
                            {t(
                              'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                            )}
                          </p>
                        </td>
                      </tr>
                    )}
                    {networkList?.map(data => (
                      <tr key={data.name}>
                        <td>
                          <Checkbox
                            name={`select-${data.name}`}
                            checked={
                              !!stateVariables['network'].includes(
                                data.name
                              )
                            }
                            onChange={checked =>
                              handleSingleCheck(
                                checked,
                                data.name,
                                'network'
                              )
                            }
                          />
                        </td>
                        <td>{data.name}</td>
                        <td>{data.type.toUpperCase()}</td>
                        <td>
                          <Select
                            name={`${data.name}-ip`}
                            placeholder={t('RESOURCES_NO_IP_CHANGE')}
                            options={availableIpOptions(
                              data.name,
                              data.project
                            )}
                            onChange={e =>
                              handleIpSelectClick(data.name, e)
                            }
                            disabled={
                              !networkCheckItems.includes(data.name)
                            }
                            clearable
                          />
                        </td>
                        <td>{data.cidr}</td>
                        <td>{data.gateway_ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.removeCheckWrapper}>
                  {networkCheckItems?.map(name => {
                    return (
                      <span key={name}>
                        <Button
                          icon="close"
                          onClick={() => handleDelete(name, 'network')}
                        >
                          {name}
                        </Button>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </Form.Item>

        </Form>
      </Modal>

    </>
  );
};

export default ModifyInterfaceModal

