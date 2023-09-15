import { get, groupBy, isEmpty } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import axios from "axios";
import { Panel, Text } from 'components/Base'
import { Icon, Button, Notify } from '@kube-design/components'
import { TinyArea } from 'components/Charts'

import styles from './index.scss'

import * as common from 'utils/resources'
import { getAreaChartOps } from 'utils/monitoring'


const Status = (props) => {

  const store = props.detailStore;
  

  useEffect(() => {

     

  }, []);


  return (
    <>  
        <div>
          

      </div>         
    </>
  );
};

export default inject('detailStore')(observer(Status))

