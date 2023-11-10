import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from '@cn-xufei/vite-plugin-svg-icons'
import path from 'path'

const serveUrlMap = {
  mock: 'http://localhost:30300',
  dev: 'http://localhost:3000', // TM端本地默认地址
  jet: 'http://jet.devops.tapdata.net:31613',
  test: 'http://139.198.127.204:30736', // v3.1
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
    'process.env': process.env,
  },

  plugins: [
    vue(),
    vueJsx(),
    viteCommonjs(),
    AutoImport({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      dts: 'src/auto-imports.d.ts',
    }),

    Components({
      resolvers: [ElementPlusResolver()],
      // directoryAsNamespace: true,
      dts: 'src/components.d.ts',
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
    proxy: {
      '/api/': proxy,
      '/oauth/': proxy,
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
      scss: {
        additionalData: `@use "@tap/assets/styles/var.scss" as *;`,
      },
    },
  },
})
