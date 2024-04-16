import { get, set, uniq, isArray, intersection } from 'lodash';
import { observable, action } from 'mobx';
import { Notify } from '@kube-design/components';

import { LIST_DEFAULT_ORDER } from 'utils/constants';
import ObjectMapper from 'utils/object.mapper';
import Base from '../basemm3'; // mm3 관련 추가 파일
import List from '../base.list';

export default class KubeeyeDataStore extends Base {
  records = new List();

  module = 'kubeeyeData';

  //   getResourceUrl = (params = {}) =>
  //     `apis/kubeeye.kubesphere.io/v1alpha1/clusterinsights/clusterinsight`;

  @action
  async fetchList({
    cluster,
    workspace,
    namespace,
    more,
    devops,
    ...params
  } = {}) {
    const kubeeyeData = [
      {
        name: 'PrivilegedAllowed',
        describe: t('CLUSTER_INSPECTION_DESC_PRIVILEDGEDALLOWED'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/workloads/pods/#privileged-mode-for-containers',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_PRIVILEDGEDALLOWED'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
        level: 'danger',
      },
      {
        name: 'CanImpersonateUser',
        describe: t('CLUSTER_INSPECTION_DESC_CANIMPERSONATEUSER'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_CANIMPERSONATEUSER'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
        level: 'warning',
      },
      {
        name: 'CanImpersonateUser',
        describe: t('CLUSTER_INSPECTION_DESC_CANIMPERSONATEUSER'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_CANIMPERSONATEUSER'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
        level: 'warning',
      },
      {
        name: 'CanModifyWorkloads',
        describe: t('CLUSTER_INSPECTION_DESC_CANMODIFYWORKLOADS'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/reference/access-authn-authz/rbac/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_CANMODIFYWORKLOADS'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
        level: 'warning',
      },
      {
        name: 'NoCPULimits',
        describe: t('CLUSTER_INSPECTION_DESC_NOCPULIMITS'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_NOCPULIMITS'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
        level: 'danger',
      },
      {
        name: 'NoCPURequests',
        describe: t('CLUSTER_INSPECTION_DESC_NOCPUREQUESTS'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
        },
        suggest: t('CLUSTER_INSPECTION_DESC_NOCPUREQUESTS'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
        level: 'danger',
      },
      {
        name: 'DangerousCapabilities',
        describe: t('CLUSTER_INSPECTION_DESC_DANGEROUSCAPABILITIES'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_DANGEROUSCAPABILITIES'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
        level: 'danger',
      },
      {
        name: 'HostIPCAllowed',
        describe: t('CLUSTER_INSPECTION_DESC_HOSTIPCALLOWED'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/policy/pod-security-policy/#host-namespaces',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_HOSTIPCALLOWED'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostIPC: false',
        level: 'danger',
      },
      {
        name: 'DangerousCapabilities',
        describe: t('CLUSTER_INSPECTION_DESC_DANGEROUSCAPABILITIES'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_DANGEROUSCAPABILITIES'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostIPC: false',
        level: 'danger',
      },
      {
        name: 'HostNetworkAllowed',
        describe: t('CLUSTER_INSPECTION_DESC_HOSTNETWORKALLOWED'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/policy/pod-security-policy/#host-namespaces',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_HOSTNETWORKALLOWED'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostPID: false\n',
        level: 'danger',
      },
      {
        name: 'HostPIDAllowed',
        describe: t('CLUSTER_INSPECTION_DESC_HOSTPIDALLOWED'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/zh-cn/docs/concepts/security/pod-security-policy/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_HOSTPIDALLOWED'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostPID: false\n',
        level: 'danger',
      },
      {
        name: 'HostPortAllowed',
        describe: t('CLUSTER_INSPECTION_DESC_HOSTPORTALLOWED'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/configuration/overview/#services',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_HOSTPORTALLOWED'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostPID: false\n',
        level: 'danger',
      },
      {
        name: 'ImagePullPolicyNotAlways',
        describe: t('CLUSTER_INSPECTION_DESC_IMAGEPULLPOLICYNOTALWAYS'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_IMAGEPULLPOLICYNOTALWAYS'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    imagePullPolicy: Always\n',
        level: 'warning',
      },
      {
        name: 'ImageTagIsLatest',
        describe: t('CLUSTER_INSPECTION_DESC_IMAGETAGISLATEST'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_IMAGETAGISLATEST'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    imagePullPolicy: Always\n',
        level: 'warning',
      },
      {
        name: 'ImageTagMiss',
        describe: t('CLUSTER_INSPECTION_DESC_IMAGETAGMISS'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/containers/images/#image-names',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_IMAGETAGMISS'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    imagePullPolicy: Always\n',
        level: 'danger',
      },
      {
        name: 'InsecureCapabilities',
        describe: t('CLUSTER_INSPECTION_DESC_INSECURECAPABILITIES'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_INSECURECAPABILITIES'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    imagePullPolicy: Always\n',
        level: 'danger',
      },
      {
        name: 'NoLivenessProbe',
        describe: t('CLUSTER_INSPECTION_DESC_NOLIVENESSPROBE'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_NOLIVENESSPROBE'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    livenessProbe:\n      httpGet:\n        path: /healthz\n        port: 8080\n      initialDelaySeconds: 5\n      periodSeconds: 5\n',
        level: 'warning',
      },
      {
        name: 'NoMemoryLimits',
        describe: t('CLUSTER_INSPECTION_DESC_NOMEMORYLIMITS'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_NOMEMORYLIMITS'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
        level: 'danger',
      },
      {
        name: 'NoMemoryRequests',
        describe: t('CLUSTER_INSPECTION_DESC_NOMEMORYREQUESTS'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_NOMEMORYREQUESTS'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
        level: 'danger',
      },
      {
        name: 'NoPriorityClass',
        describe: t('CLUSTER_INSPECTION_DESC_NOPRIORITYCLASS'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/priority-class-v1/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_NOPRIORITYCLASS'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
        level: 'ignore',
      },
      {
        name: 'PrivilegedAllowed',
        describe: t('CLUSTER_INSPECTION_DESC_PRIVILEGEDALLOWED'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/workloads/pods/#privileged-mode-for-containers',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_PRIVILEGEDALLOWED'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
        level: 'danger',
      },
      {
        name: 'NoReadinessProbe',
        describe: t('CLUSTER_INSPECTION_DESC_NOREADINESSPROBE'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_NOREADINESSPROBE'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    readinessProbe:\n      httpGet:\n        path: /healthy\n        port: 8080\n      initialDelaySeconds: 5\n      periodSeconds: 5\n',
        level: 'warning',
      },
      {
        name: 'NotReadOnlyRootFilesystem',
        describe: t('CLUSTER_INSPECTION_DESC_NOTREADONLYROOTFILESYSTEM'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/docs/concepts/security/pod-security-policy/#volumes-and-file-systems',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_NOTREADONLYROOTFILESYSTEM'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n',
        level: 'warning',
      },
      {
        name: 'NotRunAsNonRoot',
        describe: t('CLUSTER_INSPECTION_DESC_NOTRUNASNONROOT'),

        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_NOTRUNASNONROOT'),

        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },
      {
        name: 'CertificateExpiredPeriod',
        describe: t('CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD'),
        reference: {
          'Kubernetes Documentation':
            'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD'),
        template:
          '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },
      // 데이터 없는것
      {
        name: 'CanDeleteResources',
        // t('CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD'),

        describe: t('CLUSTER_INSPECTION_DESC_CANDELETERESOURCES'),
        //   reference: {
        //     'Kubernetes Documentation':
        //       'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        //   },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_CANDELETERESOURCES'),
        //   template:
        //     '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },
      {
        name: 'CanModifyWorkloads',
        describe: t('CLUSTER_INSPECTION_DESC_CANMODIFYWORKLOADS'),
        //   reference: {
        //     'Kubernetes Documentation':
        //       'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        //   },
        suggest: t('CLUSTER_INSPECTION_SUGGEST_CANMODIFYWORKLOADS'),
        //   template:
        //     '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },
      {
        name: 'KubeletHasDiskPressure',
        // t('CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD'),

        describe: t('CLUSTER_INSPECTION_DESC_KUBELETHASDISKPRESSURE'),
        //   reference: {
        //     'Kubernetes Documentation':
        //       'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        //   },
        // t('CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD'),
        suggest: t('CLUSTER_INSPECTION_SUGGEST_KUBELETHASDISKPRESSURE'),
        //   template:
        //     '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },
      {
        name: 'KubeletHasNoSufficientMemory',
        // t('CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD'),

        describe: t('CLUSTER_INSPECTION_DESC_KUBELETHASNOSUFFICIENTMEMORY'),
        //   reference: {
        //     'Kubernetes Documentation':
        //       'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        //   },
        // t('CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD'),
        suggest: t('CLUSTER_INSPECTION_SUGGEST_KUBELETHASNOSUFFICIENTMEMORY'),
        //   template:
        //     '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },
      {
        name: 'KubeletHasNoSufficientPID',
        // t('CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD'),

        describe: t('CLUSTER_INSPECTION_DESC_KUBELETHASNOSUFFICIENTPID'),
        //   reference: {
        //     'Kubernetes Documentation':
        //       'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        //   },
        // t('CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD'),
        suggest: t('CLUSTER_INSPECTION_SUGGEST_KUBELETHASNOSUFFICIENTPID'),
        //   template:
        //     '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },

      {
        name: 'NoPriorityClassName',
        // t('CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD'),

        describe: t('CLUSTER_INSPECTION_DESC_NOPRIORITYCLASSNAME'),
        //   reference: {
        //     'Kubernetes Documentation':
        //       'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        //   },
        // t('CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD'),
        suggest: t('CLUSTER_INSPECTION_SUGGEST_NOPRIORITYCLASSNAME'),
        //   template:
        //     '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'ignore',
      },
      {
        name: 'Error',
        // t('CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD'),

        describe: t('CLUSTER_INSPECTION_DESC_ERROR'),
        //   reference: {
        //     'Kubernetes Documentation':
        //       'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        //   },
        // t('CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD'),
        suggest: t('CLUSTER_INSPECTION_SUGGEST_ERROR'),
        //   template:
        //     '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },
      {
        name: 'ErrImportFailed',
        // t('CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD'),

        describe: t('CLUSTER_INSPECTION_DESC_ERRIMPORTFAILED'),
        //   reference: {
        //     'Kubernetes Documentation':
        //       'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        //   },
        // t('CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD'),
        suggest: t('CLUSTER_INSPECTION_SUGGEST_ERRIMPORTFAILED'),
        //   template:
        //     '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },
      {
        name: 'BackOff',
        // t('CLUSTER_INSPECTION_DESC_CERTIFICATEEXPIREDPERIOD'),

        describe: t('CLUSTER_INSPECTION_DESC_BACKOFF'),
        //   reference: {
        //     'Kubernetes Documentation':
        //       'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
        //   },
        // t('CLUSTER_INSPECTION_SUGGEST_CERTIFICATEEXPIREDPERIOD'),
        suggest: t('CLUSTER_INSPECTION_SUGGEST_BACKOFF'),
        //   template:
        //     '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
        level: 'warning',
      },
    ];

    // this.list.isLoading = true;

    // if (!params.sortBy && params.ascending === undefined) {
    //   params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'timestamp';
    // }

    // if (params.limit === Infinity || params.limit === -1) {
    //   params.limit = -1;
    //   params.page = 1;
    // }

    // params.limit = params.limit || 10;

    // const resultClusterInspection = await request.get(this.getResourceUrl());

    // const resultCluster = get(resultClusterInspection, 'status', []);

    // const data = resultCluster;

    // 초기 정렬 처리
    // data.sort((a, b) => {
    //   return a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0;
    // });
    // data.sort((a, b) => {
    //   return a.namespace < b.namespace ? 1 : a.namespace > b.namespace ? -1 : 0;
    // });

    // 초기 데이터 처리
    this.list.data = kubeeyeData;

    return this.list.data;
  }
}
