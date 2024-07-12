import React from 'react'
import { observer, inject } from 'mobx-react'

import DetailKaasList from 'pages/clusters/containers/Resources/components/DetailKaasList'

const Status = props => {
  return (
    <>
      <div>
        <DetailKaasList
          type={t('RESOURCES_KAAS_IMAGE')}
          variables="kube_image"
          name={props.match.params.name}
        />
      </div>
    </>
  )
}

export default inject('detailStore')(observer(Status))
