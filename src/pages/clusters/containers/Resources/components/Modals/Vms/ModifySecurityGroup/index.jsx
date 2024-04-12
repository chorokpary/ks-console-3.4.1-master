import { toJS } from 'mobx'
import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'

const ModifySecurityGroupModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [securityGroupDataList, setSecurityGroupDataList] = useState([]);

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      if (securityGroupCheckItems.length > 0) {
        const { data } = form.current.props;
        data.id = props.store.detail.vm.id;
        data.scurityGroups = securityGroupCheckItems;

        onOk({ ...data })
      }
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {

    const getVmCreateData = async () => {
      const securityData = props.store.securigyGroupList;
      setSecurityGroupDataList(securityData);

      const securityIdArray = props.store.detail.vm.security_groups.map(item => item.id)
      setSecurityGroupCheckItems(securityIdArray)
    };

    getVmCreateData();

  }, [])

  // 체크 리스트 시작 ==================================================
  const [securityGroupCheckItems, setSecurityGroupCheckItems] = useState([]);

  const dataListVariables = {
    security: securityGroupDataList,
  };

  const stateVariables = {
    security: securityGroupCheckItems,
  };

  const setVariables = {
    security: setSecurityGroupCheckItems,
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
      dataListVariables[type].forEach((el) => nameArray.push(el.id));
      setVariables[type](nameArray);
    } else {
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
        width={900}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      >
        <Form data={formData} ref={form}>

          <div style={{ padding: 10 }} />
          {t('RESOURCES_SECURITY_GROUP')}<span className="form-item-required">*</span>
          <Form.Item>
            <div className={styles.wrapper}>
              {securityGroupDataList.find(obj => securityGroupCheckItems.includes(obj.id)) && stateVariables['security'].length > 0 &&
                <div className={classnames(styles.table_title, styles.table_title_bg)}>
                  <Button className={styles.table_title_button} onClick={() => handleAllCheck(false, "security")}>{t('RESOURCES_ALL_DESELECT')}</Button>  {stateVariables['security'].length}{t('RESOURCES_COUNT')} {t('RESOURCES_SELECT')}
                </div>
              }
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="5%" />
                    <col width="30%" />
                    <col width="30%" />
                    <col width="20%" />
                    <col width="20%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>
                        <Checkbox name='select-all-security'
                          onChange={(checked) => handleAllCheck(checked, "security")}
                          checked={dataListVariables['security'].length > 0 && stateVariables['security'].length === dataListVariables['security'].length ? true : false} />
                      </th>
                      <th><strong>{t('RESOURCES_SECURITY_GROUP_NAME')}</strong></th>
                      <th><strong>{t('RESOURCES_DESCRIPTION')}</strong></th>
                      <th><strong>{t('RESOURCES_INBOUND_RULE_COUNT')}</strong></th>
                      <th><strong>{t('RESOURCES_OUTBOUND_RULE_COUNT')}</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!securityGroupDataList?.length &&
                      <tr>
                        <td colSpan="5" className="no-data">
                          <p>{t('RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION')}</p>
                        </td>
                      </tr>
                    }
                    {securityGroupDataList?.map((data, key) => (
                      <tr key={data.id}>
                        <td>
                          <Checkbox name={`select-${data.id}`} checked={stateVariables['security'].includes(data.id) ? true : false}
                            onChange={(checked) => handleSingleCheck(checked, data.id, "security")} />
                        </td>
                        <td>{data.name}</td>
                        <td>{data.description}</td>
                        <td>{data.ingress_count}</td>
                        <td>{data.egress_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.removeCheckWrapper}>
                  {securityGroupDataList.find(obj => securityGroupCheckItems.includes(obj.id)) &&
                    securityGroupCheckItems?.map((id) => {
                      const name = securityGroupDataList?.filter((data) => data.id == id).map(item => item.name)[0]
                      return <span key={id}><Button icon="close" onClick={() => handleDelete(id, "security")}>{name}</Button></span>
                    }
                    )}
                </div>
              </div>
              <div className={`form-item-error ${securityGroupCheckItems.length > 0 && securityGroupDataList.find(obj => securityGroupCheckItems.includes(obj.id)) ? "hide" : ""}`}>{t('RESOURCES_SELECT_SECURITY_GROUP_TIP')}</div>
            </div>
          </Form.Item>

        </Form>
      </Modal>

    </>
  );
};

export default ModifySecurityGroupModal

