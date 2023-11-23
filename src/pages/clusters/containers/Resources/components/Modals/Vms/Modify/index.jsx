import { toJS } from 'mobx'
import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'

import classnames from 'classnames'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'

const ModifyModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [securityGroupDataList, setSecurityGroupDataList] = useState([]);

  const vmStore = new VmStore();

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      if(securityGroupCheckItems.length > 0){
        const { data } = form.current.props;
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
      const listSecurityGroup = await vmStore.fetchVmListSecurityGroup();
      setSecurityGroupDataList(listSecurityGroup);
    };

    getVmCreateData();

  }, [])

  // 체크 리스트 시작 ==================================================
  const [securityGroupCheckItems, setSecurityGroupCheckItems] = useState(toJS(props.store.detail.vm.security_groups));

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
        width={900}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      >
        <Form data={formData} ref={form}>

          <Form.Item
            label={t('이름')}
          >
            <Input
              name="name"
              autoFocus={true}
              maxLength={63}
              defaultValue={props.store.detail.vm.name}
              disabled
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

          <div style={{ padding: 10 }} />
          {t('보안 그룹')}<span className="form-item-required">*</span>
          <Form.Item>
            <div className={styles.wrapper}>
              {stateVariables['security'].length > 0 &&
                <div className={classnames(styles.table_title, styles.table_title_bg)}>
                  <Button className={styles.table_title_button} onClick={() => handleAllCheck(false, "security")}>전체 선택 해제</Button>  {stateVariables['security'].length}개 선택
                </div>
              }
              <div className={styles.table}>
                <table>
                    <colgroup>
                        <col width="5%"/>
                        <col width="30%"/>
                        <col width="30%"/>
                        <col width="20%"/>
                        <col width="20%"/>
                      </colgroup>
                      <thead>
                        <tr>
                          <th>
                          <Checkbox name='select-all-security' 
                                onChange={(checked) => handleAllCheck(checked, "security")}
                                checked={dataListVariables['security'].length > 0 && stateVariables['security'].length === dataListVariables['security'].length ? true : false}/>
                          </th>
                          <th><strong>보안 그룹 이름</strong></th>
                          <th><strong>설명</strong></th>
                          <th><strong>인바운드 규칙수</strong></th>
                          <th><strong>아웃바운드 규칙수</strong></th>
                        </tr>
                      </thead>
                      <tbody>
                      {!securityGroupDataList?.length &&
                          <tr>
                            <td colSpan="5" className="no-data">
                              <p>할당 가능한 자원이 없습니다.</p>
                            </td>
                          </tr>
                        }
                        {securityGroupDataList?.map((data, key) => (
                          <tr key={data.name}>
                            <td>
                              <Checkbox name={`select-${data.name}`} checked={stateVariables['security'].includes(data.name) ? true : false}
                              onChange={(checked) => handleSingleCheck(checked, data.name, "security")} />
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
                    {securityGroupCheckItems?.map((name) => 
                    <span key={name}><Button icon="close" onClick={() => handleDelete(name, "security")}>{name}</Button></span>
                    )}                      
                  </div>
                </div>
                <div className={`form-item-error ${securityGroupCheckItems.length > 0 ? "hide" : ""}`}>보안그룹을 선택해 주세요.</div>
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
              defaultValue={props.store.detail.vm.description}
            />
          </Form.Item>

        </Form>
      </Modal>

    </>
  );
};

export default ModifyModal

