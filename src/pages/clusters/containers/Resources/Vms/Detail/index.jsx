
import React, { useEffect } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { get, isEmpty } from 'lodash'
import { Loading } from '@kube-design/components';
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
    
    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/vms`

    const routing = props.rootStore.routing;
    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

    const vmName = props.match.params.name;
    const floatingData = toJS(store.floatingList)
    const floatingId = floatingData?.filter((row) => row.instance_name == vmName).map((el) => el.id)[0]
    const floatingIp = floatingData?.filter((row) => row.instance_name == vmName).map((el) => el.floating_ip)[0]

    const volumeData = toJS(store.volumeList)
    const volumeName = volumeData?.filter((row) => row.used_by_vmi == vmName).map((el) => el.name)[0]
  
    const fnOpenVncPopup = () => {
      //실제 URL 로 변경 요망
      var apiUrl = "http://"+location.hostname+":30020";
      var param = "path=k8s/apis/subresources.kubevirt.io/v1alpha3/namespaces/default/virtualmachineinstances/";
      param = param + vmName + "/vnc";
  
      var popupName = vmName.replaceAll("-", "");
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
          })
        },        
      },
      {
        key: 'vnc',
        icon: 'vpn',
        text: t('VNC 접속'),
        action: 'view',
        onClick: () => {
          fnOpenVncPopup();
        },
      },
      {
        key: 'floatingIp',
        icon: 'intranet-routers',
        text: floatingIp == undefined ? 'FIP 할당' : "FIP 해제",
        action: 'view',
        onClick: () => {
          if(floatingIp == undefined){
              props.rootStore.triggerAction('vm.floatingIpPop', {
              type: 'VM_DETAIL',
              store: store,
              success: fetchData,
            })
          }else{
              props.rootStore.triggerAction('vm.floatingIpPop.deallocate', {
              data: { id: floatingId },
              store: floatingstore,
              success: fetchData,
            })
          }  
        },        
      },
      {
        key: 'volume',
        icon: 'storage',
        text: volumeName == undefined ? '볼륨 연결' : "볼륨 분리",
        action: 'view',
        onClick: () => {
          if(volumeName == undefined){
              props.rootStore.triggerAction('vm.volumePop', {
              type: 'VM_DETAIL',
              store: store,
              success: fetchData,
            })
          }else{
              props.rootStore.triggerAction('vm.volumePop.detach', {
              data: { vmName: vmName, volumeName : volumeName, actionType : "D" },
              store: volumeStore,
              success: fetchData,
            })
          }            
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
        text: t('Console 로그'),
        action: 'view',
        onClick: () => {
            props.rootStore.triggerAction('vm.log.view', {
            vmlog: store.vmLog,
            readOnly: true,
          })
        },
      },
      {
        key: 'migrate',
        icon: 'radio',
        text: t('마이그레이션'),
        action: 'view',
        onClick: () => {

          const data = {};
          data.vmName = vmName;
          data.actionType = "migrate";
          
            props.rootStore.triggerAction('vm.actionState', {
            data: data,
            store: store,
            title : "마이그레이션",
            desc: "마이그레이션을 진행 하시겠습니까?\n가상머신 상태가 마이그레이션중으로 변경되고,\n완료되면 가상머신 상태가 표시됩니다",
          },)
  
        },
      },
      {
        key: 'snapshot',
        icon: 'snapshot',
        text: "스냅샷",
        action: 'view',
        onClick: () => {
          const data = {};
          data.vmName = vmName;

            props.rootStore.triggerAction('vm.snapshotPop', {
              data: data,
              store: store,
              success: fetchData,
            }) 
        },        
      },
      {
        key: 'clone',
        icon: 'snapshot',
        text: "클론",
        action: 'view',
        onClick: () => {
          const data = {};
          data.vmName = vmName;
          
            props.rootStore.triggerAction('vm.clonePop', {
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
            props.rootStore.triggerAction('vm.delete', {
            type: 'VM_DETAIL',
            detail: toJS(store.detail),
            store: store,
            cluster: props.match.params.cluster,
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
          name: t('클러스터'),
          value: detail.cluster,
        },
        {
          name: t('이미지'),
          value: detail.vm.image,
        },
        {
          name: t('Flavor'),
          value: detail.vm.flavor.name,
        },
        {
          name: t('네트워크'),
          value: detail.vm.networks.length > 0 ?
                  detail.vm.networks && (detail.vm.networks).map((network) => {
                    if (network.name != "k8s-pod-network") {
                      return <p key={network.name}>{network.ip}</p>
                    }else if(detail.vm.networks.length ==1 && network.name == "k8s-pod-network"){
                      return <p key={network.name}>-</p>
                    }
                  })
                : "-"
        },
        {
          name: t('SR-IOV 네트워크'),
          value: "-",
        },
        {
          name: t('플로팅 IP'),
          value: floatingIp,
        },
        {
          name: t('키페어'),
          value: detail.vm.keypair,
        },
        {
          name: t('로드밸런서'),
          value: "-",
        },
        {
          name: t('보안그룹'),
          value: detail.vm.security_groups.length > 0 ? 
                  detail.vm.security_groups && (detail.vm.security_groups).map((security) => (
                    <p key={security}>{security}</p>
                  ))
                : "-",
        },
        {
          name: t('설명'),
          value: detail.vm.description,
        },
        {
          name: t('생성시간'),
          value: getLocalTime(detail.vm.creation_timestamp).format('YYYY-MM-DD HH:mm:ss'),
        },
      ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        module: store.module,
        name: get(store.detail, 'name'),
        desc: get(store.detail.flavor, 'description', ''),
        operations: get(store.detail.vm, 'migratable') ? getOperations() : getOperations().filter((data) => data.key != "migrate"),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('가상머신'),
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

