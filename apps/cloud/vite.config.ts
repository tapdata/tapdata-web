import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { createSvgIconsPlugin } from '@cn-xufei/vite-plugin-svg-icons'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { parseArgs, URL_MAP } from './config/env'

const pathSrc = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig(({ mode }) => {
  let TAP_ACCESS_TOKEN = ''
  let TAP_USER_ID = ''
  let proxyTarget: string = URL_MAP.dev

  if (process.env.NODE_ENV === 'development' && mode !== 'op') {
    const config = parseArgs()
    TAP_ACCESS_TOKEN = config.accessToken
    TAP_USER_ID = config.userId
    proxyTarget = config.target
  }

  const proxy = {
    target: proxyTarget,
    changeOrigin: true,
    secure: false,
  }

  return {
    base: './',
    define: {
      // 'process.env': process.env,
      TAP_ACCESS_TOKEN: JSON.stringify(TAP_ACCESS_TOKEN),
      TAP_USER_ID: JSON.stringify(TAP_USER_ID),
    },

    resolve: {
      alias: {
        '@': pathSrc,
      },
      // TODO 建议显式指定扩展名，vite 默认就不支持忽略.vue
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

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
        },
      },
    },
    server: {
      host: true,
      proxy: {
        '/config/': proxy,
        '/private_ask/': proxy,
        '/api/tcm/': proxy,
        '/api/gw/': proxy,
        '/tm/': Object.assign(
          {
            ws: true,
            secure: false,
          },
          proxy,
        ),
      },
    },
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
        dts: '../../packages/types/src/cloud-auto-imports.d.ts',
        // dts: 'src/auto-imports.d.ts',
        include: [/\.vue$/, /\.vue\?vue/, /\.[tj]sx$/],
      }),

      Components({
        resolvers: [
          IconsResolver({
            enabledCollections: ['lucide', 'mingcute', 'fluent'],
          }),
          ElementPlusResolver(/* { importStyle: 'sass' } */),
        ],
        dts: '../../packages/types/src/cloud-components.d.ts',
        // dts: 'src/components.d.ts',
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
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          requestConnector: path.resolve(__dirname, 'requestConnector.html'),
        },
      },
    },
  }
})
