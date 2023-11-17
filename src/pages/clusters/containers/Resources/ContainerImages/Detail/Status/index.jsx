import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Card } from 'components/Base'
import { Button, Notify } from '@kube-design/components'
import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

import styles from './index.scss'

const Status = (props) => {

  const store = props.detailStore;

  return (
    <>
      <div>
        <DetailVmList type='KaaS 이미지' variables='kube_image' name={props.match.params.name} />
      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status))

