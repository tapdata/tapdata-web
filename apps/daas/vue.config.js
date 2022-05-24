const { resolve } = require('path')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const serveUrlMap = {
  mock: 'http://localhost:30300',
  dev: 'http://localhost:3000', // TM端本地默认地址
  jet: 'http://jet.devops.tapdata.net:31613',
  // test: 'http://192.168.1.181:31438/' // 自定义节点
  test: 'http://192.168.1.181:31025' // v2.0
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
    //  ============ 配置别名 ============
    config.resolve.alias.set('@', resolve('src')).set('web-core', resolve('../../packages/web-core'))

    config.module.noParse(
      /^(vue|vue-router|vuex|vuex-router-sync|axios|vue-virtual-scroller|vue-i18n|vue-echarts|echarts|vue-clipboard2|qs|mousetrap|moment|lodash|jsplumb|highlight.js|graphlib|github-markdown-css|element-ui|dagre|crypto|crypto-js)$/
    )

    config.externals({
      vue: 'Vue',
      axios: 'axios',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
      'vue-virtual-scroller': 'VueVirtualScroller',
      'vue-i18n': 'VueI18n',
      'vue-echarts': 'VueECharts',
      'vue-clipboard2': 'VueClipboard',
      lodash: '_'
    })
    const baseUrl = './public/lib/'
    const cdn = {
      css: [
        // vue-virtual-scroller
        baseUrl + 'vue-virtual-scroller/vue-virtual-scroller.css'
      ],
      js: [
        baseUrl + 'vue.min.js',
        baseUrl + 'vue-router.min.js',
        baseUrl + 'vuex.min.js',
        baseUrl + 'axios.min.js',
        baseUrl + 'vue-virtual-scroller/vue-virtual-scroller.min.js',
        baseUrl + 'vue-i18n.min.js',
        baseUrl + 'vue-clipboard.min.js',
        baseUrl + 'lodash.min.js'
      ]
    }
    // 通过 html-webpack-plugin 将 cdn 注入到 index.html 之中
    config.plugin('html').tap(args => {
      args[0].cdn = cdn
      return args
    })

    // ============ svg处理 ============
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
  },
  configureWebpack: config => {
    // 尽量保证项目中文件后缀的精确
    config.resolve.extensions = ['.js', 'jsx', '.vue', '.json']

    if (process.env.NODE_ENV !== 'production') {
      config.plugins.push(
        // 为模块提供中间缓存，缓存路径是：node_modules/.cache/hard-source
        // 解决未检测到的配置更改
        new HardSourceWebpackPlugin({
          root: process.cwd(),
          directories: [],
          environmentHash: {
            root: process.cwd(),
            directories: [],
            // 配置了files 的主要原因是解决配置更新，cache 不生效了的问题
            // 配置后有包的变化，plugin 会重新构建一部分 cache
            files: ['package.json']
          }
        })
      )
    }
    if (process.env.NODE_ENV === 'production') {
      // gzip
      config.plugins.push(
        new CompressionWebpackPlugin({
          test: /\.(js|css|svg|woff|ttf|json|html|otf)$/, // 正在匹配需要压缩的文件后缀
          threshold: 10240 // 大于10kb的会压缩
          // 其余配置查看compression-webpack-plugin
        }),

        // 分析工具
        new SpeedMeasurePlugin()
      )

      config['performance'] = {
        //打包文件大小配置
        maxEntrypointSize: 10000000,
        maxAssetSize: 30000000
      }
    }
  },
  css: {
    extract: {
      // 一个官方维护人员的回复如下，简单的说，就是在js里css的引入顺序导致的问题，多个css的在js里的引入顺序不同，就会提示这个警告。例如，在1.js 里，引入的顺序是a.css, b.css; 在2.js里，引入顺序是b.css,a.css, 出现了这种引入顺序不同，就导致了警告。在两个js里把引入顺序调成一致，就没问题了。在1.js和2.js里的引入顺序都调整成a.css, b.css 就没有那个警告了。
      ignoreOrder: true // 对于通过使用 scoping 或命名约定来解决 css order 的项目，可以通过将插件的 ignoreOrder 选项设置为 true 来禁用 css order 警告。
    },
    loaderOptions: {
      scss: {
        additionalData: `@use "~@/styles/var.scss" as *;`
      }
    }
  }
}
