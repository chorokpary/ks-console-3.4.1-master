/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
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

import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { LocaleProvider, Loading, Notify } from '@kube-design/components'

import { isAppsPage, isMemberClusterPage } from 'utils'
import request from 'utils/request'

import App from './App'
import GlobalValue from './global'
import i18n from './i18n'

require('@babel/polyfill')

// ===============================
// 추가 함수 expire 만료 검사 start
// ===============================
const getCookieValue = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  if (match) return match[2]
  return null
}

const checkExpiration = async () => {
  const expire = getCookieValue('expire')
  if (!expire) return

  try {
    if (expire) {
      const now = Math.floor(Date.now() / 1000)
      const expireSec = Math.floor(expire / 1000)

      if (now >= expireSec) {
        // 만료 시 로그아웃 처리
        await request.post('logout')
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

setInterval(checkExpiration, 10 * 1000)
checkExpiration()

// ===============================
// 추가 함수 expire 만료 검사 end
// ===============================

// request error handler
window.onunhandledrejection = function(e) {
  if (e && (e.status === 'Failure' || e.status >= 400)) {
    if (e.status === 401 || e.reason === 'Unauthorized') {
      // session timeout handler, except app store page.
      if (!isAppsPage() && !isMemberClusterPage(location.pathname, e.message)) {
        /* eslint-disable no-alert */
        location.href = `/login?referer=${location.pathname}`
        window.alert(t('LOGIN_AGAIN_DESC'))
      } else {
        Notify.error({ title: e.reason, content: t(e.message), duration: 6000 })
      }
    } else if (globals.config.enableErrorNotify && (e.reason || e.message)) {
      Notify.error({ title: e.reason, content: t(e.message), duration: 6000 })
    }
  }
}

// handle safari browser zoom out too small
window.onresize = () => {
  const ratio = window.outerHeight / window.innerHeight
  const ua = navigator.userAgent.toLowerCase()
  if (ua.indexOf('safari') && ratio < 0.75) {
    document.body.style.zoom = 1.5
  } else {
    document.body.style.zoom = 1
  }
}

window.t = i18n.t
window.request = request

globals.app = new GlobalValue()

const render = async component => {
  const { locales } = await i18n.init()
  ReactDOM.render(
    <Suspense fallback={<Loading className="ks-page-loading" />}>
      <LocaleProvider locales={locales} localeKey="lang" ignoreWarnings>
        {component}
      </LocaleProvider>
    </Suspense>,
    document.getElementById('root')
  )
}

render(<App />)

module.hot &&
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    render(<NextApp />)
  })
