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

import DeploymentDetail from 'projects/containers/Deployments/Detail'
import StatefulSetDetail from 'projects/containers/StatefulSets/Detail'
import DaemonSetDetail from 'projects/containers/DaemonSets/Detail'
import JobDetail from 'projects/containers/Jobs/Detail'
import CronJobDetail from 'projects/containers/CronJobs/Detail'
import ServiceDetail from 'projects/containers/Services/Detail'
import RouteDetail from 'projects/containers/Routes/Detail'
import SecretDetail from 'projects/containers/Secrets/Detail'
import ConfigMapDetail from 'projects/containers/ConfigMaps/Detail'
import ServiceAccountDetail from 'projects/containers/ServiceAccounts/Detail'
import PodDetail from 'projects/containers/Pods/Detail'
import ContainerDetail from 'projects/containers/Pods/Containers/Detail'
import NetworkPoliciesDetail from 'projects/containers/Network/Policies/Detail'
import Volume from 'projects/containers/Volumes/Detail'
import VolumeSnapshotsDetail from 'projects/containers/VolumeSnapshots/Detail'
import AlertPolicyDetail from 'projects/containers/Alerting/Policies/Detail'
import VolumeSnapshotContent from '../containers/Storage/VolumeSnapshots/SnapshotContent/Detail'
import SnapshotClassesDetail from '../containers/Storage/VolumeSnapshotClasses/Detail'
import PV from '../containers/Storage/PV/detail'
import ProjectLayout from '../layouts/Project'

import NodeDetail from '../containers/Nodes/Detail'
import EdgeNodeDetail from '../containers/EdgeNodes/Detail'

import ProjectDetail from '../containers/Projects/Detail'
import StorageClassDetail from '../containers/Storage/StorageClasses/Detail'

import ComponentDetail from '../containers/ServiceComponents/Detail'
import CustomResourceDetail from '../containers/CustomResources/Detail'
import RoleDetail from '../containers/Roles/Detail'
import LogCollectionDetail from '../containers/LogCollections/Detail'
import IPPoolDetail from '../containers/Network/IPPools/Detail'
import GatewayDetail from '../containers/Gateway/Detail'

// MM3 Detail Page
import KeypairDetail from '../containers/Resources/Keypairs/Detail'
import ImageDetail from '../containers/Resources/Images/Detail'
import RouterDetail from '../containers/Resources/Routers/Detail'
import FlavorDetail from '../containers/Resources/Flavors/Detail'
import SecurityGroupDetail from '../containers/Resources/SecurityGroups/Detail'
import NetworkDetail from '../containers/Resources/Networks/Detail'
import FloatingIpDetail from '../containers/Resources/FloatingIp/Detail'
import VmDetail from '../containers/Resources/Vms/Detail'
import ContainerImageDetail from '../containers/Resources/ContainerImages/Detail'
import ContainerResourceDetail from '../containers/Resources/ContainerResource/Detail'
import NodepoolResourceDetail from '../containers/Resources/NodepoolResource/Detail'
import VolumeDetail from '../containers/Resources/Volumes/Detail'
import HostDeviceDetail from '../containers/Resources/HostDevices/Detail'
import MediatedDeviceDetail from '../containers/Resources/MediatedDevices/Detail'
import LoadBalancerDetail from '../containers/Resources/LoadBalancers/Detail'
import BareMetalDetail from '../containers/Resources/BareMetal/Detail'
import SrIovDetail from '../containers/Resources/Sriov/Detail'
import ImageBuildDetail from '../containers/Resources/ImageBuild/Detail'
import ComputingAppDeployDetail from '../containers/Resources/ComputingAppDeploy/Detail'
import ClusterFaultSetting from '../containers/Resources/ClusterFault/Setting'
import GpuNodeDetail from '../containers/Resources/GpuNodes/Detail'

const PATH = '/clusters/:cluster'

export default [
  {
    path: `${PATH}/nodes/:node`,
    component: NodeDetail,
  },
  {
    path: `${PATH}/edgenodes/:node`,
    component: EdgeNodeDetail,
  },
  {
    path: `${PATH}/customresources/:name`,
    component: CustomResourceDetail,
  },
  {
    path: `${PATH}/roles/:name`,
    component: RoleDetail,
  },
  {
    path: [`${PATH}/alert-rules/builtin/:name`, `${PATH}/alert-rules/:name`],
    component: AlertPolicyDetail,
  },
  {
    path: `${PATH}/log-collections/:component/:name`,
    component: LogCollectionDetail,
  },
  {
    path: `${PATH}/components/:namespace/:name`,
    component: ComponentDetail,
  },
  {
    path: `${PATH}/gateways/:component/:gatewayName`,
    component: GatewayDetail,
  },
  {
    path: `${PATH}/storageclasses/:name`,
    component: StorageClassDetail,
  },
  {
    path: `${PATH}/ippools/:name`,
    component: IPPoolDetail,
  },
  {
    path: `${PATH}/pv/:name`,
    component: PV,
  },
  {
    path: `${PATH}/volume-snapshot-content/:name`,
    component: VolumeSnapshotContent,
  },
  {
    path: `${PATH}/volume-snapshot-classes/:name`,
    component: SnapshotClassesDetail,
  },
  {
    path: `${PATH}/projects/:namespace`,
    component: ProjectLayout,
    routes: [
      {
        path: `${PATH}/projects/:namespace/deployments/:name`,
        component: DeploymentDetail,
      },
      {
        path: `${PATH}/projects/:namespace/statefulsets/:name`,
        component: StatefulSetDetail,
      },
      {
        path: `${PATH}/projects/:namespace/daemonsets/:name`,
        component: DaemonSetDetail,
      },
      {
        path: `${PATH}/projects/:namespace/jobs/:name`,
        component: JobDetail,
      },
      {
        path: `${PATH}/projects/:namespace/cronjobs/:name`,
        component: CronJobDetail,
      },
      {
        path: `${PATH}/projects/:namespace/services/:name`,
        component: ServiceDetail,
      },
      {
        path: `${PATH}/projects/:namespace/ingresses/:name`,
        component: RouteDetail,
      },
      {
        path: `${PATH}/projects/:namespace/secrets/:name`,
        component: SecretDetail,
      },
      {
        path: `${PATH}/projects/:namespace/configmaps/:name`,
        component: ConfigMapDetail,
      },
      {
        path: `${PATH}/projects/:namespace/serviceaccounts/:name`,
        component: ServiceAccountDetail,
      },
      {
        path: `${PATH}/projects/:namespace/pods/:podName/containers/:containerName`,
        component: ContainerDetail,
      },
      {
        path: `${PATH}/projects/:namespace/pods/:podName`,
        component: PodDetail,
      },
      {
        path: `${PATH}/projects/:namespace/volume-snapshots/:name`,
        component: VolumeSnapshotsDetail,
      },
      {
        path: `${PATH}/projects/:namespace/volumes/:name`,
        component: Volume,
      },
      {
        path: `${PATH}/projects/:namespace/networkpolicies/:name`,
        component: NetworkPoliciesDetail,
      },
      {
        path: `${PATH}/projects/:namespace`,
        component: ProjectDetail,
      },
    ],
  },
  {
    path: `${PATH}/keypairs/:name/:id`,
    component: KeypairDetail,
  },
  {
    path: `${PATH}/images/:name`,
    component: ImageDetail,
  },
  {
    path: `${PATH}/routers/:name/:id`,
    component: RouterDetail,
  },
  {
    path: `${PATH}/flavors/:name`,
    component: FlavorDetail,
  },
  {
    path: `${PATH}/securitygroups/:name/:id`,
    component: SecurityGroupDetail,
  },
  {
    path: `${PATH}/networks/:name/:id`,
    component: NetworkDetail,
  },
  {
    path: `${PATH}/floatingip/:id`,
    component: FloatingIpDetail,
  },
  {
    path: `${PATH}/vms/:name/:id`,
    component: VmDetail,
  },
  {
    path: `${PATH}/containerimages/:name`,
    component: ContainerImageDetail,
  },
  {
    path: `${PATH}/containerresource/:name`,
    component: ContainerResourceDetail,
  },
  {
    path: `${PATH}/nodepoolresource/:clustername/:name`,
    component: NodepoolResourceDetail,
  },
  {
    path: `${PATH}/resourcesvolumes/:name/:id`,
    component: VolumeDetail,
  },
  {
    path: `${PATH}/hostdevices/:name`,
    component: HostDeviceDetail,
  },
  {
    path: `${PATH}/mediateddevices/:name`,
    component: MediatedDeviceDetail,
  },
  {
    path: `${PATH}/loadbalancers/:name/:id`,
    component: LoadBalancerDetail,
  },
  {
    path: `${PATH}/baremetalmonitoring/:name`,
    component: BareMetalDetail,
  },
  {
    path: `${PATH}/sriovs/:name`,
    component: SrIovDetail,
  },
  {
    path: `${PATH}/imagebuild/:name/:id`,
    component: ImageBuildDetail,
  },
  {
    path: `${PATH}/computingappdeploy/:name`,
    component: ComputingAppDeployDetail,
  },
  {
    path: `${PATH}/clusterfault/setting`,
    component: ClusterFaultSetting,
  },
  {
    path: `${PATH}/gpunodes/:name`,
    component: GpuNodeDetail,
  },
]
