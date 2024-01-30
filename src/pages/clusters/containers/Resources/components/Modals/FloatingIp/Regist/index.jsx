import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

const RegistModal = ({ title, onOk, store }) => {

  const [modelView, setModalView] = useState(true);

  const [networkList, setNetworkList] = useState([]);
  const [routerList, setRouterList] = useState([]);

  const [networkDataList, setNetworkDataList] = useState([]);
  const [radioExternal, setRadioExternal] = useState("");

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {

    const fnGetRouterList = async () => {
      const routerData = await store.routerList()
      setRouterList(getSliceData(routerData.routers));
    };
    fnGetRouterList();

    //Network List 추출
    const fnGetNetworkList = async () => {
      const networkData = await store.networkList()
      setNetworkDataList(networkData.networks)
    };

    fnGetNetworkList();
  }, [])

  useEffect(() => {
    if (networkDataList.length > 0 && routerList.length > 0) {
      const list = networkDataList.filter((obj) => (
        routerList.includes(obj.id)
      )) || [];
      setNetworkList(list);
      setRadioExternal(list[0]?.id)
    }
  }, [networkDataList, routerList])

  const handleOk = () => {
    onOk({ floating_ip: { network: radioExternal } })
  }

  const getSliceData = (data) => {
    const arr = [];
    data.filter((obj) => (
      obj.external
    )).map((obj) => (
      arr.push(obj.external.id)
    ));
    return arr;
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
        okText={t('RESOURCES_CREATE')}
        cancelText={t('RESOURCES_CANCEL')}
        disableSubmit={networkList.length === 0 && true}
      >
        <Form>

          <Form.Item >
            <div className={styles.wrapper}>
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
                      <th></th>
                      <th><strong>{t('RESOURCES_NETWORK_NAME')}</strong></th>
                      <th><strong>{t('RESOURCES_NETWORK_TYPE_YOO')}</strong></th>
                      <th><strong>{t('RESOURCES_DEFAULT_PATH')}</strong></th>
                      <th><strong>CIDR</strong></th>
                      <th><strong>{t('RESOURCES_GATEWAY')}</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!networkList?.length &&
                      <tr>
                        <td colSpan="6" className="no-data">
                          <p>{t('RESOURCES_ALLOCATED_ALL_RESOURCES')}</p>
                        </td>
                      </tr>
                    }
                    {networkList?.map((data) => (
                      <tr key={data.name}>
                        <td>
                          <Radio name="external" value={data.name}
                            checked={radioExternal === data.id}
                            onChange={(e) => { setRadioExternal(data.id); }} />
                        </td>
                        <td>{data.name}</td>
                        <td>{(data.type).toUpperCase()}</td>
                        <td>{data.default_route ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</td>
                        <td>{data.cidr}</td>
                        <td>{data.gateway_ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Form.Item>

        </Form>
      </Modal>

    </>
  );
};

export default RegistModal

