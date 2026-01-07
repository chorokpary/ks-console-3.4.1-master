import { get, groupBy } from 'lodash'
import React, { useState, useEffect } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import { Card } from 'components/Base'
import { Button, Notify } from '@kube-design/components'

import styles from './index.scss'

const Status = props => {
  const store = props.detailStore

  const [showSecret, setShowSecret] = useState(false)

  const [encodeKey, setEncodeKey] = useState()
  const [originData, setOriginData] = useState()

  const createEncode64 = key => {
    let forge = require('node-forge')
    const encoded = forge.util.encode64(key)
    return encoded
  }

  const convert = () => {
    return showSecret ? originData : encodeKey
  }

  const textClipboard = () => {
    const keyText = showSecret ? originData : encodeKey

    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard
        .writeText(keyText)
        .then(e => Notify.success(t('RESOURCES_COPY_SUCCESSFUL')))
    } else {
      unsecuredCopyToClipboard(keyText)
      Notify.success(t('RESOURCES_COPY_SUCCESSFUL'))
    }
  }

  // navigator.clipboard.writeText 가 https 환경에서만 작동하여
  // https 환경이 아닐경우 우회 복사 처리
  // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
  const unsecuredCopyToClipboard = text => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (err) {
      // console.error('Unable to copy to clipboard', err)
      void err // intentionally ignored
    }
    document.body.removeChild(textArea)
  }

  // 초기 데이터 처리
  useEffect(() => {
    setOriginData(get(store.detail.keypair, 'public_key', ''))
    setEncodeKey(createEncode64(get(store.detail.keypair, 'public_key', '')))
  }, [])

  const renderOperations = () => {
    return (
      <div>
        <Button
          type="flat"
          icon={showSecret ? 'eye' : 'eye-closed'}
          onClick={() => {
            setShowSecret(!showSecret)
          }}
        />
        <Button onClick={() => textClipboard()}>{t('RESOURCES_COPY')}</Button>
      </div>
    )
  }

  return (
    <>
      <div>
        <Card operations={renderOperations()}>
          <div className={styles.defaultWrapper}>
            <ul>
              <li>
                <span>
                  <pre>{convert()}</pre>
                </span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </>
  )
}

export default inject('detailStore')(observer(Status))
