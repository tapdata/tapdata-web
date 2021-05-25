const URL = {
  uat: 'http://192.168.1.181:30300',
  dev: 'http://localhost:3030'
}
let baseUrl
const argv = process.argv
let hostArgIndex = argv.indexOf('--origin')
if (hostArgIndex >= 0) {
  baseUrl = argv[hostArgIndex + 1] || 'http://backend:3030'
}
const proxy = {
  target: baseUrl || URL['dev'],
  changeOrigin: false
}
const { resolve } = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const config = {
  assetsDir: 'static',
  lintOnSave: true,
  productionSourceMap: false,
  publicPath: './',
  devServer: {
    proxy: {
      '/api/': proxy,
      '/oauth/': proxy,
      '/old/': { target: 'http://localhost:8081' },
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
    config.module
      .rule('svg')
      .exclude.add(resolve(iconDir))
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .end()

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
              attrs: ['class', 'p-id', 'fill']
            }
          }
        ]
      })
      .end()
  },
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['javascript', 'json'],
        features: ['coreCommands', 'find']
      })
    ]
  }
}

module.exports = config
