import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Panel } from 'components/Base'

import AlertRuleItem from './Item'

import AlertingPolicyStore from 'stores/alerting/policy'

import styles from './index.scss'

const Status = (props) => {
  const store = props.detailStore;

  const detail = store.message.detailMessage

  const { cluster, namespace } = props.match.params

  const policyStore = new AlertingPolicyStore()

  const [rule, setRule] = useState(null);
  const [expandIndex, setExpandIndex] = useState("");

  useEffect(() => {
     if (detail) {
      fnGetData()
     }
    }, [detail])
  
  const fnGetData = async () => {
    
    if (!detail) return;

    const params = {
      cluster,
      name: detail.labels.rule_group,
      type : detail?.state_type == "builtin" ? "builtin" : '',      
    }

    const policyData = await policyStore.fetchDetail(params)
    const rules = policyData._originData.spec.rules
    const matctRuleData = rules.find(item => item.alert === detail.labels.alertname) || {}
    const matctRuleDataIndex = rules.findIndex(item =>  item.alert === detail.labels.alertname )
    const stateData = get(policyData,`_originDataWithStatus.status.rulesStatus[${matctRuleDataIndex}]`, {} ) || {}
    
    const ruleData = {
      ...matctRuleData,
      state: stateData
    }

    setRule(ruleData)
  }

  const handleExpandClick = index => {
    setExpandIndex((prevIndex) =>
      prevIndex === index ? "" : index
    );
  }  
  
  return (
    <>
       <Panel title={t('ALERTING_RULE')}>
        {rule && ( <AlertRuleItem
            key={0}
            rule={rule}
            index={0}
            store={policyStore}
            isExpand={expandIndex === 0}
            status={rule.state}
            onExpandClick={handleExpandClick}
            cluster={cluster}
            namespace={namespace}
          ></AlertRuleItem> 
        )}
      </Panel>
    </>
  );
};

export default inject('detailStore')(observer(Status))

