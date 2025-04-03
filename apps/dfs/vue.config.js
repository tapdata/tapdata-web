const { resolve } = require('path')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const webpack = require('webpack')
const { getUserIdFromEnv, parseCommandLineArgs, getToken } = require('./userIdResolver')
const chalk = require('chalk')
const log = console.log
const serveUrlMap = {
  mock: 'http://localhost:3000',
  dev: 'http://backend:3030',
  test: 'https://dev.cloud.tapdata.net:8443',
  local: 'https://v3.test.cloud.tapdata.net',
  localTm: 'http://127.0.0.1:3030'
}
const { username = 'martin', origin, env: ENV } = parseCommandLineArgs()
const resolvedUserId = getUserIdFromEnv(username)

let userId = '6073aedf6013a66729a09280' // martin's ID

if (resolvedUserId) {
  userId = resolvedUserId
} else {
  log(chalk.bgRed.white(`Couldn't find user ID for ${username}, using default`))
}

const { SERVE_ENV = 'mock' } = process.env
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
  },
  license_code_activation: {
    entry: 'src/pages/licenseCodeActivation.js',
    title: 'Tapdata Cloud'
  },
  requestConnector: {
    entry: 'src/pages/requestConnector.js',
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
  },
  '/api/gw/': Object.assign(
    {
      pathRewrite: {
        '^/': '/console/v3/'
      }
    },
    proxy
  )
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
  }
}

module.exports = {
  pages,
  lintOnSave: SERVE_ENV !== 'dev' && process.env.NODE_ENV !== 'production', // 打包时关闭lint输出
  publicPath:
    process.env.NODE_ENV === 'production'
      ? !ENV || ENV === 'prod'
        ? 'https://static.cloud.tapdata.net/'
        : './' // 替换为你的CDN URL
      : './',
  productionSourceMap: false,

  devServer: {
    proxy:
      SERVE_ENV === 'PROD'
        ? prodProxyConfig
        : {
            '/config/': proxy,
            '/private_ask/': proxy,
            '/api/tcm/': proxy,
            '/api/gw/': proxy,
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
  transpileDependencies: [
    // 按需添加需要babel处理的模块
    /[/\\]node_modules[/\\](.+?)?element-ui(.*)[/\\]packages[/\\]table[/\\]src/,
    /[/\\]node_modules[/\\](.+?)?element-ui(.*)[/\\]packages[/\\]tooltip[/\\]src/,
    /[/\\]node_modules[/\\](.+?)?@figmania[/\\]webcomponent(.*)[/\\]/,
    /[/\\]node_modules[/\\](.+?)?driver\.js(.*)[/\\]/
  ],
  configureWebpack: config => {
    config.resolve.extensions = ['.js', '.jsx', '.vue', '.json', '.ts', '.tsx']

    if (process.env.NODE_ENV === 'production') {
      // gzip
      config.plugins.push(
        new CompressionWebpackPlugin({
          // 正在匹配需要压缩的文件后缀
          test: /\.(js|css|svg|woff|ttf|json|html)$/,
          // 大于10kb的会压缩
          threshold: 10240
          // 其余配置查看compression-webpack-plugin
        }),
        // ace editor js 输出到 js/ace 目录
        new webpack.NormalModuleReplacementPlugin(/^file-loader\?esModule=false!\.\/src-noconflict(.*)/, res => {
          res.request = res.request.replace(
            /^file-loader\?esModule=false!/,
            'file-loader?esModule=false&outputPath=js/ace!'
          )
        })
      )

      config['performance'] = {
        //打包文件大小配置
        maxEntrypointSize: 10000000,
        maxAssetSize: 30000000
      }

      const sassLoader = require.resolve('sass-loader')
      config.module.rules
        .filter(rule => {
          return rule.test.toString().indexOf('scss') !== -1
        })
        .forEach(rule => {
          rule.oneOf.forEach(oneOfRule => {
            const sassLoaderIndex = oneOfRule.use.findIndex(item => item.loader === sassLoader)
            oneOfRule.use.splice(sassLoaderIndex, 0, { loader: require.resolve('css-unicode-loader') })
          })
        })
    }
  },
  chainWebpack(config) {
    config.resolve.alias.set('@', resolve('src'))

    const iconDir = resolve('src/assets/icons/svg')
    const colorIconDir = resolve('src/assets/icons/colorSvg')
    const assetsIconDir = resolve('../../packages/assets/icons/svg')
    const assetsColorIconDir = resolve('../../packages/assets/icons/colorSvg')
    // svg loader排除 icon 目录
    config.module
      .rule('svg')
      .exclude.add(assetsIconDir)
      .add(assetsColorIconDir)
      .add(iconDir)
      .add(colorIconDir)
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .end()

    // svg-sprite-loader打包svg
    config.module
      .rule('svg-sprite')
      .test(/\.svg$/)
      .include.add(assetsIconDir)
      .add(iconDir)
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
      .include.add(assetsColorIconDir)
      .add(colorIconDir)
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

    config.resolve.alias.set('@', resolve('src'))
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
        sassOptions: {
          quietDeps: true
        },
        additionalData: `@use "${varUrl}" as *;`
      }
    }
  }
}

if (process.env.NODE_ENV === 'development') {
  process.env.VUE_APP_ACCESS_TOKEN = getToken(userId)

  const printDivider = (length = 40, char = '─', color = 'gray') => {
    log(chalk[color](char.repeat(length)))
  }

  log(`${chalk.bgBlue.hex('#595959')(` User Name `.padEnd(14))} ${chalk.white.bold(`${username}`)}`)
  printDivider()
  log(`${chalk.bgBlue.hex('#595959')(` User ID `.padEnd(14))} ${chalk.white.bold(`${userId}`)}`)
  printDivider()
  log(
    `${chalk.bgBlue.hex('#595959')(` User Token `.padEnd(14))} ${chalk.white.bold(
      `${process.env.VUE_APP_ACCESS_TOKEN}`
    )}`
  )
  printDivider()
  log(`${chalk.bgBlue.hex('#595959')(` Proxy Server `.padEnd(14))} ${chalk.white.bold(`${proxy.target}`)}`)
  printDivider()
}
