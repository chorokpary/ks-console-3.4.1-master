import React, { useEffect, useState } from 'react'
import { Modal, TypeSelect } from 'components/Base'
import { UnitSlider, CardSelect, NumberInput } from 'components/Inputs'
import { PATTERN_NAME } from 'utils/constants'
import { range } from 'lodash'
import { Form, Input, Select, Icon, Tooltip, TextArea } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import DistroTypeStore from 'stores/resources/distrotype'

export default function ResourceImageModal({ title, store }) {
  // console.log(store)
  const distroTypeList = new DistroTypeStore();

  const [modelView, setModalView] = useState(true);

  const [realTime, setRealTime] = useState('미사용')
  const [publicType, setPublicType] = useState('퍼블릭')
  const [osType, setOsType] = useState('linux')

  const fetchData = async () => {
    await distroTypeList.fetchList();
  };

  useEffect(() => {
    fetchData();
  }, [])

  const realTimeOptions = [
    { value: '미사용', },
    { value: '사용', }
  ]
  const publicTypeOptions = [
    { value: '퍼블릭', },
    { value: '프라이빗', }
  ]
  const archTypeOptions = [
    { label: 'x86_64', value: 'x86_64', },
    { label: 'aarch64', value: 'aarch64', },
  ]
  const bootTypeOptions = [
    { label: 'legacy', value: 'legacy', },
    { label: 'uefi', value: 'uefi', }
  ]
  const osTypeOptions = [
    { label: 'Linux', value: 'linux', icon: 'linux', },
    { label: 'Windows', value: 'windows', icon: 'windows', }
  ]

  const handleOk = () => {
    console.log('ok')
    setModalView(false);
  }

  const closeModal = () => {
    console.log('cancel')
    setModalView(false);
  }

  const getMarks = () => {
    const max = 40
    const count = 5
    return range(count).reduce((marks, index) => {
      const value = (max * index) / (count - 1)
      const mark = value === 0 ? '' : `${Math.floor(value)}GB`
      return { ...marks, [value]: mark }
    }, {})
  }

  console.log(distroTypeList)

  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
      >
        <Form>
          <Form.Item
            label={t('이름')}
            rules={[
              // { required: true, message: t('NAME_EMPTY_DESC') },
              { required: true, message: t('이름을 입력해주세요') },
              // {
              //   pattern: PATTERN_NAME,
              //   message: t('INVALID_NAME_DESC', {
              //     message: t('LONG_NAME_DESC'),
              //   }),
              // },
            ]}
          // desc={t('LONG_NAME_DESC')}
          >
            <Input name="name" maxLength={253} />
          </Form.Item>

          <Form.Item>

            <Columns>
              <Column>
                <Form.Item
                  label={t('이미지')}
                  rules={[{ required: true, }]}
                >
                  <div style={{ textAlign: 'center' }}>
                    <CardSelect
                      onChange={(e) => setOsType(e)}
                      name="metadata.annotations['kubesphere.io/provisioner']"
                      options={osTypeOptions}
                      defaultValue={osType}
                    />
                  </div>
                </Form.Item>
              </Column>
              <Column>
                <Form.Item>
                  <TypeSelect
                    name={`qwfqwftype`}
                    // onChange={this.handleStrategyChange}
                    defaultValue="RollingUpdate"
                  // options={this.strategyOptions}
                  />
                </Form.Item>
                <Form.Group
                  label={t('ROLLING_UPDATE_SETTINGS')}
                  checkable
                  keepDataWhenUnCheck
                >
                  <Columns >
                    <Column>
                      <Form.Item
                        label={t('PARTITION_ORDINAL')}
                        desc={t('PARTITION_ORDINAL_DESC')}
                        rules={[
                          { required: true, message: t('PARTITION_ORDINAL_EMPTY') },
                          // { validator: this.valueValidatorNumber },
                        ]}
                      >
                        <NumberInput
                          name={`${this.rollingUpdatePrefix}.partition`}
                          defaultValue={0}
                          min={0}
                          integer
                        />
                      </Form.Item>
                    </Column>
                  </Columns>
                </Form.Group>
              </Column>
            </Columns>
          </Form.Item>

          <Form.Item>
            <Columns>
              <Column>
                <Form.Item
                  label={t('CPU 타입')}
                  rules={[
                    {
                      required: true,
                      // message: t('SNAPSHOT_CLASS_PROVISIONER_EMPTY_DESC'),
                    },
                  ]}
                >
                  <Select
                    name="arch_type"
                    defaultValue="x86_64"
                    options={archTypeOptions} />
                </Form.Item>
              </Column>
              <Column>
                <Form.Item
                  label={t('부트 타입')}
                  rules={[
                    {
                      required: true,
                    },
                  ]}>
                  <Select
                    name="boot_type"
                    defaultValue="legacy"
                    options={bootTypeOptions}
                  />
                </Form.Item>
              </Column>
            </Columns>
          </Form.Item>

          {/* <Form.Item> */}
          <Form.Item
            label={t('리얼 타임')}
            rules={[
              {
                required: true,
                // message: t('SNAPSHOT_CLASS_PROVISIONER_EMPTY_DESC'),
              },
            ]}
          >
            <RadioGroup
              wrapClassName="radio"
              value={realTime}
              onChange={value => setRealTime(value)}
            >
              {realTimeOptions.map(option => (
                <RadioButton key={option.value} value={option.value}>
                  {option.value}
                </RadioButton>
              ))}
            </RadioGroup>
          </Form.Item>
          {/* </Form.Item> */}
          <Form.Item
            label={t('사이즈')}
            rules={[{ required: true, }]}>
            <UnitSlider
              name="size"
              max={40}
              min={1}
              marks={getMarks()}
              defaultValue='12GB'
              unit={'GB'}
              withInput
              onChange={this.handleChange}
            />
          </Form.Item>

          <Form.Item
            label={t('소스')}
            rules={[{ required: true, }]}>
            <RadioGroup
              wrapClassName="radio"
              value={publicType}
            // onChange={value => setPublicType(value)}
            >
              {publicTypeOptions.map(option => (
                <RadioButton key={option.value} value={option.value}>
                  {option.value}
                </RadioButton>
              ))}
            </RadioGroup>
          </Form.Item>
          <Form.Item>
            <Input name="source_url"
              defaultValue={'https://quay.io/api/v1/repository?public=true&namespace=edgestack&last_modified=true&popularity=true&repo_kind=image'}
              readOnly
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>
          <Form.Item>
            <Input name="soruce"
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

          <Form.Item
            label={t('설명')}
          // desc={t('DESCRIPTION_DESC')}
          >
            <TextArea
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
