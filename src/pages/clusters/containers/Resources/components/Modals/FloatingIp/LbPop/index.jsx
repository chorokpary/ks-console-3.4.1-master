import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'
import { toJS } from 'mobx'

const LbPop = ({ title, onOk, store }) => {
  // LB list
  // FIP 상세의 network가
  // Router의 external 이면서
  // 해당 Router의 internal 이
  // LB의 network 인 것.
  // router list 중 external이 fip의 network인 것을 찾고,
  // 해당 router 의 internal이 LB list 중 network와 일치하는 것.

  const fipDetail = toJS(store.detail.floating_ip);

  const [modelView, setModalView] = useState(true);

  const [routerList, setRouterList] = useState([]);
  const [lbList, setLbList] = useState([]);

  const [list, setList] = useState([]);
  const [radioExternal, setRadioExternal] = useState("");
  const [lbData, setLbData] = useState();

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {

    const fnGetRouterList = async () => {
      const routerData = await store.routerList()
      setRouterList(routerData.routers);
    };
    fnGetRouterList();

    const fnGetLbList = async () => {
      const lbData = await store.lbList()
      setLbList(lbData.lbs)
    };

    fnGetLbList();
  }, [])

  useEffect(() => {
    if (lbList.length > 0 && routerList.length > 0) {
      const internalList = routerList.find((obj) => obj.external == fipDetail.network)?.internal;
      const list = lbList.filter((obj) => internalList.includes(obj.network))
      setList(list)
      if (list.length > 0) handleLbData(list[0])
    }
  }, [lbList, routerList])

  const handleOk = () => {
    onOk(
      {
        id: fipDetail.id,
        instance_type: 'lb',
        instance_name: lbData.name,
        target_network: lbData.network,
        target_ip: lbData.virtual_ip
      })
  }

  const handleLbData = (data) => {
    setLbData(data)
    setRadioExternal(data.name)
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
                    <col width="15%" />
                    <col width="20%" />
                    <col width="20%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th></th>
                      <th><strong>이름</strong></th>
                      <th><strong>네트워크</strong></th>
                      <th><strong>IP</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!list?.length &&
                      <tr>
                        <td colSpan="4" className="no-data" style={{ textAlign: 'center' }}>
                          <p>데이터가 없습니다</p>
                        </td>
                      </tr>
                    }
                    {list?.map((data) => (
                      <tr key={data.name}>
                        <td>
                          <Radio name="external" value={data.name}
                            checked={radioExternal === data.name}
                            onChange={(e) => { handleLbData(data); }} />
                        </td>
                        <td>{data.name}</td>
                        <td>{data.network}</td>
                        <td>{data.virtual_ip}</td>
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

