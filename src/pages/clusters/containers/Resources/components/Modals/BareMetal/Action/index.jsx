import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Form, Toggle, Notify, Select } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import BareMetalStore from 'stores/resources/baremetal';
import CustomStore from 'stores/monitoring/custom/monitor'

const FloatingIpModal = (props) => {

  const paramsData =  {"step":"3600s","times":168,"start":1698738891,"end":1699343691}

  const bareMetalStore = new BareMetalStore();
  const customStore = new CustomStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [targetIp, setTargetIp] = useState('선택'); 
  const [systemId, setSystemId] = useState(); 

  const handleOk = () => {

    const success = props.success;

    form.current.validator(async () => {     

      const systemId = await getSystemId(targetIp);

      const data = {}
      data.instanceIp = props.detail.ip;
      data.targetIp = targetIp,
      data.reseType = props.detail.state,
      data.systemId = systemId
      
      console.log("data : "+ JSON.stringify(data))

      // bareMetalStore.update(data, {name: data.id, ...data }).then(() => {
      //   Notify.success({ content: t('정상적으로 연결 되었습니다.') })
      //   success();
      //   closeModal();
      // })

    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const targetIpOptions = () => {
    const opt = (props.detail["redfish-exporter"]["target"]).map((obj) => ({
      label: t(obj),
      value: t(obj),
    }))
    return opt
  }

  const handleSelect = (ip) => {
    setTargetIp(ip)
  }

  // Validation 시작 ==================================================

  const targetIpValidator = (rule, value, callback) => {
    if(value == "선택" || value == "select"){
      return callback({ message: t('Target IP를 선택해 주세요.') })
    }
    callback()
  }
  // Validation 끝 ==================================================

  const getSystemId = async (targetIp) => {

    const paramsData =  {"step":"3600s","times":168,"start":1698738891,"end":1699343691}

    const metric = `redfish_system_state{target="${targetIp}",instance=~"${props.detail.ip}.*"}`
    const metricData = await customStore.fetchMetric({
      expr: metric,
    })

    const system_id = get(metricData[0], 'metric.system_id', "")
    console.log("system_id : "+ system_id)
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
          <Form.Item
            label={t('Target IP')}
            rules={[{ required: true, validator: targetIpValidator }]}
          >
            <Select
              name="target_ip"
              defaultValue={targetIp}
              options={targetIpOptions()} 
              onChange={(value) => handleSelect(value)}      
            />
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default FloatingIpModal

