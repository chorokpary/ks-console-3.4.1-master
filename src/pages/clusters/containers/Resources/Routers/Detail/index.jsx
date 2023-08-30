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
import { Loading } from '@kube-design/components'

import { getLocalTime } from 'utils'
import { trigger } from 'utils/action'
import RouterStore from 'stores/resources/routers'

import DetailPage from 'clusters/containers/Base/Detail'

import routes from './routes'

@inject('rootStore')
@observer
@trigger
export default class RouterDetail extends React.Component {
  store = new RouterStore()

  componentDidMount() {
    this.fetchData()
  }

  get module() {
    return this.store.module
  }

  get name() {
    return 'ROUTER_DETAIL'
  }

  get listUrl() {
    const { cluster } = this.props.match.params
    return `/clusters/${cluster}/routers`
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

  getOperations = () => [
    {
      key: 'edit',
      icon: 'pen',
      text: t('EDIT_INFORMATION'),
      action: 'edit',
      show: this.showEdit,
      onClick: () =>
        this.trigger('router.edit', {
          type: this.name,
          detail: toJS(this.store.detail),
          success: this.fetchData,
        }),
    },
    {
      key: 'viewYaml',
      icon: 'eye',
      text: t('VIEW_YAML'),
      action: 'view',
      onClick: () => {
        this.trigger('router.yaml.view', {
          yaml: this.store.yaml,
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
        this.trigger('router.delete', {
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
        name: t('SNAT 옵션'),
        value: detail.router.enable_snat ? "사용" : "미사용",
      },
      {
        name: t('가상 라우터 IP'),
        value: detail.router.vrouter_ip,
      },
      {
        name: t('내부 네트워크'),
        value: detail.router.internal.length >= 1 ? detail.router.internal.length == 1 ? detail.router.internal[0] : detail.router.internal[0] + " 외 " + (detail.router.internal.length - 1) + "개" : "-",
      },
      {
        name: t('외부 네트워크'),
        value: detail.router.external,
      },
      {
        name: t('설명'),
        value: detail.router.description,
      },
      {
        name: t('생성일'),
        value: getLocalTime(detail.router.timestamp).format('YYYY-MM-DD HH:mm:ss'),
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
      desc: get(this.store.detail.router, 'description', ""),
      operations: this.getOperations(),
      attrs: this.getAttrs(),
      breadcrumbs: [
        {
          label: t('가상 라우터'),
          url: this.listUrl,
        },
      ],
    }

    return <DetailPage stores={stores} routes={routes} {...sideProps} />
  }
}
