import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Card } from 'components/Base'
import { Button, Notify } from '@kube-design/components'

import styles from './index.scss'

const Information = (props) => {

  const store = props.detailStore;

  return (
    <>  
        <div>
          <div className={styles.defaultWrapper}>
                구성 정보
          </div>
      </div>         
    </>
  );
};

export default inject('detailStore')(observer(Information))

