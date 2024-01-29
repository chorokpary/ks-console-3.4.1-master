
import React, { useEffect, useState } from 'react'
import DetailPage from 'clusters/containers/Base/Detail'

import { useParams } from 'react-router-dom';
import { toJS } from 'mobx'
import { cloneDeep, get, isEmpty, omit, find } from 'lodash'
import { Loading } from '@kube-design/components';
import { observer, inject } from 'mobx-react';
import { Card } from 'components/Base'
import { getLocalTime } from 'utils'

import * as common from 'utils/resources'
import routes from './routes'

import BareMetalStore from 'stores/resources/baremetal'
import CustomStore from 'stores/monitoring/custom/monitor'

const store = new BareMetalStore();
const customStore = new CustomStore()

const BareMetalDetail = (props) => {

   const [metricModel, setMetricModel] = useState() 
   const [metricState, setMetricState] = useState()
   const [metricType, setMetricType] = useState()
   const [metricCore, setMetricCore] = useState()
   
    useEffect(() => {
        fetchData();
        getMetricData();
    }, [])

    const getMetricData = async () => {

      const currentTime = Math.floor(Date.now() / 1000);

      const metric_state = await customStore.fetchMetric({
        expr: `max by(instance) (redfish_system_power_state)`,
        start: currentTime,
        end: currentTime,
      })
  
      const metric_model = await customStore.fetchMetric({
        expr: `max by(instance, model) (redfish_chassis_model_info)`,
        start: currentTime,
        end: currentTime,
      })
  
      const metric_type = await customStore.fetchMetric({
        expr: `max by(instance, machine) (node_uname_info)`,
        start: currentTime,
        end: currentTime,
      })
  
      const metric_core = await customStore.fetchMetric({
        expr: `count(node_cpu_seconds_total{mode="idle"}) without (cpu,mode)`,
        start: currentTime,
        end: currentTime,
      })
    
      const metric_power = await customStore.fetchMetric({
        expr: `avg by(instance) (redfish_chassis_power_powersupply_last_power_output_watts)`,
        start: currentTime,
        end: currentTime,
      })  
     
      const metric_temperature = await customStore.fetchMetric({
        expr: `avg by(instance) (redfish_chassis_temperature_celsius)`,
        start: currentTime,
        end: currentTime,
      })
  
      const detailData = toJS(store.detail)
      const instance = detailData.systemType == "C" ? detailData.name : (detailData.baremetals).find(item => item.name == detailData.name).nodeExporter.ip;

      const metrics = metric_model.find(item => get(item, 'metric.instance').split(":")[0] === instance)
      const modelName = get(metrics, 'metric.model')  
      setMetricModel(modelName)

      const data_state = metric_state.find(item => get(item, 'metric.instance').split(":")[0] === instance)
      const state = get(data_state, 'values[0][1]');
      const statText = (state == 1 || state == 3) ? "On" : "Off"
      setMetricState(statText);

      const data_type = metric_type.find(item => get(item, 'metric.instance').split(":")[0] === instance)
      const machine = get(data_type, 'metric.machine',"NOT")     
      const typeText = (machine == "NOT") ? "-" : machine.includes('x86') ? "AMD64" : "ARM64"
      setMetricType(typeText)

      const data_core = metric_core.find(item => get(item, 'metric.instance').split(":")[0] === instance)
      const coreCount = get(data_core, 'values[0][1]', 0);
      setMetricCore(coreCount)

    };

    const getSystemType = async (name) => {
      const dataList = await store.fetchList();
      const systemType = dataList.filter(item => item.name == name).map(obj => obj.system_type)[0];
      return systemType;
    }

    const fetchData = async () => {      
      const systemType = await getSystemType(props.match.params.name);

      let params = props.match.params;
      params.systemType = systemType

      store.fetchDetail(params);
    }
    
    const { cluster } = props.match.params
    const listUrl = `/clusters/${cluster}/baremetalmonitoring`

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
            props.rootStore.triggerAction('baremetal.edit', {
            type: 'BAREMETAL_DETAIL',
            detail: toJS(store.detail),
            store: store,
            success: fetchData,
          }),
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('DELETE'),
        action: 'delete',
        type: 'danger',
        show: showEdit,
        onClick: () =>
            props.rootStore.triggerAction('baremetal.remove', {
            type: 'BAREMETAL_DETAIL',
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
          name: t('RESOURCES_SERVER_MODEL_NAME'),
          value: metricModel,
        },
        {
          name: t('RESOURCES_STATE'),
          value: metricState,
        },
        {
          name: t('RESOURCES_CPU_TYPE'),
          value: metricType,
        },
        {
          name: t('RESOURCES_CORE_COUNT'),
          value: metricCore,
        },
      ]
    }

    if (store.isLoading) {
        return <Loading className="ks-page-loading" />;
    }

    const sideProps = {
        module: store.module,
        name: get(store.detail, 'name'),
        desc: get(store.detail.data, 'description', ''),
        operations: getOperations(),
        attrs: getAttrs(),
        breadcrumbs: [
            {
                label: t('RESOURCES_MAIN'),
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

export default inject('rootStore')(observer(BareMetalDetail));

