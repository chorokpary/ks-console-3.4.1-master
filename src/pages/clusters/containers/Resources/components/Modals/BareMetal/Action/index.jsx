import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Form, Toggle, Notify, Select } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import CustomStore from 'stores/monitoring/custom/monitor'

const ActionModal = (props) => {

  const customStore = new CustomStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const handleOk = async () => {

    const onOk  = props.onOk;
    const systemId = await getSystemId(props.detail.openBMC.address);

    form.current.validator(() => {
  
      if(systemId == "" ){
        Notify.error(t('RESOURCES_NO_SYSTEM_ID'))
      }else{
        const { data } = form.current.props;
        data.address = props.detail.openBMC.address,
        data.id = props.detail.openBMC.username,
        data.password = props.detail.openBMC.password,
        data.resetType = props.resetType,
        data.systemId = systemId
  
        console.log("data :" + JSON.stringify(data))
        onOk({ ...data })
      }   

    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const getSystemId = async (targetIp) => {

    const metric = `redfish_system_state{target="${targetIp}"}`
    const metricData = await customStore.fetchMetric({
      expr: metric,
    })

    console.log("metricData : "+ JSON.stringify(metricData))

    const system_id = get(metricData[0], 'metric.system_id', "")
    return system_id
  }

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
          <div>
            {t('RESOURCES_CHANGE_NODE_STATE')}
          </div>
        </Form>
      </Modal>

    </>
  );
};

export default ActionModal

