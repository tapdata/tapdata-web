const { resolve } = require('path')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const serveUrlMap = {
  mock: 'http://localhost:30300',
  dev: 'http://backend:3030',
  // test: 'http://192.168.1.181:31703'
  test: 'http://192.168.1.181:30300'
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
        }),
        new MonacoWebpackPlugin({
          languages: ['javascript', 'json'],
          features: ['coreCommands', 'find']
        })
      )

      config['performance'] = {
        //打包文件大小配置
        maxEntrypointSize: 10000000,
        maxAssetSize: 30000000
      }
    }
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "~@/styles/var.scss";`
      }
    }
  }
}
