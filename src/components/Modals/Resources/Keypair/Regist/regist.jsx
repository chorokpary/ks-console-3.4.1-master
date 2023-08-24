
import { get } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { computed } from 'mobx'
import { observer } from 'mobx-react'

import { Form, Input, Select, TextArea } from '@kube-design/components'
import { isSystemRole } from 'utils'

import { Card } from 'components/Base'

import styles from './index.scss'

const RegistModal = (props) => {

  const store = props.RoleStore;

  const userRules = [{ required: true, message: t('키페어를 입력해 주세요.') }]
  const publicKeyRules = [{ required: true, message: t('공개키를 입력해 주세요.') }]


  return (
    <>  
       <Form.Item
          label={t('이름')}
          desc={t('USERNAME_DESC')}
          rules={userRules}
        >
          <Input
            name="name"
            autoFocus={true}
            maxLength={63}
           
          />
        </Form.Item>
        <Form.Item
          className={styles.textarea}
          label={t('공개키')}
          desc={t('DESCRIPTION_DESC')}
          rules={publicKeyRules}
        >
          <TextArea
            name="publicKey"
            rows="5"
          />
        </Form.Item>
        <Form.Item
          className={styles.textarea}
          label={t('설명')}
          desc={t('DESCRIPTION_DESC')}
        >
          <TextArea
            name="description]"
            maxLength={256}
            rows="1"
          />
        </Form.Item>
    </>
  );
};

export default observer(RegistModal)