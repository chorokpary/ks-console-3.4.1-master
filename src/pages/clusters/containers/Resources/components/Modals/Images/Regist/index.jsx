import React, { useEffect, useRef, useState } from 'react'
import { Modal, List } from 'components/Base'
import { UnitSlider, NumberInput } from 'components/Inputs'
import { PATTERN_NAME } from 'utils/constants'
import { get, omit, range } from 'lodash'
import { Form, Input, Select, Icon, Tooltip, TextArea, Dropdown } from '@kube-design/components'
import { Column, Columns } from '@kube-design/components/lib/components/Layout'
import { RadioButton, RadioGroup } from '@kube-design/components/lib/components/Radio'
import DistroTypeStore from 'stores/resources/distrotype'
import styles from './index.scss'
import ContainerForm from '../../../../../../../../components/Forms/Workload/ContainerSettings/ContainerForm'
import TypeSelect from '../../../TypeSelect'
import CardSelect from '../../../CardSelect'

export default function ResourceImageModal({ title, store, onOk }) {

  const form = useRef();
  const [formData, setFormData] = useState({});
  const distroTypeStore = new DistroTypeStore();

  const [modelView, setModalView] = useState(true);

  const [realTime, setRealTime] = useState(false)
  const [publicType, setPublicType] = useState('퍼블릭')
  const [osType, setOsType] = useState('linux')
  const [distroTypeData, setDistroTypeData] = useState([])
  const [distroTypeList, setDistroTypeList] = useState([])
  const [distroType, setDistroType] = useState('ubuntu')

  useEffect(() => {
    const getDistroTypeList = async () => {
      const dist = await distroTypeStore.fetchList();
      setDistroTypeData(dist)
      setDistroTypeList(dist.filter(obj => obj.name != 'windows'))
    };
    getDistroTypeList();

  }, [])

  const realTimeOptions = [
    { label: '미사용', value: false, },
    { label: '사용', value: true, }
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
    { label: 'Linux', value: 'linux', icon: 'ico-linux', },
    { label: 'Windows', value: 'windows', icon: 'ico-windows', },
    { label: 'etc', value: '', icon: 'ico-plus', }

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
      if (typeof data.size === 'string') {
        data.size = Number(data.size.slice(0, data.size.length - 2))
      }
      data.distro_type = distroType;
      onOk({ image: data })
    })
  }

  const closeModal = () => {
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

  const handleOsType = (value) => {
    setOsType(value)
    if (value == 'windows') {
      setDistroType('windows')
      setDistroTypeList(distroTypeData.filter(obj => obj.name == 'windows'))
    } else if (value == 'linux') {
      setDistroType('ubuntu')
      setDistroTypeList(distroTypeData.filter(obj => obj.name != 'windows'))
    } else {
      setDistroType('')
      setDistroTypeList([])
    }
  }


  return (
    <>
      <Modal
        icon="pen"
        width={1000}
        title={title}
        onOk={handleOk}
        okText={'생성'}
        onCancel={closeModal}
        cancelText={'취소'}
        visible={modelView}
      >
        <Form data={formData} ref={form}>
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
            desc={t('NAME_DESC')}
          >
            <Input name="name" maxLength={253}
              style={{ maxWidth: 'none' }} />
          </Form.Item>

          <Form.Item>

            <Columns>
              <Column>
                <Form.Item
                  label={t('이미지')}
                  rules={[{ required: true, message: t('이미지를 선택해주세요.') }]}
                >
                  <CardSelect
                    className={`${styles.customUl} customCard`}
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
                    // name="distro_type"
                    onChange={(e) => setDistroType(e)}
                    defaultValue={distroType}
                    options={distroTypeOptions()}
                  />
                </Form.Item>
                <Form.Item>
                  <Input
                    defaultValue={osType + ' > ' + distroType}
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
                  rules={[
                    {
                      required: true,
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

          <Form.Item>
            <Columns>
              <Column>
                <Form.Item
                  label={t('리얼 타임')}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <RadioGroup
                    name="is_realtime"
                    wrapClassName="radio"
                    defaultValue={realTime}
                    onChange={value => setRealTime(value)}
                  >
                    {realTimeOptions.map(option => (
                      <RadioButton key={option.value} value={option.value}>
                        {option.label}
                      </RadioButton>
                    ))}
                  </RadioGroup>
                </Form.Item>
              </Column>
              <Column>
                <Form.Item label={t('버전')}>
                  <Input name="version" maxLength={253}
                    style={{ maxWidth: 'none' }} />
                </Form.Item>
              </Column>
            </Columns>
          </Form.Item>


          <Form.Item
            label={t('사이즈')}
            rules={[{
              required: true,
            }]}>
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
            rules={[{
              required: true,
            }]}>
            <RadioGroup
              name="is_public"
              wrapClassName="radio"
              defaultValue={publicType}
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
          {/* <Form.Item>
            <ContainerForm
              type={'Add'}
              // namespace={get({ metadata: { namespace: 'kdh-project01' } }, 'metadata.namespace')}
              namespace={'kdh-project01'}
            />
          </Form.Item> */}
          <Form.Item>
            <Input name="source"
              defaultValue={'docker://quay.io/edgestack/ubuntu-2004-kube:x86_64'}
              readOnly
              style={{ maxWidth: 'none' }}
            />
          </Form.Item>

          <Form.Item
            label={t('설명')}
            desc={t('DESCRIPTION_DESC')}
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
