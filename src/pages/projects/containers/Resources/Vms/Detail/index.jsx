
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading, Icon } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

import * as common from 'utils/resources'
import routes from './routes'

import VmStore from 'stores/resources/vms'
import FloatingIpStore from 'stores/resources/floatingip';
import VolumeStore from 'stores/resources/volumes'

const store = new VmStore();
const floatingstore = new FloatingIpStore()
const volumeStore = new VolumeStore()


const VmDetail = (props) => {

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    store.fetchDetail(props.match.params);
  }

  const { workspace, cluster, namespace } = props.match.params
  const listUrl = `/${workspace}/clusters/${cluster}/projects/${namespace}/vms`

  const routing = props.rootStore.routing;
  const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

  const vmName = props.match.params.name;
  const vmId = props.match.params.id;
  const floatingData = toJS(store.floatingList)
  const floatingId = floatingData?.filter((row) => row.instance_id == vmId).map((el) => el.id)[0]
  const floatingIp = floatingData?.filter((row) => row.instance_id == vmId).map((el) => el.floating_ip)[0]

  const showFlavor = !!(store.detail.vm?.image);

  // external만 존재할 경우 fip 할당 숨김처리
  const networkData = store.networksList || [];
  const networkNameArray = store.detail.vm?.networks.map(item => item.name);
  const filterData = networkData?.filter(item => networkNameArray?.includes(item.id));
  const disableFip = !!(filterData.some(obj => !obj.external))

  const fnOpenVncPopup = () => {
    //실제 URL 로 변경 요망
    var apiUrl = "http://" + location.hostname + ":30020";
    var param = "path=k8s/apis/subresources.kubevirt.io/v1alpha3/namespaces/default/virtualmachineinstances/";
    param = param + vmId + "/vnc";

    var popupName = vmId.replaceAll("-", "");
    window.open(apiUrl + '/vnc_lite.html?' + param, popupName, 'resizable=yes,toolbar=no,location=no,status=no,scrollbars=no,menubar=no,width=1280,height=840');
  }

  const getOperations = () => [
    {
      key: 'edit',
      icon: 'pen',
      text: t('EDIT_INFORMATION'),
      action: 'edit',
      show: showEdit,
      onClick: () => {
        props.rootStore.triggerAction('vm.edit', {
          type: 'VM_DETAIL',
          detail: toJS(store.detail),
          store: store,
          success: fetchData,
          ...props.match.params,
        })
      },
    },
    {
      key: 'vnc',
      icon: 'vpn',
      text: t('RESOURCES_ACCESS_VNC'),
      action: 'view',
      onClick: () => {
        fnOpenVncPopup();
      },
    },
    {
      key: 'securitygroup',
      icon: 'shield',
      text: t('RESOURCES_VM_SECURITYGROUP_EDIT'),
      action: 'view',
      onClick: () => {
        props.rootStore.triggerAction('vm.edit.securitygroup', {
          type: 'VM_DETAIL',
          store: store,
          success: fetchData,
          ...props.match.params
        });
      },
    },
    {
      key: 'flavor',
      icon: 'apps',
      text: t('RESOURCES_VM_FLAVOR_EDIT'),
      action: 'view',
      show: showFlavor,
      onClick: () => {
        props.rootStore.triggerAction('vm.edit.flavor', {
          type: 'VM_DETAIL',
          store: store,
          success: fetchData,
          ...props.match.params
        });
      },
    },
    {
      key: 'floatingIp',
      icon: 'intranet-routers',
      text: floatingIp == undefined ? t('RESOURCES_ALLOCATE_FIP') : t('RESOURCES_DEALLOCATE_FIP'),
      action: 'edit',
      show: showEdit,
      disabled: !disableFip,
      onClick: () => {
        if (floatingIp == undefined) {
          props.rootStore.triggerAction('vm.floatingIpPop', {
            type: 'VM_DETAIL',
            store: store,
            success: fetchData,
            ...props.match.params
          })
        } else {
          props.rootStore.triggerAction('vm.floatingIpPop.deallocate', {
            data: { ...props.match.params, id: floatingId },
            store: floatingstore,
            success: fetchData,
          })
        }
      },
    },
    {
      key: 'volume',
      icon: 'storage',
      text: t('RESOURCES_VOLUME_MANAGEMENT'),
      action: 'edit',
      show: showEdit,
      onClick: () => {
        props.rootStore.triggerAction('vm.volumePop', {
          type: 'VM_DETAIL',
          store: store,
          success: fetchData,
          ...props.match.params
        })
      },
    },
    {
      key: 'viewYaml',
      icon: 'eye',
      text: t('VIEW_YAML'),
      action: 'view',
      onClick: () => {
        props.rootStore.triggerAction('vm.yaml.view', {
          yaml: store.yaml,
          readOnly: true,
        })
      },
    },
    {
      key: 'viewLog',
      icon: 'eye',
      text: t('RESOURCES_CONSOLE_LOG'),
      action: 'view',
      onClick: async () => {
        const vmLog = await store.fetchVmLog(props.match.params);
        props.rootStore.triggerAction('vm.log.view', {
          vmlog: vmLog,
          readOnly: true,
        })
      },
    },
    {
      key: 'migrate',
      icon: 'radio',
      text: t('RESOURCES_MIGRATION'),
      action: 'edit',
      show: showEdit,
      disabled: get(store.detail.vm, 'migratable') ? false : true,
      onClick: () => {

        const data = {};
        data.vmName = vmName;
        data.vmId = vmId;
        data.actionType = "migrate";

        props.rootStore.triggerAction('vm.actionState', {
          data: data,
          store: store,
          title: t('RESOURCES_MIGRATION'),
          desc: t('RESOURCES_MIGRATION_TIP') + "\n" + t('RESOURCES_VM_MIGRATION_DESC'),
        },)

      },
    },
    {
      key: 'snapshot',
      icon: 'resourceIcon:snapshot',
      text: t('RESOURCES_SNAPSHOT'),
      action: 'edit',
      show: showEdit,
      disabled: get(store.detail.vm, 'snapshotable') ? false : true,
      onClick: () => {
        const data = {};
        data.vmName = vmName;
        data.vmId = vmId;

        props.rootStore.triggerAction('vm.snapshotPop', {
          ...props.match.params,
          data: data,
          store: store,
          success: fetchData,

        })
      },
    },
    {
      key: 'clone',
      icon: 'resourceIcon:clone',
      text: t('RESOURCES_CLONE'),
      action: 'edit',
      show: showEdit,
      disabled: get(store.detail.vm, 'snapshotable') ? false : true,
      onClick: () => {
        const data = {};
        data.vmName = vmName;
        data.vmId = vmId;

        props.rootStore.triggerAction('vm.clonePop', {
          ...props.match.params,
          data: data,
          store: store,
          success: fetchData,
        })
      },
    },
    {
      key: 'delete',
      icon: 'trash',
      text: t('DELETE'),
      action: 'delete',
      type: 'danger',
      show: showEdit,
      onClick: () =>
        props.rootStore.triggerAction('vm.remove', {
          type: 'VM_DETAIL',
          detail: toJS(store.detail),
          store: store,
          ...props.match.params,
          success: () => routing.push(listUrl),
        }),
    },
  ]

  const getAttrs = () => {
    const detail = toJS(store.detail)

    if (isEmpty(detail)) {
      return
    }

    return [
      {
        name: t('RESOURCES_CLUSTER'),
        value: detail.cluster,
      },
      {
        name: t('RESOURCES_IMAGE'),
        value: detail.vm.image?.name,
      },
      {
        name: t('Flavor'),
        value: detail.vm.flavor.name,
      },
      {
        name: t('RESOURCES_NETWORK'),
        value: detail.vm.networks.length > 0 ?
          detail.vm.networks && (detail.vm.networks).map((network) => {
            if (network.name != "k8s-pod-network") {
              return <p key={network.name}>{network.ip}</p>
            } else if (detail.vm.networks.length == 1 && network.name == "k8s-pod-network") {
              return <p key={network.name}>-</p>
            }
          })
          : "-"
      },
      {
        name: t('RESOURCES_FLOATING_IP'),
        value: floatingIp,
      },
      {
        name: t('RESOURCES_KEYPAIR'),
        value: get(detail.vm.keypair, "name", "-"),
      },
      {
        name: t('RESOURCES_LOAD_BALANCER'),
        value: "-",
      },
      {
        name: t('RESOURCES_SECURITY_GROUP'),
        value: detail.vm.security_groups.length > 0 ?
          detail.vm.security_groups && (detail.vm.security_groups).map((security) => (
            <p key={security.id}>{security.name}</p>
          ))
          : "-",
      },
      {
        name: t('RESOURCES_DESCRIPTION'),
        value: detail.vm.description,
      },
      {
        name: t('RESOURCES_CREATE_TIME'),
        value: getLocalTime(detail.vm.creation_timestamp).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  if (store.isLoading) {
    return <Loading className="ks-page-loading" />;
  }

  const getBanner = () => {
    return <i className="ico-type24-vm"></i>
  }

  const sideProps = {
    icon: getBanner(),
    module: store.module,
    name: get(store.detail, 'name'),
    desc: get(store.detail.flavor, 'description', ''),
    // operations: get(store.detail.vm, 'migratable') ? getOperations() : getOperations().filter((data) => data.key != "migrate"),
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('RESOURCES_VM'),
        url: listUrl,
      },
    ],
  }

  return (
    <>
      <DetailPage
        stores={{ detailStore: store }}
        routes={routes}
        {...sideProps} />
    </>
  )
}

export default inject('rootStore')(observer(VmDetail));

