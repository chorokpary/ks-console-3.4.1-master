import { get } from 'lodash'
import React, { useState, useRef, useEffect } from 'react'

import { Form, Input, Select, Checkbox, TextArea, Button, Loading, Column, Columns } from '@kube-design/components'
import { Modal } from 'components/Base'
import styles from './index.scss'
import classnames from 'classnames'

import { PATTERN_USER_NAME } from 'utils/constants'

const RegistModal = (props) => {

  const form = useRef();
  const [modelView, setModalView] = useState(true);
  const [formData, setFormData] = useState({});
  const [defaultLicense, setDefaultLicense] = useState(false);

  const useAsDefaultLicense = async () => {
    setDefaultLicense(!defaultLicense);
  };

  const handleOk = () => {
    const onOk = props.onOk;

    form.current.validator(() => {
      const { data } = form.current.props;
      data.inuse = defaultLicense;
      onOk({ ...data })
    })
  }

  const closeModal = () => {
    setModalView(false);
  }

  const fnGetModalFooter = () => {

    let elements = "";
    elements =
      <>

        <Button onClick={() => closeModal()} className={classnames(styles['btn'], styles['btn-default'])}>{t('RESOURCES_CANCEL')}</Button>
        <Button onClick={() => { handleOk() }}
          className={classnames(styles['btn'], styles['btn-control'])}
          loading={props.store.isSubmitting}
          disabled={props.store.isSubmitting}
        >{t('RESOURCES_CONFIRM')}
        </Button>

      </>

    return elements;
  }

  return (
    <>
      <Modal
        icon="pen"
        width={700}
        title={props.title}
        onOk={handleOk}
        onCancel={closeModal}
        visible={modelView}
        bodyClassName={styles.body}
        hideFooter
      >
        <Form data={formData} ref={form}>
          <div className={styles.cont_boxwrap}>
            <Form.Item>
              <Columns>
                <Column>
                  <Form.Item
                    label={t('RESOURCES_NAME')}
                    rules={[
                      { required: true, message: t('NAME_EMPTY_DESC') },
                      {
                        pattern: PATTERN_USER_NAME,
                        message: t('RESOURCES_INVALID_NAME_DESC'),
                      },
                    ]}
                    desc={t('NAME_DESC')}
                  >
                    <Input
                      name="name"
                      autoFocus={true}
                      maxLength={63}
                      style={{ maxWidth: 'none' }}
                    />
                  </Form.Item>
                </Column>
                <Column></Column>
              </Columns>
            </Form.Item>
            <Form.Item>
              <Checkbox
                name="default"
                value="true"
                onClick={() => useAsDefaultLicense()}
              >
                {t('RESOURCES_LICENSE_DEFAULT_USE')}
              </Checkbox>
            </Form.Item>
            <Form.Item
              className={styles.textarea}
              label={t('RESOURCES_LICENSE_KEY')}
              rules={[{ required: true, message: t('RESOURCES_LICENSE_KEY_EMPTY_DESC') }]}
            >
              <TextArea
                name="payload"
                rows="8"
              />
            </Form.Item>
            <Form.Item
              className={styles.textarea}
              label={t('RESOURCES_DESCRIPTION')}
              desc={t('DESCRIPTION_DESC')}
            >
              <TextArea
                name="description"
                maxLength={256}
                defaultValue=""
              />
            </Form.Item>

          </div>

          {/* Footer */}
          <div className={styles['modal-footer']}>
            {fnGetModalFooter()}
          </div>

        </Form>
      </Modal>

    </>
  );
};

export default RegistModal

