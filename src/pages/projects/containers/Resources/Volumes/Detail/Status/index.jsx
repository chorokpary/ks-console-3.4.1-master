import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import DetailVmList from 'pages/projects/containers/Resources/components/DetailVmList'
import DetailKaasList from 'pages/projects/containers/Resources/components/DetailKaasList'

import styles from './index.scss'

const Status = (props) => {

  const store = props.detailStore;

  const [id, setId] = useState()

  useEffect(() => {
    setId(store.detail.volume?.used_by_vmi)
  }, [id])

  return (
    <>

      {id && !id?.includes('control-plane') &&
        // used_by_vmi 가 VM 일 경우
        <div>
          <DetailVmList type={t('RESOURCES_VOLUME')} variables='volume' {...props.match.params} id={props.match.params.id} />
        </div>
      }
      {!id && !id?.includes('control-plane') &&
        // used_by_vmi 가 비어있는 경우
        <div>
          <DetailVmList type={t('RESOURCES_VOLUME')} variables='volume'{...props.match.params} id={id} />
        </div>
      }
      {id && id?.includes('control-plane') &&
        // used_by_vmi 가 KaaS 일 경우
        <div>
          <DetailKaasList type={t('RESOURCES_VOLUME')} variables='volume'{...props.match.params} name={id} />
        </div>
      }
    </>
  );
};

export default inject('detailStore')(observer(Status))

