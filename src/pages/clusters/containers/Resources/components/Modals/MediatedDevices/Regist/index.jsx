import { get } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';

import {
  Form,
  Input,
  Select,
  TextArea,
  Toggle,
  Notify,
} from '@kube-design/components';
import { Column, Columns } from '@kube-design/components/lib/components/Layout';
import { Modal } from 'components/Base';

import MediatedDevicesStore from 'stores/resources/mediateddevices';

import styles from './index.scss';

const regexName = /^([a-z0-9]+[.][a-z]+)\/([a-zA-Z0-9\-]+[a-zA-Z])$/;

const RegistModal = props => {
  const mediatedDevicesStore = new MediatedDevicesStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [isGpu, setIsGpu] = useState(true);

  const [nodeDataList, setNodeDataList] = useState([]);

  const [mediatedDeviceTypeListData, setMediatedDeviceTypeListData] = useState(
    []
  );
  const [mediatedDeviceTypeList, setMediatedDeviceTypeList] = useState([]);
  const [mediatedDeviceType, setMediatedDeviceType] = useState();
  const [pgpuDataList, setPgpuDataList] = useState([]);
  const [vgpuDataList, setVgpuDataList] = useState([]);
  const [vgpuCheckItems, setVgpuCheckItems] = useState([]);

  const [selectedPgpu, setSelectedPgpu] = useState('');

  const [reFetch, setReFetch] = useState(false);

  const getData = async () => {
    const listNode = await mediatedDevicesStore.fetchNodeList({ ...props });

    setNodeDataList(listNode.filter(obj => obj.node_role !== 'master'));
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (selectedPgpu) {
      getVgpuList(selectedPgpu);
    }
  }, [selectedPgpu]);

  const nodeOptions = () => {
    const opt = nodeDataList.map(obj => ({
      label: t(obj.name),
      value: t(obj.name),
    }));
    return opt;
  };

  const handleNode = value => {
    getPgpuList(value);
    getMediatedDeviceType(value);
  };

  const getPgpuList = async value => {
    const listPgpu = await mediatedDevicesStore.fetchPgpuList({
      node: value,
      ...props,
    });

    const opt = listPgpu.map(obj => ({
      label: t(obj.model_name),
      value: t(obj.model_num),
    }));
    setPgpuDataList(opt);
  };

  const getMediatedDeviceType = async value => {
    // type get
    const mdListType = await mediatedDevicesStore.fetchMediatedDeviceType({
      node: value,
      ...props,
    });
    setMediatedDeviceTypeListData([...mdListType.map(obj => obj.vgpu)]);

    // pgpu
    const listPgpu = await mediatedDevicesStore.fetchPgpuList({
      node: value,
      ...props,
    });

    // pgpu랑 vgpu랑 매핑
    const listVgpuPromises = listPgpu.map(async pgpu => {
      const listVgpu = await mediatedDevicesStore.fetchVgpuList({
        model_num: pgpu.model_num,
      });
      return listVgpu;
    });

    const listVgpuResults = await Promise.all(listVgpuPromises);

    const opt = [];
    const existsTypeArray = [];
    mdListType.forEach(type => {
      const result = listVgpuResults
        .flat()
        .find(vgpuResult => vgpuResult.mdev_id === type.vgpu);

      if (result) {
        opt.push({
          label: result.name,
          value: result.name,
        });
        existsTypeArray.push(result.name);
      }
    });

    setMediatedDeviceType(opt[0].label);
    setMediatedDeviceTypeList(opt);
    setVgpuCheckItems(existsTypeArray);
  };

  const getVgpuList = async value => {
    const listVgpu = await mediatedDevicesStore.fetchVgpuList({
      model_num: value,
      ...props,
    });

    const opt = listVgpu.map(obj => ({
      name: obj.name,
      mdevId: obj.mdev_id,
      resolution: obj.resolution,
      max_num: obj.max_num,
      value: t(obj.mdev_id),
      disabled: !!mediatedDeviceTypeListData.includes(obj.mdev_id),
    }));

    setVgpuDataList(opt);

    const existsTypeArray = [];
    opt.map(obj => {
      return mediatedDeviceTypeList.filter(mdType => {
        if (obj.name === mdType.value) {
          return existsTypeArray.push(obj.name);
        }
      });
    });

    setVgpuCheckItems(existsTypeArray);
  };

  const handleTypeToggle = async (checked, name, id) => {
    const { data } = form.current.props;

    if (checked) {
      setVgpuCheckItems(prev => [...prev, name]);
      // 생성
      const typeData = {
        mediated_device_type: {
          node: data.node,
          vgpu: id,
          mdType: name,
        },
      };
      try {
        await mediatedDevicesStore.createMediatedDeviceType(typeData, {
          ...props,
        });
        Notify.success({
          content: t('RESOURCES_SELECT_MDT_CREATE_SUCCESS'),
        });
        await getMediatedDeviceType(data.node);
      } catch (e) {
        console.log(e);
        setReFetch(!reFetch);
      }
    } else {
      setVgpuCheckItems(vgpuCheckItems.filter(el => el !== name));
      // 삭제
      const typeData = {
        node: data.node,
        vgpu: id,
        mdType: name,
      };
      try {
        await mediatedDevicesStore.deleteMediatedDeviceType(typeData, {
          ...props,
        });
        Notify.success({
          content: t('RESOURCES_SELECT_MDT_DELETE_SUCCESS'),
        });
        await getMediatedDeviceType(data.node);
      } catch (e) {
        console.log(e);
      }
    }
  };
  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;

      data.resource_name = data.name;
      data.is_gpu = isGpu;

      onOk({ mediated_device: data });
    });
  };

  // Validation 시작 ==================================================
  const nameValidator = (rule, value, callback) => {
    if (value === undefined) {
      return callback({
        message: t('RESOURCES_NAME_EMPTY_DESC'),
      });
    }
    if (!regexName.test(value)) {
      return callback({
        message: t('RESOURCES_NAME_CHECK_DESC'),
      });
    }

    callback();
  };

  const closeModal = () => {
    setModalView(false);
  };

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
        isSubmitting={props.store.isSubmitting}
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('RESOURCES_NAME')}
            rules={[
              {
                required: true,
                validator: nameValidator,
              },
            ]}
            desc={`${t('RESOURCES_NAME_VALID_DESC')} ex) nvidia.com/GRID-T4-1B`}
          >
            <Input
              name="name"
              autoFocus={true}
              maxLength={63}
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>
          <Form.Item>
            <Form.Group
              label={t('RESOURCES_SELECT_MDT_CREATE')}
              desc={t('RESOURCES_SELECT_MDT_CREATE_DESC')}
            >
              <Columns>
                <Column>
                  <Form.Item
                    label={t('RESOURCES_NODE')}
                    rules={[
                      {
                        required: true,
                        message: t('RESOURCES_SELECT_NODE_TIP'),
                      },
                    ]}
                  >
                    <Select
                      name="node"
                      placeholder={t('RESOURCES_SELECT')}
                      options={nodeOptions()}
                      onChange={e => {
                        handleNode(e);
                      }}
                    />
                  </Form.Item>
                </Column>
                <Column>
                  <Form.Item label={t('Physical GPU')}>
                    <Select
                      // style={{ maxWidth: '100%' }}
                      name="pgpu"
                      placeholder={t('RESOURCES_SELECT')}
                      options={pgpuDataList}
                      value={selectedPgpu}
                      onChange={e => {
                        getVgpuList(e);
                        setSelectedPgpu(e);
                      }}
                    />
                  </Form.Item>
                </Column>
              </Columns>
              <Form.Item label={t('')}>
                <div className={styles.wrapper}>
                  <div className={styles.table}>
                    <table>
                      <colgroup>
                        <col width="33%" />
                        <col width="13%" />
                        <col width="28%" />
                        <col width="16%" />
                        <col width="10%" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>
                            <strong>{t('RESOURCES_NAME')}</strong>
                          </th>
                          <th>
                            <strong>{t('MDEV')}</strong>
                          </th>
                          <th>
                            <strong>{t('RESOLUTION')}</strong>
                          </th>
                          <th>
                            <strong>{t('MAX NUM')}</strong>
                          </th>
                          <th>
                            <strong>{t('TYPE 생성')}</strong>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {!vgpuDataList?.length && (
                          <tr>
                            <td
                              colSpan="5"
                              className="no-data"
                              style={{
                                textAlign: 'center',
                              }}
                            >
                              <p>
                                {t(
                                  'RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION'
                                )}
                              </p>
                            </td>
                          </tr>
                        )}
                        {vgpuDataList?.map(data => (
                          <tr key={data.name}>
                            <td>{data.name}</td>
                            <td>{data.mdevId}</td>
                            <td>{data.resolution}</td>
                            <td>{data.max_num}</td>
                            <td>
                              <Toggle
                                checked={!!vgpuCheckItems.includes(data.name)}
                                onChange={e => {
                                  handleTypeToggle(e, data.name, data.mdevId);
                                }}
                                onText={t('ON')}
                                offText={t('OFF')}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Form.Item>
            </Form.Group>
          </Form.Item>

          <Form.Item>
            <Columns>
              <Column>
                <Form.Item
                  label={t('Mediated Device Type')}
                  rules={[
                    {
                      required: true,
                      message: t('RESOURCES_SELECT_MDT_TIP'),
                    },
                  ]}
                >
                  <Select
                    name="mediated_device_name"
                    // style={{ maxWidth: '100%' }}
                    placeholder={t('RESOURCES_SELECT')}
                    options={mediatedDeviceTypeList}
                    defaultValue={mediatedDeviceType}
                  />
                </Form.Item>
              </Column>
              <Column>
                {t('RESOURCES_GPU_CHECK')}
                <span className="form-item-required">*</span>
                <div style={{ padding: 4 }} />
                <Form.Item>
                  <Toggle
                    defaultChecked
                    showText
                    onText="on"
                    offText="off"
                    value={isGpu}
                    onChange={() => setIsGpu(!isGpu)}
                  />
                </Form.Item>
              </Column>
            </Columns>
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
      </Modal>
    </>
  );
};

export default RegistModal;
