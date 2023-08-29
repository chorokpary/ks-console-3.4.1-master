import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel } from 'components/Base'
import { Icon, Button, Notify } from '@kube-design/components'

import styles from './index.scss'

const Status = (props) => {

  const store = props.detailStore;

  return (
    <>  
       <Panel title={"외부 네트워크"}>
        <div className={styles.wrapper}>
          <div className={classnames(styles.item)}>
            <div className={styles.icon}>
              <Icon name="network-router" size={40} />         
            </div>
            <div className={classnames(styles.box_title, styles.name)}>
              <div>KUBEVIR</div>
              <p>이름</p>
            </div>
            <div className={styles.box_title}>
              <div>KUBEVIR</div>
              <p>유형</p>
            </div>
            <div className={styles.box_title}>
              <div>KUBEVIR</div>
              <p>IP(네트워크)</p>
            </div>
          </div>
        </div>
      </Panel>
       
    </>
  );
};

export default inject('detailStore')(observer(Status))

