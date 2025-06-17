import path from 'node:path'
import process from 'node:process'
import { createSvgIconsPlugin } from '@cn-xufei/vite-plugin-svg-icons'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'

const serveUrlMap = {
  mock: 'http://localhost:30300',
  dev: 'http://localhost:3000', // TM端本地默认地址
  test: 'http://58.251.34.123:3030',
  taptest: 'http://localhost:13030', // 自动化测试
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

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const envPrefix = ['VUE_APP_', 'VITE_', 'TAP_']
  const env = loadEnv(mode, process.cwd(), envPrefix)

  return {
    define: {
      // 'process.env': process.env,
      TAP_ACCESS_TOKEN: "''",
    },

    envPrefix,

    optimizeDeps: {
      include: [
        '@tap/api',
        '@tap/shared',
        '@tap/assets',
        'vue',
        'vue-router',
        'element-plus',
        '@vueuse/core',
        'lodash-es',
        '@formily/vue',
        '@formily/core',
        '@formily/reactive',
        '@formily/reactive-vue',
        '@formily/shared',
        '@formily/path',
        '@formily/json-schema',
        '@formily/element-plus',
      ],
      exclude: [
        '@tap/dag',
        '@tap/ldp',
        '@tap/business',
        '@tap/component', // 排除整个组件库，改用按需加载
      ],
      force: false,
      esbuildOptions: {
        target: 'esnext',
        supported: {
          'top-level-await': true,
        },
      },
    },

    plugins: [
      vue(),
      vueJsx(),
      // // 开发环境优化插件
      // process.env.NODE_ENV === 'development' && {
      //   name: 'dev-optimize',
      //   apply: 'serve',
      //   enforce: 'pre',
      //   configResolved(config) {
      //     // 禁用一些开发时不需要的功能
      //     config.optimizeDeps.force = false
      //     config.build.sourcemap = false
      //     config.build.minify = 'esbuild'
      //     config.build.cssCodeSplit = false
      //   },
      //   configureServer(server) {
      //     // 优化开发服务器
      //     server.middlewares.use((req, res, next) => {
      //       // 添加缓存控制头
      //       res.setHeader('Cache-Control', 'no-cache')
      //       next()
      //     })
      //   },
      // },
      AutoImport({
        resolvers: [
          IconsResolver({
            prefix: 'Icon',
            enabledCollections: ['lucide', 'mingcute'],
          }),
          ElementPlusResolver({ importStyle: 'sass' }),
        ],
        dts: 'src/auto-imports.d.ts',
      }),

      Components({
        resolvers: [
          IconsResolver({
            enabledCollections: ['lucide', 'mingcute'],
          }),
          ElementPlusResolver({ importStyle: 'sass' }),
        ],
        dts: 'src/components.d.ts',
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

      // 添加性能优化插件
      // process.env.NODE_ENV === 'development' && {
      //   name: 'optimize-persist',
      //   apply: 'serve',
      //   enforce: 'pre',
      //   configResolved(config) {
      //     // 持久化依赖预构建结果
      //     config.optimizeDeps.force = false
      //   },
      // },

      // Add visualizer plugin conditionally
      process.env.NODE_ENV === 'analyze' &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
          filename: 'dist/stats.html',
        }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@tap/component/src': path.resolve(
          __dirname,
          '../../packages/component/src',
        ),
        '@tap/business/src': path.resolve(
          __dirname,
          '../../packages/business/src',
        ),
        '@tap/i18n/src': path.resolve(__dirname, '../../packages/i18n/src'),
        '@tap/shared/src': path.resolve(__dirname, '../../packages/shared/src'),
        '@tap/dag/src': path.resolve(__dirname, '../../packages/dag/src'),
        '@tap/ldp/src': path.resolve(__dirname, '../../packages/ldp/src'),
        // '@tap/assets/src': path.resolve(__dirname, '../../packages/assets/src'),
        '@tap/assets/fonts': path.resolve(
          __dirname,
          '../../packages/assets/fonts',
        ),
        '@tap/assets/styles': path.resolve(
          __dirname,
          '../../packages/assets/styles',
        ),
        '@tap/api': path.resolve(__dirname, '../../packages/api/src'),
        '@tap/component': path.resolve(
          __dirname,
          '../../packages/component/src',
        ),
        '@tap/shared': path.resolve(__dirname, '../../packages/shared/src'),
        '@tap/dag': path.resolve(__dirname, '../../packages/dag/src'),
        '@tap/ldp': path.resolve(__dirname, '../../packages/ldp/src'),
        '@tap/business': path.resolve(__dirname, '../../packages/business/src'),
        '@tap/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
        '@tap/assets': path.resolve(__dirname, '../../packages/assets'),
      },

      // TODO 建议显式指定扩展名，vite 默认就不支持忽略.vue
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

    server: {
      // port: 8080,
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
      // 添加开发服务器优化配置
      hmr: {
        overlay: false, // 禁用错误覆盖层，减少启动时的开销
      },
      watch: {
        usePolling: false, // 禁用轮询，使用系统原生文件监听
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'], // 忽略不需要监听的文件
      },
      fs: {
        strict: false, // 禁用严格模式，提高文件系统性能
        allow: ['..'], // 允许访问上级目录
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
            const themeVar =
              env.VUE_APP_THEME_VAR || '@tap/assets/styles/var.scss'
            if (filePath.includes('node_modules')) {
              return `@use "${themeVar}" as *;\n${content}`
            }

            return `@use "sass:map";\n@use "${themeVar}" as *;\n${content}`
          },
          // 禁用依赖包中的@import弃用警告
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin'],
        },
      },
    },

    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: false,
      sourcemap: false,
      outDir: '../../dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },
  }
})
