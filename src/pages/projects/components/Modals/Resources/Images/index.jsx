import React, { useState } from 'react'
import { Modal } from 'components/Base'
import { PATTERN_NAME } from 'utils/constants'
import { Form, Input, Select, Icon, Tooltip } from '@kube-design/components'

export default function ResourceImageModal({ title, store }) {
  console.log(store)
  const [modelView, setModalView] = useState(true);

  const handleOk = () => {
    console.log('ok')
    setModalView(false);
  }

  const closeModal = () => {
    console.log('cancel')
    setModalView(false);
  }

  return (
    <>
      {modelView &&
        <Modal
          icon="pen"
          width={600}
          title={title}
          onOk={handleOk}
          onCancel={closeModal}
          visible={true}
        >
          <Form>
            <Form.Item
              label={t('NAME')}
              rules={[
                { required: true, message: t('NAME_EMPTY_DESC') },
                {
                  pattern: PATTERN_NAME,
                  message: t('INVALID_NAME_DESC', {
                    message: t('LONG_NAME_DESC'),
                  }),
                },
              ]}
              desc={t('LONG_NAME_DESC')}
            >
              <Input name="name" maxLength={253} />
            </Form.Item>
            <Form.Item
              label={t('VOLUME_SNAPSHOT_CLASS')}
              rules={[{ required: true, message: t('SNAPSHOT_EMPTY_TIP') }]}
              desc={t('SELECT_VOLUME_SNAPSHOT_CLASS_DESC')}
            >
              <Select
                name="type"
              // options={volumeSelect ? snapShotClass : options}
              // placeholder=" "
              // className={styles.input}
              />
            </Form.Item>
          </Form>

        </Modal>
      }
    </>
  )

}
