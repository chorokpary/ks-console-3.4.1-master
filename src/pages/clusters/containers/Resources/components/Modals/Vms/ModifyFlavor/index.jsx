import { toJS } from 'mobx'
import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, TextArea, Button, Loading, Checkbox } from '@kube-design/components'
import { Modal } from 'components/Base'

import TypeSelect from '../../../TypeSelect'

import * as common from "utils/resources"

import classnames from 'classnames'
import styles from './index.scss'

import VmStore from 'stores/resources/vms'

const ModifyFlavorModal = (props) => {

  const imageData = props.store.detail.vm.image;
  const flavorData = props.store.detail.vm.flavor;

  const vmStore = new VmStore();

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});

  const [flavorDataList, setFlavorDataList] = useState([]);
  const [imageDataList, setImageDataList] = useState([]);

  const [selectFlavorName, setSelectFlavorName] = useState(flavorData.name);
  const [selectImageName, setSelectImageName] = useState(imageData.name);

  const [flavorSizeCheck, setFlavorSizeCheck] = useState(true);

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {

      const { data } = form.current.props;
      data.id = props.store.detail.vm.id;

      const flavorSize = flavorDataList.filter(item => item.name == selectFlavorName).map(item => item.root_disk);
      const imageSize = imageDataList.filter(item => item.name == selectImageName).map(item => item.size)[0].replace('Gi', '');

      if (flavorSize < imageSize) {
        setFlavorSizeCheck(false);
        return false;
      }

      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  useEffect(() => {
    console.log(props)
    const getVmCreateData = async () => {
      const listFlavor = await vmStore.fetchVmListFlavor({ sortBy: 'root_disk', ...props });
      const listImage = await vmStore.fetchVmListImage({ ...props });

      setFlavorDataList(listFlavor.flavors);
      setImageDataList(listImage.images);
    };

    getVmCreateData();
  }, [])

  const flavorOptions = () => {
    let size;
    let regex = /[^0-9]/g;
    let selectedRootDisk = 0;

    selectedRootDisk = imageDataList.find(item => item.name == selectImageName)
    size = selectedRootDisk?.size.replace(regex, "") || 0;

    const opt = flavorDataList.map((obj) => ({
      label: t(obj.name),
      description: `CPU ${obj.vcpus} Cores / Memory ${common.fnSetBytes(obj.ram)} Gib / Disk ${obj.root_disk} Gib`,
      value: t(obj.name),
      disabled: Number(obj.root_disk) < Number(size) ? true : false
    }))
    return opt
  }

  // Validation 시작 ==================================================  
  const flavorValidator = (rule, value, callback) => {
    if (value == t('RESOURCES_SELECT') || value == "select") {
      return callback({ message: t('RESOURCES_SELECT_FLAVOR_TIP') })
    }
    callback()
  }
  // Validation 끝 ==================================================

  return (
    <>
      <Modal
        icon="pen"
        width={900}
        height={400}
        title={props.title}
        bodyClassName={styles.body}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        isSubmitting={props.store.isSubmitting}
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('Flavor')}
            rules={[{ required: true, validator: flavorValidator }]}
          >
            <TypeSelect
              name="flavor"
              defaultValue={selectFlavorName}
              options={flavorOptions()}
              onChange={(e) => setSelectFlavorName(e)}
              placeholder={{
                label: t('RESOURCES_SELECT')
              }}
              defaultDescription={t('RESOURCES_SELECT_FLAVOR_TIP')}
            />
          </Form.Item>
          <div className={`form-item-error ${flavorSizeCheck ? "hide" : ""}`}>{t('RESOURCES_SELECT_SIZE_LAGER_IMAGE_SIZE_DESC')}</div>
        </Form>
      </Modal>

    </>
  );
};

export default ModifyFlavorModal

