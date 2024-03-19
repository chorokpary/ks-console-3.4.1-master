import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Icon, Tooltip } from '@kube-design/components'
import { getLocalTime, memoryFormat, cpuFormat } from 'utils'
import { Panel, Text } from 'components/Base'

import styles from './index.scss'

//====================================
// pod_status 상태
//====================================
// Pending : 생성 중
// Running : 실행 중
// Success : 컨테이너 실행 후 정상 종료
// Failed : 컨테이너 실행 후 비정상 종료
// Unknown: 알 수 없음
//====================================

const Status = (props) => {

  const renderPodStatus = () => {

    const detailInfo = props.detailStore.detail;

    const uploadInfo = get(detailInfo, ['upload-info-list', 'upload-info'], [])[0]
    const fileStatus = get(uploadInfo, ['upload-file-info', 'Status'], '')
    const podStatus = get(detailInfo, 'pod-status', '')

      const status = 'success';
      const type = 'type'

      return (
        <Panel title={t('STATUS_INFORMATION')}>
          <div className={styles.header}>
            <Text
              className={styles.info}
              icon="image"
              title={t('성공')}
              description={t('이미지 빌드를 진행한 상태입니다.')}
              extra={
                <Icon
                className={styles.status}
                name={status === 'success' ? 'success' : 'error'}
                color={{
                  primary: '#fff',
                  secondary: status === 'success' ? '#55bc8a' : '#ca2621',
                }}
              />
              }
            />
          </div>
          <div className={styles.content}>
            {fileStatus.toLowerCase() == 'completed' &&
              <Text
                key={type}
                className={styles.condition}
                icon='image'
                title={t(`파일 업로드 상태`)}
                description={t( `파일을 업로드한 상태입니다.`)}
                extra={
                  <Icon
                    className={styles.status}
                    name={status === 'success' ? 'success' : 'error'}
                    color={{
                      primary: '#fff',
                      secondary: status === 'success' ? '#55bc8a' : '#ca2621',
                    }}
                  />
                }
              /> 
            }
            {(fileStatus.toLowerCase() == 'completed' && !!podStatus ) &&
                <Text
                  key={type}
                  className={styles.condition}
                  icon='image'
                  title={t(`이미지 빌드 상태`)}
                  description={t( `이미지에 생성한 빌드 상태입니다.`)}
                  extra={
                    <Icon
                      className={styles.status}
                      name={status === 'success' ? 'success' : 'error'}
                      color={{
                        primary: '#fff',
                        secondary: status === 'success' ? '#55bc8a' : '#ca2621',
                      }}
                    />
                  }
                /> 
            }
                {/* <Text
                  key={type}
                  className={styles.condition}
                  icon='image'
                  title={t(`Registry Push 상태`)}
                  description={t( `Registry에 Push한 상태입니다.`)}
                  extra={
                    <Icon
                      className={styles.status}
                      name={'substract'}
                    />
                  } 
                /> */}
          </div>
        </Panel>
      )
    }
    
  return (
    <>  
        <div>
        {renderPodStatus()}
        </div>
    </>
  );
};

export default inject('detailStore')(observer(Status))

