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

module.exports = {
  // Banner
  SYSTEM_COMPONENT_PL: 'System Components',
  SERVICE_COMPONENTS_DESC: 'System components are software components in the KubeSphere system, which provide various functions. You can view the running status of services components on this page.',
  // KubeSphere
  STOPPED: 'Stopped',
  RUNNING_TIME: 'Running time',
  KS_CONSOLE_DESC: 'Provides KubeSphere console services.',
  KS_APISERVER_DESC: 'Provides REST APIs for cluster management. This component is also used for communication between cluster components and cluster security control.',
  OPENLDAP_DESC: 'Stores and manages user information in a centralized manner.',
  REDIS_DESC: 'Open-source, in-memory data structure store, which is used as a database, cache, and message broker.',
  TOWER_DESC: 'Tool used for network connection between clusters over proxy.',
  KS_CONTROLLER_MANAGER_DESC: 'Implements service logic. This component creates permissions when a workspace is created and generates Istio configuration for service strategies.',
  // Kubernetes
  COREDNS_DESC: 'Provides the service discovery function for the Kubernetes cluster.',
  METRICS_SERVER_DESC: 'Kubernetes monitoring component that collects metrics from kubelet of each node.',
  KUBE_SCHEDULER_DESC: 'Kubernetes scheduler that assigns pods to appropriate nodes.',
  KUBE_SCHEDULER_SVC_DESC: 'Kubernetes scheduler that assigns pods to appropriate nodes.',
  KUBE_CONTROLLER_MANAGER_SVC_DESC: 'Daemon that embeds the core control loops shipped with Kubernetes.',
  // Istio
  JAEGER_COLLECTOR_DESC: 'Collects sidecar data. The sidecar of Istio is jaeger-agent.',
  JAEGER_COLLECTOR_HEADLESS_DESC: 'Collects sidecar data. The sidecar of Istio is jaeger-agent.',
  JAEGER_QUERY_DESC: 'Accepts query requests, retrieves traces from the backend storage system, and displays the data on the web UI.',
  JAEGER_OPERATOR_METRICS_DESC: 'Provides monitoring metrics for Operator.',
  // Monitoring
  MONITORING: 'Monitoring',
  PROMETHEUS_K8S_DESC: 'Provides monitoring data of nodes, workloads, and API objects.',
  NODE_EXPORTER_DESC: 'Provides monitoring data of all cluster nodes for Prometheus.',
  KUBE_STATE_METRICS_DESC: 'Listens on the Kubernetes API server to obtain the status of cluster API objects such as nodes, workloads, and pods, and generates monitoring data for Prometheus.',
  PROMETHEUS_OPERATED_DESC: 'Service corresponding to all Prometheus instances, which is used internally by Prometheus Operator.',
  PROMETHEUS_OPERATOR_DESC: 'Manages Prometheus instances.',
  ALERTMANAGER_OPERATED_DESC: 'Alertmanager service used for integrating Alertmanager with Prometheus.',
  ALERTMANAGER_MAIN_DESC: 'Alertmanager Web UI service.',
  NOTIFICATION_MANAGER_SVC_DESC: 'Provides interfaces for sending notifications such as emails, WeChat messages, and Slack messages.',
  NOTIFICATION_MANAGER_CONTROLLER_METRICS_DESC: 'Provides internal monitoring data for Notification Manager Controller.',
  // Logging
  LOGGING: 'Logging',
  ELASTICSEARCH_LOGGING_DATA_DESC: 'Provides Elasticsearch services such as data storage, backup, and searching.',
  ELASTICSEARCH_LOGGING_DISCOVERY_DESC: 'Provides Elasticsearch cluster management services.',
  LOGSIDECAR_INJECTOR_ADMISSION_DESC: 'Automatically injects sidecar containers into pods for disk log collection.',
  KS_EVENTS_ADMISSION_DESC: 'Provides the authentication webhook for event rule management.',
  KS_EVENTS_RULER_DESC: 'Event rule engine service that provides filtering and alerting features.',
  KUBE_AUDITING_WEBHOOK_SVC_DESC: 'Used for audit collection, comparison, persistence, and alerting.',
  // DevOps
  S2IOPERATOR_METRICS_SERVICE_DESC: 'S2I monitoring service that provides basic monitoring data.',
  WEBHOOK_SERVER_SERVICE_DESC: 'Provides the default values and authentication webhook for S2I.',
  // KubeVirt
  VIRT_EXPORTPROXY_DESC: 'Provides an endpoint for access to VM data for authorized users.',
  VIRT_API_DESC: 'Kubernetes Virtualization API and runtime in order to define and manage virtual machines.',
  KUBEVIRT_OPERATOR_WEBHOOK_DESC: 'A webhook for Kubernetes Virtualization operator.',
  KUBEVIRT_PROMETHEUS_METRICS_DESC: 'A set of Kubernetes Virtualzation components for launching virtual machines.',
  VIRT_VNC_DESC: 'A web based VNC for Kubernetes Virtualization.',
  // CAPI
  CAPI_WEBHOOK_SERVICE_DESC: 'Brings declarative Kubernetes-style APIs to cluster creation, configuration and management.',
  CAPK_WEBHOOK_SERVICE_DESC: 'Provides virtual resources for provisioning tanent Kubernetes cluster using kubevirt as a infrastructure provider.',
  CAPI_KUBEADM_BOOTSTRAP_WEBHOOK_SERVICE_DESC: 'Generates bootstrap data that is used to bootstrap a Kubernetes node.',
  CAPI_KUBEADM_CONTROL_PLANE_WEBHOOK_SERVICE_DESC: 'Instantiates a Kubernetes control plane consisting of core Kubernetes services.',
  CERT_MANAGER_DESC: 'Adds certificates and certificate issuers as resource types in Kubernetes clusters, and simplifies the process of obtaining, renewing and using those certificates.',
  CERT_MANAGER_WEBHOOK_DESC: 'A webhook for cert-manager.',
  // Longhorn
  LONGHORN_ADMISSION_WEBHOOK_DESC: 'Provides longhorn admission control.',
  LONGHORN_CONVERSION_WEBHOOK_DESC: 'Provides longhorn conversion control.',
  LONGHORN_FRONTEND_DESC: 'A web based longhorn dashboard.',
  LONGHORN_BACKEND_DESC: 'Longhorn orchestration, includes CSI driver for Kubernetes.',
  LONGHORN_RECOVERY_BACKEND_DESC: 'Provides longhorn replication management.',
  LONGHORN_ENGINE_MANAGER_DESC: 'Provides longhorn core controller/replica logic.',
  LONGHORN_REPLICA_MANAGER_DESC: 'Provides controller/replica instance lifecycle management.',
  CSI_ATTACHER_DESC: 'This component is a sidecar container that attaches volumes to nodes by calling ControllerPublish and ControllerUnpublish functions of CSI drivers.',
  CSI_PROVISIONER_DESC: 'This component is a sidecar container that watches the Kubernetes API server for PersistentVolumeClaim objects',
  CSI_RESIZER_DESC: 'This component is a sidecar container that watches the Kubernetes API server for PersistentVolumeClaim object edits and triggers ControllerExpandVolume operations against a CSI endpoint.',
  CSI_SNAPSHOTTER_DESC: 'This component watches VolumeSnapshotContent objects and triggers CreateSnapshot and DeleteSnapshot operations against a CSI endpoint.',
  // Harbor
  REGISTRY_HARBOR_CORE_DESC: 'A cloud native registry that stores, signs, and scans content.',
  REGISTRY_HARBOR_REGISTRY_DESC: 'The component is responsible for storing Docker images and processing pull/push operations.',
  REGISTRY_HARBOR_PORTAL_DESC: 'Harbor is an open source trusted cloud-native registry to store, sign, and scan content.',
  REGISTRY_HARBOR_DATABASE_DESC: 'A harbor database stores the registry metadata.',
  REGISTRY_HARBOR_REDIS_DESC: 'An internal cache for storing registry session information.',
  REGISTRY_HARBOR_EXPORTER_DESC: 'This component exports harbor service health to Prometheus.',
  REGISTRY_HARBOR_TRIVY_DESC: 'Harbor trivy is a comprehensive and versatile security scanner for registry.',
  REGISTRY_HARBOR_JOBSERVICE_DESC: 'This component is used for image replication, and also lets you implement your own services.',
}
