/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { get } from 'lodash'

import { Panel } from 'components/Base'
import ReplicaStatus from './Status'

import styles from './index.scss'
import axios from "axios";

export default class HPACard extends React.Component {
  static propTypes = {
    module: PropTypes.string,
    detail: PropTypes.array,
    names: PropTypes.array,
    text: PropTypes.object,
    enableScale: PropTypes.bool,
    onScale: PropTypes.func,
  }

  static defaultProps = {
    module: 'deployments',
    enableScale: true,
    onScale() {},
  }

  fnGetStatus = (idx) => {
    const { module, detail, names, text, enableScale } = this.props
    let status = {}

    switch (module) {
        default:
        case 'deployments': {
        status = {
            current: detail.state[idx].unavailableNums || 0,
            desire: detail.state[idx].nums || 0,
        }
        break
        }
        case 'statefulsets': {
        status = {
            current: get(detail.state[idx], 'status.currentReplicas', detail.state[idx].readyNums),
            desire: detail.state[idx].nums || 0,
        }
        break
        }
        case 'daemonsets': {
        status = {
            current: get(detail.state[idx], 'status.numberReady', 0),
            desire: get(detail.state[idx], 'status.desiredNumberScheduled', 0),
        }
        break
        }
    }

    status.onScale = enableScale ? (idx>0 ? this.handleReplicaChange: null) : null //master는 scale수정 불가
    status.name = names[idx]
    status.text = text

    return status
  }

  handleReplicaChange = newReplicas => {
    if (newReplicas >= 0) {
      this.props.onScale(newReplicas)
      this.putScale(newReplicas)
    }
  }

  putScale = async (newReplicas) => {
    if (newReplicas) {
      const replicas = { "replicas": newReplicas }
      const response = await axios.put(`/edgetron/resources/capk/clusters/${this.props.detail?.cluster?.name}/scale`, { scale: replicas });
      if (response.status === 200) {
          setTimeout(async () => { await this.props.onFetchData() }, 500)
      }
    }
  }

    render() {
    
    const { className } = this.props

    return (
      <Panel className={classnames(styles.replica, className)}>
        <div className={styles.replicaCount}>
           {this.props.names.map((obj, idx) => (<div  style={{ marginRight : 30}}><ReplicaStatus {...this.fnGetStatus(idx)}/></div>))}
        </div>
      </Panel>
    )
  }
}
