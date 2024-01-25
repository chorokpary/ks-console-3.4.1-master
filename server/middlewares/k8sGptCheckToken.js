const { sendK8sGptRequest } = require('../libs/request')
const { getServerConfig } = require('../libs/utils')

const { server: serverConfig } = getServerConfig()

module.exports = async (ctx, next) => {
    const params = {
        username: `${serverConfig.k8sGptUserInfo.userName}`,
        password: `${serverConfig.k8sGptUserInfo.passWord}`,
        grant_type: 'password',
        client_id: `${serverConfig.apiServer.clientID}`,
        client_secret: `${serverConfig.apiServer.clientSecret}`,
    }

    const data = await sendK8sGptRequest({
        method: 'POST',
        url: '/apis/core.k8sgpt.ai/oauth/token',
        params: params,
    })

    if (data.access_token) {
        ctx.cookies.set('k8sGptAccessToken', data.access_token)
        ctx.cookies.set('k8sGptRefreshToken', data.refresh_token)
        ctx.req.k8sGptRefreshToken = data.refresh_token
        ctx.req.k8sGptAccessToken = data.access_token
    }

    return await next()
}
