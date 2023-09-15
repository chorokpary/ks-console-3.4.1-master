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

import React from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { get, isEmpty } from 'lodash'
import { Loading, Notify } from '@kube-design/components'

import { getLocalTime } from 'utils'
import { trigger } from 'utils/action'
import ResourceStore from 'stores/resources/containerResource'

import DetailPage from 'clusters/containers/Base/Detail'

import routes from './routes'

@inject('rootStore')
@observer
@trigger
export default class ResourceDetail extends React.Component {
    store = new ResourceStore()

    componentDidMount() {
        this.fetchData()
    }

    get module() {
        return this.store.module
    }

    get name() {
        return 'RESOURCE_DETAIL'
    }

    get listUrl() {
        const { cluster } = this.props.match.params
        return `/clusters/${cluster}/containerResource`
    }

    get routing() {
        return this.props.rootStore.routing
    }

    get showEdit() {
        const { name } = this.props.match.params
        return !globals.config.presetClusterRoles.includes(name)
    }

    fetchData = () => {
        this.store.fetchDetail(this.props.match.params);
    }

    fnOpenVncPopup = () => {
        //실제 URL 로 변경 요망
        var apiUrl = "http://" + location.hostname + ":30020";
        var param = "path=k8s/apis/subresources.kubevirt.io/v1alpha3/namespaces/default/virtualmachineinstances/";
        param = param + this.name + "/vnc";

        var popupName = this.name.replaceAll("-", "");
        window.open(apiUrl + '/vnc_lite.html?' + param, popupName, 'resizable=yes,toolbar=no,location=no,status=no,scrollbars=no,menubar=no,width=1030,height=800');
    }

    getOperations = () => [
        {
            key: 'edit',
            icon: 'pen',
            text: t('EDIT_INFORMATION'),
            action: 'edit',
            show: this.showEdit,
            onClick: () => {
                this.trigger('containerresource.edit', {
                    type: this.name,
                    detail: toJS(this.store.detail),
                    success: this.fetchData,
                })
            },
        },
        {
            key: 'vnc',
            icon: 'vpn',
            text: t('VNC 접속'),
            action: 'view',
            onClick: () => {
                this.fnOpenVncPopup();
            },
        },
        {
            key: 'viewYaml',
            icon: 'eye',
            text: t('VIEW_YAML'),
            action: 'view',
            onClick: () => {
                this.trigger('containerresource.yaml.view', {
                    yaml: this.store.yaml,
                    readOnly: true,
                })
            },
        },
        {
            key: 'viewConfig',
            icon: 'eye',
            text: t('Console Config'),
            action: 'view',
            onClick: () => {
                this.trigger('containerresource.config.view', {
                    vmlog: this.store.vmLog,
                    readOnly: true,
                })
            },
        },
        {
            key: 'delete',
            icon: 'trash',
            text: t('DELETE'),
            action: 'delete',
            type: 'danger',
            show: this.showEdit,
            onClick: () =>
                this.trigger('containerresource.delete', {
                    type: this.name,
                    detail: toJS(this.store.detail),
                    cluster: this.props.match.params.cluster,
                    success: () => this.routing.push(this.listUrl),
                }),
        },
    ]

    getAttrs = () => {
        const detail = toJS(this.store.detail)

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
                        } else if (detail.vm.networks.length == 1 && network.name == "k8s-pod-network") {
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
                value: detail.vm.floatingIp,
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

    render() {
        const stores = { detailStore: this.store }

        if (this.store.isLoading && !this.store.detail.name) {
            return <Loading className="ks-page-loading" />
        }

        const sideProps = {
            module: this.module,
            name: get(this.store.detail, 'name'),
            desc: get(this.store.detail.vm, 'description', ""),
            operations: this.getOperations(),
            attrs: this.getAttrs(),
            breadcrumbs: [
                {
                    label: t('쿠버네티스'),
                    url: this.listUrl,
                },
            ],
        }

        return <DetailPage stores={stores} routes={routes} {...sideProps} />
    }
}
