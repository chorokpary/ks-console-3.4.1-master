import React, { useEffect } from 'react';

import { toJS } from 'mobx';
import { get, isEmpty } from 'lodash';
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import DetailPage from 'projects/containers/Base/Detail';

import { getLocalTime } from 'utils'
import { MODULE_KIND_MAP } from 'utils/constants'
import { getAlertingResource } from 'utils/alerting'

import { Status } from 'components/Base'

import routes from './routes';

const MessageDetail = props => {

  const { workspace, cluster, namespace, name } = props.match.params; 
  // const listUrl = `/${workspace}/clusters/${cluster}/projects/${namespace}/alerts`;
  const listUrl = `/clusters/${cluster}/alerts${props.rootStore.message?.detailMessage.state_type === "builtin" ? "?type=builtin" : ""}`;

  const getOperations = () => [   
  ];

  const severityOptions = [
  {
    label: t('CRITICAL_ALERT'),
    value: 'critical',
    bgColor: '#CA2621',
    color: '#FFFFFF',
  },
  {
    label: t('ERROR_ALERT'),
    value: 'error',
    color: '#FFFFFF',
    bgColor: '#F5A623',
  },
  {
    label: t('WARNING_ALERT'),
    value: 'warning',
    color: '#36435C',
    bgColor: '#D8DEE5',
  },
]

  const getAttrs = () => {
    const detail = toJS(props.rootStore.message?.detailMessage);

    if (isEmpty(detail)) {
      return;
    }

    const state =  <Status
                      type={detail.state}
                      name={t(`ALERT_RULE_${detail.state.toUpperCase()}`, {
                        defaultValue: detail.state,
                      })}
                    />

    const level = severityOptions.find(item => item.value === detail.labels.severity)

    let levelText = "-"
    if (level) {
      levelText = <span
                    style={{
                      backgroundColor: level.bgColor,
                      color: level.color,
                      fontWeight: 600,
                      padding: '0px 4px',
                    }}
                  >
                    {t(level.label)}
                  </span>    
    }

    const getMonitoringTarget = (labels) => {
      const { rule_type } = labels
      if (rule_type !== 'template') {
        return '-'
      }

      const { module, name, namespace } = getAlertingResource(labels)
      if (!module) {
        return '-'
      }

      if (module === 'hpas') {
        return (
          <span>
            {t(MODULE_KIND_MAP[module])}: {name}
          </span>
        )
      }
      return (
        <Link to={`${this.getPrefix({ namespace })}/${module}/${name}`}>
          {t(MODULE_KIND_MAP[module])}: {name}
        </Link>
      )
    }

    return [
      {
        name: t('DESCRIPTION'),
        value: detail.annotations.description ? detail.annotations.description : detail.annotations.message,
      },
      {
        name: t('STATUS'),
        value: state,
      },
      {
        name: t('SEVERITY'),
        value: levelText,
      },
      {
        name: t('ALERTING_NAME'),
        value: detail.labels.alertname,
      },      
      {
        name: t('ALERTING_POLICY'),
        value: detail.labels.rule_group,
      },
      {
        name: t('MONITORING_TARGET'),
        value: getMonitoringTarget(detail.labels),
      },
      {
        name: t('TRIGGER_TIME'),
        value: getLocalTime(detail.activeAt).format(
          'YYYY-MM-DD HH:mm:ss'
        ),
      },
    ];
  };

  // if (store.isLoading) {
  //   return <Loading className="ks-page-loading" />;
  // }

  const sideProps = {
    icon: 'loudspeaker',
    module: 'alerts',
    name: name,
    operations: getOperations(),
    attrs: getAttrs(),
    breadcrumbs: [
      {
        label: t('ALERTING_MESSAGE'),
        url: listUrl,
      },
    ],
  };

  return (
    <>
      <DetailPage
        stores={{ detailStore: props.rootStore}}
        cluster={cluster}
        routes={routes}
        {...sideProps}
      />
    </>
  );
};

export default inject('rootStore')(observer(MessageDetail));
