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
// ====================================
// 서버 구성
// 실행중 = "Server Configuring"
// 완료 = "Server Ready"
// 실패 = "Server Configure Fail"
// 삭제 = "Server Deleting"

// 파일 업로드
// 실행중 = "File Uploading"
// 완료 = "File Upload Completed"
// 실패 = "File Upload Fail"

// 이미지 빌드/푸시
// 실행중 = "Image Build & Pushing"
// 완료 = "Image Push Completed"
// 실패 = "Image Push Failed"
// // ====================================


const Status = (props) => {

  const renderPodStatus = () => {

    const detailInfo = props.detailStore.detail;

    const uploadInfo = get(detailInfo, ['upload-info-list', 'upload-info'], [])[0]
    const fileStatus = get(uploadInfo, ['upload-file-info', 'Status'], '')
    const podStatusData = get(detailInfo, 'pod-status', '')
    const podStatus = podStatusData.replace(/\s/gi, "")

    // text.replace(/\s/gi, "")

    const fileServerArrayState = ['ServerConfiguring', 'ServerReady', 'ServerConfigureFail', 'ServerDeleting']
    const fileUploadArrayState = ['FileUploading', 'FileUploadCompleted', 'FileUploadFail', 'ImageBuild&Pushing', 'ImagePushCompleted', 'ImagePushFailed']
    const fileBuildArrayState = ['ImageBuild&Pushing', 'ImagePushCompleted', 'ImagePushFailed']


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
            {(fileServerArrayState.includes(podStatus.replace(/\s/gi, ""))
             || fileUploadArrayState.includes(podStatus.replace(/\s/gi, "")) 
             || fileBuildArrayState.includes(podStatus.replace(/\s/gi, ""))) &&
              <Text
                key={type}
                className={styles.condition}
                icon='image'
                title={t(`RESOURCES_ENVIRONMENT_CONFIGURATION`)}
                description={podStatus == 'ServerConfigureFail' ? t(`RESOURCES_ENVIRONMENT_CONFIGURATION_FAIL_DESC`) 
                            : podStatus === 'ServerConfiguring' ? t(`RESOURCES_ENVIRONMENT_CONFIGURATION_ING_DESC`) : t(`RESOURCES_ENVIRONMENT_CONFIGURATION_COMPLETE_DESC`)}
                extra={
                  <Icon
                    className={styles.status}
                    name={podStatus === 'ServerConfigureFail' ? 'error' : podStatus === 'ServerConfiguring' ? 'up-circle-duotone' : 'success' }
                    color={{
                      primary: '#fff',
                      secondary: podStatus === 'ServerConfigureFail' ? '#ca2621' : '#55bc8a',
                    }}
                  />
                }
              /> 
            }
            {(fileUploadArrayState.includes(podStatus.replace(/\s/gi, ""))) &&
                <Text
                  key={type}
                  className={styles.condition}
                  icon='image'
                  title={t(`RESOURCES_FILE_UPLOAD`)}
                  description={podStatus == 'FileUploadFail' ? t(`RESOURCES_FILE_UPLOAD_FAIL_DESC`) 
                               : podStatus === 'FileUploading' ? t(`RESOURCES_FILE_UPLOADING_DESC`) : t(`RESOURCES_FILE_UPLOAD_COMPLETE_DESC`)}
                  extra={
                    <Icon
                      className={styles.status}
                      name={podStatus === 'FileUploadFail' ? 'error' : podStatus === 'FileUploading' ? 'up-circle-duotone' : 'success' }
                      color={{
                        primary: '#fff',
                        secondary: podStatus === 'FileUploadFail' ? '#ca2621' : '#55bc8a',
                      }}
                    />
                  }
                /> 
            }
            {(fileBuildArrayState.includes(podStatus.replace(/\s/gi, ""))) &&
                <Text
                  key={type}
                  className={styles.condition}
                  icon='image'
                  title={t(`RESOURCES_IMAGE_BUILD_PUSH`)}
                  description={podStatus == 'ImagePushFailed' ? t(`RESOURCES_FILE_UPLOAD_FAIL_DESC`) 
                               : podStatus === 'ImageBuild&Pushing' ? t(`RESOURCES_IMAGE_BUILD_PUSH_ING_DESC`) : t(`RESOURCES_IMAGE_BUILD_PUSH_COMPLETE_DESC`)}
                  extra={
                    <Icon
                      className={styles.status}
                      name={podStatus === 'ImagePushFailed' ? 'error' : podStatus === 'ImageBuild&Pushing' ? 'up-circle-duotone' : 'success' }
                      color={{
                        primary: '#fff',
                        secondary: podStatus === 'ImagePushFailed' ? '#ca2621' : '#55bc8a',
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

