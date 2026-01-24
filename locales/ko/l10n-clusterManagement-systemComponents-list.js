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
  SYSTEM_COMPONENT_PL: '시스템 구성 요소',
  SERVICE_COMPONENTS_DESC: '시스템 구성 요소는 다양한 기능을 제공하는 Petasus AI Cloud 시스템의 소프트웨어 구성 요소입니다. 이 페이지에서 서비스 구성 요소의 실행 상태를 볼 수 있습니다.',
  // KubeSphere
  STOPPED: '중지됨',
  RUNNING_TIME: '실행 시간',
  KS_CONSOLE_DESC: 'Petasus AI Cloud 콘솔 서비스를 제공합니다.',
  KS_APISERVER_DESC: '클러스터 관리를 위한 REST API를 제공합니다. 이 구성 요소는 클러스터 구성 요소와 클러스터 보안 제어 간의 통신에도 사용됩니다.',
  OPENLDAP_DESC: '사용자 정보를 중앙 집중식으로 저장하고 관리합니다.',
  REDIS_DESC: '데이터베이스, 캐시 및 메시지 브로커로 사용되는 오픈 소스, 메모리 내 데이터 구조 저장소입니다.',
  TOWER_DESC: '프록시를 통한 클러스터 간의 네트워크 연결에 사용되는 도구입니다.',
  KS_CONTROLLER_MANAGER_DESC: '서비스 로직을 구현합니다. 이 구성 요소는 워크스페이스가 생성될 때 사용 권한을 생성하고 서비스 전략에 대한 Istio 구성을 생성합니다.',
  AUTHENTIK_REDIS_DESC: 'Authentik의 세션 정보, 캐시, 비동기 작업(Celery)을 관리하는 Redis의 메인 노드입니다.',
  AUTHENTIK_REDIS_HL_DESC: 'Authentik의 Redis 파드들 간의 내부 통신이나 상태 확인을 위해 사용하는 헤드리스 서비스입니다.',
  AUTHENTIK_SERVER_DESC: 'Authentik의 핵심 엔진입니다. 웹 인터페이스, API 서버, 그리고 전반적인 인증 로직을 처리합니다.',
  AUTHENTIK_POSTGRESQL_DESC: 'Authentik의 모든 설정, 사용자 계정 정보, 토큰 등이 영구적으로 저장되는 메인 데이터베이스입니다.',
  AUTHENTIK_POSTGRESQL_HL_DESC: 'Authentik의 PostgreSQL의 Headless(HL) 서비스입니다. 주로 쿠버네티스 환경에서 데이터베이스 클러스터링을 위해 개별 파드(Pod)에 직접 접근해야 할 때 사용됩니다.',
  AUTHENTIK_GATEWAYCONTROLLER_DESC: 'Authentik 아웃포스트(Outpost)나 게이트웨이의 생명주기를 관리하는 컨트롤러입니다.',
  GATEWAY_NGINX_PETASUS_CORE_DESC: 'Petasus AI Cloud 콘솔 접속에 맞춤화된 Nginx 기반의 핵심 게이트웨이 입니다.',
  REDFISH_EXPORTER_DESC: '서버 하드웨어의 상태 정보를 수집하여 Prometheus가 읽을 수 있는 형태로 변환해주는 도구입니다.',
  // Kubernetes
  COREDNS_DESC: 'Kubernetes 클러스터에 대한 서비스 검색 기능을 제공합니다.',
  METRICS_SERVER_DESC: '각 노드의 kubelet에서 메트릭을 수집하는 Kubernetes 모니터링 구성 요소입니다.',
  KUBE_SCHEDULER_DESC: '적절한 노드에 파드를 할당하는 Kubernetes 스케줄러',
  KUBE_SCHEDULER_SVC_DESC: '적절한 노드에 파드를 할당하는 Kubernetes 스케줄러입니다.',
  KUBE_CONTROLLER_MANAGER_SVC_DESC: 'Kubernetes와 함께 제공된 핵심 제어 루프를 내장한 데몬입니다.',
  // Istio
  JAEGER_COLLECTOR_DESC: '사이드카 데이터를 수집합니다. Istio의 사이드카는 jaeger-agent입니다.',
  JAEGER_COLLECTOR_HEADLESS_DESC: '사이드카 데이터를 수집합니다. Istio의 사이드카는 jaeger-agent입니다.',
  JAEGER_QUERY_DESC: '쿼리 요청을 수락하고, 백엔드 스토리지 시스템에서 추적을 검색하고, 웹 UI에 데이터를 표시합니다.',
  JAEGER_OPERATOR_METRICS_DESC: '운영자에게 모니터링 메트릭을 제공합니다.',
  // Monitoring
  MONITORING: '모니터링',
  PROMETHEUS_K8S_DESC: '노드, 워크로드 및 API 개체의 모니터링 데이터를 제공합니다.',
  NODE_EXPORTER_DESC: 'Prometheus에 모든 클러스터 노드의 모니터링 데이터를 제공합니다.',
  KUBE_STATE_METRICS_DESC: 'Kubernetes API 서버에서 노드, 워크로드, 파드 등의 클러스터 API 개체의 상태를 확인하고 Prometeus에서 사용할 모니터링 데이터를 생성합니다.',
  PROMETHEUS_OPERATED_DESC: '모든 Prometheus 인스턴스에 해당하는 서비스로, Prometheus Operator에서 사용합니다.',
  PROMETHEUS_OPERATOR_DESC: 'Prometeus 인스턴스를 관리합니다.',
  ALERTMANAGER_OPERATED_DESC: 'Alertmanager와 Prometheus를 통합하는 데 사용되는 Alertmanager 서비스입니다.',
  ALERTMANAGER_MAIN_DESC: 'Alertmanager 웹 UI 서비스입니다.',
  NOTIFICATION_MANAGER_SVC_DESC: '이메일, WeChat 메시지 및 Slack 메시지와 같은 메시지 프로그램에 알림을 보내기 위한 인터페이스를 제공합니다.',
  NOTIFICATION_MANAGER_CONTROLLER_METRICS_DESC: 'Notification Manager 컨트롤러에 내부 모니터링 데이터를 제공합니다.',
  // Logging
  LOGGING: '로깅',
  ELASTICSEARCH_LOGGING_DATA_DESC: '데이터 저장, 백업 및 검색과 같은 ElasticSearch 서비스를 제공합니다.',
  ELASTICSEARCH_LOGGING_DISCOVERY_DESC: 'ElasticSearch의 클러스터 관리 서비스를 제공합니다.',
  LOGSIDECAR_INJECTOR_ADMISSION_DESC: '디스크 로그 수집을 위해 사이드카 컨테이너를 파드에 자동으로 주입합니다.',
  KS_EVENTS_ADMISSION_DESC: '이벤트 규칙 관리를 위한 인증 Webhook을 제공합니다.',
  KS_EVENTS_RULER_DESC: '필터링 및 알림 기능을 제공하는 이벤트 규칙 엔진 서비스입니다.',
  KUBE_AUDITING_WEBHOOK_SVC_DESC: '감사 수집, 비교, 퍼시스턴스 및 알림에 사용됩니다.',
  // DevOps
  S2IOPERATOR_METRICS_SERVICE_DESC: '기본 모니터링 데이터를 제공하는 S2I 모니터링 서비스입니다.',
  WEBHOOK_SERVER_SERVICE_DESC: 'S2I에 대한 기본값 및 인증 webhook을 제공합니다.',
  // KubeVirt
  VIRTUALIZATION: '가상화',
  VIRT_EXPORTPROXY_DESC: '인증된 사용자에게 VM 데이터 액세스에 대한 엔드포인트를 제공합니다.',
  VIRT_API_DESC: '가상 머신을 정의하고 관리하기 위한 Kubernetes 가상화 API 및 런타임을 제공합니다.',
  KUBEVIRT_OPERATOR_WEBHOOK_DESC: 'Kubernetes 가상화 오퍼레이터를 위한 Webhook 입니다.',
  KUBEVIRT_PROMETHEUS_METRICS_DESC: '가상 머신을 생성하기 위한 Kubernetes 가상화 컴포넌트들입니다.',
  VIRT_VNC_DESC: 'Kubernetes 가상화를 위한 웹기반 VNC 입니다.',
  CDI_PROMETHEUS_METRICS_DESC: '가상 머신 이미지를 관리하기 위한 CDI(Containerized Data Importer) 구성 요소들을 포함하고 있습니다.',
  CDI_UPLOADPROXY_DESC: '이 구성 요소를 사용하면 가상 시스템 이미지를 Kubernetes 퍼시스턴트 볼륨에 업로드할 수 있습니다.',
  CDI_API_DESC: '가상 머신 이미지를 가져오고 관리하기 위한 컨테이너형 데이터 임포터 API 및 런타임을 제공합니다.',
  // CAPI
  CAPI_WEBHOOK_SERVICE_DESC: '선언형 Kubernetes 스타일 API를 이용하여 클러스터를 생성, 설정 및 관리할 수 있도록 합니다.',
  CAPK_WEBHOOK_SERVICE_DESC: 'Kubevirt를 인프라 프로바이더로 사용하여 테넌트 Kubernetes 클러스터를 프로비저닝하는 데 필요한 가상 리소스를 제공합니다.',
  CAPI_KUBEADM_BOOTSTRAP_WEBHOOK_SERVICE_DESC: 'Kubernetes 노드를 부트스트랩하는데 필요한 데이터를 생성해줍니다.',
  CAPI_KUBEADM_CONTROL_PLANE_WEBHOOK_SERVICE_DESC: '핵심 Kubernetes 컴포넌트들로 구성된 Kubernetes 제어 평면을 인스턴스화합니다.',
  CERT_MANAGER_DESC: 'Kubernetes 클러스터에서 인증서 및 인증서 발급자를 리소스 유형으로 추가하고 해당 인증서의 획득, 갱신 및 사용 프로세스 간소화해줍니다.',
  CERT_MANAGER_WEBHOOK_DESC: 'Cert-manager에서 사용되는 webhook입니다.',
  // Network
  NETWORK: '네트워크',
  CLUSTER_NETWORK_ADDONS_OPERATOR_PROMETHEUS_METRICS_DESC: '가상 머신 및 컨테이너에 대한 네트워크 연결을 제공하기 위한 CNI 플러그인 집합입니다.',
  // Storage
  STORAGE: '스토리지',
  HOSTPATH_PROVISIONER_OPERATOR_WEBHOOK_SERVICE_DESC: 'Kubevirt의 호스트경로 프로비저너를 배포하기 위한 오퍼레이터입니다.',
  HPP_PROMETHEUS_METRICS_DESC: '멀티 노드를 지원하는 Kubernetes 호스트 경로 프로바이더 입니다.',
  LONGHORN_ADMISSION_WEBHOOK_DESC: 'Longhorn 스토리지를 위한 어드미션 제어를 제공합니다.',
  LONGHORN_CONVERSION_WEBHOOK_DESC: 'Longhorn 스토리지를 위한 컨버젼 제어를 제공합니다.',
  LONGHORN_FRONTEND_DESC: '웹 기반 Longhorn 대쉬보드를 제공합니다.',
  LONGHORN_BACKEND_DESC: 'Kubernetes CSI 드라이버를 포함하는 Longhorn 오케스트레이터입니다.',
  LONGHORN_RECOVERY_BACKEND_DESC: 'Longhorn 복제 관리 기능을 제공합니다.',
  LONGHORN_ENGINE_MANAGER_DESC: 'Longhorn 코어 컨트롤러/레플리카 로직을 제공합니다.',
  LONGHORN_REPLICA_MANAGER_DESC: '컨트롤러/복제품 인스턴스 라이프사이클 관리를 제공합니다.',
  CSI_ATTACHER_DESC: 'CSI 드라이버의 ControllerPublish 및 ControllerUnpublish 기능을 호출하여 노드에 볼륨을 Attach하는 사이드카 컨테이너입니다.',
  CSI_PROVISIONER_DESC: 'PersistentVolumeClaim 개체에 대한 Kubernetes API 서버를 감시하는 사이드카 컨테이너입니다.',
  CSI_RESIZER_DESC: 'PersistentVolumeClaim 개체 편집을 위한 Kubernetes API 서버를 감시하고 CSI 끝점에 대해 ControllerExpandVolume 작업을 트리거하는 사이드카 컨테이너입니다.',
  CSI_SNAPSHOTTER_DESC: 'VolumeSnapshotContent 개체를 감시하고 CSI 엔드포인트에 대해 CreateSnapshot 및 DeleteSnapshot 작업을 트리거합니다.',
  // Registry
  REGISTRY: '레지스트리',
  REGISTRY_HARBOR_CORE_DESC: '컨텐트를 저장, 서명 및 검색하는 클라우드 네이티브 레지스트리입니다.',
  REGISTRY_HARBOR_REGISTRY_DESC: '컨테이너 이미지를 저장하고 풀/푸쉬 작업을 처리하는 역할을 합니다.',
  REGISTRY_HARBOR_PORTAL_DESC: 'Web 기반 Harbor 대쉬보드를 제공합니다.',
  REGISTRY_HARBOR_DATABASE_DESC: 'Harbor 데이터베이스는 레지스트리 메타데이터를 저장합니다.',
  REGISTRY_HARBOR_REDIS_DESC: '레지스트리 세션 정보를 저장하는 내부 캐시입니다.',
  REGISTRY_HARBOR_EXPORTER_DESC: 'Harbor 서비스 건강 상태를 Prometheus에 Export 합니다.',
  REGISTRY_HARBOR_TRIVY_DESC: 'Harbor trivy는 레지스트리를 위한 포괄적이고 다용도적인 보안 스캐너입니다.',
  REGISTRY_HARBOR_JOBSERVICE_DESC: '이 구성 요소는 이미지 복제에 사용되며 자체 서비스를 구현하는데 사용 될 수도 있습니다.',
};
