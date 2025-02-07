import React from 'react'
import { observer, inject } from 'mobx-react'
import DetailVmList from 'pages/projects/containers/Resources/components/DetailVmList'
import DetailKaasListFlavor from 'pages/projects/containers/Resources/components/DetailKaasListFlavor'

const Status = props => {
  return (
    <>
      {/* 가상 머신 상세 관련 샘플 */}
      <DetailVmList
        type="Flavor"
        variables="flavor_object"
        name={props.match.params.name}
        {...props.match.params}
      />
      <DetailKaasListFlavor
        type="Flavor"
        variables="flavor"
        name={props.match.params.name}
        {...props.match.params}
      />
    </>
  )
}

export default inject('detailStore')(observer(Status))
