import { get } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';

import {
  Form,
  Input,
  Select,
  TextArea,
  Button,
  Loading,
  Radio,
  Checkbox,
} from '@kube-design/components';
import { Modal } from 'components/Base';
import { ProjectSelect } from 'components/Inputs';
import styles from './index.scss';

const RegistModal = ({ title, onOk, store, ...props }) => {

  const [modelView, setModalView] = useState(true);

  const [networkOriginList, setNetworkOriginList] = useState([]);
  const [networkList, setNetworkList] = useState([]);
  const [routerList, setRouterList] = useState([]);
  const [availableIpList, setAvailableIpList] = useState([]);
  const [selectedIp, setSelectedIp] = useState({});

  const [networkDataList, setNetworkDataList] = useState([]);
  const [radioExternal, setRadioExternal] = useState('');

  const [projectName, setProjectName] = useState(
    props.namespace ? props.namespace : 'default'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    setModalView(false);
  };

  useEffect(() => {
    const fnGetRouterList = async () => {
      const routerData = await store.routerList({ ...props });
      setRouterList(getSliceData(routerData.routers));
    };
    fnGetRouterList();

    const fnGetNetworkList = async () => {
      const availableIpData = await store.allAvailableIps({ ...props });
      const networkData = await store.networkList({ ...props });
      setAvailableIpList(availableIpData.all_ips);
      setNetworkDataList(networkData.networks);
    };
    fnGetNetworkList();
  }, []);

  useEffect(() => {
    if (networkDataList.length > 0 && routerList.length > 0) {
      const list =
        networkDataList.filter(obj => routerList.includes(obj.id)) || [];
      setNetworkOriginList(list);

      setNetworkList(list.filter(obj => obj.project === projectName));
      setRadioExternal(
        list.filter(obj => obj.project === projectName)?.[0]?.id
      );
    }
  }, [networkDataList, routerList]);

  const handleOk = () => {
    setIsSubmitting(true);
    const _ = require('lodash');
    if (!_.isEmpty(selectedIp)) {
      onOk({ floating_ip: selectedIp });
    } else {
      onOk({ floating_ip: { network: radioExternal } });
    }
  };

  const getSliceData = data => {
    const arr = [];
    data.filter(obj => obj.external).map(obj => arr.push(obj.external.id));
    return arr;
  };

  useEffect(() => {
    const list = networkOriginList.filter(obj => obj.project === projectName);
    setNetworkList(list);
    setRadioExternal(list[0]?.id);
  }, [projectName]);

  const availableIpOptions = netId => {
    const networkIps = availableIpList.find(obj => obj.network === netId);
    const opt = networkIps.ips.map(ip => {
      return {
        label: t(ip),
        value: t(ip),
      };
    });
    return opt;
  };

  const handleIpSelectClick = (netId, val) => {
    const record = {};
    if (val != t('RESOURCES_AUTOMATIC') && val != undefined) {
      record.network = netId;
      record.floating_ip = val;
    }
    setSelectedIp(record);
  };

  return (
    <>
      <Modal
        icon="pen"
        width={800}
        title={title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        okText={t('RESOURCES_CREATE')}
        cancelText={t('RESOURCES_CANCEL')}
        disableSubmit={networkList.length === 0 && true}
        isSubmitting={store.isSubmitting}
      >
        <Form>
          {props.namespace ? (
            ''
          ) : (
            <Form.Item
              label={t('PROJECT')}
              desc={t('SELECT_PROJECT_DESC')}
              rules={[
                { required: true, message: t('PROJECT_NOT_SELECT_DESC') },
              ]}
            >
              <ProjectSelect
                name="metadata.namespace"
                defaultValue={projectName}
                cluster={props.cluster}
                onChange={e => setProjectName(e)}
              />
            </Form.Item>
          )}
          <Form.Item>
            <div className={styles.wrapper}>
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col width="5%" />
                    <col width="20%" />
                    <col width="15%" />
                    <col width="20%" />
                    <col width="20%" />
                    <col width="20%" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th></th>
                      <th>
                        <strong>{t('RESOURCES_NETWORK_NAME')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_NETWORK_TYPE_YOO')}</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_IP_ASSIGNMENT')}</strong>
                      </th>
                      <th>
                        <strong>CIDR</strong>
                      </th>
                      <th>
                        <strong>{t('RESOURCES_GATEWAY')}</strong>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!networkList?.length && (
                      <tr>
                        <td colSpan="6" className="no-data">
                          <p>{t('RESOURCES_FIP_NO_NETWORK')}</p>
                        </td>
                      </tr>
                    )}
                    {networkList?.map(data => (
                      <tr key={data.name}>
                        <td>
                          <Radio
                            name="external"
                            value={data.name}
                            checked={radioExternal === data.id}
                            onChange={e => {
                              setRadioExternal(data.id);
                            }}
                          />
                        </td>
                        <td>{data.name}</td>
                        <td>{data.type.toUpperCase()}</td>
                        <td>
                          <Select
                            name={`${data.id}-ip`}
                            placeholder={t('RESOURCES_AUTOMATIC')}
                            options={availableIpOptions(data.id)}
                            onChange={e => handleIpSelectClick(data.id, e)}
                            clearable
                          />
                        </td>
                        <td>{data.cidr}</td>
                        <td>{data.gateway_ip}</td>
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

export default RegistModal;
