import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'

const ModifyModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [networkDataList, setNetworkDataList] = useState([]);

  const internalNetworkList = networkDataList?.filter((row) => row.external == false);
  const externalNetworkList = networkDataList?.filter((row) => row.external == true);

  const [routerInternal, setRouterInternal] = useState([]);
  const [routerExternal, setRouterExternal] = useState([]);

  const [radioSnatType, setRadioSnatType] = useState(props.store.detail.router.enable_snat ? "T" : "F");
  const [radioExternal, setRadioExternal] = useState("");

  const detailInternal = props.store.detail.router.internal;
  const detailExternal= props.store.detail.router.external;

  const handleOk = () => {
    const onOk  = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      data.id = props.store.detail.router.id;
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
    setRadioSnatType("F")
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

    // 초기 선택 
    detailInternal.map((name) => {
      handleSingleCheck(true, name, "internal")
    })
    
    detailExternal && setRadioExternal(detailExternal);

  }, [])

  // 체크 리스트 시작 ==================================================
  const [internalCheckItems, setInternalCheckItems] = useState([]);

  const dataListVariables = {
    internal: internalNetworkList?.filter((data) => (!routerInternal.includes(data.id))),
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
        detailInternal.map((name) => {
          nameArray.push(name)
        })

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
                label={t('RESOURCES_NAME')}
              >
              <Input
                name="routerName"
                autoFocus={true}
                maxLength={63}
                defaultValue={props.store.detail.router.name}
                disabled
                style={{ maxWidth: 'none' }}
              />   
            </Form.Item>

            <Form.Item label={t('RESOURCES_INTERNAL_NETWORK')} >
            <div className={styles.wrapper}>
              {stateVariables['internal'].length > 0 &&
                <div className={classnames(styles.table_title, styles.table_title_bg)}>
                  <Button className={styles.table_title_button} onClick={() => handleAllCheck(false, "internal")}>{t('RESOURCES_ALL_DESELECT')}</Button>  {stateVariables['internal'].length}{t('RESOURCES_COUNT')} {t('RESOURCES_SELECT')}
                </div>
              }
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
                                checked={(dataListVariables['internal'].length + detailInternal.length) > 0 && stateVariables['internal'].length === (dataListVariables['internal'].length + detailInternal.length) ? true : false}/>
                          </th>
                          <th><strong>{t('RESOURCES_NETWORK_NAME')}</strong></th>
                          <th><strong>{t('RESOURCES_TYPE_YOO')}</strong></th>
                          <th><strong>{t('RESOURCES_DEFAULT_PATH')}</strong></th>
                          <th><strong>CIDR</strong></th>
                          <th><strong>{t('RESOURCES_GATEWAY')}</strong></th>
                        </tr>
                      </thead>
                      <tbody>
                      {!internalNetworkList?.filter((data) => (!routerInternal.includes(data.id))).length &&
                        <tr>
                          <td colSpan="6" className="no-data">
                            <p>{t('RESOURCES_ALLOCATED_ALL_RESOURCES')}</p>
                          </td>
                        </tr>
                      }
                      {internalNetworkList?.filter((data) => (!routerInternal.includes(data.id))).map((data, key) => {
                          return <tr key={data.id}>
                          <td>
                            <Checkbox name={`select-${data.id}`} checked={stateVariables['internal'].includes(data.id) ? true : false}
                            onChange={(checked) => handleSingleCheck(checked, data.id, "internal")} />
                          </td>
                          <td>{data.name}</td>
                          <td>{(data.type).toUpperCase()}</td>
                          <td>{data.default_route ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</td>
                          <td>{data.cidr}</td>
                          <td>{data.gateway_ip}</td>
                        </tr>
                      })}
                      {internalNetworkList?.filter((data) => (detailInternal.includes(data.id))).map((data, key) => {
                          return <tr key={data.id}>
                          <td>
                            <Checkbox name={`select-${data.id}`} checked={stateVariables['internal'].includes(data.id) ? true : false}
                            onChange={(checked) => handleSingleCheck(checked, data.id, "internal")} />
                          </td>
                          <td>{data.name}</td>
                          <td>{(data.type).toUpperCase()}</td>
                          <td>{data.default_route ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</td>
                          <td>{data.cidr}</td>
                          <td>{data.gateway_ip}</td>
                        </tr>
                      })}
                      </tbody>
                  </table> 
                  <div className={styles.removeCheckWrapper}>
                   {internalCheckItems?.map((id) => {
                        const name = internalNetworkList?.filter((data) => data.id == id).map(item => item.name)[0]
                       return <span key={id}><Button icon="close" onClick={() => handleDelete(id, "internal")}>{name}</Button> </span> 
                      }                    
                    )}                      
                  </div>
                </div>
            </div>             
            </Form.Item>
            
            <Form.Item label={t('RESOURCES_EXTERNAL_NETWORK')} >                
              <div className={styles.wrapper}>
                {!!radioExternal &&
                  <div className={classnames(styles.table_title, styles.table_title_bg, styles.divInRight)}>
                    <Button className={styles.table_title_button} onClick={() => externalRadioDeselect()}>{t('RESOURCES_DESELECT')}</Button>
                  </div>
                }
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
                            <th><strong>{t('RESOURCES_NETWORK_NAME')}</strong></th>
                            <th><strong>{t('RESOURCES_TYPE_YOO')}</strong></th>
                            <th><strong>{t('RESOURCES_DEFAULT_PATH')}</strong></th>
                            <th><strong>CIDR</strong></th>
                            <th><strong>{t('RESOURCES_GATEWAY')}</strong></th>
                          </tr>
                        </thead>
                        <tbody>
                          {!externalNetworkList?.filter((data) => (!routerExternal.includes(data.id))).length &&
                            <tr>
                              <td colSpan="6" className="no-data">
                                <p>{t('RESOURCES_ALLOCATED_ALL_RESOURCES')}</p>
                              </td>
                            </tr>
                          }
                          {externalNetworkList?.filter((data) => (!routerExternal.includes(data.id))).map((data) => {
                            return <tr key={data.id}>
                              <td>
                                <Radio name="external" value={data.id} checked={radioExternal === data.id} 
                                onChange={(e) => {setRadioExternal(data.id);}}/>
                              </td>
                              <td>{data.name}</td>
                              <td>{(data.type).toUpperCase()}</td>
                              <td>{data.default_route ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</td>
                              <td>{data.cidr}</td>
                              <td>{data.gateway_ip}</td>
                            </tr>
                          })}
                          {externalNetworkList?.filter((data) => data.id == detailExternal).map((data) => {
                            return <tr key={data.name}>
                              <td>
                                <Radio name="external" value={data.id} checked={radioExternal === data.id} 
                                onChange={(e) => {setRadioExternal(data.id);}}/>
                              </td>
                              <td>{data.name}</td>
                              <td>{(data.type).toUpperCase()}</td>
                              <td>{data.default_route ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</td>
                              <td>{data.cidr}</td>
                              <td>{data.gateway_ip}</td>
                            </tr>
                          })}
                        </tbody>
                    </table> 
                  </div>
              </div>           
            </Form.Item>

            <Form.Item label={t('RESOURCES_SNAT_OPTION')} desc={t('RESOURCES_SOURCE_IP_ADDRESS_NAT_TRAFFIC_DESC')}>
              <div className={styles.wrapper}>  
                <Radio name="snatType" value="T" checked={radioSnatType === "T"} onChange={(e) => {setRadioSnatType("T");}} disabled={!!radioExternal ? false : true}>{t('RESOURCES_USE')}</Radio>
                <Radio name="snatType" value="F" checked={radioSnatType === "F"} onChange={(e) => {setRadioSnatType("F");}} >{t('RESOURCES_NOT_USE')}</Radio>
              </div>              
            </Form.Item>
           
            <Form.Item
              className={styles.textarea}
              label={t('RESOURCES_DESCRIPTION')}
              desc={t('DESCRIPTION_DESC')}
            >
              <TextArea
                name="description"
                maxLength={256}
                rows="1"    
                defaultValue={props.store.detail.router.description}     
              />
            </Form.Item>

          </Form>
        </Modal>

    </>
  );
};

export default ModifyModal

