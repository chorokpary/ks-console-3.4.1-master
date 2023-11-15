import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Button, Notify } from '@kube-design/components'

import styles from './index.scss'

const Status = (props) => {

  const store = props.detailStore;


  return (
    <>  
        <div>
          <div className={styles.defaultWrapper}>
              Content
          </div>

      </div>         
    </>
  );
};

export default inject('detailStore')(observer(Status))

