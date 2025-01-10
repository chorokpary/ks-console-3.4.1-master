module.exports = {
  CLUSTER_INSPECTION_MORNITORING: 'Cluster Inspector',
  CLUSTER_INSPECTION_DESC:
    'Verify that cluster nodes, components, and other configurations comply with best practices.',
  CLUSTER_INSPECTION_CLUSTER_STATUS: 'Cluster status',
  CLUSTER_INSPECTION_CHECK_ALL_LIST: 'All inspection items',
  CLUSTER_INSPECTION_PASS: 'Pass',
  CLUSTER_INSPECTION_WARNING: 'Warning',
  CLUSTER_INSPECTION_DANGER: 'Danger',
  CLUSTER_INSPECTION_IGNORE: 'Ignore',
  CLUSTER_INSPECTION_HEALTH_SCORE: 'Health score',
  CLUSTER_INSPECTION_CLUSTER_INFO: 'Cluster information',
  CLUSTER_INSPECTION_K8S_VERSION: 'Kubernetes version',
  CLUSTER_INSPECTION_NODE: 'Cluster node',
  CLUSTER_INSPECTION_PROJECT_CNT: 'Number of projects',
  CLUSTER_INSPECTION_WORKLOAD_CNT: 'Number of workloads',
  CLUSTER_INSPECTION_CLUSTER: 'Cluster',
  CLUSTER_INSPECTION_PROJECT: 'Project',
  CLUSTER_INSPECTION_NAME: 'Name',
  CLUSTER_INSPECTION_TYPE: 'Type',
  CLUSTER_INSPECTION_STATUS: 'Status',
  CLUSTER_INSPECTION_NO_DATA: 'No data.',
  CLUSTER_INSPECTION_DESCRIPTION: 'DESCRIPTION',
  CLUSTER_INSPECTION_SUGGEST: 'SUGGEST',
  CLUSTER_INSPECTION_LATEST_TIME: 'Latest inspection time',

  //   KUBEEYE DATA
  CLUSTER_INSPECTION_DESC_PRIVILEDGEDALLOWED:
    'In Linux, any container in a Pod can enable privileged mode using the privileged (Linux) parameter in the security context in the container spec. This is useful for containers that want to use operating system management capabilities such as manipulating the network stack and accessing devices.',
  CLUSTER_INSPECTION_SUGGEST_PRIVILEDGEDALLOWED: 'Disable privileged mode',

  CLUSTER_INSPECTION_DESC_CANIMPERSONATEUSER:
    '\nA user can perform actions as another user by impersonating the (Impersonation) header field. Using this capability, you can manually override requests for user information identified by authentication. For example, administrators can use this feature to temporarily masquerade as another user to see if requests are denied, thereby debugging problems in authentication policies,\nA request with masquerading will first be identified as the requesting user by authentication, and then switch to using the user information of the masqueraded user\n',
  CLUSTER_INSPECTION_SUGGEST_CANIMPERSONATEUSER:
    '\nBased on the ability to pretend to be a user or user group, you can perform any action as if you were that user or user group. For this reason, masquerading operations are not namespace bound.',

  //   CLUSTER_INSPECTION_DESC_CANIMPERSONATEUSER:
  //     '\nA user can perform actions as another user by impersonating the (Impersonation) header field. Using this capability, you can manually override requests for user information identified by authentication. For example, administrators can use this feature to temporarily masquerade as another user to see if requests are denied, thereby debugging problems in authentication policies,\nA request with masquerading will first be identified as the requesting user by authentication, and then switch to using the user information of the masqueraded user\n',
  //   CLUSTER_INSPECTION_SUGGEST_CANIMPERSONATEUSER:
  //     '\nBased on the ability to pretend to be a user or user group, you can perform any action as if you were that user or user group. For this reason, masquerading operations are not namespace bound.',

  CLUSTER_INSPECTION_DESC_CANMODIFYWORKLOADS:
    '\nUser has permission to create, modify, delete workloads\n',
  CLUSTER_INSPECTION_SUGGEST_CANMODIFYWORKLOADS:
    '\nCheck RBAC permission settings to reduce unnecessary permissions.\n',

  CLUSTER_INSPECTION_DESC_NOCPULIMITS:
    "\nConfiguring CPU limits ensures that containers never use too much CPU\nIf CPU limits are not set, misbehaving applications may end up utilizing most of the available CPU on their nodes, potentially slowing down other workloads or causing cost overruns as the cluster tries to scale.\nCompared to memory limits, CPU throttling will never crash your application. Instead, it's limited -- it's only allowed to run a certain number of operations per second.\n",
  CLUSTER_INSPECTION_SUGGEST_NOCPULIMITS:
    "\nAdds a CPU limit per container specification, the CPU can be set in terms of the entire CPU (e.g. 10 or 25), or more commonly, Millicpus (e.g. 1000m or 250m).\nIt's up to you to decide how much CPU to allocate to your application. Setting the CPU limit too high can lead to cost overruns, while setting it too low can result in throttling of your application.\nFor mission-critical or user-facing applications, KubeEye recommends setting a higher CPU limit, which will only limit misbehaving applications\n",

  CLUSTER_INSPECTION_DESC_NOCPUREQUESTS:
    '\nSet the CPU resource request, and kube-scheduler uses this information to decide on which node to schedule the Pod.\n',
  CLUSTER_INSPECTION_SUGGEST_NOCPUREQUESTS:
    "\nAdd a CPU resource request for each container specification, the CPU can be set according to the entire CPU (such as 10 or 25), or more commonly, according to Millicpus (such as 1000m or 250m).\nIt's up to you to decide how much CPU to allocate to your application. Setting the CPU limit too high may cause your application to fail to schedule, while setting it too low may cause your application to grab resources.\nFor mission-critical or user-facing applications, KubeEye recommends setting CPU resource requests consistently with CPU resource limits, which ensures application resource exclusiveness.\n",

  CLUSTER_INSPECTION_DESC_DANGEROUSCAPABILITIES:
    '\nSetting dangerous capabilities for an application will result in the application having extremely high privileges and even affecting the host computer.\n',
  CLUSTER_INSPECTION_SUGGEST_DANGEROUSCAPABILITIES:
    '\nDangerous capabilities such as "NET_ADMIN", "SYS_ADMIN", "ALL" in securityContext are prohibited.\n',

  CLUSTER_INSPECTION_DESC_HOSTIPCALLOWED:
    '\nControls whether Pod containers can share the IPC namespace on the host.\n',
  CLUSTER_INSPECTION_SUGGEST_HOSTIPCALLOWED:
    '\nDisabling hostIPC, disabling applications from relying on hostIPC\n',

  //   CLUSTER_INSPECTION_DESC_DANGEROUSCAPABILITIES:
  //     '\nSetting dangerous capabilities for an application will result in the application having extremely high privileges and even affecting the host computer.\n',
  //   CLUSTER_INSPECTION_SUGGEST_DANGEROUSCAPABILITIES:
  //     '\nDangerous capabilities such as "NET_ADMIN", "SYS_ADMIN", "ALL" in securityContext are prohibited.\n',

  CLUSTER_INSPECTION_DESC_HOSTNETWORKALLOWED:
    "Controls whether Pods can use the node's network namespace. Such authorization will allow Pods to access local loopback devices, services listening on the local host (localhost), and possibly to listen for network activity of other Pods on the same node.",
  CLUSTER_INSPECTION_SUGGEST_HOSTNETWORKALLOWED: '\nDisable hostNetwork\n',

  CLUSTER_INSPECTION_DESC_HOSTPIDALLOWED:
    '\nControls whether containers in a Pod can share process ID space on the host. Note that if combined with ptrace, this authorization can be exploited to cause privilege escape outside the container (ptrace is disabled by default.',
  CLUSTER_INSPECTION_SUGGEST_HOSTPIDALLOWED: '\nDisable hostPID\n',

  CLUSTER_INSPECTION_DESC_HOSTPORTALLOWED:
    'Provides a list of port ranges that can be used in the host network namespace',
  CLUSTER_INSPECTION_SUGGEST_HOSTPORTALLOWED: 'Disable hostPort',

  CLUSTER_INSPECTION_DESC_IMAGEPULLPOLICYNOTALWAYS:
    "Whenever the kubelet starts a container, the kubelet queries the container's registry to resolve the name into an image digest. If the kubelet has a container image and the corresponding digest is cached locally, the kubelet will use its cached image; otherwise, the kubelet will pull the image with the parsed digest and use that image to start the container.",
  CLUSTER_INSPECTION_SUGGEST_IMAGEPULLPOLICYNOTALWAYS:
    'Set imagePullPolicy to Always',

  CLUSTER_INSPECTION_DESC_IMAGETAGISLATEST:
    '\nYou should avoid using the :latest tag when deploying containers in production as it is harder to track which version of the image is running and more difficult to roll back properly.\nInstead, specify a meaningful tag such as v1.42.0.',
  CLUSTER_INSPECTION_SUGGEST_IMAGETAGISLATEST: 'specify a meaningful tag',

  CLUSTER_INSPECTION_DESC_IMAGETAGMISS:
    "\nIf you don't specify a tag, Kubernetes assumes you mean the tag latest.\n",
  CLUSTER_INSPECTION_SUGGEST_IMAGETAGMISS: 'specify a meaningful tag',

  CLUSTER_INSPECTION_DESC_INSECURECAPABILITIES:
    '\nSetting insecure capabilities will cause the Pod to have higher permissions, such as KILL permissions will give the container the permission to kill the host process.\n',
  CLUSTER_INSPECTION_SUGGEST_INSECURECAPABILITIES:
    'Do not use insecure capabilities such as CHOWN/FSETID/SETFCAP/SETPCAP/KILL',

  CLUSTER_INSPECTION_DESC_NOLIVENESSPROBE:
    '\nLivenessProbes are used to detect and handle application corruption states.\n',
  CLUSTER_INSPECTION_SUGGEST_NOLIVENESSPROBE: 'set LivenessProbes',

  CLUSTER_INSPECTION_DESC_NOMEMORYLIMITS:
    '\nConfiguring memory limits ensures that containers never use too much memory\nIf memory limits are not set, misbehaving applications may end up utilizing most of the available memory on their nodes.\n',
  CLUSTER_INSPECTION_SUGGEST_NOMEMORYLIMITS:
    "\nAdd memory limits for each container specification.\nIt's up to you to decide how much memory to allocate to your application. Setting the memory limit too high can lead to cost overruns, while setting it too low can cause your application to OOM.\nFor mission-critical or user-facing applications, KubeEye recommends setting a higher memory limit.\n",

  CLUSTER_INSPECTION_DESC_NOMEMORYREQUESTS:
    '\nSet a memory resource request, and kube-scheduler uses this information to decide on which node to schedule the Pod.\n',
  CLUSTER_INSPECTION_SUGGEST_NOMEMORYREQUESTS:
    "\nAdd memory resource requests for each container specification.\nIt's up to you to decide how much memory to allocate to your application. Setting the memory limit too high can cause your app to fail to schedule, while setting it too low can cause your app to grab resources.\nFor mission-critical or user-facing applications, KubeEye recommends setting memory resource requests in line with memory resource limits, which ensures application resource exclusiveness.\n",

  CLUSTER_INSPECTION_DESC_NOPRIORITYCLASS:
    'PriorityClass defines a mapping from priority class names to priority values',
  CLUSTER_INSPECTION_SUGGEST_NOPRIORITYCLASS:
    "\nAdd memory resource requests for each container specification.\nIt's up to you to decide how much memory to allocate to your application. Setting the memory limit too high can cause your app to fail to schedule, while setting it too low can cause your app to grab resources.\nFor mission-critical or user-facing applications, KubeEye recommends setting memory resource requests in line with memory resource limits, which ensures application resource exclusiveness.\n",

  CLUSTER_INSPECTION_DESC_PRIVILEGEDALLOWED:
    'In Linux, any container in a Pod can enable privileged mode using the privileged (Linux) parameter in the security context in the container spec. This is useful for containers that want to use operating system management capabilities such as manipulating the network stack and accessing devices.',
  CLUSTER_INSPECTION_SUGGEST_PRIVILEGEDALLOWED: 'Disable privileged mode',

  CLUSTER_INSPECTION_DESC_NOREADINESSPROBE:
    '\nNote that if the readiness probe is not implemented correctly, it may cause the number of processes in the container to keep rising. If action is not taken against it, it is likely to lead to a situation of resource depletion.\n',
  CLUSTER_INSPECTION_SUGGEST_NOREADINESSPROBE: 'set readinessProbe',

  CLUSTER_INSPECTION_DESC_NOTREADONLYROOTFILESYSTEM:
    'Requires that the container must run with the root filesystem mounted read-only (i.e. no writable layers are allowed).',
  CLUSTER_INSPECTION_SUGGEST_NOTREADONLYROOTFILESYSTEM:
    'set readOnlyRootFilesystem',

  CLUSTER_INSPECTION_DESC_NOTRUNASNONROOT:
    '\nRequires the submitted Pod to have a non-zero runAsUser value, or have a USER environment variable defined in the image (using a UID value). If a Pod has neither runAsNonRoot nor runAsUser set, the Pod is modified to set runAsNonRoot=true, requiring the container to give a non-zero numeric user ID via the USER directive. There is no default value for this configuration. With this configuration, it is strongly recommended to set allowPrivilegeEscalation=false.',
  CLUSTER_INSPECTION_SUGGEST_NOTRUNASNONROOT: 'set readOnlyRootFilesystem',

  CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD:
    'The Kubernetes API security certificate is about to expire, and the expiration time is less than 30 days',
  CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD:
    'Please update the security certificate in time',

  CLUSTER_INSPECTION_DESC_CANDELETERESOURCES: 'Contact your administrator',
  CLUSTER_INSPECTION_SUGGEST_CANDELETERESOURCES: 'Contact your administrator',

  CLUSTER_INSPECTION_DESC_KUBELETHASDISKPRESSURE: 'Contact your administrator',
  CLUSTER_INSPECTION_SUGGEST_KUBELETHASDISKPRESSURE:
    'Contact your administrator',

  CLUSTER_INSPECTION_DESC_KUBELETHASNOSUFFICIENTMEMORY:
    'Contact your administrator',
  CLUSTER_INSPECTION_SUGGEST_KUBELETHASNOSUFFICIENTMEMORY:
    'Contact your administrator',

  CLUSTER_INSPECTION_DESC_KUBELETHASNOSUFFICIENTPID:
    'Contact your administrator',
  CLUSTER_INSPECTION_SUGGEST_KUBELETHASNOSUFFICIENTPID:
    'Contact your administrator',

  CLUSTER_INSPECTION_DESC_NOPRIORITYCLASSNAME: 'Contact your administrator',
  CLUSTER_INSPECTION_SUGGEST_NOPRIORITYCLASSNAME: 'Contact your administrator',

  CLUSTER_INSPECTION_DESC_ERROR: 'Contact your administrator',
  CLUSTER_INSPECTION_SUGGEST_ERROR: 'Contact your administrator',

  CLUSTER_INSPECTION_DESC_ERRIMPORTFAILED: 'Contact your administrator',
  CLUSTER_INSPECTION_SUGGEST_ERRIMPORTFAILED: 'Contact your administrator',

  CLUSTER_INSPECTION_DESC_BACKOFF: 'Contact your administrator',
  CLUSTER_INSPECTION_SUGGEST_BACKOFF: 'Contact your administrator',
};
