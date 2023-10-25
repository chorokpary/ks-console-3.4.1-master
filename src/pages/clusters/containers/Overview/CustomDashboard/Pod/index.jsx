import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import PodStore from 'stores/pod'
import PodModel from 'stores/dashboard/pods'
import { fnSetPods } from 'utils/dashboard'

const Pod = ({ x, y, w, h }) => {
  const podStore = new PodStore();

  useEffect(() => {
    const getPodData = async () => {
      setLoading(true)
      const podList = await podStore.fetchList({ limit: 1000 })
      setList(podList)
      setLoading(false)
    };
    getPodData();
  }, [])

  const [list, setList] = useState([]);
  const pods = new PodModel();
  const [data, setData] = useState(pods);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (list.length > 0) {
      const data = fnSetPods(list, pods)
      setData(data)
    }
  }, [list])

  return (
    <>
      <div className="grid-stack-item" gs-x={x} gs-y={y} gs-w={w} gs-h={h}>
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>Pod</label>

            </div>

            <Loading spinning={loading}>
              <div className="grid_info style_status">
                <div className="box type_status">
                  <div className="cont_group">
                    <div className="cont1">
                      <div className="number_wrap">
                        <i className="ico-type-pod"></i>
                        <p><span className="em">{data.running}</span> / {data.total}</p>
                      </div>
                    </div>
                    <div className="cont2">
                      <div className="status_wrap">
                        <div className="value">{data.waiting}</div>
                        <p className="status waiting"><span>Waiting</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.running}</div>
                        <p className="status running"><span>Running</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.completed}</div>
                        <p className="status completed"><span>Completed</span></p>
                      </div>
                      <div className="status_wrap">
                        <div className="value">{data.error}</div>
                        <p className="status error"><span>Error</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Loading>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default Pod