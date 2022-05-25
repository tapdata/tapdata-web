const { resolve } = require('path')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

const serveUrlMap = {
  mock: 'http://localhost:30300',
  dev: 'http://localhost:3000', // TM端本地默认地址
  jet: 'http://jet.devops.tapdata.net:31613',
  // test: 'http://192.168.1.181:31438/' // 自定义节点
  test: 'http://192.168.1.132:31787' // v2.0
  // test: 'http://192.168.1.181:30726' // v2-dev
  // test: 'http://192.168.1.126:3003/' // tm 重构
  // test: 'http://192.168.1.181:30474/' // v1-30
  // test: 'http://192.168.1.132:32535/' // v1-29
  // test: 'http://192.168.1.181:32220/' // v1-28
  // test: 'http://192.168.1.181:31119/' // v1-27
  // test: 'http://192.168.1.193:31704' // table-many
  // test: 'http://192.168.1.181:30390' // v1-25
  // test: 'http://192.168.1.181:30649'  // v1-24
  // test: 'http://192.168.1.181:31703'  // v1-23
  // test: 'http://192.168.1.181:30891'  // v1-22
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
  changeOrigin: false
}

module.exports = {
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
        ws: true,
        secure: false,
        logLevel: 'debug',
        target: proxy.target.replace(/^https?/, 'ws')
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
              attrs: ['class', 'p-id' /*, 'fill'*/]
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

      /*config.plugins.push(
        new HardSourceWebpackPlugin(),
        new HardSourceWebpackPlugin.ExcludeModulePlugin([
          {
            test: /.*\.DS_Store/
          }
        ])
      )*/
    }
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@use "~@/styles/var.scss" as *;`
      }
    }
  }
}
