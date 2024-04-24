import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Toggle, Notify } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'

import VolumeStore from 'stores/resources/volumes'

const VolumeModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const volumeStore = new VolumeStore();

  const [volumeList, setVolumeList] = useState([]);
  const [volumeCheckItems, setVolumeCheckItems] = useState([])

  const [reFetch, setReFetch] = useState(false);

  const vmName = props.store.detail.name;
  const vmId = props.store.detail.id;

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {
    const getVolumeDataList = async () => {

      const volumeData = await volumeStore.fetchList({
        cluster: props.cluster,
        namespace: props.namespace,
      });

      //볼륨 리스트 중 해당 가상머신과 연결이 되어 있건, 아무것도 연결이 안되어 있는 볼륨 리스트.
      const volumeListData = volumeData.filter((obj) => {
        return ((obj.used_by_vmi == vmName || !!!obj.used_by_vmi) && obj.name != `${vmName}-boot-dv`)
      })

      const connectedVolumeArray = [];
      await volumeListData.map((obj) => {
        if (obj.used_by_vmi == vmName) {
          connectedVolumeArray.push(obj.name)
        }
      })

      setVolumeCheckItems(connectedVolumeArray);
      setVolumeList(volumeListData);
    };

    getVolumeDataList();
  }, [reFetch])

    ;
  const handleVolumeToggle = (checked, name, id) => {

    if (checked) {
      setVolumeCheckItems(prev => [...prev, name]);
    } else {
      setVolumeCheckItems(volumeCheckItems.filter((el) => el !== name));
    }

    const data = {};
    data.vmName = vmName;
    data.vmId = vmId;
    data.volumeName = name;
    data.id = id;
    data.actionType = checked ? "A" : "D";

    volumeStore.actionState({ data, cluster: props.cluster, namespace: props.namespace }).then(() => {
      Notify.success({ content: t('RESOURCES_PROCESSED') })
      props.onOk();
    }).catch((error) => {
      setReFetch(!reFetch);
    });
  }

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

          <Form.Item label={t('')} >
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="20%" />
                    <col width="13%" />
                    <col width="13%" />
                    <col width="18%" />
                    <col width="8%" />
                    <col width="8%" />
                    <col width="10%" />
                    <col width="10%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th><strong>{t('RESOURCES_NAME')}</strong></th>
                      <th><strong>{t('RESOURCES_ACCESS_MODE')}</strong></th>
                      <th><strong>{t('RESOURCES_INPUT_SOURCE')}</strong></th>
                      <th><strong>{t('RESOURCES_STOREGE_CLASS')}</strong></th>
                      <th><strong>{t('RESOURCES_CAPACITY')}</strong></th>
                      <th><strong>{t('RESOURCES_STATE')}</strong></th>
                      <th><strong>{t('RESOURCES_VOLUME_LOCATION')}</strong></th>
                      <th><strong>{t('RESOURCES_VOLUME_BINDING')}</strong></th>
                    </tr>
                  </thead>
                  <tbody>

                    {!volumeList?.length &&
                      <tr>
                        <td colSpan="7" className="no-data" style={{ textAlign: 'center' }}>
                          <p>{t('RESOURCES_NO_RESOURCE_AVAILABLE_ALLOCATION')}</p>
                        </td>
                      </tr>
                    }
                    {volumeList?.map((data) => (
                      <tr key={data.name}>
                        <td >{data.name}</td>
                        <td >{(data.access_modes).map((mode) => (<p key={mode}>{mode}</p>))}</td>
                        <td >{data.import_endpoint}</td>
                        <td >{data.storage_class}</td>
                        <td >{data.capacity}</td>
                        <td >{data.phase}</td>
                        <td >{data.selected_node}</td>
                        <td>
                          {(data.selected_node == props.store.detail.vm.node || !data.selected_node) &&
                            <Toggle
                              checked={volumeCheckItems.includes(data.name) ? true : false}
                              onChange={(e) => handleVolumeToggle(e, data.name, data.id)}
                              onText={t('ON')}
                              offText={t('OFF')}
                            />
                          }
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

export default VolumeModal

