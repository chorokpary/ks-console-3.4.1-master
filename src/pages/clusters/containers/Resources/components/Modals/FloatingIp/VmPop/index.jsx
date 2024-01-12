import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'
import { toJS } from 'mobx'

const VmPop = ({ title, onOk, store, match }) => {
  // VM list
  // FIP 상세의 network가
  // Router의 external 이면서
  // 해당 Router의 internal 이
  // VM의 networks의 포함되어 있는 것.
  // router list 중 external이 fip의 network인 것을 찾고,
  // 해당 router 의 internal이 VM list의 networks와 포함되는 것
  const form = useRef();
  const [formData, setFormData] = useState({});
  const fipDetail = toJS(store.detail.floating_ip);
  const [list, setList] = useState([]);
  const [internalList, setInternalList] = useState([]);

  const [modelView, setModalView] = useState(true);

  const [vmDataList, setVmDataList] = useState([]);
  const [vmList, setVmList] = useState([]);
  const [routerList, setRouterList] = useState([]);
  const [fipList, setFipList] = useState([]);

  const [radioExternal, setRadioExternal] = useState("");
  const [radioExternalIdx, setRadioExternalIdx] = useState(0);

  const [vmData, setVmData] = useState();

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {

    const fnGetRouterList = async () => {
      const routerData = await store.routerList(match?.params)
      setRouterList(routerData.routers);
    };
    fnGetRouterList();

    const fnGetVmList = async () => {
      const vmData = await store.vmList(match?.params)
      setVmDataList(vmData)
    };
    fnGetVmList();

    const fnGetFipList = async () => {
      const fipData = await store.fipList()
      setFipList(fipData.floating_ips)
    };
    fnGetFipList();
  }, [])

  useEffect(() => {
    if (fipList.length > 0 && vmDataList.length > 0) {
      const arr = new Set();

      fipList.map(obj => {
        if (obj.target_ip != null && obj.instance_type == 'vm') {
          arr.add(obj.instance_id)
        }
      })
      const vmArr = new Set();
      vmDataList.map(obj => {
        if (!arr.has(obj.id)) {
          vmArr.add(obj)
        }
      })
      const list = Array.from(vmArr)
      setVmList(list)
    }
  }, [vmDataList, fipList])

  useEffect(() => {
    if (vmList.length > 0 && routerList.length > 0) {
      const internalList = routerList.find((obj) => obj.external?.id == fipDetail.network)?.internal || [];
      setInternalList(internalList)

      const arr = new Set();
      vmList.map((obj) => {
        var net = obj.networks;
        net.map((obj2) => {
          internalList.forEach(el => {
            if (el.id == obj2.name) {
              arr.add(obj);
            }
          })
        });
      })
      const list = Array.from(arr)
      setList(list);
      if (list.length > 0) handleVmData(list[0], 0)
    }
  }, [vmList, routerList])

  const handleOk = () => {
    const { data } = form.current.props
    const network = data.network[radioExternalIdx].split(" ")

    onOk({
      id: fipDetail.id,
      instance_type: 'vm',
      instance_id: radioExternal,
      target_network: network[0],
      target_ip: network[1]
    })
  }

  const handleVmData = (data, idx) => {
    setVmData(data)
    setRadioExternal(data.id)
    setRadioExternalIdx(idx)
  }

  const selectOption = (data) => {
    const options = [];
    let idx = 0;
    let defaultValue = '';
    data?.map((networks) => (
      internalList.map((el) => {
        if (el.id == networks.name) {
          if (idx == 0) defaultValue = `${networks.name} ${networks.ip}`
          options.push({
            label: `${networks.alias} ${networks.ip}`,
            value: `${networks.name} ${networks.ip}`
          })
          idx++;
        }
      })
    ));
    return {
      options,
      defaultValue
    }
  }

  return (
    <>
      <Modal
        icon="pen"
        width={800}
        title={title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        okText={t('RESOURCES_CONNECTION')}
        cancelText={t('RESOURCES_CANCEL')}
      >
        <Form data={formData} ref={form}>

          {/* <Form.Item > */}
          <div className={styles.wrapper}>
            <div className={styles.table}>
              <table>
                <colgroup>
                  <col width="5%" />
                  <col width="20%" />
                  <col width="20%" />
                </colgroup>
                <thead>
                  <tr>
                    <th></th>
                    <th><strong>{t('RESOURCES_NAME')}</strong></th>
                    <th><strong>{t('RESOURCES_NETWORK')}</strong></th>
                  </tr>
                </thead>
                <tbody>
                  {!list?.length &&
                    <tr>
                      <td colSpan="3" className="no-data" style={{ textAlign: 'center' }}>
                        <p>{t('RESOURCES_ALLOCATED_ALL_RESOURCES')}</p>
                      </td>
                    </tr>
                  }
                  {list?.map((data, idx) => (
                    <tr key={data.name}>
                      <td>
                        <Form.Item >
                          <Radio name="external" value={data.name}
                            checked={radioExternal === data.id}
                            onChange={(e) => { handleVmData(data, idx); }} />
                        </Form.Item>
                      </td>
                      <td>{data.name}</td>
                      <td>
                        <Form.Item >
                          <Select name={`network.${idx}`} style={{ width: '100%' }}
                            {...selectOption(data.networks)}
                          />
                        </Form.Item>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* </Form.Item> */}

        </Form>
      </Modal>

    </>
  );
};

export default VmPop

