import { defineConfig, transformWithEsbuild } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import path from 'path'
import crypto from 'crypto'

const serveUrlMap = {
  mock: 'http://localhost:3000',
  dev: 'http://backend:3030',
  // test: 'https://dev.cloud.tapdata.net/',
  test: 'https://test3.cloud.tapdata.net/'
}

// const userId = '60b60af1147bce7705727188' // zed?
// const userId = '60b064e9a65d8e852c8523bc' // lemon
// const userId = '610a3d43d7f65cfcd80837b5' // auto
// const userId = '60cc0c304e190a579cbe306c' // jason
// const userId = '64ba40c389c61b08683c71b0' // xf
const userId = '64be2c812c268c9dd5afaf25' // devin
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
  changeOrigin: true,
  secure: false
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
  process.env.VITE_ACCESS_TOKEN = getToken(_userId)

  console.log('本地用户调试ID: ' + _userId)
  console.log('本地用户调试Token: ' + process.env.VITE_ACCESS_TOKEN)
  console.log('Proxy server: ' + proxy.target)
}

export default defineConfig({
  define: {
    'process.env': process.env
  },

  plugins: [vue(), vueJsx(), viteCommonjs()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },

    // TODO 建议显式指定扩展名，vite 默认就不支持忽略.vue
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  server: {
    proxy: {
      '/config/': proxy,
      '/private_ask/': proxy,
      '/api/tcm/': proxy,
      '/api/gw/': proxy,
      '/tm/': Object.assign(
        {
          ws: true,
          secure: false
        },
        proxy
      )
    }
  },

  // 全局注入var.scss
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@tap/assets/styles/var.scss" as *;`
      }
    }
  }
})
