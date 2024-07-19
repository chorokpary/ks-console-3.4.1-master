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

import { getIndexRoute } from 'utils/router.config'

import Status from './Status'
import Information from './Information'
import Monitoring from './Monitoring'
import GpuMonitoring from './GpuMonitoring'
import Event from './Event'
import Snapshot from './Snapshot'
import Clone from './Clone'

const PATH = '/clusters/:cluster/vms/:name/:id'

export default [
  {
    path: `${PATH}/status`,
    title: t('RESOURCES_STATE'),
    component: Status,
    exact: true,
  },
  {
    path: `${PATH}/information`,
    title: t('RESOURCES_CONFIGURATION_INFORMATION'),
    component: Information,
    exact: true,
  },
  {
    path: `${PATH}/monitoring`,
    title: t('RESOURCES_MONITORING'),
    component: Monitoring,
    exact: true,
  },
  {
    path: `${PATH}/gpu-monitoring`,
    title: t('RESOURCES_GPU_MONITORING'),
    component: GpuMonitoring,
    exact: true,
  },
  {
    path: `${PATH}/event`,
    title: t('RESOURCES_EVENT'),
    component: Event,
    exact: true,
  },
  {
    path: `${PATH}/snapshot`,
    title: t('RESOURCES_SNAPSHOT'),
    component: Snapshot,
    exact: true,
  },
  {
    path: `${PATH}/clone`,
    title: t('RESOURCES_CLONE_LOG'),
    component: Clone,
    exact: true,
  },
  getIndexRoute({ path: PATH, to: `${PATH}/status`, exact: true }),
]
