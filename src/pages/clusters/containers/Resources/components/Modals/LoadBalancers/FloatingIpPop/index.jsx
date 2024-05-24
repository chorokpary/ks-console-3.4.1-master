import { get } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import { observer, inject } from 'mobx-react';

import { Form, Input, Notify, Select } from '@kube-design/components';
import { Modal } from 'components/Base';

import LoadBalancerStore from 'stores/resources/loadbalancers';
import FloatingIpStore from 'stores/resources/floatingip';
import styles from './index.scss';

const FloatingIpModal = props => {
  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const lbId = props.store.detail.id;

  const [floatingList, setFloatingList] = useState([]);

  const [vIp, setVIp] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [floatingIp, setFloatingIp] = useState(t('RESOURCES_SELECT'));

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
      data.instance_type = 'lb';
      data.instance_id = lbId;
      data.target_network = networkName;
      data.target_ip = vIp;
      console.log(data);
      floatingStore
        .update({ cluster: props.cluster, namespace: props.namespace, ...data })
        .then(() => {
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
    const getCreateData = async () => {
      const routerList = await props.store.routerList({
        cluster: props.cluster,
        namespace: props.namespace,
      });

      /*
      fip list
      lb network id가
      router list 의 internal 과 같은것.
      해당 router들의 external이 fip의 network 인 것들?
      floating.target_ip 가 없는것들만 (할당 안된것들)
      */

      const routerArr = [];
      routerList?.routers.map(obj => {
        obj.internal?.map(it => {
          if (it.id === props.store.detail.lb.network.id) {
            routerArr.push(obj.external.id);
          }
        });
      });

      const floatingListData = props.store.floatingIpsList;
      // Floating 리스트 중 external 관련해서 target_ip 가 없는 floatingIp 추가
      const floatingIpArray = [];
      floatingListData.map(floating => {
        if (!floating.target_ip && routerArr.includes(floating.network)) {
          const jsonData = {};
          jsonData.id = floating.id;
          jsonData.floating_ip = floating.floating_ip;
          jsonData.network = floating.network;
          floatingIpArray.push(jsonData);
        }
      });

      setFloatingList(floatingIpArray);
      setVIp(props.store.detail.lb.virtual_ip);
    };

    getCreateData();
  }, []);

  const floatingOptions = () => {
    const opt = floatingList.map(obj => ({
      label: t(obj.floating_ip),
      value: t(obj.floating_ip),
    }));
    return opt;
  };

  const handleSelect = ip => {
    // 셀렉트 선택 시 셋팅 변경
    if (floatingList.length > 0) {
      floatingList.map(data => {
        if (data.floating_ip === ip) {
          setFloatingId(data.id);
          setFloatingIp(data.floating_ip);
          setNetworkName(data.network);
        }
      });
    }
  };

  // Validation 시작 ==================================================
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
          <Form.Item label={t('VIP')}>
            <Input type="text" value={vIp} disabled />
          </Form.Item>

          <Form.Item
            label={t('RESOURCES_FLOATING_IP')}
            rules={[{ required: true, validator: floatingValidator }]}
          >
            <Select
              name="floatingIp"
              options={floatingOptions()}
              onChange={e => handleSelect(e)}
              defaultValue={t('RESOURCES_SELECT')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FloatingIpModal;
