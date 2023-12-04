import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Radio, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'

import classnames from 'classnames'
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

  const [radioSnatType, setRadioSnatType] = useState("F");
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
                label={t('RESOURCES_NAME')}
                rules={[{ required: true, message: t('RESOURCES_NAME_EMPTY_DESC') }]}
                desc={t('NAME_DESC')}
              >
              <Input
                name="routerName"
                autoFocus={true}
                maxLength={63}
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
                                checked={dataListVariables['internal'].length > 0 && stateVariables['internal'].length === dataListVariables['internal'].length ? true : false}/>
                          </th>
                          <th><strong>{t('RESOURCES_NETWORK_NAME')}</strong></th>
                          <th><strong>{t('RESOURCES_TYPE_YOO')}</strong></th>
                          <th><strong>{t('RESOURCES_DEFAULT_PATH')}</strong></th>
                          <th><strong>CIDR</strong></th>
                          <th><strong>{t('RESOURCES_GATEWAY')}</strong></th>
                        </tr>
                      </thead>
                      <tbody>
                        {!internalNetworkList?.filter((data) => (!routerInternal.includes(data.name))).length &&
                          <tr>
                            <td colSpan="6" className="no-data">
                              <p>{t('RESOURCES_ALLOCATED_ALL_RESOURCES')}</p>
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
                            <td>{data.default_route ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</td>
                            <td>{data.cidr}</td>
                            <td>{data.gateway_ip}</td>
                          </tr>
                        })}
                      </tbody>
                  </table> 
                  <div className={styles.removeCheckWrapper}>
                    {internalCheckItems?.map((name) => 
                    <span key={name}><Button icon="close" onClick={() => handleDelete(name, "internal")}>{name}</Button> </span>
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
                        {!externalNetworkList?.filter((data) => (!routerExternal.includes(data.name))).length &&
                          <tr>
                            <td colSpan="6" className="no-data">
                              <p>{t('RESOURCES_ALLOCATED_ALL_RESOURCES')}</p>
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
                <Radio name="snatType" value="F" checked={radioSnatType === "F"} onChange={(e) => {setRadioSnatType("F");}}>{t('RESOURCES_NOT_USE')}</Radio>
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
                defaultValue={''} 
              />
            </Form.Item>

          </Form>
        </Modal>

    </>
  );
};

export default RegistModal

