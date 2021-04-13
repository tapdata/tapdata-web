const { npm_config_argv } = process.env
const URL = {
  dev: 'http://192.168.1.181:30300',
  pro: 'http://backend:3030'
}
let ENV
if (npm_config_argv) {
  const argv = JSON.parse(process.env.npm_config_argv).original
  ENV = Object.keys(URL).find((k) => argv.includes('--' + k))
}
const proxy = {
  target: URL[ENV || 'dev'],
  changeOrigin: false
}
const { resolve } = require('path')

module.exports = {
  assetsDir: 'static',
  lintOnSave: true,
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  devServer: {
    proxy: {
      '/api/': proxy,
      '/oauth/': proxy,
      '/old/': proxy,
      '/ws/': {
        ...proxy,
        ws: true,
        secure: false,
        logLevel: 'debug',
        target: proxy.target.replace(/^https?/, 'ws')
      }
    }
  },
  chainWebpack(config) {
    const iconDir = resolve('src/assets/icons/svg')

    // 多页面时会产生多请求预加载，带宽敏感的关闭此配置
    config.plugins.delete('prefetch')

    // markdown loader
    config.module
      .rule('md')
      .test(/\.md$/)
      .use('html')
      .loader('html-loader')
      .end()
      .use('markdown')
      .loader('markdown-loader')
      .end()

    // svg loader排除 icon 目录
    config.module.rule('svg').exclude.add(resolve(iconDir)).end().use('svgo-loader').loader('svgo-loader').end()

    // svg-sprite-loader打包svg
    config.module
      .rule('svg-sprite')
      .test(/\.svg$/)
      .include.add(resolve(iconDir))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .options({
        plugins: [
          { name: 'removeStyleElement', active: true },
          {
            name: 'removeAttrs',
            active: true,
            params: {
              attrs: ['class', 'p-id']
            }
          }
        ]
      })
      .end()
  }
}
