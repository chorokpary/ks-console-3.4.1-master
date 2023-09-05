import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Card } from 'components/Base'
import { Button, Notify } from '@kube-design/components'

import styles from './index.scss'

const index = (props) => {

  const store = props.detailStore;

  return (
    <>  
        <div>
          <div className={styles.wrapper}>
              모니터링
          </div>
      </div>         



    </>
  );
};

export default inject('detailStore')(observer(index))

