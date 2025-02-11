import React from 'react'
import { observer, inject } from 'mobx-react'

import DetailKaasList from 'pages/projects/containers/Resources/components/DetailKaasList'

const Status = props => {
  return (
    <>
      <div>
        <DetailKaasList
          type={t('RESOURCES_KAAS_IMAGE')}
          variables="kube_image"
          name={props.match.params.name}
          project={props.match.params.namespace}
        />
      </div>
    </>
  )
}

export default inject('detailStore')(observer(Status))
