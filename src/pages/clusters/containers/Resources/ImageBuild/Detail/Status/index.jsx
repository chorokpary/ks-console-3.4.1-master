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
// 생성 중 : PodCreating
// 실행 중 : PodRunning
// 삭제 중 : PodDeleting
// 파일 업로드중 : FileUploading
// 파일 업로드 완료 : FileUploadCompleted
// 이미지 빌드&푸시 중 : ImageBuildPushing
// 이미지 빌드&푸시 완료 : ImagePushCompleted
//====================================

const Status = (props) => {

  const renderPodStatus = () => {

    const detailInfo = props.detailStore.detail;

    const uploadInfo = get(detailInfo, ['upload-info-list', 'upload-info'], [])[0]
    const fileStatus = get(uploadInfo, ['upload-file-info', 'Status'], '')
    const podStatus = get(detailInfo, 'pod-status', '')

    const fileUploadArrayState = ['FileUploading', 'FileUploadCompleted', 'ImageBuildPushing', 'ImagePushCompleted']
    const fileBuildArrayState = ['ImageBuildPushing', 'ImagePushCompleted']

      const status = 'success';
      const type = 'type'

      return (
        <Panel title={t('STATUS_INFORMATION')}>
          <div className={styles.header}>
            <Text
              className={styles.info}
              icon="image"
              title={t('RESOURCES_SUCCESS')}
              description={t('RESOURCES_IMAGE_BUILDING_DESC')}
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
                title={t(`RESOURCES_ENVIRONMENT_CONFIGURATION`)}
                description={t( `RESOURCES_FILE_UPLOADED_DESC`)}
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
            {(fileStatus.toLowerCase() == 'completed' && fileUploadArrayState.includes(podStatus)) &&
                <Text
                  key={type}
                  className={styles.condition}
                  icon='image'
                  title={t(`RESOURCES_FILE_UPLOAD`)}
                  description={podStatus == 'FileUploading' ? t(`RESOURCES_FILE_UPLOADING_DESC`) : t(`RESOURCES_FILE_UPLOAD_COMPLETE_DESC`)}
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
            {(fileStatus.toLowerCase() == 'completed' && fileBuildArrayState.includes(podStatus)) &&
                <Text
                  key={type}
                  className={styles.condition}
                  icon='image'
                  title={t(`RESOURCES_IMAGE_BUILD_PUSH`)}
                  description={podStatus == 'ImageBuildPushing' ? t(`RESOURCES_IMAGE_BUILD_PUSH_ING_DESC`) : t(`RESOURCES_IMAGE_BUILD_PUSH_COMPLETE_DESC`)}
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

