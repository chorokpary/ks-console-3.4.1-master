import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Card } from 'components/Base'
import { Button, Notify } from '@kube-design/components'

import DetailGpuVmList from 'pages/clusters/containers/Resources/components/DetailGpuVmList';

import styles from './index.scss'

const Status = (props) => {

  console.log(props)

  const store = props.detailStore;

  const [detailFlavor, setDetailFlavor] = useState(null)
  const [detailNetwork, setDetailNetwork] = useState([])

  // 초기 데이터 처리
  useEffect(() => {

  }, [])

  return (
    <>
      <div>
        
        {/* Flavor */}
        {!!detailFlavor && (
          <Panel title={'Flavor'}>
            <div className={styles.wrapper}>
              <div className={classnames(styles.itemFlavor)}>
                <div className={styles.icon}>
                  <Icon name="apps" size={40} />
                </div>
                <div className={classnames(styles.title, styles.name)}>
                  <div>
                    <Link
                      to={`/clusters/${cluster}/flavors/${detailFlavor.name}`}
                    >
                      {detailFlavor.name}
                    </Link>
                  </div>
                  <p>{t('RESOURCES_NAME')}</p>
                </div>
                <div className={styles.title}>
                  <Text
                    key="CPU"
                    icon="cpu"
                    title={`${detailFlavor.vcpus} Core`}
                    description={t('CPU')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key="Memory"
                    icon="memory"
                    title={`${common.fnSetBytes(detailFlavor.ram)} GiB`}
                    description={t('Memory')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key="Disk"
                    icon="storage"
                    title={`${detailFlavor.root_disk} GiB`}
                    description={t('Disk')}
                  />
                </div>
                <div className={styles.title}>
                  <Text
                    key="GPU"
                    icon="gpu"
                    title={
                      detailFlavor.gpus.length >= 1
                        ? detailFlavor.gpus.length == 1
                          ? detailFlavor.gpus[0].quantity+" " +detailFlavor.gpus[0].name
                          : `${detailFlavor.gpus[0].name} ${t(
                            'RESOURCES_BESIDES'
                          )} ${detailFlavor.gpus.length - 1}${t(
                            'RESOURCES_COUNT'
                          )}`
                        : '-'
                    }
                    description={t('GPU')}
                  />
                </div>
              </div>
            </div>
          </Panel>
        )}

         <DetailGpuVmList
          type={t('RESOURCES_NETWORK')}
          variables="networks"
          {...props.match.params}
          // id={props.match.params.id}
          id="1ae2da65-2f98-42f3-b32c-ef56adfe3223"          
        />

      </div>
    </>
  );
};

export default inject('detailStore')(observer(Status))

