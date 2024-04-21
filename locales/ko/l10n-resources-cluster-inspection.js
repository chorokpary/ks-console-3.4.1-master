module.exports = {
  CLUSTER_INSPECTION_MORNITORING: '클러스터 인스펙터',
  CLUSTER_INSPECTION_DESC:
    '클러스터 노드, 구성 요소 및 기타 구성이 모범 사례(Best Practice)를 준수하는지 여부를 확인합니다.',
  CLUSTER_INSPECTION_CLUSTER_STATUS: '클러스터 상태',
  CLUSTER_INSPECTION_CHECK_ALL_LIST: '전체 점검 항목',
  CLUSTER_INSPECTION_PASS: 'Pass',
  CLUSTER_INSPECTION_WARNING: 'Warning',
  CLUSTER_INSPECTION_DANGER: 'Danger',
  CLUSTER_INSPECTION_IGNORE: 'Ignore',
  CLUSTER_INSPECTION_CLUSTER_INFO: '클러스터 정보',
  CLUSTER_INSPECTION_K8S_VERSION: '쿠버네티스 버전',
  CLUSTER_INSPECTION_NODE: '클러스터 노드',
  CLUSTER_INSPECTION_PROJECT_CNT: '프로젝트 개수',
  CLUSTER_INSPECTION_WORKLOAD_CNT: '워크로드 개수',
  CLUSTER_INSPECTION_CLUSTER: '클러스터',
  CLUSTER_INSPECTION_PROJECT: '프로젝트',
  CLUSTER_INSPECTION_NAME: '이름',
  CLUSTER_INSPECTION_TYPE: '타입',
  CLUSTER_INSPECTION_STATUS: '상태',
  CLUSTER_INSPECTION_NO_DATA: '데이터가 없습니다.',
  CLUSTER_INSPECTION_DESCRIPTION: 'DESCRIPTION',
  CLUSTER_INSPECTION_SUGGEST: 'SUGGEST',
  CLUSTER_INSPECTION_LATEST_TIME: '최근 인스펙션 시간',

  //   KUBEEYE DATA
  CLUSTER_INSPECTION_DESC_PRIVILEDGEDALLOWED:
    'Linux에서 포드의 모든 컨테이너는 컨테이너 사양의 보안 컨텍스트에 있는 특권(Linux) 매개변수를 사용하여 특권 모드를 활성화할 수 있습니다. 이는 네트워크 스택 조작 및 장치 액세스와 같은 운영 체제 관리 기능을 사용하려는 컨테이너에 유용합니다.',
  CLUSTER_INSPECTION_SUGGEST_PRIVILEDGEDALLOWED: '특권 모드 비활성화',

  CLUSTER_INSPECTION_DESC_CANIMPERSONATEUSER:
    '\n사용자는 (Impersonation) 헤더 필드를 가장하여 다른 사용자로서 작업을 수행할 수 있습니다. 이 기능을 사용하면 인증으로 식별된 사용자 정보에 대한 요청을 수동으로 무시할 수 있습니다. 예를 들어 관리자는 이 기능을 사용하여 일시적으로 다른 사용자로 가장하여 요청이 거부되었는지 확인함으로써 인증 정책의 문제를 디버깅할 수 있습니다.\n가장 요청은 먼저 인증을 통해 요청하는 사용자로 식별된 다음 위장한 사용자의 사용자 정보\n',
  CLUSTER_INSPECTION_SUGGEST_CANIMPERSONATEUSER:
    '\n사용자 또는 사용자 그룹인 것처럼 가장하는 기능을 기반으로 해당 사용자 또는 사용자 그룹인 것처럼 모든 작업을 수행할 수 있습니다. 이러한 이유로 가장 작업은 네임스페이스에 바인딩되지 않습니다.',

  CLUSTER_INSPECTION_DESC_CANMODIFYWORKLOADS:
    '\n사용자에게는 워크로드를 생성, 수정, 삭제할 수 있는 권한이 있습니다.\n',
  CLUSTER_INSPECTION_SUGGEST_CANMODIFYWORKLOADS:
    '\nRBAC 권한 설정을 확인하여 불필요한 권한을 줄이세요.\n',

  CLUSTER_INSPECTION_DESC_NOCPULIMITS:
    '\nCPU 제한을 구성하면 컨테이너가 CPU를 너무 많이 사용하지 않습니다.\nCPU 제한을 설정하지 않으면 오작동하는 애플리케이션이 노드에서 사용 가능한 대부분의 CPU를 활용하게 되어 잠재적으로 다른 워크로드 속도가 느려지거나 클러스터 확장을 시도할 때 비용 초과가 발생할 수 있습니다. \n메모리 제한과 비교했을 때 CPU 조절은 애플리케이션에 충돌을 일으키지 않습니다. 대신 제한적입니다. 초당 특정 수의 작업만 실행할 수 있습니다.\n',
  CLUSTER_INSPECTION_SUGGEST_NOCPULIMITS:
    '\n컨테이너 사양당 CPU 제한을 추가합니다. CPU는 전체 CPU(예: 10 또는 25) 또는 보다 일반적으로 Millicpus(예: 1000m 또는 250m) 기준으로 설정할 수 있습니다.\n할당할 CPU 양은 사용자가 결정합니다. 귀하의 신청서에. CPU 제한을 너무 높게 설정하면 비용 초과가 발생할 수 있고, 너무 낮게 설정하면 애플리케이션이 제한될 수 있습니다.\n미션 크리티컬 또는 사용자 지향 애플리케이션의 경우 KubeEye는 더 높은 CPU 제한을 설정하여 오작동하는 애플리케이션만 제한할 것을 권장합니다.\n',

  CLUSTER_INSPECTION_DESC_NOCPUREQUESTS:
    '\nCPU 리소스 요청을 설정하면 kube-scheduler는 이 정보를 사용하여 포드를 예약할 노드를 결정합니다.\n',
  CLUSTER_INSPECTION_SUGGEST_NOCPUREQUESTS:
    '\n각 컨테이너 사양에 대한 CPU 리소스 요청을 추가하세요. CPU는 전체 CPU(예: 10 또는 25)에 따라 설정되거나 더 일반적으로는 Millicpus(예: 1000m 또는 250m)에 따라 설정될 수 있습니다.\n결정하는 것은 귀하에게 달려 있습니다. 애플리케이션에 할당할 CPU 양. CPU 제한을 너무 높게 설정하면 애플리케이션 예약에 실패할 수 있고, 너무 낮게 설정하면 애플리케이션이 리소스를 확보할 수 있습니다.\n미션 크리티컬 또는 사용자 지향 애플리케이션의 경우 KubeEye는 CPU 리소스 제한과 일관되게 CPU 리소스 요청을 설정할 것을 권장합니다. , 이는 애플리케이션 리소스 독점성을 보장합니다.\n',

  CLUSTER_INSPECTION_DESC_DANGEROUSCAPABILITIES:
    '\n응용 프로그램에 위험한 기능을 설정하면 응용 프로그램이 매우 높은 권한을 갖게 되고 심지어 호스트 컴퓨터에도 영향을 미치게 됩니다.\n',
  CLUSTER_INSPECTION_SUGGEST_DANGEROUSCAPABILITIES:
    '\nsecurityContext의 "NET_ADMIN", "SYS_ADMIN", "ALL"과 같은 위험한 기능은 금지됩니다.\n',

  CLUSTER_INSPECTION_DESC_HOSTIPCALLOWED:
    '\n포드 컨테이너가 호스트에서 IPC 네임스페이스를 공유할 수 있는지 여부를 제어합니다.\n',
  CLUSTER_INSPECTION_SUGGEST_HOSTIPCALLOWED:
    '\nHostIPC 비활성화, 응용 프로그램이 HostIPC에 의존하지 않도록 비활성화\n',

  CLUSTER_INSPECTION_DESC_HOSTNETWORKALLOWED:
    '포드가 노드의 네트워크 네임스페이스를 사용할 수 있는지 여부를 제어합니다. 이러한 승인을 통해 포드는 로컬 루프백 장치, 로컬 호스트(localhost)에서 수신 대기하는 서비스에 액세스하고 동일한 노드에 있는 다른 포드의 네트워크 활동을 수신할 수 있습니다.',
  CLUSTER_INSPECTION_SUGGEST_HOSTNETWORKALLOWED: '\nDisable hostNetwork\n',

  CLUSTER_INSPECTION_DESC_HOSTPIDALLOWED:
    '\nPod의 컨테이너가 호스트의 프로세스 ID 공간을 공유할 수 있는지 여부를 제어합니다. ptrace와 결합하면 이 인증을 악용하여 컨테이너 외부에서 권한 탈출을 일으킬 수 있습니다(ptrace는 기본적으로 비활성화되어 있습니다.',
  CLUSTER_INSPECTION_SUGGEST_HOSTPIDALLOWED: '\nDisable hostPID\n',

  CLUSTER_INSPECTION_DESC_HOSTPORTALLOWED:
    '호스트 네트워크 네임스페이스에서 사용할 수 있는 포트 범위 목록을 제공합니다.',
  CLUSTER_INSPECTION_SUGGEST_HOSTPORTALLOWED: '호스트 포트 비활성화',

  CLUSTER_INSPECTION_DESC_IMAGEPULLPOLICYNOTALWAYS:
    'kubelet이 컨테이너를 시작할 때마다 kubelet은 컨테이너의 레지스트리를 쿼리하여 이름을 이미지 다이제스트로 확인합니다. kubelet에 컨테이너 이미지가 있고 해당 다이제스트가 로컬로 캐시된 경우 kubelet은 캐시된 이미지를 사용합니다. 그렇지 않으면 kubelet은 구문 분석된 다이제스트가 포함된 이미지를 가져오고 해당 이미지를 사용하여 컨테이너를 시작합니다.',
  CLUSTER_INSPECTION_SUGGEST_IMAGEPULLPOLICYNOTALWAYS:
    'imagePullPolicy를 항상으로 설정',

  CLUSTER_INSPECTION_DESC_IMAGETAGISLATEST:
    '\n실행 중인 이미지 버전을 추적하기가 더 어렵고 적절하게 롤백하기가 더 어렵기 때문에 프로덕션에서 컨테이너를 배포할 때 :latest 태그를 사용하지 않는 것이 좋습니다.\n대신 v1.42.0과 같은 의미 있는 태그를 지정하세요.',
  CLUSTER_INSPECTION_SUGGEST_IMAGETAGISLATEST: '의미있는 태그를 지정하세요',

  CLUSTER_INSPECTION_DESC_IMAGETAGMISS:
    '\n태그를 지정하지 않으면 Kubernetes는 최신 태그를 의미한다고 가정합니다.\n',
  CLUSTER_INSPECTION_SUGGEST_IMAGETAGMISS: '의미있는 태그를 지정하세요',

  CLUSTER_INSPECTION_DESC_INSECURECAPABILITIES:
    '\n안전하지 않은 기능을 설정하면 Pod가 더 높은 권한을 갖게 됩니다. 예를 들어 KILL 권한은 컨테이너에 호스트 프로세스를 종료할 수 있는 권한을 부여합니다.\n',
  CLUSTER_INSPECTION_SUGGEST_INSECURECAPABILITIES:
    'CHOWN/FSETID/SETFCAP/SETPCAP/KILL과 같은 안전하지 않은 기능을 사용하지 마십시오.',

  CLUSTER_INSPECTION_DESC_NOLIVENESSPROBE:
    '\nLivenessProbe는 애플리케이션 손상 상태를 감지하고 처리하는 데 사용됩니다.\n',
  CLUSTER_INSPECTION_SUGGEST_NOLIVENESSPROBE: 'LivenessProbe 설정',

  CLUSTER_INSPECTION_DESC_NOMEMORYLIMITS:
    '\n메모리 제한을 구성하면 컨테이너가 너무 많은 메모리를 사용하지 않게 됩니다.\n메모리 제한을 설정하지 않으면 오작동하는 애플리케이션이 해당 노드에서 사용 가능한 메모리를 대부분 활용하게 될 수 있습니다.\n',
  CLUSTER_INSPECTION_SUGGEST_NOMEMORYLIMITS:
    '\n각 컨테이너 사양에 메모리 제한을 추가하세요.\n애플리케이션에 할당할 메모리 양을 결정하는 것은 사용자의 몫입니다. 메모리 제한을 너무 높게 설정하면 비용 초과가 발생할 수 있고, 너무 낮게 설정하면 애플리케이션이 OOM될 수 있습니다.\n핵심 업무용 또는 사용자 지향 애플리케이션의 경우 KubeEye는 더 높은 메모리 제한을 설정할 것을 권장합니다.\n',

  CLUSTER_INSPECTION_DESC_NOMEMORYREQUESTS:
    '\n메모리 리소스 요청을 설정하면 kube-scheduler는 이 정보를 사용하여 포드를 예약할 노드를 결정합니다.\n',
  CLUSTER_INSPECTION_SUGGEST_NOMEMORYREQUESTS:
    '\n각 컨테이너 사양에 대한 메모리 리소스 요청을 추가합니다.\n애플리케이션에 할당할 메모리 양을 결정하는 것은 사용자에게 달려 있습니다. 메모리 제한을 너무 높게 설정하면 앱 예약에 실패할 수 있고, 너무 낮게 설정하면 \n핵심 업무용 또는 사용자 지향 애플리케이션의 경우 KubeEye는 메모리 리소스 제한에 따라 메모리 리소스 요청을 설정하여 애플리케이션 리소스 배타성을 보장할 것을 권장합니다.\n',

  CLUSTER_INSPECTION_DESC_NOPRIORITYCLASS:
    'PriorityClass는 우선순위 클래스 이름에서 우선순위 값으로의 매핑을 정의합니다',
  CLUSTER_INSPECTION_SUGGEST_NOPRIORITYCLASS:
    '\n각 컨테이너 사양에 대한 메모리 리소스 요청을 추가합니다.\n애플리케이션에 할당할 메모리 양을 결정하는 것은 사용자에게 달려 있습니다. 메모리 제한을 너무 높게 설정하면 앱 예약에 실패할 수 있고, 너무 낮게 설정하면 \n핵심 업무용 또는 사용자 지향 애플리케이션의 경우 KubeEye는 메모리 리소스 제한에 따라 메모리 리소스 요청을 설정하여 애플리케이션 리소스 배타성을 보장할 것을 권장합니다.\n',

  CLUSTER_INSPECTION_DESC_PRIVILEGEDALLOWED:
    'Linux에서 포드의 모든 컨테이너는 컨테이너 사양의 보안 컨텍스트에 있는 특권(Linux) 매개변수를 사용하여 특권 모드를 활성화할 수 있습니다. 이는 네트워크 스택 조작 및 장치 액세스와 같은 운영 체제 관리 기능을 사용하려는 컨테이너에 유용합니다.',
  CLUSTER_INSPECTION_SUGGEST_PRIVILEGEDALLOWED: '특권 모드 비활성화',

  CLUSTER_INSPECTION_DESC_NOREADINESSPROBE:
    '\n준비 상태 프로브가 올바르게 구현되지 않으면 컨테이너의 프로세스 수가 계속 증가할 수 있습니다. 이에 대한 조치가 취해지지 않으면 리소스 고갈 상황이 발생할 가능성이 높습니다.\n',
  CLUSTER_INSPECTION_SUGGEST_NOREADINESSPROBE: 'readinessProbe 설정',

  CLUSTER_INSPECTION_DESC_NOTREADONLYROOTFILESYSTEM:
    '컨테이너는 읽기 전용으로 마운트된 루트 파일 시스템으로 실행되어야 합니다(즉, 쓰기 가능한 레이어는 허용되지 않음).',
  CLUSTER_INSPECTION_SUGGEST_NOTREADONLYROOTFILESYSTEM:
    'readOnlyRootFilesystem 설정',

  CLUSTER_INSPECTION_DESC_NOTRUNASNONROOT:
    '\n제출된 포드에 0이 아닌 runAsUser 값이 있거나 이미지에 USER 환경 변수가 정의되어 있어야 합니다(UID 값 사용). 포드에 runAsNonRoot나 runAsUser가 모두 설정되지 않은 경우 포드는 runAsNonRoot=true로 설정되도록 수정되며, 컨테이너는 USER 지시어를 통해 0이 아닌 숫자 사용자 ID를 제공해야 합니다. 이 구성에는 기본값이 없습니다. 이 구성에서는 AllowPrivilegeEscalation=false로 설정하는 것이 좋습니다.',
  CLUSTER_INSPECTION_SUGGEST_NOTRUNASNONROOT: 'readOnlyRootFilesystem 설정',

  CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD:
    'Kubernetes API 보안 인증서가 곧 만료되며 만료 시간은 30일 미만입니다.',
  CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD:
    '보안 인증서를 제때 업데이트해주세요',

  CLUSTER_INSPECTION_DESC_CANDELETERESOURCES: '관리자 문의',
  CLUSTER_INSPECTION_SUGGEST_CANDELETERESOURCES: '관리자 문의',

  CLUSTER_INSPECTION_DESC_KUBELETHASDISKPRESSURE: '관리자 문의',
  CLUSTER_INSPECTION_SUGGEST_KUBELETHASDISKPRESSURE: '관리자 문의',

  CLUSTER_INSPECTION_DESC_KUBELETHASNOSUFFICIENTMEMORY: '관리자 문의',
  CLUSTER_INSPECTION_SUGGEST_KUBELETHASNOSUFFICIENTMEMORY: '관리자 문의',

  CLUSTER_INSPECTION_DESC_KUBELETHASNOSUFFICIENTPID: '관리자 문의',
  CLUSTER_INSPECTION_SUGGEST_KUBELETHASNOSUFFICIENTPID: '관리자 문의',

  CLUSTER_INSPECTION_DESC_NOPRIORITYCLASSNAME: '관리자 문의',
  CLUSTER_INSPECTION_SUGGEST_NOPRIORITYCLASSNAME: '관리자 문의',

  CLUSTER_INSPECTION_DESC_ERROR: '관리자 문의',
  CLUSTER_INSPECTION_SUGGEST_ERROR: '관리자 문의',

  CLUSTER_INSPECTION_DESC_ERRIMPORTFAILED: '관리자 문의',
  CLUSTER_INSPECTION_SUGGEST_ERRIMPORTFAILED: '관리자 문의',

  CLUSTER_INSPECTION_DESC_BACKOFF: '관리자 문의',
  CLUSTER_INSPECTION_SUGGEST_BACKOFF: '관리자 문의',
};
