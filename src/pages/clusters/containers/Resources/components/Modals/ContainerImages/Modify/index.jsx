import React, { useEffect, useRef, useState } from 'react'
import { Modal, List } from 'components/Base'
import { UnitSlider, NumberInput } from 'components/Inputs'
import { get, omit, range } from 'lodash'
import { Form, Input, Select, Icon, Tooltip, TextArea, Dropdown } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import DistroTypeStore from 'stores/resources/distrotype'
import styles from './index.scss'

import TypeSelect from '../../../TypeSelect'
import CardSelect from '../../../CardSelect'

export default function ResourceImageModal({ title, store, onOk, detail }) {

  const form = useRef();
  const [formData, setFormData] = useState({});
  const distroTypeStore = new DistroTypeStore();

  const [modelView, setModalView] = useState(true);

  const [osType, setOsType] = useState("linux")
  const [distroTypeData, setDistroTypeData] = useState([])
  const [distroTypeList, setDistroTypeList] = useState([])
  const [distroType, setDistroType] = useState(store.detail.image.os_distro)

  useEffect(() => {
    const getDistroTypeList = async () => {
      const dist = await distroTypeStore.fetchList();
      setDistroTypeData(dist)
      setDistroTypeList(dist.filter(obj => obj.name != 'windows'))
    };
    getDistroTypeList();
  }, [])


  const archTypeOptions = [
    { label: 'x86_64', value: 'x86_64', },
    { label: 'aarch64', value: 'aarch64', },
  ]
  
  const bootTypeOptions = [
    { label: 'legacy', value: 'legacy', },
    { label: 'uefi', value: 'uefi', }
  ]

  const osTypeOptions = [
    { label: 'Linux', value: 'linux', icon: 'ico-linux', },
    { label: 'Windows', value: 'windows', icon: 'ico-windows', },
    // { label: 'etc', value: '', icon: 'ico-plus', }
  ]
  
  const distroTypeOptions = () => {
    const opt = distroTypeList.map((obj) => ({
      label: t(obj.name),
      description: t(obj.vendor),
      icon: `ico-os-${obj.name}`,
      value: t(obj.name),
    }))
    return opt
  }

  const handleOk = () => {

    form.current.validator(() => {
      const { data } = form.current.props;
      data.os_distro = distroType;
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const handleOsType = (value) => {
    setOsType(value)
    if (value == 'windows') {
      setDistroType('windows')
      setDistroTypeList(distroTypeData.filter(obj => obj.name == 'windows'))
    } else {
      setDistroType('ubuntu')
      setDistroTypeList(distroTypeData.filter(obj => obj.name != 'windows'))
    }
  }

  const versionValidator = (rule, value, callback) => {

    if(value == undefined){
      return callback({ message: t('버전을 입력해 주세요.') })
    }
    callback()
  }

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={title}
        onOk={handleOk}
        okText={'수정'}
        onCancel={closeModal}
        cancelText={'취소'}
        visible={modelView}
      >
        <Form data={formData} ref={form}>
          <Form.Item
            label={t('이름')}
            rules={[{ required: true, message: t('이름을 입력해주세요') },]}
          >
            <Input name="name" maxLength={253}
              defaultValue={store.detail.image.name}
              style={{ maxWidth: 'none' }}
              readOnly />
          </Form.Item>

          <Form.Item>

            <Columns>
              <Column>
                <Form.Item
                  label={t('이미지')}
                  rules={[{ required: true, }]}
                >
                  <CardSelect
                    className={styles.customUl}
                    onChange={(e) => handleOsType(e)}
                    name="os_type"
                    options={osTypeOptions}
                    defaultValue={osType}
                  />
                </Form.Item>
              </Column>
              <Column>
                <Form.Item label={t('배포판')}>
                  <TypeSelect
                    onChange={(e) => setDistroType(e)}
                    defaultValue={distroType}
                    options={distroTypeOptions()}
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    defaultValue={osType[0].toUpperCase() + osType.slice(1, osType.length) + ' > ' + distroType}
                    readOnly
                    style={{ maxWidth: 'none' }}
                  />
                </Form.Item>
              </Column>
            </Columns>
          </Form.Item>

          <Form.Item>
            <Columns>
              <Column>
                <Form.Item
                  label={t('CPU 타입')}
                  rules={[{ required: true, },]}
                >
                  <Select
                    name="arch_type"
                    defaultValue={store.detail.image.arch_type}
                    options={archTypeOptions} />
                </Form.Item>
              </Column>
              <Column>
                <Form.Item
                  label={t('부트 타입')}
                  rules={[{ required: true, },]}>
                  <Select
                    name="boot_type"
                    defaultValue={store.detail.image.boot_type}
                    options={bootTypeOptions}
                  />
                </Form.Item>
              </Column>
            </Columns>
          </Form.Item>

          <Form.Item
            label={t('쿠버네티스 버전')}
            rules={[{ required: true, validator: versionValidator }]}         
          >
            <Input name="kube_version" maxLength={253}
              style={{ maxWidth: 'none' }}  
              defaultValue={store.detail.image.kube_version}
              />
          </Form.Item>

          <Form.Item
            label={t('설명')}
            rules={[{ required: true, message: '설명을 입력해주세요.' }]}
            desc={t('DESCRIPTION_DESC')}
          >
            <TextArea
              defaultValue={store.detail.image.description}
              style={{ maxWidth: 'none' }}
              name="description"
              maxLength={256}
            />
          </Form.Item>
        </Form>

      </Modal >
    </>

  )

}
