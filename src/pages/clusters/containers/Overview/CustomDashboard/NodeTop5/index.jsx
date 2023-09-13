import React, { useEffect, useState } from 'react'
import { Loading } from '@kube-design/components'
import NodeStore from 'stores/rank/node';
import { get } from 'lodash';

const storeParams = {
  limit: 5,
  page: 1,
  sort_type: 'desc',
}
const NodeTop5 = () => {
  const nodeStore = new NodeStore({ ...storeParams })

  useEffect(() => {
    const getNodeData = async () => {
      setLoading(true)
      const nodeList = await nodeStore.fetchAll()
      setList(nodeList)
      setLoading(false)
    };
    getNodeData();
  }, [])

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="grid-stack-item" gs-x="9" gs-y="0" gs-w="3" gs-h="8">
        <div className="grid-stack-item-content">
          {/* grid_item */}
          <div className="grid_item">
            <div className="grid_title">
              <label>리소스 사용량 Top 5</label>

            </div>
            <div className="grid_info style_list">
              <div className="select_wrap">
                <div className="d-flex align-start w-100">
                  <div className="content-box" style={{ width: "60%" }}>
                    <div className="select-list-box">
                      <div className="selected-item single">
                        <p>
                          <strong>CPU 사용량</strong>
                        </p>
                      </div>

                      <ul className="select-list scroll-gray">
                        <li className="selected">
                          <p>
                            <strong>CPU 사용량</strong>
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong>메모리 사용량</strong>
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong>디스크 사용량</strong>
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="content-box" style={{ width: "38%" }}>
                    <div className="select-list-box">
                      <div className="selected-item single">
                        <p>
                          <strong>노드</strong>
                        </p>
                      </div>

                      <ul className="select-list scroll-gray">
                        <li className="selected">
                          <p>
                            <strong>노드</strong>
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong>Pod</strong>
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong>가상머신</strong>
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong>쿠버네티스</strong>
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* // select_wrap */}
              <Loading spinning={loading}>
                <ul className="list_01">
                  {list.map(obj => (
                    <li className="li_type_01" key={obj.node}>
                      <div className="lft">
                        <i className="ico ico-page-list-clusternode"></i>
                        <h6 className="list_title">
                          {obj.node}
                          <span>{get(obj, 'host_ip', '-')}</span>
                        </h6>
                      </div>
                      <div className="info">
                        <h6>
                          {Math.round((Number(get(obj, nodeStore.sort_metric)) || 0) * 100)}%
                          <span>CPU 사용량</span>
                        </h6>
                      </div>
                    </li>
                  ))}
                  {/* <li className="li_type_01">
                  <div className="lft">
                    <i className="ico ico-page-list-clusternode"></i>
                    <h6 className="list_title">
                      Master01
                      <span>192.168.16.87</span>
                    </h6>
                  </div>
                  <div className="info warning">
                    <h6>80%
                      <span>CPU 사용량</span>
                    </h6>
                  </div>
                </li> */}
                </ul>
              </Loading>
              {list.length == 0 &&
                <div className="grid_text">
                  <span>데이터가 없습니다.</span>
                </div>
              }
            </div>
          </div>
          {/* // grid_item */}
        </div>
      </div>
    </>
  )
}

export default NodeTop5