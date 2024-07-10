import { get, groupBy } from 'lodash';
import React, { useState, useEffect } from 'react';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';

import { Icon, Tooltip } from '@kube-design/components';
import { getLocalTime, memoryFormat, cpuFormat } from 'utils';
import { Panel, Text } from 'components/Base';

import styles from './index.scss';

//= ===================================
// pod_status 상태
// ====================================
// Status (Kor)	   Status (Eng)	          Description
// 서버 준비 중	    Server Configuring	   업로드 위한 서버 준비 중 (대기 중)
// 서버 준비 완료	  Server Ready	         업로드 위한 서버 준비 완료(파일 업로드 대기 중)
// 파일 업로드 중	  File Uploading	       파일 업로드 중
// 이미지 빌드 중	  Image Build	           이미지 빌드 및 이미지 저장소에 push 중
// 이미지 빌드 완료	Image Build Succeed	   이미비 빌드 후 저장소로 push 완료
// 실패	           Fail                 	과정 실패
// // ====================================

const Status = props => {
  const renderPodStatus = () => {
    const detailInfo = props.detailStore.detail;

    // const uploadInfo = get(detailInfo, ['upload-info-list', 'upload-info'], [])[0]
    // const fileStatus = get(uploadInfo, ['upload-file-info', 'Status'], '')
    const podStatusData = get(detailInfo, 'pod-status', '');
    const podStatus = podStatusData.replace(/\s/gi, '');

    const fileServerArrayState = [
      'ServerConfiguring',
      'ServerReady',
      'ServerConfigureFail',
      'ServerDeleting',
    ];
    const fileUploadArrayState = [
      'FileUploading',
      'FileUploadCompleted',
      'FileUploadFail',
      'ImageBuild',
      'ImageBuildSucceed',
      'ImagePushFailed',
    ];
    const fileBuildArrayState = [
      'ImageBuild&Pushing',
      'ImageBuildSucceed',
      'ImagePushFailed',
    ];

    const stepRunningArray = ['ServerReady', 'FileUploading', 'ImageBuild'];
    const stepSucceedArray = ['ImageBuildSucceed'];
    const stepFailedArray = ['Fail'];

    const stepDescriptionJson = {
      ServerConfiguring: 'RESOURCES_ENVIRONMENT_CONFIGURATION_ING_DESC',
      ServerReady: 'RESOURCES_ENVIRONMENT_CONFIGURATION_COMPLETE_DESC',
      ServerConfigureFail: 'RESOURCES_ENVIRONMENT_CONFIGURATION_FAIL_DESC',
      FileUploading: 'RESOURCES_FILE_UPLOADING_DESC',
      FileUploadCompleted: 'RESOURCES_FILE_UPLOAD_COMPLETE_DESC',
      FileUploadFail: 'RESOURCES_FILE_UPLOAD_FAIL_DESC',
      ImageBuild: 'RESOURCES_IMAGE_BUILD_PUSH_ING_DESC',
      ImageBuildSucceed: 'RESOURCES_IMAGE_BUILD_PUSH_COMPLETE_DESC',
      ImagePushFailed: 'RESOURCES_FILE_UPLOAD_FAIL_DESC',
      Fail: 'RESOURCES_FILE_UPLOAD_FAIL_DESC',
    };

    const status = 'success';
    const type = 'type';

    return (
      <Panel title={t('STATUS_INFORMATION')}>
        <div className={styles.header}>
          <Text
            className={styles.info}
            icon="image"
            title={
              stepFailedArray.includes(podStatus.replace(/\s/gi, ''))
                ? t('RESOURCES_FAIL')
                : stepRunningArray.includes(podStatus.replace(/\s/gi, ''))
                ? t('RESOURCES_RUNNING')
                : stepSucceedArray.includes(podStatus.replace(/\s/gi, ''))
                ? t('RESOURCES_COMPLETE')
                : t('RESOURCES_PREPARING')
            }
            description={t(stepDescriptionJson[podStatus.replace(/\s/gi, '')])}
            extra={
              <Icon
                className={styles.status}
                name={podStatus === 'Fail' ? 'error' : 'success'}
                color={{
                  primary: '#fff',
                  secondary: podStatus === 'Fail' ? '#ca2621' : '#55bc8a',
                }}
              />
            }
          />
        </div>
        <div className={styles.content}>
          {/* {(fileServerArrayState.includes(podStatus.replace(/\s/gi, ""))
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
            } */}

          <Text
            key={type}
            className={styles.condition}
            icon="image"
            title={t(`RESOURCES_ENVIRONMENT_CONFIGURATION`)}
            description={t(`RESOURCES_ENVIRONMENT_CONFIGURATION_COMPLETE_DESC`)}
            extra={
              <Icon
                className={styles.status}
                name={'success'}
                color={{
                  primary: '#fff',
                  secondary: '#55bc8a',
                }}
              />
            }
          />
          {!fileUploadArrayState.includes(podStatus.replace(/\s/gi, '')) && (
            <Text
              key={type}
              className={styles.condition}
              icon="image"
              title={t(`RESOURCES_FILE_UPLOAD`)}
              description={t(`RESOURCES_FILE_UPLOAD_BEFORE_DESC`)}
              extra={<Icon className={styles.status} name={'substract'} />}
            />
          )}
          {fileUploadArrayState.includes(podStatus.replace(/\s/gi, '')) && (
            <Text
              key={type}
              className={styles.condition}
              icon="image"
              title={t(`RESOURCES_FILE_UPLOAD`)}
              description={
                podStatus == 'FileUploadFail'
                  ? t(`RESOURCES_FILE_UPLOAD_FAIL_DESC`)
                  : podStatus === 'FileUploading'
                  ? t(`RESOURCES_FILE_UPLOADING_DESC`)
                  : t(`RESOURCES_FILE_UPLOAD_COMPLETE_DESC`)
              }
              extra={
                <Icon
                  className={styles.status}
                  name={
                    podStatus === 'FileUploadFail'
                      ? 'error'
                      : podStatus === 'FileUploading'
                      ? 'up-circle-duotone'
                      : 'success'
                  }
                  color={{
                    primary: '#fff',
                    secondary:
                      podStatus === 'FileUploadFail' ? '#ca2621' : '#55bc8a',
                  }}
                />
              }
            />
          )}

          {!fileBuildArrayState.includes(podStatus.replace(/\s/gi, '')) && (
            <Text
              key={type}
              className={styles.condition}
              icon="image"
              title={t(`RESOURCES_IMAGE_BUILD_PUSH`)}
              description={t(`RESOURCES_IMAGE_BUILD_PUSH_BEFORE_DESC`)}
              extra={<Icon className={styles.status} name={'substract'} />}
            />
          )}
          {fileBuildArrayState.includes(podStatus.replace(/\s/gi, '')) && (
            <Text
              key={type}
              className={styles.condition}
              icon="image"
              title={t(`RESOURCES_IMAGE_BUILD_PUSH`)}
              description={
                podStatus == 'ImagePushFailed'
                  ? t(`RESOURCES_FILE_UPLOAD_FAIL_DESC`)
                  : podStatus === 'ImageBuild'
                  ? t(`RESOURCES_IMAGE_BUILD_PUSH_ING_DESC`)
                  : t(`RESOURCES_IMAGE_BUILD_PUSH_COMPLETE_DESC`)
              }
              extra={
                <Icon
                  className={styles.status}
                  name={
                    podStatus === 'ImagePushFailed'
                      ? 'error'
                      : podStatus === 'ImageBuild'
                      ? 'up-circle-duotone'
                      : 'success'
                  }
                  color={{
                    primary: '#fff',
                    secondary:
                      podStatus === 'ImagePushFailed' ? '#ca2621' : '#55bc8a',
                  }}
                />
              }
            />
          )}
        </div>
      </Panel>
    );
  };

  return (
    <>
      <div>{renderPodStatus()}</div>
    </>
  );
};

export default inject('detailStore')(observer(Status));
