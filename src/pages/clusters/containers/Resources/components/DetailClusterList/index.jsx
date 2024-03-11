import React, { useState, useEffect, useReducer } from 'react';
import classnames from 'classnames';
import { toJS } from 'mobx';

import { Button, Icon, Loading, Tooltip } from '@kube-design/components';

import Tabs from 'components/Cards/Banner/Tabs';
import { TinyArea } from 'components/Charts';
import { Panel, Text, Indicator } from 'components/Base';

import styles from './index.scss';

import ClusterInspectionStore from 'stores/resources/clusterInspection';

import { getLocalTime } from 'utils';
import * as common from 'utils/resources';
import { getAreaChartOps } from 'utils/monitoring';

import 'pages/clusters/containers/Overview/CustomDashboard/custom_style.css';
import 'pages/clusters/containers/Overview/CustomDashboard/custom_icon.css';
import 'pages/clusters/containers/Overview/CustomDashboard/dashboard.css';

const DetailClusterList = props => {
  const clusterInspection = new ClusterInspectionStore();

  const [ciDataList, setCiDataList] = useState();
  const [namespace, setNamespace] = useState([]);
  const [withoutNamespace, setWithoutNamespace] = useState([]);

  const [isExpandFlag, setIsExpandFlag] = useState(false);
  const [expandItem, setExpandItem] = useState();
  const [expandItemNamespace, setExpandItemNamespace] = useState();
  const [expandItemType, setExpandItemType] = useState();
  //   const [isLoading, setIsLoading] = useState(true);

  // button
  const [buttonPass, setButtonPass] = useState(false);
  const [buttonWarning, setButtonWarning] = useState(false);
  const [buttonDanger, setButtonDanger] = useState(false);

  const [tabValue, setTabValue] = useState('cluster');

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState();
  const [describe, setDescribe] = useState();
  const [suggest, setSuggest] = useState();
  const [level, setLevel] = useState();

  const kubeeyeData = [
    {
      name: 'PrivilegedAllowed',
      describe:
        'In Linux, any container in a Pod can enable privileged mode using the privileged (Linux) parameter in the security context in the container spec. This is useful for containers that want to use operating system management capabilities such as manipulating the network stack and accessing devices.',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/workloads/pods/#privileged-mode-for-containers',
      },
      suggest: 'Disable privileged mode',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
      level: 'danger',
    },
    {
      name: 'CanImpersonateUser',
      describe:
        '\nA user can perform actions as another user by impersonating the (Impersonation) header field. Using this capability, you can manually override requests for user information identified by authentication. For example, administrators can use this feature to temporarily masquerade as another user to see if requests are denied, thereby debugging problems in authentication policies,\nA request with masquerading will first be identified as the requesting user by authentication, and then switch to using the user information of the masqueraded user\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation',
      },
      suggest:
        '\nBased on the ability to pretend to be a user or user group, you can perform any action as if you were that user or user group. For this reason, masquerading operations are not namespace bound.',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
      level: 'warning',
    },
    {
      name: 'CanImpersonateUser',
      describe:
        '\nA user can perform actions as another user by impersonating the (Impersonation) header field. Using this capability, you can manually override requests for user information identified by authentication. For example, administrators can use this feature to temporarily masquerade as another user to see if requests are denied, thereby debugging problems in authentication policies,\nA request with masquerading will first be identified as the requesting user by authentication, and then switch to using the user information of the masqueraded user\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation',
      },
      suggest:
        '\nBased on the ability to pretend to be a user or user group, you can perform any action as if you were that user or user group. For this reason, masquerading operations are not namespace bound.',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
      level: 'warning',
    },
    {
      name: 'CanModifyWorkloads',
      describe: '\nUser has permission to create, modify, delete workloads\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/reference/access-authn-authz/rbac/',
      },
      suggest:
        '\nCheck RBAC permission settings to reduce unnecessary permissions.\n',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
      level: 'warning',
    },
    {
      name: 'NoCPULimits',
      describe:
        "\nConfiguring CPU limits ensures that containers never use too much CPU\nIf CPU limits are not set, misbehaving applications may end up utilizing most of the available CPU on their nodes, potentially slowing down other workloads or causing cost overruns as the cluster tries to scale.\nCompared to memory limits, CPU throttling will never crash your application. Instead, it's limited -- it's only allowed to run a certain number of operations per second.\n",
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
      },
      suggest:
        "\nAdds a CPU limit per container specification, the CPU can be set in terms of the entire CPU (e.g. 10 or 25), or more commonly, Millicpus (e.g. 1000m or 250m).\nIt's up to you to decide how much CPU to allocate to your application. Setting the CPU limit too high can lead to cost overruns, while setting it too low can result in throttling of your application.\nFor mission-critical or user-facing applications, KubeEye recommends setting a higher CPU limit, which will only limit misbehaving applications\n",
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
      level: 'danger',
    },
    {
      name: 'NoCPURequests',
      describe:
        '\nSet the CPU resource request, and kube-scheduler uses this information to decide on which node to schedule the Pod.\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
      },
      suggest:
        "\nAdd a CPU resource request for each container specification, the CPU can be set according to the entire CPU (such as 10 or 25), or more commonly, according to Millicpus (such as 1000m or 250m).\nIt's up to you to decide how much CPU to allocate to your application. Setting the CPU limit too high may cause your application to fail to schedule, while setting it too low may cause your application to grab resources.\nFor mission-critical or user-facing applications, KubeEye recommends setting CPU resource requests consistently with CPU resource limits, which ensures application resource exclusiveness.\n",
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
      level: 'danger',
    },
    {
      name: 'DangerousCapabilities',
      describe:
        '\nSetting dangerous capabilities for an application will result in the application having extremely high privileges and even affecting the host computer.\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/',
      },
      suggest:
        '\nDangerous capabilities such as "NET_ADMIN", "SYS_ADMIN", "ALL" in securityContext are prohibited.\n',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
      level: 'danger',
    },
    {
      name: 'HostIPCAllowed',
      describe:
        '\nControls whether Pod containers can share the IPC namespace on the host.\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/policy/pod-security-policy/#host-namespaces',
      },
      suggest:
        '\nDisabling hostIPC, disabling applications from relying on hostIPC\n',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostIPC: false',
      level: 'danger',
    },
    {
      name: 'DangerousCapabilities',
      describe:
        '\nSetting dangerous capabilities for an application will result in the application having extremely high privileges and even affecting the host computer.\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/',
      },
      suggest:
        '\nDangerous capabilities such as "NET_ADMIN", "SYS_ADMIN", "ALL" in securityContext are prohibited.\n',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostIPC: false',
      level: 'danger',
    },
    {
      name: 'HostNetworkAllowed',
      describe:
        "Controls whether Pods can use the node's network namespace. Such authorization will allow Pods to access local loopback devices, services listening on the local host (localhost), and possibly to listen for network activity of other Pods on the same node.",
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/policy/pod-security-policy/#host-namespaces',
      },
      suggest: '\nDisable hostNetwork\n',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostPID: false\n',
      level: 'danger',
    },
    {
      name: 'HostPIDAllowed',
      describe:
        '\nControls whether containers in a Pod can share process ID space on the host. Note that if combined with ptrace, this authorization can be exploited to cause privilege escape outside the container (ptrace is disabled by default.',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/zh-cn/docs/concepts/security/pod-security-policy/',
      },
      suggest: '\nDisable hostPID\n',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostPID: false\n',
      level: 'danger',
    },
    {
      name: 'HostPortAllowed',
      describe:
        'Provides a list of port ranges that can be used in the host network namespace',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/configuration/overview/#services',
      },
      suggest: 'Disable hostPort',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  hostPID: false\n',
      level: 'danger',
    },
    {
      name: 'ImagePullPolicyNotAlways',
      describe:
        "Whenever the kubelet starts a container, the kubelet queries the container's registry to resolve the name into an image digest. If the kubelet has a container image and the corresponding digest is cached locally, the kubelet will use its cached image; otherwise, the kubelet will pull the image with the parsed digest and use that image to start the container.",
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy',
      },
      suggest: 'Set imagePullPolicy to Always',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    imagePullPolicy: Always\n',
      level: 'warning',
    },
    {
      name: 'ImageTagIsLatest',
      describe:
        '\nYou should avoid using the :latest tag when deploying containers in production as it is harder to track which version of the image is running and more difficult to roll back properly.\nInstead, specify a meaningful tag such as v1.42.0.',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy',
      },
      suggest: 'specify a meaningful tag',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    imagePullPolicy: Always\n',
      level: 'warning',
    },
    {
      name: 'ImageTagMiss',
      describe:
        "\nIf you don't specify a tag, Kubernetes assumes you mean the tag latest.\n",
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/containers/images/#image-names',
      },
      suggest: 'specify a meaningful tag',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    imagePullPolicy: Always\n',
      level: 'danger',
    },
    {
      name: 'InsecureCapabilities',
      describe:
        '\nSetting insecure capabilities will cause the Pod to have higher permissions, such as KILL permissions will give the container the permission to kill the host process.\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/',
      },
      suggest:
        'Do not use insecure capabilities such as CHOWN/FSETID/SETFCAP/SETPCAP/KILL',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    imagePullPolicy: Always\n',
      level: 'danger',
    },
    {
      name: 'NoLivenessProbe',
      describe:
        '\nLivenessProbes are used to detect and handle application corruption states.\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command',
      },
      suggest: 'set LivenessProbes',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    livenessProbe:\n      httpGet:\n        path: /healthz\n        port: 8080\n      initialDelaySeconds: 5\n      periodSeconds: 5\n',
      level: 'warning',
    },
    {
      name: 'NoMemoryLimits',
      describe:
        '\nConfiguring memory limits ensures that containers never use too much memory\nIf memory limits are not set, misbehaving applications may end up utilizing most of the available memory on their nodes.\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
      },
      suggest:
        "\nAdd memory limits for each container specification.\nIt's up to you to decide how much memory to allocate to your application. Setting the memory limit too high can lead to cost overruns, while setting it too low can cause your application to OOM.\nFor mission-critical or user-facing applications, KubeEye recommends setting a higher memory limit.\n",
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
      level: 'danger',
    },
    {
      name: 'NoMemoryRequests',
      describe:
        '\nSet a memory resource request, and kube-scheduler uses this information to decide on which node to schedule the Pod.\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
      },
      suggest:
        "\nAdd memory resource requests for each container specification.\nIt's up to you to decide how much memory to allocate to your application. Setting the memory limit too high can cause your app to fail to schedule, while setting it too low can cause your app to grab resources.\nFor mission-critical or user-facing applications, KubeEye recommends setting memory resource requests in line with memory resource limits, which ensures application resource exclusiveness.\n",
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
      level: 'danger',
    },
    {
      name: 'NoPriorityClass',
      describe:
        'PriorityClass defines a mapping from priority class names to priority values',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/priority-class-v1/',
      },
      suggest:
        "\nAdd memory resource requests for each container specification.\nIt's up to you to decide how much memory to allocate to your application. Setting the memory limit too high can cause your app to fail to schedule, while setting it too low can cause your app to grab resources.\nFor mission-critical or user-facing applications, KubeEye recommends setting memory resource requests in line with memory resource limits, which ensures application resource exclusiveness.\n",
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    resources:\n      requests:\n        memory: "64Mi"\n        cpu: "250m"\n      limits:\n        memory: "64Mi"\n        cpu: "250m"\n',
      level: 'ignore',
    },
    {
      name: 'PrivilegedAllowed',
      describe:
        'In Linux, any container in a Pod can enable privileged mode using the privileged (Linux) parameter in the security context in the container spec. This is useful for containers that want to use operating system management capabilities such as manipulating the network stack and accessing devices.',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/workloads/pods/#privileged-mode-for-containers',
      },
      suggest: 'Disable privileged mode',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n',
      level: 'danger',
    },
    {
      name: 'NoReadinessProbe',
      describe:
        '\nNote that if the readiness probe is not implemented correctly, it may cause the number of processes in the container to keep rising. If action is not taken against it, it is likely to lead to a situation of resource depletion.\n',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes',
      },
      suggest: 'set readinessProbe',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  containers:\n  - name: demo\n    image: demo\n    readinessProbe:\n      httpGet:\n        path: /healthy\n        port: 8080\n      initialDelaySeconds: 5\n      periodSeconds: 5\n',
      level: 'warning',
    },
    {
      name: 'NotReadOnlyRootFilesystem',
      describe:
        'Requires that the container must run with the root filesystem mounted read-only (i.e. no writable layers are allowed).',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/docs/concepts/security/pod-security-policy/#volumes-and-file-systems',
      },
      suggest: 'set readOnlyRootFilesystem',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n',
      level: 'warning',
    },
    {
      name: 'NotRunAsNonRoot',
      describe:
        '\nRequires the submitted Pod to have a non-zero runAsUser value, or have a USER environment variable defined in the image (using a UID value). If a Pod has neither runAsNonRoot nor runAsUser set, the Pod is modified to set runAsNonRoot=true, requiring the container to give a non-zero numeric user ID via the USER directive. There is no default value for this configuration. With this configuration, it is strongly recommended to set allowPrivilegeEscalation=false.',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
      },
      suggest: 'set readOnlyRootFilesystem',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
      level: 'warning',
    },
    {
      name: 'CertificateExpiredPeriod',
      describe:
        'The Kubernetes API security certificate is about to expire, and the expiration time is less than 30 days',
      reference: {
        'Kubernetes Documentation':
          'https://kubernetes.io/blog/2016/08/security-best-practices-kubernetes-deployment/',
      },
      suggest: 'Please update the security certificate in time',
      template:
        '\napiVersion: v1\nkind: Pod\nmetadata:\n  name: demo\nspec:\n  readOnlyRootFilesystem: false\n  containers:\n  - name: demo\n    image: demo\n  securityContext:\n    allowPrivilegeEscalation: false\n    readOnlyRootFilesystem: true\n    runAsNonRoot: true\n',
      level: 'warning',
    },
  ];

  useEffect(() => {
    const fnGetData = async ({ ...params } = {}) => {
      const ciList = await clusterInspection.fetchList();
      setCiDataList(toJS(ciList.auditResults));

      const withNamespace = toJS(ciList.auditResults)?.filter(
        item => item.namespace
      );
      const noNamespace = toJS(ciList.auditResults)?.filter(
        item => !item.namespace
      );

      setNamespace(withNamespace);
      setWithoutNamespace(noNamespace);
    };

    fnGetData();
  }, []);

  const handleExpand = (name, valueNamespace, valueType) => {
    setExpandItem(name);
    setExpandItemNamespace(valueNamespace);
    setExpandItemType(valueType);
    setIsExpandFlag(!isExpandFlag);
  };

  const handleTabChange = value => {
    if (value === 'cluster') {
      setTabValue('cluster');
      setButtonDanger(false);
      setButtonPass(false);
      setButtonWarning(false);
      setExpandItem('');
      setIsExpandFlag(!isExpandFlag);
    } else if (value === 'namespace') {
      setTabValue('namespace');
      setButtonDanger(false);
      setButtonPass(false);
      setButtonWarning(false);
      setExpandItem('');
      setIsExpandFlag(!isExpandFlag);
    }
  };

  const tabs = () => {
    return {
      value: tabValue,
      onChange: handleTabChange,
      options: [
        {
          value: `cluster`,
          label: `클러스터`,
        },
        {
          value: `namespace`,
          label: `네임스페이스`,
        },
      ],
    };
  };

  const closeDrawer = e => {
    e.stopPropagation();
    setShowPopup(false);
  };

  const renderContent = () => {
    if (ciDataList?.length == 0) {
      const content = (
        <div className={styles.nodata}>{t('RESOURCES_NOT_FOUND_RESOURCE')}</div>
      );
      return content;
    }

    const withoutNamespaceResult = withoutNamespace
      ?.map(ns => ns?.resultInfos.flat())
      .flat()
      .sort((a, b) => {
        return a.resourceInfos.name > b.resourceInfos.name ? 1 : -1;
      });

    if (tabValue === 'cluster') {
      const content = withoutNamespaceResult
        ?.filter(rslt => {
          const items = rslt?.resourceInfos?.items ?? [];
          if (buttonPass) {
            return items.some(itm => itm?.level === 'pass');
          }
          if (buttonWarning) {
            return items.some(itm => itm?.level === 'warning');
          }
          if (buttonDanger) {
            return items.some(itm => itm?.level === 'danger');
          }
          return true;
        })
        ?.map((value, idx) => {
          return (
            <div className={styles.wrapper} key={`cluster-${idx}`}>
              <div
                className={classnames(styles.expandItem, '', {
                  [styles.expanded]:
                    value?.resourceInfos?.name == expandItem
                      ? isExpandFlag
                      : false,
                })}
              >
                <div className={styles.itemMain}>
                  <div className={styles.icon}>
                    {value.resourceType === 'Node' ? (
                      <Icon name="nodes" size={40} />
                    ) : value.resourceType === 'ClusterRole' ? (
                      <Icon name="cluster" size={40} />
                    ) : value.resourceType === 'Deployment' ? (
                      <Icon name="nodes" size={40} />
                    ) : value.resourceType === 'DaemonSet' ? (
                      <Icon name="deamon-set" size={40} />
                    ) : value.resourceType === 'Role' ? (
                      <Icon name="role" size={40} />
                    ) : value.resourceType === 'StatefulSet' ? (
                      <Icon name="stateful-set" size={40} />
                    ) : value.resourceType === 'Event' ? (
                      <Icon name="event" size={40} />
                    ) : value.resourceType === 'Job' ? (
                      <Icon name="job" size={40} />
                    ) : value.resourceType === 'CronJob' ? (
                      <Icon name="cron-job" size={40} />
                    ) : (
                      ''
                    )}
                    {/* <i
                      className="cluster"
                      type={
                        value?.resourceInfos?.name != expandItem
                          ? 'dark'
                          : value?.resourceInfos?.name == expandItem &&
                            isExpandFlag == false
                          ? 'dark'
                          : 'light'
                      }
                    ></i> */}
                  </div>

                  {renderContentDetail(value)}
                </div>

                {renderExtraContent(value)}
              </div>
            </div>
          );
        });
      return content;
    }
    if (tabValue === 'namespace') {
      const content = namespace
        ?.sort((a, b) => {
          return a.namespace > b.namespace ? 1 : -1;
        })
        ?.map(value => {
          return (
            <>
              <div
                style={{
                  padding: '4px',
                  backgroundColor: '#f9fbfd',
                  borderRadius: '4px',
                }}
              >
                <div
                  style={{
                    // paddingLeft : "13px",
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    wordWrap: 'normal',
                    overflow: 'hidden',
                    fontSize: '12px',
                    lineHeight: 1.67,
                    // fontFamily: 'Roboto', "PingFang SC", "Lantinghei SC", "Helvetica Neue", 'Helvetica', 'Arial', "Microsoft YaHei", 微软雅黑, STHeitiSC-Light, simsun, 宋体, "WenQuanYi Zen Hei", "WenQuanYi Micro Hei", sans-serif,
                    fontStyle: 'normal',
                    fontStretch: 'normal',
                    letterSpacing: 'normal',
                    fontWeight: 'bold',
                    color: '#242e42',
                  }}
                >
                  {value.namespace}
                </div>

                {value?.resultInfos
                  .sort((a, b) => {
                    if (a.resourceInfos.name > b.resourceInfos.name) {
                      return 1;
                    }
                    if (a.resourceInfos.name < b.resourceInfos.name) {
                      return -1;
                    }
                    return 0;
                  })
                  ?.filter(rslt => {
                    const items = rslt?.resourceInfos?.items ?? [];
                    if (buttonPass) {
                      return items.some(itm => itm?.level === 'ignore');
                    }
                    if (buttonWarning) {
                      return items.some(itm => itm?.level === 'warning');
                    }
                    if (buttonDanger) {
                      return items.some(itm => itm?.level === 'danger');
                    }
                    return true;
                  })
                  ?.map((obj, idx) => {
                    const counts = {};

                    (obj.resourceInfos.items || []).forEach(item => {
                      const itemLevel = item.level;
                      counts[itemLevel] = (counts[itemLevel] || 0) + 1;
                    });

                    // Function to generate dot bars based on counts
                    const generateDotBars = () => {
                      const dotBars = [];
                      if (buttonPass) {
                        for (let i = 0; i < (counts.ignore || 0); i++) {
                          dotBars.push(
                            <div
                              key={`ignore-${i}`}
                              className="dot_bar status pass"
                            ></div>
                          );
                        }
                        return dotBars;
                      }
                      if (buttonWarning) {
                        for (let i = 0; i < (counts.warning || 0); i++) {
                          dotBars.push(
                            <div
                              key={`warning-${i}`}
                              className="dot_bar status warning"
                            ></div>
                          );
                        }
                        return dotBars;
                      }
                      if (buttonDanger) {
                        for (let i = 0; i < (counts.danger || 0); i++) {
                          dotBars.push(
                            <div
                              key={`danger-${i}`}
                              className="dot_bar status danger"
                            ></div>
                          );
                        }
                        return dotBars;
                      }
                      if (!(buttonDanger || buttonWarning || buttonPass)) {
                        for (let i = 0; i < (counts.danger || 0); i++) {
                          dotBars.push(
                            <div
                              key={`danger-${i}`}
                              className="dot_bar status danger"
                            ></div>
                          );
                        }

                        for (let i = 0; i < (counts.warning || 0); i++) {
                          dotBars.push(
                            <div
                              key={`warning-${i}`}
                              className="dot_bar status warning"
                            ></div>
                          );
                        }

                        for (let i = 0; i < (counts.ignore || 0); i++) {
                          dotBars.push(
                            <div
                              key={`ignore-${i}`}
                              className="dot_bar status pass"
                            ></div>
                          );
                        }

                        return dotBars;
                      }
                    };

                    return (
                      <div>
                        <div
                          className={styles.wrapper}
                          key={`namespace-${idx}`}
                        >
                          <div
                            className={classnames(styles.expandItem, '', {
                              [styles.expanded]:
                                obj.resourceInfos.name === expandItem &&
                                value.namespace === expandItemNamespace &&
                                obj.resourceType === expandItemType
                                  ? isExpandFlag
                                  : false,
                            })}
                          >
                            <div className={styles.itemMain}>
                              <div className={styles.icon}>
                                {obj.resourceType === 'Node' ? (
                                  <Icon name="nodes" size={40} />
                                ) : obj.resourceType === 'ClusterRole' ? (
                                  <Icon name="cluster" size={40} />
                                ) : obj.resourceType === 'Deployment' ? (
                                  <Icon
                                    name="blue-green-deployment"
                                    size={40}
                                  />
                                ) : obj.resourceType === 'DaemonSet' ? (
                                  <Icon name="deamon-set" size={40} />
                                ) : obj.resourceType === 'Role' ? (
                                  <Icon name="role" size={40} />
                                ) : obj.resourceType === 'StatefulSet' ? (
                                  <Icon name="stateful-set" size={40} />
                                ) : obj.resourceType === 'Event' ? (
                                  <Icon name="event" size={40} />
                                ) : obj.resourceType === 'Job' ? (
                                  <Icon name="job" size={40} />
                                ) : obj.resourceType === 'CronJob' ? (
                                  <Icon name="cron-job" size={40} />
                                ) : (
                                  ''
                                )}
                                {/* <i
                                  className="ico-type24-disk"
                                  type={
                                    obj.resourceInfos.name !== expandItem ||
                                    value.namespace !== expandItemNamespace ||
                                    obj.resourceType !== expandItemType
                                      ? 'dark'
                                      : obj.resourceInfos.name === expandItem &&
                                        value.namespace ===
                                          expandItemNamespace &&
                                        obj.resourceType === expandItemType &&
                                        isExpandFlag === false
                                      ? 'dark'
                                      : 'light'
                                  }
                                ></i> */}
                              </div>

                              <div className={styles.content}>
                                <div className={styles.text}>
                                  <div>{obj?.resourceInfos?.name}</div>
                                  <p>{`이름`}</p>
                                </div>

                                <div className={styles.text}>
                                  <div>{obj?.resourceType}</div>
                                  <p>{`타입`}</p>
                                </div>
                                <div className="content_box_wrap">
                                  <div className="dot_chart_wrap">
                                    <div className="dot_chart">
                                      {generateDotBars()}
                                      <div className="dot_bar"></div>
                                    </div>
                                    <p className="dot_value">
                                      <label>Pass {counts.ignore || 0} </label>
                                      <label>
                                        Warning {counts.warning || 0}
                                      </label>
                                      <label>Danger {counts.danger || 0}</label>
                                      <span className="data"></span>
                                    </p>
                                  </div>
                                </div>

                                {/* {renderMonitorings(obj.resourceInfos)} */}

                                <div
                                  className={styles.arrow}
                                  onClick={() =>
                                    handleExpand(
                                      obj.resourceInfos.name,
                                      value.namespace,
                                      obj.resourceType
                                    )
                                  }
                                >
                                  <Icon
                                    name="chevron-down"
                                    type={
                                      obj.resourceInfos.name !== expandItem ||
                                      value.namespace !== expandItemNamespace ||
                                      obj.resourceType !== expandItemType
                                        ? ''
                                        : obj.resourceInfos.name ===
                                            expandItem &&
                                          value.namespace ===
                                            expandItemNamespace &&
                                          obj.resourceType === expandItemType &&
                                          isExpandFlag === false
                                        ? ''
                                        : 'light'
                                    }
                                    size={20}
                                  />
                                </div>
                              </div>
                            </div>
                            {renderExtraContent(obj)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          );
        });
      return content;
    }
  };
  const renderContentDetail = obj => {
    const counts = {};

    (obj.resourceInfos.items || []).forEach(item => {
      const itemLevel = item.level;
      counts[itemLevel] = (counts[itemLevel] || 0) + 1;
    });

    const generateDotBars = () => {
      const dotBars = [];
      if (buttonPass) {
        for (let i = 0; i < (counts.ignore || 0); i++) {
          dotBars.push(
            <div key={`ignore-${i}`} className="dot_bar status pass"></div>
          );
        }
        return dotBars;
      }
      if (buttonWarning) {
        for (let i = 0; i < (counts.warning || 0); i++) {
          dotBars.push(
            <div key={`warning-${i}`} className="dot_bar status warning"></div>
          );
        }
        return dotBars;
      }
      if (buttonDanger) {
        for (let i = 0; i < (counts.danger || 0); i++) {
          dotBars.push(
            <div key={`danger-${i}`} className="dot_bar status danger"></div>
          );
        }
        return dotBars;
      }

      if (!(buttonDanger || buttonWarning || buttonPass)) {
        for (let i = 0; i < (counts.danger || 0); i++) {
          dotBars.push(
            <div key={`danger-${i}`} className="dot_bar status danger"></div>
          );
        }

        for (let i = 0; i < (counts.warning || 0); i++) {
          dotBars.push(
            <div key={`warning-${i}`} className="dot_bar status warning"></div>
          );
        }

        for (let i = 0; i < (counts.ignore || 0); i++) {
          dotBars.push(
            <div key={`ignore-${i}`} className="dot_bar status pass"></div>
          );
        }

        return dotBars;
      }
    };

    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
            <div>{obj.resourceInfos.name}</div>
            <p>{`이름`}</p>
          </div>

          <div className={styles.text}>
            <div>{obj.resourceType}</div>
            <p>{`타입`}</p>
          </div>
          <div className="content_box_wrap">
            <div className="dot_chart_wrap">
              <div className="dot_chart">
                {generateDotBars()}
                <div className="dot_bar"></div>
              </div>
              <p className="dot_value">
                <label>Pass {counts.ignore || 0} </label>
                <label>Warning {counts.warning || 0}</label>
                <label>Danger {counts.danger || 0}</label>
                <span className="data"></span>
              </p>
            </div>
          </div>

          {/* {renderMonitorings(obj.resourceInfos)} */}

          <div
            className={styles.arrow}
            onClick={() => handleExpand(obj.resourceInfos.name)}
          >
            <Icon
              name="chevron-down"
              type={
                obj.resourceInfos.name !== expandItem
                  ? ''
                  : obj.resourceInfos.name === expandItem &&
                    isExpandFlag === false
                  ? ''
                  : 'light'
              }
              size={20}
            />
          </div>
        </div>
      </>
    );
  };

  const getState = state => {
    if (state === 'ignore') {
      return 'running';
    }
    if (state === 'warning') {
      return 'warning';
    }
    if (state === 'danger') {
      return 'error';
    }
    return 'error';
  };

  const renderExtraContent = (obj, index) => {
    return (
      <>
        <div className={styles.itemExtra} key={`extra-content-${index}`}>
          <div className={styles.containers}>
            {obj?.resourceInfos?.items
              ?.filter(item => {
                if (buttonPass) {
                  return item.level === 'ignore';
                }
                if (buttonWarning) {
                  return item.level === 'warning';
                }
                if (buttonDanger) {
                  return item.level === 'danger';
                }

                return true;
              })
              ?.sort((a, b) => {
                const levelOrder = { danger: 1, warning: 2, ignore: 3 };
                return levelOrder[a.level] - levelOrder[b.level];
              })
              ?.map((item, indexNum) => {
                const foundData = kubeeyeData.find(
                  data => data.name === item.message
                );
                return (
                  <>
                    <div
                      className={classnames(styles.item)}
                      key={`extra-item-${indexNum}`}
                      onClick={e => {
                        if (foundData) {
                          setShowPopup(true);
                          setMessage(foundData.name);
                          setDescribe(foundData.describe);
                          setLevel(foundData.level);
                          setSuggest(foundData.suggest);
                        }
                        if (!foundData) {
                          setShowPopup(false);
                        }
                      }}
                    >
                      <div className={styles.icon}>
                        {obj.resourceType === 'Node' ? (
                          <Icon name="nodes" size={40} />
                        ) : obj.resourceType === 'ClusterRole' ? (
                          <Icon name="cluster" size={40} />
                        ) : obj.resourceType === 'Deployment' ? (
                          <Icon name="blue-green-deployment" size={40} />
                        ) : obj.resourceType === 'DaemonSet' ? (
                          <Icon name="deamon-set" size={40} />
                        ) : obj.resourceType === 'Role' ? (
                          <Icon name="role" size={40} />
                        ) : obj.resourceType === 'StatefulSet' ? (
                          <Icon name="stateful-set" size={40} />
                        ) : obj.resourceType === 'Event' ? (
                          <Icon name="event" size={40} />
                        ) : obj.resourceType === 'Job' ? (
                          <Icon name="job" size={40} />
                        ) : obj.resourceType === 'CronJob' ? (
                          <Icon name="cron-job" size={40} />
                        ) : (
                          ''
                        )}
                        {/* <Icon name="cluster" size={40} /> */}
                        {/* <i className="ico-type24-disk"></i> */}
                      </div>

                      <div className={classnames(styles.title, styles.name)}>
                        <div>{item.message}</div>
                        <p>{`이름`}</p>
                      </div>
                      <div className={styles.title}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Indicator
                            className={styles.indicator}
                            type={getState(item.level)}
                          />
                          <div>
                            {item.level === 'ignore'
                              ? 'pass'
                              : item.level === 'warning'
                              ? 'warning'
                              : item.level === 'danger'
                              ? 'danger'
                              : ''}
                          </div>
                        </div>
                        <p>{`상태`}</p>
                      </div>
                    </div>

                    {foundData && (
                      <>
                        <div
                          className="content_box_wrap"
                          style={{ border: 'none' }}
                        >
                          <div
                            className={`sub_layer_pop ${
                              showPopup ? 'show' : ''
                            }`}
                            id="sub_layer_pop"
                            // style={{ top: '-64px' }}
                          >
                            <div className="layer_pop_header status_wrap">
                              <div className="tit">
                                {message}
                                <p
                                  className={`status ${
                                    level === 'ignore'
                                      ? 'pass'
                                      : level === 'warning'
                                      ? 'warning'
                                      : level === 'danger'
                                      ? 'danger'
                                      : ''
                                  }`}
                                >
                                  <span>{level}</span>
                                </p>
                              </div>
                              <button
                                type="button"
                                className="close"
                                onClick={e => closeDrawer(e)}
                              >
                                <i className="ico ico-close-small"></i>
                              </button>
                            </div>
                            <div className="msg">
                              <i className="ico ico-check"></i>
                              <label
                                className="label"
                                style={{ color: '#36435c' }}
                              >{`Discovered :`}</label>
                              <span>{`1 min ago`}</span>
                            </div>
                            <div className="disc">
                              {`${describe}`}
                              {`${suggest}`}
                            </div>
                            {/* <div className="disc">{`${suggest}`}</div> */}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })}
          </div>
        </div>
      </>
    );
  };

  const renderMonitorings = vmId => {
    const isExpand = false;
    const loading = false;

    if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>;

    const ciData = _.find(clusterInspectionData, data => {
      if (data.metric.pod === vmId) return data;
    });

    if (!ciData)
      return <div className={styles.monitors}>{t('NO_MONITORING_DATA')}</div>;

    const ciArray = [];
    ciArray.push(ciData);

    const configs = getMonitoringCfgs(ciArray);

    return (
      <div className={styles.monitors}>
        <div className={styles.charts}>
          {configs.map(item => {
            const config = getAreaChartOps(item);

            return (
              <div key={item.type}>
                <TinyArea
                  key={item.type}
                  width="100%"
                  height={40}
                  {...config}
                  darkMode={isExpand}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <Tabs tabs={tabs()} />
      <div className="grid_item">
        <div className="grid_title">
          <label>클러스터 상태</label>
          <div className="content_box_wrap">
            <div className="tab_toggle_wrap status_wrap">
              <button
                className={`${
                  !buttonPass
                    ? 'btn tab_toggle status pass'
                    : 'btn tab_toggle on status pass'
                }`}
                type="button"
                onClick={e => {
                  setButtonPass(!buttonPass);
                  //   setButtonDanger(!buttonDanger);
                  //   setButtonWarning(!buttonWarning);
                  setButtonWarning(false);
                  setButtonDanger(false);
                  setShowPopup(false);
                }}
                value="pass"
              >
                <span>Pass</span>
              </button>
              <button
                className={`${
                  !buttonWarning
                    ? 'btn tab_toggle status warning'
                    : 'btn tab_toggle on status warning'
                }`}
                type="button"
                onClick={() => {
                  setButtonWarning(!buttonWarning);
                  //   setButtonPass(!buttonPass);
                  //   setButtonDanger(!buttonDanger);
                  setButtonPass(false);
                  setButtonDanger(false);
                  setShowPopup(false);
                }}
                value="pass"
              >
                <span>Warning</span>
              </button>
              <button
                className={`${
                  !buttonDanger
                    ? 'btn tab_toggle status danger'
                    : 'btn tab_toggle on status danger'
                }`}
                type="button"
                onClick={() => {
                  setButtonDanger(!buttonDanger);
                  //   setButtonWarning(!buttonWarning);
                  //   setButtonPass(!buttonPass);
                  setButtonWarning(false);
                  setButtonPass(false);
                  setShowPopup(false);
                }}
                value="pass"
              >
                <span>Danger</span>
              </button>
            </div>
          </div>
        </div>
        {renderContent()}
      </div>
    </>
  );
};

export default DetailClusterList;
