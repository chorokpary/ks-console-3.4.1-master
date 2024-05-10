import { get, find, some } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import { observer, inject } from 'mobx-react';

import { Form, Toggle, Notify, Select } from '@kube-design/components';
import { Modal } from 'components/Base';

import VmStore from 'stores/resources/vms';
import FloatingIpStore from 'stores/resources/floatingip';
import styles from './index.scss';

const FloatingIpModal = props => {
  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const vmStore = new VmStore();

  const vmName = props.store.detail.name;
  const vmId = props.store.detail.id;

  const [networkList, setNetworkList] = useState([]);
  const [floatingList, setFloatingList] = useState([]);

  const [floatingJsonData, setFloatingJsonData] = useState([]);

  const [networkIp, setNetworkIp] = useState(t('RESOURCES_SELECT'));
  const [floatingIp, setFloatingIp] = useState(t('RESOURCES_SELECT'));

  const [networkId, setNetworkId] = useState();
  const [floatingId, setFloatingId] = useState();

  const handleOk = () => {
    const success = props.success;

    form.current.validator(() => {
      if (floatingId == undefined) {
        return false;
      }

      const floatingStore = new FloatingIpStore();

      const data = {};
      data.name = floatingId;
      data.id = floatingId;
      data.instance_type = 'vm';
      data.instance_id = vmId;
      data.target_network = networkId;
      data.target_ip = networkIp;

      // console.log("form data :" + JSON.stringify(data))
      floatingStore.update({ ...props, ...data }).then(() => {
        Notify.success({ content: t('RESOURCES_CONNECT_SUCCESS_DESC') });
        success();
        closeModal();
      });
    });
  };

  const closeModal = () => {
    setModalView(false);
  };

  useEffect(() => {
    const getVmCreateData = async () => {
      const floatingListData = await vmStore.fetchVmListFloating(props);
      const networkListData = await vmStore.fetchVmListNetwork(props);
      const routerListData = await vmStore.fetchVmListRouter(props);

      const vmNetworks = props.store.detail.vm.networks;

      // VM 이 가지고 있는 네트워크 리스트
      const vmNetworkList = vmNetworks.map(network => network.name);

      // 네트워크 리스트 중 Internal 및 VM에 포함된 네트워크 추출
      const vmInternalNetworkList = await networkListData.networks.filter(
        network =>
          network.external == false && vmNetworkList.includes(network.id)
      );

      // 고정 ip, interface 추가
      await vmInternalNetworkList.map(network => {
        vmNetworks.map(row => {
          if (network.id == row.name) {
            network.network_ip = row.ip;
            network.interface = row.interface;
          }
        });
      });

      // VM 이 가지고 있는 internal 네트워크 중 Router 리스트에 포함된 네트워크 리스트
      const vmInRouterInternalList = [];
      await routerListData.routers.map(router => {
        vmInternalNetworkList.map(network => {
          if (some(router.internal, { id: network.id })) {
            vmInRouterInternalList.push(network.id);
          }
        });
      });

      // VM internal 에 관련된 Router external 추출해서 데이터 생성
      const vmInRouterData = [];
      await vmInRouterInternalList.map(name => {
        routerListData.routers.map(router => {
          if (some(router.internal, { id: name })) {
            const jsonData = {};
            jsonData.internal = name;
            jsonData.external = router.external;
            vmInRouterData.push(jsonData);
          }
        });
      });

      // Floating 리스트 중 external 관련해서 target_ip 가 없는 floatingIp 추가
      await vmInRouterData.map(data => {
        const floatingIpArray = [];
        floatingListData.floating_ips.map(floating => {
          if (floating.network == data.external.id && !floating.target_ip) {
            const jsonData = {};
            jsonData.id = floating.id;
            jsonData.floating_ip = floating.floating_ip;
            floatingIpArray.push(jsonData);
          }
        });
        data.floating_data = floatingIpArray;
      });

      setNetworkList(vmInternalNetworkList);
      setFloatingJsonData(vmInRouterData);
    };

    getVmCreateData();
  }, []);

  useEffect(() => {
    if (floatingJsonData.length > 0) {
      floatingJsonData.map(data => {
        if (data.internal === networkId) {
          setFloatingList(data.floating_data);
          if (data.floating_data.length > 0) {
            setFloatingId(data.floating_data[0].id);
            setFloatingIp(data.floating_data[0].floating_ip);
          } else {
            setFloatingIp(t('RESOURCES_SELECT'));
          }
        }
      });
    }
  }, [networkId, networkIp]);

  useEffect(() => {
    floatingList.map(obj => {
      if (obj.floating_ip === floatingIp) {
        setFloatingId(obj.id);
      }
    });
  }, [floatingIp]);

  const networkOptions = () => {
    const opt = networkList.map(obj => ({
      label: `${obj.network_ip}/${obj.name}/${obj.interface}`,
      value: t(obj.id),
      disabled: obj.interface === null,
    }));
    return opt;
  };

  const floatingOptions = () => {
    const opt = floatingList.map(obj => ({
      label: t(obj.floating_ip),
      value: t(obj.floating_ip),
      id: obj.id,
    }));
    return opt;
  };

  // Validation 시작 ==================================================
  const networkValidator = (rule, value, callback) => {
    if (value == t('RESOURCES_SELECT') || value == 'select') {
      return callback({ message: t('RESOURCES_SELECT_NETWORK_IP_TIP') });
    }
    callback();
  };

  const floatingValidator = (rule, value, callback) => {
    if (value == t('RESOURCES_SELECT') || value == 'select') {
      return callback({ message: t('RESOURCES_SELECT_FLOATING_IP_TIP') });
    }
    callback();
  };
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
            label={t('RESOURCES_STATIC_IP_NETWORK_INTERFACE_TIP')}
            rules={[{ required: true, validator: networkValidator }]}
          >
            <Select
              name="network"
              defaultValue={networkIp}
              options={networkOptions()}
              onChange={value => {
                networkList.map(obj => {
                  if (obj.id === value) {
                    setNetworkId(obj.id);
                    setNetworkIp(obj.network_ip);
                  }
                });
              }}
            />
          </Form.Item>

          <Form.Item
            label={t('RESOURCES_FLOATING_IP')}
            // rules={[{ required: true, validator: floatingValidator }]}
          >
            <Select
              // name="floating"
              defaultValue={floatingIp}
              options={floatingOptions()}
              onChange={e => {
                setFloatingIp(e);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FloatingIpModal;
