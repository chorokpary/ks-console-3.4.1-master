const { sendMm3Request } = require('../libs/request')
const { getServerConfig } = require('../libs/utils')

const { server: serverConfig } = getServerConfig()

module.exports = async (ctx, next) => {
  const mm3Params = {
    username: `${serverConfig.mm3UserInfo.userName}`,
    password: `${serverConfig.mm3UserInfo.passWord}`,
  }

  const mm3Data = await sendMm3Request({
    method: 'POST',
    url: '/edgetron/auth/generate_token',
    params: mm3Params,
  })

  if (mm3Data.access_token) {
    ctx.cookies.set('mm3AccessToken', mm3Data.access_token)
    ctx.cookies.set('mm3RefreshToken', mm3Data.refresh_token)
    ctx.req.mm3RefreshToken = mm3Data.refresh_token
    ctx.req.mm3AccessToken = mm3Data.access_token
  }

  return await next()
}
