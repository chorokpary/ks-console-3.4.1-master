import { get } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'

import { Form, Input, Select, TextArea, Radio, Toggle, Loading, Button } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { Modal } from 'components/Base'
import styles from './index.scss'
import { Notify } from '@kube-design/components';

import MediatedDevicesStore from 'stores/resources/mediateddevices'

import classnames from 'classnames'

const regexName = /^([a-z0-9]+[.][a-z]+)\/([a-zA-Z0-9\-]+[a-zA-Z])$/;

const RegistModal = (props) => {

  const mediatedDevicesStore = new MediatedDevicesStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [isGpu, setIsGpu] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [nodeDataList, setNodeDataList] = useState([]);

  const [mediatedDeviceTypeListData, setMediatedDeviceTypeListData] = useState([]);
  const [mediatedDeviceTypeList, setMediatedDeviceTypeList] = useState([]);
  const [pgpuDataList, setPgpuDataList] = useState([]);
  const [vgpuDataList, setVgpuDataList] = useState([]);
  const [selectedVgpu, setSelectedVgpu] = useState('');
  const [selectedPgpu, setSelectedPgpu] = useState('');

  useEffect(() => {
    const getData = async () => {
      const listNode = await mediatedDevicesStore.fetchNodeList({ ...props });

      setNodeDataList(listNode.filter(obj => obj.node_role != 'master'))
    }
    getData();
  }, [])

  const nodeOptions = () => {
    const opt = nodeDataList.map((obj) => ({
      label: t(obj.name),
      value: t(obj.name),
    }))
    return opt
  }

  const handleNode = (value) => {
    getPgpuList(value)
    getMediatedDeviceType(value)
    setSelectedVgpu('')
  }

  const getMediatedDeviceType = async (value) => {
    const listType = await mediatedDevicesStore.fetchMediatedDeviceType({ node: value, ...props })

    setMediatedDeviceTypeListData([...listType.map(obj => obj.vgpu)])
    const opt = listType.map((obj) => ({
      label: t(obj.vgpu),
      value: t(obj.vgpu),
    }))
    setMediatedDeviceTypeList(opt)
  }

  const getPgpuList = async (value) => {
    const listPgpu = await mediatedDevicesStore.fetchPgpuList({ node: value, ...props })

    const opt = listPgpu.map((obj) => ({
      label: t(obj.model_name),
      value: t(obj.model_num),
    }))
    setPgpuDataList(opt)
  }

  const getVgpuList = async (value) => {
    setSelectedVgpu('')
    const listVgpu = await mediatedDevicesStore.fetchVgpuList({ model_num: value, ...props })
    const opt = listVgpu.map((obj) => ({
      label: `${obj.name} / ${obj.mdev_id} / (${obj.resolution}) / [${obj.max_num}]`,
      value: t(obj.name),
      disabled: mediatedDeviceTypeListData.includes(obj.name) ? true : false
    }))
    setVgpuDataList(opt)
  }

  const postMediatedDeviceType = async (typeData) => {
    const { data } = form.current.props;

    setIsLoading(true)
    try {
      await mediatedDevicesStore.createMediatedDeviceType(typeData, { ...props })
      Notify.success({ content: t('RESOURCES_SELECT_MDT_CREATE_SUCCESS') })
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }

    getMediatedDeviceType(data.node)
  }

  useEffect(() => {
    if (selectedPgpu) {
      getVgpuList(selectedPgpu)
    }
  }, [mediatedDeviceTypeListData])

  const createType = () => {
    const { data } = form.current.props;
    let typeData = {
      mediated_device_type: {
        node: data.node,
        vgpu: selectedVgpu
      }
    }

    postMediatedDeviceType(typeData)
  }

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      data.resource_name = data.name;
      data.is_gpu = isGpu;

      onOk({ mediated_device: data })
    })
  }

  // Validation 시작 ==================================================
  const nameValidator = (rule, value, callback) => {
    if (value == undefined) {
      return callback({ message: t('RESOURCES_NAME_EMPTY_DESC') })
    } else {
      if (!regexName.test(value)) {
        return callback({ message: t('RESOURCES_NAME_CHECK_DESC') })
      }
    }
    callback()
  }

  const closeModal = () => {
    setModalView(false);
  }

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      // disableSubmit={deviceDataList.length === 0 && true}
      >
        <Form data={formData} ref={form}>
          <Form.Item>
            <Columns>
              <Column>
                <Form.Item
                  label={t('RESOURCES_NAME')}
                  rules={[{ required: true, validator: nameValidator }]}
                  desc={t('RESOURCES_NAME_VALID_DESC') + ' ex) nvidia.com/GRID-T4-1B'}
                >
                  <Input
                    name="name"
                    autoFocus={true}
                    maxLength={63}
                    style={{ maxWidth: 'none' }}
                  />
                </Form.Item>
              </Column>
              <Column>
                <Form.Item
                  label={t('RESOURCES_NODE')}
                  rules={[{ required: true, message: t('RESOURCES_SELECT_NODE_TIP') }]}>
                  <Select
                    name="node"
                    placeholder={t('RESOURCES_SELECT')}
                    options={nodeOptions()}
                    clearable
                    onChange={(e) => handleNode(e)}
                  />
                </Form.Item>
              </Column>
            </Columns>
          </Form.Item>

          {/* <Form.Item>
                  <div className={styles.wrapper}>
                    <div className={styles.table}>
                      <table>
                        <colgroup>
                          <col width="5%" />
                          <col width="12%" />
                          <col width="18%" />
                          <col width="10%" />
                          <col width="10%" />
                          <col width="12%" />
                          <col width="13%" />
                          <col width="15%" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th></th>
                            <th><strong>{t('RESOURCES_DEVICE_ID')}</strong></th>
                            <th><strong>{t('RESOURCES_DEVICE_NAME')}</strong></th>
                            <th><strong>{t('RESOURCES_CLASS')}</strong></th>
                            <th><strong>{t('RESOURCES_MAX_COUNT')}</strong></th>
                            <th><strong>{t('RESOURCES_RESOLUTION')}</strong></th>
                            <th><strong>{t('RESOURCES_CUDA_SUPPORT_CHECK')}</strong></th>
                            <th><strong>{t('RESOURCES_PIXEL_COUNT')}</strong></th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading ? <tr><td colSpan="8" className="no-data" style={{ textAlign: 'center' }}><Loading /></td></tr>
                            :
                            deviceDataList?.length < 1 ?
                              <tr>
                                <td colSpan="8" className="no-data">
                                  <p>{t('RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION')}</p>
                                </td>
                              </tr>
                              :
                              deviceDataList?.map((data, key) => (
                                <tr key={data.name}>
                                  <td>
                                    <Radio name={`select-${data.name}`}
                                      checked={data.name === deviceCheckItem}
                                      onChange={(e) => setDeviceCheckItem(data.name)} />
                                  </td>
                                  <td>{data.mdev_id}</td>
                                  <td>{data.name}</td>
                                  <td>{data.clazz}</td>
                                  <td>{data.max_num}</td>
                                  <td>{data.resolution}</td>
                                  <td>{data.cuda ? t('RESOURCES_SUPPORT') : t('RESOURCES_NOT_SUPPORT')}</td>
                                  <td>{data.pixels}</td>
                                </tr>
                              ))}
                        </tbody>
                      </table>
                    </div>
                    <div className={`form-item-error ${!deviceCheckItem && isCheck ? "" : "hide"}`}>{t('RESOURCES_SELECT_DEVICE_TIP')}</div>
                  </div>
                </Form.Item> */}

          <Form.Item >
            <Columns>
              <Column>
                <Form.Item
                  label={t('Mediated Device Type')}
                  rules={[{ required: true, message: t('RESOURCES_SELECT_MDT_TIP') }]}
                >
                  <Select
                    name='mediated_device_name'
                    // style={{ maxWidth: '100%' }}
                    placeholder={t('RESOURCES_SELECT')}
                    options={mediatedDeviceTypeList}
                  />
                </Form.Item>
              </Column>
              <Column>
                {t('RESOURCES_GPU_CHECK')}<span className="form-item-required">*</span>
                <div style={{ padding: 4 }} />
                <Form.Item>
                  <Toggle defaultChecked showText onText="on" offText="off" value={isGpu} onChange={(e) => setIsGpu(!isGpu)} />
                </Form.Item>
              </Column>
            </Columns>

          </Form.Item>
          <Form.Item >
            <Form.Group
              label={t('RESOURCES_SELECT_MDT_CREATE')}
              desc={t('RESOURCES_SELECT_MDT_CREATE_DESC')}
              keepDataWhenUnCheck
              checkable>
              <Columns>
                <Column>
                  <Form.Item label={t('Physical GPU')}>
                    <Select
                      // style={{ maxWidth: '100%' }}
                      name='pgpu'
                      placeholder={t('RESOURCES_SELECT')}
                      options={pgpuDataList}
                      value={selectedPgpu}
                      onChange={(e) => {
                        getVgpuList(e);
                        setSelectedPgpu(e);
                      }}
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item label={t('Virtual GPU')}>
                    <Select
                      // style={{ maxWidth: '100%' }}
                      placeholder={t('RESOURCES_SELECT')}
                      options={vgpuDataList}
                      value={selectedVgpu}
                      onChange={(e) => setSelectedVgpu(e)}
                    />
                  </Form.Item>
                </Column>
              </Columns>
              <div className="text-right">
                <Button
                  onClick={() => createType()}
                  className={classnames(styles['btn'], styles['btn-control'])}
                  disabled={!!!selectedVgpu}
                  loading={isLoading}
                >
                  {t('생성')}
                </Button>
              </div>

            </Form.Group>
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
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>
        </Form>
      </Modal >

    </>
  );
};

export default RegistModal

