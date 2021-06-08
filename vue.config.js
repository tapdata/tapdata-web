const path = require('path')
const resolve = path.resolve

let baseUrl = 'localhost:3000'
if (process.env.npm_config_argv) {
  let args = JSON.parse(process.env.npm_config_argv).original
  let ip = args[2]
  if (ip) {
    baseUrl = ip.replace('--', '') + '/'
  }
}
console.log('代理地址：http://' + baseUrl)
//如果环境变量中主题参数存在，则嵌入主题中相关的标量
let varUrl = '~@/assets/var.scss'
if (process.env.VUE_APP_THEME) {
  varUrl = '~@/assets/theme/' + process.env.VUE_APP_THEME + '/var.scss'
}
let pages = {
  index: {
    entry: 'src/pages/main.js',
    title:
      process.env.VUE_APP_PLATFORM === 'dfs'
        ? 'Tapdata Cloud'
        : '数据库复制 DRS',
    header: process.env.VUE_APP_HEADER
  }
}

module.exports = {
  pages,
  publicPath: '',
  productionSourceMap: false,

  devServer: {
    proxy: {
      // '/api/tcm/user': {
      // 	target: 'http://localhost:3030',
      // 	changeOrigin: true
      // },
      // '/tm/api/tcm': {
      // 	target: 'http://' + baseUrl,
      // 	changeOrigin: true,
      // 	pathRewrite: {
      // 		'^/tm': '/'
      // 	}
      // },
      // '/tm/api': {
      // 	target: 'http://' + baseUrl,
      // 	changeOrigin: true
      // },
      '/api/tcm': {
        target: 'http://' + baseUrl,
        changeOrigin: true
      },
      '/tm': {
        target: 'http://localhost:8081/',
        changeOrigin: true,
        pathRewrite: {
          '^/tm': '/'
        }
      }
    }
  },
  chainWebpack(config) {
    const iconDir = resolve('src/assets/icons/svg')

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
    externals: {
      consoleHeader: 'consoleHeader',
      orderHeader: 'orderHeader'
    }
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "${varUrl}";`
      }
    }
  }
}
