/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2024 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState, useEffect } from 'react'
import { observer, inject } from 'mobx-react'

import { Panel } from 'components/Base'
import { Button, Loading } from '@kube-design/components'
import ClusterAddonStore from 'stores/resources/clusteraddon'
import ClusterResourceStore from 'stores/resources/containerresource'
import styles from './index.scss'

const clusterAddonStore = new ClusterAddonStore()
const clusterResourceStore = new ClusterResourceStore()

const Presets = props => {
  const [addons, setAddons] = useState()
  const [isLoading, setIsLoading] = useState(true)
  let isMounted = false

  useEffect(() => {
    isMounted = true
    getClusterPresetData().then(() => {})
    return () => {
      isMounted = false
    }
  }, [])

  const getClusterPresetData = async () => {
    const obj = await clusterAddonStore.fetchList()
    if (isMounted) {
      setAddons(obj)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    clusterResourceStore.fetchData = fetchData()
  }, [])

  const fetchData = async () => {
    await clusterResourceStore.fetchDetail(props.match.params)
  }

  const handleInstall = async detail => {
    try {
      const data = {
        name: clusterResourceStore.detail.cluster.name,
        project: clusterResourceStore.detail.cluster.cp.namespace
          ? clusterResourceStore.detail.cluster.cp.namespace
          : 'default',
        labels: detail.labels,
      }
      await clusterResourceStore.updateLabels({ cluster_obj: data })
    } catch (error) {
      console.error('Failed to install addon:', error)
    }
  }

  const AddonItem = ({ detail, t, handleInstalling }) => {
    const [imgSrc, setImgSrc] = useState(
      `/assets/${detail.vendor.toLowerCase()}.svg`
    )
    const [isPngTried, setIsPngTried] = useState(false)

    const handleImageError = () => {
      if (!isPngTried) {
        setImgSrc(`/assets/${detail.name}.png`)
        setIsPngTried(true)
      } else {
        setImgSrc('/assets/fallback.png')
      }
    }

    return (
      <div>
        <div className={styles.itemMain}>
          <div className={styles.icon}>
            <img
              className={styles.image}
              alt={detail.vendor}
              src={imgSrc}
              onError={handleImageError}
            />
          </div>
          <div className={styles.content}>
            <div className={styles.title} style={{ width: '16%' }}>
              <div>{detail.name}</div>
              <p>{t('RESOURCES_NAME')}</p>
            </div>
            <div className={styles.text} style={{ width: '8%' }}>
              <div>{detail.version}</div>
              <p>{t('VERSION')}</p>
            </div>
            <div className={styles.text} style={{ width: '68%' }}>
              <div>{detail.description}</div>
            </div>
            <div className={styles.text} style={{ width: '8%' }}>
              <Button type="control" onClick={() => handleInstalling(detail)}>
                {t('INSTALL')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStatus = () => {
    return (
      <Panel>
        {!!addons &&
          addons.map((detail, index) => (
            <AddonItem
              key={index}
              detail={detail}
              t={t}
              handleInstalling={handleInstall}
            />
          ))}
      </Panel>
    )
  }

  return (
    <>
      {isLoading ? (
        <div>
          <Loading />
        </div>
      ) : (
        <div>{renderStatus()}</div>
      )}
    </>
  )
}

export default inject('detailStore')(observer(Presets))
