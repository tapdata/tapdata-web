const { resolve } = require('path')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const crypto = require('crypto')

const serveUrlMap = {
  mock: 'http://localhost:3000',
  dev: 'http://backend:3030',
  test: 'http://test.cloud.tapdata.net'
}
let origin
const { argv } = process
const { SERVE_ENV = 'mock' } = process.env

// 通过origin参数注入服务代理，优先级最高
if (~argv.indexOf('--origin')) {
  origin = argv[argv.indexOf('--origin') + 1]
  origin && (origin = origin.replace(/^(?!http)/, 'http://'))
}
const proxy = {
  target: origin || serveUrlMap[SERVE_ENV],
  changeOrigin: true
}

//sass变量
let varUrl = '~@/assets/styles/var.scss'
let pages = {
  index: {
    entry: 'src/pages/main.js',
    title: 'Tapdata Cloud'
  }
}
module.exports = {
  pages,
  lintOnSave: true,
  publicPath: '/console',
  productionSourceMap: false,

  devServer: {
    proxy: {
      '/api/tcm/': proxy,
      '/tm/api/': proxy,
      '/tm/ws/': {
        // ...proxy,
        ws: true,
        secure: false,
        target: proxy.target.replace(/^https?/, 'ws')
      },
      '/tm/#/': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        pathRewrite: {
          '^/tm': '/'
        }
      }
    }
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // gzip
      config.plugins.push(
        new CompressionWebpackPlugin({
          // 正在匹配需要压缩的文件后缀
          test: /\.(js|css|svg|woff|ttf|json|html)$/,
          // 大于10kb的会压缩
          threshold: 10240
          // 其余配置查看compression-webpack-plugin
        })
      )

      config['performance'] = {
        //打包文件大小配置
        maxEntrypointSize: 10000000,
        maxAssetSize: 30000000
      }
    }
  },
  chainWebpack(config) {
    const iconDir = resolve('src/assets/icons/svg')
    const colorIconDir = resolve('src/assets/icons/colorSvg')

    // svg loader排除 icon 目录
    config.module
      .rule('svg')
      .exclude.add(resolve(iconDir))
      .add(resolve(colorIconDir))
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

    config.module
      .rule('color-svg-sprite')
      .test(/\.svg$/)
      .include.add(resolve(colorIconDir))
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

    config.resolve.alias.set('@', resolve('src')).set('web-core', resolve('src/_packages/tapdata-web-core'))
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "${varUrl}";`
      }
    }
  }
}
// 设置本地环境的token
const getToken = userId => {
  const secret = 'Q3HraAbDkmKoPzaBEYzPXB1zJXmWlQ169'
  function __encrypt(string) {
    return crypto
      .createHmac('sha256', secret)
      .update(string + secret)
      .digest('hex')
  }
  function encodeBase64(string) {
    if (typeof string !== 'string') return null
    return Buffer.from(string || '').toString('base64')
  }
  function encodeStaticTokenByUserId(userId) {
    let token = __encrypt(userId)
    return encodeBase64(userId) + '.' + encodeBase64(token)
  }
  const token = encodeStaticTokenByUserId(userId)
  return token
}
if (process.env.NODE_ENV === 'development') {
  let userId = '60cc0c304e190a579cbe306c'
  process.env.VUE_APP_ACCESS_TOKEN = getToken(userId)
  console.log('本地用户调试ID: ' + userId)
  console.log('本地用户调试Token: ' + process.env.VUE_APP_ACCESS_TOKEN)
}
