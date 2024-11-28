import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'
import DetailMachineList from 'pages/clusters/containers/Resources/components/DetailMachineList'

const Status = props => {
  const store = props.detailStore

  const [id, setId] = useState()
  const [isManagedK8s, setIsManagedK8s] = useState(false)

  useEffect(() => {
    setId(store.detail.volume?.used_by_vmi)
    if (store.detail.volume?.managed_k8s === 'true') {
      setIsManagedK8s(true)
    }
  }, [id])

  return (
    <>
      {id && !isManagedK8s && (
        // used_by_vmi 가 VM 일 경우
        <div>
          <DetailVmList type={t('RESOURCES_VOLUME')} variables="volume" id={props.match.params.id} />
        </div>
      )}
      {!id && (
        // used_by_vmi 가 비어있는 경우
        <div>
          <DetailVmList type={t('RESOURCES_VOLUME')} variables="volume" id={id} />
        </div>
      )}
      {id && isManagedK8s && (
        // used_by_vmi 가 KaaS 일 경우
        <div>
          <DetailMachineList
            type={t('RESOURCES_VOLUME')}
            variables="volume"
            name={id}
          />
        </div>
      )}
    </>
  )
}

export default inject('detailStore')(observer(Status))
