import { get, omit, pick } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Form, Notify, Select, Radio } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'
import VolumeStore from 'stores/resources/volumes';

const BindingModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const vmStore = new VmStore();
  const volumeStore = new VolumeStore();

  const [vmList, setVmList] = useState([]);
  const [vmId, setVmId] = useState();
  const [radioPersist, setRadioPersist] = useState("T");

  const [volumeList, setVolumeList] = useState([]);
  const [attachedVmList, setAttachedVmList] = useState([]);

  const handleOk = () => {
    const success = props.success;

    form.current.validator(() => {

      const data = {}

      data.vmId = vmId
      data.persist = radioPersist == "T" ? true : false
      data.actionType = "A"
      data.id = props.store.detail.id

      volumeStore.actionState({ data, ...props }).then(() => {
        Notify.success({ content: t('RESOURCES_CONNECT_SUCCESS_DESC') })
        success();
        closeModal();
      })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {

    const getVmCreateData = async () => {
      const vmListData = await vmStore.fetchList({ cluster: props.cluster, namespace: props.namespace });
      setVmList(vmListData);

      const volumeData = await volumeStore.fetchList({ cluster: props.cluster, namespace: props.namespace });
      const attachedVmList = volumeData?.filter((row) => (row.used_by_vmi != "" && row.used_by_vmi != null)).map((el) => el.used_by_vmi)

      setAttachedVmList(attachedVmList);
    };

    getVmCreateData();

  }, [])

  const handleSelect = (id) => {
    setVmId(id);
  }

  const vmOptions = () => {
    const opt = vmList.map((obj) => {
      return {
        label: obj.name,
        value: t(obj.id),
      }
    })
    return opt
  }

  // Validation 시작 ==================================================
  const vmValidator = (rule, value, callback) => {
    if (value == t('RESOURCES_SELECT') || value == "select") {
      return callback({ message: t('RESOURCES_SELECT_VM_TIP') })
    }
    callback()
  }

  // Validation 끝 ==================================================


  return (
    <>
      <Modal
        icon="pen"
        width={600}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('RESOURCES_VM_NAME')}
            rules={[{ required: true, validator: vmValidator }]}
          >
            <Select
              name="vmSelect"
              defaultValue={t('RESOURCES_SELECT')}
              options={vmOptions()}
              onChange={(value) => handleSelect(value)}
            />
          </Form.Item>

          <Form.Item label={t('Persist')}>
            <div className={styles.wrapper}>
              <Radio name="snatType" value="T" checked={radioPersist === "T"} onChange={(e) => { setRadioPersist("T"); }}>{t('RESOURCES_USE')}</Radio>
              <Radio name="snatType" value="F" checked={radioPersist === "F"} onChange={(e) => { setRadioPersist("F"); }}>{t('RESOURCES_NOT_USE')}</Radio>
            </div>
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default BindingModal

