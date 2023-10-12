
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

import BareMetalStore from 'stores/resources/baremetal'

const store = new BareMetalStore();

const KeypairDetail = (props) => {

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = () => {
        store.fetchDetail(props.match.params);
    }
    
    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/baremetalmonitoring`

    const routing = props.rootStore.routing;
    const showEdit = !globals.config.presetClusterRoles.includes(props.match.params.name);

    const getAttrs = () => {
      const detail = toJS(store.detail)
  
      if (isEmpty(detail)) {
        return
      }
  
      return [
        {
          name: t('서버 모델명'),
          value: detail.cluster,
        },
        {
          name: t('상태'),
          value: detail.keypair.description,
        },
        {
          name: t('유형'),
          value: detail.keypair.description,
        },
        {
          name: t('코어 수'),
          value: detail.keypair.description,
        },
        {
          name: t('Max, Clock Rate (GHz)'),
          value: detail.keypair.description,
        },
        {
          name: t('Server Age'),
          value: detail.keypair.description,
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
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('메인'),
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

export default inject('rootStore')(observer(KeypairDetail));

