import React, { useState, useEffect, useReducer } from 'react';
import classnames from 'classnames';
import { toJS } from 'mobx';
import { Button, Icon, Loading, Tooltip } from '@kube-design/components';

import Tabs from 'components/Cards/Banner/Tabs';
import { Panel, Text, Indicator } from 'components/Base';
import styles from './index.scss';
import ClusterInspectionStore from 'stores/resources/clusterInspection';
import KubeeyeDataStore from 'stores/resources/kubeeyedata';
const DetailClusterList = props => {
  const clusterInspection = new ClusterInspectionStore();
  const kubeeyeDataStore = new KubeeyeDataStore();

  const [ciDataList, setCiDataList] = useState();
  const [namespace, setNamespace] = useState([]);
  const [withoutNamespace, setWithoutNamespace] = useState([]);

  const [isExpandFlag, setIsExpandFlag] = useState(false);
  const [expandItem, setExpandItem] = useState();
  const [expandItemNamespace, setExpandItemNamespace] = useState();
  const [expandItemType, setExpandItemType] = useState();
  //   const [isLoading, setIsLoading] = useState(true);

  // button
  const [buttonPass, setButtonPass] = useState(false);
  const [buttonWarning, setButtonWarning] = useState(false);
  const [buttonDanger, setButtonDanger] = useState(false);

  const [tabValue, setTabValue] = useState('cluster');

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState();
  const [describe, setDescribe] = useState();
  const [suggest, setSuggest] = useState();
  const [level, setLevel] = useState();
  const [lastScheduleTime, setLastScheduleTime] = useState();
  const [kubeeyeData, setKubeeyeData] = useState();

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

    const fnKubeeyeData = async ({ ...params } = {}) => {
      const kubeeyeList = await kubeeyeDataStore.fetchList();
      setKubeeyeData(toJS(kubeeyeList));
    };

    fnGetData();
    fnKubeeyeData();
  }, []);

  useEffect(() => {
    const date = new Date(props?.data?.lastScheduleTime);
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

    const setTime = `${formattedDate}, ${formattedTime}`;
    setLastScheduleTime(setTime);
  }, [props]);

  const handleExpand = (name, valueNamespace, valueType) => {
    setExpandItem(name);
    setIsExpandFlag(!isExpandFlag);
    setExpandItemNamespace(valueNamespace);
    setExpandItemType(valueType);
  };

  const handleTabChange = value => {
    if (value === 'cluster') {
      setTabValue('cluster');
      setButtonDanger(false);
      setButtonPass(false);
      setButtonWarning(false);
      setExpandItem('');
      setIsExpandFlag(!isExpandFlag);
    } else if (value === 'project') {
      setTabValue('project');
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
          label: t('CLUSTER_INSPECTION_CLUSTER'),
        },
        {
          value: `project`,
          label: t('CLUSTER_INSPECTION_PROJECT'),
        },
      ],
    };
  };

  const closeDrawer = e => {
    e.stopPropagation();
    setShowPopup(false);
  };

  const renderContent = () => {
    if (!ciDataList) {
      const content = (
        <div className="grid_info style_status">
          <div className="grid_text">
            <span>데이터가 없습니다</span>
          </div>
        </div>
      );
      return content;
    }

    const withoutNamespaceResult = withoutNamespace
      ?.map(ns => ns?.resultInfos.flat())
      .flat()
      .sort((a, b) => {
        return a.resourceInfos.name > b.resourceInfos.name ? 1 : -1;
      });

    if (tabValue === 'cluster') {
      const content = withoutNamespaceResult
        ?.filter(rslt => {
          const items = rslt?.resourceInfos?.items ?? [];
          if (buttonPass) {
            return items.some(itm => itm?.level === 'pass');
          }
          if (buttonWarning) {
            return items.some(itm => itm?.level === 'warning');
          }
          if (buttonDanger) {
            return items.some(itm => itm?.level === 'danger');
          }
          return true;
        })
        ?.map((value, idx) => {
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
                    {value.resourceType === 'Node' ? (
                      <Icon name="nodes" size={40} />
                    ) : value.resourceType === 'ClusterRole' ? (
                      <Icon name="cluster" size={40} />
                    ) : value.resourceType === 'Deployment' ? (
                      <Icon name="nodes" size={40} />
                    ) : value.resourceType === 'DaemonSet' ? (
                      <Icon name="deamon-set" size={40} />
                    ) : value.resourceType === 'Role' ? (
                      <Icon name="role" size={40} />
                    ) : value.resourceType === 'StatefulSet' ? (
                      <Icon name="stateful-set" size={40} />
                    ) : value.resourceType === 'Event' ? (
                      <Icon name="event" size={40} />
                    ) : value.resourceType === 'Job' ? (
                      <Icon name="job" size={40} />
                    ) : value.resourceType === 'CronJob' ? (
                      <Icon name="cron-job" size={40} />
                    ) : (
                      ''
                    )}
                  </div>

                  {renderContentDetail(value)}
                </div>

                {renderExtraContent(value)}
              </div>
            </div>
          );
        });
      return content;
    }

    if (tabValue === 'project') {
      const content = namespace
        ?.sort((a, b) => {
          return a.namespace > b.namespace ? 1 : -1;
        })
        ?.map(value => {
          return (
            <>
              <div
                style={{
                  padding: '4px',
                  backgroundColor: '#f9fbfd',
                  borderRadius: '4px',
                }}
              >
                <div
                  style={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    wordWrap: 'normal',
                    overflow: 'hidden',
                    fontSize: '12px',
                    lineHeight: 1.67,
                    fontStyle: 'normal',
                    fontStretch: 'normal',
                    letterSpacing: 'normal',
                    fontWeight: 'bold',
                    color: '#242e42',
                  }}
                >
                  {value.namespace}
                </div>

                {value?.resultInfos
                  .sort((a, b) => {
                    if (a.resourceInfos.name > b.resourceInfos.name) {
                      return 1;
                    }
                    if (a.resourceInfos.name < b.resourceInfos.name) {
                      return -1;
                    }
                    return 0;
                  })
                  ?.filter(rslt => {
                    const items = rslt?.resourceInfos?.items ?? [];
                    if (buttonPass) {
                      return items.some(itm => itm?.level === 'ignore');
                    }
                    if (buttonWarning) {
                      return items.some(itm => itm?.level === 'warning');
                    }
                    if (buttonDanger) {
                      return items.some(itm => itm?.level === 'danger');
                    }
                    return true;
                  })
                  ?.map((obj, idx) => {
                    const counts = {};

                    (obj.resourceInfos.items || []).forEach(item => {
                      const itemLevel = item.level;
                      counts[itemLevel] = (counts[itemLevel] || 0) + 1;
                    });

                    // Function to generate dot bars based on counts
                    const generateDotBars = () => {
                      const dotBars = [];
                      if (buttonPass) {
                        for (let i = 0; i < (counts.ignore || 0); i++) {
                          dotBars.push(
                            <div
                              key={`ignore-${i}`}
                              className="dot_bar status pass"
                            ></div>
                          );
                        }
                        return dotBars;
                      }
                      if (buttonWarning) {
                        for (let i = 0; i < (counts.warning || 0); i++) {
                          dotBars.push(
                            <div
                              key={`warning-${i}`}
                              className="dot_bar status warning"
                            ></div>
                          );
                        }
                        return dotBars;
                      }
                      if (buttonDanger) {
                        for (let i = 0; i < (counts.danger || 0); i++) {
                          dotBars.push(
                            <div
                              key={`danger-${i}`}
                              className="dot_bar status danger"
                            ></div>
                          );
                        }
                        return dotBars;
                      }
                      if (!(buttonDanger || buttonWarning || buttonPass)) {
                        for (let i = 0; i < (counts.danger || 0); i++) {
                          dotBars.push(
                            <div
                              key={`danger-${i}`}
                              className="dot_bar status danger"
                            ></div>
                          );
                        }

                        for (let i = 0; i < (counts.warning || 0); i++) {
                          dotBars.push(
                            <div
                              key={`warning-${i}`}
                              className="dot_bar status warning"
                            ></div>
                          );
                        }

                        for (let i = 0; i < (counts.ignore || 0); i++) {
                          dotBars.push(
                            <div
                              key={`ignore-${i}`}
                              className="dot_bar status pass"
                            ></div>
                          );
                        }

                        return dotBars;
                      }
                    };

                    return (
                      <div>
                        <div
                          className={styles.wrapper}
                          key={`namespace-${idx}`}
                        >
                          <div
                            className={classnames(styles.expandItem, '', {
                              [styles.expanded]:
                                obj.resourceInfos.name === expandItem &&
                                value.namespace === expandItemNamespace &&
                                obj.resourceType === expandItemType
                                  ? isExpandFlag
                                  : false,
                            })}
                          >
                            <div className={styles.itemMain}>
                              <div className={styles.icon}>
                                {obj.resourceType === 'Node' ? (
                                  <Icon name="nodes" size={40} />
                                ) : obj.resourceType === 'ClusterRole' ? (
                                  <Icon name="cluster" size={40} />
                                ) : obj.resourceType === 'Deployment' ? (
                                  <Icon
                                    name="blue-green-deployment"
                                    size={40}
                                  />
                                ) : obj.resourceType === 'DaemonSet' ? (
                                  <Icon name="deamon-set" size={40} />
                                ) : obj.resourceType === 'Role' ? (
                                  <Icon name="role" size={40} />
                                ) : obj.resourceType === 'StatefulSet' ? (
                                  <Icon name="stateful-set" size={40} />
                                ) : obj.resourceType === 'Event' ? (
                                  <Icon name="event" size={40} />
                                ) : obj.resourceType === 'Job' ? (
                                  <Icon name="job" size={40} />
                                ) : obj.resourceType === 'CronJob' ? (
                                  <Icon name="cron-job" size={40} />
                                ) : (
                                  ''
                                )}
                              </div>

                              <div className={styles.content}>
                                <div className={styles.text}>
                                  <div>{obj?.resourceInfos?.name}</div>
                                  <p>{t('CLUSTER_INSPECTION_NAME')}</p>
                                </div>

                                <div className={styles.text}>
                                  <div>{obj?.resourceType}</div>
                                  <p>{t('CLUSTER_INSPECTION_TYPE')}</p>
                                </div>
                                <div className="content_box_wrap">
                                  <div className="dot_chart_wrap">
                                    <div className="dot_chart">
                                      {generateDotBars()}
                                    </div>
                                    <p className="dot_value">
                                      <label>
                                        {`${t(
                                          'CLUSTER_INSPECTION_PASS'
                                        )}  ${counts.ignore || 0}`}
                                      </label>
                                      <label>
                                        {`${t(
                                          'CLUSTER_INSPECTION_WARNING'
                                        )}  ${counts.warning || 0}`}
                                      </label>
                                      <label>
                                        {`${t(
                                          'CLUSTER_INSPECTION_DANGER'
                                        )}  ${counts.danger || 0}`}
                                      </label>
                                      <span className="data"></span>
                                    </p>
                                  </div>
                                </div>

                                <div
                                  className={styles.arrow}
                                  onClick={() =>
                                    handleExpand(
                                      obj.resourceInfos.name,
                                      value.namespace,
                                      obj.resourceType
                                    )
                                  }
                                >
                                  <Icon
                                    name="chevron-down"
                                    type={
                                      obj.resourceInfos.name !== expandItem ||
                                      value.namespace !== expandItemNamespace ||
                                      obj.resourceType !== expandItemType
                                        ? ''
                                        : obj.resourceInfos.name ===
                                            expandItem &&
                                          value.namespace ===
                                            expandItemNamespace &&
                                          obj.resourceType === expandItemType &&
                                          isExpandFlag === false
                                        ? ''
                                        : 'light'
                                    }
                                    size={20}
                                  />
                                </div>
                              </div>
                            </div>
                            {renderExtraContent(obj)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          );
        });
      return content;
    }
  };

  const renderContentDetail = obj => {
    const counts = {};

    (obj.resourceInfos.items || []).forEach(item => {
      const itemLevel = item.level;
      counts[itemLevel] = (counts[itemLevel] || 0) + 1;
    });

    const generateDotBars = () => {
      const dotBars = [];
      if (buttonPass) {
        for (let i = 0; i < (counts.ignore || 0); i++) {
          dotBars.push(
            <div key={`ignore-${i}`} className="dot_bar status pass"></div>
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
      if (buttonDanger) {
        for (let i = 0; i < (counts.danger || 0); i++) {
          dotBars.push(
            <div key={`danger-${i}`} className="dot_bar status danger"></div>
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
            <p>{t('CLUSTER_INSPECTION_NAME')}</p>
          </div>

          <div className={styles.text}>
            <div>{obj.resourceType}</div>
            <p>{t('CLUSTER_INSPECTION_TYPE')}</p>
          </div>
          <div className="content_box_wrap">
            <div className="dot_chart_wrap">
              <div className="dot_chart">{generateDotBars()}</div>
              <p className="dot_value">
                <label>
                  {`${t('CLUSTER_INSPECTION_PASS')}  ${counts.ignore || 0}`}
                </label>
                <label>
                  {`${t('CLUSTER_INSPECTION_WARNING')}  ${counts.warning || 0}`}
                </label>
                <label>
                  {`${t('CLUSTER_INSPECTION_DANGER')}  ${counts.danger || 0}`}
                </label>
                <span className="data"></span>
              </p>
            </div>
          </div>

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

  const renderExtraContent = (obj, index) => {
    return (
      <>
        <div className={styles.itemExtra} key={`extra-content-${index}`}>
          <div className={styles.containers}>
            {obj?.resourceInfos?.items
              ?.filter(item => {
                if (buttonPass) {
                  return item.level === 'ignore';
                }
                if (buttonWarning) {
                  return item.level === 'warning';
                }
                if (buttonDanger) {
                  return item.level === 'danger';
                }

                return true;
              })
              ?.sort((a, b) => {
                const levelOrder = {
                  danger: 1,
                  warning: 2,
                  ignore: 3,
                };
                return levelOrder[a.level] - levelOrder[b.level];
              })
              ?.map((item, indexNum) => {
                // const foundData = kubeeyeData.find(data => {
                //   return data.name === item.message;
                // });
                const foundData = kubeeyeData.find(data => {
                  return data.name === item.message;
                }) || {
                  name: 'No Data',
                  describe: '',
                  level: '',
                  suggest: '',
                };
                return (
                  <>
                    <div
                      className={classnames(styles.item)}
                      key={`extra-item-${indexNum}`}
                      onClick={() => {
                        if (foundData) {
                          setShowPopup(true);
                          setMessage(foundData.name);
                          setDescribe(foundData.describe);
                          setLevel(foundData.level);
                          setSuggest(foundData.suggest);
                        } else {
                          setShowPopup(false);
                        }
                        // if (
                        //   foundData?.name !== undefined &&
                        //   foundData?.name === item.message
                        // ) {
                        //   setShowPopup(true);
                        //   setMessage(foundData.name);
                        //   setDescribe(foundData.describe);
                        //   setLevel(foundData.level);
                        //   setSuggest(foundData.suggest);
                        // }
                        // if (foundData && foundData?.name === undefined) {
                        //   setShowPopup(false);
                        // }
                      }}
                    >
                      <div className={styles.icon}>
                        {obj.resourceType === 'Node' ? (
                          <Icon name="nodes" size={40} />
                        ) : obj.resourceType === 'ClusterRole' ? (
                          <Icon name="cluster" size={40} />
                        ) : obj.resourceType === 'Deployment' ? (
                          <Icon name="blue-green-deployment" size={40} />
                        ) : obj.resourceType === 'DaemonSet' ? (
                          <Icon name="deamon-set" size={40} />
                        ) : obj.resourceType === 'Role' ? (
                          <Icon name="role" size={40} />
                        ) : obj.resourceType === 'StatefulSet' ? (
                          <Icon name="stateful-set" size={40} />
                        ) : obj.resourceType === 'Event' ? (
                          <Icon name="event" size={40} />
                        ) : obj.resourceType === 'Job' ? (
                          <Icon name="job" size={40} />
                        ) : obj.resourceType === 'CronJob' ? (
                          <Icon name="cron-job" size={40} />
                        ) : (
                          ''
                        )}
                      </div>

                      <div className={classnames(styles.title, styles.name)}>
                        <div>{item.message}</div>
                        <p>{t('CLUSTER_INSPECTION_NAME')}</p>
                      </div>
                      <div className={styles.title}>
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
                          />
                          <div>
                            {item.level === 'ignore'
                              ? 'pass'
                              : item.level === 'warning'
                              ? 'warning'
                              : item.level === 'danger'
                              ? 'danger'
                              : ''}
                          </div>
                        </div>
                        <p>{t('CLUSTER_INSPECTION_STATUS')}</p>
                      </div>
                    </div>
                    {showPopup &&
                      foundData.name !== undefined &&
                      foundData.name === item.message && (
                        <>
                          <div
                            className="content_box_wrap"
                            style={{ border: 'none' }}
                          >
                            <div
                              className={`sub_layer_pop ${
                                showPopup ? 'show' : ''
                              }`}
                              id="sub_layer_pop"
                              style={{
                                top: '-64px',
                                right: '-6px',
                              }}
                            >
                              <div className="layer_pop_header status_wrap">
                                <div className="tit">
                                  {message}
                                  <p
                                    className={`status ${
                                      level === 'ignore'
                                        ? 'pass'
                                        : level === 'warning'
                                        ? 'warning'
                                        : level === 'danger'
                                        ? 'danger'
                                        : ''
                                    }`}
                                  >
                                    <span>
                                      {level === 'ignore'
                                        ? 'pass'
                                        : level === 'warning'
                                        ? 'warning'
                                        : level === 'danger'
                                        ? 'danger'
                                        : ''}
                                    </span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="close"
                                  onClick={() => setShowPopup(false)}
                                  // onClick={e => closeDrawer(e)}
                                >
                                  <i className="ico ico-close-small"></i>
                                </button>
                              </div>
                              <div className="msg">
                                <i className="ico ico-check"></i>
                                <label
                                  className="label"
                                  style={{
                                    color: '#36435c',
                                  }}
                                >{`Discovered `}</label>
                              </div>
                              <div className="desc">
                                <h2>{`DESCRIPTION`}</h2>
                                <p> {`${describe}`}</p>
                                <h2> {`SUGGEST`}</h2>
                                <p> {`${suggest}`}</p>
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

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#eff4f9',
        }}
      >
        <div>
          <Tabs tabs={tabs()} />
        </div>
        <div>
          <div>{`최근 인스펙션 시간 : ${lastScheduleTime}`}</div>
        </div>
      </div>
      <div className="grid_item">
        <div className="grid_title">
          <label></label>
          <div
            className="content_box_wrap"
            //   style={{ marginLeft: 'auto' }}
          >
            <div className="tab_toggle_wrap status_wrap">
              <button
                className={`${
                  !buttonPass
                    ? 'btn tab_toggle status pass'
                    : 'btn tab_toggle on status pass'
                }`}
                type="button"
                onClick={e => {
                  setButtonPass(!buttonPass);
                  setButtonWarning(false);
                  setButtonDanger(false);
                  setShowPopup(false);
                }}
                value="pass"
              >
                <span>{t('CLUSTER_INSPECTION_PASS')}</span>
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
                  setShowPopup(false);
                }}
                value="warning"
              >
                <span>{t('CLUSTER_INSPECTION_WARNING')}</span>
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
                  setShowPopup(false);
                }}
                value="danger"
              >
                <span>{t('CLUSTER_INSPECTION_DANGER')}</span>
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
