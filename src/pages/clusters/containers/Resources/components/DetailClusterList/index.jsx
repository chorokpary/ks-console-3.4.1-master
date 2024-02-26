import { get, groupBy, isEmpty } from 'lodash';
import React, { useState, useEffect, useReducer } from 'react';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { toJS } from 'mobx';

import { Button, Icon, Loading, Tooltip } from '@kube-design/components';

import Tabs from 'components/Cards/Banner/Tabs';
import { TinyArea } from 'components/Charts';
import { Panel, Text, Indicator } from 'components/Base';

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

  // button
  const [buttonPass, setButtonPass] = useState(false);
  const [buttonWarning, setButtonWarning] = useState(false);
  const [buttonDanger, setButtonDanger] = useState(false);

  const [tabValue, setTabValue] = useState('cluster');

  const [showPopup, setShowPopup] = useState(false);

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
      setButtonDanger(false);
      setButtonPass(false);
      setButtonWarning(false);
      setExpandItem('false');
      setIsExpandFlag(!isExpandFlag);
    } else if (value === 'namespace') {
      setTabValue('namespace');
      setButtonDanger(false);
      setButtonPass(false);
      setButtonWarning(false);
      setExpandItem('');
      setIsExpandFlag(!isExpandFlag);
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

  const closeDrawer = e => {
    e.stopPropagation();
    setShowPopup(false);
  };

  const renderContent = () => {
    if (ciDataList?.length == 0) {
      const content = (
        <div className={styles.nodata}>{t('RESOURCES_NOT_FOUND_RESOURCE')}</div>
      );
      return content;
    }

    const withoutNamespaceResult = withoutNamespace
      ?.map(ns => ns?.resultInfos.flat())
      .flat();

    if (tabValue === 'cluster') {
      const content = withoutNamespaceResult
        ?.filter(rslt => {
          const items = rslt?.resourceInfos?.items ?? [];
          if (buttonDanger) {
            return items.some(itm => itm?.level === 'danger');
          }
          if (buttonPass) {
            return items.some(itm => itm?.level === 'ignore');
          }
          if (buttonWarning) {
            return items.some(itm => itm?.level === 'warning');
          }
          return true;
        })
        ?.map((value, idx) => {
          //   return value.resourceInfos?.items?.map((obj, idx) => {
          return (
            <div className={styles.wrapper} key={`cluster-${idx}`}>
              <div
                className={classnames(styles.expandItem, '', {
                  [styles.expanded]:
                    value?.resourceInfos?.name == expandItem
                      ? isExpandFlag
                      : false,
                })}
              >
                <div className={styles.itemMain}>
                  <div className={styles.icon}>
                    <i
                      className="ico-type24-disk"
                      type={
                        value?.resourceInfos?.name != expandItem
                          ? 'dark'
                          : value?.resourceInfos?.name == expandItem &&
                            isExpandFlag == false
                          ? 'dark'
                          : 'light'
                      }
                    ></i>
                  </div>

                  {renderContentDetail(value)}
                </div>

                {renderExtraContent(value)}
                {/* {renderExtraContent(value, obj.name)} */}
              </div>
            </div>
          );
          //   });
        });
      return content;
    }

    if (tabValue === 'namespace') {
      const content = namespace?.map((value, index) => {
        return value?.resultInfos?.map((obj, idx) => {
          return (
            <div className={styles.wrapper} key={`namespace-${idx}`}>
              <div
                className={classnames(styles.expandItem, '', {
                  [styles.expanded]:
                    obj.resourceInfos.name == expandItem ? isExpandFlag : false,
                })}
              >
                <div className={styles.itemMain}>
                  <div className={styles.icon}>
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
                {renderExtraContent(obj)}
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
  const renderContentDetail = obj => {
    const counts = {};

    (obj.resourceInfos.items || []).forEach(item => {
      const level = item.level;
      counts[level] = (counts[level] || 0) + 1;
    });

    // Function to generate dot bars based on counts
    const generateDotBars = () => {
      const dotBars = [];
      if (buttonDanger) {
        for (let i = 0; i < (counts.danger || 0); i++) {
          dotBars.push(
            <div key={`danger-${i}`} className="dot_bar status danger"></div>
          );
        }
        return dotBars;
      }
      if (buttonWarning) {
        for (let i = 0; i < (counts.warning || 0); i++) {
          dotBars.push(
            <div key={`warning-${i}`} className="dot_bar status warning"></div>
          );
        }
        return dotBars;
      }
      if (buttonPass) {
        for (let i = 0; i < (counts.ignore || 0); i++) {
          dotBars.push(
            <div key={`ignore-${i}`} className="dot_bar status pass"></div>
          );
        }
        return dotBars;
      }

      if (!(buttonDanger || buttonWarning || buttonPass)) {
        for (let i = 0; i < (counts.danger || 0); i++) {
          dotBars.push(
            <div key={`danger-${i}`} className="dot_bar status danger"></div>
          );
        }

        for (let i = 0; i < (counts.warning || 0); i++) {
          dotBars.push(
            <div key={`warning-${i}`} className="dot_bar status warning"></div>
          );
        }

        for (let i = 0; i < (counts.ignore || 0); i++) {
          dotBars.push(
            <div key={`ignore-${i}`} className="dot_bar status pass"></div>
          );
        }

        return dotBars;
      }
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
          <div className="content_box_wrap">
            <div className="dot_chart_wrap">
              <div className="dot_chart">
                {generateDotBars()}
                <div className="dot_bar"></div>
              </div>
              <p className="dot_value">
                {/* <p className={styles.text}> */}
                <label>Pass {counts.ignore || 0} </label>
                <label>Warning {counts.warning || 0}</label>
                {/* <span className="data"></span> */}
                <label>Danger {counts.danger || 0}</label>
                <span className="data"></span>
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

  const getState = state => {
    if (state === 'ignore') {
      return 'running';
    }
    if (state === 'warning') {
      return 'warning';
    }
    if (state === 'danger') {
      return 'error';
    }
    return 'error';
  };

  const renderExtraContent = (obj, rName, index) => {
    return (
      <>
        <div className={styles.itemExtra} key={`extra-content-${index}`}>
          <div className={styles.containers}>
            {obj?.resourceInfos?.items
              ?.filter(item => {
                if (buttonWarning) {
                  return item.level === 'warning';
                }
                if (buttonDanger) {
                  return item.level === 'danger';
                }
                if (buttonPass) {
                  return item.level === 'ignore';
                }
                return true;
              })
              ?.map((item, indexNum) => {
                return (
                  <>
                    <div
                      className={classnames(styles.item)}
                      key={`extra-item-${indexNum}`}
                      onClick={e => {
                        return setShowPopup(true);
                      }}
                    >
                      <div className={styles.icon}>
                        <i className="ico-type24-disk"></i>
                      </div>

                      <div className={classnames(styles.title, styles.name)}>
                        <div>{item.message}</div>
                        <p>{`이름`}</p>
                      </div>
                      <div className={styles.title}>
                        {/* <div className={styles.indicator}> */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Indicator
                            className={styles.indicator}
                            type={getState(item.level)}
                            flicker
                            //   style={{
                            //     bottom: '45px !important',
                            //     right: '26px !important',
                            //   }}
                          />
                          <div>{item.level}</div>
                        </div>
                        <p>{`상태`}</p>
                      </div>
                    </div>

                    {showPopup && (
                      <>
                        <div class="content_box_wrap">
                          <div
                            className={`sub_layer_pop  ${
                              showPopup ? 'show' : ''
                            }`}
                            id="sub_layer_pop"
                          >
                            <div className="layer_pop_header status_wrap">
                              <div className="tit">
                                ImageTagIsLatest
                                <p className="status warning">
                                  <span>warning</span>
                                </p>
                              </div>
                              <button
                                type="button"
                                className="close"
                                onClick={e => closeDrawer(e)}
                              >
                                {/* onClick={setShowPopup(false)} */}
                                <i className="ico ico-close-small"></i>
                              </button>
                            </div>
                            <div className="msg">
                              <i className="ico ico-check"></i>
                              <label className="label">Discovered :</label>
                              <span>1 min ago</span>
                            </div>
                            <div className="disc">
                              Describe Kubernetes typically caches images on
                              worker nodes. By default, the image will only be
                              pulled if it is not already cached on the node
                              trying to run it. However, leveraging cached
                              versions of Docker images can be a reliability
                              issue. It can cause different images to run on
                              different nodes, resulting in inconsistent
                              behavior. This can also be a security issue
                              because the workload can access the cached image
                              even if it does not have access to the remote
                              Docker repository (via imagePullSecret).
                              Specifying pullPolicy=Always will prevent these
                              issues by ensuring that the latest image is
                              downloaded every time a new pod is created.
                              reference View documentation- How to solve In your
                              Pod specification, set imagePullPolicy to Always .
                              Describe Kubernetes typically caches images on
                              worker nodes. By default, the image will only be
                              pulled if it is not already cached on the node
                              trying to run it. However, leveraging cached
                              versions of Docker images can be a reliability
                              issue. It can cause different images to run on
                              different nodes, resulting in inconsistent
                              behavior. This can also be a security issue
                              because the workload can access the cached image
                              even if it does not have access to the remote
                              Docker repository (via imagePullSecret).
                              Specifying pullPolicy=Always will prevent these
                              issues by ensuring that the latest image is
                              downloaded every time a new pod is created.
                              reference
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })}
          </div>
        </div>
      </>
    );
  };

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
  const clickButton = e => {
    const value = e.target.value;
    if (tabValue === 'cluster') {
      if (value === 'pass') {
        withoutNamespace?.map(() => {});
      }
    }
  };

  return (
    <>
      <Tabs tabs={tabs()} />
      <div className="grid_item">
        <div className="grid_title">
          <label>클러스터 상태</label>
          <div className="content_box_wrap">
            <div className="tab_toggle_wrap status_wrap">
              <button
                className={`${
                  !buttonPass
                    ? 'btn tab_toggle status pass'
                    : 'btn tab_toggle on status pass'
                }`}
                type="button"
                onClick={e => {
                  clickButton(e);
                  setButtonPass(!buttonPass);
                  setButtonWarning(false);
                  setButtonDanger(false);
                }}
                value="pass"
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
                onClick={() => {
                  setButtonWarning(!buttonWarning);
                  setButtonPass(false);
                  setButtonDanger(false);
                }}
                value="pass"
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
                onClick={() => {
                  setButtonDanger(!buttonDanger);
                  setButtonWarning(false);
                  setButtonPass(false);
                }}
                value="pass"
              >
                <span>Danger</span>
              </button>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </>
  );
};

export default DetailClusterList;
