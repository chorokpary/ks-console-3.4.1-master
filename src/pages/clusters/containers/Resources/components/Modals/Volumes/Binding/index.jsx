import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'
import { observer, inject } from 'mobx-react';

import { Form, Toggle, Notify, Select } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'
import FloatingIpStore from 'stores/resources/floatingip';

const BindingModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const vmStore = new VmStore();
 
  const vmName = props.store.detail.name;

  const [networkList, setNetworkList] = useState([]);
  const [floatingList, setFloatingList] = useState([]);

  const [floatingJsonData, setFloatingJsonData] = useState([]);

  const [networkIp, setNetworkIp] = useState('선택'); 
  const [floatingIp, setFloatingIp] = useState('선택'); 

  const [networkName, setNetworkName] = useState(); 
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
      data.instance_type = 'vm'
      data.instance_name = vmName
      data.target_network = networkName
      data.target_ip = networkIp

      // console.log("form data :" + JSON.stringify(data))

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

    const getVmCreateData = async () => {

      const floatingListData = await vmStore.fetchVmListFloating();
      const networkListData = await vmStore.fetchVmListNetwork();
      const routerListData = await vmStore.fetchVmListRouter();

      const vmNetworks = props.store.detail.vm.networks;

      // VM 이 가지고 있는 네트워크 리스트
      const vmNetworkList = (vmNetworks).map((network) => network.name);

      // 네트워크 리스트 중 Internal 및 VM에 포함된 네트워크 추출
      const vmInternalNetworkList = await (networkListData.networks).filter((network) => network.external == false && vmNetworkList.includes(network.name));

      // 고정 ip, interface 추가 
      await vmInternalNetworkList.map((network) => {
        (vmNetworks).map((row) => {
            if(network.name == row.name){
            network.network_ip = row.ip;
            network.interface = row.interface;
            }
        });
      })      

      // VM 이 가지고 있는 internal 네트워크 중 Router 리스트에 포함된 네트워크 리스트
      const vmInRouterInternalList = [];
      await (routerListData.routers).map((router) => {
        vmInternalNetworkList.map((network) => {
            if((router.internal).includes(network.name)){
            vmInRouterInternalList.push(network.name);
            }
        })        
      })

      // VM internal 에 관련된 Router external 추출해서 데이터 생성
      const vmInRouterData = [];
      await vmInRouterInternalList.map((name) => {
        (routerListData.routers).map((router) => {
            if((router.internal).includes(name)){
              let jsonData = {};
              jsonData.internal = name;
              jsonData.external = router.external;
              vmInRouterData.push(jsonData);
            }
        })        
      })

      // Floating 리스트 중 external 관련해서 target_ip 가 없는 floatingIp 추가 
      await vmInRouterData.map((data) => {
        let floatingIpArray = [];
        (floatingListData.floating_ips).map((floating) => {          
          if(floating.network == data.external && !!!floating.target_ip){
              let jsonData = {};
              jsonData.id = floating.id;
              jsonData.floating_ip = floating.floating_ip
              floatingIpArray.push(jsonData);
          }
        })
        data.floating_data = floatingIpArray;
      })

      setNetworkList(vmInternalNetworkList);
      setFloatingJsonData(vmInRouterData);

    };

    getVmCreateData();

  }, [])

  const handleSelect = (name) => {

    networkList.map((obj) => {
      if(obj.name == name){
        setNetworkName(obj.name)
        setNetworkIp(obj.network_ip)
      }
    })

    // 셀렉트 선택 시 셋팅 변경
    if(floatingJsonData.length > 0 ){
      floatingJsonData.map((data) => {
        if(data.internal == name){
          setFloatingList(data.floating_data);
          if(data.floating_data.length > 0 ){
            setFloatingId(data.floating_data[0].id);
            setFloatingIp(data.floating_data[0].floating_ip);
          }else{
            setFloatingIp('선택');
          }
        }
      })
    }
  }

  const networkOptions = () => {
    const opt = networkList.map((obj) => ({
      label: obj.network_ip+"/"+obj.name+"/"+obj.interface,
      value: t(obj.name),
    }))
    return opt
  }

  const floatingOptions = () => {
    const opt = floatingList.map((obj) => ({
      label: t(obj.floating_ip),
      value: t(obj.floating_ip),
    }))
    return opt
  }

  // Validation 시작 ==================================================
  const networkValidator = (rule, value, callback) => {
    if(value == "선택" || value == "select"){
      return callback({ message: t('네트워크 IP를 선택해 주세요.') })
    }
    callback()
  }

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
            label={t('고정 IP ( IP/네트워크 이름/인터페이스 )')}
            rules={[{ required: true, validator: networkValidator }]}
          >
            <Select
              name="network"
              defaultValue={networkIp}
              options={networkOptions()}
              onChange={(value) => handleSelect(value)}              
            />
          </Form.Item>

          <Form.Item
            label={t('플로팅 IP')}
            // rules={[{ required: true, validator: floatingValidator }]}
          >
            <Select
              // name="floating"
              defaultValue={floatingIp}
              options={floatingOptions()} 
            />
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default BindingModal

