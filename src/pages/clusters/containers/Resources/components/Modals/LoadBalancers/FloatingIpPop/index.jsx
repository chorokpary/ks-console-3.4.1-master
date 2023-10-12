import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Form, Input, Notify, Select } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import LoadBalancerStore from 'stores/resources/loadbalancers'
import FloatingIpStore from 'stores/resources/floatingip';

const FloatingIpModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const loadBalancerStore = new LoadBalancerStore();
 
  const lbName = props.store.detail.name;

  const [floatingList, setFloatingList] = useState([]);

  const [vIp, setVIp] = useState(''); 
  const [networkName, setNetworkName] = useState(''); 
  const [floatingIp, setFloatingIp] = useState('선택'); 

  const [floatingId, setFloatingId] = useState(); 

  const handleOk = () => {

    const success = props.success;

    form.current.validator(() => {

      if(floatingId == undefined){
        return false;
      }

      const floatingStore = new FloatingIpStore();

      const data = {};
      data.name = floatingId,
      data.id = floatingId,
      data.instance_type = 'lb'
      data.instance_name = lbName
      data.target_network = networkName
      data.target_ip = vIp
      console.log(data)
      floatingStore.update(data, {name: data.id, ...data }).then(() => {
        Notify.success({ content: t('정상적으로 연결 되었습니다.') })
        success();
        closeModal();
      })

    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {

    const getCreateData = async () => {

      const floatingListData = await loadBalancerStore.fetchFloatingList();

      // Floating 리스트 중 external 관련해서 target_ip 가 없는 floatingIp 추가 
        let floatingIpArray = [];
        (floatingListData.floating_ips).map((floating) => {          
          if(!!!floating.target_ip){
              let jsonData = {};
              jsonData.id = floating.id;
              jsonData.floating_ip = floating.floating_ip
              jsonData.network = floating.network
              floatingIpArray.push(jsonData);
          }
        })

        setFloatingList(floatingIpArray);
        setVIp(props.store.detail.lb.virtual_ip)
    };

    getCreateData();
  }, [])

  const floatingOptions = () => {
    const opt = floatingList.map((obj) => ({
      label: t(obj.floating_ip),
      value: t(obj.floating_ip),
    }))
    return opt
    }

    const handleSelect = (ip) => {
        // 셀렉트 선택 시 셋팅 변경
        if (floatingList.length > 0) {
            floatingList.map((data) => {
                if (data.floating_ip === ip) {
                    setFloatingId(data.id);
                    setFloatingIp(data.floating_ip);
                    setNetworkName(data.network)
                }
            })
        }
    }

  // Validation 시작 ==================================================
  const floatingValidator = (rule, value, callback) => {
    if(value == "선택" || value == "select"){
      return callback({ message: t('Floating IP를 선택해 주세요.') })
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
            label={t('VIP')}
          >
            <Input type="text" value={vIp} disabled/>
          </Form.Item>

          <Form.Item
            label={t('플로팅 IP')}
            rules={[{ required: true, validator: floatingValidator }]}
          >
            <Select
              value={floatingIp}
              options={floatingOptions()} 
              onChange={(e) => handleSelect(e)}
            />
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default FloatingIpModal

