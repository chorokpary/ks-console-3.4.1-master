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

const isEmpty = require('lodash/isEmpty')
const jwtDecode = require('jwt-decode')
const omit = require('lodash/omit')
const base64_url_decode = require('jwt-decode/lib/base64_url_decode')
const { getServerConfig } = require('../libs/utils')

const { client: clientConfig } = getServerConfig()

const {
  login,
  loginThird,
  oAuthLogin,
  getNewToken,
  createUser,
  createUserMfa,
} = require('../services/session')
const {
  isValidReferer,
  isAppsRoute,
  decryptPassword,
  safeParseJSON,
  safeBase64,
} = require('../libs/utils')

const { send_gateway_request } = require('../libs/request')

const handleLogin = async ctx => {
  const params = ctx.request.body

  let referer = ctx.cookies.get('referer')
  referer = referer ? decodeURIComponent(referer) : ''

  const error = {}
  let user = null

  if (isEmpty(params) || !params.username || !params.encrypt) {
    Object.assign(error, {
      status: 400,
      reason: 'Invalid Login Params',
      message: 'invalid login params',
    })
  }

  if (isEmpty(error)) {
    try {
      const encryptKey = clientConfig.encryptKey || 'kubesphere'
      params.password = decryptPassword(params.encrypt, encryptKey)

      user = await login(params, { 'x-client-ip': ctx.request.ip })

      if (!user) {
        Object.assign(error, {
          status: 401,
          reason: 'Unauthorized',
          message: 'INCORRECT_USERNAME_OR_PASSWORD',
        })
      }
    } catch (err) {
      ctx.app.emit('error', err)

      switch (err.code) {
        case 400:
        case 401:
          Object.assign(error, {
            status: err.code,
            reason: 'Unauthorized',
            message: 'INCORRECT_USERNAME_OR_PASSWORD',
          })
          break
        case 429:
          Object.assign(error, {
            status: err.code,
            reason: 'Too Many Failures',
            message: 'TOO_MANY_FAILURES',
          })
          break
        case 502:
          Object.assign(error, {
            status: err.code,
            reason: 'Bad Gateway',
            message: 'FAILED_TO_ACCESS_BACKEND',
          })
          break
        case 'ETIMEDOUT':
          Object.assign(error, {
            status: 500,
            reason: 'Internal Server Error',
            message: 'FAILED_TO_ACCESS_API_SERVER',
          })
          break
        default:
          Object.assign(error, {
            status: 500,
            reason: err.statusText,
            message: err.message,
          })
      }
    }
  }

  if (!isEmpty(error) || !user) {
    ctx.body = error
    return
  }

  const lastToken = ctx.cookies.get('token')

  ctx.cookies.set('token', user.token)
  ctx.cookies.set('expire', user.expire, { httpOnly: false })
  ctx.cookies.set('refreshToken', user.refreshToken)
  ctx.cookies.set('referer', null)

  // ctx.cookies.set('mm3AccessToken', mmsData.access_token)
  // ctx.cookies.set('mm3RefreshToken', mmsData.refresh_token)

  if (user.username === 'system:pre-registration') {
    const extraname = safeBase64.safeBtoa(user.extraname)
    ctx.cookies.set('defaultUser', extraname)
    ctx.cookies.set('defaultEmail', user.email)
    return ctx.redirect('/login/confirm')
  }

  if (!user.initialized) {
    return ctx.redirect('/password/confirm')
  }

  if (lastToken) {
    const { username } = jwtDecode(lastToken)
    if (username && username !== user.username) {
      return ctx.redirect('/')
    }
  }

  ctx.redirect(isValidReferer(referer) ? referer : '/')
}

const handleThirdLogin = async ctx => {
  const params = ctx.request.body

  let referer = ctx.cookies.get('referer')
  referer = referer ? decodeURIComponent(referer) : ''

  const error = {}
  let user = null

  if (!params.username || !params.password) {
    Object.assign(error, {
      status: 400,
      reason: 'Invalid Login Params',
      message: 'invalid login params',
    })
  }

  if (isEmpty(error)) {
    try {
      user = await loginThird(params, { 'x-client-ip': ctx.request.ip })

      if (!user) {
        Object.assign(error, {
          status: 401,
          reason: 'Unauthorized',
          message: 'INCORRECT_USERNAME_OR_PASSWORD',
        })
      }
    } catch (err) {
      ctx.app.emit('error', err)

      switch (err.code) {
        case 400:
        case 401:
          Object.assign(error, {
            status: err.code,
            reason: 'Unauthorized',
            message: 'INCORRECT_USERNAME_OR_PASSWORD',
          })
          break
        case 429:
          Object.assign(error, {
            status: err.code,
            reason: 'Too Many Failures',
            message: 'TOO_MANY_FAILURES',
          })
          break
        case 502:
          Object.assign(error, {
            status: err.code,
            reason: 'Bad Gateway',
            message: 'FAILED_TO_ACCESS_BACKEND',
          })
          break
        case 'ETIMEDOUT':
          Object.assign(error, {
            status: 500,
            reason: 'Internal Server Error',
            message: 'FAILED_TO_ACCESS_API_SERVER',
          })
          break
        default:
          Object.assign(error, {
            status: 500,
            reason: err.statusText,
            message: err.message,
          })
      }
    }
  }

  if (!isEmpty(error) || !user) {
    ctx.body = error
    return
  }

  const lastToken = ctx.cookies.get('token')

  ctx.cookies.set('token', user.token)
  ctx.cookies.set('expire', user.expire, { httpOnly: false })
  ctx.cookies.set('refreshToken', user.refreshToken)
  ctx.cookies.set('referer', null)

  if (user.username === 'system:pre-registration') {
    const extraname = safeBase64.safeBtoa(user.extraname)
    ctx.cookies.set('defaultUser', extraname)
    ctx.cookies.set('defaultEmail', user.email)
    return ctx.redirect('/login/confirm')
  }

  if (!user.initialized) {
    return ctx.redirect('/password/confirm')
  }

  if (lastToken) {
    const { username } = jwtDecode(lastToken)
    if (username && username !== user.username) {
      return ctx.redirect('/')
    }
  }

  ctx.redirect(isValidReferer(referer) ? referer : '/')
}

/*
const handleLogout = async ctx => {
  const oAuthLoginInfo = safeParseJSON(
    decodeURIComponent(ctx.cookies.get('oAuthLoginInfo'))
  )

  const token = ctx.cookies.get('token')

  ctx.cookies.set('token', null)
  ctx.cookies.set('expire', null)
  ctx.cookies.set('refreshToken', null)
  ctx.cookies.set('oAuthLoginInfo', null)

  // ctx.cookies.set('mm3AccessToken', null)
  // ctx.cookies.set('mm3RefreshToken', null)

  if (
    !isEmpty(oAuthLoginInfo) &&
    oAuthLoginInfo.type &&
    oAuthLoginInfo.type === 'OIDCIdentityProvider' &&
    oAuthLoginInfo.endSessionURL
  ) {
    // ewyoon
    const baseOrigin = origin || `${ctx.protocol}://${ctx.host}`
    const postLogoutRedirectURI = `${baseOrigin}/login`

    // 로그아웃 URL에 id_token_hint와 post_logout_redirect_uri 추가
   const logoutUrl =
      `/kapis/oauth/logout?post_logout_redirect_uri=` +
      encodeURIComponent(postLogoutRedirectURI)


    // Keycloak 로그아웃 리다이렉트
    ctx.body = { data: { url: logoutUrl }, success: true }
    // ewyoon
    //const url = `${oAuthLoginInfo.endSessionURL}`
    //ctx.body = { data: { url }, success: true }
  } else {
    const { origin = '', referer = '' } = ctx.headers
    const refererPath = referer.replace(origin, '')

    await send_gateway_request({
      method: 'GET',
      url: '/oauth/logout',
      token,
    })

    if (isAppsRoute(refererPath)) {
      ctx.redirect(refererPath)
    } else {
      ctx.redirect('/login')
    }
  }
}
*/

// 브라우저(프론트채널)에서 Keycloak 세션을 직접 종료하는 로그아웃 핸들러
// 브라우저(프론트채널)에서 Keycloak 세션을 직접 종료하는 로그아웃 핸들러
/*
const handleLogout = async ctx => {
  // 1) 쿠키/메타 정보 읽기
  let oAuthLoginInfo = {}
  try {
    const raw = ctx.cookies.get('oAuthLoginInfo')
    if (raw) oAuthLoginInfo = safeParseJSON(decodeURIComponent(raw)) || {}
  } catch (e) {
    oAuthLoginInfo = {}
  }

  const accessToken = ctx.cookies.get('token') || ''
  const maybeIdToken = ctx.cookies.get('id_token') || '' // 있다면 사용(선택)

  // 2) 앱/프론트 측 쿠키 정리
  const clear = name => ctx.cookies.set(name, null, { path: '/' }) // Path는 발급 시와 동일하게
  clear('token')
  clear('expire')
  clear('refreshToken')
  clear('oAuthLoginInfo')
  // clear('mm3AccessToken')
  // clear('mm3RefreshToken')

  // 3) 리다이렉트 기본값 계산
  const hdrOrigin = (ctx.headers && ctx.headers.origin) || ''
  const baseOrigin = hdrOrigin || `${ctx.protocol}://${ctx.host}`
  const postLogoutRedirectURI = `${baseOrigin}/login`

  // 4) OIDC 구성이 있고 endSessionURL이 있으면 → Keycloak end_session으로 브라우저 리다이렉트
  if (
    oAuthLoginInfo &&
    oAuthLoginInfo.type === 'OIDCIdentityProvider' &&
    oAuthLoginInfo.endSessionURL
  ) {
    const endSessionURL = oAuthLoginInfo.endSessionURL // ex) https://kc/realms/xxx/protocol/openid-connect/logout
    const url = new URL(endSessionURL)
    url.searchParams.set('post_logout_redirect_uri', postLogoutRedirectURI)

    // 가능하면 id_token_hint 사용(가장 명확)
    if (maybeIdToken) {
      url.searchParams.set('id_token_hint', maybeIdToken)
    } else {
      // 없으면 client_id 사용. 없을 경우 기본값 "kubesphere"
      const clientId =
        oAuthLoginInfo.clientID ||
        oAuthLoginInfo.clientId ||
        'kubesphere'
      url.searchParams.set('client_id', clientId)
    }

    // state 보존(있을 때만) — optional chaining 제거
    const q = (ctx.query || (ctx.request && ctx.request.query) || {})
    if (q.state) url.searchParams.set('state', q.state)

    // 프론트가 이 URL로 이동하도록 반환(혹은 ctx.redirect(url)로 즉시 리다이렉트도 가능)
    ctx.body = { data: { url: url.toString() }, success: true }
    return
  }

  // 5) fallback: OIDC 메타가 없으면 앱 토큰만 무효화하고 /login으로 보냄
  try {
    if (accessToken) {
      await send_gateway_request({
        method: 'GET',
        url: '/oauth/logout',
        token: accessToken,
      })
    }
  } catch (e) {
    // 베스트 에포트: 실패하더라도 계속 진행
  }

  const referer = (ctx.headers && ctx.headers.referer) || ''
  const refererPath = referer.replace(hdrOrigin, '')
  if (typeof isAppsRoute === 'function' && isAppsRoute(refererPath)) {
    ctx.redirect(refererPath)
  } else {
    ctx.redirect('/login')
  }
}
*/
const handleLogout = async ctx => {
  const oAuthLoginInfo = safeParseJSON(
    decodeURIComponent(ctx.cookies.get('oAuthLoginInfo'))
  )

  // console.log("=== 로그아웃 디버깅 ===")
  // console.log("oAuthLoginInfo:", JSON.stringify(oAuthLoginInfo, null, 2))

  const token = ctx.cookies.get('token')
  const idToken = ctx.cookies.get('id_token') // id_token이 있다면 사용

  ctx.cookies.set('token', null)
  ctx.cookies.set('expire', null)
  ctx.cookies.set('refreshToken', null)
  ctx.cookies.set('oAuthLoginInfo', null)
  ctx.cookies.set('id_token', null) // id_token도 정리

  // ctx.cookies.set('mm3AccessToken', null)
  // ctx.cookies.set('mm3RefreshToken', null)

  const hdrOrigin = (ctx.headers && ctx.headers.origin) || ''
  const baseOrigin = hdrOrigin || `${ctx.protocol}://${ctx.host}`
  const postLogoutRedirectURI = `${baseOrigin}/login`

  // end-session URL 구성 개선
  const endSessionBase = `http://${ctx.hostname}:30081/application/o/ks-console/end-session/`
  const params = new URLSearchParams()
  params.set('post_logout_redirect_uri', postLogoutRedirectURI)

  // id_token_hint가 있으면 추가 (더 안전한 로그아웃)
  if (idToken) {
    params.set('id_token_hint', idToken)
  }

  const endSessionURI = `${endSessionBase}?${params.toString()}`

  if (
    !isEmpty(oAuthLoginInfo) &&
    oAuthLoginInfo.type &&
    oAuthLoginInfo.type === 'OIDCIdentityProvider' &&
    oAuthLoginInfo.endSessionURL
  ) {
    const baseEndSessionURL = `${oAuthLoginInfo.endSessionURL}`
    // console.log("url : "+ baseEndSessionURL)

    // 원래 endSessionURL에 필요한 파라미터 추가
    const endSessionURL = new URL(baseEndSessionURL)
    endSessionURL.searchParams.set(
      'post_logout_redirect_uri',
      postLogoutRedirectURI
    )
    if (idToken) {
      endSessionURL.searchParams.set('id_token_hint', idToken)
    }

    // 클라이언트에서 직접 이동하도록 URL 반환
    ctx.body = {
      success: true,
      data: {
        url: endSessionURL.toString(),
      },
    }
  } else {
    const { origin = '', referer = '' } = ctx.headers
    const refererPath = referer.replace(origin, '')

    await send_gateway_request({
      method: 'GET',
      url: '/oauth/logout',
      token,
    })

    if (isAppsRoute(refererPath)) {
      ctx.redirect(refererPath)
    } else {
      ctx.redirect('/login')
    }
  }
}

const handleOAuthLogin = async ctx => {
  let user = null
  const error = {}
  const oauthParams = omit(ctx.query, ['redirect_url', 'state'])
  let referer = ctx.cookies.get('referer')
  referer = referer ? decodeURIComponent(referer) : ''

  try {
    user = await oAuthLogin({ ...oauthParams, oauthName: ctx.params.name })
  } catch (err) {
    /* eslint-disable no-console */
    // console.log(err)

    ctx.app.emit('error', err)
    Object.assign(error, {
      status: err.code,
      reason: err.statusText,
      message: err.message,
    })
  }

  if (!isEmpty(error) || !user) {
    ctx.body = error
    return
  }

  ctx.cookies.set('token', user.token)
  ctx.cookies.set('expire', user.expire, { httpOnly: false })
  ctx.cookies.set('refreshToken', user.refreshToken)
  ctx.cookies.set('referer', null)

  if (user.username === 'system:pre-registration') {
    const extraname = safeBase64.safeBtoa(user.extraname)
    ctx.cookies.set('defaultUser', extraname)
    ctx.cookies.set('defaultEmail', user.email)
    return ctx.redirect('/login/confirm')
  }

  const state = ctx.query.state
  const redirect_url = ctx.query.redirect_url

  if (state) {
    try {
      const state_object = JSON.parse(base64_url_decode(state))
      const state_url = state_object.redirect_url
      if (state_url) {
        ctx.redirect(state_url)
      }
    } catch (err) {
      /* eslint-disable no-console */
      // console.log(err)
      void err // intentionally ignored
    }
  }

  if (redirect_url) {
    const redirectHost = new URL(redirect_url).host
    if (redirectHost === ctx.headers.host) {
      ctx.redirect(redirect_url)
    }
  } else {
    ctx.redirect(isValidReferer(referer) ? referer : '/')
  }
}

const handleLoginConfirm = async ctx => {
  const token = ctx.cookies.get('token')
  const params = ctx.request.body

  await createUser(params, token)

  const data = await getNewToken(ctx)
  if (data.token) {
    ctx.cookies.set('token', data.token)
    ctx.cookies.set('expire', data.expire, { httpOnly: false })
    ctx.cookies.set('refreshToken', data.refreshToken)

    ctx.cookies.set('defaultUser', null)
    ctx.cookies.set('defaultEmail', null)
    ctx.redirect('/')
  }
}

const handleCreateUserMfa = async ctx => {
  const token = ctx.cookies.get('token')
  const params = ctx.request.body

  const result = await createUserMfa(params, token)

  ctx.status = result.success ? 200 : result.code || 500
  ctx.body = result
}

const handleGetUserMfaList = async ctx => {
  const token = ctx.cookies.get('token')  
  const result = await getUserMfaList(token)

  ctx.status = result.success ? 200 : result.code || 500
  ctx.body = { result: true}
}

const handleDeleteUserMfa = async ctx => {
  const token = ctx.cookies.get('token')
  const { userid } = ctx.params
  const result = await deleteUserMfa(userid, token)

  ctx.status = result.success ? 200 : result.code || 500
  ctx.body = result
}

module.exports = {
  handleLogin,
  handleThirdLogin,
  handleLogout,
  handleOAuthLogin,
  handleLoginConfirm,
  handleCreateUserMfa,
}
