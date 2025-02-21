import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'

import { Panel, Text } from 'components/Base'
import { Icon } from '@kube-design/components'
import styles from './index.scss'
import { Link } from 'react-router-dom'

import * as common from 'utils/resources'

const DetailGpuDeviceList = (props) => {

    const [isExpandFlag, setIsExpandFlag] = useState(false)
    const [expandItem, setExpandItem] = useState();

    const cluster = props.cluster;

    const renderContent = (obj) => {
        return (
            <>
                <div className={styles.content}>
                    <div className={styles.text}>
                    <div>{obj.gpu_model}</div>
                        <p>{t('RESOURCES_GPU_MODEL')}</p>
                    </div>
                    <div className={styles.text}>
                        <div>GPU-{obj.index}</div>
                        <p>{t('RESOURCES_GPU_INDEX')}</p>
                    </div>
                    <div className={styles.text}>
                        <div>{obj.memory_gib}</div>
                        <p>{t('RESOURCES_GPU_RAM')}</p>
                    </div>
                    <div className={styles.text}>
                        <div>{obj.mig ? t('RESOURCES_USE') : t('RESOURCES_NOT_USE')}</div>
                        <p>{t('RESOURCES_GPU_MIG')}</p>
                    </div>
                    {!obj.mig ? <div className={styles.text} style={{ width: '5%' }} /> :
                        <div className={styles.arrow} onClick={() => handleExpand(obj.index)}>
                            <Icon name="chevron-down" type={obj.index != expandItem ? '' : (obj.index == expandItem && isExpandFlag == false) ? '' : 'light'} size={20} />
                        </div>
                    }
                </div>
            </>
        )
    }

    const renderExtraContent = (obj) => {
        return (
            <div className={styles.itemExtra}>
                <div className={styles.containers} >
                    {obj.mig &&
                        <Panel title={t('RESOURCES_GPU_MIG_SLICE')} className={styles.panelWrapper}>
                            <div className={styles.table}>
                                <table>
                                    <colgroup>
                                        <col width="25%" />
                                        <col width="25%" />
			                <col width="25%" />
			                <col width="25%" />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>{t('RESOURCES_GPU_MIG_SLICE_NAME')}</th>
                                            <th>{t('RESOURCES_GPU_MIG_SLICE_NUMBER')}</th>
			                    <th>{t('RESOURCES_GPU_MIG_COPY_ENGINES')}</th>
			                    <th>{t('RESOURCES_GPU_MIG_MEMORY')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(obj.mig_devices).map((item, index) => (
                                            <tr>
                                                <td>{item.name}</td>
                                                <td>{item.number}</td>
						<td>{item.copy_engines}</td>
						<td>{item.memory}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Panel>
                    }
                </div>
            </div>
        )
    }

    const handleExpand = (index) => {
        setExpandItem(index);
        setIsExpandFlag(!isExpandFlag)
    }

    return (
        <>
            <Panel title={t('RESOURCES_GPU_DEVICE')} >
                <div className={styles.wrapper}>
                    {(props.gpuDeviceData).map((obj, index) => {
                        return (
                            <div
                                className={classnames(styles.expandItem, "", {
                                    [styles.expanded]: (obj.index == expandItem ? isExpandFlag : false),
                                })} key={index}
                            >
                                <div className={styles.itemMain}>
                                    <div className={styles.icon}>
                                        <Icon name="gpu" size={40} type={obj.index != expandItem ? 'dark' : (obj.index == expandItem && isExpandFlag == false) ? 'dark' : 'light'} />
                                    </div>
                                    {renderContent(obj)}
                                </div>
                                {obj.mig_devices.length > 0 && renderExtraContent(obj)}
                            </div>
                        )
                    }
                    )}
                </div>
            </Panel>
        </>
    );
};

export default DetailGpuDeviceList
