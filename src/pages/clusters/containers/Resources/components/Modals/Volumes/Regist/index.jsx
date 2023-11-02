import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Modal, TypeSelect } from 'components/Base'
import { Form, Input, Select, TextArea, Button, Slider } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import * as common from "utils/resources"

import classnames from 'classnames'
import styles from './index.scss'

const RegistModal = (props) => {

  const form = useRef();
  const [formData, setFormData] = useState({});

  const [modelView, setModalView] = useState(true);
  const [regStep, setRegStep] = useState(1);

  const [volumeCapacity, setVolumeCapacity] = useState(10);

  useEffect(() => {

    const getVmCreateData = async () => {

    };

    getVmCreateData();

  }, [])

  const storageClassOptions = [
    { label: 'openebs-hostpath', value: 'openebs-hostpath', },
    { label: 'longhorn', value: 'longhorn', },
    { label: 'hostpath-csi', value: 'hostpath-csi', },    
  ]

  const accessModeOptions = [
    { label: 'RWO (Read Write Once)', value: 'ReadWriteOnce', },
    { label: 'ROM (Read Only Many)', value: 'ReadOnlyMany', },
    { label: 'RWM (Read Write Many)', value: 'ReadWriteMany', },
  ]

  const importSourceOptions = [
    { label: 'Empty', value: 'Empty', },
    { label: 'ImageVolume', value: 'ImageVolume', },
    { label: 'DataVolume', value: 'DataVolume', },
  ]

  const volumeModeOptions = [
    { label: 'Filesystem', value: 'Filesystem', },
    { label: 'Block', value: 'Block', },
  ]

  const bindingModeOptions = [
    { label: '즉시바인딩', value: '즉시바인딩', },
  ]

  //slider
  const handleRootDisk = {
    onChangeSlider: (e) => {
        setVolumeCapacity(e);
    }
  }

  const handleOk = () => {
    const onOk  = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      const accesModeArray = [];
      accesModeArray.push(data.access_mode)
      data.access_modes = accesModeArray;
      data.capacity = volumeCapacity;

      console.log("data : "+ JSON.stringify(data))
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const stepMoveCheck = (step) => {
    const { data } = form.current.props;
    if(step ==1){
      if(data.name == undefined || data.name == ""){
        handleOk();
      }else{
        setRegStep(2);
      }
    }
  }

  const fnGetModalFooter = () => {

    let elements = "";
    elements =
          <>
              {regStep == 1 &&
                <>
                  <Button onClick={() => closeModal()} className={classnames(styles['btn'],styles['btn-default'])}>취소</Button>
                  <Button type="control" onClick={() => {stepMoveCheck(1)}} className={classnames(styles['btn'],styles['btn-control'])}>다음</Button>                    
                </>
              }
              {regStep == 2 &&
                <>
                  <Button onClick={() => closeModal()} className={classnames(styles['btn'],styles['btn-default'])}>취소</Button>
                  <Button onClick={() => {setRegStep(1)}} className={classnames(styles['btn'],styles['btn-default'])}>이전</Button>
                  <Button onClick={() => {handleOk()}} className={classnames(styles['btn'],styles['btn-control'])} >생성</Button>
                </>
              }
          </>

      return elements;
  }

  return (
    <>  
        <Modal
          icon="pen"
          width={960}
          title={props.title}
          onCancel={closeModal}
          bodyClassName={styles.body}
          visible={modelView}   
          hideFooter      
        >
          <Form data={formData} ref={form} >

            {/* Header */}
            <div className={styles.tab_process}>
              {/* styles.view_screen  : 이전 링크 관련 class*/}
              <div className={classnames(styles.process_item,`${regStep == 1 ? styles.current : ''}`)}>
                  <div className={styles.status}>
                    <div className={`${regStep == 1 ? styles.current : regStep > 1 ? styles.done : styles.todo}`}></div>
                  </div>
                  <span className={styles.basic}></span>
                  <div className={styles.title}>
                    <div className={styles.step_name}>기본 설정</div>
                    <div className={styles.situation}>{regStep == 1 ? "Current" : regStep > 1 ? "Done" : "To do"}</div>
                  </div>
                </div>
                <div className={classnames(styles.process_item,`${regStep == 2 ? styles.current : ''}`)}>
                  <div className={styles.status}>
                    <div className={`${regStep == 2 ? styles.current : styles.todo}`} ></div>
                  </div>
                  <span className={styles.check}></span>
                  <div className={styles.title}>
                    <div className={styles.step_name}>세부 설정</div>
                    <div className={styles.situation}>{regStep == 2 ? "Current" : "To do"}</div>
                  </div>
                </div>
            </div>

            {/* Content */}
            <div className={styles.pop_overflow_y}>
              <div className={styles.cont_boxwrap}>

                {/* 기본설정 설정 시작==========================================*/}
                <div className={`${regStep == 1 ? "" : "hide"}`}>
                  <Form.Item
                    label={t('이름')}
                    rules={[{ required: true, message: t('이름를 입력해 주세요.') }]}
                    desc={t('NAME_DESC')}
                  >
                  <Input name="name" autoFocus={true}  maxLength={63} style={{ maxWidth: 'none' }}/>   
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
                      defaultValue=""       
                    />
                  </Form.Item>

                </div>
                {/* 기본설정 설정 끝==========================================*/}

                {/* 세부설정 시작==========================================*/}
                <div className={`${regStep == 2 ? "" : "hide"}`}>

                  <Form.Item
                    label={t('스토리지 클래스')}
                  >
                    <Select
                      name="storage_class"
                      defaultValue={"openebs-hostpath"}
                      options={storageClassOptions}
                      clearable
                    />
                  </Form.Item>

                  <Form.Item
                    label={t('접근 모드')}
                  >
                    <Select
                      name="access_mode"
                      defaultValue={"ReadWriteOnce"}
                      options={accessModeOptions}
                      clearable
                    />
                  </Form.Item>

                  <Form.Item label={t('루트 디스크')} >
                        <div style={{
                            textAlign: "center",
                            padding: 20
                        }}>
                            <Input type="hidden" name="capacity" value={volumeCapacity} />
                            <Slider max={320} marks={{
                                0: "0",
                                10: "10",
                                20: "20",
                                40: "40",
                                80: "80",
                                160: "160",
                                320: "320",
                            }} style={{width: '10%'}} value={volumeCapacity} unit={"GiB"} onChange={e => handleRootDisk.onChangeSlider(e)} withInput />
                        </div>
                  </Form.Item>                    

                  <Form.Item
                    label={t('입력 소스')}
                  >
                    <Select
                      name="import_source"
                      defaultValue={"Empty"}
                      options={importSourceOptions}
                      clearable
                    />
                  </Form.Item>

                  <Form.Item>
                    <Columns>
                      <Column>
                        <Form.Item
                          label={t('볼륨 모드')}
                        >
                          <Select
                            name="volume_mode"
                            defaultValue={"Filesystem"}
                            options={volumeModeOptions}
                            clearable
                          />
                        </Form.Item>
                      </Column>
                      <Column>
                      {/* <Form.Item
                          label={t('볼륨 바인드 모드')}
                        >
                          <Select
                            name="volume_bind_mode"
                            defaultValue={"즉시 바인딩"}
                            options={bindingModeOptions}
                            clearable
                          />
                        </Form.Item> */}
                      </Column>
                    </Columns>
                  </Form.Item>  

              
                </div>
                {/* 세부설정 끝==========================================*/}

              </div> 
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

export default RegistModal

