import React from 'react'
import { observer, inject } from 'mobx-react'
import DetailVmList from 'pages/projects/containers/Resources/components/DetailVmList'
import LbPanel from './LbPanel'
import { get, isEmpty } from 'lodash'

const Status = (props) => {
  const detail = get(props.detailStore.detail, 'floating_ip')
  if (detail.instance_type == 'vm') {
    return <DetailVmList type={t('RESOURCES_FLOATING_IP')} variables='id' id={detail.instance_id} />

  } else if (detail.instance_type == 'lb') {
    return <LbPanel type={t('RESOURCES_FLOATING_IP')} variables='id' id={detail.instance_id} />
  } else {
    return []
  }
};

export default inject('detailStore')(observer(Status))

