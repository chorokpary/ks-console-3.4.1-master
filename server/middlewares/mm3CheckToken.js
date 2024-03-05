const { getServerConfig } = require('../libs/utils')

const { server: serverConfig } = getServerConfig()

module.exports = async (ctx, next) => {
  const mm3Params = {
    username: `${serverConfig.mm3UserInfo.userName}`,
    password: `${serverConfig.mm3UserInfo.passWord}`,
  }
  
  return await next()
}
