import path from 'node:path'
import process from 'node:process'
import { createSvgIconsPlugin } from '@cn-xufei/vite-plugin-svg-icons'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

const serveUrlMap = {
  mock: 'http://localhost:30300',
  dev: 'http://localhost:3000', // TM端本地默认地址
  test: 'http://58.251.34.123:3030', // v3.1
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
  changeOrigin: false,
}

export default defineConfig({
  define: {
    // 'process.env': process.env,
    TAP_ACCESS_TOKEN: "''",
  },

  envPrefix: ['VUE_APP_', 'VITE_', 'TAP_'],

  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      dts: 'src/auto-imports.d.ts',
    }),

    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      // directoryAsNamespace: true,
      dts: 'src/components.d.ts',
      include: [/\.vue$/, /\.vue\?vue/, /\.[tj]sx?$/],
    }),

    createSvgIconsPlugin({
      iconDirs: [
        path.resolve(process.cwd(), 'src/assets/icons/svg'),
        path.resolve(process.cwd(), 'src/assets/icons/colorSvg'),
        path.resolve(process.cwd(), '../../packages/assets/icons/svg'),
        path.resolve(process.cwd(), '../../packages/assets/icons/colorSvg'),
      ],
      symbolId: 'icon-[name]',
      svgoOptions: {
        exclude: [
          path.resolve(process.cwd(), 'src/assets/icons/colorSvg'),
          path.resolve(process.cwd(), '../../packages/assets/icons/colorSvg'),
        ],
        plugins: [
          { name: 'removeTitle' },
          { name: 'removeStyleElement' },
          {
            name: 'removeAttributesBySelector',
            params: {
              selector: ":not(path[fill='none'])",
              attributes: ['fill'],
            },
          },
          {
            name: 'removeAttributesBySelector',
            params: {
              selector: "[stroke='none']",
              attributes: ['stroke'],
            },
          },
          {
            name: 'removeAttrs',
            params: {
              attrs: ['class', 'p-id'],
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },

    // TODO 建议显式指定扩展名，vite 默认就不支持忽略.vue
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },

  server: {
    host: true,
    proxy: {
      '/api/': proxy,
      '/oauth/': proxy,
      '/docs/': proxy,
      '/old/': { target: 'http://localhost:8081' },
      '/ws/': {
        ws: true,
        secure: false,
        target: proxy.target.replace(/^https?/, 'ws'),
      },
    },
  },

  // 全局注入var.scss
  css: {
    preprocessorOptions: {
      sass: {
        quietDeps: true, // 禁用第三方包的 Sass 过期警告
        silenceDeprecations: ['import', 'global-builtin'],
      },
      scss: {
        // additionalData: '@use "@tap/assets/styles/var.scss" as *;',
        additionalData: (content, filePath) => {
          if (filePath.includes('node_modules')) {
            return `@use "@tap/assets/styles/var.scss" as *;\n${content}`
          }

          return `@use "sass:map";\n@use "@tap/assets/styles/var.scss" as *;\n${
            content
          }`
        },
        // 禁用依赖包中的@import弃用警告
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin'],
      },
    },
  },

  build: {
    outDir: '../../dist',
  },
})
