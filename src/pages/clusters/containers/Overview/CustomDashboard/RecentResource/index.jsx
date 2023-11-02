import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import NodeStore from 'stores/node';
import VmStore from 'stores/resources/vms'
import PodStore from 'stores/pod'
import KaasStore from 'stores/resources/containerresource'
import moment from 'moment-mini';

const iconType = {
  'node': 'clusternode',
  'pod': 'pod',
  'vm': 'vm',
  'kaas': 'container',
}

const RecentResource = ({ x, y, w, h }) => {
  const nodeStore = new NodeStore();
  const podStore = new PodStore();
  const vmStore = new VmStore();
  const kaasStore = new KaasStore();

  const [nodeList, setNodeList] = useState([]);
  const [podList, setPodList] = useState([]);
  const [vmList, setVmList] = useState([]);
  const [kaasList, setKaasList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const getData = async () => {
      setLoading(true)

      // node data
      const nodeList = await nodeStore.fetchList({ limit: 10, sortBy: 'createTime' })
      handleDate(nodeList, 'createTime', 'node')

      // pod data
      const podList = await podStore.fetchList({ limit: 10, sortBy: 'createTime' })
      handleDate(podList, 'createTime', 'pod')

      // vm data
      const vmList = await vmStore.fetchList({ limit: 10, sortBy: 'creation_timestamp' })
      handleDate(vmList, 'creation_timestamp', 'vm')

      // kaas data
      const kaasList = await kaasStore.fetchList({ limit: 10, sortBy: 'timestamp' })
      handleDate(kaasList, 'timestamp', 'kaas')

      setLoading(false)
    };
    getData();

  }, [])

  // recent week
  const handleDate = (list, dateType, resourceType) => {
    let date = new Date();
    let dayBefore = date.getTime() - (7 * 24 * 60 * 60 * 1000) // recent week

    let arr = []
    list.map(obj => {
      if (new Date(obj[dateType]) > dayBefore) {
        arr.push({ name: obj.name, date: obj[dateType], type: resourceType })
      }
    })

    if (resourceType == 'node') {
      setNodeList(arr);
    } else if (resourceType == 'pod') {
      setPodList(arr);
    } else if (resourceType == 'vm') {
      setVmList(arr);
    } else if (resourceType == 'kaas') {
      setKaasList(arr);
    }
  }

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title" style={{ cursor: 'default' }}>
              <label>최근 생성된 리소스 (일주일)</label>

            </div>
            <div className="grid_info style_list">
              <Loading spinning={loading}>
                <List
                  nodeList={nodeList}
                  podList={podList}
                  vmList={vmList}
                  kaasList={kaasList}
                />
              </Loading>
            </div>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default RecentResource

const List = ({ nodeList, podList, vmList, kaasList }) => {

  const [list, setList] = useState([])
  useEffect(() => {
    let arr = [];
    arr.push(...nodeList)
    arr.push(...podList)
    arr.push(...vmList)
    arr.push(...kaasList)
    arr.sort(function (a, b) {
      return moment(b.date) - moment(a.date);
    });
    setList(arr)
  }, [nodeList, podList, vmList, kaasList])

  return (
    <>
      {list.length > 0 &&
        <ul className="list_01">
          {list.map((obj, idx) => (
            <li className="li_type_01" key={idx}>
              <div className="lft">
                <i className={`ico-type24-${iconType[obj.type]}`}></i>
                <h6 className="list_title">
                  {obj.name}
                  <span>{moment(obj.date).format('YYYY-MM-DD')}</span>
                </h6>
              </div>
              <div className="type">
                <span className={`type_${obj.type == 'node' ? 'node' : iconType[obj.type]}`}>{obj.type}</span>
              </div>
            </li>
          ))
          }
        </ul>
      }

      {list.length == 0 &&
        <div className="grid_text">
          <span>데이터가 없습니다.</span>
        </div>
      }
    </>
  )
}