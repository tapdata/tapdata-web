import path from 'node:path'
import process from 'node:process'
import { createSvgIconsPlugin } from '@cn-xufei/vite-plugin-svg-icons'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { NodePackageImporter } from 'sass'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

const serveUrlMap = {
  mock: 'http://localhost:30300',
  dev: 'http://localhost:3000', // TM端本地默认地址
  test: 'http://58.251.34.123:3030',
  taptest: 'http://localhost:13030', // 自动化测试
}
let origin
const { argv } = process
const { SERVE_ENV = 'test' } = process.env

// 通过origin参数注入服务代理，优先级最高
if (~argv.indexOf('--origin')) {
  origin = argv[argv.indexOf('--origin') + 1]
  origin && (origin = origin.replace(/^(?!http)/, 'http://'))
}

const proxy = {
  target: origin || serveUrlMap[SERVE_ENV],
  changeOrigin: false,
}

export default defineConfig(() => {
  return {
    define: {
      TAP_ACCESS_TOKEN: "''",
    },
    envPrefix: ['VUE_APP_', 'VITE_', 'TAP_'],
    plugins: [
      vue(),
      vueJsx(),
      AutoImport({
        resolvers: [
          IconsResolver({
            prefix: 'Icon',
            enabledCollections: ['lucide', 'mingcute', 'fluent'],
          }),
          ElementPlusResolver(/* { importStyle: 'sass' } */),
        ],
        dts: '../../packages/types/src/daas-auto-imports.d.ts',
        include: [/\.vue$/, /\.vue\?vue/, /\.[tj]sx?$/],
      }),
      Components({
        resolvers: [
          IconsResolver({
            enabledCollections: ['lucide', 'mingcute', 'fluent'],
          }),
          ElementPlusResolver(),
        ],
        dts: '../../packages/types/src/daas-components.d.ts',
        include: [/\.vue$/, /\.vue\?vue/, /\.[tj]sx$/],
      }),
      Icons({
        scale: 1,
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
                selector: ":not(path[fill='none'],rect[fill='none'])",
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

      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
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
          // 禁用依赖包中的@import弃用警告
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin'],
          api: 'modern',
          importers: [new NodePackageImporter()],
        },
      },
    },

    build: {
      outDir: '../../dist',
      assetsDir: 'static',
      rollupOptions: {
        output: {
          // 控制 chunk 文件名，避免过长的 hash
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            ui: [
              'element-plus',
              '@element-plus/icons-vue',
              '@formily/core',
              '@formily/reactive',
            ],
            lodash: ['lodash'],
            'tap-api': ['@tap/api'],
            'tap-component': ['@tap/component'],
            'tap-form': ['@tap/form'],
            'tap-ldp': ['@tap/ldp'],
            'tap-node-design': ['@tap/node-design'],
            'tap-request': ['@tap/request'],
            'tap-shared': ['@tap/shared'],
          },
        },
      },
    },
  }
})
