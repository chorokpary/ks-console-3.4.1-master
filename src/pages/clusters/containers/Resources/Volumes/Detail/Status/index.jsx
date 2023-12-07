import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

import styles from './index.scss'

const Status = (props) => {

  const store = props.detailStore;

  const [id, setId] = useState()

  useEffect(() => {
    setId(store.detail.volume?.used_by_vmi)
  }, [id])

  return (
    <>
      {!!id &&
        <div>
          <DetailVmList type={t('RESOURCES_VOLUME')} variables='id' id={id} />
        </div>
      }
      {!!!id &&
        <div>
          <DetailVmList type={t('RESOURCES_VOLUME')} variables='id' id={id} />
        </div>
      }
    </>
  );
};

export default inject('detailStore')(observer(Status))

