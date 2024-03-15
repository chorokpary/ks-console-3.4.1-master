import { get, groupBy } from 'lodash'
import React, {useState, useEffect} from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Icon, Tooltip } from '@kube-design/components'
import { getLocalTime, memoryFormat, cpuFormat } from 'utils'
import { Panel, Text } from 'components/Base'

import styles from './index.scss'

const Status = (props) => {

  console.log(JSON.stringify(props.detailStore.detail))

  const renderPodStatus = () => {
    
      const phase = 'Running'
      const status = 'success';
      const type = 'type'

      return (
        <Panel title={t('STATUS_INFORMATION')}>
          <div className={styles.header}>
            <Text
              className={styles.info}
              icon="image"
              title={t('성공')}
              description={t('이미지 빌드를 진해한 상태입니다.')}
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
                <Text
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
                /> 
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

