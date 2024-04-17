import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import { getAreaChartOps } from 'utils/monitoring'
import { get } from 'lodash'
import TinyArea from 'projects/containers/Overview/ResourceUsage/TinyArea'
import VmStore from 'stores/resources/vms'
import KaasStore from 'stores/resources/containerresource'
import moment from 'moment-mini'

const MetricTypes = {
  pod_running_count: 'cluster_pod_running_count',
}

const ResourceChange = ({ monitorStore, x, y, w, h, ...props }) => {
  const vmStore = new VmStore();
  const kaasStore = new KaasStore();

  const [metricData, setMetricData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [podCnt, setPodCnt] = useState(0);
  const [podContent, setPodContent] = useState([
    {
      type: 'pod',
      title: 'POD',
      legend: ['run'],
      unit: '',
      metricType: MetricTypes.pod_running_count,
      data: [],
    },
  ]);
  const [vmCnt, setVmCnt] = useState(0);
  const [vmData, setVmData] = useState({});
  const [vmLoading, setVmLoading] = useState(true);
  const [kaasCnt, setKaasCnt] = useState(0);
  const [kaasData, setKaasData] = useState([]);
  const [kaasLoading, setKaasLoading] = useState(true);

  useEffect(() => {

    let cleanupTrigger = true;
    const getData = async () => {
      setLoading(true)

      const metricData = await monitorStore.fetchMetrics({
        metrics: Object.values(MetricTypes),
        // step: `${Math.floor(4320)}s`, // Time interval
        // times: 10,
        fillZero: true,
        step: '1d',
        times: 10,
        cluster: props.cluster
      })

      const vmData = await vmStore.vmList({ sortBy: 'creation_timestamp', ...props })
      const kaasData = await kaasStore.fetchList({ limit: 1000, sortBy: 'timestamp', ...props })

      if (cleanupTrigger) {
        setMetricData(metricData)
        handleDate(vmData, 'creation_timestamp', 'vm')
        handleDate(kaasData, 'timestamp', 'kaas')
        setLoading(false)
      }
    };
    getData();
    return () => {
      cleanupTrigger = false
      setLoading(false)
    }

  }, [])

  useEffect(() => {
    const result = [
      {
        type: 'pod',
        title: 'POD',
        legend: ['Run'],
        unit: '',
        metricType: MetricTypes.pod_running_count,
        data: [
          get(metricData, `${MetricTypes.pod_running_count}.data.result[0]`, {}),
        ],
      },
    ]
    setPodContent(result?.[0])

    const config = getAreaChartOps(result?.[0])
    const lastData = config.data[config.data.length - 1];
    setPodCnt(lastData)
  }, [metricData])


  // recent week
  const handleDate = (list, dateType, resourceType) => {
    let date = new Date();
    let unixTime = date.getTime();

    let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let arrIdx = arr.length - 1;
    let cnt = list.length;
    let idx = 0;
    while (arrIdx >= 0 && idx < list.length) {
      if (unixTime > new Date(list[idx][dateType])) {
        arr[arrIdx] = cnt;
        unixTime -= 86400000; // the day before
        arrIdx--;
      } else {
        idx++;
        cnt--;
      }
    }

    let arrList = [];
    unixTime = date.getTime();
    arr.map((el, idx) => {
      arrList.unshift({
        time: moment(unixTime).format('MM-DD HH:mm'),
        'Run': arr[arr.length - 1 - idx]
      })
      unixTime -= 86400000;
    })

    if (resourceType == 'vm') {
      setVmData({ data: arrList });
      setVmCnt(arr[arr.length - 1]);
      setVmLoading(false)
    } else if (resourceType == 'kaas') {
      setKaasData({ data: arrList });
      setKaasCnt(arr[arr.length - 1]);
      setKaasLoading(false)
    }
  }

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>{t('RESOURCES_RESOURCE_CHANGE_AMOUNT')}</label>
              <div className="right">

              </div>
            </div>
            <Loading spinning={loading || vmLoading || kaasLoading}>
              <>
                <div className="grid_info style_status box_long">
                  <div className="box type_status">
                    <div className="cont_group">
                      <h5><i className="ico-type-pod"></i>Pod</h5>
                      <div className="number_wrap">
                        <p><span className="em">{podCnt?.Run}</span></p>
                      </div>
                      {/* <div className="cont2">
                    <div className="status_wrap">
                      <div className="value">1</div>
                      <p><span>Created</span></p>
                    </div>
                    <div className="status_wrap">
                      <div className="value">0</div>
                      <p><span>Deleted</span></p>
                    </div>
                  </div> */}
                      <TinyArea {...getAreaChartOps(podContent)} bgColor="transparent" width={350} />
                    </div>
                  </div>
                </div>
                <div className="grid_info style_status box_long">
                  <div className="box type_status">
                    <div className="cont_group">
                      <h5><i className="ico-type-vm"></i>{t('RESOURCES_VM')}</h5>
                      <div className="number_wrap">
                        <p><span className="em">{vmCnt}</span></p>
                      </div>
                      <TinyArea  {...vmData} bgColor="transparent" width={350} />
                    </div>
                  </div>
                </div>
                <div className="grid_info style_status box_long">
                  <div className="box type_status">
                    <div className="cont_group">
                      <h5><i className="ico-type-container"></i>KaaS</h5>
                      <div className="number_wrap">
                        <p><span className="em">{kaasCnt}</span></p>
                      </div>
                      <TinyArea  {...kaasData} bgColor="transparent" width={350} />
                    </div>
                  </div>
                </div>
              </>
            </Loading>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResourceChange