/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
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
import { observer, inject } from 'mobx-react'

import { Panel } from 'components/Base'
import DeploymentCard from './DeploymentCard'

import styles from './index.scss'

@inject('detailStore')
@observer
export default class Status extends React.Component {
  constructor(props) {
    super(props)

    this.store = props.detailStore
  }

  get cluster() {
    return this.props.match.params.cluster
  }

  renderDeployments() {
    const { deploy } = this.store.detail.gpunode
    const container_toolkit = { name: "container_toolkit", flag: deploy.container_toolkit }
    const dcgm = { name: "dcgm", flag: deploy.dcgm }
    const dcgm_exporter = { name: "dcgm_exporter", flag: deploy.dcgm_exporter }
    const device_plugin = { name: "device_plugin", flag: deploy.device_plugin }
    const operator_validator = { name: "operator_validator", flag: deploy.operator_validator }
    const mig_manager = { name: "mig_manager", flag: deploy.mig_manager }

    return (
      <Panel title={t('RESOURCES_GPU_DEPLOY_STATUS')}>
        <div className={styles.deployments}>
	  <DeploymentCard key="container_toolkit" data={container_toolkit} />
	  <DeploymentCard key="dcgm" data={dcgm} />
	  <DeploymentCard key="dcgm_exporter" data={dcgm_exporter} />
	  <DeploymentCard key="device_plugin" data={device_plugin} />
	  <DeploymentCard key="operator_validator" data={operator_validator} />
	  <DeploymentCard key="mig_manager" data={mig_manager} />
        </div>
      </Panel>
    )
  }

  render() {
    return (
      <div className={styles.main}>
        {this.renderDeployments()}
      </div>
    )
  }
}

// export default inject('detailStore')(observer(Status))
