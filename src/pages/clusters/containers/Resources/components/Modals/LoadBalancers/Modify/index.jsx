import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Button } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import LoadBalancerStore from 'stores/resources/loadbalancers'

const ModifyModal = (props) => {

  const loadBalancerStore = new LoadBalancerStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [vmDataList, setVmDataList] = useState([]);
  const [isMembers, setIsMembers] = useState(true);

  const [networkName, setNetworkName] = useState(props.store.detail?.lb?.network.id);
  const [networkList, setNetworkList] = useState([]);

  useEffect(() => {
    const getCreateData = async () => {
      const listVm = await loadBalancerStore.fetchVmList(props);
      const listNetwork = await loadBalancerStore.fetchNetworkList(props);

      const networkList = listNetwork.filter(obj => obj.project === props.store.detail?.lb.project) || []
      setNetworkList(networkList)

      setVmDataList(listVm.vms);
    };

    getCreateData();
  }, [])

  const vmOptions = () => {
    const opt = vmDataList.filter((el) => el.networks.map(elN => elN.name).includes(networkName)).map((obj) => ({
      label: t(obj.name),
      value: t(obj.id),
      disabled: obj.state === 'Running' ? false : true
    }))
    return opt
  }

  const [formMemberIpFields, setFormMemberIpFields] = useState([]);

  useEffect(() => {
    const opt = props.store.detail?.lb.members.map(obj => ({
      vmId: vmDataList.filter((el) => el.networks.map(elN => elN.ip).includes(obj))[0]?.id
      , memberIp: obj
    }))
    setFormMemberIpFields(opt)
  }, [vmDataList])

  const handleOk = () => {
    const onOk = props.onOk;
    const members = [...formMemberIpFields].filter(el => el.memberIp).map(obj => obj.memberIp);

    setIsMembers(members.length > 0);

    form.current.validator(() => {

      if (members.length > 0) {
        const { data } = form.current.props;
        const { id, lb } = props.store.detail
        data.members = members;
        data.id = id;
        data.network = lb.network.id
        data.description = data.description || ''
        onOk({ lb: data, ...props })
      }

    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const memberIpObj = {
    vmId: t('RESOURCES_SELECT')
    , memberIp: ''
    , message: ''
  }
  //멤버 IP handler
  const handleMemberIp = {

    handleAddFields: () => {
      const values = [...formMemberIpFields, memberIpObj];
      setFormMemberIpFields(values);
    },

    handleRemoveFields: (i) => {
      const values = [...formMemberIpFields].filter((obj, idx) => idx !== i);
      setFormMemberIpFields(values);
      if (values.length < 1) {
        setIsMembers(false);
      }
    },

    handleSelectClick: (i, val) => {
      const values = [...formMemberIpFields];

      const opt = vmDataList.filter((el) => el.id === val).map((obj) => {
        return obj.networks.filter((el) => el.name === networkName).map((network) => ({
          value: network.ip
        }))
      })

      if (!values.map(obj => obj.vmId).includes(val) || values[i].vmId === val || val === "") {
        values[i].message = ""
        values[i].vmId = val;
        values[i].memberIp = opt[0][0].value;
        setIsMembers(true);
      } else {
        values[i].message = t('RESOURCES_ALREADY_SELECTED_VM_NAME');
        setTimeout(() => { handleMemberIp.deleteMessage(i) }, 1000);
      }

      setFormMemberIpFields(values);
    },

    deleteMessage: (i) => {
      const values = [...formMemberIpFields];
      values[i].message = "";
      setFormMemberIpFields(values);
    },

    handleIpSelectClick: (i, val) => {
      const values = [...formMemberIpFields];
      values[i].memberIp = val;

      setFormMemberIpFields(values);
    },

    handleIpClear: () => {
      setFormMemberIpFields([memberIpObj]);
    },

  }//end 멤버 IP

  const networkOptions = () => {
    const opt = networkList.filter((el) => !el.external).map((obj) => ({
      label: t(obj.name),
      value: t(obj.id),
    }))
    return opt
  }
  const networkValidator = (rule, value, callback) => {
    if (value == t('RESOURCES_SELECT') || value == "select") {
      return callback({ message: t('RESOURCES_SELECT_NETWORK_NAME_TIP') })
    }
    callback()
  }

  useEffect(() => {
    handleMemberIp.handleIpClear();
  }, [networkName])

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        cancelText={t('RESOURCES_CANCEL')}
        visible={modelView}
      >
        <Form data={formData} ref={form}>

          <Form.Item
            label={t('RESOURCES_NAME')}
          >
            <Input
              name="name"
              autoFocus={true}
              maxLength={63}
              style={{ maxWidth: 'none' }}
              defaultValue={props.store.detail.lb.name}
              disabled
            />
          </Form.Item>
          <div style={{ padding: 10 }} />

          <Form.Item label={t('RESOURCES_NETWORK_NAME')} rules={[{ required: true, validator: networkValidator }]}>
            <Select name="network"
              options={networkOptions()}
              onChange={(e) => setNetworkName(e)}
              defaultValue={props.store.detail?.lb.network.name}
            />
          </Form.Item>
          <div style={{ padding: 10 }} />

          {t('RESOURCES_MEMBER_IP')}<span className="form-item-required">*</span>
          <Form.Item>
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="20%" />
                    <col width="20%" />
                    <col width="10%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th><strong>{t('RESOURCES_VM_NAME')}</strong></th>
                      <th><strong>{t('RESOURCES_VM_IP')}</strong></th>
                      <th><strong></strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formMemberIpFields.map((v, i) => (
                      <tr key={i}>
                        <td>
                          <Select value={v.message ? v.message : v.vmId} options={vmOptions()} onChange={(e) => handleMemberIp.handleSelectClick(i, e)} />
                        </td>
                        <td>
                          <Input type="text " value={v.memberIp} disabled />
                        </td>
                        <td>
                          <Button
                            type="flat"
                            icon="trash"
                            onClick={() => handleMemberIp.handleRemoveFields(i)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={`form-item-error ${isMembers ? "hide" : ""}`} style={{ marginLeft: '10px' }}>{t('RESOURCES_SELECT_VM_NAME_TIP')}</div>
              </div>
              <div className="text-right">
                <Button
                  className={styles.add}
                  onClick={handleMemberIp.handleAddFields}
                >
                  {t('RESOURCES_ADD')}
                </Button>
              </div>
            </div>
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
              defaultValue={props.store.detail.lb.description || ''}
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

        </Form>
      </Modal >

    </>
  );
};

export default ModifyModal

