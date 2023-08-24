
import { get } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { computed } from 'mobx'
import { observer } from 'mobx-react'

import { Form, Input, Select, TextArea } from '@kube-design/components'
import { Modal } from 'components/Base'
import { isSystemRole } from 'utils'
import RoleStore from 'stores/role'

import { Card } from 'components/Base'

import styles from './index.scss'

const RegistModal = (props) => {

  const store = props.RoleStore;

  console.log("store : "+ store)

  return (
 
      <Modal.Form
        title={t('1')}
        icon="human"
        width={691}
      >
       
       </Modal.Form>

  );
};

export default observer(RegistModal)