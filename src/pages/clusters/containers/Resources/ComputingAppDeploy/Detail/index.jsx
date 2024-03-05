
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

import AppDeployStore from 'stores/resources/appdeploy'

const store = new AppDeployStore();

const AppManageDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    
    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/computingappdeploy`

    const routing = props.rootStore.routing;
    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

    const getOperations = () => [
      {
        key: 'edit',
        icon: 'pen',
        text: t('EDIT_INFORMATION'),
        action: 'edit',
        show: showEdit,
        onClick: () =>
            props.rootStore.triggerAction('computingappdeploy.edit', {
            type: 'APPDEPLOY_DETAIL',
            detail: toJS(store.detail),
            store: store,
            success: fetchData,
          }),
      },
      {
        key: 'deploy',
        icon: 'blue-green-deployment',
        text: t('RESOURCES_DEPLOY'),
        action: 'view',
        onClick: () => {
            props.rootStore.triggerAction('computingappdeploy.deploy', {
            type: 'APPDEPLOY_DETAIL',
            detail: toJS(store.detail),
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
            props.rootStore.triggerAction('computingappdeploy.remove', {
            type: 'APPDEPLOY_DETAIL',
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
          name: t('RESOURCES_CLUSTER'),
          value: detail.cluster,
        },
        {
          name: t('RESOURCES_NAME'),
          value: detail.name,
        },
        {
          name: t('RESOURCES_VERSION'),
          value: detail.version,
        },
        {
          name: t('Playbook'),
          value: detail.playbookName,
        },
        {
          name: t('RESOURCES_VM'),
          value:  detail.vm.length > 0
                  ? detail.vm&&
                    detail.vm.map(vm => (
                      <p key={vm.name}>{vm.name}</p>
                    ))
                  : '-',
        },
        {
          name: t('RESOURCES_SIZE'),
          value: common.fnFormatBytes((detail.playbookSize).toString()),
        },
        {
          name: t('RESOURCES_REGIST_DATE'),
          value: getLocalTime(detail.registrationDate).format('YYYY-MM-DD HH:mm:ss'),
        },
      ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        icon: "application",
        module: store.module,
        name: get(store.detail, 'name'),
        desc: get(store.detail.flavor, 'description', ''),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('RESOURCES_APP_DEPLOY_MANAGE'),
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

export default inject('rootStore')(observer(AppManageDetail));

