import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { observer, inject } from 'mobx-react'

import { Form, Input, Select, Checkbox, TextArea, Button, Loading, Column, Columns, Icon } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'
import { ProjectSelect } from 'components/Inputs'
import classnames from 'classnames'

import { PATTERN_USER_NAME } from 'utils/constants'

const ClusterModal = props => {
  
  const store = props.store;
  const rootStore = props.rootStore;

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [isCreateSend, setIsCreateSend] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isCreateSuccessd, setIsCreateSuccessd] = useState(false);

  const [clusterName, setClusterName] = useState('');
  const [projectName, setProjectName] = useState(props.namespace ? props.namespace : 'default');

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      setIsDisabled(true)
      setIsCreateSend(true)
      const { data } = form.current.props;
      data.project = projectName
    
      setClusterName(data.name)
      onOk({ 
        ...data,
        createSuccess
       } )
    })
  }

  const [getListDataFn, setGetListDataFn] = useState(null);

  const createSuccess = (getListData) => {
    setGetListDataFn(() => getListData);
    setIsCreateSuccessd(true);
  }

  const closeModal = () => {
    setModalView(false);
  }

  const fnGetModalFooter = () => {

    let elements = "";
    elements =
      <>
        
        {/* <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button> */}
        
         {!isCreateSuccessd &&
          <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button>
        }
        {!isCreateSend &&
          <Button onClick={() => { handleOk() }} 
            className={classnames(styles['btn'], styles['btn-control'])} 
            loading={props.store.isSubmitting}
            disabled={props.store.isSubmitting}
          >{t('RESOURCES_CREATE')}
          </Button>
        }
        {isCreateSuccessd &&
          // <Button onClick={() => { handleVmCreate() }} 
          //   className={classnames(styles['btn'], styles['btn-control'])} 
          //   loading={props.store.isSubmitting}
          //   disabled={props.store.isSubmitting}
          // >{t('RESOURCES_CREATE_VM')}
          // </Button>
          <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CLOSE')}</Button>
        }
      </>

    return elements;
  }

  const handleVmCreate = () => {
    console.log("handleVmCreate~~!!")  // 실제 API 가 연동되면 재개발 해야 함...
    rootStore.triggerAction('gpuclusters.regist', {
      store: store,
      cluster: props.cluster,
      namespace: props.cluster,
      id: clusterName, 
      name: clusterName,
      type: clusterName,
      success: getListDataFn
    })
    closeModal();
  }

  return (
    <>
      <Modal
        icon="pen"
        width={700}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        bodyClassName={styles.body}
        hideFooter
      >
        <Form data={formData} ref={form}>
          <div className={styles.cont_boxwrap}>  
            <Form.Item
              label={t('RESOURCES_GPU_CLUSTER')}
              rules={[
                { required: true, message: t('NAME_EMPTY_DESC') },
                {
                  pattern: PATTERN_USER_NAME,
                  message: t('RESOURCES_INVALID_NAME_DESC'),
                },
              ]}
              desc={t('NAME_DESC')}
            >
              <Input
                name="name"
                autoFocus={true}
                maxLength={63}
                style={{ maxWidth: 'none' }}
                disabled={isDisabled}
              />
            </Form.Item>
            <Form.Item
              label={t('PROJECT')}
              desc={t('SELECT_PROJECT_DESC')}
              rules={[
                { required: true, message: t('PROJECT_NOT_SELECT_DESC') },
              ]}
              >
                <ProjectSelect
                  name="namespace"
                  defaultValue={projectName}
                  cluster={props.cluster}
                  onChange={(e) => setProjectName(e)}
                  style={{ maxWidth: 'none' }}
                  disabled={isDisabled}
                />
            </Form.Item>
          </div>

          <div className={styles.loading_boxwrap}>  
            {props.store.isSubmitting &&
              <>
                <Loading />
                <p>GPU 클러스터를 생성중입니다.</p>
              </>
            }
            {(!props.store.isSubmitting && isCreateSuccessd) &&
              <>
                <Icon name="check" type="dark" size={40} />
                {/* <div className={styles.iconwrapper}>
                  <i className={styles[`ico-status-running`]}/>
                </div> */}
                <p>GPU 클러스터가 생성되었습니다.</p>
                {/* <p>가상머신을 생성하시겠습니까?</p> */}
              </>
            }
          </div>

          {/* Footer */}
          <div className={styles['modal-footer']}>
            {fnGetModalFooter()}
          </div>

        </Form>
      </Modal>

    </>
  );
};

export default inject('store', 'rootStore')(observer(ClusterModal))

