import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import DetailVmList from 'pages/clusters/containers/Resources/components/DetailVmList'

import styles from './index.scss'

const Status = (props) => {

  const store = props.detailStore;

  const [name, setName] = useState()

  useEffect(() => {
    setName(store.detail.volume?.used_by_vmi)
  }, [name])
  return (
    <>  
    {name && 
      <div>
        <DetailVmList type='볼륨' variables='name' name={name} />
      </div>        
    }
    </>
  );
};

export default inject('detailStore')(observer(Status))

