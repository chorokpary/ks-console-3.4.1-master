import { get, groupBy, isEmpty } from 'lodash';
import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { toJS } from 'mobx';

import { Link } from 'react-router-dom';
import { Button, Icon, Loading, Tooltip } from '@kube-design/components';
import { namespace } from 'd3-selection';
import { Panel, Text, Indicator } from 'components/Base';

import Tabs from 'components/Cards/Banner/Tabs';
import { TinyArea } from 'components/Charts';

import styles from './index.scss';

import ClusterInspectionStore from 'stores/resources/clusterInspection';

import { getLocalTime } from 'utils';
import * as common from 'utils/resources';
import { getAreaChartOps } from 'utils/monitoring';

import 'pages/clusters/containers/Overview/CustomDashboard/custom_style.css';
import 'pages/clusters/containers/Overview/CustomDashboard/custom_icon.css';
import 'pages/clusters/containers/Overview/CustomDashboard/dashboard.css';

const DetailClusterList = props => {
  const clusterInspection = new ClusterInspectionStore();

  const [ciDataList, setCiDataList] = useState();
  const [namespace, setNamespace] = useState([]);
  const [withoutNamespace, setWithoutNamespace] = useState([]);

  const [isExpandFlag, setIsExpandFlag] = useState(false);
  const [expandItem, setExpandItem] = useState();
  //   const [isLoading, setIsLoading] = useState(true);

  const [clusterInspectionData, setClusterInspectionData] = useState();
  const [ciPropsAuditResult, setCiPropsAuditResult] = useState();

  // button
  const [buttonPass, setButtonPass] = useState(false);
  const [buttonWarning, setButtonWarning] = useState(false);
  const [buttonDanger, setButtonDanger] = useState(false);

  const [tabValue, setTabValue] = useState('cluster');

  useEffect(() => {
    const fnGetData = async ({ ...params } = {}) => {
      const ciList = await clusterInspection.fetchList();
      setCiDataList(toJS(ciList.auditResults));

      const withNamespace = toJS(ciList.auditResults)?.filter(
        item => item.namespace
      );
      const noNamespace = toJS(ciList.auditResults)?.filter(
        item => !item.namespace
      );

      setNamespace(withNamespace);
      setWithoutNamespace(noNamespace);
    };

    fnGetData();
  }, []);

  const handleExpand = name => {
    setExpandItem(name);
    setIsExpandFlag(!isExpandFlag);
  };

  const handleTabChange = value => {
    if (value === 'cluster') {
      setTabValue('cluster');
    } else if (value === 'namespace') {
      setTabValue('namespace');
    }
  };

  const tabs = () => {
    return {
      value: tabValue,
      onChange: handleTabChange,
      options: [
        {
          value: `cluster`,
          label: `클러스터`,
        },
        {
          value: `namespace`,
          label: `네임스페이스`,
        },
      ],
    };
  };
  const renderContent = () => {
    if (ciDataList?.length == 0) {
      const content = (
        <div className={styles.nodata}>{t('RESOURCES_NOT_FOUND_RESOURCE')}</div>
      );
      return content;
    }

    if (tabValue === 'cluster') {
      const content = withoutNamespace?.map((value, index) => {
        return value?.resultInfos?.map((obj, idx) => {
          return (
            <div className={styles.wrapper} key={idx}>
              <div
                className={classnames(styles.expandItem, '', {
                  [styles.expanded]:
                    obj.resourceInfos.name == expandItem ? isExpandFlag : false,
                })}
              >
                <div className={styles.itemMain}>
                  <div className={styles.icon}>
                    {/* <Icon name="templet" size={40} type={obj.name != expandItem ? 'dark' : (obj.name == expandItem && isExpandFlag == false) ? 'dark' : 'light'} /> */}
                    <i
                      className="ico-type24-disk"
                      type={
                        obj.resourceInfos.name != expandItem
                          ? 'dark'
                          : obj.resourceInfos.name == expandItem &&
                            isExpandFlag == false
                          ? 'dark'
                          : 'light'
                      }
                    ></i>
                  </div>

                  {renderContentDetail(obj)}
                </div>

                {renderExtraContent(obj, obj.resourceInfos.name)}
              </div>
            </div>
          );
        });
      });
      return content;
    }
    if (tabValue === 'namespace') {
      const content = namespace?.map((value, index) => {
        return value?.resultInfos?.map((obj, idx) => {
          return (
            <div className={styles.wrapper} key={index}>
              <div
                className={classnames(styles.expandItem, '', {
                  [styles.expanded]:
                    obj.resourceInfos.name == expandItem ? isExpandFlag : false,
                })}
              >
                <div className={styles.itemMain}>
                  <div className={styles.icon}>
                    <i className="ico-type24-disk"></i>
                  </div>

                  {renderContentDetail(obj)}
                </div>
                {renderExtraContent(obj, obj.resourceInfos.name)}
              </div>
            </div>
          );
        });
      });
      return content;
    }

    // return (
    //   <Loading spinning={isLoading}>
    //     <>{content}</>
    //   </Loading>
    // );
  };
  const [resourcesInfoName, setResourcesInfoName] = useState();
  const renderContentDetail = obj => {
    const counts = {};
    (obj.resourceInfos.items || []).forEach(item => {
      const level = item.level;
      counts[level] = (counts[level] || 0) + 1;
    });

    // Function to generate dot bars based on counts
    const generateDotBars = () => {
      const dotBars = [];

      // Generate danger dot bars
      for (let i = 0; i < (counts.danger || 0); i++) {
        dotBars.push(
          <div key={`danger-${i}`} className="dot_bar status danger"></div>
        );
      }

      // Generate warning dot bars
      for (let i = 0; i < (counts.warning || 0); i++) {
        dotBars.push(
          <div key={`warning-${i}`} className="dot_bar status warning"></div>
        );
      }

      // Generate ignore dot bars
      for (let i = 0; i < (counts.ignore || 0); i++) {
        dotBars.push(
          <div key={`ignore-${i}`} className="dot_bar status pass"></div>
        );
      }
      //   setResourcesInfoName(obj.resourceInfos.name);

      return dotBars;
    };
    return (
      <>
        <div className={styles.content}>
          <div className={styles.text}>
            <div>{obj.resourceInfos.name}</div>
            <p>{`이름`}</p>
          </div>

          <div className={styles.text}>
            <div>{obj.resourceType}</div>
            <p>{`타입`}</p>
          </div>
          <div class="content_box_wrap">
            <div className="dot_chart_wrap">
              <div className="dot_chart">
                {generateDotBars()}
                <div className="dot_bar"></div>
              </div>
              <p className="dot_value">
                {/* <p className={styles.text}> */}
                <label>Pass</label>
                <span className="data">{counts.pass || 0}</span>
                <label>Warning</label>
                <span className="data">{counts.warning || 0}</span>
                <label>Danger</label>
                <span className="data">{counts.danger || 0}</span>
              </p>
            </div>
          </div>

          {/* {renderMonitorings(obj.resourceInfos)} */}

          <div
            className={styles.arrow}
            onClick={() => handleExpand(obj.resourceInfos.name)}
          >
            <Icon
              name="chevron-down"
              type={
                obj.resourceInfos.name !== expandItem
                  ? ''
                  : obj.resourceInfos.name === expandItem &&
                    isExpandFlag === false
                  ? ''
                  : 'light'
              }
              size={20}
            />
          </div>
        </div>
      </>
    );
  };

  const [openPopup, setOpenPopup] = useState(false);
  const subLayerPopup = () => {
    return (
      <>
        <div class="sub_layer_pop" id="sub_layer_pop">
          <div class="layer_pop_header status_wrap">
            <div class="tit">
              ImageTagIsLatest
              <p class="status danger">
                <span>Danger</span>
              </p>
            </div>
            <button type="button" class="close">
              <i class="ico ico-close-small"></i>
            </button>
          </div>
          <div class="msg">
            <i class="ico ico-check"></i>
            <label class="label">Discovered :</label>
            <span>1 min ago</span>
          </div>
          <div class="disc">
            Describe Kubernetes typically caches images on worker nodes. By
            default, the image will only be pulled if it is not already cached
            on the node trying to run it. However, leveraging cached versions of
            Docker images can be a reliability issue. It can cause different
            images to run on different nodes, resulting in inconsistent
            behavior. This can also be a security issue because the workload can
            access the cached image even if it does not have access to the
            remote Docker repository (via imagePullSecret). Specifying
            pullPolicy=Always will prevent these issues by ensuring that the
            latest image is downloaded every time a new pod is created.
            reference View documentation-> How to solve In your Pod
            specification, set imagePullPolicy to Always . Describe Kubernetes
            typically caches images on worker nodes. By default, the image will
            only be pulled if it is not already cached on the node trying to run
            it. However, leveraging cached versions of Docker images can be a
            reliability issue. It can cause different images to run on different
            nodes, resulting in inconsistent behavior. This can also be a
            security issue because the workload can access the cached image even
            if it does not have access to the remote Docker repository (via
            imagePullSecret). Specifying pullPolicy=Always will prevent these
            issues by ensuring that the latest image is downloaded every time a
            new pod is created. reference
          </div>
        </div>
      </>
    );
  };

  const renderExtraContent = (obj, index) => {
    return (
      <>
        <div className={styles.itemExtra} key={index}>
          <div className={styles.containers}>
            {obj?.resourceInfos?.items?.map((item, indexNum) => (
              <>
                <div className={classnames(styles.item)} key={indexNum}>
                  <div className={styles.icon}>
                    <i className="ico-type24-disk"></i>
                  </div>
                  <div className={classnames(styles.title, styles.name)}>
                    <div>{item.message}</div>
                    <p>{`이름`}</p>
                  </div>
                  <div className={styles.title}>
                    <div>{item.level}</div>
                    <p>{`상태`}</p>
                  </div>
                </div>
              </>
            ))}{' '}
          </div>
        </div>
        ;
      </>
    );
  };

  //   const renderExtraContent = (obj, ObjName) => {
  //     // console.log('obj', obj.resourceInfos);
  //     console.log('Json obj', JSON.stringify(obj.resourceInfos));
  //     // console.log('ObjName', ObjName);

  //     // 특정 name에 대한 items 추출
  //     // if (obj.resourceInfos.name === ObjName) {
  //     const elements =
  //       obj.resourceInfos?.items &&
  //       obj.resourceInfos?.items?.map((item, index) => {
  //         return (
  //           <div className={styles.itemExtra} key={index}>
  //             <div className={styles.containers}>
  //               <div className={classnames(styles.item)}>
  //                 <div className={styles.icon}>
  //                   <i className="ico-type24-disk"></i>
  //                 </div>
  //                 <div className={classnames(styles.title, styles.name)}>
  //                   <div>{item.message}</div>
  //                   <p>{`이름`}</p>
  //                 </div>
  //                 <div className={styles.title}>
  //                   <div>{item.level}</div>
  //                   <p>{`상태`}</p>
  //                 </div>
  //                 <div className={styles.title}>
  //                   <div>{item.reason}</div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         );
  //       });

  //     return elements; // 배열을 반환
  //     // }
  //   };

  //   const renderExtraContent = obj => {
  //     console.log('const obj', obj);
  //     return (
  //       obj.resourceInfos.name === expandItem &&
  //       obj.resourceInfos.items?.map(item => {
  //         //   console.log('item\n ', item);
  //         return (
  //           <>
  //             <div className={styles.itemExtra}>
  //               <div className={styles.containers}>
  //                 <div
  //                   className={classnames(styles.item)}
  //                   // onClick={e => subLayerPopup(e.stopPropagation)}
  //                 >
  //                   <div className={styles.icon}>
  //                     {/* <Icon name="ico-type24-disk" size={40} /> */}
  //                     <i className="ico-type24-disk"></i>
  //                   </div>

  //                   <div className={classnames(styles.title, styles.name)}>
  //                     <div>{item.message}</div>
  //                     <p>{`이름`}</p>
  //                   </div>
  //                   <div className={styles.title}>
  //                     <div>{item.level}</div>
  //                     <p>{`상태`}</p>
  //                   </div>
  //                   <div className={styles.title}>
  //                     <div>{item.reason}</div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </>
  //         );
  //       })
  //     );
  //   };

  const renderMonitorings = vmId => {
    const isExpand = false;
    const loading = false;

    if (loading) return <div className={styles.monitors}>{t('LOADING')}</div>;

    const ciData = _.find(clusterInspectionData, data => {
      if (data.metric.pod === vmId) return data;
    });

    if (!ciData)
      return <div className={styles.monitors}>{t('NO_MONITORING_DATA')}</div>;

    const ciArray = [];
    ciArray.push(ciData);

    const configs = getMonitoringCfgs(ciArray);

    return (
      <div className={styles.monitors}>
        <div className={styles.charts}>
          {configs.map(item => {
            const config = getAreaChartOps(item);

            return (
              <div key={item.type}>
                <TinyArea
                  key={item.type}
                  width="100%"
                  height={40}
                  {...config}
                  darkMode={isExpand}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <Tabs tabs={tabs()} />
      <div className="grid_item">
        <div className="grid_title">
          <label>클러스터 상태</label>
          <div class="content_box_wrap">
            <div className="tab_toggle_wrap status_wrap">
              <button
                className={`${
                  !buttonPass
                    ? 'btn tab_toggle status pass'
                    : 'btn tab_toggle on status pass'
                }`}
                type="button"
                onClick={() => setButtonPass(true)}
              >
                <span>Pass</span>
              </button>
              <button
                className={`${
                  !buttonWarning
                    ? 'btn tab_toggle status warning'
                    : 'btn tab_toggle on status warning'
                }`}
                type="button"
                onClick={() => setButtonWarning(true)}
              >
                <span>Warning</span>
              </button>
              <button
                className={`${
                  !buttonDanger
                    ? 'btn tab_toggle status danger'
                    : 'btn tab_toggle on status danger'
                }`}
                type="button"
                onClick={() => setButtonDanger(true)}
              >
                <span>Danger</span>
              </button>
              {/* <!-- on 클래스 추가-->
				<button id="popupButton" className="btn tab_toggle" type="button"><span>우측레이어 열기</span></button> */}
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </>
  );
};

export default DetailClusterList;
