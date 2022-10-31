const { resolve } = require('path')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const crypto = require('crypto')

const serveUrlMap = {
  mock: 'http://localhost:3000',
  dev: 'http://backend:3030',
  test: 'https://v3.test.cloud.tapdata.net',
  local: 'https://v3.test.cloud.tapdata.net',
  localTm: 'http://127.0.0.1:3030'
}
const userId = '60b60af1147bce7705727188'
let origin
const { argv } = process
const { SERVE_ENV = 'mock' } = process.env

// 通过origin参数注入服务代理，优先级最高
if (~argv.indexOf('--origin')) {
  origin = argv[argv.indexOf('--origin') + 1]
  origin && (origin = origin.replace(/^(?!http)/, 'http://'))
}
const proxy = {
  target: process.env.SERVER_URI || origin || serveUrlMap[SERVE_ENV],
  changeOrigin: true
}

//sass变量
let varUrl = '~@tap/assets/styles/var.scss'
let pages = {
  index: {
    entry: 'src/pages/main.js',
    title: 'Tapdata Cloud'
  }
}

let prodProxyConfig = {
  '/api/tcm/': Object.assign(
    {
      pathRewrite: {
        '^/': '/console/v3/'
      }
    },
    proxy
  ),
  '/tm/': {
    ws: true,
    target: proxy.target,
    changeOrigin: true,
    pathRewrite: {
      '^/': '/console/v3/'
    }
  }
}
let localTmProxy = {
  target: serveUrlMap.localTm,
  changeOrigin: true,
  ws: true,
  secure: false,
  pathRewrite: {
    '^/tm/': '/'
  },
  onProxyReq: function (proxyReq, req, res, opts) {
    proxyReq.setHeader('user_id', userId)
  },
  onProxyReqWs: function (proxyReq, req, socket, options, head) {
    proxyReq.setHeader('user_id', userId)
    console.log(req.url)
  }
}

module.exports = {
  pages,
  lintOnSave: process.env.NODE_ENV !== 'production', // 打包时关闭lint输出
  publicPath: './',
  productionSourceMap: false,

  devServer: {
    proxy:
      SERVE_ENV === 'PROD'
        ? prodProxyConfig
        : {
            '/api/tcm/': proxy,
            '/tm/':
              SERVE_ENV === 'local'
                ? localTmProxy
                : Object.assign(
                    {
                      ws: true,
                      secure: false
                    },
                    proxy
                  )
          }
  },
  configureWebpack: config => {
    config.resolve.extensions = ['.js', 'jsx', '.vue', '.json', '.ts', '.tsx']

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
    const webCoreIconDir = resolve('../../packages/web-core/assets/icons/svg')

    // svg loader排除 icon 目录
    config.module
      .rule('svg')
      .exclude.add(iconDir)
      .add(colorIconDir)
      .add(webCoreIconDir)
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .end()

    // svg-sprite-loader打包svg
    config.module
      .rule('svg-sprite')
      .test(/\.svg$/)
      .include.add(iconDir)
      .add(webCoreIconDir)
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
          { name: 'removeTitle', active: true },
          { name: 'removeStyleElement', active: true },
          {
            name: 'removeAttributesBySelector',
            params: {
              selector: ":not(path[fill='none'])",
              attributes: ['fill']
            }
          },
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

    config.module
      .rule('color-svg-sprite')
      .test(/\.svg$/)
      .include.add(colorIconDir)
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
          { name: 'removeTitle', active: true },
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

    config.resolve.alias.set('@', resolve('src')).set('web-core', resolve('../../packages/web-core'))
    config.plugins.delete('prefetch-index')

    // ============ ts处理 ============
    config.module
      .rule('compile')
      .test(/\.(jsx|tsx|ts)$/)
      .use('babel')
      .loader('babel-loader')
      .end()
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@use "${varUrl}" as *;`
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
  let _userId = process.env.USER_ID || userId
  process.env.VUE_APP_ACCESS_TOKEN = getToken(_userId)

  console.log('本地用户调试ID: ' + _userId)
  console.log('本地用户调试Token: ' + process.env.VUE_APP_ACCESS_TOKEN)
  console.log('Proxy server: ' + proxy.target)
}
