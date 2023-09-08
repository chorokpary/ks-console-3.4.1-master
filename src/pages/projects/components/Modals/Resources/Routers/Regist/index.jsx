import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

const RegistModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [networkDataList, setNetworkDataList] = useState([]);

  const internalNetworkList = networkDataList?.filter((row) => row.external == false);
  const externalNetworkList = networkDataList?.filter((row) => row.external == true);

  const [routerInternal, setRouterInternal] = useState([]);
  const [routerExternal, setRouterExternal] = useState([]);

  const [radioSnatType, setRadioSnatType] = useState("T");
  const [radioExternal, setRadioExternal] = useState("");

  const handleOk = () => {
    const onOk  = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      data.snatType = radioSnatType;
      data.internal = internalCheckItems;
      data.external = radioExternal;

      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const externalRadioDeselect = () => {
    setRadioExternal("");
  }

  useEffect(() => {

    const routerList = props.store.dataList;

    setRouterExternal([]);
    routerList?.map((router) => {
      setRouterExternal(prev => [...prev, router.external])       
    });

    setRouterInternal([]);
    routerList?.map((router) => {
      (router.internal).map((name) => {
        setRouterInternal(prev => [...prev, name])   
      })          
    });

    //Network List 추출
    const fnGetNetworkList = async () => {
      const networkData = await props.store.networkList()
      setNetworkDataList(networkData.networks)
    };

    fnGetNetworkList();
  }, [])

  // 체크 리스트 시작 ==================================================
  const [internalCheckItems, setInternalCheckItems] = useState([]);

  const dataListVariables = {
    internal: internalNetworkList?.filter((data) => (!routerInternal.includes(data.name))),
  };

  const stateVariables = {
    internal: internalCheckItems,
  };

  const setVariables = {
    internal: setInternalCheckItems,
  };

  const handleSingleCheck = (checked, name, type) => {
      if (checked) {
        setVariables[type](prev => [...prev, name]);
      } else {
        setVariables[type](stateVariables[type].filter((el) => el !== name));
      }
  };

  const handleAllCheck = (checked, type) => {
      if (checked) {
        const nameArray = [];
        dataListVariables[type].forEach((el) => nameArray.push(el.name));
        setVariables[type](nameArray);
      }else {
         setVariables[type]([]);
      }
  }

  const handleDelete = (name, type) => {
    setVariables[type](stateVariables[type].filter((el) => el !== name));
  };

  // 체크 리스트 끝 ==================================================
  

  return (
    <>  
        <Modal
          icon="pen"
          width={800}
          title={props.title}
          onOk={handleOk}
          onCancel={closeModal}
          visible={modelView}
        >
          <Form data={formData} ref={form}>
            
            <Form.Item
                label={t('이름')}
                rules={[{ required: true, message: t('이름을 입력해 주세요.') }]}
                desc={t('NAME_DESC')}
              >
              <Input
                name="routerName"
                autoFocus={true}
                maxLength={63}
                style={{ maxWidth: 'none' }}
              />   
            </Form.Item>
            <Form.Item label={t('SNAT 옵션')} desc={t('트래픽의 출발지 IP주소를 변경하는 NAT')}>
              <div>
                <Radio name="snatType" value="T" checked={radioSnatType === "T"} onChange={(e) => {setRadioSnatType("T");}}>사용</Radio>
                <Radio name="snatType" value="F" checked={radioSnatType === "F"} onChange={(e) => {setRadioSnatType("F");}}>미사용</Radio>
              </div>              
            </Form.Item>
            <Form.Item label={t('내부 네트워크')} >
            <div className={styles.wrapper}>
              <div>
                총 {stateVariables['internal'].length}건
              </div>
              <div className={styles.table}>
                <table>
                    <colgroup>
                        <col width="5%"/>
                        <col width="20%"/>
                        <col width="15%"/>
                        <col width="20%"/>
                        <col width="20%"/>
                        <col width="20%"/>
                      </colgroup>
                      <thead>
                        <tr>
                          <th>
                          <Checkbox name='select-all-internal' 
                                onChange={(checked) => handleAllCheck(checked, "internal")}
                                checked={dataListVariables['internal'].length > 0 && stateVariables['internal'].length === dataListVariables['internal'].length ? true : false}/>
                          </th>
                          <th><strong>네트워크 이름</strong></th>
                          <th><strong>네트워크 유형</strong></th>
                          <th><strong>기본 경로</strong></th>
                          <th><strong>CIDR</strong></th>
                          <th><strong>게이트웨이</strong></th>
                        </tr>
                      </thead>
                      <tbody>
                        {!internalNetworkList?.filter((data) => (!routerInternal.includes(data.name))).length &&
                          <tr>
                            <td colSpan="6" className="no-data">
                              <p>모든 자원이 할당 되었습니다.</p>
                            </td>
                          </tr>
                        }
                        {internalNetworkList?.filter((data) => (!routerInternal.includes(data.name))).map((data, key) => {
                            return <tr key={data.name}>
                            <td>
                              <Checkbox name={`select-${data.name}`} checked={stateVariables['internal'].includes(data.name) ? true : false}
                              onChange={(checked) => handleSingleCheck(checked, data.name, "internal")} />
                            </td>
                            <td>{data.name}</td>
                            <td>{(data.type).toUpperCase()}</td>
                            <td>{data.default_route ? "사용" : "미사용"}</td>
                            <td>{data.cidr}</td>
                            <td>{data.gateway_ip}</td>
                          </tr>
                        })}
                      </tbody>
                  </table> 
                  <div>
                    {internalCheckItems?.map((name) => 
                    <span key={name}><Button onClick={() => handleDelete(name, "internal")}>{name}</Button></span>
                    )}                      
                  </div>
                </div>
            </div>
            </Form.Item>
            
            <Form.Item label={t('외부 네트워크')} >   
            <div className={styles.wrapper}>
              <div className={styles.divInRight}><Button onClick={() => externalRadioDeselect()}>선택해제</Button></div>
              <div className={styles.table}>
                <table>
                    <colgroup>
                        <col width="5%"/>
                        <col width="20%"/>
                        <col width="15%"/>
                        <col width="20%"/>
                        <col width="20%"/>
                        <col width="20%"/>
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
                        {!externalNetworkList?.filter((data) => (!routerExternal.includes(data.name))).length &&
                          <tr>
                            <td colSpan="6" className="no-data">
                              <p>모든 자원이 할당 되었습니다.</p>
                            </td>
                          </tr>
                        }
                        {externalNetworkList?.filter((data) => (!routerExternal.includes(data.name))).map((data) => {
                          return <tr key={data.name}>
                            <td>
                              <Radio name="external" value={data.name} checked={radioExternal === data.name} 
                              onChange={(e) => {setRadioExternal(data.name);}}/>
                            </td>
                            <td>{data.name}</td>
                            <td>{(data.type).toUpperCase()}</td>
                            <td>{data.default_route ? "사용" : "미사용"}</td>
                            <td>{data.cidr}</td>
                            <td>{data.gateway_ip}</td>
                          </tr>
                        })}
                      </tbody>
                  </table> 
                </div>
            </div>               
            </Form.Item>
           
            <Form.Item
              className={styles.textarea}
              label={t('설명')}
              desc={t('DESCRIPTION_DESC')}
            >
              <TextArea
                name="description"
                maxLength={256}
                rows="1"    
                defaultValue={''} 
              />
            </Form.Item>

          </Form>
        </Modal>

    </>
  );
};

export default RegistModal

