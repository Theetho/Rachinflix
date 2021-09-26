const { override, disableEsLint } = require('customize-cra')

module.exports = {
  webpack: override(
    //
    disableEsLint()
  ),
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      // proxy = [
      //   {
      //     context: '/api',
      //     pathRewrite: { '^/api': '' },
      //     target: 'http://localhost:3000',
      //     changeOrigin: true
      //   }
      // ]
      // return configFunction(proxy, allowedHost)
      return {
        proxy: [
          {
            context: '/api',
            pathRewrite: { '^/api': '' },
            target: 'http://192.168.1.30:3001',
            changeOrigin: true
          }
        ]
      }
    }
  }
}
