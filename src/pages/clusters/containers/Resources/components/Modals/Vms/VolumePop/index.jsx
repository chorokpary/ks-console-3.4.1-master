import { get } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';

import { Form, Toggle, Checkbox, Select, Notify } from '@kube-design/components';
import { Modal } from 'components/Base';
import VolumeStore from 'stores/resources/volumes';
import styles from './index.scss';

const VolumeModal = props => {
  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const volumeStore = new VolumeStore();

  const [volumeList, setVolumeList] = useState([]);
  const [hotplugList, setHotplugList] = useState([]);
  const [selectedBusList, setSelectedBusList] = useState([]);
  const [volumeCheckItems, setVolumeCheckItems] = useState([]);
  const [hotplugCheckItems, setHotplugCheckItems] = useState([]);

  const [reFetch, setReFetch] = useState(false);

  const vmName = props.store.detail.name;
  const project = props.store.detail.namespace;

  const closeModal = () => {
    setModalView(false);
  };

  const busTypeOptions = [
    { label: 'VirtIO', value: 'virtio' },
    { label: 'SATA', value: 'sata' },
    { label: 'SCSi', value: 'scsi' },
  ];

  const stateVariables = {
    hotplug: hotplugCheckItems,
  };

  const setVariables = {
    hotplug: setHotplugCheckItems,
  };

  const handleSingleCheck = (checked, id, type) => {
    if (checked) {
      setVariables[type](prev => [...prev, id]);
    } else {
      setVariables[type](stateVariables[type].filter(el => el !== id));
    }
  };

  const handleBusSelectClick = (volId, bus) => {
    const record = {};
    record.volume_id = volId;
    record.bus = bus;
    const existing = selectedBusList.filter(obj => obj.volume_id !== volId);
    if (bus != t('RESOURCES_SELECT') && bus != undefined) {
      existing.push(record);
    }
    setSelectedBusList(existing);
  };

  useEffect(() => {
    const getVolumeDataList = async () => {
      const volumeData = await volumeStore.fetchList({
        cluster: props.cluster,
        namespace: props.namespace,
        infinite: true,
      });

      // 볼륨 리스트 중 해당 가상머신과 연결이 되어 있건, 아무것도 연결이 안되어 있는 볼륨 리스트.
      const volumeListData = volumeData.filter(obj => {
        return (
          ((obj.used_by_vmi === vmName && obj.project === project) || !obj.used_by_vmi) &&
          obj.name !== `${vmName}-boot-dv` && obj.phase == "Succeeded" &&
          obj.boot_volume === false
        );
      });

      const connectedVolumeArray = [];
      await volumeListData.map(obj => {
        if (obj.used_by_vmi === vmName) {
          connectedVolumeArray.push(obj.id);
        }
      });

      setVolumeCheckItems(connectedVolumeArray);
      setVolumeList(volumeListData);
    };

    getVolumeDataList();
  }, [reFetch]);

  const handleVolumeToggle = (checked, name, id) => {
    if (checked) {
      setVolumeCheckItems(prev => [...prev, id]);
    } else {
      setVolumeCheckItems(volumeCheckItems.filter(el => el !== id));
    }

    const data = {};
    data.vmName = vmName;
    data.name = name;
    data.id = id;
    data.actionType = checked ? 'A' : 'D';

    if (stateVariables['hotplug'].includes(id)) {
      data.hotplug = true;
      data.bus = "scsi";
    } else {
      data.hotplug = false;
      const busList = selectedBusList.filter(obj => obj.volume_id === id);
      if (busList.length == 1) {
        data.bus = busList[0].bus;
      }
    }

    volumeStore
      .actionState({ data, cluster: props.cluster, namespace: project })
      .then(() => {
        Notify.success({ content: t('RESOURCES_PROCESSED') });
        props.onOk();
      })
      .catch(error => {
        setReFetch(!reFetch);
      });
  };

  return (
    <>
      <Modal
        icon="pen"
        width={900}
        title={props.title}
        onCancel={closeModal}
        visible={modelView}
        hideFooter
      >
        <Form data={formData} ref={form}>
          <Form.Item label={t('')}>
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="20%" />
                    <col width="13%" />
                    <col width="13%" />
                    <col width="18%" />
                    <col width="8%" />
                    <col width="18%" />
                    <col width="10%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>
                        <strong>{t('RESOURCES_NAME')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_HOTPLUG_FLAG')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_BUS_TYPE')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_STORAGE_CLASS')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_CAPACITY')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_VOLUME_LOCATION')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_VOLUME_BINDING')}</strong>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!volumeList?.length && (
                      <tr>
                        <td
                          colSpan="7"
                          className="no-data"
                          style={{ textAlign: 'center' }}
                        >
                          <p>
                            {t('RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION')}
                          </p>
                        </td>
                      </tr>
                    )}
                    {volumeList?.map(data => (
                      <tr key={data.id}>
                        <td>{data.name}</td>
                        <td>
                          <Checkbox
                            name={`select-${data.id}`}
                            checked={
                              !!stateVariables['hotplug'].includes(data.id) || data.hotplug === true
                            }
                            onChange={checked =>
                              handleSingleCheck(
                                checked,
                                data.id,
                                'hotplug'
                              )
                            }
                            disabled={!!volumeCheckItems.includes(data.id)}
                          />
                        </td>
                        <td>
                          <Select
                            name={`${data.id}-bus`}
                            placeholder={t('RESOURCES_AUTOMATIC')}
                            options={busTypeOptions}
                            onChange={e =>
                              handleBusSelectClick(data.id, e)
                            }
                            defaultValue={
                              (() => {
                                if (!!(data.bus)) {
                                  return data.bus;
                                } else {
                                  if (hotplugCheckItems.includes(data.id)) {
                                    return "scsi";
                                  } else {
                                    return "virtio";
                                  }
                                }
                              })()
                            }
                            disabled={hotplugCheckItems.includes(data.id) || volumeCheckItems.includes(data.id)}
                            clearable
                          />
                        </td>
                        <td>{data.storage_class}</td>
                        <td>{data.capacity}</td>
                        <td>{data.selected_node}</td>
                        <td>
                          {(data.selected_node == props.store.detail.vm.node ||
                            !data.selected_node) && (
                              <Toggle
                                checked={volumeCheckItems.includes(data.id)}
                                onChange={e =>
                                  handleVolumeToggle(e, data.name, data.id)
                                }
                                onText={t('ON')}
                                offText={t('OFF')}
                              />
                            )}
                        </td>
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

export default VolumeModal;
