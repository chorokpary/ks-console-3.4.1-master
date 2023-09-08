import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

const LbPop = ({ title, onOk, store }) => {

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
        routerList.includes(obj.name)
      ));
      setNetworkList(list);
      setRadioExternal(list[0].name)
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
      arr.push(obj.external)
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
        okText={'연결'}
        cancelText={'취소'}
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
                      <th><strong>네트워크 이름</strong></th>
                      <th><strong>네트워크 유형</strong></th>
                      <th><strong>기본 경로</strong></th>
                      <th><strong>CIDR</strong></th>
                      <th><strong>게이트웨이</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!networkList?.length &&
                      <tr>
                        <td colSpan="6" className="no-data">
                          <p>모든 자원이 할당 되었습니다.</p>
                        </td>
                      </tr>
                    }
                    {networkList?.map((data) => (
                      <tr key={data.name}>
                        <td>
                          <Radio name="external" value={data.name}
                            checked={radioExternal === data.name}
                            onChange={(e) => { setRadioExternal(data.name); }} />
                        </td>
                        <td>{data.name}</td>
                        <td>{(data.type).toUpperCase()}</td>
                        <td>{data.default_route ? "사용" : "미사용"}</td>
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

export default LbPop

