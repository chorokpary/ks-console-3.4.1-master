import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import { Icon } from '@kube-design/components'
import { Link } from 'react-router-dom'
import { Panel } from 'components/Base';
import DetailVmList from 'pages/projects/containers/Resources/components/DetailVmList'
import DetailKaasList from 'pages/projects/containers/Resources/components/DetailKaasList'

import styles from './index.scss'

const Status = (props) => {

  const store = props.detailStore;

  const [id, setId] = useState()

  useEffect(() => {
    setId(store.detail.volume?.used_by_vmi)
  }, [id])

  const cluster = store.detail.cluster
  const project = store.detail.volume?.project

  return (
    <>
      {/* 가상머신 혹은 KaaS 리스트 */}
      {id && !id?.includes('control-plane') &&
        // used_by_vmi 가 VM 일 경우
        <div>
          <DetailVmList type={t('RESOURCES_VOLUME')} variables='volume' {...props.match.params} id={props.match.params.id} />
        </div>
      }
      {!id && !id?.includes('control-plane') &&
        // used_by_vmi 가 비어있는 경우
        <div>
          <DetailVmList type={t('RESOURCES_VOLUME')} variables='volume'{...props.match.params} id={props.match.params.id} />
        </div>
      }
      {id && id?.includes('control-plane') &&
        // used_by_vmi 가 KaaS 일 경우
        <div>
          <DetailKaasList type={t('RESOURCES_VOLUME')} variables='volume'{...props.match.params} name={id} />
        </div>
      }

      {/* PVC 리스트 */}
      <div>
        <Panel title={t('PERSISTENT_VOLUME_CLAIM')}>
          <div className={styles.wrapper}>
            <div className={classnames(styles.item)}>
              <div className={styles.icon}>
                <Icon name="storage" size={40} />
              </div>
              <div className={classnames(styles.title, styles.name)} style={{ width: '32%' }}>
                <div>
                  <Link
                    to={`/clusters/${cluster}/projects/${project}/volumes/${props.match.params.id}/resource-status`}
                  >
                    {props.match.params.id}
                  </Link>
                </div>
                <p>{t('NAME')}</p>
              </div>
              <div className={styles.title} style={{ width: '18%' }}>
                <div>
                  {t(`PV_STATUS_${store.detail.volume?.pvc_phase.toUpperCase()}`)}
                </div>
                <p>{t('STATUS')}</p>
              </div>
              <div className={styles.title} style={{ width: '18%' }}>
                <div>{store.detail.volume?.capacity}</div>
                <p>{t('RESOURCES_CAPACITY')}</p>
              </div>
              <div className={styles.title}>
                <div>
                  {store.detail.volume?.storage_class}
                </div>
                <p>{t('RESOURCES_STOREGE_CLASS')}</p>
              </div>
              <div className={styles.title}>
                <div>{store.detail.volume?.volume_mode}</div>
                <p>{t('RESOURCES_VOLUME_MODE')}</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status))

